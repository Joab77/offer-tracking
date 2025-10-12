<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Notifications\AccountDeactivatedNotification;
use App\Notifications\AccountValidatedNotification;
use Illuminate\Http\Request;

class UserController extends Controller
{
    public function index(Request $request)
    {
        $query = User::query();

        // Filtrer par statut de validation
        if ($request->has('validated')) {
            $query->where('validated', $request->boolean('validated'));
        }

        // Recherche par nom ou email
        if ($request->has('search')) {
            $search = $request->get('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        $users = $query->latest()->paginate(20);

        return response()->json($users);
    }

    public function validate(Request $request, User $user)
    {
        if ($user->isValidated()) {
            return response()->json([
                'message' => 'Cet utilisateur est déjà validé'
            ], 409);
        }

        $user->update(['validated' => true]);
        $user->notify(new AccountValidatedNotification());

        return response()->json([
            'message' => 'Utilisateur validé avec succès',
            'user' => $user
        ]);
    }

    public function deactivate(Request $request, User $user)
    {
        if (!$user->isValidated()) {
            return response()->json([
                'message' => 'Ce compte est déjà désactivé'
            ], 409);
        }

        $user->update(['validated' => false]);

        $user->tokens()->delete();
        $user->notify(new AccountDeactivatedNotification());

        return response()->json([
            'message' => 'Compte désactivé et tokens révoqués avec succès',
            'user' => $user
        ]);
    }

    public function destroy(Request $request, User $user)
    {
        // Vérifie que l'utilisateur existe
        if (!$user) {
            return response()->json([
                'message' => 'Utilisateur introuvable.'
            ], 404);
        }

        // Vérifie que l'utilisateur n'a pas de participations
        if ($user->participations()->exists()) {
            return response()->json([
                'message' => 'Impossible de supprimer un utilisateur ayant des participations.'
            ], 409);
        }

        // Empêche la suppression d'un administrateur
        if ($user->isAdmin()) {
            return response()->json([
                'message' => 'Impossible de supprimer un compte administrateur.'
            ], 403);
        }

        // Révoquer tous les tokens pour sécurité
        $user->tokens()->delete();

        // Supprimer le compte
        $user->delete();

        return response()->json([
            'message' => 'Compte supprimé avec succès.'
        ]);
    }

}
