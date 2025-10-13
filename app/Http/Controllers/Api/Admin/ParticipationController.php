<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Participation;
use Illuminate\Http\Request;
use App\Models\Offer;


class ParticipationController extends Controller
{
    public function index(Request $request)
    {
    
        $query = Participation::with(['user', 'offer']);
         // Exclure les participations sans statut
        $query->whereNotNull('status');

        // Filtrer par statut
        //if ($request->has('status')) {
          //  $query->where('status', $request->get('status'));
        //}
        // Filtre par statut
        if ($request->has('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        // Filtrer par offre
       // if ($request->has('offer_id')) {
       //     $query->where('offer_id', $request->get('offer_id'));
       // }
        // Filtre par offre
        if ($request->has('offer_id') && !empty($request->offer_id)) {
            $query->where('offer_id', $request->offer_id);
        }

        // Filtrer par utilisateur
        //if ($request->has('user_id')) {
          //  $query->where('user_id', $request->get('user_id'));
      //  }
        // Filtre par utilisateur (nom ou email)
        if ($request->has('user_search') && !empty($request->user_search)) {
            $searchTerm = $request->user_search;
            $query->whereHas('user', function($q) use ($searchTerm) {
                $q->where('name', 'LIKE', "%{$searchTerm}%")
                  ->orWhere('email', 'LIKE', "%{$searchTerm}%");
            });
        }
        // Filtre par date
        if ($request->has('date_from') && !empty($request->date_from)) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }

        if ($request->has('date_to') && !empty($request->date_to)) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }
        // Filtre par période prédéfinie
        if ($request->has('period') && !empty($request->period)) {
            $query->where('created_at', '>=', $this->getDateFromPeriod($request->period));
        }

        $participations = $query->latest()->paginate(20);
         // Récupérer la liste des offres pour le filtre
        $offers = Offer::select('id', 'title')->get();

        return response()->json([
            'data' => $participations->items(),
            'current_page' => $participations->currentPage(),
            'last_page' => $participations->lastPage(),
            'total' => $participations->total(),
            'per_page' => $participations->perPage(),
            'offers' => $offers
        ]);

        //return response()->json($participations);
    }

    private function getDateFromPeriod(string $period): string
    {
        return match ($period) {
            'today' => now()->startOfDay(),
            'yesterday' => now()->subDay()->startOfDay(),
            'week' => now()->subWeek()->startOfDay(),
            'month' => now()->subMonth()->startOfDay(),
            'year' => now()->subYear()->startOfDay(),
            default => now()->subMonth()->startOfDay(),
        };
    }
}