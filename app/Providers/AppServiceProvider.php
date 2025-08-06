<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        // Enregistrer les middlewares personnalisés
        $router = $this->app['router'];
        $router->aliasMiddleware('admin', \App\Http\Middleware\IsAdmin::class);
        $router->aliasMiddleware('validated', \App\Http\Middleware\IsValidated::class);
    }
}