<?php

namespace Pterodactyl\Http\Controllers\Admin\Elysium;

use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Prologue\Alerts\AlertsMessageBag;
use Pterodactyl\Http\Controllers\Controller;

class PlaygroundSettingsController extends Controller
{
    /**
     * @var \Prologue\Alerts\AlertsMessageBag
     */
    private $alert;

    public function __construct(AlertsMessageBag $alert)
    {
        $this->alert = $alert;
    }

    public function index()
    {
        $elysium = DB::table('elysium')->first();

        return view('admin.elysium.playground', [
            'elysium' => $elysium,
            'pricingItems' => $this->decodeJson($elysium->playground_pricing_items ?? null, [
                ['name' => 'Starter', 'price' => 'Rp 15.000/bulan', 'description' => 'Cocok untuk server kecil, performa stabil, support cepat.', 'features' => ['1 vCPU', '2 GB RAM', 'Proteksi DDoS dasar']],
            ]),
            'faqItems' => $this->decodeJson($elysium->playground_faq_items ?? null, [
                ['question' => 'Apakah panel ini aman?', 'answer' => 'Ya, panel menggunakan autentikasi berlapis dan monitoring aktivitas untuk keamanan tambahan.'],
            ]),
            'visualCards' => $this->decodeJson($elysium->playground_visual_cards ?? null, [
                ['title' => 'Total Users', 'value' => '1,250+', 'description' => 'Pengguna aktif di panel setiap bulan.'],
                ['title' => 'Total Servers', 'value' => '3,800+', 'description' => 'Server dikelola stabil dengan uptime tinggi.'],
            ]),
        ]);
    }

    public function update(Request $request)
    {
        $data = $request->validate([
            'playground_badge' => ['required', 'string', 'max:191'],
            'playground_hero_title' => ['required', 'string', 'max:255'],
            'playground_hero_description' => ['nullable', 'string', 'max:2000'],
            'playground_pricing_title' => ['required', 'string', 'max:191'],
            'playground_pricing_subtitle' => ['nullable', 'string', 'max:500'],
            'playground_faq_badge' => ['required', 'string', 'max:191'],
            'playground_faq_title' => ['required', 'string', 'max:191'],
            'playground_faq_subtitle' => ['nullable', 'string', 'max:500'],
            'pricing' => ['nullable', 'array'],
            'pricing.*.name' => ['required_with:pricing', 'string', 'max:120'],
            'pricing.*.price' => ['required_with:pricing', 'string', 'max:120'],
            'pricing.*.description' => ['nullable', 'string', 'max:1000'],
            'pricing.*.features' => ['nullable', 'string', 'max:2000'],
            'faq' => ['nullable', 'array'],
            'faq.*.question' => ['required_with:faq', 'string', 'max:300'],
            'faq.*.answer' => ['required_with:faq', 'string', 'max:2000'],
            'visual_cards' => ['nullable', 'array'],
            'visual_cards.*.title' => ['required_with:visual_cards', 'string', 'max:120'],
            'visual_cards.*.value' => ['required_with:visual_cards', 'string', 'max:120'],
            'visual_cards.*.description' => ['nullable', 'string', 'max:600'],
        ]);

        $pricingItems = collect($data['pricing'] ?? [])->map(function (array $item) {
            return [
                'name' => trim($item['name']),
                'price' => trim($item['price']),
                'description' => trim((string) ($item['description'] ?? '')),
                'features' => collect(preg_split('/\r\n|\r|\n/', (string) ($item['features'] ?? '')))
                    ->map(fn ($feature) => trim($feature))
                    ->filter()
                    ->values()
                    ->all(),
            ];
        })->filter(fn (array $item) => $item['name'] !== '' && $item['price'] !== '')->values()->all();

        $faqItems = collect($data['faq'] ?? [])->map(fn (array $item) => [
            'question' => trim($item['question']),
            'answer' => trim($item['answer']),
        ])->filter(fn (array $item) => $item['question'] !== '' && $item['answer'] !== '')->values()->all();

        $visualCards = collect($data['visual_cards'] ?? [])->map(fn (array $item) => [
            'title' => trim($item['title']),
            'value' => trim($item['value']),
            'description' => trim((string) ($item['description'] ?? '')),
        ])->filter(fn (array $item) => $item['title'] !== '' && $item['value'] !== '')->values()->all();

        $existing = DB::table('elysium')->first();

        DB::table('elysium')->where('id', $existing->id)->update([
            'playground_badge' => $data['playground_badge'],
            'playground_hero_title' => $data['playground_hero_title'],
            'playground_hero_description' => $data['playground_hero_description'] ?? null,
            'playground_pricing_title' => $data['playground_pricing_title'],
            'playground_pricing_subtitle' => $data['playground_pricing_subtitle'] ?? null,
            'playground_faq_badge' => $data['playground_faq_badge'],
            'playground_faq_title' => $data['playground_faq_title'],
            'playground_faq_subtitle' => $data['playground_faq_subtitle'] ?? null,
            'playground_pricing_items' => json_encode($pricingItems),
            'playground_faq_items' => json_encode($faqItems),
            'playground_visual_cards' => json_encode($visualCards),
            'updated_at' => Carbon::now(),
        ]);

        $this->alert->success('Playground settings updated successfully.')->flash();

        return redirect()->back();
    }

    private function decodeJson(?string $value, array $fallback): array
    {
        if (!$value) {
            return $fallback;
        }

        $decoded = json_decode($value, true);

        return is_array($decoded) ? $decoded : $fallback;
    }
}
