<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\NivelExperiencia;

class NivelExperienciaSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Crear 50 niveles con progresión exponencial suave
        $niveles = [];
        
        for ($nivel = 1; $nivel <= 50; $nivel++) {
            // Fórmula de experiencia: nivel^1.5 * 100
            $experienciaRequerida = (int) (pow($nivel, 1.5) * 100);
            
            // Bonificaciones especiales cada 5 niveles
            $bonificaciones = [];
            if ($nivel % 5 === 0) {
                $bonificaciones = [
                    'bonus_monedas' => $nivel * 2,
                    'bonus_experiencia_actividades' => 10,
                ];
            }
            
            // Bonificaciones especiales en niveles hito
            if (in_array($nivel, [10, 20, 30, 40, 50])) {
                $bonificaciones['titulo_especial'] = $this->getTituloEspecial($nivel);
                $bonificaciones['badge_desbloqueado'] = true;
            }

            $niveles[] = [
                'nivel' => $nivel,
                'experiencia_requerida' => $experienciaRequerida,
                'bonificaciones' => !empty($bonificaciones) ? json_encode($bonificaciones) : null,
                'created_at' => now(),
                'updated_at' => now(),
            ];
        }

        // Insertar todos los niveles de una vez
        NivelExperiencia::upsert(
            $niveles,
            ['nivel'], // clave única
            ['experiencia_requerida', 'bonificaciones', 'updated_at']
        );

        $this->command->info('✅ Niveles de experiencia creados: ' . count($niveles));
        $this->mostrarProgresionNiveles();
    }

    /**
     * Obtener título especial según el nivel
     */
    private function getTituloEspecial($nivel): string
    {
        return match($nivel) {
            10 => 'Aprendiz Dedicado',
            20 => 'Estudiante Avanzado',
            30 => 'Académico Experimentado',
            40 => 'Maestro del Conocimiento',
            50 => 'Leyenda Educativa',
            default => 'Título Especial'
        };
    }

    /**
     * Mostrar progresión de niveles en consola
     */
    private function mostrarProgresionNiveles(): void
    {
        $this->command->info("\n📊 Progresión de Niveles (primeros 10):");
        $this->command->table(
            ['Nivel', 'Experiencia Requerida', 'Diferencia'],
            collect(range(1, 10))->map(function ($nivel) {
                $experiencia = (int) (pow($nivel, 1.5) * 100);
                $experienciaAnterior = $nivel > 1 ? (int) (pow($nivel - 1, 1.5) * 100) : 0;
                $diferencia = $experiencia - $experienciaAnterior;
                
                return [
                    $nivel,
                    number_format($experiencia),
                    $nivel > 1 ? '+' . number_format($diferencia) : '-'
                ];
            })->toArray()
        );

        $this->command->info("\n🎯 Niveles Hito:");
        foreach ([1, 5, 10, 15, 20, 25, 30, 40, 50] as $nivel) {
            $exp = (int) (pow($nivel, 1.5) * 100);
            $this->command->line("Nivel {$nivel}: " . number_format($exp) . " XP");
        }
    }
}