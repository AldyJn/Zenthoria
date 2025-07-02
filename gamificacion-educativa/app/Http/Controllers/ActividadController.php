<?php

namespace App\Http\Controllers;

use App\Models\Actividad;
use App\Models\TipoActividad;
use App\Models\Clase;
use App\Models\EntregaActividad;
use App\Models\Mision;
use App\Services\ExperienciaService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Carbon\Carbon;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

class ActividadController extends Controller
{
      use AuthorizesRequests;
    protected $experienciaService;

    public function __construct(ExperienciaService $experienciaService)
    {
        $this->experienciaService = $experienciaService;
    }

    /**
     * Lista de actividades de una clase
     */
    public function index($claseId)
    {
        $clase = Clase::with('docente.usuario')->findOrFail($claseId);
        
        // Verificar acceso
        $this->authorize('view', $clase);

        $actividades = Actividad::where('id_clase', $claseId)
            ->with(['tipoActividad', 'mision'])
            ->withCount('entregas')
            ->orderBy('fecha_entrega', 'desc')
            ->paginate(15);

        // Si es estudiante, agregar estado de entrega
        if (auth()->user()->esEstudiante()) {
            $estudianteId = auth()->user()->estudiante->id;
            $actividades->getCollection()->transform(function ($actividad) use ($estudianteId) {
                $entrega = EntregaActividad::where('id_actividad', $actividad->id)
                    ->where('id_estudiante', $estudianteId)
                    ->first();
                
                $actividad->mi_entrega = $entrega;
                $actividad->estado_entrega = $this->determinarEstadoEntrega($actividad, $entrega);
                return $actividad;
            });
        }

        return Inertia::render('Actividades/Index', [
            'clase' => $clase,
            'actividades' => $actividades,
            'puede_crear' => auth()->user()->esDocente() && 
                           $clase->id_docente === auth()->user()->docente->id,
        ]);
    }

    /**
     * Mostrar formulario de creación
     */
    public function create($claseId)
    {
        $clase = Clase::findOrFail($claseId);
        
        // Solo el docente de la clase puede crear actividades
        abort_unless(
            auth()->user()->esDocente() && 
            $clase->id_docente === auth()->user()->docente->id, 
            403
        );

        $tiposActividad = TipoActividad::all();
        $misiones = Mision::where('id_clase', $claseId)
            ->where('activa', true)
            ->orderBy('orden')
            ->get();

        return Inertia::render('Actividades/Create', [
            'clase' => $clase,
            'tipos_actividad' => $tiposActividad,
            'misiones' => $misiones,
        ]);
    }

    /**
     * Guardar nueva actividad
     */
    public function store(Request $request, $claseId)
    {
        $clase = Clase::findOrFail($claseId);
        
        abort_unless(
            auth()->user()->esDocente() && 
            $clase->id_docente === auth()->user()->docente->id, 
            403
        );

        $validated = $request->validate([
            'titulo' => 'required|string|max:100',
            'descripcion' => 'nullable|string',
            'id_tipo_actividad' => 'required|exists:tipo_actividad,id',
            'fecha_inicio' => 'nullable|date',
            'fecha_entrega' => 'nullable|date|after_or_equal:fecha_inicio',
            'puntos_experiencia' => 'integer|min:0|max:1000',
            'puntos_moneda' => 'integer|min:0|max:500',
            'id_mision' => 'nullable|exists:mision,id',
        ]);

        $actividad = Actividad::create([
            'id_clase' => $claseId,
            'titulo' => $validated['titulo'],
            'descripcion' => $validated['descripcion'],
            'id_tipo_actividad' => $validated['id_tipo_actividad'],
            'fecha_inicio' => $validated['fecha_inicio'],
            'fecha_entrega' => $validated['fecha_entrega'],
            'puntos_experiencia' => $validated['puntos_experiencia'] ?? 0,
            'puntos_moneda' => $validated['puntos_moneda'] ?? 0,
            'id_mision' => $validated['id_mision'],
            'activa' => true,
        ]);

        return redirect()
            ->route('actividades.show', $actividad->id)
            ->with('success', 'Actividad creada exitosamente.');
    }

    /**
     * Mostrar detalles de actividad
     */
    public function show($id)
    {
        $actividad = Actividad::with([
            'clase.docente.usuario',
            'tipoActividad',
            'mision',
            'entregas.estudiante.usuario'
        ])->findOrFail($id);

        $this->authorize('view', $actividad->clase);

        $estadisticas = [
            'total_entregas' => $actividad->entregas->count(),
            'entregas_calificadas' => $actividad->entregas->whereNotNull('nota')->count(),
            'promedio_nota' => $actividad->entregas->whereNotNull('nota')->avg('nota'),
            'entregas_tardias' => $actividad->entregas->where('fecha_entrega', '>', $actividad->fecha_entrega)->count(),
        ];

        // Si es estudiante, mostrar su entrega
        $miEntrega = null;
        if (auth()->user()->esEstudiante()) {
            $miEntrega = EntregaActividad::where('id_actividad', $id)
                ->where('id_estudiante', auth()->user()->estudiante->id)
                ->first();
        }

        return Inertia::render('Actividades/Show', [
            'actividad' => $actividad,
            'estadisticas' => $estadisticas,
            'mi_entrega' => $miEntrega,
            'puede_editar' => auth()->user()->esDocente() && 
                            $actividad->clase->id_docente === auth()->user()->docente->id,
            'puede_entregar' => auth()->user()->esEstudiante() && 
                              $actividad->activa && 
                              ($actividad->fecha_entrega === null || now() <= $actividad->fecha_entrega),
        ]);
    }

    /**
     * Mostrar formulario de edición
     */
    public function edit($id)
    {
        $actividad = Actividad::with(['clase', 'tipoActividad', 'mision'])->findOrFail($id);
        
        abort_unless(
            auth()->user()->esDocente() && 
            $actividad->clase->id_docente === auth()->user()->docente->id, 
            403
        );

        $tiposActividad = TipoActividad::all();
        $misiones = Mision::where('id_clase', $actividad->id_clase)
            ->where('activa', true)
            ->orderBy('orden')
            ->get();

        return Inertia::render('Actividades/Edit', [
            'actividad' => $actividad,
            'tipos_actividad' => $tiposActividad,
            'misiones' => $misiones,
        ]);
    }

    /**
     * Actualizar actividad
     */
    public function update(Request $request, $id)
    {
        $actividad = Actividad::findOrFail($id);
        
        abort_unless(
            auth()->user()->esDocente() && 
            $actividad->clase->id_docente === auth()->user()->docente->id, 
            403
        );

        $validated = $request->validate([
            'titulo' => 'required|string|max:100',
            'descripcion' => 'nullable|string',
            'id_tipo_actividad' => 'required|exists:tipo_actividad,id',
            'fecha_inicio' => 'nullable|date',
            'fecha_entrega' => 'nullable|date|after_or_equal:fecha_inicio',
            'puntos_experiencia' => 'integer|min:0|max:1000',
            'puntos_moneda' => 'integer|min:0|max:500',
            'id_mision' => 'nullable|exists:mision,id',
            'activa' => 'boolean',
        ]);

        $actividad->update($validated);

        return redirect()
            ->route('actividades.show', $actividad->id)
            ->with('success', 'Actividad actualizada exitosamente.');
    }

    /**
     * Eliminar actividad
     */
    public function destroy($id)
    {
        $actividad = Actividad::findOrFail($id);
        
        abort_unless(
            auth()->user()->esDocente() && 
            $actividad->clase->id_docente === auth()->user()->docente->id, 
            403
        );

        $claseId = $actividad->id_clase;
        
        // Eliminar archivos de entregas
        $entregas = EntregaActividad::where('id_actividad', $id)->get();
        foreach ($entregas as $entrega) {
            if ($entrega->archivo) {
                Storage::delete($entrega->archivo);
            }
        }

        $actividad->delete();

        return redirect()
            ->route('actividades.index', $claseId)
            ->with('success', 'Actividad eliminada exitosamente.');
    }

    /**
     * Estudiante entrega una actividad
     */
    public function entregar(Request $request, $id)
    {
        $actividad = Actividad::findOrFail($id);
        
        abort_unless(auth()->user()->esEstudiante(), 403);
        
        $estudiante = auth()->user()->estudiante;
        
        // Verificar que el estudiante pertenece a la clase
        abort_unless(
            $estudiante->clases->contains($actividad->id_clase), 
            403, 
            'No perteneces a esta clase'
        );

        // Verificar que la actividad esté activa
        abort_unless($actividad->activa, 400, 'Esta actividad ya no está disponible');

        $validated = $request->validate([
            'archivo' => 'nullable|file|max:10240', // 10MB máximo
            'comentario' => 'nullable|string|max:1000',
        ]);

        // Verificar si ya tiene entrega
        $entregaExistente = EntregaActividad::where('id_actividad', $id)
            ->where('id_estudiante', $estudiante->id)
            ->first();

        if ($entregaExistente) {
            return back()->withErrors(['error' => 'Ya has entregado esta actividad.']);
        }

        $rutaArchivo = null;
        if ($request->hasFile('archivo')) {
            $rutaArchivo = $request->file('archivo')->store(
                'entregas/' . $actividad->id_clase . '/' . $actividad->id,
                'public'
            );
        }

        EntregaActividad::create([
            'id_actividad' => $id,
            'id_estudiante' => $estudiante->id,
            'archivo' => $rutaArchivo,
            'comentario' => $validated['comentario'],
            'fecha_entrega' => now(),
        ]);

        return back()->with('success', 'Actividad entregada exitosamente.');
    }

    /**
     * Docente califica una entrega
     */
    public function calificar(Request $request, $entregaId)
    {
        $entrega = EntregaActividad::with('actividad.clase', 'estudiante.usuario')
            ->findOrFail($entregaId);
        
        abort_unless(
            auth()->user()->esDocente() && 
            $entrega->actividad->clase->id_docente === auth()->user()->docente->id, 
            403
        );

        $validated = $request->validate([
            'nota' => 'required|numeric|min:0|max:20',
            'comentario' => 'nullable|string|max:1000',
        ]);

        DB::transaction(function () use ($entrega, $validated) {
            // Actualizar la entrega
            $entrega->update([
                'nota' => $validated['nota'],
                'comentario' => $validated['comentario'],
            ]);

            // Otorgar experiencia y monedas si la nota es aprobatoria
            if ($validated['nota'] >= 11) { // Nota mínima aprobatoria
                $actividad = $entrega->actividad;
                $personaje = $entrega->estudiante->personajeEnClase($actividad->id_clase);
                
                if ($personaje) {
                    // Calcular experiencia proporcional a la nota
                    $porcentajeNota = min(100, ($validated['nota'] / 20) * 100);
                    $experiencia = round(($actividad->puntos_experiencia * $porcentajeNota) / 100);
                    
                    if ($experiencia > 0) {
                        $this->experienciaService->otorgarExperiencia(
                            $personaje,
                            $experiencia,
                            'Actividad completada: ' . $actividad->titulo
                        );
                    }

                    // Otorgar monedas si corresponde
                    if ($actividad->puntos_moneda > 0) {
                        $monedas = round(($actividad->puntos_moneda * $porcentajeNota) / 100);
                        // Aquí agregarías la lógica de monedas cuando implementes MonedaService
                    }
                }
            }
        });

        return back()->with('success', 'Entrega calificada exitosamente.');
    }

    /**
     * Determinar el estado de entrega de una actividad
     */
    private function determinarEstadoEntrega(Actividad $actividad, $entrega = null): string
    {
        if (!$entrega) {
            if ($actividad->fecha_entrega && now() > $actividad->fecha_entrega) {
                return 'no_entregada_vencida';
            }
            return 'pendiente';
        }

        if ($entrega->nota !== null) {
            return $entrega->nota >= 11 ? 'aprobada' : 'desaprobada';
        }

        if ($actividad->fecha_entrega && $entrega->fecha_entrega > $actividad->fecha_entrega) {
            return 'entregada_tarde';
        }

        return 'entregada_pendiente';
    }
}