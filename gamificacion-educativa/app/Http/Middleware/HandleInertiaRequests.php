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
                    // Hacer estas llamadas más seguras
                    'tipo_usuario' => optional($request->user()->tipoUsuario)->nombre,
                    'avatar' => $request->user()->avatar ?? null,
                    'ultimo_acceso' => $request->user()->ultimo_acceso ?? null,
                    // Verificar si los métodos existen antes de llamarlos
                    'es_docente' => method_exists($request->user(), 'esDocente') ? $request->user()->esDocente() : false,
                    'es_estudiante' => method_exists($request->user(), 'esEstudiante') ? $request->user()->esEstudiante() : false,
                ] : null,
            ],
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
                'warning' => fn () => $request->session()->get('warning'),
                'info' => fn () => $request->session()->get('info'),
            ],
            // Configuración de la app
            'config' => [
                'app_name' => config('app.name'),
                'app_url' => config('app.url'),
            ],
        ]);
    }
}