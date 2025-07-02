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
                    'tipo_usuario' => $request->user()->tipoUsuario->nombre ?? null,
                    'avatar' => $request->user()->avatar,
                    'avatar_url' => $request->user()->avatar_url,
                    'es_docente' => $request->user()->esDocente(),
                    'es_estudiante' => $request->user()->esEstudiante(),
                    'esta_activo' => $request->user()->estaActivo(),
                    'ultimo_acceso' => $request->user()->ultimo_acceso,
                    'perfil' => $this->getUserProfile($request->user()),
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
            'ziggy' => function () use ($request) {
                return [
                    'location' => $request->url(),
                    'query' => $request->query(),
                ];
            },
        ]);
    }

    /**
     * Obtener el perfil del usuario (docente o estudiante)
     */
    private function getUserProfile($user)
    {
        if (!$user) {
            return null;
        }

        if ($user->esDocente()) {
            return $user->docente()->with(['clases' => function ($query) {
                $query->select('id', 'nombre', 'codigo_acceso', 'id_docente')
                      ->where('activa', true);
            }])->first();
        }

        if ($user->esEstudiante()) {
            return $user->estudiante()->with(['personajes' => function ($query) {
                $query->select('id', 'nombre', 'nivel', 'experiencia', 'id_estudiante', 'id_clase')
                      ->with(['clase:id,nombre']);
            }])->first();
        }

        return null;
    }
}