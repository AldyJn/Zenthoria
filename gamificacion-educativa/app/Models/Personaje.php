<?php

// app/Models/Personaje.php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Personaje extends Model
{
    use HasFactory;

    protected $table = 'personaje';

    protected $fillable = [
        'id_estudiante',
        'id_clase',
        'id_clase_rpg',
        'nombre',
        'nivel',
        'experiencia',
        'avatar_base'
    ];

    protected static function boot()
    {
        parent::boot();
        
        static::updating(function ($personaje) {
            // Auto-actualizar nivel basado en experiencia
            $nuevoNivel = NivelExperiencia::calcularNivel($personaje->experiencia);
            if ($nuevoNivel !== $personaje->nivel) {
                $personaje->nivel = $nuevoNivel;
            }
        });
    }

    // Relaciones
    public function estudiante()
    {
        return $this->belongsTo(Estudiante::class, 'id_estudiante');
    }

    public function clase()
    {
        return $this->belongsTo(Clase::class, 'id_clase');
    }

    public function claseRpg()
    {
        return $this->belongsTo(ClaseRpg::class, 'id_clase_rpg');
    }

    public function nivelInfo()
    {
        return $this->belongsTo(NivelExperiencia::class, 'nivel', 'nivel');
    }

    public function estadisticas()
    {
        return $this->hasOne(EstadisticaPersonaje::class, 'id_personaje');
    }

    // Métodos auxiliares
    public function agregarExperiencia($puntos)
    {
        $nivelAnterior = $this->nivel;
        $this->experiencia += $puntos;
        $this->save();
        
        return $this->nivel > $nivelAnterior; // Retorna true si subió de nivel
    }

    public function experienciaParaSiguienteNivel()
    {
        $siguienteExp = NivelExperiencia::experienciaParaSiguienteNivel($this->nivel);
        return $siguienteExp ? $siguienteExp - $this->experiencia : 0;
    }

    public function porcentajeProgreso()
    {
        $expActual = $this->nivelInfo?->experiencia_requerida ?? 0;
        $expSiguiente = NivelExperiencia::experienciaParaSiguienteNivel($this->nivel);
        
        if (!$expSiguiente) return 100;
        
        $progreso = ($this->experiencia - $expActual) / ($expSiguiente - $expActual);
        return max(0, min(100, $progreso * 100));
    }
}
