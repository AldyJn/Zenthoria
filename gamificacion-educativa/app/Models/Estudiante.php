<?php
// app/Models/Estudiante.php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Estudiante extends Model
{
    use HasFactory;

    protected $table = 'estudiante';

    protected $fillable = [
        'id_usuario',
        'codigo_estudiante',
        'grado',
        'seccion'
    ];

    // Relaciones
    public function usuario()
    {
        return $this->belongsTo(Usuario::class, 'id_usuario');
    }

    public function clases()
    {
        return $this->belongsToMany(
            Clase::class, 
            'clase_estudiante', 
            'id_estudiante', 
            'id_clase'
        )->withPivot('fecha_ingreso', 'activo')->withTimestamps();
    }

    public function personajes()
    {
        return $this->hasMany(Personaje::class, 'id_estudiante');
    }

    public function registrosComportamiento()
    {
        return $this->hasMany(RegistroComportamiento::class, 'id_estudiante');
    }

    public function asistencias()
    {
        return $this->hasMany(Asistencia::class, 'id_estudiante');
    }

    public function entregasActividad()
    {
        return $this->hasMany(EntregaActividad::class, 'id_estudiante');
    }

    // Métodos auxiliares
    public function personajeEnClase($claseId)
    {
        return $this->personajes()->where('id_clase', $claseId)->first();
    }

    public function clasesActivas()
    {
        return $this->clases()->wherePivot('activo', true);
    }
}
