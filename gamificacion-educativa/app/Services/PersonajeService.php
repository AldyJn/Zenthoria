<?php

namespace App\Services;

use App\Models\Personaje;
use App\Models\Estudiante;
use App\Models\Clase;
use App\Models\ClaseRpg;
use App\Models\EstadisticaPersonaje;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Collection;

class PersonajeService
{
    protected ExperienciaService $experienciaService;
    
    public function __construct(ExperienciaService $experienciaService)
    {
        $this->experienciaService = $experienciaService;
    }
    
    /**
     * Crea un personaje para un estudiante en una clase específica
     */
    public function crearPersonaje(int $estudianteId, int $claseId, int $claseRpgId, string $nombre = null): Personaje
    {
        // Verificar que el estudiante esté inscrito en la clase
        $this->verificarInscripcionEstudiante($estudianteId, $claseId);
        
        // Verificar que no exista ya un personaje para este estudiante en esta clase
        $personajeExistente = Personaje::where('id_estudiante', $estudianteId)
            ->where('id_clase', $claseId)
            ->first();
            
        if ($personajeExistente) {
            throw new \Exception('El estudiante ya tiene un personaje en esta clase');
        }
        
        DB::beginTransaction();
        
        try {
            $claseRpg = ClaseRpg::findOrFail($claseRpgId);
            
            $personaje = Personaje::create([
                'id_estudiante' => $estudianteId,
                'id_clase' => $claseId,
                'id_clase_rpg' => $claseRpgId,
                'nombre' => $nombre ?? $this->generarNombrePersonaje($claseRpg->nombre),
                'nivel' => 1,
                'experiencia' => 0,
                'avatar_base' => strtolower($claseRpg->nombre),
            ]);
            
            // Crear estadísticas iniciales
            EstadisticaPersonaje::create([
                'id_personaje' => $personaje->id,
                'misiones_completadas' => 0,
                'actividades_completadas' => 0,
            ]);
            
            DB::commit();
            
            return $personaje->load(['estudiante.usuario', 'clase', 'claseRpg', 'estadisticas']);
            
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }
    
    /**
     * Obtiene el personaje de un estudiante en una clase específica
     */
    public function obtenerPersonajeEstudiante(int $estudianteId, int $claseId): ?Personaje
    {
        return Personaje::where('id_estudiante', $estudianteId)
            ->where('id_clase', $claseId)
            ->with(['estudiante.usuario', 'clase', 'claseRpg', 'estadisticas'])
            ->first();
    }
    
    /**
     * Obtiene todos los personajes de una clase con sus estadísticas
     */
    public function obtenerPersonajesClase(int $claseId): Collection
    {
        return Personaje::where('id_clase', $claseId)
            ->with(['estudiante.usuario', 'claseRpg', 'estadisticas'])
            ->orderBy('nivel', 'desc')
            ->orderBy('experiencia', 'desc')
            ->get()
            ->map(function ($personaje) {
                return $this->enrichPersonajeData($personaje);
            });
    }
    
    /**
     * Actualiza información del personaje
     */
    public function actualizarPersonaje(Personaje $personaje, array $datos): Personaje
    {
        $camposPermitidos = ['nombre', 'avatar_base'];
        
        foreach ($camposPermitidos as $campo) {
            if (isset($datos[$campo])) {
                $personaje->$campo = $datos[$campo];
            }
        }
        
        $personaje->save();
        
        return $personaje->load(['estudiante.usuario', 'clase', 'claseRpg', 'estadisticas']);
    }
    
    /**
     * Obtiene el ranking de personajes de una clase
     */
    public function obtenerRankingClase(int $claseId, int $limite = 10): Collection
    {
        return Personaje::where('id_clase', $claseId)
            ->with(['estudiante.usuario', 'claseRpg'])
            ->orderBy('nivel', 'desc')
            ->orderBy('experiencia', 'desc')
            ->limit($limite)
            ->get()
            ->map(function ($personaje, $index) {
                $data = $this->enrichPersonajeData($personaje);
                $data['posicion'] = $index + 1;
                return $data;
            });
    }
    
    /**
     * Obtiene estadísticas detalladas del personaje
     */
    public function obtenerEstadisticasDetalladas(Personaje $personaje): array
    {
        $estadisticasExp = $this->experienciaService->obtenerEstadisticasExperiencia($personaje);
        $estadisticasPersonaje = $personaje->estadisticas;
        
        return [
            'informacion_basica' => [
                'id' => $personaje->id,
                'nombre' => $personaje->nombre,
                'clase_rpg' => $personaje->claseRpg->nombre,
                'avatar_base' => $personaje->avatar_base,
            ],
            'experiencia' => $estadisticasExp,
            'estadisticas_generales' => [
                'misiones_completadas' => $estadisticasPersonaje->misiones_completadas ?? 0,
                'actividades_completadas' => $estadisticasPersonaje->actividades_completadas ?? 0,
            ],
            'rendimiento' => $this->calcularRendimientoPersonaje($personaje),
        ];
    }
    
    /**
     * Calcula métricas de rendimiento del personaje
     */
    private function calcularRendimientoPersonaje(Personaje $personaje): array
    {
        // Obtener registros de comportamiento recientes (últimos 30 días)
        $comportamientos = DB::table('registro_comportamiento')
            ->join('tipo_comportamiento', 'registro_comportamiento.id_tipo_comportamiento', '=', 'tipo_comportamiento.id')
            ->where('registro_comportamiento.id_estudiante', $personaje->id_estudiante)
            ->where('registro_comportamiento.id_clase', $personaje->id_clase)
            ->where('registro_comportamiento.fecha', '>=', now()->subDays(30))
            ->select('tipo_comportamiento.valor_puntos', 'registro_comportamiento.fecha')
            ->get();
        
        $puntosPositivos = $comportamientos->where('valor_puntos', '>', 0)->sum('valor_puntos');
        $puntosNegativos = abs($comportamientos->where('valor_puntos', '<', 0)->sum('valor_puntos'));
        $totalComportamientos = $comportamientos->count();
        
        return [
            'puntos_positivos_mes' => $puntosPositivos,
            'puntos_negativos_mes' => $puntosNegativos,
            'comportamientos_total_mes' => $totalComportamientos,
            'promedio_diario' => $totalComportamientos > 0 ? round($totalComportamientos / 30, 2) : 0,
            'tendencia' => $puntosPositivos > $puntosNegativos ? 'positiva' : 'negativa',
        ];
    }
    
    /**
     * Enriquece los datos del personaje con información calculada
     */
    private function enrichPersonajeData(Personaje $personaje): array
    {
        $estadisticasExp = $this->experienciaService->obtenerEstadisticasExperiencia($personaje);
        
        return [
            'id' => $personaje->id,
            'nombre' => $personaje->nombre,
            'nivel' => $personaje->nivel,
            'experiencia' => $personaje->experiencia,
            'avatar_base' => $personaje->avatar_base,
            'estudiante' => [
                'id' => $personaje->estudiante->id,
                'nombre' => $personaje->estudiante->usuario->nombre,
                'codigo' => $personaje->estudiante->codigo_estudiante,
            ],
            'clase_rpg' => [
                'id' => $personaje->claseRpg->id,
                'nombre' => $personaje->claseRpg->nombre,
                'descripcion' => $personaje->claseRpg->descripcion,
                'imagen_url' => $personaje->claseRpg->imagen_url,
            ],
            'estadisticas_experiencia' => $estadisticasExp,
            'estadisticas_generales' => [
                'misiones_completadas' => $personaje->estadisticas->misiones_completadas ?? 0,
                'actividades_completadas' => $personaje->estadisticas->actividades_completadas ?? 0,
            ],
        ];
    }
    
    /**
     * Genera un nombre automático para el personaje
     */
    private function generarNombrePersonaje(string $claseRpg): string
    {
        $nombres = [
            'Guerrero' => ['Arthas', 'Ragnar', 'Thorin', 'Conan', 'Aragorn'],
            'Mago' => ['Gandalf', 'Merlin', 'Dumbledore', 'Saruman', 'Radagast'],
            'Arquero' => ['Legolas', 'Robin Hood', 'Hawkeye', 'Artemis', 'Katniss'],
        ];
        
        $listaNombres = $nombres[$claseRpg] ?? ['Aventurero'];
        
        return $listaNombres[array_rand($listaNombres)] . ' ' . rand(100, 999);
    }
    
    /**
     * Verifica que el estudiante esté inscrito en la clase
     */
    private function verificarInscripcionEstudiante(int $estudianteId, int $claseId): void
    {
        $inscripcion = DB::table('clase_estudiante')
            ->where('id_estudiante', $estudianteId)
            ->where('id_clase', $claseId)
            ->where('activo', true)
            ->exists();
            
        if (!$inscripcion) {
            throw new \Exception('El estudiante no está inscrito en esta clase o su inscripción no está activa');
        }
    }
    
    /**
     * Elimina un personaje (soft delete manteniendo estadísticas)
     */
    public function eliminarPersonaje(Personaje $personaje): bool
    {
        DB::beginTransaction();
        
        try {
            // Mantener estadísticas pero marcar personaje como inactivo
            $personaje->delete();
            
            DB::commit();
            return true;
            
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }
}