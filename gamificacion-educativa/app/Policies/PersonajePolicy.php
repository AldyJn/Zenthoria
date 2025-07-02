<?php

namespace App\Policies;

use App\Models\Personaje;
use App\Models\Usuario;
use Illuminate\Auth\Access\HandlesAuthorization;

class PersonajePolicy
{
    use HandlesAuthorization;

    /**
     * Determinar si el usuario puede ver cualquier personaje
     */
    public function viewAny(Usuario $user)
    {
        return true; // Todos pueden ver personajes (para rankings, etc.)
    }

    /**
     * Determinar si el usuario puede ver un personaje específico
     */
    public function view(Usuario $user, Personaje $personaje)
    {
        // El dueño del personaje
        if ($user->esEstudiante() && $personaje->id_estudiante === $user->estudiante->id) {
            return true;
        }

        // El docente de la clase
        if ($user->esDocente() && $personaje->clase->id_docente === $user->docente->id) {
            return true;
        }

        // Otros estudiantes de la misma clase (para rankings públicos)
        if ($user->esEstudiante()) {
            $enMismaClase = $user->estudiante->clases()
                ->wherePivot('activo', true)
                ->where('clase.id', $personaje->id_clase)
                ->exists();

            if ($enMismaClase) {
                // Verificar si el ranking es público según configuración de la clase
                return $personaje->clase->obtenerConfiguracion('mostrar_ranking_publico', true);
            }
        }

        return false;
    }

    /**
     * Determinar si el usuario puede crear personajes
     */
    public function create(Usuario $user)
    {
        // Los personajes se crean automáticamente al inscribirse en una clase
        // Los estudiantes no los crean manualmente
        return false;
    }

    /**
     * Determinar si el usuario puede actualizar un personaje
     */
    public function update(Usuario $user, Personaje $personaje)
    {
        // Solo el dueño del personaje puede actualizarlo
        return $user->esEstudiante() && 
               $personaje->id_estudiante === $user->estudiante->id;
    }

    /**
     * Determinar si el usuario puede eliminar un personaje
     */
    public function delete(Usuario $user, Personaje $personaje)
    {
        // Solo el docente de la clase puede eliminar personajes (raramente necesario)
        return $user->esDocente() && 
               $personaje->clase->id_docente === $user->docente->id;
    }

    /**
     * Determinar si el usuario puede cambiar el avatar del personaje
     */
    public function changeAvatar(Usuario $user, Personaje $personaje)
    {
        // Solo el dueño del personaje
        return $user->esEstudiante() && 
               $personaje->id_estudiante === $user->estudiante->id;
    }

    /**
     * Determinar si el usuario puede cambiar el nombre del personaje
     */
    public function changeName(Usuario $user, Personaje $personaje)
    {
        // Solo el dueño del personaje
        return $user->esEstudiante() && 
               $personaje->id_estudiante === $user->estudiante->id;
    }

    /**
     * Determinar si el usuario puede cambiar la clase RPG del personaje
     */
    public function changeClass(Usuario $user, Personaje $personaje)
    {
        // Solo el dueño del personaje
        // Podría tener restricciones adicionales (ej: solo una vez por mes)
        return $user->esEstudiante() && 
               $personaje->id_estudiante === $user->estudiante->id;
    }

    /**
     * Determinar si el usuario puede ver las estadísticas detalladas del personaje
     */
    public function viewDetailedStats(Usuario $user, Personaje $personaje)
    {
        // El dueño del personaje
        if ($user->esEstudiante() && $personaje->id_estudiante === $user->estudiante->id) {
            return true;
        }

        // El docente de la clase
        if ($user->esDocente() && $personaje->clase->id_docente === $user->docente->id) {
            return true;
        }

        return false;
    }

    /**
     * Determinar si el usuario puede ver el historial de experiencia del personaje
     */
    public function viewExperienceHistory(Usuario $user, Personaje $personaje)
    {
        // Solo el dueño del personaje y el docente
        return ($user->esEstudiante() && $personaje->id_estudiante === $user->estudiante->id) ||
               ($user->esDocente() && $personaje->clase->id_docente === $user->docente->id);
    }

    /**
     * Determinar si el usuario puede otorgar experiencia manualmente al personaje
     */
    public function grantExperience(Usuario $user, Personaje $personaje)
    {
        // Solo el docente de la clase
        return $user->esDocente() && 
               $personaje->clase->id_docente === $user->docente->id;
    }

    /**
     * Determinar si el usuario puede resetear el personaje
     */
    public function reset(Usuario $user, Personaje $personaje)
    {
        // Solo el docente de la clase (función administrativa)
        return $user->esDocente() && 
               $personaje->clase->id_docente === $user->docente->id;
    }

    /**
     * Determinar si el usuario puede ver el ranking de la clase
     */
    public function viewRanking(Usuario $user, $clase)
    {
        // El docente de la clase
        if ($user->esDocente() && $clase->id_docente === $user->docente->id) {
            return true;
        }

        // Estudiantes de la clase si el ranking es público
        if ($user->esEstudiante()) {
            $inscrito = $user->estudiante->clases()
                ->wherePivot('activo', true)
                ->where('clase.id', $clase->id)
                ->exists();

            if ($inscrito) {
                return $clase->obtenerConfiguracion('mostrar_ranking_publico', true);
            }
        }

        return false;
    }

    /**
     * Determinar si el usuario puede ver su posición en el ranking
     */
    public function viewOwnRankingPosition(Usuario $user, Personaje $personaje)
    {
        // Solo el dueño del personaje
        return $user->esEstudiante() && 
               $personaje->id_estudiante === $user->estudiante->id;
    }

    /**
     * Determinar si el usuario puede comparar personajes
     */
    public function compare(Usuario $user, Personaje $personaje1, Personaje $personaje2)
    {
        // Si es uno de los dueños de los personajes
        if ($user->esEstudiante()) {
            $esOwner = $personaje1->id_estudiante === $user->estudiante->id ||
                      $personaje2->id_estudiante === $user->estudiante->id;
            
            if ($esOwner) {
                return true;
            }

            // O si están en la misma clase y el ranking es público
            $mismaClase = $personaje1->id_clase === $personaje2->id_clase;
            $inscritoEnClase = $user->estudiante->clases()
                ->wherePivot('activo', true)
                ->where('clase.id', $personaje1->id_clase)
                ->exists();

            if ($mismaClase && $inscritoEnClase) {
                return $personaje1->clase->obtenerConfiguracion('mostrar_ranking_publico', true);
            }
        }

        // El docente puede comparar personajes de su clase
        if ($user->esDocente()) {
            return $personaje1->clase->id_docente === $user->docente->id &&
                   $personaje2->clase->id_docente === $user->docente->id;
        }

        return false;
    }
}