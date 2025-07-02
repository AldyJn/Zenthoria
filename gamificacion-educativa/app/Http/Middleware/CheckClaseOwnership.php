<?php

// app/Http/Middleware/CheckClaseOwnership.php
namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use App\Models\Clase;

class CheckClaseOwnership
{
    /**
     * Verificar que el docente sea dueño de la clase
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @param  string|null  $paramName
     * @return mixed
     */
    public function handle(Request $request, Closure $next, string $paramName = 'clase')
    {
        $user = $request->user();

        if (!$user || !$user->esDocente()) {
            abort(403, 'Solo docentes pueden acceder a esta función.');
        }

        $claseId = $request->route($paramName);
        if (!$claseId) {
            abort(404, 'Clase no encontrada.');
        }

        $clase = Clase::find($claseId);
        if (!$clase) {
            abort(404, 'Clase no encontrada.');
        }

        if ($clase->id_docente !== $user->docente->id) {
            abort(403, 'No tienes permisos para acceder a esta clase.');
        }

        // Agregar la clase al request para evitar consultas adicionales
        $request->merge(['clase_instance' => $clase]);

        return $next($request);
    }
}