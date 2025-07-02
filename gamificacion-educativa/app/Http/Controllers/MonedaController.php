<?php

namespace App\Http\Controllers;

use App\Models\TransaccionMoneda;
use App\Models\ItemTienda;
use App\Models\Estudiante;
use App\Models\Clase;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

class MonedaController extends Controller
{
      use AuthorizesRequests;
    
    /**
     * Obtener saldo de monedas de un estudiante en una clase
     */
    public function saldoEstudiante($estudianteId, $claseId)
    {
        $estudiante = Estudiante::findOrFail($estudianteId);
        $clase = Clase::findOrFail($claseId);

        // Verificar acceso
        $user = auth()->user();
        if ($user->esEstudiante() && $user->estudiante->id !== $estudianteId) {
            abort(403);
        }
        if ($user->esDocente() && $clase->id_docente !== $user->docente->id) {
            abort(403);
        }

        $saldo = $this->calcularSaldo($estudianteId, $claseId);
        
        $historialReciente = TransaccionMoneda::where('id_estudiante', $estudianteId)
            ->where('id_clase', $claseId)
            ->with('otorgadoPor.usuario')
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get();

        return response()->json([
            'saldo' => $saldo,
            'historial_reciente' => $historialReciente,
        ]);
    }

    /**
     * Mostrar tienda de la clase
     */
    public function tienda($claseId)
    {
        $clase = Clase::with('docente.usuario')->findOrFail($claseId);
        
        // Verificar acceso a la clase
        $this->authorize('view', $clase);

        $items = ItemTienda::where('id_clase', $claseId)
            ->where('disponible', true)
            ->orderBy('precio')
            ->get();

        $saldoEstudiante = 0;
        if (auth()->user()->esEstudiante()) {
            $saldoEstudiante = $this->calcularSaldo(auth()->user()->estudiante->id, $claseId);
        }

        return Inertia::render('Tienda/Index', [
            'clase' => $clase,
            'items' => $items,
            'saldo_estudiante' => $saldoEstudiante,
            'puede_gestionar' => auth()->user()->esDocente() && 
                               $clase->id_docente === auth()->user()->docente->id,
        ]);
    }

    /**
     * Estudiante compra un item
     */
    public function comprar(Request $request, $itemId)
    {
        abort_unless(auth()->user()->esEstudiante(), 403);

        $item = ItemTienda::findOrFail($itemId);
        $estudiante = auth()->user()->estudiante;

        // Verificar que el estudiante pertenece a la clase
        abort_unless(
            $estudiante->clases->contains($item->id_clase),
            403,
            'No perteneces a esta clase'
        );

        // Verificar disponibilidad
        if (!$item->disponible) {
            return back()->withErrors(['error' => 'Este item no está disponible.']);
        }

        // Verificar cantidad limitada
        if ($item->cantidad_limitada && $item->cantidad_disponible <= 0) {
            return back()->withErrors(['error' => 'Este item está agotado.']);
        }

        $saldoActual = $this->calcularSaldo($estudiante->id, $item->id_clase);

        // Verificar saldo suficiente
        if ($saldoActual < $item->precio) {
            return back()->withErrors(['error' => 'No tienes suficientes monedas.']);
        }

        DB::transaction(function () use ($item, $estudiante) {
            // Crear transacción de gasto
            TransaccionMoneda::create([
                'id_estudiante' => $estudiante->id,
                'id_clase' => $item->id_clase,
                'tipo' => 'gasto',
                'cantidad' => $item->precio,
                'descripcion' => 'Compra: ' . $item->nombre,
                'referencia_tipo' => 'item_tienda',
                'referencia_id' => $item->id,
            ]);

            // Reducir cantidad si es limitada
            if ($item->cantidad_limitada) {
                $item->decrement('cantidad_disponible');
                
                // Desactivar si se agota
                if ($item->cantidad_disponible <= 0) {
                    $item->update(['disponible' => false]);
                }
            }

            // Aplicar efecto del item según su tipo
            $this->aplicarEfectoItem($item, $estudiante);
        });

        // Crear notificación
        \App\Models\Notificacion::create([
            'id_usuario' => $estudiante->id_usuario,
            'titulo' => '🛒 Compra Realizada',
            'mensaje' => "Has comprado: {$item->nombre}",
            'tipo' => 'success',
            'datos' => json_encode([
                'item_id' => $item->id,
                'precio' => $item->precio,
                'tipo_item' => $item->tipo,
            ]),
        ]);

        return back()->with('success', '¡Compra realizada exitosamente!');
    }

    /**
     * Docente agrega monedas a un estudiante
     */
    public function agregarMonedas(Request $request, $estudianteId, $claseId)
    {
        $clase = Clase::findOrFail($claseId);
        $estudiante = Estudiante::findOrFail($estudianteId);

        abort_unless(
            auth()->user()->esDocente() && 
            $clase->id_docente === auth()->user()->docente->id,
            403
        );

        $validated = $request->validate([
            'cantidad' => 'required|integer|min:1|max:1000',
            'descripcion' => 'required|string|max:255',
        ]);

        TransaccionMoneda::create([
            'id_estudiante' => $estudianteId,
            'id_clase' => $claseId,
            'tipo' => 'ingreso',
            'cantidad' => $validated['cantidad'],
            'descripcion' => $validated['descripcion'],
            'referencia_tipo' => 'manual_docente',
            'otorgado_por' => auth()->user()->docente->id,
        ]);

        // Crear notificación para el estudiante
        \App\Models\Notificacion::create([
            'id_usuario' => $estudiante->id_usuario,
            'titulo' => '💰 Monedas Recibidas',
            'mensaje' => "Has recibido {$validated['cantidad']} monedas: {$validated['descripcion']}",
            'tipo' => 'success',
            'datos' => json_encode([
                'cantidad' => $validated['cantidad'],
                'docente' => auth()->user()->nombre,
            ]),
        ]);

        return back()->with('success', 'Monedas otorgadas exitosamente.');
    }

    /**
     * Crear item de tienda (solo docentes)
     */
    public function crearItem(Request $request, $claseId)
    {
        $clase = Clase::findOrFail($claseId);

        abort_unless(
            auth()->user()->esDocente() && 
            $clase->id_docente === auth()->user()->docente->id,
            403
        );

        $validated = $request->validate([
            'nombre' => 'required|string|max:100',
            'descripcion' => 'nullable|string',
            'precio' => 'required|integer|min:1|max:10000',
            'tipo' => 'required|string|in:avatar,privilegio,item_virtual,consumible',
            'imagen_url' => 'nullable|url',
            'cantidad_limitada' => 'boolean',
            'cantidad_disponible' => 'nullable|integer|min:0',
        ]);

        ItemTienda::create([
            'id_clase' => $claseId,
            'nombre' => $validated['nombre'],
            'descripcion' => $validated['descripcion'],
            'precio' => $validated['precio'],
            'tipo' => $validated['tipo'],
            'imagen_url' => $validated['imagen_url'],
            'cantidad_limitada' => $validated['cantidad_limitada'] ?? false,
            'cantidad_disponible' => $validated['cantidad_disponible'],
            'disponible' => true,
        ]);

        return back()->with('success', 'Item creado exitosamente.');
    }

    /**
     * Historial de transacciones de un estudiante
     */
    public function historial($estudianteId, $claseId)
    {
        $estudiante = Estudiante::findOrFail($estudianteId);
        $clase = Clase::findOrFail($claseId);

        // Verificar acceso
        $user = auth()->user();
        if ($user->esEstudiante() && $user->estudiante->id !== $estudianteId) {
            abort(403);
        }
        if ($user->esDocente() && $clase->id_docente !== $user->docente->id) {
            abort(403);
        }

        $transacciones = TransaccionMoneda::where('id_estudiante', $estudianteId)
            ->where('id_clase', $claseId)
            ->with('otorgadoPor.usuario')
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        $saldoActual = $this->calcularSaldo($estudianteId, $claseId);

        return Inertia::render('Monedas/Historial', [
            'estudiante' => $estudiante,
            'clase' => $clase,
            'transacciones' => $transacciones,
            'saldo_actual' => $saldoActual,
        ]);
    }

    /**
     * Calcular saldo actual de un estudiante en una clase
     */
    private function calcularSaldo($estudianteId, $claseId): int
    {
        $ingresos = TransaccionMoneda::where('id_estudiante', $estudianteId)
            ->where('id_clase', $claseId)
            ->where('tipo', 'ingreso')
            ->sum('cantidad');

        $gastos = TransaccionMoneda::where('id_estudiante', $estudianteId)
            ->where('id_clase', $claseId)
            ->where('tipo', 'gasto')
            ->sum('cantidad');

        return $ingresos - $gastos;
    }

    /**
     * Aplicar efecto de un item según su tipo
     */
    private function aplicarEfectoItem(ItemTienda $item, Estudiante $estudiante)
    {
        $personaje = $estudiante->personajeEnClase($item->id_clase);
        
        if (!$personaje) {
            return;
        }

        switch ($item->tipo) {
            case 'avatar':
                // Cambiar avatar del personaje
                $personaje->update(['avatar_base' => $item->nombre]);
                break;

            case 'privilegio':
                // Los privilegios se manejan a través de la lógica de negocio
                // Por ejemplo: asientos especiales, permisos extras, etc.
                break;

            case 'item_virtual':
                // Items decorativos o coleccionables
                // Se podría crear una tabla de inventario
                break;

            case 'consumible':
                // Items de un solo uso con efectos inmediatos
                // Por ejemplo: bonus de experiencia, protección contra penalizaciones
                break;
        }
    }

    /**
     * Otorgar monedas automáticamente (usado por otros servicios)
     */
    public static function otorgarMonedasAutomatico($estudianteId, $claseId, $cantidad, $descripcion, $referenciaTipo = null, $referenciaId = null, $docenteId = null)
    {
        TransaccionMoneda::create([
            'id_estudiante' => $estudianteId,
            'id_clase' => $claseId,
            'tipo' => 'ingreso',
            'cantidad' => $cantidad,
            'descripcion' => $descripcion,
            'referencia_tipo' => $referenciaTipo,
            'referencia_id' => $referenciaId,
            'otorgado_por' => $docenteId,
        ]);

        // Crear notificación
        $estudiante = Estudiante::find($estudianteId);
        \App\Models\Notificacion::create([
            'id_usuario' => $estudiante->id_usuario,
            'titulo' => '💰 Monedas Ganadas',
            'mensaje' => "Has ganado {$cantidad} monedas: {$descripcion}",
            'tipo' => 'success',
            'datos' => json_encode([
                'cantidad' => $cantidad,
                'tipo' => $referenciaTipo,
            ]),
        ]);
    }
}