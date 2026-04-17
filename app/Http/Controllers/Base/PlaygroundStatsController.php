<?php

namespace Pterodactyl\Http\Controllers\Base;

use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Pterodactyl\Http\Controllers\Controller;

class PlaygroundStatsController extends Controller
{
    public function __invoke(): JsonResponse
    {
        return response()->json([
            'total_users' => DB::table('users')->count(),
            'total_servers' => DB::table('servers')->count(),
        ]);
    }
}
