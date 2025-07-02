<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;
use App\Models\Usuario;
use App\Models\TipoUsuario;
use App\Models\EstadoUsuario;
use App\Models\Docente;
use App\Models\Estudiante;
use App\Models\Clase;
use App\Models\Actividad;
use App\Models\TipoActividad;
use App\Models\EntregaActividad;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

class ActividadControllerTest extends TestCase
{
    use RefreshDatabase, WithFaker;

    protected $docente;
    protected $estudiante;
    protected $clase;
    protected $tipoActividad;

    protected function setUp(): void
    {
        parent::setUp();
        
        // Crear datos básicos para testing
        $this->createBasicData();
    }

    private function createBasicData()
    {
        // Crear tipos de usuario
        $tipoDocente = TipoUsuario::create(['nombre' => 'docente', 'descripcion' => 'Docente']);
        $tipoEstudiante = TipoUsuario::create(['nombre' => 'estudiante', 'descripcion' => 'Estudiante']);
        $estadoActivo = EstadoUsuario::create(['nombre' => 'activo', 'descripcion' => 'Activo']);

        // Crear usuario docente
        $usuarioDocente = Usuario::create([
            'nombre' => 'Prof. Test',
            'correo' => 'docente@test.com',
            'contraseña_hash' => bcrypt('password'),
            'salt' => str_random(128),
            'id_tipo_usuario' => $tipoDocente->id,
            'id_estado' => $estadoActivo->id,
        ]);

        $this->docente = Docente::create([
            'id_usuario' => $usuarioDocente->id,
            'especialidad' => 'Testing',
        ]);

        // Crear usuario estudiante
        $usuarioEstudiante = Usuario::create([
            'nombre' => 'Estudiante Test',
            'correo' => 'estudiante@test.com',
            'contraseña_hash' => bcrypt('password'),
            'salt' => str_random(128),
            'id_tipo_usuario' => $tipoEstudiante->id,
            'id_estado' => $estadoActivo->id,
        ]);

        $this->estudiante = Estudiante::create([
            'id_usuario' => $usuarioEstudiante->id,
            'codigo_estudiante' => 'EST001',
            'grado' => '10°',
            'seccion' => 'A',
        ]);

        // Crear clase
        $this->clase = Clase::create([
            'nombre' => 'Clase Test',
            'descripcion' => 'Clase para testing',
            'id_docente' => $this->docente->id,
            'grado' => '10°',
            'seccion' => 'A',
            'año_academico' => 2025,
            'activo' => true,
            'codigo_invitacion' => 'TEST123',
        ]);

        // Inscribir estudiante en la clase
        $this->clase->estudiantes()->attach($this->estudiante->id, ['activo' => true]);

        // Crear tipo de actividad
        $this->tipoActividad = TipoActividad::create([
            'nombre' => 'Tarea',
            'descripcion' => 'Tarea para casa',
        ]);
    }

    /** @test */
    public function docente_puede_ver_lista_de_actividades()
    {
        $this->actingAs($this->docente->usuario);

        $actividad = Actividad::create([
            'id_clase' => $this->clase->id,
            'id_tipo_actividad' => $this->tipoActividad->id,
            'titulo' => 'Actividad Test',
            'descripcion' => 'Descripción de prueba',
            'puntos_experiencia' => 25,
            'puntos_moneda' => 15,
            'activa' => true,
        ]);

        $response = $this->get(route('actividades.index', $this->clase->id));

        $response->assertStatus(200);
        $response->assertSee('Actividad Test');
    }

    /** @test */
    public function docente_puede_crear_actividad()
    {
        $this->actingAs($this->docente->usuario);

        $response = $this->get(route('actividades.create', $this->clase->id));
        $response->assertStatus(200);

        $actividadData = [
            'titulo' => 'Nueva Actividad',
            'descripcion' => 'Descripción de la nueva actividad',
            'id_tipo_actividad' => $this->tipoActividad->id,
            'fecha_entrega' => now()->addDays(7)->format('Y-m-d H:i:s'),
            'puntos_experiencia' => 30,
            'puntos_moneda' => 20,
        ];

        $response = $this->post(route('actividades.store', $this->clase->id), $actividadData);

        $response->assertRedirect();
        $this->assertDatabaseHas('actividad', [
            'titulo' => 'Nueva Actividad',
            'id_clase' => $this->clase->id,
        ]);
    }

    /** @test */
    public function estudiante_no_puede_crear_actividad()
    {
        $this->actingAs($this->estudiante->usuario);

        $response = $this->get(route('actividades.create', $this->clase->id));
        $response->assertStatus(403);
    }

    /** @test */
    public function estudiante_puede_ver_actividades_de_su_clase()
    {
        $this->actingAs($this->estudiante->usuario);

        $actividad = Actividad::create([
            'id_clase' => $this->clase->id,
            'id_tipo_actividad' => $this->tipoActividad->id,
            'titulo' => 'Actividad para Estudiante',
            'descripcion' => 'Descripción',
            'puntos_experiencia' => 25,
            'activa' => true,
        ]);

        $response = $this->get(route('actividades.index', $this->clase->id));

        $response->assertStatus(200);
        $response->assertSee('Actividad para Estudiante');
    }

    /** @test */
    public function estudiante_puede_entregar_actividad()
    {
        Storage::fake('public');
        $this->actingAs($this->estudiante->usuario);

        $actividad = Actividad::create([
            'id_clase' => $this->clase->id,
            'id_tipo_actividad' => $this->tipoActividad->id,
            'titulo' => 'Actividad a Entregar',
            'descripcion' => 'Descripción',
            'fecha_entrega' => now()->addDays(7),
            'puntos_experiencia' => 25,
            'activa' => true,
        ]);

        $archivo = UploadedFile::fake()->create('tarea.pdf', 1000, 'application/pdf');

        $response = $this->post(route('actividades.entregar', $actividad->id), [
            'archivo' => $archivo,
            'comentario' => 'Mi entrega de prueba',
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('entrega_actividad', [
            'id_actividad' => $actividad->id,
            'id_estudiante' => $this->estudiante->id,
            'comentario' => 'Mi entrega de prueba',
        ]);
    }

    /** @test */
    public function estudiante_no_puede_entregar_actividad_dos_veces()
    {
        $this->actingAs($this->estudiante->usuario);

        $actividad = Actividad::create([
            'id_clase' => $this->clase->id,
            'id_tipo_actividad' => $this->tipoActividad->id,
            'titulo' => 'Actividad Única',
            'descripcion' => 'Solo una entrega',
            'fecha_entrega' => now()->addDays(7),
            'puntos_experiencia' => 25,
            'activa' => true,
        ]);

        // Primera entrega
        EntregaActividad::create([
            'id_actividad' => $actividad->id,
            'id_estudiante' => $this->estudiante->id,
            'comentario' => 'Primera entrega',
        ]);

        // Intentar segunda entrega
        $response = $this->post(route('actividades.entregar', $actividad->id), [
            'comentario' => 'Segunda entrega',
        ]);

        $response->assertSessionHasErrors();
    }

    /** @test */
    public function docente_puede_calificar_entrega()
    {
        $this->actingAs($this->docente->usuario);

        $actividad = Actividad::create([
            'id_clase' => $this->clase->id,
            'id_tipo_actividad' => $this->tipoActividad->id,
            'titulo' => 'Actividad a Calificar',
            'descripcion' => 'Para calificar',
            'puntos_experiencia' => 25,
            'activa' => true,
        ]);

        $entrega = EntregaActividad::create([
            'id_actividad' => $actividad->id,
            'id_estudiante' => $this->estudiante->id,
            'comentario' => 'Entrega del estudiante',
        ]);

        $response = $this->put(route('actividades.calificar', $entrega->id), [
            'nota' => 18.5,
            'comentario' => 'Excelente trabajo',
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('entrega_actividad', [
            'id' => $entrega->id,
            'nota' => 18.5,
            'comentario' => 'Excelente trabajo',
        ]);
    }

    /** @test */
    public function estudiante_no_puede_calificar_entregas()
    {
        $this->actingAs($this->estudiante->usuario);

        $actividad = Actividad::create([
            'id_clase' => $this->clase->id,
            'id_tipo_actividad' => $this->tipoActividad->id,
            'titulo' => 'Actividad',
            'descripcion' => 'Descripción',
            'puntos_experiencia' => 25,
            'activa' => true,
        ]);

        $entrega = EntregaActividad::create([
            'id_actividad' => $actividad->id,
            'id_estudiante' => $this->estudiante->id,
            'comentario' => 'Entrega',
        ]);

        $response = $this->put(route('actividades.calificar', $entrega->id), [
            'nota' => 20,
            'comentario' => 'Intento de calificar',
        ]);

        $response->assertStatus(403);
    }

    /** @test */
    public function docente_puede_editar_actividad()
    {
        $this->actingAs($this->docente->usuario);

        $actividad = Actividad::create([
            'id_clase' => $this->clase->id,
            'id_tipo_actividad' => $this->tipoActividad->id,
            'titulo' => 'Actividad Original',
            'descripcion' => 'Descripción original',
            'puntos_experiencia' => 25,
            'activa' => true,
        ]);

        $response = $this->get(route('actividades.edit', $actividad->id));
        $response->assertStatus(200);

        $response = $this->put(route('actividades.update', $actividad->id), [
            'titulo' => 'Actividad Editada',
            'descripcion' => 'Descripción editada',
            'id_tipo_actividad' => $this->tipoActividad->id,
            'puntos_experiencia' => 30,
            'puntos_moneda' => 20,
            'activa' => true,
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('actividad', [
            'id' => $actividad->id,
            'titulo' => 'Actividad Editada',
            'puntos_experiencia' => 30,
        ]);
    }

    /** @test */
    public function docente_puede_eliminar_actividad()
    {
        $this->actingAs($this->docente->usuario);

        $actividad = Actividad::create([
            'id_clase' => $this->clase->id,
            'id_tipo_actividad' => $this->tipoActividad->id,
            'titulo' => 'Actividad a Eliminar',
            'descripcion' => 'Para eliminar',
            'puntos_experiencia' => 25,
            'activa' => true,
        ]);

        $response = $this->delete(route('actividades.destroy', $actividad->id));

        $response->assertRedirect();
        $this->assertDatabaseMissing('actividad', [
            'id' => $actividad->id,
        ]);
    }

    /** @test */
    public function actividad_requiere_campos_obligatorios()
    {
        $this->actingAs($this->docente->usuario);

        $response = $this->post(route('actividades.store', $this->clase->id), [
            // No enviar título (requerido)
            'descripcion' => 'Sin título',
        ]);

        $response->assertSessionHasErrors(['titulo']);
    }

    /** @test */
    public function estudiante_no_inscrito_no_puede_ver_actividades()
    {
        // Crear otro estudiante no inscrito
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
            'codigo_estudiante' => 'EST002',
            'grado' => '10°',
            'seccion' => 'B',
        ]);

        $this->actingAs($usuarioNoInscrito);

        $response = $this->get(route('actividades.index', $this->clase->id));
        $response->assertStatus(403);
    }

    /** @test */
    public function validacion_fecha_entrega_actividad()
    {
        $this->actingAs($this->docente->usuario);

        // Fecha de entrega anterior a fecha de inicio
        $response = $this->post(route('actividades.store', $this->clase->id), [
            'titulo' => 'Actividad con Fechas Incorrectas',
            'descripcion' => 'Fechas mal configuradas',
            'id_tipo_actividad' => $this->tipoActividad->id,
            'fecha_inicio' => now()->addDays(10)->format('Y-m-d H:i:s'),
            'fecha_entrega' => now()->addDays(5)->format('Y-m-d H:i:s'), // Anterior a inicio
            'puntos_experiencia' => 25,
        ]);

        $response->assertSessionHasErrors(['fecha_entrega']);
    }
}