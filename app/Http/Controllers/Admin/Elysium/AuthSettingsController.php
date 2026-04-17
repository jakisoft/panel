<?php

namespace Pterodactyl\Http\Controllers\Admin\Elysium;

use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Prologue\Alerts\AlertsMessageBag;
use Pterodactyl\Http\Controllers\Controller;

class AuthSettingsController extends Controller
{
    public function __construct(private AlertsMessageBag $alert)
    {
    }

    public function index()
    {
        $elysium = DB::table('elysium')->first();

        return view('admin.elysium.auth', ['elysium' => $elysium]);
    }

    public function update(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'google_auth_enabled' => ['nullable', 'boolean'],
            'google_client_id' => ['nullable', 'string', 'max:191'],
            'google_client_secret' => ['nullable', 'string', 'max:191'],
            'google_callback_url' => ['nullable', 'url', 'max:500'],
            'github_auth_enabled' => ['nullable', 'boolean'],
            'github_client_id' => ['nullable', 'string', 'max:191'],
            'github_client_secret' => ['nullable', 'string', 'max:191'],
            'github_callback_url' => ['nullable', 'url', 'max:500'],
        ]);

        $existing = DB::table('elysium')->first();

        DB::table('elysium')->where('id', $existing->id)->update([
            'google_auth_enabled' => (bool) ($data['google_auth_enabled'] ?? false),
            'google_client_id' => $data['google_client_id'] ?? null,
            'google_client_secret' => $data['google_client_secret'] ?? null,
            'google_callback_url' => $data['google_callback_url'] ?? null,
            'github_auth_enabled' => (bool) ($data['github_auth_enabled'] ?? false),
            'github_client_id' => $data['github_client_id'] ?? null,
            'github_client_secret' => $data['github_client_secret'] ?? null,
            'github_callback_url' => $data['github_callback_url'] ?? null,
            'updated_at' => Carbon::now(),
        ]);

        $this->alert->success('Elysium Auth settings updated successfully.')->flash();

        return redirect()->back();
    }
}
