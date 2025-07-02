<?php

// app/Models/SesionClase.php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SesionClase extends Model
{
    use HasFactory;

    protected $table = 'sesion_clase';

    protected $fillable = [
        'id_clase',
        'fecha_inicio',
        'fecha_fin',
        'activa',
        'duracion_planificada',
        'notas_sesion'
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

    public function asistencias()
    {
        return $this->hasMany(Asistencia::class, 'id_sesion');
    }

    // Métodos auxiliares
    public function duracionEnMinutos()
    {
        if (!$this->fecha_fin) {
            return $this->fecha_inicio->diffInMinutes(now());
        }
        
        return $this->fecha_inicio->diffInMinutes($this->fecha_fin);
    }

    public function estaActiva()
    {
        return $this->activa && !$this->fecha_fin;
    }

    public function puedeTerminar()
    {
        return $this->activa && $this->fecha_inicio;
    }
}
