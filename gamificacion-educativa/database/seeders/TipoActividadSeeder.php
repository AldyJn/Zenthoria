<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\TipoActividad;

class TipoActividadSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $tiposActividad = [
            [
                'nombre' => 'Tarea',
                'descripcion' => 'Actividad individual para realizar fuera del aula',
            ],
            [
                'nombre' => 'Proyecto',
                'descripcion' => 'Trabajo extenso que puede ser individual o grupal',
            ],
            [
                'nombre' => 'Quiz',
                'descripcion' => 'Evaluación rápida de conocimientos',
            ],
            [
                'nombre' => 'Examen',
                'descripcion' => 'Evaluación formal de conocimientos',
            ],
            [
                'nombre' => 'Participación',
                'descripcion' => 'Actividad de participación activa en clase',
            ],
            [
                'nombre' => 'Ensayo',
                'descripcion' => 'Composición escrita sobre un tema específico',
            ],
            [
                'nombre' => 'Presentación',
                'descripcion' => 'Exposición oral frente a la clase',
            ],
            [
                'nombre' => 'Laboratorio',
                'descripcion' => 'Práctica experimental o de laboratorio',
            ],
            [
                'nombre' => 'Investigación',
                'descripcion' => 'Trabajo de investigación académica',
            ],
            [
                'nombre' => 'Debate',
                'descripcion' => 'Discusión estructurada sobre un tema',
            ],
        ];

        foreach ($tiposActividad as $tipo) {
            TipoActividad::updateOrCreate(
                ['nombre' => $tipo['nombre']],
                $tipo
            );
        }

        $this->command->info('✅ Tipos de actividad creados: ' . count($tiposActividad));
    }
}