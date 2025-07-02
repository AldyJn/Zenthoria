<?php 
// app/Models/EstadisticaClase.php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EstadisticaClase extends Model
{
    use HasFactory;

    protected $table = 'estadistica_clase';

    protected $fillable = [
        'id_clase',
        'promedio_nivel',
        'promedio_participacion',
        'distribucion_niveles'
    ];

    protected $casts = [
        'promedio_nivel' => 'decimal:2',
        'promedio_participacion' => 'decimal:2',
        'distribucion_niveles' => 'array'
    ];

    public function clase()
    {
        return $this->belongsTo(Clase::class, 'id_clase');
    }

    // Métodos auxiliares
    public static function actualizarEstadisticas($claseId)
    {
        $clase = Clase::find($claseId);
        if (!$clase) return;

        $estadistica = static::updateOrCreate(['id_clase' => $claseId]);
        
        // Calcular promedio de nivel
        $estadistica->promedio_nivel = $clase->personajes()->avg('nivel') ?? 0;
        
        // Calcular distribución de niveles
        $distribucion = $clase->personajes()
            ->selectRaw('nivel, COUNT(*) as cantidad')
            ->groupBy('nivel')
            ->pluck('cantidad', 'nivel')
            ->toArray();
            
        $estadistica->distribucion_niveles = $distribucion;
        $estadistica->save();
        
        return $estadistica;
    }
}
