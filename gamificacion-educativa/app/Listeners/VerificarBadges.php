<?php 
namespace App\Listeners;

use App\Events\ExperienciaGanada;
use App\Events\NivelSubido;
use App\Models\Badge;

class VerificarBadges
{
    public function handle($event)
    {
        $personaje = null;
        
        if ($event instanceof ExperienciaGanada) {
            $personaje = $event->personaje;
        } elseif ($event instanceof NivelSubido) {
            $personaje = $event->personaje;
        }
        
        if ($personaje) {
            Badge::verificarBadges(
                $personaje->id_estudiante,
                $personaje->id_clase
            );
        }
    }
}