<?php

use App\Http\Controllers\Api\Admin\OfferController as AdminOfferController;
use App\Http\Controllers\Api\Admin\ParticipationController as AdminParticipationController;
use App\Http\Controllers\Api\Admin\UserController as AdminUserController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\OfferController;
use App\Http\Controllers\Api\ParticipationController;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Routes d'authentification (publiques)
Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
    Route::post('/reset-password', [AuthController::class, 'resetPassword']);
});

// Routes protégées par authentification
Route::middleware('auth:sanctum')->group(function () {
    // Routes d'authentification pour utilisateurs connectés
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);

    Route::get('/location', [AuthController::class, 'getLocation']);

    Route::put('/profile', [AuthController::class, 'updateProfile']);
    Route::put('/country/reload', [AuthController::class, 'updateCountryFromIP']);

    // Routes utilisateur (nécessitent validation)
    Route::middleware('validated')->group(function () {
        Route::get('/offers', [OfferController::class, 'index']);
        Route::get('/offers/{id}', [OfferController::class, 'show']);
        Route::post('/offers/{offer}/apply', [OfferController::class, 'apply']);
        Route::get('/participations', [ParticipationController::class, 'index']);
    });

    // Routes administrateur
    Route::prefix('admin')->middleware('admin')->group(function () {
        // Gestion des utilisateurs
        Route::get('/users', [AdminUserController::class, 'index']);
        Route::patch('/users/{user}/validate', [AdminUserController::class, 'validate']);

        // Gestion des offres
        Route::get('/offers', [AdminOfferController::class, 'index']);
        Route::post('/offers', [AdminOfferController::class, 'store']);
        Route::put('/offers/{offer}', [AdminOfferController::class, 'update']);
        Route::delete('/offers/{offer}', [AdminOfferController::class, 'destroy']);

        // Gestion des participations
        Route::get('/participations', [AdminParticipationController::class, 'index']);

        // Configuration Daisycon
        Route::get('/daisycon/settings', [App\Http\Controllers\Api\Admin\DaisyconController::class, 'getSettings']);
        Route::post('/daisycon/settings', [App\Http\Controllers\Api\Admin\DaisyconController::class, 'updateSettings']);
        Route::post('/daisycon/test', [App\Http\Controllers\Api\Admin\DaisyconController::class, 'testConnection']);
        Route::post('/daisycon/sync', [App\Http\Controllers\Api\Admin\DaisyconController::class, 'syncNow']);

    });
});
