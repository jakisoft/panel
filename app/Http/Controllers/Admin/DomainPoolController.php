<?php

namespace Pterodactyl\Http\Controllers\Admin;

use Exception;
use Illuminate\Http\Request;
use Illuminate\View\View;
use Illuminate\Http\RedirectResponse;
use Prologue\Alerts\AlertsMessageBag;
use Pterodactyl\Models\DomainPool;
use Pterodactyl\Http\Controllers\Controller;
use Pterodactyl\Contracts\Repository\SettingsRepositoryInterface;

class DomainPoolController extends Controller
{
    public function __construct(
        private AlertsMessageBag $alert,
        private SettingsRepositoryInterface $settings
    ) {
    }

    /**
     * Display all master domains & global Cloudflare API token.
     */
    public function index(): View
    {
        return view('admin.domains.index', [
            'domains' => DomainPool::withCount('serverDomains')->orderBy('created_at', 'desc')->get(),
            'global_api_token' => $this->settings->get('settings::cloudflare:api_token', ''),
        ]);
    }

    /**
     * Store new master domain.
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'domain' => 'required|string|max:191|unique:domain_pools,domain',
            'zone_id' => 'required|string|max:191',
            'api_token' => 'nullable|string|max:191',
            'record_type' => 'required|string|in:CNAME,A,SRV',
            'protocol' => 'required|string|in:tcp,udp,http',
        ]);

        try {
            DomainPool::create([
                'domain' => strtolower(trim($request->input('domain'))),
                'zone_id' => trim($request->input('zone_id')),
                'api_token' => $request->filled('api_token') ? trim($request->input('api_token')) : null,
                'record_type' => $request->input('record_type', 'CNAME'),
                'protocol' => $request->input('protocol', 'tcp'),
                'is_active' => true,
            ]);

            $this->alert->success("Master Domain {$request->input('domain')} berhasil ditambahkan.")->flash();
        } catch (Exception $e) {
            $this->alert->danger('Gagal menambahkan domain: ' . $e->getMessage())->flash();
        }

        return redirect()->route('admin.domains');
    }

    /**
     * Update global Cloudflare API token.
     */
    public function updateGlobalSettings(Request $request): RedirectResponse
    {
        if ($request->filled('global_api_token')) {
            $this->settings->set('settings::cloudflare:api_token', trim($request->input('global_api_token')));
            $this->alert->success('Global Cloudflare API Token berhasil disimpan.')->flash();
        }

        return redirect()->route('admin.domains');
    }

    /**
     * Delete master domain.
     */
    public function delete(DomainPool $pool): RedirectResponse
    {
        try {
            $domainName = $pool->domain;
            $pool->delete();
            $this->alert->success("Domain {$domainName} berhasil dihapus.")->flash();
        } catch (Exception $e) {
            $this->alert->danger('Gagal menghapus domain: ' . $e->getMessage())->flash();
        }

        return redirect()->route('admin.domains');
    }
}
