<?php

namespace Pterodactyl\Http\Controllers\Admin;

use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Prologue\Alerts\AlertsMessageBag;
use Pterodactyl\Http\Controllers\Controller;

class PricingController extends Controller
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

        return view('admin.pricing.index', [
            'elysium' => $elysium,
            'pricingItems' => $this->decodeJson($elysium->playground_pricing_items ?? null, [
                [
                    'name' => 'Starter',
                    'monthly_price' => 15000,
                    'cpu' => '1 vCPU',
                    'memory' => '2 GB',
                    'disk' => '20 GB',
                    'description' => 'Cocok untuk server kecil dan komunitas baru.',
                    'features' => [
                        ['text' => 'Proteksi DDoS dasar', 'type' => 'include'],
                        ['text' => 'Priority support 24/7', 'type' => 'exclude'],
                    ],
                ],
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
            'pricing.*.monthly_price' => ['required_with:pricing', 'integer', 'min:0', 'max:999999999'],
            'pricing.*.cpu' => ['required_with:pricing', 'string', 'max:120'],
            'pricing.*.memory' => ['required_with:pricing', 'string', 'max:120'],
            'pricing.*.disk' => ['required_with:pricing', 'string', 'max:120'],
            'pricing.*.description' => ['nullable', 'string', 'max:1000'],
            'pricing.*.included_features' => ['nullable', 'string', 'max:3000'],
            'pricing.*.excluded_features' => ['nullable', 'string', 'max:3000'],
        ]);

        $pricingItems = collect($data['pricing'] ?? [])->map(function (array $item) {
            $included = collect(preg_split('/\r\n|\r|\n/', (string) ($item['included_features'] ?? '')))
                ->map(fn ($feature) => trim($feature))
                ->filter()
                ->map(fn ($feature) => ['text' => $feature, 'type' => 'include']);

            $excluded = collect(preg_split('/\r\n|\r|\n/', (string) ($item['excluded_features'] ?? '')))
                ->map(fn ($feature) => trim($feature))
                ->filter()
                ->map(fn ($feature) => ['text' => $feature, 'type' => 'exclude']);

            return [
                'name' => trim($item['name']),
                'monthly_price' => (int) $item['monthly_price'],
                'cpu' => trim($item['cpu']),
                'memory' => trim($item['memory']),
                'disk' => trim($item['disk']),
                'description' => trim((string) ($item['description'] ?? '')),
                'features' => $included->concat($excluded)->values()->all(),
            ];
        })->filter(fn (array $item) => $item['name'] !== '')->values()->all();

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
