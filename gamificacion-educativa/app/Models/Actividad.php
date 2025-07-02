<?php
// app/Models/Actividad.php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Actividad extends Model
{
    use HasFactory;

    protected $table = 'actividad';

    protected $fillable = [
        'id_clase',
        'id_tipo_actividad',
        'titulo',
        'descripcion',
        'fecha_inicio',
        'fecha_entrega',
        'puntos_experiencia',
        'puntos_moneda',
        'activa'
    ];

    protected $casts = [
        'fecha_inicio' => 'datetime',
        'fecha_entrega' => 'datetime',
        'activa' => 'boolean'
    ];

    // Relaciones
    public function clase()
    {
        return $this->belongsTo(Clase::class, 'id_clase');
    }

    public function tipoActividad()
    {
        return $this->belongsTo(TipoActividad::class, 'id_tipo_actividad');
    }

    public function entregas()
    {
        return $this->hasMany(EntregaActividad::class, 'id_actividad');
    }

    // Métodos auxiliares
    public function estaVencida()
    {
        return $this->fecha_entrega && now()->gt($this->fecha_entrega);
    }

    public function porcentajeEntrega()
    {
        $totalEstudiantes = $this->clase->estudiantesActivos()->count();
        $entregasRealizadas = $this->entregas()->count();
        
        return $totalEstudiantes > 0 ? ($entregasRealizadas / $totalEstudiantes) * 100 : 0;
    }

    public function promedioNotas()
    {
        return $this->entregas()->whereNotNull('nota')->avg('nota') ?? 0;
    }

    public function entregaDeEstudiante($estudianteId)
    {
        return $this->entregas()->where('id_estudiante', $estudianteId)->first();
    }
}