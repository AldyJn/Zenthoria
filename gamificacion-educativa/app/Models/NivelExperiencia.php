<?php
// app/Models/NivelExperiencia.php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class NivelExperiencia extends Model
{
    use HasFactory;

    protected $table = 'nivel_experiencia';
    protected $primaryKey = 'nivel';
    public $incrementing = false;

    protected $fillable = [
        'nivel',
        'experiencia_requerida',
        'bonificaciones'
    ];

    protected $casts = [
        'bonificaciones' => 'array'
    ];

    public function personajes()
    {
        return $this->hasMany(Personaje::class, 'nivel', 'nivel');
    }

    // Métodos auxiliares
    public static function calcularNivel($experiencia)
    {
        return static::where('experiencia_requerida', '<=', $experiencia)
            ->orderBy('nivel', 'desc')
            ->first()?->nivel ?? 1;
    }

    public static function experienciaParaSiguienteNivel($nivelActual)
    {
        $siguienteNivel = static::where('nivel', '>', $nivelActual)
            ->orderBy('nivel', 'asc')
            ->first();
            
        return $siguienteNivel?->experiencia_requerida;
    }
}