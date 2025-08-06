<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
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
}