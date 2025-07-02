<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ItemTienda extends Model
{
    use HasFactory;

    protected $table = 'item_tienda';

    protected $fillable = [
        'id_clase',
        'nombre',
        'descripcion',
        'precio',
        'tipo',
        'imagen_url',
        'disponible',
        'cantidad_limitada',
        'cantidad_disponible'
    ];

    protected $casts = [
        'disponible' => 'boolean',
        'cantidad_limitada' => 'boolean'
    ];

    // Relaciones
    public function clase()
    {
        return $this->belongsTo(Clase::class, 'id_clase');
    }

    public function compras()
    {
        return $this->hasMany(TransaccionMoneda::class, 'referencia_id')
            ->where('referencia_tipo', 'item_tienda')
            ->where('tipo', 'gasto');
    }

    // Métodos auxiliares
    public function puedeComprar($estudianteId = null)
    {
        if (!$this->disponible) return false;
        
        if ($this->cantidad_limitada) {
            $comprasRealizadas = $this->compras()->count();
            if ($comprasRealizadas >= $this->cantidad_disponible) return false;
        }

        return true;
    }

    public function vecesComprado()
    {
        return $this->compras()->count();
    }
}