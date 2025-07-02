<?php

namespace App\Policies;

use App\Models\Mision;
use App\Models\Usuario;
use Illuminate\Auth\Access\HandlesAuthorization;

class MisionPolicy
{
    use HandlesAuthorization;

    /**
     * Determinar si el usuario puede ver cualquier misión
     */
    public function viewAny(Usuario $user)
    {
        return true; // Todos los usuarios autenticados
    }

    /**
     * Determinar si el usuario puede ver una misión específica
     */
    public function view(Usuario $user, Mision $mision)
    {
        // El docente dueño de la clase
        if ($user->esDocente() && $mision->clase->id_docente === $user->docente->id) {
            return true;
        }

        // Estudiantes inscritos en la clase
        if ($user->esEstudiante()) {
            return $user->estudiante->clases()
                ->wherePivot('activo', true)
                ->where('clase.id', $mision->id_clase)
                ->exists();
        }

        return false;
    }

    /**
     * Determinar si el usuario puede crear misiones
     */
    public function create(Usuario $user, $clase = null)
    {
        // Solo docentes pueden crear misiones
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
     * Determinar si el usuario puede actualizar una misión
     */
    public function update(Usuario $user, Mision $mision)
    {
        // Solo el docente dueño de la clase
        return $user->esDocente() && 
               $mision->clase->id_docente === $user->docente->id;
    }

    /**
     * Determinar si el usuario puede eliminar una misión
     */
    public function delete(Usuario $user, Mision $mision)
    {
        // Solo el docente dueño de la clase
        // Podría agregar restricción: no eliminar si estudiantes ya progresaron
        return $user->esDocente() && 
               $mision->clase->id_docente === $user->docente->id;
    }

    /**
     * Determinar si el usuario puede ver el progreso de una misión
     */
    public function viewProgress(Usuario $user, Mision $mision)
    {
        // El docente puede ver el progreso de todos
        if ($user->esDocente() && $mision->clase->id_docente === $user->docente->id) {
            return true;
        }

        // Los estudiantes solo pueden ver su propio progreso
        if ($user->esEstudiante()) {
            return $user->estudiante->clases()
                ->wherePivot('activo', true)
                ->where('clase.id', $mision->id_clase)
                ->exists();
        }

        return false;
    }

    /**
     * Determinar si el usuario puede activar/desactivar una misión
     */
    public function toggleActive(Usuario $user, Mision $mision)
    {
        // Solo el docente dueño de la clase
        return $user->esDocente() && 
               $mision->clase->id_docente === $user->docente->id;
    }

    /**
     * Determinar si el usuario puede ver las estadísticas de la misión
     */
    public function viewStats(Usuario $user, Mision $mision)
    {
        // Solo el docente dueño de la clase
        return $user->esDocente() && 
               $mision->clase->id_docente === $user->docente->id;
    }

    /**
     * Determinar si el usuario puede reordenar misiones
     */
    public function reorder(Usuario $user, $clase)
    {
        // Solo el docente dueño de la clase
        return $user->esDocente() && 
               $clase->id_docente === $user->docente->id;
    }

    /**
     * Determinar si el usuario puede duplicar una misión
     */
    public function duplicate(Usuario $user, Mision $mision)
    {
        // Solo el docente dueño de la clase
        return $user->esDocente() && 
               $mision->clase->id_docente === $user->docente->id;
    }

    /**
     * Determinar si el usuario puede otorgar recompensas bonus manualmente
     */
    public function grantBonusRewards(Usuario $user, Mision $mision)
    {
        // Solo el docente dueño de la clase
        return $user->esDocente() && 
               $mision->clase->id_docente === $user->docente->id;
    }

    /**
     * Determinar si el usuario puede resetear el progreso de una misión
     */
    public function resetProgress(Usuario $user, Mision $mision)
    {
        // Solo el docente dueño de la clase
        return $user->esDocente() && 
               $mision->clase->id_docente === $user->docente->id;
    }

    /**
     * Determinar si el usuario puede extender la fecha límite de una misión
     */
    public function extendDeadline(Usuario $user, Mision $mision)
    {
        // Solo el docente dueño de la clase
        return $user->esDocente() && 
               $mision->clase->id_docente === $user->docente->id;
    }

    /**
     * Determinar si el usuario puede agregar actividades a una misión
     */
    public function addActivities(Usuario $user, Mision $mision)
    {
        // Solo el docente dueño de la clase
        return $user->esDocente() && 
               $mision->clase->id_docente === $user->docente->id;
    }

    /**
     * Determinar si el usuario puede ver el ranking de progreso de la misión
     */
    public function viewProgressRanking(Usuario $user, Mision $mision)
    {
        // El docente puede ver el ranking completo
        if ($user->esDocente() && $mision->clase->id_docente === $user->docente->id) {
            return true;
        }

        // Los estudiantes pueden ver el ranking si está configurado como público
        if ($user->esEstudiante()) {
            $inscrito = $user->estudiante->clases()
                ->wherePivot('activo', true)
                ->where('clase.id', $mision->id_clase)
                ->exists();

            if ($inscrito) {
                return $mision->clase->obtenerConfiguracion('mostrar_ranking_publico', true);
            }
        }

        return false;
    }
}