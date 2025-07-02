<?php

namespace App\Http\Controllers;

use App\Models\Mision;
use App\Models\Clase;
use App\Models\Actividad;
use App\Models\ProgresoMision;
use App\Services\ExperienciaService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Carbon\Carbon;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

class MisionController extends Controller
{
      use AuthorizesRequests;
    protected $experienciaService;

    public function __construct(ExperienciaService $experienciaService)
    {
        $this->experienciaService = $experienciaService;
    }

    /**
     * Lista de misiones de una clase
     */
    public function index($claseId)
    {
        $clase = Clase::with('docente.usuario')->findOrFail($claseId);
        
        // Verificar acceso
        $this->authorize('view', $clase);

        $misiones = Mision::where('id_clase', $claseId)
            ->withCount(['actividades'])
            ->orderBy('orden')
            ->orderBy('fecha_inicio')
            ->get();

        // Si es estudiante, agregar progreso
        if (auth()->user()->esEstudiante()) {
            $estudianteId = auth()->user()->estudiante->id;
            $misiones = $misiones->map(function ($mision) use ($estudianteId) {
                $progreso = ProgresoMision::where('id_mision', $mision->id)
                    ->where('id_estudiante', $estudianteId)
                    ->first();
                
                $mision->mi_progreso = $progreso;
                $mision->porcentaje_completado = $progreso ? $progreso->porcentaje_progreso : 0;
                $mision->completada = $progreso ? $progreso->completada : false;
                
                return $mision;
            });
        }

        return Inertia::render('Misiones/Index', [
            'clase' => $clase,
            'misiones' => $misiones,
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
        
        // Solo el docente de la clase puede crear misiones
        abort_unless(
            auth()->user()->esDocente() && 
            $clase->id_docente === auth()->user()->docente->id, 
            403
        );

        // Obtener el siguiente número de orden
        $siguienteOrden = Mision::where('id_clase', $claseId)->max('orden') + 1;

        return Inertia::render('Misiones/Create', [
            'clase' => $clase,
            'siguiente_orden' => $siguienteOrden,
        ]);
    }

    /**
     * Guardar nueva misión
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
            'descripcion' => 'required|string',
            'fecha_inicio' => 'nullable|date',
            'fecha_fin' => 'nullable|date|after_or_equal:fecha_inicio',
            'puntos_experiencia_bonus' => 'integer|min:0|max:1000',
            'puntos_moneda_bonus' => 'integer|min:0|max:500',
            'orden' => 'integer|min:0',
        ]);

        $mision = Mision::create([
            'id_clase' => $claseId,
            'titulo' => $validated['titulo'],
            'descripcion' => $validated['descripcion'],
            'fecha_inicio' => $validated['fecha_inicio'],
            'fecha_fin' => $validated['fecha_fin'],
            'puntos_experiencia_bonus' => $validated['puntos_experiencia_bonus'] ?? 0,
            'puntos_moneda_bonus' => $validated['puntos_moneda_bonus'] ?? 0,
            'orden' => $validated['orden'] ?? 0,
            'activa' => true,
        ]);

        return redirect()
            ->route('misiones.show', $mision->id)
            ->with('success', 'Misión creada exitosamente.');
    }

    /**
     * Mostrar detalles de misión
     */
    public function show($id)
    {
        $mision = Mision::with([
            'clase.docente.usuario',
            'actividades.tipoActividad',
            'actividades.entregas'
        ])->findOrFail($id);

        $this->authorize('view', $mision->clase);

        // Estadísticas generales
        $estadisticas = [
            'total_actividades' => $mision->actividades->count(),
            'estudiantes_clase' => $mision->clase->estudiantes->count(),
            'completada_por' => ProgresoMision::where('id_mision', $id)
                ->where('completada', true)
                ->count(),
        ];

        // Si es estudiante, mostrar su progreso específico
        $miProgreso = null;
        if (auth()->user()->esEstudiante()) {
            $estudianteId = auth()->user()->estudiante->id;
            $miProgreso = ProgresoMision::where('id_mision', $id)
                ->where('id_estudiante', $estudianteId)
                ->first();

            if (!$miProgreso) {
                // Crear progreso inicial si no existe
                $miProgreso = ProgresoMision::create([
                    'id_mision' => $id,
                    'id_estudiante' => $estudianteId,
                    'actividades_completadas' => 0,
                    'porcentaje_progreso' => 0,
                    'completada' => false,
                ]);
            }

            // Actualizar progreso actual
            $this->actualizarProgresoEstudiante($id, $estudianteId);
            $miProgreso->refresh();
        }

        // Si es docente, mostrar progreso de todos los estudiantes
        $progresoEstudiantes = null;
        if (auth()->user()->esDocente()) {
            $progresoEstudiantes = ProgresoMision::where('id_mision', $id)
                ->with('estudiante.usuario')
                ->orderBy('porcentaje_progreso', 'desc')
                ->get();
        }

        return Inertia::render('Misiones/Show', [
            'mision' => $mision,
            'estadisticas' => $estadisticas,
            'mi_progreso' => $miProgreso,
            'progreso_estudiantes' => $progresoEstudiantes,
            'puede_editar' => auth()->user()->esDocente() && 
                            $mision->clase->id_docente === auth()->user()->docente->id,
        ]);
    }

    /**
     * Mostrar formulario de edición
     */
    public function edit($id)
    {
        $mision = Mision::with('clase')->findOrFail($id);
        
        abort_unless(
            auth()->user()->esDocente() && 
            $mision->clase->id_docente === auth()->user()->docente->id, 
            403
        );

        return Inertia::render('Misiones/Edit', [
            'mision' => $mision,
        ]);
    }

    /**
     * Actualizar misión
     */
    public function update(Request $request, $id)
    {
        $mision = Mision::findOrFail($id);
        
        abort_unless(
            auth()->user()->esDocente() && 
            $mision->clase->id_docente === auth()->user()->docente->id, 
            403
        );

        $validated = $request->validate([
            'titulo' => 'required|string|max:100',
            'descripcion' => 'required|string',
            'fecha_inicio' => 'nullable|date',
            'fecha_fin' => 'nullable|date|after_or_equal:fecha_inicio',
            'puntos_experiencia_bonus' => 'integer|min:0|max:1000',
            'puntos_moneda_bonus' => 'integer|min:0|max:500',
            'orden' => 'integer|min:0',
            'activa' => 'boolean',
        ]);

        $mision->update($validated);

        return redirect()
            ->route('misiones.show', $mision->id)
            ->with('success', 'Misión actualizada exitosamente.');
    }

    /**
     * Eliminar misión
     */
    public function destroy($id)
    {
        $mision = Mision::findOrFail($id);
        
        abort_unless(
            auth()->user()->esDocente() && 
            $mision->clase->id_docente === auth()->user()->docente->id, 
            403
        );

        $claseId = $mision->id_clase;

        // Desasociar actividades de la misión
        Actividad::where('id_mision', $id)->update(['id_mision' => null]);

        $mision->delete();

        return redirect()
            ->route('misiones.index', $claseId)
            ->with('success', 'Misión eliminada exitosamente.');
    }

    /**
     * Actualizar progreso de un estudiante en una misión
     */
    public function actualizarProgresoEstudiante($misionId, $estudianteId)
    {
        $mision = Mision::with('actividades')->findOrFail($misionId);
        $totalActividades = $mision->actividades->count();
        
        if ($totalActividades === 0) {
            return;
        }

        // Contar actividades completadas (con nota aprobatoria)
        $actividadesCompletadas = $mision->actividades()
            ->whereHas('entregas', function($query) use ($estudianteId) {
                $query->where('id_estudiante', $estudianteId)
                      ->whereNotNull('nota')
                      ->where('nota', '>=', 11); // Nota mínima aprobatoria
            })
            ->count();

        $porcentaje = ($actividadesCompletadas / $totalActividades) * 100;
        $completada = $porcentaje >= 100;

        $progreso = ProgresoMision::updateOrCreate(
            [
                'id_mision' => $misionId, 
                'id_estudiante' => $estudianteId
            ],
            [
                'actividades_completadas' => $actividadesCompletadas,
                'porcentaje_progreso' => round($porcentaje, 2),
                'completada' => $completada,
                'fecha_completada' => $completada ? now() : null,
            ]
        );

        // Si completó la misión y no se han otorgado las recompensas
        if ($completada && (!$progreso->experiencia_bonus_otorgada || !$progreso->moneda_bonus_otorgada)) {
            $this->otorgarRecompensasMision($mision, $estudianteId, $progreso);
        }

        return $progreso;
    }

    /**
     * Otorgar recompensas por completar misión
     */
    private function otorgarRecompensasMision(Mision $mision, $estudianteId, ProgresoMision $progreso)
    {
        $estudiante = \App\Models\Estudiante::find($estudianteId);
        $personaje = $estudiante->personajeEnClase($mision->id_clase);

        if (!$personaje) {
            return;
        }

        DB::transaction(function () use ($mision, $personaje, $progreso) {
            // Otorgar experiencia bonus si no se ha otorgado
            if ($mision->puntos_experiencia_bonus > 0 && !$progreso->experiencia_bonus_otorgada) {
                $this->experienciaService->otorgarExperiencia(
                    $personaje,
                    $mision->puntos_experiencia_bonus,
                    'Misión completada: ' . $mision->titulo
                );

                $progreso->update(['experiencia_bonus_otorgada' => true]);
            }

            // Otorgar monedas bonus si no se ha otorgado
            if ($mision->puntos_moneda_bonus > 0 && !$progreso->moneda_bonus_otorgada) {
                // Aquí agregarías la lógica de monedas cuando implementes MonedaService
                $progreso->update(['moneda_bonus_otorgada' => true]);
            }
        });

        // Crear notificación de misión completada
        \App\Models\Notificacion::create([
            'id_usuario' => $personaje->estudiante->id_usuario,
            'titulo' => '🎯 ¡Misión Completada!',
            'mensaje' => "Has completado la misión: {$mision->titulo}",
            'tipo' => 'success',
            'datos' => json_encode([
                'mision_id' => $mision->id,
                'experiencia_ganada' => $mision->puntos_experiencia_bonus,
                'monedas_ganadas' => $mision->puntos_moneda_bonus,
            ]),
        ]);
    }

    /**
     * API: Actualizar progreso de todas las misiones activas
     */
    public function actualizarTodosLosProgresos($claseId)
    {
        abort_unless(auth()->user()->esDocente(), 403);

        $clase = Clase::findOrFail($claseId);
        abort_unless($clase->id_docente === auth()->user()->docente->id, 403);

        $misiones = Mision::where('id_clase', $claseId)
            ->where('activa', true)
            ->get();

        $estudiantes = $clase->estudiantes;

        foreach ($misiones as $mision) {
            foreach ($estudiantes as $estudiante) {
                $this->actualizarProgresoEstudiante($mision->id, $estudiante->id);
            }
        }

        return response()->json([
            'message' => 'Progreso actualizado para todas las misiones activas',
            'misiones_actualizadas' => $misiones->count(),
            'estudiantes_procesados' => $estudiantes->count(),
        ]);
    }
}