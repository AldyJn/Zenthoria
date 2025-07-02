<?php

namespace Tests\Unit;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use App\Models\Badge;
use App\Models\Estudiante;
use App\Models\Usuario;
use App\Models\TipoUsuario;
use App\Models\EstadoUsuario;
use App\Models\Clase;
use App\Models\Docente;
use App\Models\Personaje;
use App\Models\ClaseRpg;
use App\Models\EstudianteBadge;
use App\Models\EntregaActividad;
use App\Models\Actividad;
use App\Models\TipoActividad;
use App\Http\Controllers\BadgeController;
use Illuminate\Support\Str;
class BadgeServiceTest extends TestCase
{
    use RefreshDatabase;

    protected $estudiante;
    protected $clase;
    protected $badgeController;

    protected function setUp(): void
    {
        parent::setUp();
        $this->createTestData();
        $this->badgeController = new BadgeController();
    }

    private function createTestData()
    {
        // Crear tipos básicos
        $tipoEstudiante = TipoUsuario::create(['nombre' => 'estudiante', 'descripcion' => 'Estudiante']);
        $tipoDocente = TipoUsuario::create(['nombre' => 'docente', 'descripcion' => 'Docente']);
        $estadoActivo = EstadoUsuario::create(['nombre' => 'activo', 'descripcion' => 'Activo']);

        // Crear docente
        $usuarioDocente = Usuario::create([
            'nombre' => 'Prof. Badges',
            'correo' => 'docente@test.com',
            'contraseña_hash' => bcrypt('password'),
            'salt' => Str::random(128),
            'id_tipo_usuario' => $tipoDocente->id,
            'id_estado' => $estadoActivo->id,
        ]);

        $docente = Docente::create([
            'id_usuario' => $usuarioDocente->id,
            'especialidad' => 'Testing Badges',
        ]);

        // Crear estudiante
        $usuarioEstudiante = Usuario::create([
            'nombre' => 'Estudiante Badge',
            'correo' => 'estudiante@test.com',
            'contraseña_hash' => bcrypt('password'),
            'salt' => Str::random(128),
            'id_tipo_usuario' => $tipoEstudiante->id,
            'id_estado' => $estadoActivo->id,
        ]);

        $this->estudiante = Estudiante::create([
            'id_usuario' => $usuarioEstudiante->id,
            'codigo_estudiante' => 'BADGE001',
            'grado' => '10°',
            'seccion' => 'A',
        ]);

        // Crear clase
        $this->clase = Clase::create([
            'nombre' => 'Clase Badges',
            'descripcion' => 'Para testing de badges',
            'id_docente' => $docente->id,
            'grado' => '10°',
            'seccion' => 'A',
            'año_academico' => 2025,
            'activo' => true,
        ]);

        // Crear clase RPG y personaje
        $claseRpg = ClaseRpg::create([
            'nombre' => 'Guerrero',
            'descripcion' => 'Clase guerrera',
        ]);

        Personaje::create([
            'id_estudiante' => $this->estudiante->id,
            'id_clase' => $this->clase->id,
            'id_clase_rpg' => $claseRpg->id,
            'nivel' => 5,
            'experiencia' => 500,
        ]);
    }

    /** @test */
    public function badge_de_nivel_se_otorga_correctamente()
    {
        // Crear badge de nivel 5
        $badge = Badge::create([
            'nombre' => 'Novato',
            'descripcion' => 'Alcanzar nivel 5',
            'tipo' => 'nivel',
            'valor_requerido' => 5,
            'activo' => true,
        ]);

        // Verificar badges
        $badgesOtorgados = $this->badgeController->verificarYOtorgarBadges(
            $this->estudiante->id,
            $this->clase->id
        );

        $this->assertCount(1, $badgesOtorgados);
        $this->assertEquals('Novato', $badgesOtorgados[0]->nombre);
        
        // Verificar que se guardó en la base de datos
        $this->assertDatabaseHas('estudiante_badge', [
            'id_estudiante' => $this->estudiante->id,
            'id_badge' => $badge->id,
            'id_clase' => $this->clase->id,
        ]);
    }

    /** @test */
    public function badge_de_actividades_completadas_funciona()
    {
        // Crear badge de actividades
        $badge = Badge::create([
            'nombre' => 'Trabajador',
            'descripcion' => 'Completar 2 actividades',
            'tipo' => 'actividades_completadas',
            'valor_requerido' => 2,
            'activo' => true,
        ]);

        // Crear tipo de actividad
        $tipoActividad = TipoActividad::create([
            'nombre' => 'Tarea',
            'descripcion' => 'Tarea básica',
        ]);

        // Crear actividades y entregas
        for ($i = 1; $i <= 2; $i++) {
            $actividad = Actividad::create([
                'id_clase' => $this->clase->id,
                'id_tipo_actividad' => $tipoActividad->id,
                'titulo' => "Actividad $i",
                'descripcion' => "Descripción $i",
                'puntos_experiencia' => 25,
                'activa' => true,
            ]);

            EntregaActividad::create([
                'id_actividad' => $actividad->id,
                'id_estudiante' => $this->estudiante->id,
                'nota' => 15, // Nota aprobatoria
                'comentario' => "Entrega $i completada",
            ]);
        }

        // Verificar badge
        $badgesOtorgados = $this->badgeController->verificarYOtorgarBadges(
            $this->estudiante->id,
            $this->clase->id
        );

        $this->assertCount(1, $badgesOtorgados);
        $this->assertEquals('Trabajador', $badgesOtorgados[0]->nombre);
    }

    /** @test */
    public function badge_no_se_otorga_dos_veces()
    {
        $badge = Badge::create([
            'nombre' => 'Único',
            'descripcion' => 'Badge único',
            'tipo' => 'nivel',
            'valor_requerido' => 3,
            'activo' => true,
        ]);

        // Primera verificación
        $badgesOtorgados1 = $this->badgeController->verificarYOtorgarBadges(
            $this->estudiante->id,
            $this->clase->id
        );

        // Segunda verificación
        $badgesOtorgados2 = $this->badgeController->verificarYOtorgarBadges(
            $this->estudiante->id,
            $this->clase->id
        );

        $this->assertCount(1, $badgesOtorgados1);
        $this->assertCount(0, $badgesOtorgados2); // No debe otorgar nuevamente
    }

    /** @test */
    public function badge_inactivo_no_se_otorga()
    {
        $badge = Badge::create([
            'nombre' => 'Inactivo',
            'descripcion' => 'Badge desactivado',
            'tipo' => 'nivel',
            'valor_requerido' => 1,
            'activo' => false, // Inactivo
        ]);

        $badgesOtorgados = $this->badgeController->verificarYOtorgarBadges(
            $this->estudiante->id,
            $this->clase->id
        );

        $this->assertCount(0, $badgesOtorgados);
    }

    /** @test */
    public function primera_entrega_badge_funciona()
    {
        $badge = Badge::create([
            'nombre' => 'Primera Entrega',
            'descripcion' => 'Completar primera actividad',
            'tipo' => 'primera_entrega',
            'valor_requerido' => 1,
            'activo' => true,
        ]);

        $tipoActividad = TipoActividad::create([
            'nombre' => 'Tarea',
            'descripcion' => 'Tarea básica',
        ]);

        $actividad = Actividad::create([
            'id_clase' => $this->clase->id,
            'id_tipo_actividad' => $tipoActividad->id,
            'titulo' => 'Primera Actividad',
            'descripcion' => 'La primera actividad',
            'puntos_experiencia' => 25,
            'activa' => true,
        ]);

        EntregaActividad::create([
            'id_actividad' => $actividad->id,
            'id_estudiante' => $this->estudiante->id,
            'nota' => 12,
            'comentario' => 'Primera entrega histórica',
        ]);

        $badgesOtorgados = $this->badgeController->verificarYOtorgarBadges(
            $this->estudiante->id,
            $this->clase->id
        );

        $this->assertCount(1, $badgesOtorgados);
        $this->assertEquals('Primera Entrega', $badgesOtorgados[0]->nombre);
    }
}

