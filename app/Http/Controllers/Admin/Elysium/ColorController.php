<?php

namespace Pterodactyl\Http\Controllers\Admin\Elysium;

use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Prologue\Alerts\AlertsMessageBag;
use Pterodactyl\Http\Controllers\Controller;

class ColorController extends Controller
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

        return view('admin.elysium.color', ['elysium' => $elysium]);
    }

    public function update(Request $request)
    {
        $data = $request->validate([
            'color_console' => ['required', 'regex:/^#[0-9A-Fa-f]{6}$/'],
            'color_editor' => ['required', 'regex:/^#[0-9A-Fa-f]{6}$/'],
            'color_1' => ['required', 'regex:/^#[0-9A-Fa-f]{6}$/'],
            'color_2' => ['required', 'regex:/^#[0-9A-Fa-f]{6}$/'],
            'color_3' => ['required', 'regex:/^#[0-9A-Fa-f]{6}$/'],
            'color_4' => ['required', 'regex:/^#[0-9A-Fa-f]{6}$/'],
            'color_5' => ['required', 'regex:/^#[0-9A-Fa-f]{6}$/'],
            'color_6' => ['required', 'regex:/^#[0-9A-Fa-f]{6}$/'],
            'color_7' => ['required', 'regex:/^#[0-9A-Fa-f]{6}$/'],
            'color_8' => ['required', 'regex:/^#[0-9A-Fa-f]{6}$/'],
            'color_auth_label_text' => ['required', 'regex:/^#[0-9A-Fa-f]{6}$/'],
            'color_auth_input_placeholder' => ['required', 'regex:/^#[0-9A-Fa-f]{6}$/'],
            'color_auth_input_text' => ['required', 'regex:/^#[0-9A-Fa-f]{6}$/'],
        ]);

        $existing = DB::table('elysium')->first();
        DB::table('elysium')->where('id', $existing->id)->update([
            'color_console' => $data['color_console'],
            'color_editor' => $data['color_editor'],
            'color_1' => $data['color_1'],
            'color_2' => $data['color_2'],
            'color_3' => $data['color_3'],
            'color_4' => $data['color_4'],
            'color_5' => $data['color_5'],
            'color_6' => $data['color_6'],
            'color_7' => $data['color_7'],
            'color_8' => $data['color_8'],
            'color_auth_label_text' => $data['color_auth_label_text'],
            'color_auth_input_placeholder' => $data['color_auth_input_placeholder'],
            'color_auth_input_text' => $data['color_auth_input_text'],
            'updated_at' => Carbon::now(),
        ]);

        $this->alert->success('Elysium Theme settings have been updated successfully.')->flash();

        return redirect()->back();
    }
}
