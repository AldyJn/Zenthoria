<?php

namespace App\Policies;

use App\Models\Badge;
use App\Models\Usuario;
use Illuminate\Auth\Access\HandlesAuthorization;

class BadgePolicy
{
    use HandlesAuthorization;

    public function viewAny(Usuario $user)
    {
        return true; // Todos pueden ver badges
    }

    public function view(Usuario $user, Badge $badge)
    {
        return true; // Todos pueden ver badges individuales
    }

    public function create(Usuario $user)
    {
        return $user->esDocente(); // Solo docentes pueden crear badges
    }

    public function update(Usuario $user, Badge $badge)
    {
        return $user->esDocente(); // Solo docentes pueden editar badges
    }

    public function delete(Usuario $user, Badge $badge)
    {
        return $user->esDocente(); // Solo docentes pueden eliminar badges
    }

    public function award(Usuario $user, Badge $badge, $estudiante)
    {
        // Solo docentes pueden otorgar badges manualmente
        return $user->esDocente();
    }
}
