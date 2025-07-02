<?php 
namespace App\Events;

use App\Models\Personaje;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class ExperienciaGanada
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $personaje;
    public $experienciaGanada;
    public $fuente;

    public function __construct(Personaje $personaje, $experienciaGanada, $fuente = null)
    {
        $this->personaje = $personaje;
        $this->experienciaGanada = $experienciaGanada;
        $this->fuente = $fuente;
    }
}