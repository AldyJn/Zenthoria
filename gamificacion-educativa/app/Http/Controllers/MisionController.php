<?php

// app/Http/Controllers/MisionController.php
namespace App\Http\Controllers;

use App\Models\Mision;
use App\Models\Clase;
use App\Models\Actividad;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MisionController extends Controller
{
    public function index($claseId)
    {
        $clase = Clase::findOrFail($claseId);
        $this->authorize('view', $clase);

        $misiones = Mision::where('id_clase', $claseId)
            ->withCount('actividades')
            ->latest()
            ->get();

        return Inertia::render('Misiones/Index', [
            'clase' => $clase,
            'misiones' => $misiones,
            'esDocente' => auth()->user()->esDocente(),
        ]);
    }

    public function show($id)
    {
        $mision = Mision::with(['clase', 'actividades.tipoActividad'])
            ->findOrFail($id);

        $this->authorize('view', $mision->clase);

        $user = auth()->user();
        $progreso = null;

        if ($user->esEstudiante()) {
            $progreso = $this->calcularProgresoEstudiante($mision, $user->estudiante);
        }

        return Inertia::render('Misiones/Show', [
            'mision' => $mision,
            'progreso' => $progreso,
            'esDocente' => $user->esDocente(),
        ]);
    }

    public function create($claseId)
    {
        $clase = Clase::findOrFail($claseId);
        $this->authorize('update', $clase);

        return Inertia::render('Misiones/Create', [
            'clase' => $clase,
        ]);
    }

    public function store(Request $request, $claseId)
    {
        $clase = Clase::findOrFail($claseId);
        $this->authorize('update', $clase);

        $request->validate([
            'titulo' => 'required|string|max:100',
            'descripcion' => 'required|string|max:1000',
            'fecha_inicio' => 'nullable|date',
            'fecha_fin' => 'nullable|date|after:fecha_inicio',
            'puntos_experiencia_bonus' => 'nullable|integer|min:0|max:500',
            'puntos_moneda_bonus' => 'nullable|integer|min:0|max:200',
        ]);

        $mision = Mision::create([
            'id_clase' => $claseId,
            'titulo' => $request->titulo,
            'descripcion' => $request->descripcion,
            'fecha_inicio' => $request->fecha_inicio,
            'fecha_fin' => $request->fecha_fin,
            'puntos_experiencia_bonus' => $request->puntos_experiencia_bonus ?? 0,
            'puntos_moneda_bonus' => $request->puntos_moneda_bonus ?? 0,
        ]);

        return redirect()->route('misiones.show', $mision->id)
            ->with('success', 'Misión creada exitosamente.');
    }

    public function edit($id)
    {
        $mision = Mision::with('clase')->findOrFail($id);
        $this->authorize('update', $mision->clase);

        return Inertia::render('Misiones/Edit', [
            'mision' => $mision,
        ]);
    }

    public function update(Request $request, $id)
    {
        $mision = Mision::with('clase')->findOrFail($id);
        $this->authorize('update', $mision->clase);

        $request->validate([
            'titulo' => 'required|string|max:100',
            'descripcion' => 'required|string|max:1000',
            'fecha_inicio' => 'nullable|date',
            'fecha_fin' => 'nullable|date|after:fecha_inicio',
            'puntos_experiencia_bonus' => 'nullable|integer|min:0|max:500',
            'puntos_moneda_bonus' => 'nullable|integer|min:0|max:200',
            'activa' => 'boolean',
        ]);

        $mision->update($request->validated());

        return redirect()->route('misiones.show', $mision->id)
            ->with('success', 'Misión actualizada exitosamente.');
    }

    public function destroy($id)
    {
        $mision = Mision::with('clase')->findOrFail($id);
        $this->authorize('update', $mision->clase);

        if ($mision->actividades()->exists()) {
            return back()->withErrors([
                'error' => 'No se puede eliminar una misión que tiene actividades asociadas.'
            ]);
        }

        $claseId = $mision->id_clase;
        $mision->delete();

        return redirect()->route('misiones.index', $claseId)
            ->with('success', 'Misión eliminada exitosamente.');
    }

    private function calcularProgresoEstudiante($mision, $estudiante)
    {
        $totalActividades = $mision->actividades()->count();
        
        if ($totalActividades === 0) {
            return [
                'total_actividades' => 0,
                'completadas' => 0,
                'porcentaje' => 0,
                'mision_completada' => false,
            ];
        }

        $actividadesCompletadas = $mision->actividades()
            ->whereHas('entregas', function($query) use ($estudiante) {
                $query->where('id_estudiante', $estudiante->id)
                      ->whereNotNull('nota');
            })
            ->count();

        $porcentaje = ($actividadesCompletadas / $totalActividades) * 100;
        $misionCompletada = $porcentaje === 100;

        return [
            'total_actividades' => $totalActividades,
            'completadas' => $actividadesCompletadas,
            'porcentaje' => round($porcentaje, 1),
            'mision_completada' => $misionCompletada,
        ];
    }
}
