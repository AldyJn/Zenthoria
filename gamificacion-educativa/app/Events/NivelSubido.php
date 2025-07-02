<?php 
namespace App\Events;

use App\Models\Personaje;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class NivelSubido
{
    use Dispatchable, SerializesModels;

    public $personaje;
    public $nivelAnterior;
    public $nivelActual;

    public function __construct(Personaje $personaje, $nivelAnterior, $nivelActual)
    {
        $this->personaje = $personaje;
        $this->nivelAnterior = $nivelAnterior;
        $this->nivelActual = $nivelActual;
    }
}