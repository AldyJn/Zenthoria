<?php 
namespace App\Listeners;

use App\Events\ExperienciaGanada;
use App\Events\NivelSubido;
use App\Models\NivelExperiencia;

class VerificarSubidaNivel
{
    public function handle(ExperienciaGanada $event)
    {
        $personaje = $event->personaje;
        $nivelAnterior = $personaje->nivel;
        
        // Calcular nuevo nivel basado en experiencia total
        $nuevoNivel = NivelExperiencia::calcularNivel($personaje->experiencia);
        
        if ($nuevoNivel > $nivelAnterior) {
            $personaje->update(['nivel' => $nuevoNivel]);
            
            // Disparar evento de subida de nivel
            event(new NivelSubido($personaje, $nivelAnterior, $nuevoNivel));
        }
    }
}
