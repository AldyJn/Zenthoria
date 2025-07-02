<?php
// app/Models/EstadoTarea.php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EstadoTarea extends Model
{
    use HasFactory;

    protected $table = 'estado_tarea';

    protected $fillable = [
        'nombre',
        'descripcion'
    ];
}
