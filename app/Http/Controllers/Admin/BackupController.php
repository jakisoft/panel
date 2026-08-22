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
use Pterodactyl\Contracts\Repository\SettingsRepositoryInterface;

class BackupController extends Controller
{
    public function __construct(
        private AlertsMessageBag $alert,
        private Kernel $kernel,
        private SettingsRepositoryInterface $settings,
    ) {
    }

    /**
     * Render the UI for Cloud Backup settings (Cloudflare R2 & Google Drive).
     */
    public function index(): View
    {
        return view('admin.backup.index', [
            'r2' => [
                'enabled' => config('backups.r2.enabled', false),
                'account_id' => config('backups.r2.account_id', ''),
                'bucket' => config('backups.r2.bucket', ''),
                'access_key_id' => config('backups.r2.access_key_id', ''),
                'secret_access_key' => config('backups.r2.secret_access_key', ''),
                'endpoint' => config('backups.r2.endpoint', ''),
            ],
            'gdrive' => [
                'enabled' => config('backups.gdrive.enabled', false),
                'client_id' => config('backups.gdrive.client_id', ''),
                'client_secret' => config('backups.gdrive.client_secret', ''),
                'refresh_token' => config('backups.gdrive.refresh_token', ''),
                'folder_id' => config('backups.gdrive.folder_id', ''),
            ],
            'default_provider' => config('backups.default_provider', 'local'),
        ]);
    }

    /**
     * Handle saving backup configuration.
     */
    public function update(Request $request): RedirectResponse
    {
        $keys = [
            'backup:default_provider' => $request->input('default_provider', 'local'),
            'backup:r2:enabled' => $request->boolean('r2_enabled') ? 'true' : 'false',
            'backup:r2:account_id' => $request->input('r2_account_id', ''),
            'backup:r2:bucket' => $request->input('r2_bucket', ''),
            'backup:r2:access_key_id' => $request->input('r2_access_key_id', ''),
            'backup:r2:endpoint' => $request->input('r2_endpoint', ''),
            'backup:gdrive:enabled' => $request->boolean('gdrive_enabled') ? 'true' : 'false',
            'backup:gdrive:client_id' => $request->input('gdrive_client_id', ''),
            'backup:gdrive:refresh_token' => $request->input('gdrive_refresh_token', ''),
            'backup:gdrive:folder_id' => $request->input('gdrive_folder_id', ''),
        ];

        if ($request->filled('r2_secret_access_key')) {
            $keys['backup:r2:secret_access_key'] = $request->input('r2_secret_access_key');
        }

        if ($request->filled('gdrive_client_secret')) {
            $keys['backup:gdrive:client_secret'] = $request->input('gdrive_client_secret');
        }

        foreach ($keys as $key => $value) {
            $this->settings->set('settings::' . $key, $value);
        }

        $this->kernel->call('queue:restart');
        $this->alert->success('Pengaturan Cloud Backup berhasil disimpan dan queue worker telah direstart.')->flash();

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

            // 200, 403, 404 all indicate host is reachable and responds
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
}
