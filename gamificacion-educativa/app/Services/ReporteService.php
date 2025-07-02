<?php

namespace App\Services;

use App\Models\Clase;
use App\Models\Personaje;
use App\Models\RegistroComportamiento;
use App\Models\EntregaActividad;
use App\Models\Asistencia;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Collection;
use Carbon\Carbon;

class ReporteService
{
    /**
     * Genera reporte completo de un estudiante
     */
    public function generarReporteEstudiante(int $estudianteId, int $claseId, array $parametros = []): array
    {
        $fechaInicio = isset($parametros['fecha_inicio']) 
            ? Carbon::parse($parametros['fecha_inicio']) 
            : Carbon::now()->subMonths(3);
            
        $fechaFin = isset($parametros['fecha_fin']) 
            ? Carbon::parse($parametros['fecha_fin']) 
            : Carbon::now();
        
        $personaje = Personaje::where('id_estudiante', $estudianteId)
            ->where('id_clase', $claseId)
            ->with(['estudiante.usuario', 'clase', 'claseRpg', 'estadisticas'])
            ->firstOrFail();
        
        return [
            'informacion_estudiante' => $this->obtenerInformacionEstudiante($personaje),
            'rendimiento_academico' => $this->calcularRendimientoAcademico($estudianteId, $claseId, $fechaInicio, $fechaFin),
            'comportamiento' => $this->analizarComportamiento($estudianteId, $claseId, $fechaInicio, $fechaFin),
            'asistencia' => $this->calcularAsistencia($estudianteId, $claseId, $fechaInicio, $fechaFin),
            'progreso_gamificacion' => $this->analizarProgresoGameficacion($personaje, $fechaInicio, $fechaFin),
            'comparativa_clase' => $this->compararConClase($personaje),
            'recomendaciones' => $this->generarRecomendaciones($estudianteId, $claseId),
            'periodo' => [
                'fecha_inicio' => $fechaInicio->format('Y-m-d'),
                'fecha_fin' => $fechaFin->format('Y-m-d'),
            ],
        ];
    }
    
    /**
     * Genera reporte general de una clase
     */
    public function generarReporteClase(int $claseId, array $parametros = []): array
    {
        $fechaInicio = isset($parametros['fecha_inicio']) 
            ? Carbon::parse($parametros['fecha_inicio']) 
            : Carbon::now()->subMonths(3);
            
        $fechaFin = isset($parametros['fecha_fin']) 
            ? Carbon::parse($parametros['fecha_fin']) 
            : Carbon::now();
        
        $clase = Clase::with(['docente.usuario'])->findOrFail($claseId);
        
        return [
            'informacion_clase' => $this->obtenerInformacionClase($clase),
            'estadisticas_generales' => $this->calcularEstadisticasGeneralesClase($claseId, $fechaInicio, $fechaFin),
            'distribucion_niveles' => $this->analizarDistribucionNiveles($claseId),
            'rendimiento_promedio' => $this->calcularRendimientoPromedioClase($claseId, $fechaInicio, $fechaFin),
            'comportamiento_clase' => $this->analizarComportamientoClase($claseId, $fechaInicio, $fechaFin),
            'asistencia_clase' => $this->calcularAsistenciaClase($claseId, $fechaInicio, $fechaFin),
            'actividades_rendimiento' => $this->analizarRendimientoActividades($claseId, $fechaInicio, $fechaFin),
            'estudiantes_destacados' => $this->identificarEstudiantesDestacados($claseId),
            'estudiantes_riesgo' => $this->identificarEstudiantesEnRiesgo($claseId),
            'tendencias_temporales' => $this->analizarTendenciasTiempo($claseId, $fechaInicio, $fechaFin),
            'periodo' => [
                'fecha_inicio' => $fechaInicio->format('Y-m-d'),
                'fecha_fin' => $fechaFin->format('Y-m-d'),
            ],
        ];
    }
    
    /**
     * Obtiene información básica del estudiante
     */
    private function obtenerInformacionEstudiante(Personaje $personaje): array
    {
        return [
            'nombre' => $personaje->estudiante->usuario->nombre,
            'codigo_estudiante' => $personaje->estudiante->codigo_estudiante,
            'clase' => $personaje->clase->nombre,
            'grado' => $personaje->clase->grado,
            'seccion' => $personaje->clase->seccion,
            'personaje' => [
                'nombre' => $personaje->nombre,
                'clase_rpg' => $personaje->claseRpg->nombre,
                'nivel' => $personaje->nivel,
                'experiencia' => $personaje->experiencia,
                'avatar_base' => $personaje->avatar_base,
            ],
        ];
    }
    
    /**
     * Calcula el rendimiento académico del estudiante
     */
    private function calcularRendimientoAcademico(int $estudianteId, int $claseId, Carbon $fechaInicio, Carbon $fechaFin): array
    {
        $entregas = EntregaActividad::join('actividad', 'entrega_actividad.id_actividad', '=', 'actividad.id')
            ->where('entrega_actividad.id_estudiante', $estudianteId)
            ->where('actividad.id_clase', $claseId)
            ->whereBetween('entrega_actividad.fecha_entrega', [$fechaInicio, $fechaFin])
            ->whereNotNull('entrega_actividad.nota')
            ->select('entrega_actividad.*', 'actividad.titulo', 'actividad.puntos_experiencia')
            ->get();
        
        $totalActividades = DB::table('actividad')
            ->where('id_clase', $claseId)
            ->whereBetween('created_at', [$fechaInicio, $fechaFin])
            ->count();
        
        $actividadesEntregadas = $entregas->count();
        $promedio = $entregas->avg('nota') ?? 0;
        $notaMaxima = $entregas->max('nota') ?? 0;
        $notaMinima = $entregas->min('nota') ?? 0;
        
        return [
            'total_actividades_disponibles' => $totalActividades,
            'actividades_entregadas' => $actividadesEntregadas,
            'porcentaje_entrega' => $totalActividades > 0 ? round(($actividadesEntregadas / $totalActividades) * 100, 2) : 0,
            'promedio_notas' => round($promedio, 2),
            'nota_maxima' => $notaMaxima,
            'nota_minima' => $notaMinima,
            'entregas_por_mes' => $this->agruparEntregasPorMes($entregas),
            'tendencia_notas' => $this->calcularTendenciaNotas($entregas),
        ];
    }
    
    /**
     * Analiza el comportamiento del estudiante
     */
    private function analizarComportamiento(int $estudianteId, int $claseId, Carbon $fechaInicio, Carbon $fechaFin): array
    {
        $comportamientos = RegistroComportamiento::join('tipo_comportamiento', 'registro_comportamiento.id_tipo_comportamiento', '=', 'tipo_comportamiento.id')
            ->where('registro_comportamiento.id_estudiante', $estudianteId)
            ->where('registro_comportamiento.id_clase', $claseId)
            ->whereBetween('registro_comportamiento.fecha', [$fechaInicio, $fechaFin])
            ->select('registro_comportamiento.*', 'tipo_comportamiento.nombre as tipo_nombre', 'tipo_comportamiento.valor_puntos')
            ->get();
        
        $comportamientosPositivos = $comportamientos->where('valor_puntos', '>', 0);
        $comportamientosNegativos = $comportamientos->where('valor_puntos', '<', 0);
        
        $puntosPositivos = $comportamientosPositivos->sum('valor_puntos');
        $puntosNegativos = abs($comportamientosNegativos->sum('valor_puntos'));
        
        return [
            'total_registros' => $comportamientos->count(),
            'comportamientos_positivos' => $comportamientosPositivos->count(),
            'comportamientos_negativos' => $comportamientosNegativos->count(),
            'puntos_positivos' => $puntosPositivos,
            'puntos_negativos' => $puntosNegativos,
            'puntos_netos' => $puntosPositivos - $puntosNegativos,
            'tipos_mas_frecuentes' => $this->obtenerTiposComportamientoMasFrecuentes($comportamientos),
            'distribucion_por_mes' => $this->agruparComportamientosPorMes($comportamientos),
            'ratio_positivo_negativo' => $comportamientosNegativos->count() > 0 
                ? round($comportamientosPositivos->count() / $comportamientosNegativos->count(), 2) 
                : null,
        ];
    }
    
    /**
     * Calcula la asistencia del estudiante
     */
    private function calcularAsistencia(int $estudianteId, int $claseId, Carbon $fechaInicio, Carbon $fechaFin): array
    {
        $registrosAsistencia = Asistencia::where('id_estudiante', $estudianteId)
            ->where('id_clase', $claseId)
            ->whereBetween('fecha', [$fechaInicio, $fechaFin])
            ->get();
        
        $totalDias = $registrosAsistencia->count();
        $diasPresente = $registrosAsistencia->where('presente', true)->count();
        $diasAusente = $totalDias - $diasPresente;
        
        return [
            'total_dias_registrados' => $totalDias,
            'dias_presente' => $diasPresente,
            'dias_ausente' => $diasAusente,
            'porcentaje_asistencia' => $totalDias > 0 ? round(($diasPresente / $totalDias) * 100, 2) : 0,
            'ausencias_por_mes' => $this->agruparAsistenciaPorMes($registrosAsistencia),
            'ausencias_justificadas' => $registrosAsistencia->where('presente', false)->whereNotNull('justificacion')->count(),
        ];
    }
    
    /**
     * Analiza el progreso de gamificación
     */
    private function analizarProgresoGameficacion(Personaje $personaje, Carbon $fechaInicio, Carbon $fechaFin): array
    {
        $experienciaInicial = $this->obtenerExperienciaEnFecha($personaje, $fechaInicio);
        $experienciaActual = $personaje->experiencia;
        $experienciaGanada = $experienciaActual - $experienciaInicial;
        
        return [
            'nivel_actual' => $personaje->nivel,
            'experiencia_actual' => $experienciaActual,
            'experiencia_ganada_periodo' => $experienciaGanada,
            'promedio_experiencia_diaria' => $this->calcularPromedioExperienciaDiaria($personaje, $fechaInicio, $fechaFin),
            'actividades_completadas' => $personaje->estadisticas->actividades_completadas ?? 0,
            'misiones_completadas' => $personaje->estadisticas->misiones_completadas ?? 0,
            'progreso_nivel_actual' => $this->calcularProgresoNivelActual($personaje),
        ];
    }
    
    /**
     * Compara el rendimiento con la clase
     */
    private function compararConClase(Personaje $personaje): array
    {
        $personajesClase = Personaje::where('id_clase', $personaje->id_clase)->get();
        
        $nivelPromedio = $personajesClase->avg('nivel');
        $experienciaPromedio = $personajesClase->avg('experiencia');
        
        $posicionNivel = $personajesClase->where('nivel', '>', $personaje->nivel)->count() + 1;
        $posicionExperiencia = $personajesClase->where('experiencia', '>', $personaje->experiencia)->count() + 1;
        
        return [
            'nivel_vs_promedio' => round($personaje->nivel - $nivelPromedio, 2),
            'experiencia_vs_promedio' => round($personaje->experiencia - $experienciaPromedio, 2),
            'posicion_nivel' => $posicionNivel,
            'posicion_experiencia' => $posicionExperiencia,
            'total_estudiantes' => $personajesClase->count(),
            'percentil_nivel' => round((($personajesClase->count() - $posicionNivel + 1) / $personajesClase->count()) * 100, 2),
            'percentil_experiencia' => round((($personajesClase->count() - $posicionExperiencia + 1) / $personajesClase->count()) * 100, 2),
        ];
    }
    
    /**
     * Genera recomendaciones personalizadas
     */
    private function generarRecomendaciones(int $estudianteId, int $claseId): array
    {
        $recomendaciones = [];
        
        // Analizar asistencia
        $asistencia = $this->calcularAsistencia($estudianteId, $claseId, Carbon::now()->subDays(30), Carbon::now());
        if ($asistencia['porcentaje_asistencia'] < 80) {
            $recomendaciones[] = [
                'tipo' => 'asistencia',
                'prioridad' => 'alta',
                'mensaje' => 'Mejorar asistencia a clases. Tu porcentaje actual es de ' . $asistencia['porcentaje_asistencia'] . '%',
                'accion_sugerida' => 'Establecer recordatorios y revisar horarios',
            ];
        }
        
        // Analizar comportamiento
        $comportamiento = $this->analizarComportamiento($estudianteId, $claseId, Carbon::now()->subDays(30), Carbon::now());
        if ($comportamiento['puntos_netos'] < 0) {
            $recomendaciones[] = [
                'tipo' => 'comportamiento',
                'prioridad' => 'media',
                'mensaje' => 'Enfocarse en comportamientos positivos en clase',
                'accion_sugerida' => 'Participar más activamente y evitar distracciones',
            ];
        }
        
        // Analizar rendimiento académico
        $rendimiento = $this->calcularRendimientoAcademico($estudianteId, $claseId, Carbon::now()->subDays(30), Carbon::now());
        if ($rendimiento['promedio_notas'] < 14) {
            $recomendaciones[] = [
                'tipo' => 'academico',
                'prioridad' => 'alta',
                'mensaje' => 'Mejorar rendimiento académico. Promedio actual: ' . $rendimiento['promedio_notas'],
                'accion_sugerida' => 'Dedicar más tiempo al estudio y solicitar ayuda adicional',
            ];
        }
        
        return $recomendaciones;
    }
    
    /**
     * Obtiene información básica de la clase
     */
    private function obtenerInformacionClase(Clase $clase): array
    {
        return [
            'id' => $clase->id,
            'nombre' => $clase->nombre,
            'descripcion' => $clase->descripcion,
            'grado' => $clase->grado,
            'seccion' => $clase->seccion,
            'año_academico' => $clase->año_academico,
            'docente' => $clase->docente->usuario->nombre,
            'especialidad_docente' => $clase->docente->especialidad,
            'fecha_inicio' => $clase->fecha_inicio,
            'fecha_fin' => $clase->fecha_fin,
        ];
    }
    
    /**
     * Calcula estadísticas generales de la clase
     */
    private function calcularEstadisticasGeneralesClase(int $claseId, Carbon $fechaInicio, Carbon $fechaFin): array
    {
        $totalEstudiantes = DB::table('clase_estudiante')
            ->where('id_clase', $claseId)
            ->where('activo', true)
            ->count();
        
        $estudiantesConPersonaje = Personaje::where('id_clase', $claseId)->count();
        
        return [
            'total_estudiantes' => $totalEstudiantes,
            'estudiantes_con_personaje' => $estudiantesConPersonaje,
            'porcentaje_participacion_gamificacion' => $totalEstudiantes > 0 
                ? round(($estudiantesConPersonaje / $totalEstudiantes) * 100, 2) 
                : 0,
            'total_actividades_periodo' => DB::table('actividad')
                ->where('id_clase', $claseId)
                ->whereBetween('created_at', [$fechaInicio, $fechaFin])
                ->count(),
            'total_entregas_periodo' => DB::table('entrega_actividad')
                ->join('actividad', 'entrega_actividad.id_actividad', '=', 'actividad.id')
                ->where('actividad.id_clase', $claseId)
                ->whereBetween('entrega_actividad.fecha_entrega', [$fechaInicio, $fechaFin])
                ->count(),
        ];
    }
    
    /**
     * Analiza la distribución de niveles en la clase
     */
    private function analizarDistribucionNiveles(int $claseId): array
    {
        $personajes = Personaje::where('id_clase', $claseId)->get();
        
        $distribucion = $personajes->groupBy('nivel')
            ->map->count()
            ->sortKeys()
            ->toArray();
        
        return [
            'distribucion' => $distribucion,
            'nivel_promedio' => round($personajes->avg('nivel'), 2),
            'nivel_maximo' => $personajes->max('nivel') ?? 1,
            'nivel_minimo' => $personajes->min('nivel') ?? 1,
            'desviacion_estandar' => $this->calcularDesviacionEstandar($personajes->pluck('nivel')->toArray()),
        ];
    }
    
    /**
     * Identifica estudiantes destacados
     */
    private function identificarEstudiantesDestacados(int $claseId): Collection
    {
        return Personaje::where('id_clase', $claseId)
            ->with(['estudiante.usuario'])
            ->orderBy('nivel', 'desc')
            ->orderBy('experiencia', 'desc')
            ->take(5)
            ->get()
            ->map(function ($personaje) {
                return [
                    'nombre' => $personaje->estudiante->usuario->nombre,
                    'nivel' => $personaje->nivel,
                    'experiencia' => $personaje->experiencia,
                    'personaje_nombre' => $personaje->nombre,
                    'clase_rpg' => $personaje->claseRpg->nombre,
                ];
            });
    }
    
    /**
     * Identifica estudiantes en riesgo
     */
    private function identificarEstudiantesEnRiesgo(int $claseId): Collection
    {
        // Criterios de riesgo: bajo nivel, poca participación, asistencia baja
        return Personaje::where('id_clase', $claseId)
            ->with(['estudiante.usuario'])
            ->where('nivel', '<=', 2)
            ->orWhere('experiencia', '<', 100)
            ->take(5)
            ->get()
            ->map(function ($personaje) {
                return [
                    'nombre' => $personaje->estudiante->usuario->nombre,
                    'nivel' => $personaje->nivel,
                    'experiencia' => $personaje->experiencia,
                    'motivo_riesgo' => $this->determinarMotivoRiesgo($personaje),
                ];
            });
    }
    
    /**
     * Métodos auxiliares para cálculos específicos
     */
    private function agruparEntregasPorMes(Collection $entregas): array
    {
        return $entregas->groupBy(function ($entrega) {
            return Carbon::parse($entrega->fecha_entrega)->format('Y-m');
        })->map->count()->toArray();
    }
    
    private function calcularTendenciaNotas(Collection $entregas): string
    {
        if ($entregas->count() < 2) return 'insuficiente_datos';
        
        $primeraMitad = $entregas->take($entregas->count() / 2)->avg('nota');
        $segundaMitad = $entregas->skip($entregas->count() / 2)->avg('nota');
        
        if ($segundaMitad > $primeraMitad + 1) return 'mejorando';
        if ($segundaMitad < $primeraMitad - 1) return 'empeorando';
        return 'estable';
    }
    
    private function obtenerTiposComportamientoMasFrecuentes(Collection $comportamientos): array
    {
        return $comportamientos->groupBy('tipo_nombre')
            ->map->count()
            ->sortDesc()
            ->take(5)
            ->toArray();
    }
    
    private function agruparComportamientosPorMes(Collection $comportamientos): array
    {
        return $comportamientos->groupBy(function ($comportamiento) {
            return Carbon::parse($comportamiento->fecha)->format('Y-m');
        })->map->count()->toArray();
    }
    
    private function agruparAsistenciaPorMes(Collection $asistencias): array
    {
        return $asistencias->where('presente', false)
            ->groupBy(function ($asistencia) {
                return Carbon::parse($asistencia->fecha)->format('Y-m');
            })->map->count()->toArray();
    }
    
    private function calcularDesviacionEstandar(array $valores): float
    {
        if (empty($valores)) return 0;
        
        $media = array_sum($valores) / count($valores);
        $varianza = array_sum(array_map(function($x) use ($media) {
            return pow($x - $media, 2);
        }, $valores)) / count($valores);
        
        return round(sqrt($varianza), 2);
    }
    
    private function determinarMotivoRiesgo(Personaje $personaje): string
    {
        if ($personaje->nivel <= 1) return 'Nivel muy bajo';
        if ($personaje->experiencia < 50) return 'Poca participación';
        return 'Rendimiento bajo';
    }
    
    /**
     * Métodos adicionales para cálculos específicos que requieren más lógica
     */
    private function obtenerExperienciaEnFecha(Personaje $personaje, Carbon $fecha): int
    {
        // Esto requeriría una tabla de log de experiencia para ser preciso
        // Por ahora, estimamos basándose en la fecha de creación del personaje
        $diasDesdeCreacion = $personaje->created_at->diffInDays($fecha);
        $diasTotales = $personaje->created_at->diffInDays(now());
        
        if ($diasTotales <= 0) return 0;
        
        return max(0, round(($diasDesdeCreacion / $diasTotales) * $personaje->experiencia));
    }
    
    private function calcularPromedioExperienciaDiaria(Personaje $personaje, Carbon $fechaInicio, Carbon $fechaFin): float
    {
        $experienciaInicial = $this->obtenerExperienciaEnFecha($personaje, $fechaInicio);
        $experienciaGanada = $personaje->experiencia - $experienciaInicial;
        $diasPeriodo = $fechaInicio->diffInDays($fechaFin);
        
        return $diasPeriodo > 0 ? round($experienciaGanada / $diasPeriodo, 2) : 0;
    }
    
    private function calcularProgresoNivelActual(Personaje $personaje): float
    {
        // Esto requeriría acceso al servicio de experiencia
        // Por simplicidad, calculamos un estimado
        $experienciaBase = ($personaje->nivel - 1) * 100; // Asumiendo 100 XP por nivel
        $experienciaSiguiente = $personaje->nivel * 100;
        $experienciaActual = $personaje->experiencia;
        
        if ($experienciaActual >= $experienciaSiguiente) return 100.0;
        
        $progreso = (($experienciaActual - $experienciaBase) / ($experienciaSiguiente - $experienciaBase)) * 100;
        return round(max(0, min(100, $progreso)), 2);
    }
    
    private function calcularRendimientoPromedioClase(int $claseId, Carbon $fechaInicio, Carbon $fechaFin): array
    {
        $promedioNotas = DB::table('entrega_actividad')
            ->join('actividad', 'entrega_actividad.id_actividad', '=', 'actividad.id')
            ->where('actividad.id_clase', $claseId)
            ->whereBetween('entrega_actividad.fecha_entrega', [$fechaInicio, $fechaFin])
            ->whereNotNull('entrega_actividad.nota')
            ->avg('entrega_actividad.nota');
        
        return [
            'promedio_clase' => round($promedioNotas ?? 0, 2),
            'total_entregas_calificadas' => DB::table('entrega_actividad')
                ->join('actividad', 'entrega_actividad.id_actividad', '=', 'actividad.id')
                ->where('actividad.id_clase', $claseId)
                ->whereBetween('entrega_actividad.fecha_entrega', [$fechaInicio, $fechaFin])
                ->whereNotNull('entrega_actividad.nota')
                ->count(),
        ];
    }
    
    private function analizarComportamientoClase(int $claseId, Carbon $fechaInicio, Carbon $fechaFin): array
    {
        $comportamientos = DB::table('registro_comportamiento')
            ->join('tipo_comportamiento', 'registro_comportamiento.id_tipo_comportamiento', '=', 'tipo_comportamiento.id')
            ->where('registro_comportamiento.id_clase', $claseId)
            ->whereBetween('registro_comportamiento.fecha', [$fechaInicio, $fechaFin])
            ->select('tipo_comportamiento.nombre', 'tipo_comportamiento.valor_puntos')
            ->get();
        
        $positivos = $comportamientos->where('valor_puntos', '>', 0)->count();
        $negativos = $comportamientos->where('valor_puntos', '<', 0)->count();
        
        return [
            'total_registros' => $comportamientos->count(),
            'comportamientos_positivos' => $positivos,
            'comportamientos_negativos' => $negativos,
            'ratio_positivo_negativo' => $negativos > 0 ? round($positivos / $negativos, 2) : null,
        ];
    }
    
    private function calcularAsistenciaClase(int $claseId, Carbon $fechaInicio, Carbon $fechaFin): array
    {
        $asistencias = DB::table('asistencia')
            ->where('id_clase', $claseId)
            ->whereBetween('fecha', [$fechaInicio, $fechaFin])
            ->get();
        
        $totalRegistros = $asistencias->count();
        $presentes = $asistencias->where('presente', true)->count();
        
        return [
            'total_registros' => $totalRegistros,
            'total_presentes' => $presentes,
            'porcentaje_asistencia_clase' => $totalRegistros > 0 ? round(($presentes / $totalRegistros) * 100, 2) : 0,
        ];
    }
    
    private function analizarRendimientoActividades(int $claseId, Carbon $fechaInicio, Carbon $fechaFin): array
    {
        return DB::table('actividad')
            ->leftJoin('entrega_actividad', 'actividad.id', '=', 'entrega_actividad.id_actividad')
            ->where('actividad.id_clase', $claseId)
            ->whereBetween('actividad.created_at', [$fechaInicio, $fechaFin])
            ->select(
                'actividad.titulo',
                DB::raw('COUNT(entrega_actividad.id) as total_entregas'),
                DB::raw('AVG(entrega_actividad.nota) as promedio_nota')
            )
            ->groupBy('actividad.id', 'actividad.titulo')
            ->get()
            ->map(function ($actividad) {
                return [
                    'titulo' => $actividad->titulo,
                    'total_entregas' => $actividad->total_entregas,
                    'promedio_nota' => round($actividad->promedio_nota ?? 0, 2),
                ];
            })->toArray();
    }
    
    private function analizarTendenciasTiempo(int $claseId, Carbon $fechaInicio, Carbon $fechaFin): array
    {
        $experienciaPorMes = DB::table('personaje')
            ->where('id_clase', $claseId)
            ->select(
                DB::raw("DATE_TRUNC('month', created_at) as mes"),
                DB::raw('AVG(experiencia) as promedio_experiencia')
            )
            ->groupBy('mes')
            ->orderBy('mes')
            ->get()
            ->pluck('promedio_experiencia', 'mes')
            ->toArray();
        
        return [
            'experiencia_por_mes' => $experienciaPorMes,
            'tendencia_general' => $this->calcularTendenciaGeneral($experienciaPorMes),
        ];
    }
    
    private function calcularTendenciaGeneral(array $datos): string
    {
        if (count($datos) < 2) return 'insuficiente_datos';
        
        $valores = array_values($datos);
        $inicio = array_slice($valores, 0, count($valores) / 2);
        $fin = array_slice($valores, count($valores) / 2);
        
        $promedioInicio = array_sum($inicio) / count($inicio);
        $promedioFin = array_sum($fin) / count($fin);
        
        if ($promedioFin > $promedioInicio * 1.1) return 'creciente';
        if ($promedioFin < $promedioInicio * 0.9) return 'decreciente';
        return 'estable';
    }
}