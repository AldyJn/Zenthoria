<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\ClaseRpg;

class ClaseRpgSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $clasesRpg = [
            [
                'nombre' => 'Guerrero',
                'descripcion' => 'Valiente y resistente, siempre dispuesto a enfrentar cualquier desafío. Los guerreros destacan por su determinación y perseverancia.',
                'imagen_url' => '/images/clases-rpg/guerrero.png',
            ],
            [
                'nombre' => 'Mago',
                'descripcion' => 'Sabio y poderoso, domina el conocimiento y la magia del aprendizaje. Los magos sobresalen en materias teóricas y resolución de problemas.',
                'imagen_url' => '/images/clases-rpg/mago.png',
            ],
            [
                'nombre' => 'Arquero',
                'descripcion' => 'Preciso y ágil, siempre da en el blanco con sus respuestas. Los arqueros son excelentes en tareas que requieren precisión y análisis.',
                'imagen_url' => '/images/clases-rpg/arquero.png',
            ],
            [
                'nombre' => 'Sanador',
                'descripcion' => 'Compasivo y sabio, ayuda a sus compañeros y fomenta el trabajo en equipo. Los sanadores destacan en colaboración y apoyo mutuo.',
                'imagen_url' => '/images/clases-rpg/sanador.png',
            ],
            [
                'nombre' => 'Explorador',
                'descripcion' => 'Curioso y aventurero, siempre busca nuevos conocimientos y descubrimientos. Los exploradores sobresalen en investigación y creatividad.',
                'imagen_url' => '/images/clases-rpg/explorador.png',
            ],
            [
                'nombre' => 'Paladín',
                'descripcion' => 'Noble y justo, combina fuerza y sabiduría para liderar con el ejemplo. Los paladines son líderes naturales y mentores.',
                'imagen_url' => '/images/clases-rpg/paladin.png',
            ],
            [
                'nombre' => 'Bardo',
                'descripcion' => 'Carismático y creativo, inspira a otros con su arte y elocuencia. Los bardos destacan en presentaciones y expresión artística.',
                'imagen_url' => '/images/clases-rpg/bardo.png',
            ],
            [
                'nombre' => 'Druida',
                'descripcion' => 'Conectado con la naturaleza y el equilibrio, aporta armonía al grupo. Los druidas sobresalen en ciencias naturales y sostenibilidad.',
                'imagen_url' => '/images/clases-rpg/druida.png',
            ],
        ];

        foreach ($clasesRpg as $clase) {
            ClaseRpg::updateOrCreate(
                ['nombre' => $clase['nombre']],
                $clase
            );
        }

        $this->command->info('✅ Clases RPG creadas: ' . count($clasesRpg));
    }
}