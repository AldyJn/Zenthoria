<?php 
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Badge extends Model
{
    use HasFactory;

    protected $table = 'badge';

    protected $fillable = [
        'nombre',
        'descripcion',
        'imagen_url',
        'tipo',
        'criterio',
        'valor_requerido',
        'activo'
    ];

    protected $casts = [
        'criterio' => 'array',
        'activo' => 'boolean'
    ];

    // Relaciones
    public function estudiantesBadges()
    {
        return $this->hasMany(EstudianteBadge::class, 'id_badge');
    }

    // Métodos auxiliares
    public static function verificarBadges($estudianteId, $claseId)
    {
        $badges = static::where('activo', true)->get();
        $badgesOtorgados = [];

        foreach ($badges as $badge) {
            if ($badge->cumpleCriterio($estudianteId, $claseId)) {
                $estudianteBadge = EstudianteBadge::firstOrCreate([
                    'id_estudiante' => $estudianteId,
                    'id_badge' => $badge->id,
                    'id_clase' => $claseId,
                ]);

                if ($estudianteBadge->wasRecentlyCreated) {
                    $badgesOtorgados[] = $badge;
                }
            }
        }

        return $badgesOtorgados;
    }

    public function cumpleCriterio($estudianteId, $claseId)
    {
        switch ($this->tipo) {
            case 'nivel':
                $personaje = Personaje::where('id_estudiante', $estudianteId)
                    ->where('id_clase', $claseId)
                    ->first();
                return $personaje && $personaje->nivel >= $this->valor_requerido;

            case 'actividades_completadas':
                $count = EntregaActividad::where('id_estudiante', $estudianteId)
                    ->whereHas('actividad', function($q) use ($claseId) {
                        $q->where('id_clase', $claseId);
                    })
                    ->whereNotNull('nota')
                    ->count();
                return $count >= $this->valor_requerido;

            case 'asistencia_perfecta':
                $porcentaje = Asistencia::porcentajeAsistencia($estudianteId, $claseId);
                return $porcentaje >= $this->valor_requerido;

            case 'comportamiento_positivo':
                $count = RegistroComportamiento::where('id_estudiante', $estudianteId)
                    ->where('id_clase', $claseId)
                    ->whereHas('tipoComportamiento', function($q) {
                        $q->where('valor_puntos', '>', 0);
                    })
                    ->count();
                return $count >= $this->valor_requerido;

            default:
                return false;
        }
    }
}