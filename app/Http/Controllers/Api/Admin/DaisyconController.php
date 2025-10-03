<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use App\Services\DaisyconService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class DaisyconController extends Controller
{
    public function getSettings()
    {
        $settings = [
            'publisher_id' => Setting::get('daisycon_publisher_id'),
            'username' => Setting::get('daisycon_username'),
            'password' => Setting::get('daisycon_password') ? '••••••••' : null,
        ];

        $syncInfo = app(DaisyconService::class)->getLastSyncInfo();

        return response()->json([
            'settings' => $settings,
            'sync_info' => $syncInfo,
        ]);
    }

    public function updateSettings(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'publisher_id' => 'required|string',
            'username' => 'required|string',
            'password' => 'required|string|min:6',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Données de validation incorrectes',
                'errors' => $validator->errors()
            ], 422);
        }

        // Sauvegarder les paramètres
        Setting::set('daisycon_publisher_id', $request->publisher_id, 'ID Publisher Daisycon');
        Setting::set('daisycon_username', $request->username, 'Nom d\'utilisateur Daisycon');
        Setting::set('daisycon_password', $request->password, 'Mot de passe Daisycon', true);

        return response()->json([
            'message' => 'Paramètres Daisycon sauvegardés avec succès'
        ]);
    }

    public function testConnection(DaisyconService $daisyconService): \Illuminate\Http\JsonResponse
    {
        $result = $daisyconService->testConnection();

        return response()->json($result, $result['success'] ? 200 : 400);
    }

    public function syncNow(DaisyconService $daisyconService)
    {
        try {
            $syncedCount = $daisyconService->syncTransactions();
            $daisyconService->updateSyncInfo($syncedCount);

            return response()->json([
                'message' => "Synchronisation terminée avec succès. {$syncedCount} transactions synchronisées.",
                'synced_count' => $syncedCount
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erreur lors de la synchronisation: ' . $e->getMessage()
            ], 500);
        }
    }
}
