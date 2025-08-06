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
            ->with('offer')
            ->latest()
            ->paginate(20);

        return response()->json($participations);
    }
}