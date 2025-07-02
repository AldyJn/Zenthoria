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
}