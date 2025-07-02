<?php

namespace App\Policies;

use App\Models\Actividad;
use App\Models\Usuario;
use Illuminate\Auth\Access\HandlesAuthorization;

class ActividadPolicy
{
    use HandlesAuthorization;

    /**
     * Determinar si el usuario puede ver cualquier actividad
     */
    public function viewAny(Usuario $user)
    {
        return true; // Todos los usuarios autenticados
    }

    /**
     * Determinar si el usuario puede ver una actividad específica
     */
    public function view(Usuario $user, Actividad $actividad)
    {
        // El docente dueño de la clase
        if ($user->esDocente() && $actividad->clase->id_docente === $user->docente->id) {
            return true;
        }

        // Estudiantes inscritos en la clase
        if ($user->esEstudiante()) {
            return $user->estudiante->clases()
                ->wherePivot('activo', true)
                ->where('clase.id', $actividad->id_clase)
                ->exists();
        }

        return false;
    }

    /**
     * Determinar si el usuario puede crear actividades
     */
    public function create(Usuario $user, $clase = null)
    {
        // Solo docentes pueden crear actividades
        if (!$user->esDocente()) {
            return false;
        }

        // Si se especifica una clase, debe ser el docente de esa clase
        if ($clase) {
            return $clase->id_docente === $user->docente->id;
        }

        return true;
    }

    /**
     * Determinar si el usuario puede actualizar una actividad
     */
    public function update(Usuario $user, Actividad $actividad)
    {
        // Solo el docente dueño de la clase
        return $user->esDocente() && 
               $actividad->clase->id_docente === $user->docente->id;
    }

    /**
     * Determinar si el usuario puede eliminar una actividad
     */
    public function delete(Usuario $user, Actividad $actividad)
    {
        // Solo el docente dueño de la clase
        return $user->esDocente() && 
               $actividad->clase->id_docente === $user->docente->id;
    }

    /**
     * Determinar si el usuario puede entregar una actividad
     */
    public function submit(Usuario $user, Actividad $actividad)
    {
        // Solo estudiantes pueden entregar
        if (!$user->esEstudiante()) {
            return false;
        }

        // Debe estar inscrito en la clase
        $inscrito = $user->estudiante->clases()
            ->wherePivot('activo', true)
            ->where('clase.id', $actividad->id_clase)
            ->exists();

        if (!$inscrito) {
            return false;
        }

        // La actividad debe estar activa
        if (!$actividad->activa) {
            return false;
        }

        // No debe haber entregado ya (a menos que se permitan reintentos)
        $yaEntregado = $actividad->entregas()
            ->where('id_estudiante', $user->estudiante->id)
            ->exists();

        if ($yaEntregado) {
            // Verificar si se permiten reintentos en la configuración de la clase
            $permiteReintentos = $actividad->clase->obtenerConfiguracion('permitir_reintentos_actividades', false);
            return $permiteReintentos;
        }

        return true;
    }

    /**
     * Determinar si el usuario puede calificar entregas
     */
    public function grade(Usuario $user, Actividad $actividad)
    {
        // Solo el docente dueño de la clase
        return $user->esDocente() && 
               $actividad->clase->id_docente === $user->docente->id;
    }

    /**
     * Determinar si el usuario puede ver todas las entregas de una actividad
     */
    public function viewSubmissions(Usuario $user, Actividad $actividad)
    {
        // Solo el docente dueño de la clase
        return $user->esDocente() && 
               $actividad->clase->id_docente === $user->docente->id;
    }

    /**
     * Determinar si el usuario puede ver su propia entrega
     */
    public function viewOwnSubmission(Usuario $user, Actividad $actividad)
    {
        // Solo estudiantes inscritos en la clase
        if (!$user->esEstudiante()) {
            return false;
        }

        return $user->estudiante->clases()
            ->wherePivot('activo', true)
            ->where('clase.id', $actividad->id_clase)
            ->exists();
    }

    /**
     * Determinar si el usuario puede descargar archivos de entregas
     */
    public function downloadSubmission(Usuario $user, Actividad $actividad, $entrega)
    {
        // El docente dueño de la clase puede descargar cualquier entrega
        if ($user->esDocente() && $actividad->clase->id_docente === $user->docente->id) {
            return true;
        }

        // Los estudiantes solo pueden descargar su propia entrega
        if ($user->esEstudiante() && $entrega->id_estudiante === $user->estudiante->id) {
            return true;
        }

        return false;
    }

    /**
     * Determinar si el usuario puede ver estadísticas de la actividad
     */
    public function viewStats(Usuario $user, Actividad $actividad)
    {
        // Solo el docente dueño de la clase
        return $user->esDocente() && 
               $actividad->clase->id_docente === $user->docente->id;
    }

    /**
     * Determinar si el usuario puede extender la fecha de entrega
     */
    public function extendDeadline(Usuario $user, Actividad $actividad)
    {
        // Solo el docente dueño de la clase
        return $user->esDocente() && 
               $actividad->clase->id_docente === $user->docente->id;
    }

    /**
     * Determinar si el usuario puede duplicar una actividad
     */
    public function duplicate(Usuario $user, Actividad $actividad)
    {
        // Solo el docente dueño de la clase
        return $user->esDocente() && 
               $actividad->clase->id_docente === $user->docente->id;
    }

    /**
     * Determinar si el usuario puede archivar/desarchivar una actividad
     */
    public function archive(Usuario $user, Actividad $actividad)
    {
        // Solo el docente dueño de la clase
        return $user->esDocente() && 
               $actividad->clase->id_docente === $user->docente->id;
    }
}