<?php

namespace Pterodactyl\Http\Controllers\Admin\Elysium;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Prologue\Alerts\AlertsMessageBag;
use Pterodactyl\Http\Controllers\Controller;

class AnnouncementController extends Controller
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

        return view('admin.elysium.announcement', ['elysium' => $elysium,]);
    }

    public function update(Request $request)
    {
        $existing = DB::table('elysium')->first();
        DB::table('elysium')->where('id', $existing->id)->update([
            'announcement_type' => $request->announcement_type,
            'announcement_closable' => $request->announcement_closable,
            'announcement_message' => $request->announcement_message,
            'color_information' => $request->color_information,
            'color_update' => $request->color_update,
            'color_warning' => $request->color_warning,
            'color_error' => $request->color_error,
            'updated_at' => \Carbon::now(),
        ]);

        $this->alert->success('Elysium Theme settings have been updated successfully.')->flash();
        return redirect()->back();
    }
}
