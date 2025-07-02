<?php 
namespace App\Events;

use App\Models\Mision;
use App\Models\Estudiante;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class MisionCompletada
{
    use Dispatchable, SerializesModels;

    public $mision;
    public $estudiante;

    public function __construct(Mision $mision, Estudiante $estudiante)
    {
        $this->mision = $mision;
        $this->estudiante = $estudiante;
    }
}