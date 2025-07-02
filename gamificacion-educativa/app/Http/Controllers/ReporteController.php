<?php
// app/Http/Controllers/ReporteController.php
namespace App\Http\Controllers;

use App\Models\Clase;
use App\Models\Estudiante;
use App\Models\EstadisticaClase;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ReporteController extends Controller
{
    public function boletinEstudiante($estudianteId, $claseId)
    {
        $clase = Clase::with('docente.usuario')->findOrFail($claseId);
        $estudiante = Estudiante::with('usuario')->findOrFail($estudianteId);

        // Verificar permisos
        $user = auth()->user();
        if ($user->esEstudiante() && $user->estudiante->id != $estudianteId) {
            abort(403);
        }
        if ($user->esDocente() && $clase->id_docente != $user->docente->id) {
            abort(403);
        }

        $personaje = $estudiante->personajeEnClase($claseId);
        
        // Actividades y calificaciones
        $entregas = $estudiante->entregasActividad()
            ->whereHas('actividad', function($q) use ($claseId) {
                $q->where('id_clase', $claseId);
            })
            ->with(['actividad.tipoActividad'])
            ->whereNotNull('nota')
            ->get();

        // Comportamiento
        $comportamientos = $estudiante->registrosComportamiento()
            ->where('id_clase', $claseId)
            ->with('tipoComportamiento')
            ->latest('fecha')
            ->limit(10)
            ->get();

        // Asistencia
        $asistencia = [
            'porcentaje' => \App\Models\Asistencia::porcentajeAsistencia($estudianteId, $claseId),
            'total_clases' => $clase->asistencias()
                ->where('id_estudiante', $estudianteId)
                ->count(),
        ];

        $estadisticas = [
            'promedio_notas' => $entregas->avg('nota') ?? 0,
            'actividades_completadas' => $entregas->count(),
            'experiencia_total' => $personaje?->experiencia ?? 0,
            'nivel_actual' => $personaje?->nivel ?? 1,
            'puntos_comportamiento' => $comportamientos->sum(function($c) {
                return $c->tipoComportamiento->valor_puntos;
            }),
        ];

        return Inertia::render('Reportes/BoletinEstudiante', [
            'clase' => $clase,
            'estudiante' => $estudiante,
            'personaje' => $personaje,
            'entregas' => $entregas,
            'comportamientos' => $comportamientos,
            'asistencia' => $asistencia,
            'estadisticas' => $estadisticas,
            'esDocente' => $user->esDocente(),
        ]);
    }

    public function estadisticasClase($claseId)
    {
        $clase = Clase::with(['estudiantes', 'personajes.claseRpg'])->findOrFail($claseId);
        $this->authorize('view', $clase);

        // Actualizar estadísticas
        $estadisticas = EstadisticaClase::actualizarEstadisticas($claseId);

        // Datos adicionales
        $datosClase = [
            'total_estudiantes' => $clase->estudiantesActivos()->count(),
            'distribucion_clases_rpg' => $clase->personajes()
                ->join('clase_rpg', 'personaje.id_clase_rpg', '=', 'clase_rpg.id')
                ->selectRaw('clase_rpg.nombre, COUNT(*) as cantidad')
                ->groupBy('clase_rpg.nombre', 'clase_rpg.id')
                ->get(),
            'top_estudiantes' => $clase->personajes()
                ->with(['estudiante.usuario', 'claseRpg'])
                ->orderBy('experiencia', 'desc')
                ->limit(5)
                ->get(),
            'actividades_stats' => [
                'total' => $clase->actividades()->count(),
                'activas' => $clase->actividades()->where('activa', true)->count(),
                'promedio_entregas' => $clase->actividades()
                    ->withCount('entregas')
                    ->get()
                    ->avg('entregas_count'),
            ],
        ];

        return Inertia::render('Reportes/EstadisticasClase', [
            'clase' => $clase,
            'estadisticas' => $estadisticas,
            'datos_clase' => $datosClase,
            'esDocente' => auth()->user()->esDocente(),
        ]);
    }
}