<?php
// app/Models/InscripcionClase.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class InscripcionClase extends Model
{
    use HasFactory;

    protected $table = 'inscripcion_clase';

    protected $fillable = [
        'id_clase',
        'id_estudiante',
        'fecha_ingreso',
        'activo',
    ];

    protected $casts = [
        'fecha_ingreso' => 'datetime',
        'activo' => 'boolean',
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

    // Scopes
    public function scopeActivas($query)
    {
        return $query->where('activo', true);
    }

    public function scopePorClase($query, $claseId)
    {
        return $query->where('id_clase', $claseId);
    }

    public function scopePorEstudiante($query, $estudianteId)
    {
        return $query->where('id_estudiante', $estudianteId);
    }

    public function scopeEntreFechas($query, $fechaInicio, $fechaFin)
    {
        return $query->whereBetween('fecha_ingreso', [$fechaInicio, $fechaFin]);
    }

    // Métodos auxiliares
    public function activar()
    {
        $this->update(['activo' => true]);
    }

    public function desactivar()
    {
        $this->update(['activo' => false]);
    }

    public function estaActiva()
    {
        return $this->activo;
    }

    public function diasInscrito()
    {
        return $this->fecha_ingreso->diffInDays(now());
    }

    // Método estático para crear inscripción
    public static function inscribir($claseId, $estudianteId)
    {
        return static::create([
            'id_clase' => $claseId,
            'id_estudiante' => $estudianteId,
            'fecha_ingreso' => now(),
            'activo' => true
        ]);
    }

    // Verificar si ya existe una inscripción
    public static function yaEstaInscrito($claseId, $estudianteId)
    {
        return static::where('id_clase', $claseId)
                    ->where('id_estudiante', $estudianteId)
                    ->exists();
    }
}