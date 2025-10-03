<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Offer;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class OfferController extends Controller
{
    public function index(Request $request)
    {
        $query = Offer::query();

        // Filtrer par pays
        if ($request->has('country')) {
            $query->where('country', $request->get('country'));
        }

        $offers = $query->latest()->paginate(20);

        return response()->json($offers);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'image_url' => 'nullable|url',
            'country' => 'required|string|size:2',
            'deeplink' => 'required|url',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Données de validation incorrectes',
                'errors' => $validator->errors()
            ], 422);
        }

        $deeplink = $request->deeplink;

        // extraction de l’offer_id depuis le lien
        $query = parse_url($deeplink, PHP_URL_QUERY);
        parse_str($query, $params);

        $programId = $params['si'] ?? null;


        $offer = Offer::create([
            'title' => $request->title,
            'description' => $request->description,
            'image_url' => $request->image_url,
            'country' => strtoupper($request->country),
            'deeplink' => $request->deeplink,
            'program_id' => $programId,
        ]);

        return response()->json([
            'message' => 'Offre créée avec succès',
            'offer' => $offer
        ], 201);
    }

    public function update(Request $request, Offer $offer)
    {
        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'image_url' => 'nullable|url',
            'country' => 'required|string|size:2',
            'deeplink' => 'required|url',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Données de validation incorrectes',
                'errors' => $validator->errors()
            ], 422);
        }

        $deeplink = $request->deeplink;

        $query = parse_url($deeplink, PHP_URL_QUERY);
        parse_str($query, $params);

        $programId = $params['si'] ?? null;

        $offer->update([
            'title' => $request->title,
            'description' => $request->description,
            'image_url' => $request->image_url,
            'country' => strtoupper($request->country),
            'deeplink' => $request->deeplink,
            'program_id' => $programId,
        ]);

        return response()->json([
            'message' => 'Offre modifiée avec succès',
            'offer' => $offer
        ]);
    }

    public function destroy(Offer $offer)
    {
        $offer->delete();

        return response()->json([
            'message' => 'Offre supprimée avec succès'
        ]);
    }
}
