<?php

namespace App\Policies;

use App\Models\Usuario;
use App\Models\ItemTienda;
use Illuminate\Auth\Access\HandlesAuthorization;

class ItemTiendaPolicy
{
    use HandlesAuthorization;

    /**
     * Determinar si el usuario puede ver cualquier item de tienda
     */
    public function viewAny(Usuario $user)
    {
        return true; // Todos los usuarios autenticados pueden ver items
    }

    /**
     * Determinar si el usuario puede ver un item específico
     */
    public function view(Usuario $user, ItemTienda $item)
    {
        // El docente de la clase
        if ($user->esDocente() && $item->clase->id_docente === $user->docente->id) {
            return true;
        }

        // Estudiantes inscritos en la clase
        if ($user->esEstudiante()) {
            return $user->estudiante->clases()
                ->wherePivot('activo', true)
                ->where('clase.id', $item->id_clase)
                ->exists();
        }

        return false;
    }

    /**
     * Determinar si el usuario puede crear items
     */
    public function create(Usuario $user, $clase = null)
    {
        // Solo docentes pueden crear items
        if (!$user->esDocente()) {
            return false;
        }

        // Si se especifica clase, debe ser docente de esa clase
        if ($clase) {
            return $clase->id_docente === $user->docente->id;
        }

        return true;
    }

    /**
     * Determinar si el usuario puede actualizar un item
     */
    public function update(Usuario $user, ItemTienda $item)
    {
        // Solo el docente de la clase
        return $user->esDocente() && 
               $item->clase->id_docente === $user->docente->id;
    }

    /**
     * Determinar si el usuario puede eliminar un item
     */
    public function delete(Usuario $user, ItemTienda $item)
    {
        // Solo el docente de la clase
        return $user->esDocente() && 
               $item->clase->id_docente === $user->docente->id;
    }

    /**
     * Determinar si el usuario puede comprar un item
     */
    public function purchase(Usuario $user, ItemTienda $item)
    {
        // Solo estudiantes pueden comprar
        if (!$user->esEstudiante()) {
            return false;
        }

        // El item debe estar disponible
        if (!$item->disponible) {
            return false;
        }

        // Verificar cantidad limitada
        if ($item->cantidad_limitada && $item->cantidad_disponible <= 0) {
            return false;
        }

        // Debe estar inscrito en la clase
        return $user->estudiante->clases()
            ->wherePivot('activo', true)
            ->where('clase.id', $item->id_clase)
            ->exists();
    }

    /**
     * Determinar si el usuario puede activar/desactivar un item
     */
    public function toggleAvailability(Usuario $user, ItemTienda $item)
    {
        // Solo el docente de la clase
        return $user->esDocente() && 
               $item->clase->id_docente === $user->docente->id;
    }

    /**
     * Determinar si el usuario puede modificar precios
     */
    public function changePrice(Usuario $user, ItemTienda $item)
    {
        // Solo el docente de la clase
        return $user->esDocente() && 
               $item->clase->id_docente === $user->docente->id;
    }

    /**
     * Determinar si el usuario puede restockear un item
     */
    public function restock(Usuario $user, ItemTienda $item)
    {
        // Solo el docente de la clase
        return $user->esDocente() && 
               $item->clase->id_docente === $user->docente->id;
    }

    /**
     * Determinar si el usuario puede ver estadísticas de ventas
     */
    public function viewSalesStats(Usuario $user, ItemTienda $item)
    {
        // Solo el docente de la clase
        return $user->esDocente() && 
               $item->clase->id_docente === $user->docente->id;
    }

    /**
     * Determinar si el usuario puede duplicar un item
     */
    public function duplicate(Usuario $user, ItemTienda $item)
    {
        // Solo el docente de la clase
        return $user->esDocente() && 
               $item->clase->id_docente === $user->docente->id;
    }

    /**
     * Determinar si el usuario puede ver el historial de compras del item
     */
    public function viewPurchaseHistory(Usuario $user, ItemTienda $item)
    {
        // Solo el docente de la clase
        return $user->esDocente() && 
               $item->clase->id_docente === $user->docente->id;
    }
}