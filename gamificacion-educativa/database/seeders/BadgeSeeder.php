<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Badge;

class BadgeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $badges = [
            // Badges de Nivel
            [
                'nombre' => 'Novato',
                'descripcion' => 'Alcanza el nivel 5',
                'imagen_url' => '/images/badges/novato.png',
                'tipo' => 'nivel',
                'valor_requerido' => 5,
                'criterio' => json_encode(['nivel_minimo' => 5]),
            ],
            [
                'nombre' => 'Estudiante Dedicado',
                'descripcion' => 'Alcanza el nivel 10',
                'imagen_url' => '/images/badges/estudiante-dedicado.png',
                'tipo' => 'nivel',
                'valor_requerido' => 10,
                'criterio' => json_encode(['nivel_minimo' => 10]),
            ],
            [
                'nombre' => 'Académico',
                'descripcion' => 'Alcanza el nivel 20',
                'imagen_url' => '/images/badges/academico.png',
                'tipo' => 'nivel',
                'valor_requerido' => 20,
                'criterio' => json_encode(['nivel_minimo' => 20]),
            ],
            [
                'nombre' => 'Maestro',
                'descripcion' => 'Alcanza el nivel 35',
                'imagen_url' => '/images/badges/maestro.png',
                'tipo' => 'nivel',
                'valor_requerido' => 35,
                'criterio' => json_encode(['nivel_minimo' => 35]),
            ],
            [
                'nombre' => 'Leyenda',
                'descripcion' => 'Alcanza el nivel 50',
                'imagen_url' => '/images/badges/leyenda.png',
                'tipo' => 'nivel',
                'valor_requerido' => 50,
                'criterio' => json_encode(['nivel_minimo' => 50]),
            ],

            // Badges de Actividades Completadas
            [
                'nombre' => 'Primera Entrega',
                'descripcion' => 'Completa tu primera actividad',
                'imagen_url' => '/images/badges/primera-entrega.png',
                'tipo' => 'primera_entrega',
                'valor_requerido' => 1,
                'criterio' => json_encode(['actividades_completadas' => 1]),
            ],
            [
                'nombre' => 'Trabajador',
                'descripcion' => 'Completa 10 actividades',
                'imagen_url' => '/images/badges/trabajador.png',
                'tipo' => 'actividades_completadas',
                'valor_requerido' => 10,
                'criterio' => json_encode(['actividades_completadas' => 10]),
            ],
            [
                'nombre' => 'Productivo',
                'descripcion' => 'Completa 25 actividades',
                'imagen_url' => '/images/badges/productivo.png',
                'tipo' => 'actividades_completadas',
                'valor_requerido' => 25,
                'criterio' => json_encode(['actividades_completadas' => 25]),
            ],
            [
                'nombre' => 'Incansable',
                'descripcion' => 'Completa 50 actividades',
                'imagen_url' => '/images/badges/incansable.png',
                'tipo' => 'actividades_completadas',
                'valor_requerido' => 50,
                'criterio' => json_encode(['actividades_completadas' => 50]),
            ],

            // Badges de Asistencia
            [
                'nombre' => 'Puntual',
                'descripcion' => 'Asistencia perfecta por 7 días consecutivos',
                'imagen_url' => '/images/badges/puntual.png',
                'tipo' => 'asistencia_perfecta',
                'valor_requerido' => 7,
                'criterio' => json_encode(['dias_consecutivos' => 7]),
            ],
            [
                'nombre' => 'Constante',
                'descripcion' => 'Asistencia perfecta por 15 días consecutivos',
                'imagen_url' => '/images/badges/constante.png',
                'tipo' => 'asistencia_perfecta',
                'valor_requerido' => 15,
                'criterio' => json_encode(['dias_consecutivos' => 15]),
            ],
            [
                'nombre' => 'Ejemplar',
                'descripcion' => 'Asistencia perfecta por 30 días consecutivos',
                'imagen_url' => '/images/badges/ejemplar.png',
                'tipo' => 'asistencia_perfecta',
                'valor_requerido' => 30,
                'criterio' => json_encode(['dias_consecutivos' => 30]),
            ],

            // Badges de Comportamiento
            [
                'nombre' => 'Participativo',
                'descripcion' => 'Registra 10 comportamientos positivos',
                'imagen_url' => '/images/badges/participativo.png',
                'tipo' => 'comportamiento_positivo',
                'valor_requerido' => 10,
                'criterio' => json_encode(['comportamientos_positivos' => 10]),
            ],
            [
                'nombre' => 'Colaborador',
                'descripcion' => 'Registra 25 comportamientos positivos',
                'imagen_url' => '/images/badges/colaborador.png',
                'tipo' => 'comportamiento_positivo',
                'valor_requerido' => 25,
                'criterio' => json_encode(['comportamientos_positivos' => 25]),
            ],
            [
                'nombre' => 'Líder',
                'descripcion' => 'Registra 50 comportamientos positivos',
                'imagen_url' => '/images/badges/lider.png',
                'tipo' => 'comportamiento_positivo',
                'valor_requerido' => 50,
                'criterio' => json_encode(['comportamientos_positivos' => 50]),
            ],

            // Badges de Experiencia Total
            [
                'nombre' => 'Aprendiz',
                'descripcion' => 'Acumula 1,000 puntos de experiencia',
                'imagen_url' => '/images/badges/aprendiz.png',
                'tipo' => 'experiencia_total',
                'valor_requerido' => 1000,
                'criterio' => json_encode(['experiencia_total' => 1000]),
            ],
            [
                'nombre' => 'Experto',
                'descripcion' => 'Acumula 5,000 puntos de experiencia',
                'imagen_url' => '/images/badges/experto.png',
                'tipo' => 'experiencia_total',
                'valor_requerido' => 5000,
                'criterio' => json_encode(['experiencia_total' => 5000]),
            ],
            [
                'nombre' => 'Veterano',
                'descripcion' => 'Acumula 10,000 puntos de experiencia',
                'imagen_url' => '/images/badges/veterano.png',
                'tipo' => 'experiencia_total',
                'valor_requerido' => 10000,
                'criterio' => json_encode(['experiencia_total' => 10000]),
            ],

            // Badges de Racha
            [
                'nombre' => 'Puntual en Entregas',
                'descripcion' => 'Entrega 5 actividades a tiempo consecutivamente',
                'imagen_url' => '/images/badges/puntual-entregas.png',
                'tipo' => 'racha_entregas',
                'valor_requerido' => 5,
                'criterio' => json_encode(['entregas_consecutivas_tiempo' => 5]),
            ],
            [
                'nombre' => 'Siempre a Tiempo',
                'descripcion' => 'Entrega 10 actividades a tiempo consecutivamente',
                'imagen_url' => '/images/badges/siempre-tiempo.png',
                'tipo' => 'racha_entregas',
                'valor_requerido' => 10,
                'criterio' => json_encode(['entregas_consecutivas_tiempo' => 10]),
            ],

            // Badges Especiales
            [
                'nombre' => 'Preguntón',
                'descripcion' => 'Realiza 20 participaciones en clase',
                'imagen_url' => '/images/badges/preguntón.png',
                'tipo' => 'participacion_activa',
                'valor_requerido' => 20,
                'criterio' => json_encode(['participaciones' => 20]),
            ],
            [
                'nombre' => 'Perfeccionista',
                'descripcion' => 'Obtén 5 notas perfectas (20/20)',
                'imagen_url' => '/images/badges/perfeccionista.png',
                'tipo' => 'notas_perfectas',
                'valor_requerido' => 5,
                'criterio' => json_encode(['notas_20' => 5]),
            ],
            [
                'nombre' => 'Compañero Ejemplar',
                'descripcion' => 'Ayuda a 10 compañeros (comportamientos de colaboración)',
                'imagen_url' => '/images/badges/compañero-ejemplar.png',
                'tipo' => 'colaboracion',
                'valor_requerido' => 10,
                'criterio' => json_encode(['ayudas_compañeros' => 10]),
            ],
        ];

        foreach ($badges as $badge) {
            Badge::updateOrCreate(
                ['nombre' => $badge['nombre']],
                $badge
            );
        }

        $this->command->info('✅ Badges creados: ' . count($badges));
        $this->mostrarResumenBadges($badges);
    }

    /**
     * Mostrar resumen de badges creados
     */
    private function mostrarResumenBadges(array $badges): void
    {
        $tiposBadges = collect($badges)->groupBy('tipo');
        
        $this->command->info("\n🏆 Resumen de Badges por Tipo:");
        foreach ($tiposBadges as $tipo => $badges) {
            $this->command->line("• {$tipo}: " . $badges->count() . " badges");
        }

        $this->command->info("\n🎯 Badges Fáciles de Obtener:");
        $badgesFaciles = collect($badges)->where('valor_requerido', '<=', 10);
        foreach ($badgesFaciles as $badge) {
            $this->command->line("• {$badge['nombre']}: {$badge['descripcion']}");
        }
    }
}