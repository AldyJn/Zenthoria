<?php
// app/Models/Clase.php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Clase extends Model
{
    use HasFactory;

    protected $table = 'clase';

    protected $fillable = [
        'nombre',
        'descripcion',
        'id_docente',
        'grado',
        'seccion',
        'año_academico',
        'activo',
        'codigo_invitacion',
        'qr_url',
        'fecha_inicio',
        'fecha_fin'
    ];

    protected $casts = [
        'activo' => 'boolean',
        'fecha_inicio' => 'date',
        'fecha_fin' => 'date'
    ];

    protected static function boot()
    {
        parent::boot();
        
        static::creating(function ($clase) {
            if (!$clase->codigo_invitacion) {
                $clase->codigo_invitacion = static::generarCodigoUnico();
            }
        });
    }

    // Relaciones
    public function docente()
    {
        return $this->belongsTo(Docente::class, 'id_docente');
    }

    public function estudiantes()
    {
        return $this->belongsToMany(
            Estudiante::class, 
            'clase_estudiante', 
            'id_clase', 
            'id_estudiante'
        )->withPivot('fecha_ingreso', 'activo')->withTimestamps();
    }

    public function personajes()
    {
        return $this->hasMany(Personaje::class, 'id_clase');
    }

    public function actividades()
    {
        return $this->hasMany(Actividad::class, 'id_clase');
    }

    public function registrosComportamiento()
    {
        return $this->hasMany(RegistroComportamiento::class, 'id_clase');
    }

    public function asistencias()
    {
        return $this->hasMany(Asistencia::class, 'id_clase');
    }

    public function estadisticas()
    {
        return $this->hasOne(EstadisticaClase::class, 'id_clase');
    }

    // Métodos auxiliares
    public static function generarCodigoUnico()
    {
        do {
            $codigo = strtoupper(Str::random(6));
        } while (static::where('codigo_invitacion', $codigo)->exists());
        
        return $codigo;
    }

    public function estudiantesActivos()
    {
        return $this->estudiantes()->wherePivot('activo', true);
    }

    public function agregarEstudiante($estudianteId)
    {
        return $this->estudiantes()->attach($estudianteId, [
            'fecha_ingreso' => now(),
            'activo' => true
        ]);
    }

    public function promedioNivel()
    {
        return $this->personajes()->avg('nivel') ?? 0;
    }

    public function totalExperiencia()
    {
        return $this->personajes()->sum('experiencia');
    }
}