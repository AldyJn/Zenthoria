<?php

namespace App\Services;

use App\Models\Clase;
use App\Models\ClaseEstudiante;
use App\Models\Estudiante;
use App\Models\EstadisticaClase;
use App\Models\Personaje;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Collection;
use Illuminate\Support\Str;
use SimpleSoftwareIO\QrCode\Facades\QrCode;
use Illuminate\Support\Facades\Storage;

class ClaseService
{
    protected PersonajeService $personajeService;
    protected ExperienciaService $experienciaService;
    
    public function __construct(
        PersonajeService $personajeService,
        ExperienciaService $experienciaService
    ) {
        $this->personajeService = $personajeService;
        $this->experienciaService = $experienciaService;
    }
    
    /**
     * Crea una nueva clase
     */
    public function crearClase(array $datos): Clase
    {
        DB::beginTransaction();
        
        try {
            $codigoInvitacion = $this->generarCodigoInvitacion();
            
            $clase = Clase::create([
                'nombre' => $datos['nombre'],
                'descripcion' => $datos['descripcion'] ?? null,
                'id_docente' => $datos['id_docente'],
                'grado' => $datos['grado'] ?? null,
                'seccion' => $datos['seccion'] ?? null,
                'año_academico' => $datos['año_academico'] ?? date('Y'),
                'codigo_invitacion' => $codigoInvitacion,
                'fecha_inicio' => $datos['fecha_inicio'] ?? null,
                'fecha_fin' => $datos['fecha_fin'] ?? null,
                'activo' => true,
            ]);
            
            // Generar código QR
            $this->generarCodigoQR($clase);
            
            // Crear estadísticas iniciales
            EstadisticaClase::create([
                'id_clase' => $clase->id,
                'promedio_nivel' => 1.0,
                'promedio_participacion' => 0.0,
                'distribucion_niveles' => json_encode([]),
            ]);
            
            DB::commit();
            
            return $clase->load(['docente.usuario']);
            
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }
    
    /**
     * Permite a un estudiante unirse a una clase mediante código
     */
    public function unirEstudianteAClase(int $estudianteId, string $codigoInvitacion): array
    {
        $clase = Clase::where('codigo_invitacion', $codigoInvitacion)
            ->where('activo', true)
            ->first();
            
        if (!$clase) {
            throw new \Exception('Código de invitación inválido o clase no disponible');
        }
        
        // Verificar que el estudiante no esté ya inscrito
        $yaInscrito = ClaseEstudiante::where('id_clase', $clase->id)
            ->where('id_estudiante', $estudianteId)
            ->where('activo', true)
            ->exists();
            
        if ($yaInscrito) {
            throw new \Exception('Ya estás inscrito en esta clase');
        }
        
        DB::beginTransaction();
        
        try {
            // Inscribir estudiante
            $inscripcion = ClaseEstudiante::create([
                'id_clase' => $clase->id,
                'id_estudiante' => $estudianteId,
                'fecha_ingreso' => now(),
                'activo' => true,
            ]);
            
            // Actualizar estadísticas de la clase
            $this->actualizarEstadisticasClase($clase->id);
            
            DB::commit();
            
            return [
                'clase' => $clase->load(['docente.usuario']),
                'inscripcion' => $inscripcion,
                'mensaje' => "Te has unido exitosamente a la clase: {$clase->nombre}",
            ];
            
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }
    
    /**
     * Obtiene las clases de un docente
     */
    public function obtenerClasesDocente(int $docenteId, array $filtros = []): Collection
    {
        $query = Clase::where('id_docente', $docenteId)
            ->with(['docente.usuario']);
        
        if (isset($filtros['activo'])) {
            $query->where('activo', $filtros['activo']);
        }
        
        if (isset($filtros['año_academico'])) {
            $query->where('año_academico', $filtros['año_academico']);
        }
        
        return $query->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($clase) {
                return $this->enrichClaseData($clase);
            });
    }
    
    /**
     * Obtiene las clases de un estudiante
     */
    public function obtenerClasesEstudiante(int $estudianteId): Collection
    {
        return DB::table('clase_estudiante')
            ->join('clase', 'clase_estudiante.id_clase', '=', 'clase.id')
            ->join('docente', 'clase.id_docente', '=', 'docente.id')
            ->join('usuario', 'docente.id_usuario', '=', 'usuario.id')
            ->where('clase_estudiante.id_estudiante', $estudianteId)
            ->where('clase_estudiante.activo', true)
            ->where('clase.activo', true)
            ->select(
                'clase.*',
                'usuario.nombre as nombre_docente',
                'clase_estudiante.fecha_ingreso'
            )
            ->get()
            ->map(function ($clase) use ($estudianteId) {
                // Obtener personaje del estudiante en esta clase
                $personaje = $this->personajeService->obtenerPersonajeEstudiante($estudianteId, $clase->id);
                
                return [
                    'id' => $clase->id,
                    'nombre' => $clase->nombre,
                    'descripcion' => $clase->descripcion,
                    'grado' => $clase->grado,
                    'seccion' => $clase->seccion,
                    'año_academico' => $clase->año_academico,
                    'docente' => $clase->nombre_docente,
                    'fecha_ingreso' => $clase->fecha_ingreso,
                    'personaje' => $personaje ? [
                        'id' => $personaje->id,
                        'nombre' => $personaje->nombre,
                        'nivel' => $personaje->nivel,
                        'experiencia' => $personaje->experiencia,
                        'clase_rpg' => $personaje->claseRpg->nombre,
                        'avatar_base' => $personaje->avatar_base,
                    ] : null,
                ];
            });
    }
    
    /**
     * Obtiene información detallada de una clase
     */
    public function obtenerDetalleClase(int $claseId, int $usuarioId = null, string $tipoUsuario = null): array
    {
        $clase = Clase::with(['docente.usuario', 'estadisticas'])->findOrFail($claseId);
        
        $detalle = [
            'clase' => $this->enrichClaseData($clase),
            'estadisticas_generales' => $this->obtenerEstadisticasGenerales($claseId),
        ];
        
        // Información específica según el tipo de usuario
        if ($tipoUsuario === 'docente') {
            $detalle['estudiantes'] = $this->obtenerEstudiantesClase($claseId);
            $detalle['actividades_recientes'] = $this->obtenerActividadesRecientes($claseId);
            $detalle['ranking_clase'] = $this->personajeService->obtenerRankingClase($claseId);
        } elseif ($tipoUsuario === 'estudiante' && $usuarioId) {
            $estudiante = Estudiante::where('id_usuario', $usuarioId)->first();
            if ($estudiante) {
                $detalle['mi_personaje'] = $this->personajeService->obtenerPersonajeEstudiante($estudiante->id, $claseId);
                $detalle['mi_posicion_ranking'] = $this->obtenerPosicionEnRanking($estudiante->id, $claseId);
                $detalle['companeros'] = $this->obtenerCompanerosClase($claseId, $estudiante->id);
            }
        }
        
        return $detalle;
    }
    
    /**
     * Obtiene los estudiantes de una clase con sus personajes
     */
    public function obtenerEstudiantesClase(int $claseId): Collection
    {
        return DB::table('clase_estudiante')
            ->join('estudiante', 'clase_estudiante.id_estudiante', '=', 'estudiante.id')
            ->join('usuario', 'estudiante.id_usuario', '=', 'usuario.id')
            ->leftJoin('personaje', function ($join) use ($claseId) {
                $join->on('estudiante.id', '=', 'personaje.id_estudiante')
                     ->where('personaje.id_clase', '=', $claseId);
            })
            ->leftJoin('clase_rpg', 'personaje.id_clase_rpg', '=', 'clase_rpg.id')
            ->where('clase_estudiante.id_clase', $claseId)
            ->where('clase_estudiante.activo', true)
            ->select(
                'estudiante.id',
                'usuario.nombre',
                'estudiante.codigo_estudiante',
                'clase_estudiante.fecha_ingreso',
                'personaje.id as personaje_id',
                'personaje.nombre as personaje_nombre',
                'personaje.nivel',
                'personaje.experiencia',
                'clase_rpg.nombre as clase_rpg_nombre',
                'personaje.avatar_base'
            )
            ->orderBy('personaje.nivel', 'desc')
            ->orderBy('personaje.experiencia', 'desc')
            ->get();
    }
    
    /**
     * Actualiza información de una clase
     */
    public function actualizarClase(Clase $clase, array $datos): Clase
    {
        $camposPermitidos = [
            'nombre', 'descripcion', 'grado', 'seccion', 
            'fecha_inicio', 'fecha_fin', 'activo'
        ];
        
        foreach ($camposPermitidos as $campo) {
            if (array_key_exists($campo, $datos)) {
                $clase->$campo = $datos[$campo];
            }
        }
        
        $clase->save();
        
        return $clase->load(['docente.usuario']);
    }
    
    /**
     * Genera un nuevo código de invitación para la clase
     */
    public function regenerarCodigoInvitacion(Clase $clase): Clase
    {
        DB::beginTransaction();
        
        try {
            $nuevoCodigoInvitacion = $this->generarCodigoInvitacion();
            
            $clase->update([
                'codigo_invitacion' => $nuevoCodigoInvitacion
            ]);
            
            // Regenerar código QR
            $this->generarCodigoQR($clase);
            
            DB::commit();
            
            return $clase->fresh();
            
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }
    
    /**
     * Remueve un estudiante de una clase
     */
    public function removerEstudianteDeClase(int $claseId, int $estudianteId): bool
    {
        DB::beginTransaction();
        
        try {
            // Desactivar inscripción
            ClaseEstudiante::where('id_clase', $claseId)
                ->where('id_estudiante', $estudianteId)
                ->update(['activo' => false]);
            
            // Actualizar estadísticas
            $this->actualizarEstadisticasClase($claseId);
            
            DB::commit();
            
            return true;
            
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }
    
    /**
     * Genera código de invitación único
     */
    private function generarCodigoInvitacion(): string
    {
        do {
            $codigo = strtoupper(Str::random(6));
        } while (Clase::where('codigo_invitacion', $codigo)->exists());
        
        return $codigo;
    }
    
    /**
     * Genera código QR para la clase
     */
    private function generarCodigoQR(Clase $clase): void
    {
        $urlInvitacion = url("/unirse-clase/{$clase->codigo_invitacion}");
        
        $qrCode = QrCode::format('png')
            ->size(300)
            ->generate($urlInvitacion);
        
        $nombreArchivo = "qr_clase_{$clase->id}_{$clase->codigo_invitacion}.png";
        $rutaArchivo = "qr-codes/{$nombreArchivo}";
        
        Storage::disk('public')->put($rutaArchivo, $qrCode);
        
        $clase->update([
            'qr_url' => Storage::url($rutaArchivo)
        ]);
    }
    
    /**
     * Enriquece los datos de la clase con información adicional
     */
    private function enrichClaseData(Clase $clase): array
    {
        $totalEstudiantes = ClaseEstudiante::where('id_clase', $clase->id)
            ->where('activo', true)
            ->count();
        
        return [
            'id' => $clase->id,
            'nombre' => $clase->nombre,
            'descripcion' => $clase->descripcion,
            'grado' => $clase->grado,
            'seccion' => $clase->seccion,
            'año_academico' => $clase->año_academico,
            'activo' => $clase->activo,
            'codigo_invitacion' => $clase->codigo_invitacion,
            'qr_url' => $clase->qr_url,
            'fecha_inicio' => $clase->fecha_inicio,
            'fecha_fin' => $clase->fecha_fin,
            'docente' => [
                'id' => $clase->docente->id,
                'nombre' => $clase->docente->usuario->nombre,
                'especialidad' => $clase->docente->especialidad,
            ],
            'total_estudiantes' => $totalEstudiantes,
            'url_invitacion' => url("/unirse-clase/{$clase->codigo_invitacion}"),
            'created_at' => $clase->created_at,
            'updated_at' => $clase->updated_at,
        ];
    }
    
    /**
     * Actualiza las estadísticas de la clase
     */
    private function actualizarEstadisticasClase(int $claseId): void
    {
        $personajes = Personaje::where('id_clase', $claseId)->get();
        
        if ($personajes->count() > 0) {
            $promedioNivel = $personajes->avg('nivel');
            $distribucionNiveles = $personajes->groupBy('nivel')
                ->map->count()
                ->toArray();
            
            EstadisticaClase::updateOrCreate(
                ['id_clase' => $claseId],
                [
                    'promedio_nivel' => round($promedioNivel, 2),
                    'distribucion_niveles' => json_encode($distribucionNiveles),
                ]
            );
        }
    }
    
    /**
     * Obtiene estadísticas generales de la clase
     */
    private function obtenerEstadisticasGenerales(int $claseId): array
    {
        $totalEstudiantes = ClaseEstudiante::where('id_clase', $claseId)
            ->where('activo', true)
            ->count();
            
        $estudiantesConPersonaje = Personaje::where('id_clase', $claseId)->count();
        
        $nivelPromedio = Personaje::where('id_clase', $claseId)->avg('nivel') ?? 1;
        
        return [
            'total_estudiantes' => $totalEstudiantes,
            'estudiantes_con_personaje' => $estudiantesConPersonaje,
            'nivel_promedio' => round($nivelPromedio, 2),
            'porcentaje_personajes_creados' => $totalEstudiantes > 0 
                ? round(($estudiantesConPersonaje / $totalEstudiantes) * 100, 2) 
                : 0,
        ];
    }
    
    /**
     * Obtiene actividades recientes de la clase
     */
    private function obtenerActividadesRecientes(int $claseId, int $limite = 5): Collection
    {
        return DB::table('actividad')
            ->join('tipo_actividad', 'actividad.id_tipo_actividad', '=', 'tipo_actividad.id')
            ->where('actividad.id_clase', $claseId)
            ->select(
                'actividad.id',
                'actividad.titulo',
                'actividad.fecha_entrega',
                'tipo_actividad.nombre as tipo',
                'actividad.activa'
            )
            ->orderBy('actividad.created_at', 'desc')
            ->limit($limite)
            ->get();
    }
    
    /**
     * Obtiene la posición del estudiante en el ranking
     */
    private function obtenerPosicionEnRanking(int $estudianteId, int $claseId): ?int
    {
        $ranking = $this->personajeService->obtenerRankingClase($claseId, 100);
        
        foreach ($ranking as $index => $personaje) {
            if ($personaje['estudiante']['id'] == $estudianteId) {
                return $index + 1;
            }
        }
        
        return null;
    }
    
    /**
     * Obtiene los compañeros de clase (excluyendo al estudiante actual)
     */
    private function obtenerCompanerosClase(int $claseId, int $estudianteIdActual): Collection
    {
        return $this->obtenerEstudiantesClase($claseId)
            ->filter(function ($estudiante) use ($estudianteIdActual) {
                return $estudiante->id != $estudianteIdActual;
            })
            ->take(10); // Limitar a 10 compañeros
    }
}