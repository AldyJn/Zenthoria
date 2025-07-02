<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ConfiguracionClase extends Model
{
    use HasFactory;

    protected $table = 'configuracion_clase';

    protected $fillable = [
        'id_clase',
        'clave',
        'valor',
        'tipo'
    ];

    protected $casts = [
        'id_clase' => 'integer',
    ];

    // Relaciones
    public function clase()
    {
        return $this->belongsTo(Clase::class, 'id_clase');
    }

    // Métodos auxiliares
    
    /**
     * Obtener valor convertido según el tipo
     */
    public function getValorConvertidoAttribute()
    {
        return $this->convertirValor($this->valor, $this->tipo);
    }

    /**
     * Obtener configuración específica de una clase
     */
    public static function obtener($claseId, $clave, $valorDefecto = null)
    {
        $config = static::where('id_clase', $claseId)
            ->where('clave', $clave)
            ->first();

        if (!$config) {
            return $valorDefecto;
        }

        return $config->valor_convertido;
    }

    /**
     * Establecer configuración de una clase
     */
    public static function establecer($claseId, $clave, $valor, $tipo = 'string')
    {
        return static::updateOrCreate(
            [
                'id_clase' => $claseId,
                'clave' => $clave,
            ],
            [
                'valor' => $valor,
                'tipo' => $tipo,
            ]
        );
    }

    /**
     * Obtener todas las configuraciones de una clase como array asociativo
     */
    public static function obtenerTodasDeClase($claseId)
    {
        return static::where('id_clase', $claseId)
            ->get()
            ->mapWithKeys(function ($config) {
                return [$config->clave => $config->valor_convertido];
            })
            ->toArray();
    }

    /**
     * Convertir valor según su tipo
     */
    private function convertirValor($valor, $tipo)
    {
        switch ($tipo) {
            case 'integer':
                return (int) $valor;
            case 'boolean':
                return $valor === '1' || $valor === 'true' || $valor === true;
            case 'json':
                return is_string($valor) ? json_decode($valor, true) : $valor;
            case 'float':
                return (float) $valor;
            default:
                return $valor;
        }
    }

    /**
     * Configuraciones por defecto del sistema
     */
    public static function configuracionesDefecto()
    {
        return [
            // Experiencia y Gamificación
            'experiencia_por_participacion' => [
                'valor' => 10,
                'tipo' => 'integer',
                'categoria' => 'Experiencia',
            ],
            'experiencia_por_actividad_base' => [
                'valor' => 25,
                'tipo' => 'integer',
                'categoria' => 'Experiencia',
            ],
            'multiplicador_experiencia_nota' => [
                'valor' => true,
                'tipo' => 'boolean',
                'categoria' => 'Experiencia',
            ],
            
            // Sistema de Monedas
            'monedas_por_actividad_base' => [
                'valor' => 15,
                'tipo' => 'integer',
                'categoria' => 'Monedas',
            ],
            'monedas_por_comportamiento_positivo' => [
                'valor' => 5,
                'tipo' => 'integer',
                'categoria' => 'Monedas',
            ],
            
            // Entregas y Actividades
            'penalizacion_entrega_tardia' => [
                'valor' => 25,
                'tipo' => 'integer',
                'categoria' => 'Entregas',
            ],
            'nota_minima_aprobatoria' => [
                'valor' => 11,
                'tipo' => 'integer',
                'categoria' => 'Entregas',
            ],
            
            // Notificaciones
            'notificar_actividades_proximamente_vencer' => [
                'valor' => true,
                'tipo' => 'boolean',
                'categoria' => 'Notificaciones',
            ],
            'dias_anticipacion_notificacion' => [
                'valor' => 2,
                'tipo' => 'integer',
                'categoria' => 'Notificaciones',
            ],
            
            // Ranking
            'mostrar_ranking_publico' => [
                'valor' => true,
                'tipo' => 'boolean',
                'categoria' => 'Ranking',
            ],
        ];
    }

    /**
     * Inicializar configuraciones por defecto para una clase
     */
    public static function inicializarParaClase($claseId)
    {
        $configuraciones = static::configuracionesDefecto();
        
        foreach ($configuraciones as $clave => $config) {
            static::updateOrCreate(
                [
                    'id_clase' => $claseId,
                    'clave' => $clave,
                ],
                [
                    'valor' => is_bool($config['valor']) ? ($config['valor'] ? '1' : '0') : (string) $config['valor'],
                    'tipo' => $config['tipo'],
                ]
            );
        }
    }

    /**
     * Verificar si una configuración es válida
     */
    public static function esConfiguracionValida($clave)
    {
        return array_key_exists($clave, static::configuracionesDefecto());
    }

    /**
     * Obtener configuración con valor por defecto si no existe
     */
    public static function obtenerConDefecto($claseId, $clave)
    {
        $configuraciones = static::configuracionesDefecto();
        
        if (!static::esConfiguracionValida($clave)) {
            return null;
        }

        $valor = static::obtener($claseId, $clave);
        
        if ($valor === null) {
            return $configuraciones[$clave]['valor'];
        }

        return $valor;
    }

    // Scopes

    /**
     * Scope para filtrar por clase
     */
    public function scopeDeClase($query, $claseId)
    {
        return $query->where('id_clase', $claseId);
    }

    /**
     * Scope para filtrar por categoría
     */
    public function scopeDeCategoria($query, $categoria)
    {
        $configuraciones = static::configuracionesDefecto();
        $claves = collect($configuraciones)
            ->where('categoria', $categoria)
            ->keys()
            ->toArray();

        return $query->whereIn('clave', $claves);
    }

    /**
     * Scope para configuraciones de tipo específico
     */
    public function scopeDeTipo($query, $tipo)
    {
        return $query->where('tipo', $tipo);
    }
}