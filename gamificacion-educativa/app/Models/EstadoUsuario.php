<?php
// app/Models/EstadoUsuario.php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EstadoUsuario extends Model
{
    use HasFactory;

    protected $table = 'estado_usuario';

    protected $fillable = [
        'nombre',
        'descripcion',
    ];

    /**
     * Relación con usuarios
     */
    public function usuarios()
    {
        return $this->hasMany(Usuario::class, 'id_estado');
    }

    /**
     * Scope para estado activo
     */
    public function scopeActivo($query)
    {
        return $query->where('nombre', 'activo');
    }
}