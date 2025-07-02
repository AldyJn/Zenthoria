<?php
// app/Models/Docente.php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Docente extends Model
{
    use HasFactory;

    protected $table = 'docente';

    protected $fillable = [
        'id_usuario',
        'especialidad'
    ];

    // Relaciones
    public function usuario()
    {
        return $this->belongsTo(Usuario::class, 'id_usuario');
    }

    public function clases()
    {
        return $this->hasMany(Clase::class, 'id_docente');
    }

    public function asistenciasRegistradas()
    {
        return $this->hasMany(Asistencia::class, 'id_docente');
    }

    // Métodos auxiliares
    public function clasesActivas()
    {
        return $this->clases()->where('activo', true);
    }

    public function totalEstudiantes()
    {
        return $this->clases()
            ->with('estudiantes')
            ->get()
            ->pluck('estudiantes')
            ->flatten()
            ->unique('id')
            ->count();
    }

    public function totalEstudiantesActivos()
    {
        $totalActivos = 0;
        foreach ($this->clasesActivas as $clase) {
            $totalActivos += $clase->estudiantesActivos()->count();
        }
        return $totalActivos;
    }

    public function estudiantesPorClase()
    {
        return $this->clases()->withCount(['estudiantes' => function ($query) {
            $query->wherePivot('activo', true);
        }])->get();
    }

    public function inscripcionesPorClase()
    {
        return $this->clases()->with(['inscripciones' => function ($query) {
            $query->activas();
        }])->get();
    }
}