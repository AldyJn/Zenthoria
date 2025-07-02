<?php

namespace App\Policies;

use App\Models\Clase;
use App\Models\Usuario;
use Illuminate\Auth\Access\HandlesAuthorization;

class ClasePolicy
{
    use HandlesAuthorization;

    /**
     * Determinar si el usuario puede ver cualquier clase
     */
    public function viewAny(Usuario $user)
    {
        // Todos los usuarios autenticados pueden ver la lista de clases
        return true;
    }

    /**
     * Determinar si el usuario puede ver una clase específica
     */
    public function view(Usuario $user, Clase $clase)
    {
        // El docente dueño de la clase
        if ($user->esDocente() && $clase->id_docente === $user->docente->id) {
            return true;
        }

        // Estudiantes inscritos en la clase
        if ($user->esEstudiante()) {
            return $user->estudiante->clases()
                ->wherePivot('activo', true)
                ->where('clase.id', $clase->id)
                ->exists();
        }

        return false;
    }

    /**
     * Determinar si el usuario puede crear clases
     */
    public function create(Usuario $user)
    {
        // Solo docentes pueden crear clases
        return $user->esDocente();
    }

    /**
     * Determinar si el usuario puede actualizar una clase
     */
    public function update(Usuario $user, Clase $clase)
    {
        // Solo el docente dueño de la clase
        return $user->esDocente() && $clase->id_docente === $user->docente->id;
    }

    /**
     * Determinar si el usuario puede eliminar una clase
     */
    public function delete(Usuario $user, Clase $clase)
    {
        // Solo el docente dueño de la clase puede eliminarla
        return $user->esDocente() && $clase->id_docente === $user->docente->id;
    }

    /**
     * Determinar si el usuario puede gestionar estudiantes de la clase
     */
    public function manageStudents(Usuario $user, Clase $clase)
    {
        // Solo el docente dueño de la clase
        return $user->esDocente() && $clase->id_docente === $user->docente->id;
    }

    /**
     * Determinar si el usuario puede ver estadísticas de la clase
     */
    public function viewStats(Usuario $user, Clase $clase)
    {
        // El docente dueño puede ver todas las estadísticas
        if ($user->esDocente() && $clase->id_docente === $user->docente->id) {
            return true;
        }

        // Los estudiantes pueden ver estadísticas limitadas si están inscritos
        if ($user->esEstudiante()) {
            return $user->estudiante->clases()
                ->wherePivot('activo', true)
                ->where('clase.id', $clase->id)
                ->exists();
        }

        return false;
    }

    /**
     * Determinar si el usuario puede unirse a la clase
     */
    public function join(Usuario $user, Clase $clase)
    {
        // Solo estudiantes pueden unirse a clases
        if (!$user->esEstudiante()) {
            return false;
        }

        // La clase debe estar activa
        if (!$clase->activo) {
            return false;
        }

        // El estudiante no debe estar ya inscrito
        $yaInscrito = $user->estudiante->clases()
            ->where('clase.id', $clase->id)
            ->exists();

        return !$yaInscrito;
    }

    /**
     * Determinar si el usuario puede salirse de la clase
     */
    public function leave(Usuario $user, Clase $clase)
    {
        // Solo estudiantes pueden salirse
        if (!$user->esEstudiante()) {
            return false;
        }

        // Debe estar inscrito y activo en la clase
        return $user->estudiante->clases()
            ->wherePivot('activo', true)
            ->where('clase.id', $clase->id)
            ->exists();
    }

    /**
     * Determinar si el usuario puede generar códigos de invitación
     */
    public function generateInviteCode(Usuario $user, Clase $clase)
    {
        // Solo el docente dueño de la clase
        return $user->esDocente() && $clase->id_docente === $user->docente->id;
    }

    /**
     * Determinar si el usuario puede configurar la clase
     */
    public function configure(Usuario $user, Clase $clase)
    {
        // Solo el docente dueño de la clase
        return $user->esDocente() && $clase->id_docente === $user->docente->id;
    }
}