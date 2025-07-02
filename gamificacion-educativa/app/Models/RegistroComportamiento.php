<?php
// app/Models/RegistroComportamiento.php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RegistroComportamiento extends Model
{
    use HasFactory;

    protected $table = 'registro_comportamiento';

    protected $fillable = [
        'id_estudiante',
        'id_clase',
        'id_tipo_comportamiento',
        'descripcion',
        'observacion',
        'fecha'
    ];

    protected $casts = [
        'fecha' => 'datetime'
    ];

    protected static function boot()
    {
        parent::boot();
        
        static::created(function ($registro) {
            // Auto-agregar experiencia al personaje
            $personaje = $registro->estudiante->personajeEnClase($registro->id_clase);
            if ($personaje && $registro->tipoComportamiento->valor_puntos > 0) {
                $personaje->agregarExperiencia($registro->tipoComportamiento->valor_puntos);
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

    public function tipoComportamiento()
    {
        return $this->belongsTo(TipoComportamiento::class, 'id_tipo_comportamiento');
    }
}
