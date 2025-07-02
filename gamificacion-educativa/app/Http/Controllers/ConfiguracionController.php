<?php

namespace App\Http\Controllers;

use App\Models\ConfiguracionClase;
use App\Models\Clase;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

class ConfiguracionController extends Controller
{
    
    use AuthorizesRequests;
    /**
     * Mostrar configuración de la clase
     */
    public function show($claseId)
    {
        $clase = Clase::findOrFail($claseId);
        
        // Solo el docente de la clase puede ver/editar configuración
        abort_unless(
            auth()->user()->esDocente() && 
            $clase->id_docente === auth()->user()->docente->id,
            403
        );

        $configuraciones = ConfiguracionClase::where('id_clase', $claseId)
            ->get()
            ->keyBy('clave');

        // Configuraciones por defecto si no existen
        $configuracionesDefecto = $this->getConfiguracionesDefecto();
        
        // Combinar configuraciones existentes con las por defecto
        $configuracionesFinal = collect($configuracionesDefecto)->map(function ($config, $clave) use ($configuraciones) {
            if ($configuraciones->has($clave)) {
                $config['valor'] = $this->convertirValor(
                    $configuraciones[$clave]->valor,
                    $config['tipo']
                );
            }
            return $config;
        });

        return Inertia::render('Configuracion/Show', [
            'clase' => $clase,
            'configuraciones' => $configuracionesFinal,
        ]);
    }

    /**
     * Actualizar configuración de la clase
     */
    public function update(Request $request, $claseId)
    {
        $clase = Clase::findOrFail($claseId);
        
        abort_unless(
            auth()->user()->esDocente() && 
            $clase->id_docente === auth()->user()->docente->id,
            403
        );

        $configuracionesDefecto = $this->getConfiguracionesDefecto();
        
        // Validar cada configuración
        $validated = [];
        foreach ($configuracionesDefecto as $clave => $config) {
            if ($request->has($clave)) {
                $valor = $request->input($clave);
                
                // Validar según el tipo
                switch ($config['tipo']) {
                    case 'integer':
                        $validated[$clave] = (int) $valor;
                        break;
                    case 'boolean':
                        $validated[$clave] = (bool) $valor;
                        break;
                    case 'json':
                        $validated[$clave] = is_array($valor) ? json_encode($valor) : $valor;
                        break;
                    default:
                        $validated[$clave] = (string) $valor;
                }
            }
        }

        // Actualizar o crear configuraciones
        foreach ($validated as $clave => $valor) {
            ConfiguracionClase::updateOrCreate(
                [
                    'id_clase' => $claseId,
                    'clave' => $clave,
                ],
                [
                    'valor' => is_bool($valor) ? ($valor ? '1' : '0') : (string) $valor,
                    'tipo' => $configuracionesDefecto[$clave]['tipo'],
                ]
            );
        }

        return back()->with('success', 'Configuración actualizada exitosamente.');
    }

    /**
     * Obtener valor de configuración específica
     */
    public static function obtenerConfiguracion($claseId, $clave, $valorDefecto = null)
    {
        $config = ConfiguracionClase::where('id_clase', $claseId)
            ->where('clave', $clave)
            ->first();

        if (!$config) {
            return $valorDefecto;
        }

        // Convertir según el tipo
        switch ($config->tipo) {
            case 'integer':
                return (int) $config->valor;
            case 'boolean':
                return $config->valor === '1' || $config->valor === 'true';
            case 'json':
                return json_decode($config->valor, true);
            default:
                return $config->valor;
        }
    }

    /**
     * Configuraciones por defecto del sistema
     */
    private function getConfiguracionesDefecto(): array
    {
        return [
            // Experiencia y Gamificación
            'experiencia_por_participacion' => [
                'nombre' => 'Experiencia por Participación',
                'descripcion' => 'Puntos de experiencia otorgados por participar en clase',
                'tipo' => 'integer',
                'valor' => 10,
                'categoria' => 'Experiencia',
                'min' => 1,
                'max' => 50,
            ],
            'experiencia_por_actividad_base' => [
                'nombre' => 'Experiencia Base por Actividad',
                'descripcion' => 'Experiencia mínima por completar actividades',
                'tipo' => 'integer',
                'valor' => 25,
                'categoria' => 'Experiencia',
                'min' => 10,
                'max' => 100,
            ],
            'multiplicador_experiencia_nota' => [
                'nombre' => 'Multiplicador por Nota',
                'descripcion' => 'Multiplica la experiencia según la nota obtenida',
                'tipo' => 'boolean',
                'valor' => true,
                'categoria' => 'Experiencia',
            ],
            
            // Sistema de Monedas
            'monedas_por_actividad_base' => [
                'nombre' => 'Monedas Base por Actividad',
                'descripcion' => 'Monedas otorgadas por completar actividades',
                'tipo' => 'integer',
                'valor' => 15,
                'categoria' => 'Monedas',
                'min' => 5,
                'max' => 50,
            ],
            'monedas_por_comportamiento_positivo' => [
                'nombre' => 'Monedas por Comportamiento Positivo',
                'descripcion' => 'Monedas otorgadas por comportamientos positivos',
                'tipo' => 'integer',
                'valor' => 5,
                'categoria' => 'Monedas',
                'min' => 1,
                'max' => 20,
            ],
            'monedas_por_asistencia_perfecta_semanal' => [
                'nombre' => 'Monedas por Asistencia Perfecta',
                'descripcion' => 'Bonus semanal por asistencia perfecta',
                'tipo' => 'integer',
                'valor' => 25,
                'categoria' => 'Monedas',
                'min' => 10,
                'max' => 100,
            ],

            // Comportamiento
            'permitir_comportamiento_negativo' => [
                'nombre' => 'Permitir Comportamientos Negativos',
                'descripcion' => 'Los estudiantes pueden perder puntos por mal comportamiento',
                'tipo' => 'boolean',
                'valor' => true,
                'categoria' => 'Comportamiento',
            ],
            'limite_comportamientos_por_dia' => [
                'nombre' => 'Límite de Comportamientos por Día',
                'descripcion' => 'Máximo de registros de comportamiento por estudiante por día',
                'tipo' => 'integer',
                'valor' => 5,
                'categoria' => 'Comportamiento',
                'min' => 1,
                'max' => 20,
            ],

            // Entregas y Actividades
            'penalizacion_entrega_tardia' => [
                'nombre' => 'Penalización por Entrega Tardía',
                'descripcion' => 'Porcentaje de reducción en experiencia/monedas por entregas tardías',
                'tipo' => 'integer',
                'valor' => 25,
                'categoria' => 'Entregas',
                'min' => 0,
                'max' => 75,
            ],
            'dias_gracia_entrega_tardia' => [
                'nombre' => 'Días de Gracia para Entregas',
                'descripcion' => 'Días después de la fecha límite que se permite entregar',
                'tipo' => 'integer',
                'valor' => 3,
                'categoria' => 'Entregas',
                'min' => 0,
                'max' => 14,
            ],
            'nota_minima_aprobatoria' => [
                'nombre' => 'Nota Mínima Aprobatoria',
                'descripcion' => 'Nota mínima para considerar una actividad aprobada',
                'tipo' => 'integer',
                'valor' => 11,
                'categoria' => 'Entregas',
                'min' => 5,
                'max' => 15,
            ],

            // Notificaciones
            'notificar_actividades_proximamente_vencer' => [
                'nombre' => 'Notificar Actividades por Vencer',
                'descripcion' => 'Enviar notificaciones cuando las actividades están por vencer',
                'tipo' => 'boolean',
                'valor' => true,
                'categoria' => 'Notificaciones',
            ],
            'dias_anticipacion_notificacion' => [
                'nombre' => 'Días de Anticipación',
                'descripcion' => 'Días de anticipación para notificar actividades por vencer',
                'tipo' => 'integer',
                'valor' => 2,
                'categoria' => 'Notificaciones',
                'min' => 1,
                'max' => 7,
            ],
            'notificar_subida_nivel' => [
                'nombre' => 'Notificar Subidas de Nivel',
                'descripcion' => 'Notificar cuando un estudiante sube de nivel',
                'tipo' => 'boolean',
                'valor' => true,
                'categoria' => 'Notificaciones',
            ],

            // Ranking y Competencia
            'mostrar_ranking_publico' => [
                'nombre' => 'Ranking Público',
                'descripcion' => 'Los estudiantes pueden ver el ranking completo de la clase',
                'tipo' => 'boolean',
                'valor' => true,
                'categoria' => 'Ranking',
            ],
            'mostrar_solo_top_ranking' => [
                'nombre' => 'Mostrar Solo Top del Ranking',
                'descripcion' => 'Mostrar solo los mejores estudiantes en el ranking',
                'tipo' => 'boolean',
                'valor' => false,
                'categoria' => 'Ranking',
            ],
            'numero_top_ranking' => [
                'nombre' => 'Número de Top en Ranking',
                'descripcion' => 'Número de estudiantes a mostrar en el top del ranking',
                'tipo' => 'integer',
                'valor' => 10,
                'categoria' => 'Ranking',
                'min' => 3,
                'max' => 50,
            ],

            // Badges y Logros
            'verificacion_automatica_badges' => [
                'nombre' => 'Verificación Automática de Badges',
                'descripcion' => 'Verificar y otorgar badges automáticamente',
                'tipo' => 'boolean',
                'valor' => true,
                'categoria' => 'Badges',
            ],
            'experiencia_bonus_por_badge' => [
                'nombre' => 'Experiencia Bonus por Badge',
                'descripcion' => 'Experiencia adicional otorgada al conseguir badges',
                'tipo' => 'integer',
                'valor' => 50,
                'categoria' => 'Badges',
                'min' => 0,
                'max' => 200,
            ],

            // Configuraciones Avanzadas
            'permitir_reintentos_actividades' => [
                'nombre' => 'Permitir Reintentos',
                'descripcion' => 'Los estudiantes pueden rehacer actividades',
                'tipo' => 'boolean',
                'valor' => false,
                'categoria' => 'Avanzado',
            ],
            'numero_reintentos_permitidos' => [
                'nombre' => 'Número de Reintentos',
                'descripcion' => 'Máximo de reintentos por actividad',
                'tipo' => 'integer',
                'valor' => 2,
                'categoria' => 'Avanzado',
                'min' => 1,
                'max' => 5,
            ],
            'modo_competitivo' => [
                'nombre' => 'Modo Competitivo',
                'descripcion' => 'Habilitar características competitivas adicionales',
                'tipo' => 'boolean',
                'valor' => false,
                'categoria' => 'Avanzado',
            ],
        ];
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
            default:
                return $valor;
        }
    }

    /**
     * Restablecer configuración a valores por defecto
     */
    public function restaurarDefecto($claseId)
    {
        $clase = Clase::findOrFail($claseId);
        
        abort_unless(
            auth()->user()->esDocente() && 
            $clase->id_docente === auth()->user()->docente->id,
            403
        );

        // Eliminar configuraciones personalizadas
        ConfiguracionClase::where('id_clase', $claseId)->delete();

        return back()->with('success', 'Configuración restaurada a valores por defecto.');
    }

    /**
     * Copiar configuración de otra clase
     */
    public function copiarConfiguracion(Request $request, $claseId)
    {
        $clase = Clase::findOrFail($claseId);
        
        abort_unless(
            auth()->user()->esDocente() && 
            $clase->id_docente === auth()->user()->docente->id,
            403
        );

        $validated = $request->validate([
            'clase_origen_id' => 'required|exists:clase,id',
        ]);

        $claseOrigen = Clase::findOrFail($validated['clase_origen_id']);
        
        // Verificar que el docente también sea dueño de la clase origen
        abort_unless($claseOrigen->id_docente === auth()->user()->docente->id, 403);

        $configuracionesOrigen = ConfiguracionClase::where('id_clase', $claseOrigen->id)->get();

        foreach ($configuracionesOrigen as $config) {
            ConfiguracionClase::updateOrCreate(
                [
                    'id_clase' => $claseId,
                    'clave' => $config->clave,
                ],
                [
                    'valor' => $config->valor,
                    'tipo' => $config->tipo,
                ]
            );
        }

        return back()->with('success', 'Configuración copiada exitosamente.');
    }
}