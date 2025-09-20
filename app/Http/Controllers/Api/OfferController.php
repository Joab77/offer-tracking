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
        // Récupérer le code pays depuis l'en-tête
        $userCountry = $request->header('X-Country');

        if (!$userCountry) {
            return response()->json([
                'message' => 'Localisation requise pour afficher les offres',
                'error' => 'GEOLOCATION_REQUIRED'
            ], 400);
        }

        $offers = Offer::where('country', strtoupper($userCountry))
            ->latest()
            ->paginate(20);

        return response()->json($offers);
    }

    public function show(Request $request, $id)
    {
        $country = $request->header('X-Country');


        $offer = Offer::query()
            ->where('id', $id)
            ->when($country, fn($q) => $q->where('country', $country))
            ->first();

        if (!$offer) {
            return response()->json([
                'success' => false,
                'message' => 'Offre non trouvée'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $offer
        ]);
    }

    public function apply(Request $request, Offer $offer)
    {
        $user = $request->user();
        $userCountry = $request->header('X-Country');

        // Vérifier si l'offre est pour le bon pays
        if ($offer->country !== strtoupper($userCountry)) {
            return response()->json([
                'message' => 'Cette offre n\'est pas disponible dans votre pays'
            ]);
        }

        // Vérifier si l'utilisateur a déjà participé
        if ($offer->hasUserParticipated($user->id)) {
            return response()->json([
                'message' => 'Vous avez déjà participé à cette offre',
                'action' => 'continue',
                'deeplink' => $offer->deeplink
            ], 200);
        }

        // Créer la participation
        $participation = Participation::create([
            'user_id' => $user->id,
            'offer_id' => $offer->id,
        ]);


        return response()->json([
            'message' => 'Participation enregistrée avec succès',
            'participation' => $participation,
            'action' => 'participate',
            'deeplink' => $offer->deeplink
        ], 201);
    }
}
