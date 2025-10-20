<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class ParticipationController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        $participations = $user->participations()
            ->whereNotNull('status')
            ->with('offer')
            ->orderBy('date', 'desc')
            ->paginate(5);



        return response()->json($participations);
    }

    public function stats(Request $request)
    {
        $user = $request->user();

        $sold = $user->participations()
            ->where('status', 'approved')
            ->count();
        $opened = $user->participations()
            ->where('status', 'open')
            ->count();
        $disapproved = $user->participations()
            ->where('status', 'disapproved')
            ->count();

        return response()->json([
            "sold" => $sold,
            "total" => $sold + $opened + $disapproved,
            "approved" => $sold,
            "open" => $opened,
            "disapproved" => $disapproved
        ]);
    }
}
