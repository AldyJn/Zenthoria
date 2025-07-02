<?php

namespace App\Services;

use App\Models\Actividad;
use App\Models\EntregaActividad;
use App\Models\Personaje;
use App\Models\EstadisticaPersonaje;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Collection;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

class ActividadService
{
    protected ExperienciaService $experienciaService;
    protected PersonajeService $personajeService;
    
    public function __construct(
        ExperienciaService $experienciaService,
        PersonajeService $personajeService
    ) {
        $this->experienciaService = $experienciaService;
        $this->personajeService = $personajeService;
    }
    
    /**
     * Crea una nueva actividad
     */
    public function crearActividad(array $datos): Actividad
    {
        return Actividad::create([
            'id_clase' => $datos['id_clase'],
            'id_tipo_actividad' => $datos['id_tipo_actividad'],
            'titulo' => $datos['titulo'],
            'descripcion' => $datos['descripcion'] ?? null,
            'fecha_inicio' => $datos['fecha_inicio'] ?? now(),
            'fecha_entrega' => $datos['fecha_entrega'],
            'puntos_experiencia' => $datos['puntos_experiencia'] ?? 0,
            'puntos_moneda' => $datos['puntos_moneda'] ?? 0,
            'activa' => $datos['activa'] ?? true,
        ]);
    }
    
    /**
     * Obtiene actividades de una clase con filtros
     */
    public function obtenerActividadesClase(
        int $claseId, 
        array $filtros = [],
        int $estudianteId = null
    ): Collection {
        $query = Actividad::where('id_clase', $claseId)
            ->with(['tipoActividad']);
        
        // Aplicar filtros
        if (isset($filtros['activa'])) {
            $query->where('activa', $filtros['activa']);
        }
        
        if (isset($filtros['tipo_actividad'])) {
            $query->where('id_tipo_actividad', $filtros['tipo_actividad']);
        }
        
        if (isset($filtros['fecha_desde'])) {
            $query->where('fecha_entrega', '>=', $filtros['fecha_desde']);
        }
        
        if (isset($filtros['fecha_hasta'])) {
            $query->where('fecha_entrega', '<=', $filtros['fecha_hasta']);
        }
        
        $actividades = $query->orderBy('fecha_entrega', 'desc')->get();
        
        // Si se proporciona estudiante, incluir información de entrega
        if ($estudianteId) {
            $actividades = $actividades->map(function ($actividad) use ($estudianteId) {
                $entrega = EntregaActividad::where('id_actividad', $actividad->id)
                    ->where('id_estudiante', $estudianteId)
                    ->first();
                
                $actividad->entrega_estudiante = $entrega;
                $actividad->estado_entrega = $this->determinarEstadoEntrega($actividad, $entrega);
                
                return $actividad;
            });
        }
        
        return $actividades;
    }
    
    /**
     * Procesa la entrega de una actividad por parte de un estudiante
     */
    public function procesarEntregaActividad(
        int $actividadId,
        int $estudianteId,
        UploadedFile $archivo = null,
        string $contenido = null
    ): EntregaActividad {
        $actividad = Actividad::findOrFail($actividadId);
        
        // Verificar que la actividad esté activa
        if (!$actividad->activa) {
            throw new \Exception('La actividad no está disponible para entregas');
        }
        
        // Verificar que no haya pasado la fecha límite
        if ($actividad->fecha_entrega && now() > $actividad->fecha_entrega) {
            throw new \Exception('La fecha límite de entrega ha pasado');
        }
        
        // Verificar que el estudiante no haya entregado ya
        $entregaExistente = EntregaActividad::where('id_actividad', $actividadId)
            ->where('id_estudiante', $estudianteId)
            ->first();
            
        if ($entregaExistente) {
            throw new \Exception('Ya has entregado esta actividad');
        }
        
        DB::beginTransaction();
        
        try {
            $rutaArchivo = null;
            
            // Procesar archivo si se proporciona
            if ($archivo) {
                $rutaArchivo = $this->guardarArchivoEntrega($archivo, $actividadId, $estudianteId);
            }
            
            // Crear entrega
            $entrega = EntregaActividad::create([
                'id_actividad' => $actividadId,
                'id_estudiante' => $estudianteId,
                'archivo' => $rutaArchivo,
                'fecha_entrega' => now(),
            ]);
            
            // Actualizar estadísticas del personaje
            $this->actualizarEstadisticasEntrega($estudianteId, $actividad->id_clase);
            
            DB::commit();
            
            return $entrega->load(['actividad', 'estudiante.usuario']);
            
        } catch (\Exception $e) {
            DB::rollBack();
            
            // Eliminar archivo si se subió pero falló la transacción
            if ($rutaArchivo && Storage::exists($rutaArchivo)) {
                Storage::delete($rutaArchivo);
            }
            
            throw $e;
        }
    }
    
    /**
     * Califica una entrega y otorga recompensas
     */
    public function calificarEntrega(
        EntregaActividad $entrega,
        float $nota,
        string $comentario = null
    ): array {
        DB::beginTransaction();
        
        try {
            $entrega->update([
                'nota' => $nota,
                'comentario' => $comentario,
            ]);
            
            $actividad = $entrega->actividad;
            $personaje = $this->personajeService->obtenerPersonajeEstudiante(
                $entrega->id_estudiante,
                $actividad->id_clase
            );
            
            if (!$personaje) {
                throw new \Exception('No se encontró el personaje del estudiante');
            }
            
            // Calcular recompensas basadas en la nota
            $recompensas = $this->calcularRecompensasActividad($actividad, $nota);
            
            $resultadoExperiencia = [];
            if ($recompensas['experiencia'] > 0) {
                $resultadoExperiencia = $this->experienciaService->otorgarExperiencia(
                    $personaje,
                    $recompensas['experiencia'],
                    "Actividad completada: {$actividad->titulo} (Nota: {$nota})"
                );
            }
            
            // Actualizar estadísticas de misiones completadas
            $estadisticas = EstadisticaPersonaje::where('id_personaje', $personaje->id)->first();
            if ($estadisticas) {
                $estadisticas->increment('actividades_completadas');
            }
            
            DB::commit();
            
            return [
                'entrega' => $entrega->fresh(['actividad', 'estudiante.usuario']),
                'recompensas' => $recompensas,
                'experiencia_resultado' => $resultadoExperiencia,
            ];
            
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }
    
    /**
     * Obtiene el reporte de entregas de una actividad
     */
    public function obtenerReporteEntregas(int $actividadId): array
    {
        $actividad = Actividad::with(['tipoActividad'])->findOrFail($actividadId);
        
        // Obtener todos los estudiantes de la clase
        $estudiantesClase = DB::table('clase_estudiante')
            ->join('estudiante', 'clase_estudiante.id_estudiante', '=', 'estudiante.id')
            ->join('usuario', 'estudiante.id_usuario', '=', 'usuario.id')
            ->where('clase_estudiante.id_clase', $actividad->id_clase)
            ->where('clase_estudiante.activo', true)
            ->select('estudiante.id', 'usuario.nombre', 'estudiante.codigo_estudiante')
            ->get();
        
        // Obtener entregas existentes
        $entregas = EntregaActividad::where('id_actividad', $actividadId)
            ->with(['estudiante.usuario'])
            ->get()
            ->keyBy('id_estudiante');
        
        // Construir reporte
        $reporte = [
            'actividad' => $actividad,
            'total_estudiantes' => $estudiantesClase->count(),
            'total_entregas' => $entregas->count(),
            'porcentaje_entrega' => $estudiantesClase->count() > 0 
                ? round(($entregas->count() / $estudiantesClase->count()) * 100, 2) 
                : 0,
            'estudiantes' => [],
            'estadisticas_notas' => [],
        ];
        
        foreach ($estudiantesClase as $estudiante) {
            $entrega = $entregas->get($estudiante->id);
            $estado = $this->determinarEstadoEntrega($actividad, $entrega);
            
            $reporte['estudiantes'][] = [
                'id' => $estudiante->id,
                'nombre' => $estudiante->nombre,
                'codigo' => $estudiante->codigo_estudiante,
                'entrega' => $entrega,
                'estado' => $estado,
                'nota' => $entrega->nota ?? null,
                'fecha_entrega' => $entrega->fecha_entrega ?? null,
            ];
        }
        
        // Calcular estadísticas de notas
        $notasCalificadas = $entregas->whereNotNull('nota')->pluck('nota');
        
        if ($notasCalificadas->count() > 0) {
            $reporte['estadisticas_notas'] = [
                'promedio' => round($notasCalificadas->avg(), 2),
                'nota_maxima' => $notasCalificadas->max(),
                'nota_minima' => $notasCalificadas->min(),
                'total_calificadas' => $notasCalificadas->count(),
                'pendientes_calificar' => $entregas->whereNull('nota')->count(),
            ];
        }
        
        return $reporte;
    }
    
    /**
     * Obtiene las próximas actividades por vencer
     */
    public function obtenerActividadesProximasVencer(int $claseId, int $dias = 7): Collection
    {
        return Actividad::where('id_clase', $claseId)
            ->where('activa', true)
            ->where('fecha_entrega', '>', now())
            ->where('fecha_entrega', '<=', now()->addDays($dias))
            ->with(['tipoActividad'])
            ->orderBy('fecha_entrega', 'asc')
            ->get();
    }
    
    /**
     * Determina el estado de entrega de una actividad
     */
    private function determinarEstadoEntrega(Actividad $actividad, ?EntregaActividad $entrega): string
    {
        if (!$entrega) {
            if ($actividad->fecha_entrega && now() > $actividad->fecha_entrega) {
                return 'no_entregada_vencida';
            }
            return 'pendiente';
        }
        
        if ($entrega->nota !== null) {
            return 'calificada';
        }
        
        if ($actividad->fecha_entrega && $entrega->fecha_entrega > $actividad->fecha_entrega) {
            return 'entregada_tarde';
        }
        
        return 'entregada_pendiente_calificacion';
    }
    
    /**
     * Calcula las recompensas basadas en la nota obtenida
     */
    private function calcularRecompensasActividad(Actividad $actividad, float $nota): array
    {
        // Calcular porcentaje de la nota (asumiendo escala 0-20)
        $porcentaje = min(100, max(0, ($nota / 20) * 100));
        
        // Calcular experiencia proporcional a la nota
        $experienciaBase = $actividad->puntos_experiencia;
        $experiencia = round($experienciaBase * ($porcentaje / 100));
        
        // Calcular monedas proporcional a la nota
        $monedasBase = $actividad->puntos_moneda;
        $monedas = round($monedasBase * ($porcentaje / 100));
        
        // Bonus por excelencia (nota >= 18)
        if ($nota >= 18) {
            $experiencia = round($experiencia * 1.2); // 20% bonus
            $monedas = round($monedas * 1.2);
        }
        // Bonus por buen rendimiento (nota >= 15)
        elseif ($nota >= 15) {
            $experiencia = round($experiencia * 1.1); // 10% bonus
            $monedas = round($monedas * 1.1);
        }
        
        return [
            'experiencia' => max(0, $experiencia),
            'monedas' => max(0, $monedas),
            'nota_porcentaje' => $porcentaje,
            'bonus_aplicado' => $nota >= 15,
        ];
    }
    
    /**
     * Guarda el archivo de entrega
     */
    private function guardarArchivoEntrega(UploadedFile $archivo, int $actividadId, int $estudianteId): string
    {
        $extension = $archivo->getClientOriginalExtension();
        $nombreArchivo = "actividad_{$actividadId}_estudiante_{$estudianteId}_" . time() . ".{$extension}";
        
        return $archivo->storeAs('entregas', $nombreArchivo, 'public');
    }
    
    /**
     * Actualiza las estadísticas del personaje al entregar actividad
     */
    private function actualizarEstadisticasEntrega(int $estudianteId, int $claseId): void
    {
        $personaje = Personaje::where('id_estudiante', $estudianteId)
            ->where('id_clase', $claseId)
            ->first();
            
        if ($personaje) {
            $estadisticas = EstadisticaPersonaje::firstOrCreate(
                ['id_personaje' => $personaje->id],
                ['misiones_completadas' => 0, 'actividades_completadas' => 0]
            );
            
            // No incrementamos aquí porque se hace al calificar
            // Solo aseguramos que existan las estadísticas
        }
    }
    
    /**
     * Obtiene estadísticas generales de actividades de una clase
     */
    public function obtenerEstadisticasGeneralesClase(int $claseId): array
    {
        $totalActividades = Actividad::where('id_clase', $claseId)->count();
        $actividadesActivas = Actividad::where('id_clase', $claseId)->where('activa', true)->count();
        
        $totalEntregas = DB::table('entrega_actividad')
            ->join('actividad', 'entrega_actividad.id_actividad', '=', 'actividad.id')
            ->where('actividad.id_clase', $claseId)
            ->count();
            
        $entregasCalificadas = DB::table('entrega_actividad')
            ->join('actividad', 'entrega_actividad.id_actividad', '=', 'actividad.id')
            ->where('actividad.id_clase', $claseId)
            ->whereNotNull('entrega_actividad.nota')
            ->count();
        
        $promedioNotas = DB::table('entrega_actividad')
            ->join('actividad', 'entrega_actividad.id_actividad', '=', 'actividad.id')
            ->where('actividad.id_clase', $claseId)
            ->whereNotNull('entrega_actividad.nota')
            ->avg('entrega_actividad.nota');
        
        return [
            'total_actividades' => $totalActividades,
            'actividades_activas' => $actividadesActivas,
            'total_entregas' => $totalEntregas,
            'entregas_calificadas' => $entregasCalificadas,
            'entregas_pendientes' => $totalEntregas - $entregasCalificadas,
            'promedio_notas_clase' => $promedioNotas ? round($promedioNotas, 2) : 0,
        ];
    }
    
    /**
     * Actualiza una actividad existente
     */
    public function actualizarActividad(Actividad $actividad, array $datos): Actividad
    {
        $camposPermitidos = [
            'titulo', 'descripcion', 'fecha_inicio', 'fecha_entrega',
            'puntos_experiencia', 'puntos_moneda', 'activa'
        ];
        
        foreach ($camposPermitidos as $campo) {
            if (array_key_exists($campo, $datos)) {
                $actividad->$campo = $datos[$campo];
            }
        }
        
        $actividad->save();
        
        return $actividad->load(['tipoActividad']);
    }
    
    /**
     * Elimina una actividad (solo si no tiene entregas)
     */
    public function eliminarActividad(Actividad $actividad): bool
    {
        $tieneEntregas = EntregaActividad::where('id_actividad', $actividad->id)->exists();
        
        if ($tieneEntregas) {
            throw new \Exception('No se puede eliminar una actividad que tiene entregas');
        }
        
        return $actividad->delete();
    }
}