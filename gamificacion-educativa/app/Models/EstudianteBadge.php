<?php 
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EstudianteBadge extends Model
{
    use HasFactory;

    protected $table = 'estudiante_badge';

    protected $fillable = [
        'id_estudiante',
        'id_badge',
        'id_clase',
        'fecha_obtenido'
    ];

    protected $casts = [
        'fecha_obtenido' => 'datetime'
    ];

    protected static function boot()
    {
        parent::boot();
        
        static::creating(function ($estudianteBadge) {
            $estudianteBadge->fecha_obtenido = now();
        });
    }

    // Relaciones
    public function estudiante()
    {
        return $this->belongsTo(Estudiante::class, 'id_estudiante');
    }

    public function badge()
    {
        return $this->belongsTo(Badge::class, 'id_badge');
    }

    public function clase()
    {
        return $this->belongsTo(Clase::class, 'id_clase');
    }
}