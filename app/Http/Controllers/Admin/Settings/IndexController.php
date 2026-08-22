<?php

namespace Pterodactyl\Http\Controllers\Admin\Settings;

use Illuminate\View\View;
use Illuminate\Http\RedirectResponse;
use Prologue\Alerts\AlertsMessageBag;
use Illuminate\Contracts\Console\Kernel;
use Pterodactyl\Http\Controllers\Controller;
use Pterodactyl\Traits\Helpers\AvailableLanguages;
use Pterodactyl\Services\Helpers\SoftwareVersionService;
use Pterodactyl\Contracts\Repository\SettingsRepositoryInterface;
use Pterodactyl\Http\Requests\Admin\Settings\BaseSettingsFormRequest;

class IndexController extends Controller
{
    use AvailableLanguages;

    /**
     * IndexController constructor.
     */
    public function __construct(
        private AlertsMessageBag $alert,
        private Kernel $kernel,
        private SettingsRepositoryInterface $settings,
        private SoftwareVersionService $versionService,
    ) {
    }

    /**
     * Render the UI for basic Panel settings.
     */
    public function index(): View
    {
        return view('admin.settings.index', [
            'version' => $this->versionService,
            'languages' => $this->getAvailableLanguages(true),
        ]);
    }

    /**
     * Handle settings update.
     *
     * @throws \Pterodactyl\Exceptions\Model\DataValidationException
     * @throws \Pterodactyl\Exceptions\Repository\RecordNotFoundException
     */
    public function update(BaseSettingsFormRequest $request): RedirectResponse
    {
        $data = $request->normalize();

        // Handle custom logo upload if file provided
        if ($request->hasFile('app:logo_file')) {
            $file = $request->file('app:logo_file');
            $ext = $file->getClientOriginalExtension() ?: 'png';
            $filename = 'custom_logo.' . $ext;
            $file->move(public_path('assets'), $filename);
            $data['app:logo'] = '/assets/' . $filename . '?v=' . time();
        }

        // Handle custom favicon upload if file provided
        if ($request->hasFile('app:favicon_file')) {
            $file = $request->file('app:favicon_file');
            $ext = $file->getClientOriginalExtension() ?: 'ico';
            $filename = 'custom_favicon.' . $ext;
            $file->move(public_path('assets'), $filename);
            $data['app:favicon'] = '/assets/' . $filename . '?v=' . time();
        }

        unset($data['app:logo_file'], $data['app:favicon_file']);

        foreach ($data as $key => $value) {
            $this->settings->set('settings::' . $key, $value);
        }

        $this->kernel->call('queue:restart');
        $this->alert->success('Panel settings have been updated successfully and the queue worker was restarted to apply these changes.')->flash();

        return redirect()->route('admin.settings');
    }
}
