<?php
namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\TipoComportamiento;

class TipoComportamientoSeeder extends Seeder
{
    public function run(): void
    {
        $comportamientos = [
            // Comportamientos positivos
            [
                'nombre' => 'Participación Activa',
                'descripcion' => 'Participa activamente en clase y discusiones',
                'puntos' => 15,
                'tipo' => 'positivo',
                'icono' => '🙋‍♂️'
            ],
            [
                'nombre' => 'Ayuda a Compañeros',
                'descripcion' => 'Ayuda a otros estudiantes con sus tareas',
                'puntos' => 20,
                'tipo' => 'positivo',
                'icono' => '🤝'
            ],
            [
                'nombre' => 'Entrega Puntual',
                'descripcion' => 'Entrega tareas y proyectos a tiempo',
                'puntos' => 10,
                'tipo' => 'positivo',
                'icono' => '⏰'
            ],
            [
                'nombre' => 'Creatividad Excepcional',
                'descripcion' => 'Demuestra creatividad sobresaliente en trabajos',
                'puntos' => 25,
                'tipo' => 'positivo',
                'icono' => '🎨'
            ],
            [
                'nombre' => 'Liderazgo',
                'descripcion' => 'Demuestra habilidades de liderazgo en grupo',
                'puntos' => 30,
                'tipo' => 'positivo',
                'icono' => '👑'
            ],
            
            // Comportamientos negativos
            [
                'nombre' => 'Llegada Tardía',
                'descripcion' => 'Llegar tarde a clase sin justificación',
                'puntos' => -5,
                'tipo' => 'negativo',
                'icono' => '⏱️'
            ],
            [
                'nombre' => 'No Entrega de Tarea',
                'descripcion' => 'No entregar tareas asignadas',
                'puntos' => -10,
                'tipo' => 'negativo',
                'icono' => '📝'
            ],
            [
                'nombre' => 'Disrupción en Clase',
                'descripcion' => 'Interrumpir o distraer durante la clase',
                'puntos' => -15,
                'tipo' => 'negativo',
                'icono' => '🔊'
            ],
            [
                'nombre' => 'Falta de Respeto',
                'descripcion' => 'Mostrar falta de respeto hacia compañeros o docente',
                'puntos' => -25,
                'tipo' => 'negativo',
                'icono' => '🚫'
            ]
        ];

        foreach ($comportamientos as $comportamiento) {
            TipoComportamiento::updateOrCreate(
                ['nombre' => $comportamiento['nombre']], 
                $comportamiento
            );
        }

        $this->command->info('✅ Tipos de comportamiento creados: ' . count($comportamientos));
    }
}