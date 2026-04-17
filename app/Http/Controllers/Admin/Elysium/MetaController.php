<?php

namespace Pterodactyl\Http\Controllers\Admin\Elysium;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Prologue\Alerts\AlertsMessageBag;
use Pterodactyl\Http\Controllers\Controller;

class MetaController extends Controller
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

        return view('admin.elysium.meta', ['elysium' => $elysium,]);
    }

    public function update(Request $request)
    {
        $existing = DB::table('elysium')->first();
        DB::table('elysium')->where('id', $existing->id)->update([
            'logo' => $request->logo, 
            'title' => $request->title, 
            'description' => $request->description, 
            'color_meta' => $request->color_meta, 
            'updated_at' => \Carbon::now(),
        ]);

        $this->alert->success('Elysium Theme settings have been updated successfully.')->flash();
        return redirect()->back();
    }
}
