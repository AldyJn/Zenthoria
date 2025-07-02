<?php
namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Clase;
use App\Models\ConfiguracionClase;

class ConfiguracionClaseSeeder extends Seeder
{
    public function run(): void
    {
        $clases = Clase::all();
        
        foreach ($clases as $clase) {
            ConfiguracionClase::updateOrCreate(
                ['id_clase' => $clase->id],
                [
                    'permitir_personajes' => true,
                    'permitir_tienda' => true,
                    'permitir_misiones' => true,
                    'sistema_puntos_activo' => true,
                    'sistema_badges_activo' => true,
                    'moneda_virtual_activa' => true,
                    'configuracion_puntos' => json_encode([
                        'por_tarea_completada' => 10,
                        'por_participacion' => 5,
                        'por_comportamiento_positivo' => 15,
                        'penalizacion_tardanza' => -5,
                        'penalizacion_no_entrega' => -10
                    ]),
                    'configuracion_economia' => json_encode([
                        'monedas_por_actividad' => 50,
                        'monedas_por_nivel' => 100,
                        'bonificacion_excelencia' => 25
                    ]),
                    'limites_sistema' => json_encode([
                        'max_intentos_actividad' => 3,
                        'tiempo_limite_actividad' => 7200, // 2 horas en segundos
                        'max_compras_tienda_dia' => 5
                    ])
                ]
            );
        }

        $this->command->info('✅ Configuraciones de clase inicializadas para ' . $clases->count() . ' clases');
    }
}