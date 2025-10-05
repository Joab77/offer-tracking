<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Participation;
use Illuminate\Http\Request;

class ParticipationController extends Controller
{
    public function index(Request $request)
    {
        $query = Participation::with(['user', 'offer']);
         // Exclure les participations sans statut
        $query->whereNotNull('status');

        // Filtrer par statut
        if ($request->has('status')) {
            $query->where('status', $request->get('status'));
        }

        // Filtrer par offre
        if ($request->has('offer_id')) {
            $query->where('offer_id', $request->get('offer_id'));
        }

        // Filtrer par utilisateur
        if ($request->has('user_id')) {
            $query->where('user_id', $request->get('user_id'));
        }

        $participations = $query->latest()->paginate(20);

        return response()->json($participations);
    }
}