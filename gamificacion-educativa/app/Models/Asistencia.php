<?php
// app/Models/Asistencia.php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Asistencia extends Model
{
    use HasFactory;

    protected $table = 'asistencia';

    protected $fillable = [
        'id_clase',
        'id_estudiante',
        'id_docente',
        'fecha',
        'presente',
        'justificacion'
    ];

    protected $casts = [
        'fecha' => 'date',
        'presente' => 'boolean'
    ];

    // Relaciones
    public function clase()
    {
        return $this->belongsTo(Clase::class, 'id_clase');
    }

    public function estudiante()
    {
        return $this->belongsTo(Estudiante::class, 'id_estudiante');
    }

    public function docente()
    {
        return $this->belongsTo(Docente::class, 'id_docente');
    }

    // Métodos auxiliares
    public static function porcentajeAsistencia($estudianteId, $claseId, $fechaInicio = null, $fechaFin = null)
    {
        $query = static::where('id_estudiante', $estudianteId)
            ->where('id_clase', $claseId);
            
        if ($fechaInicio) $query->where('fecha', '>=', $fechaInicio);
        if ($fechaFin) $query->where('fecha', '<=', $fechaFin);
        
        $total = $query->count();
        $presentes = $query->where('presente', true)->count();
        
        return $total > 0 ? ($presentes / $total) * 100 : 0;
    }
}
