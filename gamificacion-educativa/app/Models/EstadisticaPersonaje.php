<?php
// app/Models/EstadisticaPersonaje.php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EstadisticaPersonaje extends Model
{
    use HasFactory;

    protected $table = 'estadistica_personaje';

    protected $fillable = [
        'id_personaje',
        'misiones_completadas',
        'actividades_completadas'
    ];

    public function personaje()
    {
        return $this->belongsTo(Personaje::class, 'id_personaje');
    }

    // Métodos auxiliares
    public function actualizarEstadisticas()
    {
        $this->actividades_completadas = $this->personaje->estudiante
            ->entregasActividad()
            ->whereHas('actividad', function($q) {
                $q->where('id_clase', $this->personaje->id_clase);
            })
            ->whereNotNull('nota')
            ->count();
            
        $this->save();
    }
}