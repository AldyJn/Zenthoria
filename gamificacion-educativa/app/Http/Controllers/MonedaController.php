<?php
namespace App\Http\Controllers;

use App\Models\TransaccionMoneda;
use App\Models\Estudiante;
use App\Models\Clase;
use App\Models\ItemTienda;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MonedaController extends Controller
{
    public function saldoEstudiante($estudianteId, $claseId)
    {
        $estudiante = Estudiante::findOrFail($estudianteId);
        $clase = Clase::findOrFail($claseId);

        // Verificar permisos
        if (auth()->user()->esEstudiante() && auth()->user()->estudiante->id !== $estudianteId) {
            abort(403);
        }

        $saldo = $this->calcularSaldo($estudianteId, $claseId);
        
        $transacciones = TransaccionMoneda::where('id_estudiante', $estudianteId)
            ->where('id_clase', $claseId)
            ->latest()
            ->limit(20)
            ->get();

        return Inertia::render('Monedas/Saldo', [
            'estudiante' => $estudiante,
            'clase' => $clase,
            'saldo_actual' => $saldo,
            'transacciones' => $transacciones,
        ]);
    }

    public function tienda($claseId)
    {
        $clase = Clase::findOrFail($claseId);
        $this->authorize('view', $clase);

        $items = ItemTienda::where('id_clase', $claseId)
            ->where('disponible', true)
            ->orderBy('precio')
            ->get();

        $saldoActual = 0;
        if (auth()->user()->esEstudiante()) {
            $saldoActual = $this->calcularSaldo(auth()->user()->estudiante->id, $claseId);
        }

        return Inertia::render('Monedas/Tienda', [
            'clase' => $clase,
            'items' => $items,
            'saldo_actual' => $saldoActual,
            'esDocente' => auth()->user()->esDocente(),
        ]);
    }

    public function comprar(Request $request, $itemId)
    {
        abort_unless(auth()->user()->esEstudiante(), 403);

        $item = ItemTienda::findOrFail($itemId);
        $estudiante = auth()->user()->estudiante;
        
        $saldoActual = $this->calcularSaldo($estudiante->id, $item->id_clase);

        if ($saldoActual < $item->precio) {
            return back()->withErrors([
                'error' => 'No tienes suficientes monedas para comprar este item.'
            ]);
        }

        // Crear transacción de compra
        TransaccionMoneda::create([
            'id_estudiante' => $estudiante->id,
            'id_clase' => $item->id_clase,
            'tipo' => 'gasto',
            'cantidad' => $item->precio,
            'descripcion' => "Compra: {$item->nombre}",
            'referencia_tipo' => 'item_tienda',
            'referencia_id' => $item->id,
        ]);

        return back()->with('success', "¡Has comprado {$item->nombre}!");
    }

    public function agregarMonedas(Request $request, $estudianteId, $claseId)
    {
        abort_unless(auth()->user()->esDocente(), 403);

        $clase = Clase::findOrFail($claseId);
        $this->authorize('update', $clase);

        $request->validate([
            'cantidad' => 'required|integer|min:1|max:500',
            'descripcion' => 'required|string|max:255',
        ]);

        TransaccionMoneda::create([
            'id_estudiante' => $estudianteId,
            'id_clase' => $claseId,
            'tipo' => 'ingreso',
            'cantidad' => $request->cantidad,
            'descripcion' => $request->descripcion,
            'otorgado_por' => auth()->user()->docente->id,
        ]);

        return back()->with('success', 'Monedas agregadas exitosamente.');
    }

    private function calcularSaldo($estudianteId, $claseId)
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
}