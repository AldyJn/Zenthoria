<?php 
namespace App\Listeners;

use App\Events\NivelSubido;
use App\Models\Notificacion;

class CrearNotificacionNivel
{
    public function handle(NivelSubido $event)
    {
        Notificacion::notificarSubidaNivel(
            $event->personaje->estudiante->usuario->id,
            $event->personaje,
            $event->nivelAnterior
        );
    }
}
