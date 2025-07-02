<?php

// app/Http/Middleware/HandleInertiaRequests.php
namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): string|null
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        return array_merge(parent::share($request), [
            'auth' => [
                'user' => $request->user() ? [
                    'id' => $request->user()->id,
                    'nombre' => $request->user()->nombre,
                    'correo' => $request->user()->correo,
                    'es_docente' => $request->user()->esDocente(),
                    'es_estudiante' => $request->user()->esEstudiante(),
                    'esta_activo' => $request->user()->estaActivo(),
                    'ultimo_acceso' => $request->user()->ultimo_acceso,
                    'perfil' => $request->user()->esDocente() 
                        ? $request->user()->docente 
                        : $request->user()->estudiante,
                ] : null,
            ],
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
                'warning' => fn () => $request->session()->get('warning'),
                'info' => fn () => $request->session()->get('info'),
            ],
            'errors' => fn () => $request->session()->get('errors') 
                ? $request->session()->get('errors')->getBag('default')->getMessages() 
                : (object) [],
            'app' => [
                'name' => config('app.name'),
                'url' => config('app.url'),
                'locale' => app()->getLocale(),
                'timezone' => config('app.timezone'),
            ],
            'ziggy' => function () {
                return [
                    'location' => request()->url(),
                    'query' => request()->query(),
                ];
            },
        ]);
    }
    public function share(Request $request): array
    {
    return array_merge(parent::share($request), [
        'auth' => [
            'user' => $request->user() ? [
                'id' => $request->user()->id,
                'nombre' => $request->user()->nombre,
                'correo' => $request->user()->correo,
                'tipo_usuario' => $request->user()->tipoUsuario->nombre ?? null,
                'avatar' => $request->user()->avatar,
                'avatar_url' => $request->user()->avatar_url,
            ] : null,
        ],
        'flash' => [
            'success' => fn () => $request->session()->get('success'),
            'error' => fn () => $request->session()->get('error'),
            'info' => fn () => $request->session()->get('info'),
            'warning' => fn () => $request->session()->get('warning'),
        ],
    ]);
}
}
