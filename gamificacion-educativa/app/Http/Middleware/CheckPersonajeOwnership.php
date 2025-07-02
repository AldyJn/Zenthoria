<?php

// app/Http/Middleware/CheckPersonajeOwnership.php
namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use App\Models\Personaje;

class CheckPersonajeOwnership
{
    /**
     * Verificar que el estudiante sea dueño del personaje o el docente de la clase
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @param  string  $paramName
     * @return mixed
     */
    public function handle(Request $request, Closure $next, string $paramName = 'personaje')
    {
        $user = $request->user();

        if (!$user) {
            abort(403, 'Usuario no autenticado.');
        }

        $personajeId = $request->route($paramName);
        if (!$personajeId) {
            abort(404, 'Personaje no encontrado.');
        }

        $personaje = Personaje::with('clase')->find($personajeId);
        if (!$personaje) {
            abort(404, 'Personaje no encontrado.');
        }

        $authorized = false;

        // El estudiante dueño del personaje
        if ($user->esEstudiante() && $personaje->id_estudiante === $user->estudiante->id) {
            $authorized = true;
        }

        // El docente de la clase
        if ($user->esDocente() && $personaje->clase->id_docente === $user->docente->id) {
            $authorized = true;
        }

        if (!$authorized) {
            abort(403, 'No tienes permisos para acceder a este personaje.');
        }

        // Agregar el personaje al request
        $request->merge(['personaje_instance' => $personaje]);

        return $next($request);
    }
}
