<?php
namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Badge;

class BadgeSeeder extends Seeder
{
    public function run(): void
    {
        $badges = [
            // Badges académicos
            [
                'nombre' => 'Primera Entrega',
                'descripcion' => 'Completar tu primera actividad',
                'imagen_url' => '/images/badges/primera_entrega.png',
                'criterios' => json_encode(['actividades_completadas' => 1]),
                'tipo' => 'academico',
                'rareza' => 'comun'
            ],
            [
                'nombre' => 'Estudiante Dedicado',
                'descripcion' => 'Completar 10 actividades',
                'imagen_url' => '/images/badges/estudiante_dedicado.png',
                'criterios' => json_encode(['actividades_completadas' => 10]),
                'tipo' => 'academico',
                'rareza' => 'raro'
            ],
            [
                'nombre' => 'Maestro del Conocimiento',
                'descripcion' => 'Completar 50 actividades con excelencia',
                'imagen_url' => '/images/badges/maestro_conocimiento.png',
                'criterios' => json_encode(['actividades_completadas' => 50, 'calificacion_promedio' => 90]),
                'tipo' => 'academico',
                'rareza' => 'epico'
            ],
            
            // Badges sociales
            [
                'nombre' => 'Buen Compañero',
                'descripcion' => 'Ayudar a 5 compañeros diferentes',
                'imagen_url' => '/images/badges/buen_companero.png',
                'criterios' => json_encode(['ayudas_prestadas' => 5]),
                'tipo' => 'social',
                'rareza' => 'raro'
            ],
            [
                'nombre' => 'Líder Natural',
                'descripcion' => 'Demostrar liderazgo en 3 proyectos grupales',
                'imagen_url' => '/images/badges/lider_natural.png',
                'criterios' => json_encode(['liderazgo_proyectos' => 3]),
                'tipo' => 'social',
                'rareza' => 'epico'
            ],
            
            // Badges de asistencia
            [
                'nombre' => 'Nunca Falta',
                'descripcion' => 'Asistir perfectamente durante un mes',
                'imagen_url' => '/images/badges/nunca_falta.png',
                'criterios' => json_encode(['asistencia_perfecta_dias' => 30]),
                'tipo' => 'asistencia',
                'rareza' => 'raro'
            ],
            [
                'nombre' => 'Puntualidad',
                'descripcion' => 'Llegar temprano durante 2 semanas',
                'imagen_url' => '/images/badges/puntualidad.png',
                'criterios' => json_encode(['llegadas_tempranas' => 14]),
                'tipo' => 'asistencia',
                'rareza' => 'comun'
            ],
            
            // Badges especiales
            [
                'nombre' => 'Innovador',
                'descripcion' => 'Crear una solución creativa excepcional',
                'imagen_url' => '/images/badges/innovador.png',
                'criterios' => json_encode(['creatividad_excepcional' => 1]),
                'tipo' => 'especial',
                'rareza' => 'legendario'
            ],
            [
                'nombre' => 'Mentor',
                'descripcion' => 'Ayudar a 10 compañeros a mejorar sus calificaciones',
                'imagen_url' => '/images/badges/mentor.png',
                'criterios' => json_encode(['estudiantes_ayudados' => 10]),
                'tipo' => 'especial',
                'rareza' => 'epico'
            ]
        ];

        foreach ($badges as $badge) {
            Badge::updateOrCreate(['nombre' => $badge['nombre']], $badge);
        }

        $this->command->info('✅ Badges creados: ' . count($badges));
    }
}