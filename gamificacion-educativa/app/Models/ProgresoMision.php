<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProgresoMision extends Model
{
    use HasFactory;

    protected $table = 'progreso_mision';

    protected $fillable = [
        'id_mision',
        'id_estudiante',
        'actividades_completadas',
        'porcentaje_progreso',
        'completada',
        'fecha_completada',
        'experiencia_bonus_otorgada',
        'moneda_bonus_otorgada'
    ];

    protected $casts = [
        'completada' => 'boolean',
        'experiencia_bonus_otorgada' => 'boolean',
        'moneda_bonus_otorgada' => 'boolean',
        'fecha_completada' => 'datetime'
    ];

    // Relaciones
    public function mision()
    {
        return $this->belongsTo(Mision::class, 'id_mision');
    }

    public function estudiante()
    {
        return $this->belongsTo(Estudiante::class, 'id_estudiante');
    }

    // Métodos auxiliares
    public static function actualizarProgreso($misionId, $estudianteId)
    {
        $mision = Mision::find($misionId);
        $totalActividades = $mision->actividades()->count();
        
        if ($totalActividades === 0) return;

        $actividadesCompletadas = $mision->actividades()
            ->whereHas('entregas', function($query) use ($estudianteId) {
                $query->where('id_estudiante', $estudianteId)
                      ->whereNotNull('nota');
            })
            ->count();

        $porcentaje = ($actividadesCompletadas / $totalActividades) * 100;
        $completada = $porcentaje >= 100;

        $progreso = static::updateOrCreate(
            ['id_mision' => $misionId, 'id_estudiante' => $estudianteId],
            [
                'actividades_completadas' => $actividadesCompletadas,
                'porcentaje_progreso' => $porcentaje,
                'completada' => $completada,
                'fecha_completada' => $completada ? now() : null,
            ]
        );

        // Otorgar bonus si se completó la misión
        if ($completada && !$progreso->experiencia_bonus_otorgada) {
            $progreso->otorgarBonusMision();
        }

        return $progreso;
    }

    public function otorgarBonusMision()
    {
        $personaje = $this->estudiante->personajeEnClase($this->mision->id_clase);
        
        if ($personaje) {
            // Otorgar experiencia bonus
            if ($this->mision->puntos_experiencia_bonus > 0) {
                $personaje->agregarExperiencia($this->mision->puntos_experiencia_bonus);
                $this->update(['experiencia_bonus_otorgada' => true]);
            }

            // Otorgar monedas bonus
            if ($this->mision->puntos_moneda_bonus > 0) {
                TransaccionMoneda::create([
                    'id_estudiante' => $this->id_estudiante,
                    'id_clase' => $this->mision->id_clase,
                    'tipo' => 'ingreso',
                    'cantidad' => $this->mision->puntos_moneda_bonus,
                    'descripcion' => "Bonus por completar misión: {$this->mision->titulo}",
                    'referencia_tipo' => 'mision',
                    'referencia_id' => $this->mision->id,
                ]);
                $this->update(['moneda_bonus_otorgada' => true]);
            }
        }
    }
}