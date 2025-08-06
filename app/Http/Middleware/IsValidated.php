<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class IsValidated
{
    public function handle(Request $request, Closure $next): Response
    {
        if (!$request->user() || !$request->user()->isValidated()) {
            return response()->json([
                'message' => 'Votre compte doit être validé par un administrateur pour accéder à cette ressource.'
            ], 403);
        }

        return $next($request);
    }
}