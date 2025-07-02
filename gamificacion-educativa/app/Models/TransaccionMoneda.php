<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TransaccionMoneda extends Model
{
    use HasFactory;

    protected $table = 'transaccion_moneda';

    protected $fillable = [
        'id_estudiante',
        'id_clase',
        'tipo',
        'cantidad',
        'descripcion',
        'referencia_tipo',
        'referencia_id',
        'otorgado_por'
    ];

    // Relaciones
    public function estudiante()
    {
        return $this->belongsTo(Estudiante::class, 'id_estudiante');
    }

    public function clase()
    {
        return $this->belongsTo(Clase::class, 'id_clase');
    }

    public function otorgadoPor()
    {
        return $this->belongsTo(Docente::class, 'otorgado_por');
    }

    // Métodos auxiliares
    public function esIngreso()
    {
        return $this->tipo === 'ingreso';
    }

    public function esGasto()
    {
        return $this->tipo === 'gasto';
    }

    public static function obtenerSaldo($estudianteId, $claseId)
    {
        $ingresos = static::where('id_estudiante', $estudianteId)
            ->where('id_clase', $claseId)
            ->where('tipo', 'ingreso')
            ->sum('cantidad');

        $gastos = static::where('id_estudiante', $estudianteId)
            ->where('id_clase', $claseId)
            ->where('tipo', 'gasto')
            ->sum('cantidad');

        return $ingresos - $gastos;
    }
}
