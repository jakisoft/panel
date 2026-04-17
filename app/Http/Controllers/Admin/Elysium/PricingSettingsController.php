<?php

namespace Pterodactyl\Http\Controllers\Admin\Elysium;

use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Prologue\Alerts\AlertsMessageBag;
use Pterodactyl\Http\Controllers\Controller;

class PricingSettingsController extends Controller
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

        return view('admin.elysium.pricing', [
            'elysium' => $elysium,
            'pricingItems' => $this->decodeJson($elysium->playground_pricing_items ?? null, [
                ['name' => 'Starter', 'price' => 'Rp 15.000/bulan', 'description' => 'Cocok untuk server kecil, performa stabil, support cepat.', 'features' => ['1 vCPU', '2 GB RAM', 'Proteksi DDoS dasar']],
            ]),
        ]);
    }

    public function update(Request $request)
    {
        $data = $request->validate([
            'playground_pricing_title' => ['required', 'string', 'max:191'],
            'playground_pricing_subtitle' => ['nullable', 'string', 'max:500'],
            'pricing' => ['nullable', 'array'],
            'pricing.*.name' => ['required_with:pricing', 'string', 'max:120'],
            'pricing.*.price' => ['required_with:pricing', 'string', 'max:120'],
            'pricing.*.description' => ['nullable', 'string', 'max:1000'],
            'pricing.*.features' => ['nullable', 'string', 'max:2000'],
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

        $existing = DB::table('elysium')->first();

        DB::table('elysium')->where('id', $existing->id)->update([
            'playground_pricing_title' => $data['playground_pricing_title'],
            'playground_pricing_subtitle' => $data['playground_pricing_subtitle'] ?? null,
            'playground_pricing_items' => json_encode($pricingItems),
            'updated_at' => Carbon::now(),
        ]);

        $this->alert->success('Pricing settings updated successfully.')->flash();

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
