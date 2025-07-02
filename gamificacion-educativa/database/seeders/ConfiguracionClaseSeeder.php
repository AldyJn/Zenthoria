<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Clase;
use App\Models\ConfiguracionClase;

class ConfiguracionClaseSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Obtener todas las clases existentes
        $clases = Clase::all();

        foreach ($clases as $clase) {
            // Inicializar configuraciones por defecto para cada clase
            $this->inicializarConfiguracionesClase($clase->id);
        }

        $this->command->info('Configuraciones de clase inicializadas para ' . $clases->count() . ' clases.');
    }

    /**
     * Inicializar configuraciones por defecto para una clase específica
     */
    private function inicializarConfiguracionesClase($claseId)
    {
        $configuraciones = [
            // Experiencia y Gamificación
            [
                'clave' => 'experiencia_por_participacion',
                'valor' => '10',
                'tipo' => 'integer'
            ],
            [
                'clave' => 'experiencia_por_actividad_base',
                'valor' => '25',
                'tipo' => 'integer'
            ],
            [
                'clave' => 'multiplicador_experiencia_nota',
                'valor' => '1',
                'tipo' => 'boolean'
            ],
            
            // Sistema de Monedas
            [
                'clave' => 'monedas_por_actividad_base',
                'valor' => '15',
                'tipo' => 'integer'
            ],
            [
                'clave' => 'monedas_por_comportamiento_positivo',
                'valor' => '5',
                'tipo' => 'integer'
            ],
            [
                'clave' => 'monedas_por_asistencia_perfecta_semanal',
                'valor' => '25',
                'tipo' => 'integer'
            ],

            // Comportamiento
            [
                'clave' => 'permitir_comportamiento_negativo',
                'valor' => '1',
                'tipo' => 'boolean'
            ],
            [
                'clave' => 'limite_comportamientos_por_dia',
                'valor' => '5',
                'tipo' => 'integer'
            ],

            // Entregas y Actividades
            [
                'clave' => 'penalizacion_entrega_tardia',
                'valor' => '25',
                'tipo' => 'integer'
            ],
            [
                'clave' => 'dias_gracia_entrega_tardia',
                'valor' => '3',
                'tipo' => 'integer'
            ],
            [
                'clave' => 'nota_minima_aprobatoria',
                'valor' => '11',
                'tipo' => 'integer'
            ],

            // Notificaciones
            [
                'clave' => 'notificar_actividades_proximamente_vencer',
                'valor' => '1',
                'tipo' => 'boolean'
            ],
            [
                'clave' => 'dias_anticipacion_notificacion',
                'valor' => '2',
                'tipo' => 'integer'
            ],
            [
                'clave' => 'notificar_subida_nivel',
                'valor' => '1',
                'tipo' => 'boolean'
            ],

            // Ranking y Competencia
            [
                'clave' => 'mostrar_ranking_publico',
                'valor' => '1',
                'tipo' => 'boolean'
            ],
            [
                'clave' => 'mostrar_solo_top_ranking',
                'valor' => '0',
                'tipo' => 'boolean'
            ],
            [
                'clave' => 'numero_top_ranking',
                'valor' => '10',
                'tipo' => 'integer'
            ],

            // Badges y Logros
            [
                'clave' => 'verificacion_automatica_badges',
                'valor' => '1',
                'tipo' => 'boolean'
            ],
            [
                'clave' => 'experiencia_bonus_por_badge',
                'valor' => '50',
                'tipo' => 'integer'
            ],

            // Configuraciones Avanzadas
            [
                'clave' => 'permitir_reintentos_actividades',
                'valor' => '0',
                'tipo' => 'boolean'
            ],
            [
                'clave' => 'numero_reintentos_permitidos',
                'valor' => '2',
                'tipo' => 'integer'
            ],
            [
                'clave' => 'modo_competitivo',
                'valor' => '0',
                'tipo' => 'boolean'
            ],
        ];

        foreach ($configuraciones as $config) {
            ConfiguracionClase::updateOrCreate(
                [
                    'id_clase' => $claseId,
                    'clave' => $config['clave'],
                ],
                [
                    'valor' => $config['valor'],
                    'tipo' => $config['tipo'],
                ]
            );
        }
    }
}