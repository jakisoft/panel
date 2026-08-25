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
        return $this->settings->get('settings::' . $key, config('cs.' . str_replace('cs:', '', $key), $default));
    }

    /**
     * Render the UI for Dynamic CS Contact settings.
     */
    public function index(): View
    {
        $rawItems = $this->getSetting('cs:items', '[]');
        $items = is_string($rawItems) ? json_decode($rawItems, true) : (is_array($rawItems) ? $rawItems : []);

        if (empty($items)) {
            $items = [
                [
                    'id' => 'item_1',
                    'name' => 'WhatsApp CS Support',
                    'url' => 'https://wa.me/6281234567890',
                    'icon' => 'whatsapp',
                ],
                [
                    'id' => 'item_2',
                    'name' => 'Telegram Official CS',
                    'url' => 'https://t.me/CS_Helpdesk',
                    'icon' => 'telegram',
                ],
                [
                    'id' => 'item_3',
                    'name' => 'Discord Community & Ticket',
                    'url' => 'https://discord.gg/invite',
                    'icon' => 'discord',
                ],
            ];
        }

        return view('admin.settings.cs', [
            'cs' => [
                'enabled' => filter_var($this->getSetting('cs:enabled', true), FILTER_VALIDATE_BOOLEAN),
                'title' => (string) $this->getSetting('cs:title', 'Customer Support'),
                'subtitle' => (string) $this->getSetting('cs:subtitle', 'Butuh bantuan? Hubungi tim support kami 24/7'),
                'items' => $items,
            ],
        ]);
    }

    /**
     * Handle updating Dynamic CS Contact settings.
     */
    public function update(Request $request): RedirectResponse
    {
        $enabled = $request->boolean('cs_enabled') ? 'true' : 'false';
        $title = $request->input('cs_title', 'Customer Support');
        $subtitle = $request->input('cs_subtitle', '');

        // Process dynamic CS items
        $rawJson = $request->input('cs_items_json', '[]');
        $decoded = json_decode($rawJson, true);

        $cleanItems = [];
        if (is_array($decoded)) {
            foreach ($decoded as $idx => $item) {
                if (is_array($item) && !empty($item['name']) && !empty($item['url'])) {
                    $cleanItems[] = [
                        'id' => $item['id'] ?? ('item_' . ($idx + 1)),
                        'name' => trim(strip_tags((string) $item['name'])),
                        'url' => trim((string) $item['url']),
                        'icon' => trim(strip_tags((string) ($item['icon'] ?? 'headset'))),
                    ];
                }
            }
        }

        $itemsJson = json_encode(array_values($cleanItems));

        $this->settings->set('settings::cs:enabled', $enabled);
        $this->settings->set('settings::cs:title', $title);
        $this->settings->set('settings::cs:subtitle', $subtitle);
        $this->settings->set('settings::cs:items', $itemsJson);

        config()->set('cs.enabled', $enabled === 'true');
        config()->set('cs.title', $title);
        config()->set('cs.subtitle', $subtitle);
        config()->set('cs.items', $itemsJson);

        $this->kernel->call('queue:restart');
        $this->alert->success('Pengaturan CS Contact berhasil disimpan! Saluran kontak telah diperbarui.')->flash();

        return redirect()->route('admin.settings.cs');
    }
}
