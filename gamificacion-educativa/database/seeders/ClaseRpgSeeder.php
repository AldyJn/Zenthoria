<?php
// database/seeders/ClaseRpgSeeder.php
namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\ClaseRpg;

class ClaseRpgSeeder extends Seeder
{
    public function run(): void
    {
        $clases = [
            [
                'nombre' => 'Guerrero',
                'descripcion' => 'Valiente combatiente especializado en ataques físicos',
                'habilidades_especiales' => json_encode([
                    'Golpe Crítico',
                    'Defensa Férrea',
                    'Resistencia'
                ]),
                'stats_base' => json_encode([
                    'vida' => 120,
                    'mana' => 50,
                    'ataque' => 85,
                    'defensa' => 90
                ]),
                'imagen_url' => '/images/clases/guerrero.png'
            ],
            [
                'nombre' => 'Mago',
                'descripcion' => 'Maestro de las artes arcanas y la magia elemental',
                'habilidades_especiales' => json_encode([
                    'Bola de Fuego',
                    'Escudo Mágico',
                    'Teletransporte'
                ]),
                'stats_base' => json_encode([
                    'vida' => 80,
                    'mana' => 150,
                    'ataque' => 100,
                    'defensa' => 60
                ]),
                'imagen_url' => '/images/clases/mago.png'
            ],
            [
                'nombre' => 'Arquero',
                'descripcion' => 'Experto en combate a distancia con precisión letal',
                'habilidades_especiales' => json_encode([
                    'Disparo Certero',
                    'Lluvia de Flechas',
                    'Sigilo'
                ]),
                'stats_base' => json_encode([
                    'vida' => 90,
                    'mana' => 70,
                    'ataque' => 95,
                    'defensa' => 70
                ]),
                'imagen_url' => '/images/clases/arquero.png'
            ],
            [
                'nombre' => 'Sanador',
                'descripcion' => 'Especialista en magia curativa y apoyo al equipo',
                'habilidades_especiales' => json_encode([
                    'Curación Mayor',
                    'Bendición',
                    'Purificación'
                ]),
                'stats_base' => json_encode([
                    'vida' => 100,
                    'mana' => 130,
                    'ataque' => 60,
                    'defensa' => 85
                ]),
                'imagen_url' => '/images/clases/sanador.png'
            ],
            [
                'nombre' => 'Explorador',
                'descripcion' => 'Aventurero ágil especializado en descubrimiento y supervivencia',
                'habilidades_especiales' => json_encode([
                    'Rastreo',
                    'Trampa de Humo',
                    'Supervivencia'
                ]),
                'stats_base' => json_encode([
                    'vida' => 95,
                    'mana' => 80,
                    'ataque' => 80,
                    'defensa' => 75
                ]),
                'imagen_url' => '/images/clases/explorador.png'
            ]
        ];

        foreach ($clases as $clase) {
            ClaseRpg::updateOrCreate(['nombre' => $clase['nombre']], $clase);
        }

        $this->command->info('✅ Clases RPG creadas: ' . count($clases));
    }
}
