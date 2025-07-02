<?php

namespace App\Http\Controllers;

use App\Models\Badge;
use App\Models\EstudianteBadge;
use App\Models\Estudiante;
use App\Models\Clase;
use App\Models\Personaje;
use App\Models\EntregaActividad;
use App\Models\Asistencia;
use App\Models\RegistroComportamiento;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Carbon\Carbon;

class BadgeController extends Controller
{
    /**
     * Lista de badges del sistema
     */
    public function index()
    {
        abort_unless(auth()->user()->esDocente(), 403);

        $badges = Badge::where('activo', true)
            ->withCount('estudiantesBadges')
            ->orderBy('tipo')
            ->orderBy('valor_requerido')
            ->paginate(20);

        return Inertia::render('Badges/Index', [
            'badges' => $badges,
        ]);
    }

    /**
     * Crear nuevo badge
     */
    public function create()
    {
        abort_unless(auth()->user()->esDocente(), 403);

        $tiposBadge = [
            'nivel' => 'Alcanzar nivel específico',
            'actividades_completadas' => 'Completar número de actividades',
            'asistencia_perfecta' => 'Asistencia perfecta por días',
            'comportamiento_positivo' => 'Comportamientos positivos consecutivos',
            'primera_entrega' => 'Primera entrega de actividad',
            'experiencia_total' => 'Experiencia total acumulada',
            'racha_entregas' => 'Entregas consecutivas a tiempo',
            'participacion_activa' => 'Participaciones en clase',
        ];

        return Inertia::render('Badges/Create', [
            'tipos_badge' => $tiposBadge,
        ]);
    }

    /**
     * Guardar nuevo badge
     */
    public function store(Request $request)
    {
        abort_unless(auth()->user()->esDocente(), 403);

        $validated = $request->validate([
            'nombre' => 'required|string|max:100',
            'descripcion' => 'required|string',
            'tipo' => 'required|string|in:nivel,actividades_completadas,asistencia_perfecta,comportamiento_positivo,primera_entrega,experiencia_total,racha_entregas,participacion_activa',
            'valor_requerido' => 'required|integer|min:1',
            'imagen_url' => 'nullable|url',
            'criterio' => 'nullable|json',
        ]);

        Badge::create([
            'nombre' => $validated['nombre'],
            'descripcion' => $validated['descripcion'],
            'tipo' => $validated['tipo'],
            'valor_requerido' => $validated['valor_requerido'],
            'imagen_url' => $validated['imagen_url'],
            'criterio' => $validated['criterio'],
            'activo' => true,
        ]);

        return redirect()
            ->route('badges.index')
            ->with('success', 'Badge creado exitosamente.');
    }

    /**
     * Badges obtenidos por un estudiante en una clase
     */
    public function estudianteBadges($estudianteId, $claseId)
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

        $badgesObtenidos = EstudianteBadge::where('id_estudiante', $estudianteId)
            ->where('id_clase', $claseId)
            ->with('badge')
            ->orderBy('fecha_obtenido', 'desc')
            ->get();

        $badgesDisponibles = Badge::where('activo', true)
            ->whereNotIn('id', $badgesObtenidos->pluck('id_badge'))
            ->get();

        // Calcular progreso hacia badges disponibles
        $progresoBadges = $badgesDisponibles->map(function ($badge) use ($estudianteId, $claseId) {
            $progreso = $this->calcularProgresoBadge($badge, $estudianteId, $claseId);
            return [
                'badge' => $badge,
                'progreso_actual' => $progreso,
                'porcentaje' => min(100, ($progreso / $badge->valor_requerido) * 100),
                'completado' => $progreso >= $badge->valor_requerido,
            ];
        });

        return Inertia::render('Badges/EstudianteBadges', [
            'estudiante' => $estudiante,
            'clase' => $clase,
            'badges_obtenidos' => $badgesObtenidos,
            'progreso_badges' => $progresoBadges,
        ]);
    }

    /**
     * Verificar y otorgar badges automáticamente
     */
    public function verificarBadges($estudianteId, $claseId)
    {
        $estudiante = Estudiante::findOrFail($estudianteId);
        $clase = Clase::findOrFail($claseId);

        // Solo el docente de la clase o el mismo estudiante pueden verificar
        $user = auth()->user();
        if ($user->esEstudiante() && $user->estudiante->id !== $estudianteId) {
            abort(403);
        }
        if ($user->esDocente() && $clase->id_docente !== $user->docente->id) {
            abort(403);
        }

        $badgesOtorgados = $this->verificarYOtorgarBadges($estudianteId, $claseId);

        return response()->json([
            'badges_otorgados' => $badgesOtorgados,
            'total_nuevos' => count($badgesOtorgados),
        ]);
    }

    /**
     * Verificar y otorgar badges automáticamente (método interno)
     */
    public function verificarYOtorgarBadges($estudianteId, $claseId): array
    {
        $badgesDisponibles = Badge::where('activo', true)
            ->whereNotExists(function ($query) use ($estudianteId, $claseId) {
                $query->select(DB::raw(1))
                    ->from('estudiante_badge')
                    ->whereRaw('estudiante_badge.id_badge = badge.id')
                    ->where('estudiante_badge.id_estudiante', $estudianteId)
                    ->where('estudiante_badge.id_clase', $claseId);
            })
            ->get();

        $badgesOtorgados = [];

        foreach ($badgesDisponibles as $badge) {
            $progreso = $this->calcularProgresoBadge($badge, $estudianteId, $claseId);
            
            if ($progreso >= $badge->valor_requerido) {
                // Otorgar badge
                EstudianteBadge::create([
                    'id_estudiante' => $estudianteId,
                    'id_badge' => $badge->id,
                    'id_clase' => $claseId,
                    'fecha_obtenido' => now(),
                ]);

                $badgesOtorgados[] = $badge;

                // Crear notificación
                $estudiante = Estudiante::find($estudianteId);
                \App\Models\Notificacion::create([
                    'id_usuario' => $estudiante->id_usuario,
                    'titulo' => '🏆 ¡Badge Obtenido!',
                    'mensaje' => "Has obtenido el badge: {$badge->nombre}",
                    'tipo' => 'success',
                    'datos' => json_encode([
                        'badge_id' => $badge->id,
                        'badge_nombre' => $badge->nombre,
                        'clase_id' => $claseId,
                    ]),
                ]);

                // Otorgar experiencia bonus por badge (opcional)
                $this->otorgarExperienciaPorBadge($badge, $estudianteId, $claseId);
            }
        }

        return $badgesOtorgados;
    }

    /**
     * Calcular progreso hacia un badge específico
     */
    private function calcularProgresoBadge(Badge $badge, $estudianteId, $claseId): int
    {
        $personaje = Personaje::where('id_estudiante', $estudianteId)
            ->where('id_clase', $claseId)
            ->first();

        if (!$personaje) {
            return 0;
        }

        switch ($badge->tipo) {
            case 'nivel':
                return $personaje->nivel;

            case 'experiencia_total':
                return $personaje->experiencia;

            case 'actividades_completadas':
                return EntregaActividad::where('id_estudiante', $estudianteId)
                    ->whereHas('actividad', function($q) use ($claseId) {
                        $q->where('id_clase', $claseId);
                    })
                    ->whereNotNull('nota')
                    ->where('nota', '>=', 11)
                    ->count();

            case 'asistencia_perfecta':
                return $this->calcularDiasAsistenciaPerfecta($estudianteId, $claseId);

            case 'comportamiento_positivo':
                return $this->calcularComportamientosPositivosConsecutivos($estudianteId, $claseId);

            case 'primera_entrega':
                $primeraEntrega = EntregaActividad::where('id_estudiante', $estudianteId)
                    ->whereHas('actividad', function($q) use ($claseId) {
                        $q->where('id_clase', $claseId);
                    })
                    ->first();
                return $primeraEntrega ? 1 : 0;

            case 'racha_entregas':
                return $this->calcularRachaEntregasATiempo($estudianteId, $claseId);

            case 'participacion_activa':
                return RegistroComportamiento::where('id_estudiante', $estudianteId)
                    ->where('id_clase', $claseId)
                    ->whereHas('tipoComportamiento', function($q) {
                        $q->where('nombre', 'like', '%participacion%')
                          ->orWhere('nombre', 'like', '%pregunta%');
                    })
                    ->count();

            default:
                return 0;
        }
    }

    /**
     * Calcular días de asistencia perfecta consecutivos
     */
    private function calcularDiasAsistenciaPerfecta($estudianteId, $claseId): int
    {
        $asistencias = Asistencia::where('id_estudiante', $estudianteId)
            ->where('id_clase', $claseId)
            ->orderBy('fecha', 'desc')
            ->get();

        $diasConsecutivos = 0;
        foreach ($asistencias as $asistencia) {
            if ($asistencia->presente) {
                $diasConsecutivos++;
            } else {
                break;
            }
        }

        return $diasConsecutivos;
    }

    /**
     * Calcular comportamientos positivos consecutivos
     */
    private function calcularComportamientosPositivosConsecutivos($estudianteId, $claseId): int
    {
        $comportamientos = RegistroComportamiento::where('id_estudiante', $estudianteId)
            ->where('id_clase', $claseId)
            ->with('tipoComportamiento')
            ->orderBy('fecha', 'desc')
            ->get();

        $consecutivos = 0;
        foreach ($comportamientos as $comportamiento) {
            if ($comportamiento->tipoComportamiento->valor_puntos > 0) {
                $consecutivos++;
            } else {
                break;
            }
        }

        return $consecutivos;
    }

    /**
     * Calcular racha de entregas a tiempo
     */
    private function calcularRachaEntregasATiempo($estudianteId, $claseId): int
    {
        $entregas = EntregaActividad::where('id_estudiante', $estudianteId)
            ->whereHas('actividad', function($q) use ($claseId) {
                $q->where('id_clase', $claseId);
            })
            ->with('actividad')
            ->orderBy('fecha_entrega', 'desc')
            ->get();

        $racha = 0;
        foreach ($entregas as $entrega) {
            $fechaLimite = $entrega->actividad->fecha_entrega;
            if ($fechaLimite && $entrega->fecha_entrega <= $fechaLimite) {
                $racha++;
            } else {
                break;
            }
        }

        return $racha;
    }

    /**
     * Otorgar experiencia bonus por obtener badge
     */
    private function otorgarExperienciaPorBadge(Badge $badge, $estudianteId, $claseId)
    {
        $personaje = Personaje::where('id_estudiante', $estudianteId)
            ->where('id_clase', $claseId)
            ->first();

        if (!$personaje) {
            return;
        }

        // Experiencia bonus basada en la dificultad del badge
        $experienciaBonus = min(100, $badge->valor_requerido * 2);

        $experienciaService = app(\App\Services\ExperienciaService::class);
        $experienciaService->otorgarExperiencia(
            $personaje,
            $experienciaBonus,
            "Badge obtenido: {$badge->nombre}"
        );
    }

    /**
     * Verificar badges para todos los estudiantes de una clase (comando del docente)
     */
    public function verificarBadgesClase($claseId)
    {
        $clase = Clase::findOrFail($claseId);
        
        abort_unless(
            auth()->user()->esDocente() && 
            $clase->id_docente === auth()->user()->docente->id,
            403
        );

        $estudiantes = $clase->estudiantes;
        $totalBadgesOtorgados = 0;

        foreach ($estudiantes as $estudiante) {
            $badges = $this->verificarYOtorgarBadges($estudiante->id, $claseId);
            $totalBadgesOtorgados += count($badges);
        }

        return response()->json([
            'message' => 'Verificación de badges completada',
            'estudiantes_procesados' => $estudiantes->count(),
            'badges_otorgados' => $totalBadgesOtorgados,
        ]);
    }
}