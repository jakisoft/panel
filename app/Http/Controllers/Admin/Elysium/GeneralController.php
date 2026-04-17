<?php

namespace Pterodactyl\Http\Controllers\Admin\Elysium;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Prologue\Alerts\AlertsMessageBag;
use Pterodactyl\Http\Controllers\Controller;

class GeneralController extends Controller
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

        return view('admin.elysium.index', ['elysium' => $elysium,]);
    }

    public function update(Request $request)
    {
        $existing = DB::table('elysium')->first();
        DB::table('elysium')->where('id', $existing->id)->update([
            'logo' => $request->logo,
            'server_background' => $request->server_background,
            'copyright_by' => $request->copyright_by,
            'copyright_link' => $request->copyright_link,
            'copyright_start_year' => $request->copyright_start_year,
            'updated_at' => \Carbon::now(),
        ]);

        $this->alert->success('Elysium Theme settings have been updated successfully.')->flash();
        return redirect()->back();
    }
}
