<?php

// app/Http/Middleware/CheckUserType.php
namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class CheckUserType
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @param  string  $type
     * @return mixed
     */
    public function handle(Request $request, Closure $next, string $type)
    {
        $user = $request->user();

        if (!$user) {
            return redirect()->route('login');
        }

        switch ($type) {
            case 'docente':
                if (!$user->esDocente()) {
                    abort(403, 'Acceso restringido a docentes.');
                }
                break;

            case 'estudiante':
                if (!$user->esEstudiante()) {
                    abort(403, 'Acceso restringido a estudiantes.');
                }
                break;

            default:
                abort(403, 'Tipo de usuario no válido.');
        }

        return $next($request);
    }
}