<?php
// app/Models/EntregaActividad.php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class EntregaActividad extends Model
{
    use HasFactory;

    protected $table = 'entrega_actividad';

    protected $fillable = [
        'id_actividad',
        'id_estudiante',
        'archivo',
        'fecha_entrega',
        'nota',
        'comentario'
    ];

    protected $casts = [
        'fecha_entrega' => 'datetime',
        'nota' => 'decimal:2'
    ];

    protected static function boot()
    {
        parent::boot();
        
        static::updated(function ($entrega) {
            // Cuando se califica, agregar experiencia
            if ($entrega->wasChanged('nota') && $entrega->nota !== null) {
                $personaje = $entrega->estudiante->personajeEnClase($entrega->actividad->id_clase);
                if ($personaje) {
                    $experiencia = $entrega->calcularExperienciaPorNota();
                    $personaje->agregarExperiencia($experiencia);
                }
            }
        });
    }

    // Relaciones
    public function actividad()
    {
        return $this->belongsTo(Actividad::class, 'id_actividad');
    }

    public function estudiante()
    {
        return $this->belongsTo(Estudiante::class, 'id_estudiante');
    }

    // Métodos auxiliares
    public function fueEntregadaTarde(): bool
    {
        $fechaEntrega = Carbon::parse($this->fecha_entrega);
        $fechaLimite = Carbon::parse($this->actividad->fecha_entrega);

        return $fechaEntrega->gt($fechaLimite);
    }
    public function calcularExperienciaPorNota()
    {
        if (!$this->nota) return 0;
        
        $baseExp = $this->actividad->puntos_experiencia;
        $multiplicador = $this->nota / 20; // Asumiendo escala 0-20
        
        return (int) ($baseExp * $multiplicador);
    }

    public function obtenerCalificacionTexto()
    {
        if (!$this->nota) return 'Sin calificar';
        
        if ($this->nota >= 18) return 'Excelente';
        if ($this->nota >= 15) return 'Bueno';
        if ($this->nota >= 12) return 'Regular';
        return 'Necesita mejorar';
    }
}
