<?php

namespace App\Services;

use App\Models\Personaje;
use App\Models\NivelExperiencia;
use App\Models\RegistroComportamiento;
use App\Models\TipoComportamiento;
use App\Models\EstadisticaPersonaje;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class ExperienciaService
{
    /**
     * Otorga experiencia a un personaje y maneja subida de nivel
     */
    public function otorgarExperiencia(Personaje $personaje, int $experiencia, string $razon = null): array
    {
        DB::beginTransaction();
        
        try {
            $experienciaAnterior = $personaje->experiencia;
            $nivelAnterior = $personaje->nivel;
            
            // Agregar experiencia
            $personaje->experiencia += $experiencia;
            
            // Verificar subida de nivel
            $nuevoNivel = $this->calcularNivelPorExperiencia($personaje->experiencia);
            $subioNivel = false;
            
            if ($nuevoNivel > $personaje->nivel) {
                $personaje->nivel = $nuevoNivel;
                $subioNivel = true;
                
                // Aplicar bonificaciones del nuevo nivel
                $this->aplicarBonificacionesNivel($personaje, $nuevoNivel);
            }
            
            $personaje->save();
            
            // Registrar en log de experiencia si se proporciona razón
            if ($razon) {
                $this->registrarLogExperiencia($personaje, $experiencia, $razon);
            }
            
            DB::commit();
            
            return [
                'subio_nivel' => $subioNivel,
                'nivel_anterior' => $nivelAnterior,
                'nivel_actual' => $personaje->nivel,
                'experiencia_anterior' => $experienciaAnterior,
                'experiencia_actual' => $personaje->experiencia,
                'experiencia_ganada' => $experiencia,
            ];
            
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error al otorgar experiencia: ' . $e->getMessage());
            throw $e;
        }
    }
    
    /**
     * Calcula el nivel basado en la experiencia total
     */
    public function calcularNivelPorExperiencia(int $experienciaTotal): int
    {
        $nivel = NivelExperiencia::where('experiencia_requerida', '<=', $experienciaTotal)
            ->orderBy('nivel', 'desc')
            ->first();
            
        return $nivel ? $nivel->nivel : 1;
    }
    
    /**
     * Obtiene la experiencia necesaria para el siguiente nivel
     */
    public function experienciaParaSiguienteNivel(Personaje $personaje): ?int
    {
        $siguienteNivel = NivelExperiencia::where('nivel', $personaje->nivel + 1)->first();
        
        if (!$siguienteNivel) {
            return null; // Ya está en el nivel máximo
        }
        
        return $siguienteNivel->experiencia_requerida - $personaje->experiencia;
    }
    
    /**
     * Calcula el progreso de experiencia en el nivel actual (0-100%)
     */
    public function progresoNivelActual(Personaje $personaje): float
    {
        $nivelActual = NivelExperiencia::where('nivel', $personaje->nivel)->first();
        $siguienteNivel = NivelExperiencia::where('nivel', $personaje->nivel + 1)->first();
        
        if (!$nivelActual || !$siguienteNivel) {
            return 100.0; // Nivel máximo alcanzado
        }
        
        $experienciaBase = $nivelActual->experiencia_requerida;
        $experienciaSiguiente = $siguienteNivel->experiencia_requerida;
        $experienciaActual = $personaje->experiencia;
        
        $rango = $experienciaSiguiente - $experienciaBase;
        $progreso = $experienciaActual - $experienciaBase;
        
        return $rango > 0 ? min(100, max(0, ($progreso / $rango) * 100)) : 100;
    }
    
    /**
     * Aplica bonificaciones del nivel (opcional, si tienes sistema de bonificaciones)
     */
    private function aplicarBonificacionesNivel(Personaje $personaje, int $nivel): void
    {
        $nivelData = NivelExperiencia::where('nivel', $nivel)->first();
        
        if ($nivelData && $nivelData->bonificaciones) {
            $bonificaciones = json_decode($nivelData->bonificaciones, true);
            
            // Aquí puedes implementar lógica específica según tus bonificaciones
            // Ejemplo: aumentar puntos de salud, energía, etc.
            if (isset($bonificaciones['puntos_salud'])) {
                // $personaje->puntos_salud += $bonificaciones['puntos_salud'];
            }
        }
    }
    
    /**
     * Registra log de experiencia ganada
     */
    private function registrarLogExperiencia(Personaje $personaje, int $experiencia, string $razon): void
    {
        // Esto podría ir en una tabla log_experiencia si la creas
        Log::info("Experiencia otorgada", [
            'personaje_id' => $personaje->id,
            'estudiante_id' => $personaje->id_estudiante,
            'clase_id' => $personaje->id_clase,
            'experiencia' => $experiencia,
            'razon' => $razon,
            'nivel_actual' => $personaje->nivel,
            'experiencia_total' => $personaje->experiencia
        ]);
    }
    
    /**
     * Obtiene estadísticas de experiencia del personaje
     */
    public function obtenerEstadisticasExperiencia(Personaje $personaje): array
    {
        return [
            'nivel_actual' => $personaje->nivel,
            'experiencia_actual' => $personaje->experiencia,
            'experiencia_siguiente_nivel' => $this->experienciaParaSiguienteNivel($personaje),
            'progreso_porcentaje' => $this->progresoNivelActual($personaje),
            'es_nivel_maximo' => $this->experienciaParaSiguienteNivel($personaje) === null,
        ];
    }
    
    /**
     * Otorga experiencia por comportamiento específico
     */
    public function procesarComportamiento(int $estudianteId, int $claseId, int $tipoComportamientoId, string $descripcion = null): array
    {
        $tipoComportamiento = TipoComportamiento::findOrFail($tipoComportamientoId);
        $personaje = Personaje::where('id_estudiante', $estudianteId)
            ->where('id_clase', $claseId)
            ->firstOrFail();
        
        // Registrar comportamiento
        RegistroComportamiento::create([
            'id_estudiante' => $estudianteId,
            'id_clase' => $claseId,
            'id_tipo_comportamiento' => $tipoComportamientoId,
            'descripcion' => $descripcion,
        ]);
        
        // Otorgar experiencia si el comportamiento tiene valor positivo
        if ($tipoComportamiento->valor_puntos > 0) {
            return $this->otorgarExperiencia(
                $personaje, 
                $tipoComportamiento->valor_puntos, 
                "Comportamiento: {$tipoComportamiento->nombre}"
            );
        }
        
        return ['subio_nivel' => false, 'experiencia_ganada' => 0];
    }
}