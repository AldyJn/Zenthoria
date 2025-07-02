<?php
// app/Models/TipoActividad.php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TipoActividad extends Model
{
    use HasFactory;

    protected $table = 'tipo_actividad';

    protected $fillable = [
        'nombre',
        'descripcion'
    ];

    public function actividades()
    {
        return $this->hasMany(Actividad::class, 'id_tipo_actividad');
    }

    // Métodos auxiliares
    public static function tiposPorDefecto()
    {
        return [
            'Tarea' => 'Actividad individual para casa',
            'Proyecto' => 'Trabajo grupal extenso',
            'Quiz' => 'Evaluación rápida en clase',
            'Examen' => 'Evaluación formal',
            'Participación' => 'Actividad de participación en clase'
        ];
    }
}