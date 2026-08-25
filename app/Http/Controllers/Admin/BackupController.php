<?php

namespace Pterodactyl\Http\Controllers\Admin;

use Exception;
use Illuminate\Http\Request;
use Illuminate\View\View;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Prologue\Alerts\AlertsMessageBag;
use Illuminate\Contracts\Console\Kernel;
use Pterodactyl\Http\Controllers\Controller;
use Pterodactyl\Services\Panel\PanelBackupService;
use Pterodactyl\Contracts\Repository\SettingsRepositoryInterface;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class BackupController extends Controller
{
    public function __construct(
        private AlertsMessageBag $alert,
        private Kernel $kernel,
        private SettingsRepositoryInterface $settings,
        private PanelBackupService $backupService,
    ) {
    }

    private function getSetting(string $key, mixed $default = null): mixed
    {
        $val = config('backups.' . $key);
        if ($val !== null) return $val;
        $val = config('backup.' . $key);
        if ($val !== null) return $val;
        return $this->settings->get('settings::backups:' . $key, $this->settings->get('settings::backup:' . $key, $default));
    }

    /**
     * Render the UI for Cloud Backup and Full Panel Backup Management.
     */
    public function index(): View
    {
        return view('admin.backup.index', [
            'backups' => $this->backupService->listBackups(),
            'auto_backup' => [
                'enabled' => filter_var($this->getSetting('panel_auto_enabled', false), FILTER_VALIDATE_BOOLEAN),
                'frequency' => (string) $this->getSetting('panel_auto_frequency', 'daily'),
            ],
            'r2' => [
                'enabled' => filter_var($this->getSetting('r2.enabled', false), FILTER_VALIDATE_BOOLEAN),
                'account_id' => (string) $this->getSetting('r2.account_id', ''),
                'bucket' => (string) $this->getSetting('r2.bucket', ''),
                'access_key_id' => (string) $this->getSetting('r2.access_key_id', ''),
                'secret_access_key' => (string) $this->getSetting('r2.secret_access_key', ''),
                'endpoint' => (string) $this->getSetting('r2.endpoint', ''),
            ],
            'gdrive' => [
                'enabled' => filter_var($this->getSetting('gdrive.enabled', false), FILTER_VALIDATE_BOOLEAN),
                'client_id' => (string) $this->getSetting('gdrive.client_id', ''),
                'client_secret' => (string) $this->getSetting('gdrive.client_secret', ''),
                'refresh_token' => (string) $this->getSetting('gdrive.refresh_token', ''),
                'folder_id' => (string) $this->getSetting('gdrive.folder_id', ''),
            ],
            'telegram' => [
                'enabled' => filter_var($this->getSetting('telegram.enabled', false), FILTER_VALIDATE_BOOLEAN),
                'bot_token' => (string) $this->getSetting('telegram.bot_token', ''),
                'owner_id' => (string) $this->getSetting('telegram.owner_id', ''),
            ],
            'default_provider' => (string) $this->getSetting('default_provider', 'local'),
        ]);
    }

    /**
     * Handle saving backup configuration.
     */
    public function update(Request $request): RedirectResponse
    {
        $r2Enabled = $request->boolean('r2_enabled');
        $gdriveEnabled = $request->boolean('gdrive_enabled');
        $telegramEnabled = $request->boolean('telegram_enabled');

        // Validation for Cloudflare R2 if enabled
        if ($r2Enabled) {
            $existingSecret = (string) $this->getSetting('r2.secret_access_key', '');
            if (!$request->filled('r2_account_id') && !$request->filled('r2_endpoint')) {
                $this->alert->danger('Cloudflare R2 diaktifkan: Account ID atau Endpoint wajib diisi.')->flash();
                return redirect()->route('admin.backup')->withInput();
            }
            if (!$request->filled('r2_bucket') || !$request->filled('r2_access_key_id')) {
                $this->alert->danger('Cloudflare R2 diaktifkan: Bucket Name dan Access Key ID wajib diisi.')->flash();
                return redirect()->route('admin.backup')->withInput();
            }
            if (!$request->filled('r2_secret_access_key') && empty($existingSecret)) {
                $this->alert->danger('Cloudflare R2 diaktifkan: Secret Access Key wajib diisi saat konfigurasi awal.')->flash();
                return redirect()->route('admin.backup')->withInput();
            }
        }

        // Validation for Google Drive if enabled
        if ($gdriveEnabled) {
            $existingSecret = (string) $this->getSetting('gdrive.client_secret', '');
            if (!$request->filled('gdrive_client_id') || !$request->filled('gdrive_refresh_token')) {
                $this->alert->danger('Google Drive diaktifkan: Client ID dan OAuth Refresh Token wajib diisi.')->flash();
                return redirect()->route('admin.backup')->withInput();
            }
            if (!$request->filled('gdrive_client_secret') && empty($existingSecret)) {
                $this->alert->danger('Google Drive diaktifkan: Client Secret wajib diisi saat konfigurasi awal.')->flash();
                return redirect()->route('admin.backup')->withInput();
            }
        }

        // Validation for Telegram Bot if enabled
        if ($telegramEnabled) {
            $existingToken = (string) $this->getSetting('telegram.bot_token', '');
            if (!$request->filled('telegram_bot_token') && empty($existingToken)) {
                $this->alert->danger('Telegram Bot diaktifkan: Bot Token wajib diisi.')->flash();
                return redirect()->route('admin.backup')->withInput();
            }
            if (!$request->filled('telegram_owner_id') && empty($this->getSetting('telegram.owner_id', ''))) {
                $this->alert->danger('Telegram Bot diaktifkan: Owner ID / Chat ID wajib diisi.')->flash();
                return redirect()->route('admin.backup')->withInput();
            }
        }

        $keys = [
            'default_provider' => $request->input('default_provider', 'local'),
            'panel_auto_enabled' => $request->boolean('panel_auto_enabled') ? 'true' : 'false',
            'panel_auto_frequency' => $request->input('panel_auto_frequency', 'daily'),
            'r2:enabled' => $r2Enabled ? 'true' : 'false',
            'r2:account_id' => $request->input('r2_account_id', ''),
            'r2:bucket' => $request->input('r2_bucket', ''),
            'r2:access_key_id' => $request->input('r2_access_key_id', ''),
            'r2:endpoint' => $request->input('r2_endpoint', ''),
            'gdrive:enabled' => $gdriveEnabled ? 'true' : 'false',
            'gdrive:client_id' => $request->input('gdrive_client_id', ''),
            'gdrive:refresh_token' => $request->input('gdrive_refresh_token', ''),
            'gdrive:folder_id' => $request->input('gdrive_folder_id', ''),
            'telegram:enabled' => $telegramEnabled ? 'true' : 'false',
            'telegram:owner_id' => $request->input('telegram_owner_id', ''),
        ];

        if ($request->filled('r2_secret_access_key')) {
            $keys['r2:secret_access_key'] = $request->input('r2_secret_access_key');
        }

        if ($request->filled('gdrive_client_secret')) {
            $keys['gdrive:client_secret'] = $request->input('gdrive_client_secret');
        }

        if ($request->filled('telegram_bot_token')) {
            $keys['telegram:bot_token'] = $request->input('telegram_bot_token');
        }

        foreach ($keys as $key => $value) {
            $this->settings->set('settings::backups:' . $key, $value);
            $this->settings->set('settings::backup:' . $key, $value);
            config()->set('backups.' . str_replace(':', '.', $key), $value);
            config()->set('backup.' . str_replace(':', '.', $key), $value);
        }

        $this->kernel->call('queue:restart');
        $this->alert->success('Pengaturan Backup Panel & Cloud Storage berhasil disimpan.')->flash();

        return redirect()->route('admin.backup');
    }

    /**
     * Trigger manual full panel backup creation.
     */
    public function create(Request $request): RedirectResponse
    {
        try {
            $desc = $request->input('description', 'Manual Panel Backup');
            $result = $this->backupService->createBackup($desc);
            $this->alert->success("Backup panel berhasil dibuat: {$result['filename']} ({$result['size_human']})")->flash();
        } catch (Exception $e) {
            $this->alert->danger('Gagal membuat backup panel: ' . $e->getMessage())->flash();
        }

        return redirect()->route('admin.backup');
    }

    /**
     * Download backup file.
     */
    public function download(string $filename): BinaryFileResponse
    {
        return $this->backupService->downloadBackup($filename);
    }

    /**
     * Delete backup file.
     */
    public function delete(string $filename): RedirectResponse
    {
        if ($this->backupService->deleteBackup($filename)) {
            $this->alert->success("File backup {$filename} berhasil dihapus.")->flash();
        } else {
            $this->alert->danger("Gagal menghapus file backup {$filename}.")->flash();
        }

        return redirect()->route('admin.backup');
    }

    /**
     * Restore panel from an uploaded file or an existing backup.
     */
    public function restore(Request $request): RedirectResponse
    {
        try {
            if ($request->hasFile('backup_file')) {
                $file = $request->file('backup_file');
                $tempPath = $file->getRealPath();
                $result = $this->backupService->restoreBackup($tempPath);
                $this->alert->success($result['message'] ?? 'Panel berhasil dipulihkan dari file backup yang diunggah! Seluruh user, server, dan pengaturan telah dikembalikan.')->flash();
            } elseif ($request->filled('filename')) {
                $filename = basename($request->input('filename'));
                $path = storage_path('app/panel_backups/' . $filename);
                $result = $this->backupService->restoreBackup($path);
                $this->alert->success($result['message'] ?? "Panel berhasil dipulihkan dari {$filename}!")->flash();
            } else {
                $this->alert->danger('Silakan pilih file backup yang ingin dipulihkan.')->flash();
            }
        } catch (Exception $e) {
            $this->alert->danger('Gagal memulihkan panel: ' . $e->getMessage())->flash();
        }

        return redirect()->route('admin.backup');
    }

    /**
     * Test Cloudflare R2 Connection.
     */
    public function testR2(Request $request): JsonResponse
    {
        $accountId = $request->input('account_id') ?: config('backups.r2.account_id');
        $bucket = $request->input('bucket') ?: config('backups.r2.bucket');
        $accessKeyId = $request->input('access_key_id') ?: config('backups.r2.access_key_id');
        $secretKey = $request->input('secret_access_key') ?: config('backups.r2.secret_access_key');
        $endpoint = $request->input('endpoint') ?: config('backups.r2.endpoint');

        if (!$accountId && !$endpoint) {
            return response()->json([
                'success' => false,
                'message' => 'Account ID atau Endpoint R2 wajib diisi.',
            ], 422);
        }

        if (!$bucket || !$accessKeyId) {
            return response()->json([
                'success' => false,
                'message' => 'Bucket name dan Access Key ID wajib diisi.',
            ], 422);
        }

        try {
            $r2Endpoint = $endpoint ?: "https://{$accountId}.r2.cloudflarestorage.com";
            $ch = curl_init("{$r2Endpoint}/{$bucket}");
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_TIMEOUT, 5);
            curl_setopt($ch, CURLOPT_NOBODY, true);
            curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);
            curl_exec($ch);
            $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            curl_close($ch);

            if ($httpCode > 0) {
                return response()->json([
                    'success' => true,
                    'message' => "Koneksi ke endpoint Cloudflare R2 ($r2Endpoint) berhasil! (Status: HTTP $httpCode)",
                ]);
            }

            return response()->json([
                'success' => false,
                'message' => 'Gagal menghubungi endpoint R2. Pastikan Account ID / Endpoint benar.',
            ], 500);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Test Google Drive Connection.
     */
    public function testGDrive(Request $request): JsonResponse
    {
        $clientId = $request->input('client_id') ?: config('backups.gdrive.client_id');
        $clientSecret = $request->input('client_secret') ?: config('backups.gdrive.client_secret');
        $refreshToken = $request->input('refresh_token') ?: config('backups.gdrive.refresh_token');

        if (!$clientId || !$clientSecret || !$refreshToken) {
            return response()->json([
                'success' => false,
                'message' => 'Client ID, Client Secret, dan Refresh Token wajib diisi.',
            ], 422);
        }

        try {
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
            $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            curl_close($ch);

            $data = json_decode($response, true);
            if ($httpCode === 200 && isset($data['access_token'])) {
                return response()->json([
                    'success' => true,
                    'message' => 'Autentikasi Google Drive OAuth2 berhasil terhubung!',
                ]);
            }

            $errorMsg = $data['error_description'] ?? ($data['error'] ?? 'Autentikasi ditolak oleh Google.');
            return response()->json([
                'success' => false,
                'message' => "Gagal: $errorMsg (HTTP $httpCode)",
            ], 400);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Test Telegram Bot Connection.
     */
    public function testTelegram(Request $request): JsonResponse
    {
        $botToken = $request->input('bot_token') ?: (string) $this->getSetting('telegram.bot_token', '');
        $ownerId = $request->input('owner_id') ?: (string) $this->getSetting('telegram.owner_id', '');

        $result = $this->backupService->testTelegramConnection($botToken, $ownerId);

        return response()->json($result, $result['success'] ? 200 : 400);
    }
}
