<?php
// app/Http/Controllers/AsistenciaController.php
namespace App\Http\Controllers;

use App\Models\Asistencia;
use App\Models\Clase;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;

class AsistenciaController extends Controller
{
    public function index($claseId)
    {
        $clase = Clase::with(['estudiantes.usuario'])->findOrFail($claseId);
        $this->authorize('update', $clase);

        $fecha = request('fecha', today()->format('Y-m-d'));
        $fechaCarbon = Carbon::parse($fecha);

        $estudiantes = $clase->estudiantesActivos()->get();
        
        // Obtener asistencias del día
        $asistencias = Asistencia::where('id_clase', $claseId)
            ->where('fecha', $fechaCarbon)
            ->get()
            ->keyBy('id_estudiante');

        // Preparar datos con estado de asistencia
        $estudiantesConAsistencia = $estudiantes->map(function($estudiante) use ($asistencias) {
            $asistencia = $asistencias->get($estudiante->id);
            
            return [
                'estudiante' => $estudiante,
                'asistencia' => $asistencia,
                'presente' => $asistencia ? $asistencia->presente : null,
                'justificacion' => $asistencia ? $asistencia->justificacion : null,
            ];
        });

        return Inertia::render('Asistencia/Index', [
            'clase' => $clase,
            'fecha' => $fecha,
            'estudiantes_con_asistencia' => $estudiantesConAsistencia,
        ]);
    }

    public function marcar(Request $request, $claseId)
    {
        $clase = Clase::findOrFail($claseId);
        $this->authorize('update', $clase);

        $request->validate([
            'fecha' => 'required|date',
            'asistencias' => 'required|array',
            'asistencias.*.id_estudiante' => 'required|exists:estudiante,id',
            'asistencias.*.presente' => 'required|boolean',
            'asistencias.*.justificacion' => 'nullable|string|max:500',
        ]);

        $fecha = Carbon::parse($request->fecha);
        $docente = auth()->user()->docente;

        foreach ($request->asistencias as $asistenciaData) {
            Asistencia::updateOrCreate(
                [
                    'id_clase' => $claseId,
                    'id_estudiante' => $asistenciaData['id_estudiante'],
                    'fecha' => $fecha,
                ],
                [
                    'id_docente' => $docente->id,
                    'presente' => $asistenciaData['presente'],
                    'justificacion' => $asistenciaData['justificacion'],
                ]
            );
        }

        return back()->with('success', 'Asistencia registrada exitosamente.');
    }

    public function reporte($claseId)
    {
        $clase = Clase::with(['estudiantes.usuario'])->findOrFail($claseId);
        $this->authorize('view', $clase);

        $fechaInicio = request('fecha_inicio', now()->startOfMonth()->format('Y-m-d'));
        $fechaFin = request('fecha_fin', now()->format('Y-m-d'));

        $estudiantes = $clase->estudiantesActivos()->get();

        $reporteEstudiantes = $estudiantes->map(function($estudiante) use ($claseId, $fechaInicio, $fechaFin) {
            $asistencias = Asistencia::where('id_clase', $claseId)
                ->where('id_estudiante', $estudiante->id)
                ->whereBetween('fecha', [$fechaInicio, $fechaFin])
                ->get();

            $totalDias = $asistencias->count();
            $diasPresente = $asistencias->where('presente', true)->count();
            $diasAusente = $totalDias - $diasPresente;
            $porcentaje = $totalDias > 0 ? ($diasPresente / $totalDias) * 100 : 0;

            return [
                'estudiante' => $estudiante,
                'total_dias' => $totalDias,
                'dias_presente' => $diasPresente,
                'dias_ausente' => $diasAusente,
                'porcentaje_asistencia' => round($porcentaje, 1),
                'estado' => $this->determinarEstadoAsistencia($porcentaje),
            ];
        });

        $estadisticasGenerales = [
            'promedio_asistencia' => $reporteEstudiantes->avg('porcentaje_asistencia'),
            'estudiantes_riesgo' => $reporteEstudiantes->where('porcentaje_asistencia', '<', 75)->count(),
            'total_estudiantes' => $estudiantes->count(),
        ];

        return Inertia::render('Asistencia/Reporte', [
            'clase' => $clase,
            'reporte_estudiantes' => $reporteEstudiantes,
            'estadisticas_generales' => $estadisticasGenerales,
            'fecha_inicio' => $fechaInicio,
            'fecha_fin' => $fechaFin,
            'esDocente' => auth()->user()->esDocente(),
        ]);
    }

    public function estudianteReporte($estudianteId, $claseId)
    {
        $clase = Clase::findOrFail($claseId);
        $this->authorize('view', $clase);

        // Verificar que es su propio reporte si es estudiante
        if (auth()->user()->esEstudiante() && 
            auth()->user()->estudiante->id != $estudianteId) {
            abort(403);
        }

        $estudiante = $clase->estudiantes()->findOrFail($estudianteId);

        $fechaInicio = request('fecha_inicio', now()->startOfMonth()->format('Y-m-d'));
        $fechaFin = request('fecha_fin', now()->format('Y-m-d'));

        $asistencias = Asistencia::where('id_clase', $claseId)
            ->where('id_estudiante', $estudianteId)
            ->whereBetween('fecha', [$fechaInicio, $fechaFin])
            ->orderBy('fecha', 'desc')
            ->get();

        $estadisticas = [
            'total_dias' => $asistencias->count(),
            'dias_presente' => $asistencias->where('presente', true)->count(),
            'dias_ausente' => $asistencias->where('presente', false)->count(),
            'porcentaje_asistencia' => Asistencia::porcentajeAsistencia($estudianteId, $claseId, $fechaInicio, $fechaFin),
            'ausencias_justificadas' => $asistencias->where('presente', false)->whereNotNull('justificacion')->count(),
        ];

        return Inertia::render('Asistencia/EstudianteReporte', [
            'clase' => $clase,
            'estudiante' => $estudiante,
            'asistencias' => $asistencias,
            'estadisticas' => $estadisticas,
            'fecha_inicio' => $fechaInicio,
            'fecha_fin' => $fechaFin,
            'esDocente' => auth()->user()->esDocente(),
        ]);
    }

    private function determinarEstadoAsistencia($porcentaje)
    {
        if ($porcentaje >= 90) return 'Excelente';
        if ($porcentaje >= 80) return 'Bueno';
        if ($porcentaje >= 70) return 'Regular';
        return 'En Riesgo';
    }
}
