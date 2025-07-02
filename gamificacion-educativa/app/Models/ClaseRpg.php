<?php

// app/Models/ClaseRpg.php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ClaseRpg extends Model
{
    use HasFactory;

    protected $table = 'clase_rpg';

    protected $fillable = [
        'nombre',
        'descripcion',
        'imagen_url'
    ];

    public function personajes()
    {
        return $this->hasMany(Personaje::class, 'id_clase_rpg');
    }

    // Métodos auxiliares
    public static function clasesPorDefecto()
    {
        return [
            'Guerrero' => 'Especialista en combate cuerpo a cuerpo y defensa',
            'Mago' => 'Maestro de las artes arcanas y conocimiento',
            'Arquero' => 'Experto en combate a distancia y agilidad'
        ];
    }
}
