<?php

namespace Pterodactyl\Services\Panel;

use Exception;
use PDO;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
use Illuminate\Contracts\Console\Kernel;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class PanelBackupService
{
    private string $backupDir;

    public function __construct(private Kernel $kernel)
    {
        $this->backupDir = storage_path('app/panel_backups');
        if (!File::exists($this->backupDir)) {
            File::makeDirectory($this->backupDir, 0755, true);
        }
    }

    /**
     * Create a full backup of panel data (Database SQL + .env configuration).
     */
    public function createBackup(?string $description = null): array
    {
        $timestamp = date('Y-m-d_H-i-s');
        $tempDir = storage_path('app/temp_backup_' . $timestamp);
        File::makeDirectory($tempDir, 0755, true);

        try {
            // 1. Dump database to database.sql
            $sqlFile = $tempDir . '/database.sql';
            $this->dumpDatabase($sqlFile);

            // 2. Copy .env file
            $envPath = base_path('.env');
            if (File::exists($envPath)) {
                File::copy($envPath, $tempDir . '/.env');
            }

            // 3. Write metadata
            $metadata = [
                'created_at' => date('c'),
                'app_name' => config('app.name'),
                'app_version' => config('app.version'),
                'description' => $description ?: 'Manual Panel Backup',
                'php_version' => PHP_VERSION,
            ];
            File::put($tempDir . '/metadata.json', json_encode($metadata, JSON_PRETTY_PRINT));

            // 4. Create .tar.gz archive
            $archiveName = 'panel-backup-' . $timestamp . '.tar.gz';
            $archivePath = $this->backupDir . '/' . $archiveName;

            $tarCmd = "tar -czf " . escapeshellarg($archivePath) . " -C " . escapeshellarg($tempDir) . " .";
            exec($tarCmd, $output, $returnCode);

            if ($returnCode !== 0 || !File::exists($archivePath)) {
                // Fallback using ZipArchive if tar failed
                $archiveName = 'panel-backup-' . $timestamp . '.zip';
                $archivePath = $this->backupDir . '/' . $archiveName;
                $this->createZipArchive($tempDir, $archivePath);
            }

            $size = File::size($archivePath);

            // 5. Upload to Cloudflare R2 if enabled
            if (config('backups.r2.enabled')) {
                $this->uploadToR2($archivePath, $archiveName);
            }

            // 6. Upload to Google Drive if enabled
            if (config('backups.gdrive.enabled') || config('backup.gdrive.enabled')) {
                $this->uploadToGDrive($archivePath, $archiveName);
            }

            // 7. Upload to Telegram Bot if enabled
            if (config('backups.telegram.enabled') || config('backup.telegram.enabled')) {
                $this->uploadToTelegram($archivePath, $archiveName);
            }

            return [
                'filename' => $archiveName,
                'path' => $archivePath,
                'size' => $size,
                'size_human' => $this->formatBytes($size),
                'created_at' => date('Y-m-d H:i:s'),
            ];
        } finally {
            File::deleteDirectory($tempDir);
        }
    }

    /**
     * List all panel backups.
     */
    public function listBackups(): array
    {
        if (!File::exists($this->backupDir)) {
            return [];
        }

        $files = File::files($this->backupDir);
        $backups = [];

        foreach ($files as $file) {
            $ext = $file->getExtension();
            if ($ext === 'gz' || $ext === 'zip' || $ext === 'tar') {
                $size = $file->getSize();
                $backups[] = [
                    'filename' => $file->getFilename(),
                    'path' => $file->getRealPath(),
                    'size' => $size,
                    'size_human' => $this->formatBytes($size),
                    'created_at' => date('Y-m-d H:i:s', $file->getMTime()),
                ];
            }
        }

        // Sort descending by modified time
        usort($backups, fn($a, $b) => strcmp($b['created_at'], $a['created_at']));

        return $backups;
    }

    /**
     * Download a panel backup file.
     */
    public function downloadBackup(string $filename): BinaryFileResponse
    {
        $safeName = basename($filename);
        $path = $this->backupDir . '/' . $safeName;

        if (!File::exists($path)) {
            throw new Exception("File backup {$safeName} tidak ditemukan.");
        }

        return response()->download($path, $safeName);
    }

    /**
     * Delete a panel backup file.
     */
    public function deleteBackup(string $filename): bool
    {
        $safeName = basename($filename);
        $path = $this->backupDir . '/' . $safeName;

        if (File::exists($path)) {
            return File::delete($path);
        }

        return false;
    }

    /**
     * Restore panel from an uploaded or existing backup file.
     */
    public function restoreBackup(string $archivePath): array
    {
        if (!File::exists($archivePath)) {
            throw new Exception("File backup tidak ditemukan.");
        }

        // If direct SQL file uploaded
        if (str_ends_with(strtolower($archivePath), '.sql')) {
            $this->importDatabaseSql($archivePath);
            $this->kernel->call('optimize:clear');
            $this->kernel->call('queue:restart');
            return [
                'success' => true,
                'message' => 'Database panel berhasil dipulihkan dari file SQL!',
            ];
        }

        $tempDir = storage_path('app/temp_restore_' . time());
        File::makeDirectory($tempDir, 0755, true);

        try {
            // Extract archive
            $tarCmd = "tar -xzf " . escapeshellarg($archivePath) . " -C " . escapeshellarg($tempDir) . " 2>&1";
            exec($tarCmd, $output, $returnCode);

            if ($returnCode !== 0) {
                // Try unzip
                $zipCmd = "unzip -o " . escapeshellarg($archivePath) . " -d " . escapeshellarg($tempDir) . " 2>&1";
                exec($zipCmd, $output2, $returnCode2);
                if ($returnCode2 !== 0) {
                    throw new Exception("Gagal mengekstrak arsip backup: " . implode(" ", array_merge((array)$output, (array)$output2)));
                }
            }

            // Find database.sql (at root or in any extracted subfolder)
            $sqlFile = $tempDir . '/database.sql';
            if (!File::exists($sqlFile)) {
                $allSql = File::glob($tempDir . '/*.sql');
                if (empty($allSql)) {
                    $allSql = File::allFiles($tempDir);
                    $allSql = array_filter($allSql, fn($f) => str_ends_with($f->getFilename(), '.sql'));
                    $allSql = array_map(fn($f) => $f->getRealPath(), $allSql);
                }
                if (!empty($allSql)) {
                    $sqlFile = reset($allSql);
                }
            }

            if (!File::exists($sqlFile)) {
                throw new Exception("Arsip backup tidak memiliki file database .sql yang valid.");
            }

            // Restore Database
            $this->importDatabaseSql($sqlFile);

            // If backup contains .env, preserve critical db connection but update APP_KEY if needed
            $backupEnv = $tempDir . '/.env';
            if (!File::exists($backupEnv)) {
                $allEnv = File::allFiles($tempDir);
                foreach ($allEnv as $f) {
                    if ($f->getFilename() === '.env') {
                        $backupEnv = $f->getRealPath();
                        break;
                    }
                }
            }

            if (File::exists($backupEnv)) {
                $envContent = File::get($backupEnv);
                if (preg_match('/^APP_KEY=(.+)$/m', $envContent, $matches)) {
                    $appKey = trim($matches[1]);
                    if (!empty($appKey)) {
                        $currentEnv = File::get(base_path('.env'));
                        $currentEnv = preg_replace('/^APP_KEY=.*$/m', 'APP_KEY=' . $appKey, $currentEnv);
                        File::put(base_path('.env'), $currentEnv);
                    }
                }
            }

            // Flush caches
            $this->kernel->call('optimize:clear');
            $this->kernel->call('queue:restart');

            return [
                'success' => true,
                'message' => 'Data panel (Database & Pengaturan) berhasil dipulihkan!',
            ];
        } finally {
            File::deleteDirectory($tempDir);
        }
    }

    /**
     * Dump the database using mysqldump or PDO.
     */
    private function dumpDatabase(string $destinationPath): void
    {
        $dbConfig = config('database.connections.mysql');
        $host = $dbConfig['host'] ?? '127.0.0.1';
        $port = $dbConfig['port'] ?? 3306;
        $dbName = $dbConfig['database'] ?? 'panel';
        $user = $dbConfig['username'] ?? 'root';
        $pass = $dbConfig['password'] ?? '';

        // Try mysqldump with MYSQL_PWD environment variable
        $envPrefix = !empty($pass) ? 'MYSQL_PWD=' . escapeshellarg($pass) . ' ' : '';
        $dumpCmd = sprintf(
            '%smysqldump --default-character-set=utf8mb4 --single-transaction --quick --skip-lock-tables -h %s -P %d -u %s %s > %s 2>&1',
            $envPrefix,
            escapeshellarg($host),
            (int) $port,
            escapeshellarg($user),
            escapeshellarg($dbName),
            escapeshellarg($destinationPath)
        );

        exec($dumpCmd, $output, $returnCode);

        if ($returnCode === 0 && File::exists($destinationPath) && File::size($destinationPath) > 0) {
            return;
        }

        // Fallback: PDO table dumper
        $pdo = DB::connection()->getPdo();
        $tables = $pdo->query('SHOW TABLES')->fetchAll(PDO::FETCH_COLUMN);

        $handle = fopen($destinationPath, 'w');
        fwrite($handle, "SET FOREIGN_KEY_CHECKS=0;\n");
        fwrite($handle, "SET SQL_MODE = \"NO_AUTO_VALUE_ON_ZERO\";\n");
        fwrite($handle, "START TRANSACTION;\n\n");

        foreach ($tables as $table) {
            $createTable = $pdo->query("SHOW CREATE TABLE `{$table}`")->fetch(PDO::FETCH_NUM);
            fwrite($handle, "DROP TABLE IF EXISTS `{$table}`;\n");
            fwrite($handle, $createTable[1] . ";\n\n");

            $rows = $pdo->query("SELECT * FROM `{$table}`")->fetchAll(PDO::FETCH_ASSOC);
            if (!empty($rows)) {
                foreach ($rows as $row) {
                    $keys = array_map(fn($k) => "`$k`", array_keys($row));
                    $values = array_map(function ($val) use ($pdo) {
                        if ($val === null) return 'NULL';
                        return $pdo->quote($val);
                    }, array_values($row));

                    fwrite($handle, "INSERT INTO `{$table}` (" . implode(', ', $keys) . ") VALUES (" . implode(', ', $values) . ");\n");
                }
                fwrite($handle, "\n");
            }
        }

        fwrite($handle, "SET FOREIGN_KEY_CHECKS=1;\n");
        fwrite($handle, "COMMIT;\n");
        fclose($handle);
    }

    /**
     * Import a SQL file into current database.
     */
    private function importDatabaseSql(string $sqlFilePath): void
    {
        $dbConfig = config('database.connections.mysql');
        $host = $dbConfig['host'] ?? '127.0.0.1';
        $port = $dbConfig['port'] ?? 3306;
        $dbName = $dbConfig['database'] ?? 'panel';
        $user = $dbConfig['username'] ?? 'root';
        $pass = $dbConfig['password'] ?? '';

        // Try mysql CLI with MYSQL_PWD
        $envPrefix = !empty($pass) ? 'MYSQL_PWD=' . escapeshellarg($pass) . ' ' : '';
        $mysqlCmd = sprintf(
            '%smysql --default-character-set=utf8mb4 -h %s -P %d -u %s %s < %s 2>&1',
            $envPrefix,
            escapeshellarg($host),
            (int) $port,
            escapeshellarg($user),
            escapeshellarg($dbName),
            escapeshellarg($sqlFilePath)
        );

        exec($mysqlCmd, $output, $returnCode);
        if ($returnCode === 0) {
            return;
        }

        // Fallback: PDO execution
        $pdo = DB::connection()->getPdo();
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        $pdo->exec("SET FOREIGN_KEY_CHECKS=0;");
        $pdo->exec("SET SQL_MODE = 'NO_AUTO_VALUE_ON_ZERO';");
        
        $sqlContent = File::get($sqlFilePath);
        $lines = explode("\n", $sqlContent);
        $query = '';

        foreach ($lines as $line) {
            $trimmed = trim($line);
            if (empty($trimmed) || str_starts_with($trimmed, '--') || str_starts_with($trimmed, '/*') || str_starts_with($trimmed, '#')) {
                continue;
            }

            $query .= $line . "\n";
            if (str_ends_with($trimmed, ';')) {
                try {
                    $pdo->exec($query);
                } catch (\Throwable $e) {
                    // Continue on non-fatal statement warnings
                }
                $query = '';
            }
        }

        if (!empty(trim($query))) {
            try {
                $pdo->exec($query);
            } catch (\Throwable $e) {
            }
        }

        $pdo->exec("SET FOREIGN_KEY_CHECKS=1;");
    }

    private function createZipArchive(string $sourceDir, string $outZipPath): void
    {
        $zip = new \ZipArchive();
        if ($zip->open($outZipPath, \ZipArchive::CREATE | \ZipArchive::OVERWRITE) === true) {
            $files = new \RecursiveIteratorIterator(
                new \RecursiveDirectoryIterator($sourceDir),
                \RecursiveIteratorIterator::LEAVES_ONLY
            );
            foreach ($files as $file) {
                if (!$file->isDir()) {
                    $filePath = $file->getRealPath();
                    $relativePath = substr($filePath, strlen($sourceDir) + 1);
                    $zip->addFile($filePath, $relativePath);
                }
            }
            $zip->close();
        }
    }

    private function uploadToR2(string $filePath, string $filename): void
    {
        try {
            $accountId = config('backups.r2.account_id');
            $bucket = config('backups.r2.bucket');
            $accessKeyId = config('backups.r2.access_key_id');
            $secretKey = config('backups.r2.secret_access_key');
            $endpoint = config('backups.r2.endpoint') ?: "https://{$accountId}.r2.cloudflarestorage.com";

            if ($bucket && $accessKeyId && $secretKey) {
                $targetUrl = "{$endpoint}/{$bucket}/panel_backups/{$filename}";
                $fileData = file_get_contents($filePath);

                $ch = curl_init($targetUrl);
                curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'PUT');
                curl_setopt($ch, CURLOPT_POSTFIELDS, $fileData);
                curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
                curl_setopt($ch, CURLOPT_TIMEOUT, 60);
                curl_setopt($ch, CURLOPT_HTTPHEADER, [
                    'Content-Type: application/gzip',
                ]);
                curl_exec($ch);
                curl_close($ch);
            }
        } catch (Exception $e) {
            // Log cloud upload error without failing local backup
        }
    }

    private function uploadToGDrive(string $filePath, string $filename): void
    {
        try {
            $clientId = config('backups.gdrive.client_id');
            $clientSecret = config('backups.gdrive.client_secret');
            $refreshToken = config('backups.gdrive.refresh_token');

            if ($clientId && $clientSecret && $refreshToken) {
                // Get Access Token
                $ch = curl_init('https://oauth2.googleapis.com/token');
                curl_setopt($ch, CURLOPT_POST, true);
                curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
                curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query([
                    'client_id' => $clientId,
                    'client_secret' => $clientSecret,
                    'refresh_token' => $refreshToken,
                    'grant_type' => 'refresh_token',
                ]));
                $response = curl_exec($ch);
                curl_close($ch);

                $data = json_decode($response, true);
                if (isset($data['access_token'])) {
                    $token = $data['access_token'];
                    $folderId = config('backups.gdrive.folder_id');

                    $metadata = ['name' => $filename];
                    if (!empty($folderId)) {
                        $metadata['parents'] = [$folderId];
                    }

                    $boundary = '-------' . md5(time());
                    $content = "--$boundary\r\n";
                    $content .= "Content-Type: application/json; charset=UTF-8\r\n\r\n";
                    $content .= json_encode($metadata) . "\r\n";
                    $content .= "--$boundary\r\n";
                    $content .= "Content-Type: application/gzip\r\n\r\n";
                    $content .= file_get_contents($filePath) . "\r\n";
                    $content .= "--$boundary--";

                    $uploadCh = curl_init('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart');
                    curl_setopt($uploadCh, CURLOPT_POST, true);
                    curl_setopt($uploadCh, CURLOPT_RETURNTRANSFER, true);
                    curl_setopt($uploadCh, CURLOPT_POSTFIELDS, $content);
                    curl_setopt($uploadCh, CURLOPT_HTTPHEADER, [
                        "Authorization: Bearer $token",
                        "Content-Type: multipart/related; boundary=$boundary",
                    ]);
                    curl_exec($uploadCh);
                    curl_close($uploadCh);
                }
            }
        } catch (Exception $e) {
            // Log cloud upload error without failing local backup
        }
    }

    private function uploadToTelegram(string $filePath, string $filename): void
    {
        try {
            $botToken = config('backups.telegram.bot_token') ?: config('backup.telegram.bot_token');
            $ownerId = config('backups.telegram.owner_id') ?: config('backup.telegram.owner_id');

            if (empty($botToken) || empty($ownerId) || !File::exists($filePath)) {
                return;
            }

            $size = File::size($filePath);
            $sizeHuman = $this->formatBytes($size);
            $appName = config('app.name', 'JKSoft Cloud');
            $date = date('Y-m-d H:i:s T');
            $host = request()->getHost() ?: gethostname();

            $caption = "📦 <b>Panel Backup Created</b>\n\n"
                     . "🏷 <b>Panel:</b> {$appName}\n"
                     . "📁 <b>File:</b> <code>{$filename}</code>\n"
                     . "📊 <b>Size:</b> {$sizeHuman}\n"
                     . "⏰ <b>Time:</b> {$date}\n"
                     . "🌐 <b>Host:</b> <code>{$host}</code>\n\n"
                     . "<i>Arsip backup otomatis panel berhasil diunggah ke Telegram.</i>";

            $url = "https://api.telegram.org/bot{$botToken}/sendDocument";

            $postFields = [
                'chat_id' => $ownerId,
                'caption' => $caption,
                'parse_mode' => 'HTML',
                'document' => new \CURLFile($filePath, 'application/gzip', $filename),
            ];

            $ch = curl_init();
            curl_setopt($ch, CURLOPT_URL, $url);
            curl_setopt($ch, CURLOPT_POST, true);
            curl_setopt($ch, CURLOPT_POSTFIELDS, $postFields);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_TIMEOUT, 120);
            curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);
            $response = curl_exec($ch);
            curl_close($ch);
        } catch (Exception $e) {
            // Log cloud upload error without failing local backup
        }
    }

    /**
     * Test connection to Telegram Bot API with a test message.
     */
    public function testTelegramConnection(?string $botToken = null, ?string $ownerId = null): array
    {
        $botToken = $botToken ?: (config('backups.telegram.bot_token') ?: config('backup.telegram.bot_token'));
        $ownerId = $ownerId ?: (config('backups.telegram.owner_id') ?: config('backup.telegram.owner_id'));

        if (empty($botToken)) {
            return ['success' => false, 'message' => 'Bot Token Telegram wajib diisi.'];
        }

        if (empty($ownerId)) {
            return ['success' => false, 'message' => 'Owner ID / Chat ID Telegram wajib diisi.'];
        }

        try {
            $appName = config('app.name', 'JKSoft Cloud');
            $date = date('Y-m-d H:i:s T');
            $message = "🤖 <b>Telegram Backup Bot Connected!</b>\n\n"
                     . "✅ Bot berhasil terhubung dengan panel <b>{$appName}</b>.\n"
                     . "⏰ Waktu: {$date}\n\n"
                     . "<i>File backup panel otomatis akan dikirimkan ke chat ini saat auto-backup berjalan.</i>";

            $url = "https://api.telegram.org/bot{$botToken}/sendMessage";

            $ch = curl_init();
            curl_setopt($ch, CURLOPT_URL, $url);
            curl_setopt($ch, CURLOPT_POST, true);
            curl_setopt($ch, CURLOPT_POSTFIELDS, [
                'chat_id' => $ownerId,
                'text' => $message,
                'parse_mode' => 'HTML',
            ]);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_TIMEOUT, 15);
            $response = curl_exec($ch);
            $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            curl_close($ch);

            $result = json_decode($response, true);

            if ($httpCode === 200 && ($result['ok'] ?? false)) {
                $botUsername = $result['result']['from']['username'] ?? 'Bot';
                return [
                    'success' => true,
                    'message' => "Koneksi berhasil! Pesan test telah terkirim via @{$botUsername} ke Chat ID: {$ownerId}.",
                ];
            }

            $errorDesc = $result['description'] ?? 'Gagal menghubungi Telegram API (HTTP ' . $httpCode . ')';
            return [
                'success' => false,
                'message' => "Telegram Error: {$errorDesc}",
            ];
        } catch (Exception $e) {
            return [
                'success' => false,
                'message' => 'Gagal menguji Telegram Bot: ' . $e->getMessage(),
            ];
        }
    }

    private function formatBytes(int $bytes): string
    {
        if ($bytes >= 1073741824) {
            return number_format($bytes / 1073741824, 2) . ' GB';
        }
        if ($bytes >= 1048576) {
            return number_format($bytes / 1048576, 2) . ' MB';
        }
        if ($bytes >= 1024) {
            return number_format($bytes / 1024, 2) . ' KB';
        }
        return $bytes . ' B';
    }
}
