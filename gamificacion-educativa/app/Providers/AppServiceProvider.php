<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Inertia\Inertia;
class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        // Configuración adicional de Inertia
        Inertia::share([
            'config' => [
                'app_name' => config('app.name'),
                'app_url' => config('app.url'),
                'timezone' => config('app.timezone'),
            ],
        ]);

        // Resolver páginas con carga lazy
        Inertia::share('auth.user', function () {
            if (auth()->check()) {
                $user = auth()->user();
                return [
                    'id' => $user->id,
                    'nombre' => $user->nombre,
                    'correo' => $user->correo,
                    'es_docente' => $user->esDocente(),
                    'es_estudiante' => $user->esEstudiante(),
                    'perfil' => $user->esDocente() ? $user->docente : $user->estudiante,
                ];
            }
            return null;
        });
    }
}