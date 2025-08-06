<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Offer;
use App\Models\Participation;
use Illuminate\Http\Request;

class OfferController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        
        $offers = Offer::where('country', $user->pays)
            ->latest()
            ->paginate(20);

        return response()->json($offers);
    }

    public function apply(Request $request, Offer $offer)
    {
        $user = $request->user();

        // Vérifier si l'offre est pour le bon pays
        if ($offer->country !== $user->pays) {
            return response()->json([
                'message' => 'Cette offre n\'est pas disponible dans votre pays'
            ], 403);
        }

        // Vérifier si l'utilisateur a déjà postulé
        $existingParticipation = Participation::where('user_id', $user->id)
            ->where('offer_id', $offer->id)
            ->first();

        if ($existingParticipation) {
            return response()->json([
                'message' => 'Vous avez déjà postulé à cette offre',
                'participation' => $existingParticipation
            ], 409);
        }

        // Créer la participation
        $participation = Participation::create([
            'user_id' => $user->id,
            'offer_id' => $offer->id,
            'clicked_at' => now(),
            'status' => 'en_attente',
        ]);

        // Générer l'URL d'affiliation avec subid
        $affiliateUrl = $offer->getAffiliateUrl($user->id);

        return response()->json([
            'message' => 'Participation enregistrée avec succès',
            'participation' => $participation,
            'affiliate_url' => $affiliateUrl
        ], 201);
    }
}