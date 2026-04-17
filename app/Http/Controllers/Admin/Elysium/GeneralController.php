<?php

namespace Pterodactyl\Http\Controllers\Admin\Elysium;

use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Str;
use Prologue\Alerts\AlertsMessageBag;
use Pterodactyl\Http\Controllers\Controller;

class GeneralController extends Controller
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

        return view('admin.elysium.index', ['elysium' => $elysium]);
    }

    public function update(Request $request)
    {
        $data = $request->validate([
            'logo' => ['nullable', 'string', 'max:1024'],
            'server_background' => ['nullable', 'string', 'max:1024'],
            'logo_upload' => ['nullable', 'image', 'max:4096'],
            'server_background_upload' => ['nullable', 'image', 'max:5120'],
            'remove_logo' => ['nullable', 'boolean'],
            'remove_server_background' => ['nullable', 'boolean'],
            'copyright_by' => ['required', 'string', 'max:191'],
            'copyright_link' => ['required', 'string', 'max:191'],
            'copyright_start_year' => ['required', 'string', 'max:20'],
        ]);

        $existing = DB::table('elysium')->first();

        $logo = $this->resolveAssetValue(
            current: $existing->logo,
            inputValue: $data['logo'] ?? null,
            uploadedFile: $request->file('logo_upload'),
            shouldRemove: (bool) ($data['remove_logo'] ?? false),
            targetDirectory: 'favicons',
            targetFilename: 'android-chrome-512x512'
        );

        $serverBackground = $this->resolveAssetValue(
            current: $existing->server_background,
            inputValue: $data['server_background'] ?? null,
            uploadedFile: $request->file('server_background_upload'),
            shouldRemove: (bool) ($data['remove_server_background'] ?? false),
            targetDirectory: 'images',
            targetFilename: 'server-background'
        );

        DB::table('elysium')->where('id', $existing->id)->update([
            'logo' => $logo,
            'server_background' => $serverBackground,
            'copyright_by' => $data['copyright_by'],
            'copyright_link' => $data['copyright_link'],
            'copyright_start_year' => $data['copyright_start_year'],
            'updated_at' => Carbon::now(),
        ]);

        $this->alert->success('Elysium Theme settings have been updated successfully.')->flash();

        return redirect()->back();
    }

    private function resolveAssetValue(
        ?string $current,
        ?string $inputValue,
        $uploadedFile,
        bool $shouldRemove,
        string $targetDirectory,
        string $targetFilename
    ): string {
        $value = trim((string) ($inputValue ?? ''));

        if ($uploadedFile) {
            $extension = strtolower($uploadedFile->getClientOriginalExtension() ?: 'png');
            $targetFolder = public_path($targetDirectory);

            if (!File::isDirectory($targetFolder)) {
                File::makeDirectory($targetFolder, 0755, true);
            }

            $filePath = $targetFolder . DIRECTORY_SEPARATOR . $targetFilename . '.' . $extension;
            $uploadedFile->move($targetFolder, $targetFilename . '.' . $extension);

            return '/' . trim(str_replace(public_path(), '', $filePath), DIRECTORY_SEPARATOR);
        }

        if ($shouldRemove) {
            if ($current) {
                $this->deleteLocalAssetIfExists($current);
            }

            return '';
        }

        return $value !== '' ? $value : (string) $current;
    }

    private function deleteLocalAssetIfExists(string $path): void
    {
        if (Str::startsWith($path, ['http://', 'https://', '//'])) {
            return;
        }

        $candidate = public_path(ltrim($path, '/'));
        if (File::exists($candidate) && File::isFile($candidate)) {
            File::delete($candidate);
        }
    }
}
