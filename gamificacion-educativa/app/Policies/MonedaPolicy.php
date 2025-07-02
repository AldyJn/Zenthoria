<?php

namespace App\Policies;

use App\Models\Usuario;
use App\Models\TransaccionMoneda;
use App\Models\ItemTienda;
use App\Models\Clase;
use App\Models\Estudiante;
use Illuminate\Auth\Access\HandlesAuthorization;

class MonedaPolicy
{
    use HandlesAuthorization;

    /**
     * Determinar si el usuario puede ver el saldo de monedas
     */
    public function viewBalance(Usuario $user, Estudiante $estudiante, Clase $clase)
    {
        // El mismo estudiante puede ver su saldo
        if ($user->esEstudiante() && $user->estudiante->id === $estudiante->id) {
            return true;
        }

        // El docente de la clase puede ver saldos de sus estudiantes
        if ($user->esDocente() && $clase->id_docente === $user->docente->id) {
            return true;
        }

        return false;
    }

    /**
     * Determinar si el usuario puede agregar monedas
     */
    public function addCoins(Usuario $user, Clase $clase)
    {
        // Solo el docente de la clase puede agregar monedas
        return $user->esDocente() && $clase->id_docente === $user->docente->id;
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

        // Debe estar inscrito en la clase del item
        return $user->estudiante->clases()
            ->wherePivot('activo', true)
            ->where('clase.id', $item->id_clase)
            ->exists();
    }

    /**
     * Determinar si el usuario puede ver el historial de transacciones
     */
    public function viewTransactionHistory(Usuario $user, Estudiante $estudiante, Clase $clase)
    {
        // El mismo estudiante puede ver su historial
        if ($user->esEstudiante() && $user->estudiante->id === $estudiante->id) {
            return true;
        }

        // El docente de la clase puede ver historiales
        if ($user->esDocente() && $clase->id_docente === $user->docente->id) {
            return true;
        }

        return false;
    }

    /**
     * Determinar si el usuario puede crear items de tienda
     */
    public function createItem(Usuario $user, Clase $clase)
    {
        // Solo el docente de la clase puede crear items
        return $user->esDocente() && $clase->id_docente === $user->docente->id;
    }

    /**
     * Determinar si el usuario puede editar items de tienda
     */
    public function updateItem(Usuario $user, ItemTienda $item)
    {
        // Solo el docente de la clase puede editar items
        return $user->esDocente() && 
               $item->clase->id_docente === $user->docente->id;
    }

    /**
     * Determinar si el usuario puede eliminar items de tienda
     */
    public function deleteItem(Usuario $user, ItemTienda $item)
    {
        // Solo el docente de la clase puede eliminar items
        return $user->esDocente() && 
               $item->clase->id_docente === $user->docente->id;
    }

    /**
     * Determinar si el usuario puede ver una transacción específica
     */
    public function viewTransaction(Usuario $user, TransaccionMoneda $transaccion)
    {
        // El estudiante dueño de la transacción
        if ($user->esEstudiante() && $transaccion->id_estudiante === $user->estudiante->id) {
            return true;
        }

        // El docente de la clase
        if ($user->esDocente() && $transaccion->clase->id_docente === $user->docente->id) {
            return true;
        }

        return false;
    }

    /**
     * Determinar si el usuario puede revertir una transacción
     */
    public function revertTransaction(Usuario $user, TransaccionMoneda $transaccion)
    {
        // Solo el docente de la clase puede revertir transacciones
        return $user->esDocente() && 
               $transaccion->clase->id_docente === $user->docente->id;
    }

    /**
     * Determinar si el usuario puede ver estadísticas de monedas
     */
    public function viewCoinStats(Usuario $user, Clase $clase)
    {
        // Solo el docente de la clase
        return $user->esDocente() && $clase->id_docente === $user->docente->id;
    }

    /**
     * Determinar si el usuario puede ver la tienda
     */
    public function viewStore(Usuario $user, Clase $clase)
    {
        // El docente de la clase
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
     * Determinar si el usuario puede gestionar la tienda
     */
    public function manageStore(Usuario $user, Clase $clase)
    {
        // Solo el docente de la clase
        return $user->esDocente() && $clase->id_docente === $user->docente->id;
    }

    /**
     * Determinar si el usuario puede aplicar descuentos
     */
    public function applyDiscounts(Usuario $user, Clase $clase)
    {
        // Solo el docente de la clase
        return $user->esDocente() && $clase->id_docente === $user->docente->id;
    }

    /**
     * Determinar si el usuario puede configurar precios
     */
    public function configurePrices(Usuario $user, Clase $clase)
    {
        // Solo el docente de la clase
        return $user->esDocente() && $clase->id_docente === $user->docente->id;
    }

    /**
     * Determinar si el usuario puede otorgar monedas como recompensa
     */
    public function grantReward(Usuario $user, Clase $clase)
    {
        // Solo el docente de la clase
        return $user->esDocente() && $clase->id_docente === $user->docente->id;
    }

    /**
     * Determinar si el usuario puede quitar monedas (penalización)
     */
    public function deductCoins(Usuario $user, Clase $clase)
    {
        // Solo el docente de la clase
        return $user->esDocente() && $clase->id_docente === $user->docente->id;
    }

    /**
     * Determinar si el usuario puede transferir monedas entre estudiantes
     */
    public function transferCoins(Usuario $user, Clase $clase)
    {
        // Por defecto, no permitir transferencias entre estudiantes
        // Solo el docente puede facilitar transferencias si es necesario
        return $user->esDocente() && $clase->id_docente === $user->docente->id;
    }

    /**
     * Determinar si el usuario puede ver el ranking de monedas
     */
    public function viewCoinRanking(Usuario $user, Clase $clase)
    {
        // El docente de la clase
        if ($user->esDocente() && $clase->id_docente === $user->docente->id) {
            return true;
        }

        // Estudiantes de la clase si el ranking está configurado como público
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
     * Determinar si el usuario puede exportar datos de transacciones
     */
    public function exportTransactions(Usuario $user, Clase $clase)
    {
        // Solo el docente de la clase
        return $user->esDocente() && $clase->id_docente === $user->docente->id;
    }

    /**
     * Determinar si el usuario puede configurar límites de gasto
     */
    public function configureSpendingLimits(Usuario $user, Clase $clase)
    {
        // Solo el docente de la clase
        return $user->esDocente() && $clase->id_docente === $user->docente->id;
    }

    /**
     * Determinar si el usuario puede ver análisis de comportamiento de compra
     */
    public function viewPurchaseBehavior(Usuario $user, Clase $clase)
    {
        // Solo el docente de la clase
        return $user->esDocente() && $clase->id_docente === $user->docente->id;
    }

    /**
     * Determinar si el usuario puede activar/desactivar items de la tienda
     */
    public function toggleItemAvailability(Usuario $user, ItemTienda $item)
    {
        // Solo el docente de la clase
        return $user->esDocente() && 
               $item->clase->id_docente === $user->docente->id;
    }

    /**
     * Determinar si el usuario puede ver inventario de items limitados
     */
    public function viewInventory(Usuario $user, Clase $clase)
    {
        // Solo el docente de la clase
        return $user->esDocente() && $clase->id_docente === $user->docente->id;
    }

    /**
     * Determinar si el usuario puede restockear items limitados
     */
    public function restockItems(Usuario $user, Clase $clase)
    {
        // Solo el docente de la clase
        return $user->esDocente() && $clase->id_docente === $user->docente->id;
    }
}