<?php
namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\NivelExperiencia;

class NivelExperienciaSeeder extends Seeder
{
    public function run(): void
    {
        $niveles = [];
        
        // Crear 50 niveles con experiencia creciente
        for ($nivel = 1; $nivel <= 50; $nivel++) {
            $xpRequerida = $this->calcularExperienciaRequerida($nivel);
            
            $niveles[] = [
                'nivel' => $nivel,
                'experiencia_requerida' => $xpRequerida,
                'recompensas' => json_encode($this->generarRecompensas($nivel)),
                'titulo_desbloqueado' => $this->generarTitulo($nivel)
            ];
        }

        foreach ($niveles as $nivel) {
            NivelExperiencia::updateOrCreate(['nivel' => $nivel['nivel']], $nivel);
        }

        $this->command->info('✅ Niveles de experiencia creados: ' . count($niveles));
    }

    private function calcularExperienciaRequerida($nivel)
    {
        // Fórmula de crecimiento exponencial suave
        return intval(100 * pow($nivel, 1.5));
    }

    private function generarRecompensas($nivel)
    {
        $recompensas = ['monedas' => $nivel * 10];
        
        // Recompensas especiales cada 5 niveles
        if ($nivel % 5 === 0) {
            $recompensas['items_especiales'] = ['Cofre de Tesoro'];
        }
        
        // Recompensas épicas cada 10 niveles
        if ($nivel % 10 === 0) {
            $recompensas['habilidad_especial'] = true;
        }

        return $recompensas;
    }

    private function generarTitulo($nivel)
    {
        $titulos = [
            1 => 'Aprendiz',
            5 => 'Estudiante Dedicado',
            10 => 'Scholar Novato',
            15 => 'Investigador',
            20 => 'Sabio Joven',
            25 => 'Erudito',
            30 => 'Maestro del Conocimiento',
            35 => 'Leyenda Académica',
            40 => 'Gran Sabio',
            45 => 'Maestro Supremo',
            50 => 'Leyenda Eterna'
        ];

        return $titulos[$nivel] ?? null;
    }
}
