<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\TipoComportamiento;

class TipoComportamientoSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $tiposComportamiento = [
            // Comportamientos Positivos (1-20 puntos)
            [
                'nombre' => 'Participación Activa',
                'descripcion' => 'El estudiante participa activamente en clase haciendo preguntas o respondiendo',
                'valor_puntos' => 5,
            ],
            [
                'nombre' => 'Ayuda a Compañero',
                'descripcion' => 'Demuestra colaboración ayudando a un compañero con dificultades',
                'valor_puntos' => 10,
            ],
            [
                'nombre' => 'Liderazgo Positivo',
                'descripcion' => 'Toma iniciativa de manera constructiva en actividades grupales',
                'valor_puntos' => 15,
            ],
            [
                'nombre' => 'Creatividad Excepcional',
                'descripcion' => 'Presenta ideas creativas e innovadoras en sus trabajos',
                'valor_puntos' => 12,
            ],
            [
                'nombre' => 'Puntualidad',
                'descripcion' => 'Llega puntualmente a clase y entrega trabajos a tiempo',
                'valor_puntos' => 3,
            ],
            [
                'nombre' => 'Respeto y Cortesía',
                'descripcion' => 'Demuestra respeto hacia compañeros y docentes',
                'valor_puntos' => 5,
            ],
            [
                'nombre' => 'Esfuerzo Extra',
                'descripcion' => 'Va más allá de lo requerido en sus tareas y actividades',
                'valor_puntos' => 8,
            ],
            [
                'nombre' => 'Mejora Continua',
                'descripcion' => 'Demuestra progreso significativo en su rendimiento',
                'valor_puntos' => 10,
            ],
            [
                'nombre' => 'Organización',
                'descripcion' => 'Mantiene sus materiales y trabajos bien organizados',
                'valor_puntos' => 4,
            ],
            [
                'nombre' => 'Iniciativa Propia',
                'descripcion' => 'Toma iniciativa para aprender por cuenta propia',
                'valor_puntos' => 8,
            ],
            [
                'nombre' => 'Trabajo en Equipo',
                'descripcion' => 'Colabora efectivamente en actividades grupales',
                'valor_puntos' => 6,
            ],
            [
                'nombre' => 'Perseverancia',
                'descripcion' => 'No se rinde ante las dificultades y busca soluciones',
                'valor_puntos' => 10,
            ],
            [
                'nombre' => 'Presentación Destacada',
                'descripcion' => 'Realiza una presentación excepcional frente a la clase',
                'valor_puntos' => 15,
            ],
            [
                'nombre' => 'Reflexión Profunda',
                'descripcion' => 'Demuestra pensamiento crítico y reflexivo en discusiones',
                'valor_puntos' => 8,
            ],

            // Comportamientos Negativos (-1 a -15 puntos)
            [
                'nombre' => 'Llegar Tarde',
                'descripcion' => 'Llega tarde a clase sin justificación válida',
                'valor_puntos' => -2,
            ],
            [
                'nombre' => 'No Participar',
                'descripcion' => 'Se niega a participar en actividades de clase',
                'valor_puntos' => -3,
            ],
            [
                'nombre' => 'Interrupción',
                'descripcion' => 'Interrumpe la clase de manera inapropiada',
                'valor_puntos' => -5,
            ],
            [
                'nombre' => 'Falta de Respeto',
                'descripcion' => 'Muestra falta de respeto hacia compañeros o docentes',
                'valor_puntos' => -10,
            ],
            [
                'nombre' => 'No Entregar Tarea',
                'descripcion' => 'No entrega tareas sin justificación válida',
                'valor_puntos' => -5,
            ],
            [
                'nombre' => 'Uso Inadecuado de Dispositivos',
                'descripcion' => 'Usa dispositivos electrónicos de manera inapropiada en clase',
                'valor_puntos' => -3,
            ],
            [
                'nombre' => 'Actitud Negativa',
                'descripcion' => 'Muestra una actitud negativa que afecta el ambiente de clase',
                'valor_puntos' => -8,
            ],
            [
                'nombre' => 'No Colaborar',
                'descripcion' => 'Se niega a colaborar en actividades grupales',
                'valor_puntos' => -6,
            ],
            [
                'nombre' => 'Desorganización',
                'descripcion' => 'Constantemente desorganizado, olvida materiales',
                'valor_puntos' => -2,
            ],
            [
                'nombre' => 'Plagio',
                'descripcion' => 'Presenta trabajo copiado o plagiado',
                'valor_puntos' => -15,
            ],

            // Comportamientos Neutros de Seguimiento (0 puntos)
            [
                'nombre' => 'Observación General',
                'descripcion' => 'Nota general sobre el comportamiento del estudiante',
                'valor_puntos' => 0,
            ],
            [
                'nombre' => 'Consulta Individual',
                'descripcion' => 'El estudiante realizó una consulta individual fuera de clase',
                'valor_puntos' => 2,
            ],
            [
                'nombre' => 'Ausencia Justificada',
                'descripcion' => 'Falta a clase con justificación válida',
                'valor_puntos' => 0,
            ],
        ];

        foreach ($tiposComportamiento as $tipo) {
            TipoComportamiento::updateOrCreate(
                ['nombre' => $tipo['nombre']],
                $tipo
            );
        }

        $this->command->info('✅ Tipos de comportamiento creados: ' . count($tiposComportamiento));
        $this->mostrarResumenComportamientos($tiposComportamiento);
    }

    /**
     * Mostrar resumen de comportamientos creados
     */
    private function mostrarResumenComportamientos(array $tipos): void
    {
        $positivos = collect($tipos)->where('valor_puntos', '>', 0);
        $negativos = collect($tipos)->where('valor_puntos', '<', 0);
        $neutros = collect($tipos)->where('valor_puntos', '=', 0);

        $this->command->info("\n📊 Resumen de Comportamientos:");
        $this->command->table(
            ['Tipo', 'Cantidad', 'Rango de Puntos'],
            [
                ['Positivos', $positivos->count(), '1 a ' . $positivos->max('valor_puntos') . ' puntos'],
                ['Negativos', $negativos->count(), $negativos->min('valor_puntos') . ' a -1 puntos'],
                ['Neutros', $neutros->count(), '0 puntos'],
            ]
        );

        $this->command->info("\n⭐ Top 5 Comportamientos Positivos:");
        $topPositivos = $positivos->sortByDesc('valor_puntos')->take(5);
        foreach ($topPositivos as $comportamiento) {
            $this->command->line("• {$comportamiento['nombre']} (+{$comportamiento['valor_puntos']} pts): {$comportamiento['descripcion']}");
        }

        $this->command->info("\n⚠️  Comportamientos que Más Penalizan:");
        $topNegativos = $negativos->sortBy('valor_puntos')->take(3);
        foreach ($topNegativos as $comportamiento) {
            $this->command->line("• {$comportamiento['nombre']} ({$comportamiento['valor_puntos']} pts): {$comportamiento['descripcion']}");
        }
    }}