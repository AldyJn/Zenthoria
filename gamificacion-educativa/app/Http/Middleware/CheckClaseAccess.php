<?php

// app/Http/Middleware/CheckClaseAccess.php
namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use App\Models\Clase;

class CheckClaseAccess
{
    /**
     * Verificar que el usuario tenga acceso a la clase (docente o estudiante inscrito)
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @param  string  $paramName
     * @return mixed
     */
    public function handle(Request $request, Closure $next, string $paramName = 'clase')
    {
        $user = $request->user();

        if (!$user) {
            abort(403, 'Usuario no autenticado.');
        }

        $claseId = $request->route($paramName);
        if (!$claseId) {
            abort(404, 'Clase no encontrada.');
        }

        $clase = Clase::find($claseId);
        if (!$clase) {
            abort(404, 'Clase no encontrada.');
        }

        $hasAccess = false;

        // Verificar acceso según tipo de usuario
        if ($user->esDocente()) {
            // El docente dueño de la clase
            $hasAccess = $clase->id_docente === $user->docente->id;
        } elseif ($user->esEstudiante()) {
            // Estudiante inscrito en la clase
            $hasAccess = $user->estudiante->clases()
                ->wherePivot('activo', true)
                ->where('clase.id', $clase->id)
                ->exists();
        }

        if (!$hasAccess) {
            abort(403, 'No tienes acceso a esta clase.');
        }

        // Agregar información al request
        $request->merge([
            'clase_instance' => $clase,
            'user_role_in_class' => $user->esDocente() ? 'docente' : 'estudiante'
        ]);

        return $next($request);
    }
}