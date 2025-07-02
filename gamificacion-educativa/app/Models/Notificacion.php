<?php 
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Notificacion extends Model
{
    use HasFactory;

    protected $table = 'notificacion';

    protected $fillable = [
        'id_usuario',
        'titulo',
        'mensaje',
        'tipo',
        'leida',
        'datos',
        'accion_url'
    ];

    protected $casts = [
        'leida' => 'boolean',
        'datos' => 'array'
    ];

    // Relaciones
    public function usuario()
    {
        return $this->belongsTo(Usuario::class, 'id_usuario');
    }

    // Métodos auxiliares
    public static function crearNotificacion($usuarioId, $titulo, $mensaje, $tipo = 'info', $datos = null, $accionUrl = null)
    {
        return static::create([
            'id_usuario' => $usuarioId,
            'titulo' => $titulo,
            'mensaje' => $mensaje,
            'tipo' => $tipo,
            'datos' => $datos,
            'accion_url' => $accionUrl,
        ]);
    }

    public static function notificarSubidaNivel($usuarioId, $personaje, $nivelAnterior)
    {
        return static::crearNotificacion(
            $usuarioId,
            '¡Subiste de nivel!',
            "Tu personaje {$personaje->nombre} ha alcanzado el nivel {$personaje->nivel}. ¡Felicitaciones!",
            'success',
            [
                'personaje_id' => $personaje->id,
                'nivel_anterior' => $nivelAnterior,
                'nivel_actual' => $personaje->nivel,
                'experiencia' => $personaje->experiencia
            ]
        );
    }

    public static function notificarMisionCompletada($usuarioId, $mision)
    {
        return static::crearNotificacion(
            $usuarioId,
            '¡Misión completada!',
            "Has completado la misión: {$mision->titulo}",
            'success',
            ['mision_id' => $mision->id]
        );
    }

    public static function notificarActividadCalificada($usuarioId, $entrega)
    {
        return static::crearNotificacion(
            $usuarioId,
            'Actividad calificada',
            "Tu entrega para '{$entrega->actividad->titulo}' ha sido calificada. Nota: {$entrega->nota}",
            'info',
            [
                'entrega_id' => $entrega->id,
                'actividad_id' => $entrega->actividad->id,
                'nota' => $entrega->nota
            ]
        );
    }
}