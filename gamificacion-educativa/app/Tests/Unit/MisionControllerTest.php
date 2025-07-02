<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\Usuario;
use App\Models\TipoUsuario;
use App\Models\EstadoUsuario;
use App\Models\Docente;
use App\Models\Estudiante;
use App\Models\Clase;
use App\Models\Mision;
use App\Models\Actividad;
use App\Models\TipoActividad;
use App\Models\ProgresoMision;
use App\Models\EntregaActividad;
use Illuminate\Support\Str;
class MisionControllerTest extends TestCase
{
    use RefreshDatabase;

    protected $docente;
    protected $estudiante;
    protected $clase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->createBasicData();
    }

    private function createBasicData()
    {
        // Crear tipos básicos
        $tipoDocente = TipoUsuario::create(['nombre' => 'docente', 'descripcion' => 'Docente']);
        $tipoEstudiante = TipoUsuario::create(['nombre' => 'estudiante', 'descripcion' => 'Estudiante']);
        $estadoActivo = EstadoUsuario::create(['nombre' => 'activo', 'descripcion' => 'Activo']);

        // Crear docente
        $usuarioDocente = Usuario::create([
            'nombre' => 'Prof. Misiones',
            'correo' => 'docente.misiones@test.com',
            'contraseña_hash' => bcrypt('password'),
            'salt' => Str::random(128),
            'id_tipo_usuario' => $tipoDocente->id,
            'id_estado' => $estadoActivo->id,
        ]);

        $this->docente = Docente::create([
            'id_usuario' => $usuarioDocente->id,
            'especialidad' => 'Misiones y Aventuras',
        ]);

        // Crear estudiante
        $usuarioEstudiante = Usuario::create([
            'nombre' => 'Aventurero Test',
            'correo' => 'aventurero@test.com',
            'contraseña_hash' => bcrypt('password'),
            'salt' => Str::random(128),
            'id_tipo_usuario' => $tipoEstudiante->id,
            'id_estado' => $estadoActivo->id,
        ]);

        $this->estudiante = Estudiante::create([
            'id_usuario' => $usuarioEstudiante->id,
            'codigo_estudiante' => 'ADV001',
            'grado' => '10°',
            'seccion' => 'A',
        ]);

        // Crear clase
        $this->clase = Clase::create([
            'nombre' => 'Clase de Aventuras',
            'descripcion' => 'Clase para testing de misiones',
            'id_docente' => $this->docente->id,
            'grado' => '10°',
            'seccion' => 'A',
            'año_academico' => 2025,
            'activo' => true,
            'codigo_invitacion' => 'ADV123',
        ]);

        // Inscribir estudiante
        $this->clase->estudiantes()->attach($this->estudiante->id, ['activo' => true]);
    }

    /** @test */
    public function docente_puede_ver_lista_de_misiones()
    {
        $this->actingAs($this->docente->usuario);

        $mision = Mision::create([
            'id_clase' => $this->clase->id,
            'titulo' => 'La Gran Aventura',
            'descripcion' => 'Una misión épica para conquistar el conocimiento',
            'fecha_inicio' => now(),
            'fecha_fin' => now()->addDays(30),
            'puntos_experiencia_bonus' => 100,
            'puntos_moneda_bonus' => 50,
            'activa' => true,
            'orden' => 1,
        ]);

        $response = $this->get(route('misiones.index', $this->clase->id));

        $response->assertStatus(200);
        $response->assertSee('La Gran Aventura');
    }

    /** @test */
    public function docente_puede_crear_mision()
    {
        $this->actingAs($this->docente->usuario);

        $response = $this->get(route('misiones.create', $this->clase->id));
        $response->assertStatus(200);

        $misionData = [
            'titulo' => 'Nueva Misión Épica',
            'descripcion' => 'Descripción de la nueva misión que cambiará todo',
            'fecha_inicio' => now()->format('Y-m-d H:i:s'),
            'fecha_fin' => now()->addDays(21)->format('Y-m-d H:i:s'),
            'puntos_experiencia_bonus' => 150,
            'puntos_moneda_bonus' => 75,
            'orden' => 1,
        ];

        $response = $this->post(route('misiones.store', $this->clase->id), $misionData);

        $response->assertRedirect();
        $this->assertDatabaseHas('mision', [
            'titulo' => 'Nueva Misión Épica',
            'id_clase' => $this->clase->id,
            'puntos_experiencia_bonus' => 150,
        ]);
    }

    /** @test */
    public function estudiante_no_puede_crear_mision()
    {
        $this->actingAs($this->estudiante->usuario);

        $response = $this->get(route('misiones.create', $this->clase->id));
        $response->assertStatus(403);
    }

    /** @test */
    public function estudiante_puede_ver_misiones_de_su_clase()
    {
        $this->actingAs($this->estudiante->usuario);

        $mision = Mision::create([
            'id_clase' => $this->clase->id,
            'titulo' => 'Misión del Estudiante',
            'descripcion' => 'Una misión visible para estudiantes',
            'fecha_inicio' => now()->subDays(5),
            'fecha_fin' => now()->addDays(15),
            'puntos_experiencia_bonus' => 80,
            'activa' => true,
            'orden' => 1,
        ]);

        $response = $this->get(route('misiones.index', $this->clase->id));

        $response->assertStatus(200);
        $response->assertSee('Misión del Estudiante');
    }

    /** @test */
    public function sistema_crea_progreso_inicial_para_estudiante()
    {
        $this->actingAs($this->estudiante->usuario);

        $mision = Mision::create([
            'id_clase' => $this->clase->id,
            'titulo' => 'Misión con Progreso',
            'descripcion' => 'Para testing de progreso',
            'activa' => true,
            'orden' => 1,
        ]);

        $response = $this->get(route('misiones.show', $mision->id));

        $response->assertStatus(200);
        
        // Verificar que se creó el progreso inicial
        $this->assertDatabaseHas('progreso_mision', [
            'id_mision' => $mision->id,
            'id_estudiante' => $this->estudiante->id,
            'completada' => false,
            'porcentaje_progreso' => 0,
        ]);
    }

    /** @test */
    public function progreso_se_actualiza_al_completar_actividades()
    {
        $this->actingAs($this->estudiante->usuario);

        // Crear tipo de actividad
        $tipoActividad = TipoActividad::create([
            'nombre' => 'Tarea',
            'descripcion' => 'Tarea básica',
        ]);

        // Crear misión
        $mision = Mision::create([
            'id_clase' => $this->clase->id,
            'titulo' => 'Misión Progresiva',
            'descripcion' => 'Misión que progresa con actividades',
            'puntos_experiencia_bonus' => 100,
            'activa' => true,
            'orden' => 1,
        ]);

        // Crear 2 actividades para la misión
        $actividad1 = Actividad::create([
            'id_clase' => $this->clase->id,
            'id_tipo_actividad' => $tipoActividad->id,
            'id_mision' => $mision->id,
            'titulo' => 'Actividad 1 de Misión',
            'descripcion' => 'Primera actividad',
            'puntos_experiencia' => 25,
            'activa' => true,
        ]);

        $actividad2 = Actividad::create([
            'id_clase' => $this->clase->id,
            'id_tipo_actividad' => $tipoActividad->id,
            'id_mision' => $mision->id,
            'titulo' => 'Actividad 2 de Misión',
            'descripcion' => 'Segunda actividad',
            'puntos_experiencia' => 25,
            'activa' => true,
        ]);

        // Completar primera actividad
        EntregaActividad::create([
            'id_actividad' => $actividad1->id,
            'id_estudiante' => $this->estudiante->id,
            'nota' => 15, // Nota aprobatoria
            'comentario' => 'Primera actividad completada',
        ]);

        // Simular actualización de progreso
        $misionController = new \App\Http\Controllers\MisionController(new \App\Services\ExperienciaService());
        $misionController->actualizarProgresoEstudiante($mision->id, $this->estudiante->id);

        // Verificar progreso del 50% (1 de 2 actividades)
        $this->assertDatabaseHas('progreso_mision', [
            'id_mision' => $mision->id,
            'id_estudiante' => $this->estudiante->id,
            'actividades_completadas' => 1,
            'porcentaje_progreso' => 50.00,
            'completada' => false,
        ]);
    }

    /** @test */
    public function mision_se_completa_al_terminar_todas_actividades()
    {
        $tipoActividad = TipoActividad::create([
            'nombre' => 'Tarea',
            'descripcion' => 'Tarea básica',
        ]);

        $mision = Mision::create([
            'id_clase' => $this->clase->id,
            'titulo' => 'Misión Completable',
            'descripcion' => 'Misión que se puede completar',
            'puntos_experiencia_bonus' => 200,
            'puntos_moneda_bonus' => 100,
            'activa' => true,
            'orden' => 1,
        ]);

        // Crear una sola actividad
        $actividad = Actividad::create([
            'id_clase' => $this->clase->id,
            'id_tipo_actividad' => $tipoActividad->id,
            'id_mision' => $mision->id,
            'titulo' => 'Única Actividad',
            'descripcion' => 'La única actividad de la misión',
            'puntos_experiencia' => 50,
            'activa' => true,
        ]);

        // Completar la actividad
        EntregaActividad::create([
            'id_actividad' => $actividad->id,
            'id_estudiante' => $this->estudiante->id,
            'nota' => 18, // Nota aprobatoria
            'comentario' => 'Actividad completada exitosamente',
        ]);

        // Actualizar progreso
        $misionController = new \App\Http\Controllers\MisionController(new \App\Services\ExperienciaService());
        $misionController->actualizarProgresoEstudiante($mision->id, $this->estudiante->id);

        // Verificar que la misión se completó
        $this->assertDatabaseHas('progreso_mision', [
            'id_mision' => $mision->id,
            'id_estudiante' => $this->estudiante->id,
            'actividades_completadas' => 1,
            'porcentaje_progreso' => 100.00,
            'completada' => true,
        ]);
    }

    /** @test */
    public function docente_puede_editar_mision()
    {
        $this->actingAs($this->docente->usuario);

        $mision = Mision::create([
            'id_clase' => $this->clase->id,
            'titulo' => 'Misión Original',
            'descripcion' => 'Descripción original',
            'puntos_experiencia_bonus' => 100,
            'activa' => true,
            'orden' => 1,
        ]);

        $response = $this->get(route('misiones.edit', $mision->id));
        $response->assertStatus(200);

        $response = $this->put(route('misiones.update', $mision->id), [
            'titulo' => 'Misión Editada',
            'descripcion' => 'Descripción editada con nuevos desafíos',
            'fecha_inicio' => now()->format('Y-m-d H:i:s'),
            'fecha_fin' => now()->addDays(45)->format('Y-m-d H:i:s'),
            'puntos_experiencia_bonus' => 150,
            'puntos_moneda_bonus' => 80,
            'orden' => 2,
            'activa' => true,
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('mision', [
            'id' => $mision->id,
            'titulo' => 'Misión Editada',
            'puntos_experiencia_bonus' => 150,
        ]);
    }

    /** @test */
    public function estudiante_no_puede_editar_mision()
    {
        $this->actingAs($this->estudiante->usuario);

        $mision = Mision::create([
            'id_clase' => $this->clase->id,
            'titulo' => 'Misión Protegida',
            'descripcion' => 'No editable por estudiantes',
            'activa' => true,
            'orden' => 1,
        ]);

        $response = $this->get(route('misiones.edit', $mision->id));
        $response->assertStatus(403);
    }

    /** @test */
    public function docente_puede_eliminar_mision()
    {
        $this->actingAs($this->docente->usuario);

        $mision = Mision::create([
            'id_clase' => $this->clase->id,
            'titulo' => 'Misión a Eliminar',
            'descripcion' => 'Esta misión será eliminada',
            'activa' => true,
            'orden' => 1,
        ]);

        $response = $this->delete(route('misiones.destroy', $mision->id));

        $response->assertRedirect();
        $this->assertDatabaseMissing('mision', [
            'id' => $mision->id,
        ]);
    }

    /** @test */
    public function mision_requiere_campos_obligatorios()
    {
        $this->actingAs($this->docente->usuario);

        $response = $this->post(route('misiones.store', $this->clase->id), [
            // No enviar título ni descripción (requeridos)
            'puntos_experiencia_bonus' => 100,
        ]);

        $response->assertSessionHasErrors(['titulo', 'descripcion']);
    }

    /** @test */
    public function fecha_fin_debe_ser_posterior_a_fecha_inicio()
    {
        $this->actingAs($this->docente->usuario);

        $response = $this->post(route('misiones.store', $this->clase->id), [
            'titulo' => 'Misión con Fechas Incorrectas',
            'descripcion' => 'Fechas mal configuradas',
            'fecha_inicio' => now()->addDays(10)->format('Y-m-d H:i:s'),
            'fecha_fin' => now()->addDays(5)->format('Y-m-d H:i:s'), // Anterior a inicio
            'puntos_experiencia_bonus' => 100,
        ]);

        $response->assertSessionHasErrors(['fecha_fin']);
    }

    /** @test */
    public function estudiante_no_inscrito_no_puede_ver_misiones()
    {
        // Crear estudiante no inscrito
        $usuarioNoInscrito = Usuario::create([
            'nombre' => 'No Inscrito',
            'correo' => 'noinscrito@test.com',
            'contraseña_hash' => bcrypt('password'),
            'salt' => str_random(128),
            'id_tipo_usuario' => TipoUsuario::where('nombre', 'estudiante')->first()->id,
            'id_estado' => EstadoUsuario::where('nombre', 'activo')->first()->id,
        ]);

        $estudianteNoInscrito = Estudiante::create([
            'id_usuario' => $usuarioNoInscrito->id,
            'codigo_estudiante' => 'NOINSC001',
            'grado' => '10°',
            'seccion' => 'B',
        ]);

        $this->actingAs($usuarioNoInscrito);

        $response = $this->get(route('misiones.index', $this->clase->id));
        $response->assertStatus(403);
    }

    /** @test */
    public function api_actualizar_todos_los_progresos_funciona()
    {
        $this->actingAs($this->docente->usuario);

        $mision = Mision::create([
            'id_clase' => $this->clase->id,
            'titulo' => 'Misión API',
            'descripcion' => 'Para testing de API',
            'activa' => true,
            'orden' => 1,
        ]);

        $response = $this->post(route('api.misiones.actualizar-progresos', $this->clase->id));

        $response->assertStatus(200);
        $response->assertJsonStructure([
            'message',
            'misiones_actualizadas',
            'estudiantes_procesados',
        ]);
    }
}