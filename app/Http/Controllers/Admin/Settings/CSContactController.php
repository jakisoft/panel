<?php

namespace Pterodactyl\Http\Controllers\Admin\Settings;

use Illuminate\Http\Request;
use Illuminate\View\View;
use Illuminate\Http\RedirectResponse;
use Prologue\Alerts\AlertsMessageBag;
use Illuminate\Contracts\Console\Kernel;
use Pterodactyl\Http\Controllers\Controller;
use Pterodactyl\Contracts\Repository\SettingsRepositoryInterface;

class CSContactController extends Controller
{
    public function __construct(
        private AlertsMessageBag $alert,
        private Kernel $kernel,
        private SettingsRepositoryInterface $settings,
    ) {
    }

    private function getSetting(string $key, mixed $default = null): mixed
    {
        return $this->settings->get('settings::' . $key, config('app.' . str_replace(':', '_', $key), $default));
    }

    /**
     * Render the UI for CS Contact and Social Links settings.
     */
    public function index(): View
    {
        return view('admin.settings.cs', [
            'cs' => [
                'enabled' => filter_var($this->getSetting('cs:enabled', true), FILTER_VALIDATE_BOOLEAN),
                'title' => (string) $this->getSetting('cs:title', 'Customer Support'),
                'subtitle' => (string) $this->getSetting('cs:subtitle', 'Butuh bantuan? Hubungi tim support kami'),
                'whatsapp' => (string) $this->getSetting('cs:whatsapp', ''),
                'telegram' => (string) $this->getSetting('cs:telegram', ''),
                'discord' => (string) $this->getSetting('cs:discord', ''),
                'email' => (string) $this->getSetting('cs:email', ''),
            ],
            'footer' => [
                'social_enabled' => filter_var($this->getSetting('footer:social_enabled', true), FILTER_VALIDATE_BOOLEAN),
                'github' => (string) $this->getSetting('footer:github', 'https://github.com/jakisoft/panel'),
                'tiktok' => (string) $this->getSetting('footer:tiktok', ''),
                'instagram' => (string) $this->getSetting('footer:instagram', ''),
            ],
        ]);
    }

    /**
     * Handle updating CS Contact & Social Links settings.
     */
    public function update(Request $request): RedirectResponse
    {
        $keys = [
            'cs:enabled' => $request->boolean('cs_enabled') ? 'true' : 'false',
            'cs:title' => $request->input('cs_title', 'Customer Support'),
            'cs:subtitle' => $request->input('cs_subtitle', ''),
            'cs:whatsapp' => $request->input('cs_whatsapp', ''),
            'cs:telegram' => $request->input('cs_telegram', ''),
            'cs:discord' => $request->input('cs_discord', ''),
            'cs:email' => $request->input('cs_email', ''),
            'footer:social_enabled' => $request->boolean('footer_social_enabled') ? 'true' : 'false',
            'footer:github' => $request->input('footer_github', ''),
            'footer:tiktok' => $request->input('footer_tiktok', ''),
            'footer:instagram' => $request->input('footer_instagram', ''),
        ];

        foreach ($keys as $key => $value) {
            $this->settings->set('settings::' . $key, $value);
        }

        $this->kernel->call('queue:restart');
        $this->alert->success('Pengaturan CS Contact & Social Links berhasil disimpan.')->flash();

        return redirect()->route('admin.settings.cs');
    }
}
