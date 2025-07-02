<?php

// app/Http/Controllers/ActividadController.php
namespace App\Http\Controllers;

use App\Models\Actividad;
use App\Models\Clase;
use App\Models\TipoActividad;
use App\Models\EntregaActividad;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

class ActividadController extends Controller
{
    public function index($claseId)
    {
        $clase = Clase::findOrFail($claseId);
        $this->authorize('view', $clase);

        $actividades = Actividad::where('id_clase', $claseId)
            ->with(['tipoActividad'])
            ->when(auth()->user()->esEstudiante(), function($query) {
                $query->with(['entregas' => function($q) {
                    $q->where('id_estudiante', auth()->user()->estudiante->id);
                }]);
            })
            ->latest('created_at')
            ->get();

        return Inertia::render('Actividades/Index', [
            'clase' => $clase,
            'actividades' => $actividades,
            'esDocente' => auth()->user()->esDocente(),
        ]);
    }

    public function show($id)
    {
        $actividad = Actividad::with(['clase', 'tipoActividad'])
            ->findOrFail($id);

        $this->authorize('view', $actividad->clase);

        $user = auth()->user();

        if ($user->esDocente()) {
            // Para docentes: mostrar todas las entregas
            $entregas = EntregaActividad::where('id_actividad', $id)
                ->with(['estudiante.usuario'])
                ->latest('fecha_entrega')
                ->get();

            $estadisticas = [
                'total_estudiantes' => $actividad->clase->estudiantesActivos()->count(),
                'entregas_realizadas' => $entregas->count(),
                'porcentaje_entrega' => $actividad->porcentajeEntrega(),
                'promedio_notas' => $actividad->promedioNotas(),
                'entregas_tardias' => $entregas->filter(fn($e) => $e->fueEntregadaTarde())->count(),
            ];

            return Inertia::render('Actividades/ShowDocente', [
                'actividad' => $actividad,
                'entregas' => $entregas,
                'estadisticas' => $estadisticas,
            ]);
        } else {
            // Para estudiantes: mostrar su entrega
            $entrega = $actividad->entregaDeEstudiante($user->estudiante->id);
            
            return Inertia::render('Actividades/ShowEstudiante', [
                'actividad' => $actividad,
                'entrega' => $entrega,
                'puede_entregar' => !$entrega && $actividad->activa && !$actividad->estaVencida(),
            ]);
        }
    }

    public function create($claseId)
    {
        $clase = Clase::findOrFail($claseId);
        $this->authorize('update', $clase);

        $tiposActividad = TipoActividad::all();

        return Inertia::render('Actividades/Create', [
            'clase' => $clase,
            'tipos_actividad' => $tiposActividad,
        ]);
    }

    public function store(Request $request, $claseId)
    {
        $clase = Clase::findOrFail($claseId);
        $this->authorize('update', $clase);

        $request->validate([
            'titulo' => 'required|string|max:100',
            'descripcion' => 'nullable|string',
            'id_tipo_actividad' => 'required|exists:tipo_actividad,id',
            'fecha_inicio' => 'nullable|datetime',
            'fecha_entrega' => 'nullable|datetime|after:fecha_inicio',
            'puntos_experiencia' => 'required|integer|min:0|max:1000',
            'puntos_moneda' => 'required|integer|min:0|max:500',
        ]);

        Actividad::create([
            'id_clase' => $claseId,
            'titulo' => $request->titulo,
            'descripcion' => $request->descripcion,
            'id_tipo_actividad' => $request->id_tipo_actividad,
            'fecha_inicio' => $request->fecha_inicio,
            'fecha_entrega' => $request->fecha_entrega,
            'puntos_experiencia' => $request->puntos_experiencia,
            'puntos_moneda' => $request->puntos_moneda,
        ]);

        return redirect()->route('actividades.index', $claseId)
            ->with('success', 'Actividad creada exitosamente.');
    }

    public function edit($id)
    {
        $actividad = Actividad::with('clase')->findOrFail($id);
        $this->authorize('update', $actividad->clase);

        $tiposActividad = TipoActividad::all();

        return Inertia::render('Actividades/Edit', [
            'actividad' => $actividad,
            'tipos_actividad' => $tiposActividad,
        ]);
    }

    public function update(Request $request, $id)
    {
        $actividad = Actividad::with('clase')->findOrFail($id);
        $this->authorize('update', $actividad->clase);

        $request->validate([
            'titulo' => 'required|string|max:100',
            'descripcion' => 'nullable|string',
            'id_tipo_actividad' => 'required|exists:tipo_actividad,id',
            'fecha_inicio' => 'nullable|datetime',
            'fecha_entrega' => 'nullable|datetime|after:fecha_inicio',
            'puntos_experiencia' => 'required|integer|min:0|max:1000',
            'puntos_moneda' => 'required|integer|min:0|max:500',
            'activa' => 'boolean',
        ]);

        $actividad->update($request->validated());

        return redirect()->route('actividades.show', $actividad->id)
            ->with('success', 'Actividad actualizada exitosamente.');
    }

    public function entregar(Request $request, $id)
    {
        $actividad = Actividad::with('clase')->findOrFail($id);
        $this->authorize('view', $actividad->clase);

        abort_unless(auth()->user()->esEstudiante(), 403);

        $estudiante = auth()->user()->estudiante;

        // Verificar que el estudiante pertenece a la clase
        abort_unless($actividad->clase->estudiantes()->where('estudiante.id', $estudiante->id)->exists(), 403);

        // Verificar que no haya entregado ya
        if ($actividad->entregaDeEstudiante($estudiante->id)) {
            return back()->withErrors(['error' => 'Ya has entregado esta actividad.']);
        }

        // Verificar que la actividad esté activa
        if (!$actividad->activa) {
            return back()->withErrors(['error' => 'Esta actividad ya no está disponible.']);
        }

        $request->validate([
            'archivo' => 'nullable|file|max:10240|mimes:pdf,doc,docx,txt,jpg,jpeg,png',
        ]);

        $archivoPath = null;
        if ($request->hasFile('archivo')) {
            $archivoPath = $request->file('archivo')->store('entregas', 'public');
        }

        EntregaActividad::create([
            'id_actividad' => $actividad->id,
            'id_estudiante' => $estudiante->id,
            'archivo' => $archivoPath,
            'fecha_entrega' => now(),
        ]);

        return redirect()->route('actividades.show', $actividad->id)
            ->with('success', 'Actividad entregada exitosamente.');
    }

    public function calificar(Request $request, $entregaId)
    {
        $entrega = EntregaActividad::with(['actividad.clase'])->findOrFail($entregaId);
        $this->authorize('update', $entrega->actividad->clase);

        $request->validate([
            'nota' => 'required|numeric|min:0|max:20',
            'comentario' => 'nullable|string|max:1000',
        ]);

        $entrega->update([
            'nota' => $request->nota,
            'comentario' => $request->comentario,
        ]);

        return back()->with('success', 'Entrega calificada exitosamente.');
    }

    public function destroy($id)
    {
        $actividad = Actividad::with('clase')->findOrFail($id);
        $this->authorize('update', $actividad->clase);

        // Verificar si tiene entregas
        if ($actividad->entregas()->exists()) {
            return back()->withErrors([
                'error' => 'No se puede eliminar una actividad que tiene entregas.'
            ]);
        }

        $claseId = $actividad->id_clase;
        $actividad->delete();

        return redirect()->route('actividades.index', $claseId)
            ->with('success', 'Actividad eliminada exitosamente.');
    }
}
