<?php

namespace Pterodactyl\Http\Controllers\Admin\Elysium;

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

    public function __construct(
        AlertsMessageBag $alert
    ) {
        $this->alert = $alert;
    }

    public function index()
    {
        $elysium = DB::table('elysium')->first();

        return view('admin.elysium.color', ['elysium' => $elysium,]);
    }

    public function update(Request $request)
    {
        $existing = DB::table('elysium')->first();
        DB::table('elysium')->where('id', $existing->id)->update([
            'color_console' => $request->color_console,
            'color_editor' => $request->color_editor,
            'color_1' => $request->color_1,
            'color_2' => $request->color_2,
            'color_3' => $request->color_3,
            'color_4' => $request->color_4,
            'color_5' => $request->color_5,
            'color_6' => $request->color_6,
            'color_7' => $request->color_7,
            'color_8' => $request->color_8,
            'updated_at' => \Carbon::now(),
        ]);

        $this->alert->success('Elysium Theme settings have been updated successfully.')->flash();
        return redirect()->back();
    }
}
