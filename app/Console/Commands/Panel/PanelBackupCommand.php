<?php

namespace Pterodactyl\Console\Commands\Panel;

use Illuminate\Console\Command;
use Pterodactyl\Services\Panel\PanelBackupService;

class PanelBackupCommand extends Command
{
    protected $signature = 'p:panel:backup {--description= : Deskripsi untuk backup ini}';

    protected $description = 'Membuat backup lengkap seluruh data panel (Database SQL + Pengaturan .env).';

    public function handle(PanelBackupService $backupService): int
    {
        $this->info('Memulai pembuatan backup data panel...');

        try {
            $result = $backupService->createBackup($this->option('description'));
            $this->info("Backup panel berhasil dibuat: {$result['filename']} ({$result['size_human']})");
            return 0;
        } catch (\Exception $e) {
            $this->error("Gagal membuat backup panel: {$e->getMessage()}");
            return 1;
        }
    }
}
