<?php
// app/Models/TipoComportamiento.php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TipoComportamiento extends Model
{
    use HasFactory;

    protected $table = 'tipo_comportamiento';

    protected $fillable = [
        'nombre',
        'descripcion',
        'valor_puntos'
    ];

    public function registros()
    {
        return $this->hasMany(RegistroComportamiento::class, 'id_tipo_comportamiento');
    }

    // Métodos auxiliares
    public static function comportamientosPorDefecto()
    {
        return [
            'Participación Activa' => 10,
            'Respuesta Correcta' => 15,
            'Ayuda a Compañeros' => 20,
            'Entrega Puntual' => 5,
            'Llegada Tarde' => -5,
            'Distracción' => -10,
            'No Entrega' => -15
        ];
    }

    public function esPositivo()
    {
        return $this->valor_puntos > 0;
    }
}