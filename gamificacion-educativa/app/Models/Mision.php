<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Mision extends Model
{
    use HasFactory;

    protected $table = 'mision';

    protected $fillable = [
        'id_clase',
        'titulo',
        'descripcion',
        'fecha_inicio',
        'fecha_fin',
        'puntos_experiencia_bonus',
        'puntos_moneda_bonus',
        'activa',
        'orden'
    ];

    protected $casts = [
        'fecha_inicio' => 'datetime',
        'fecha_fin' => 'datetime',
        'activa' => 'boolean'
    ];

    // Relaciones
    public function clase()
    {
        return $this->belongsTo(Clase::class, 'id_clase');
    }

    public function actividades()
    {
        return $this->hasMany(Actividad::class, 'id_mision');
    }

    public function progresoEstudiantes()
    {
        return $this->hasMany(ProgresoMision::class, 'id_mision');
    }

    // Métodos auxiliares
    public function estaVencida()
    {
        return $this->fecha_fin && now()->gt($this->fecha_fin);
    }

    public function porcentajeCompletado()
    {
        $totalActividades = $this->actividades()->count();
        if ($totalActividades === 0) return 0;

        $actividadesCompletadas = $this->actividades()
            ->whereHas('entregas', function($query) {
                $query->whereNotNull('nota');
            })
            ->count();

        return ($actividadesCompletadas / $totalActividades) * 100;
    }

    public function estudiantesCompletaron()
    {
        return $this->progresoEstudiantes()
            ->where('completada', true)
            ->count();
    }
}
