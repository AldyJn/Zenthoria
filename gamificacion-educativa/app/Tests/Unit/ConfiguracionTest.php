<?php

namespace Tests\Unit;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use App\Models\ConfiguracionClase;
use App\Models\Clase;
use App\Models\Docente;
use App\Models\Usuario;
use App\Models\TipoUsuario;
use App\Models\EstadoUsuario;
use Illuminate\Support\Str;
class ConfiguracionTest extends TestCase
{
    use RefreshDatabase;

    protected $clase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->createTestData();
    }

    private function createTestData()
    {
        $tipoDocente = TipoUsuario::create(['nombre' => 'docente', 'descripcion' => 'Docente']);
        $estadoActivo = EstadoUsuario::create(['nombre' => 'activo', 'descripcion' => 'Activo']);

        $usuarioDocente = Usuario::create([
            'nombre' => 'Prof. Config',
            'correo' => 'config@test.com',
            'contraseña_hash' => bcrypt('password'),
            'salt' => Str::random(128),
            'id_tipo_usuario' => $tipoDocente->id,
            'id_estado' => $estadoActivo->id,
        ]);

        $docente = Docente::create([
            'id_usuario' => $usuarioDocente->id,
            'especialidad' => 'Configuración',
        ]);

        $this->clase = Clase::create([
            'nombre' => 'Clase Config',
            'descripcion' => 'Para testing de configuración',
            'id_docente' => $docente->id,
            'grado' => '10°',
            'seccion' => 'A',
            'año_academico' => 2025,
            'activo' => true,
        ]);
    }

    /** @test */
    public function configuracion_se_puede_establecer_y_obtener()
    {
        ConfiguracionClase::establecer($this->clase->id, 'experiencia_por_participacion', 15, 'integer');

        $valor = ConfiguracionClase::obtener($this->clase->id, 'experiencia_por_participacion');

        $this->assertEquals(15, $valor);
    }

    /** @test */
    public function configuracion_booleana_funciona_correctamente()
    {
        ConfiguracionClase::establecer($this->clase->id, 'permitir_comportamiento_negativo', true, 'boolean');

        $valor = ConfiguracionClase::obtener($this->clase->id, 'permitir_comportamiento_negativo');

        $this->assertTrue($valor);
    }

    /** @test */
    public function configuracion_json_se_maneja_correctamente()
    {
        $data = ['opcion1' => 'valor1', 'opcion2' => 'valor2'];
        ConfiguracionClase::establecer($this->clase->id, 'configuracion_avanzada', json_encode($data), 'json');

        $valor = ConfiguracionClase::obtener($this->clase->id, 'configuracion_avanzada');

        $this->assertEquals($data, $valor);
    }

    /** @test */
    public function obtener_con_defecto_funciona()
    {
        // No existe la configuración, debe devolver el valor por defecto
        $valor = ConfiguracionClase::obtenerConDefecto($this->clase->id, 'experiencia_por_participacion');

        $this->assertEquals(10, $valor); // Valor por defecto del sistema
    }

    /** @test */
    public function inicializar_para_clase_crea_configuraciones_defecto()
    {
        ConfiguracionClase::inicializarParaClase($this->clase->id);

        // Verificar que se crearon algunas configuraciones por defecto
        $this->assertDatabaseHas('configuracion_clase', [
            'id_clase' => $this->clase->id,
            'clave' => 'experiencia_por_participacion',
            'valor' => '10',
        ]);

        $this->assertDatabaseHas('configuracion_clase', [
            'id_clase' => $this->clase->id,
            'clave' => 'multiplicador_experiencia_nota',
            'valor' => '1',
        ]);
    }

    /** @test */
    public function clase_puede_usar_metodos_helper_de_configuracion()
    {
        // Inicializar configuraciones
        ConfiguracionClase::inicializarParaClase($this->clase->id);

        // Usar métodos helper
        $expParticipacion = $this->clase->experienciaPorParticipacion();
        $expActividad = $this->clase->experienciaPorActividad();
        $monedasActividad = $this->clase->monedasPorActividad();

        $this->assertEquals(10, $expParticipacion);
        $this->assertEquals(25, $expActividad);
        $this->assertEquals(15, $monedasActividad);
    }

    /** @test */
    public function configuracion_actualiza_valor_existente()
    {
        // Crear configuración inicial
        ConfiguracionClase::establecer($this->clase->id, 'test_config', 10, 'integer');
        
        $this->assertDatabaseHas('configuracion_clase', [
            'id_clase' => $this->clase->id,
            'clave' => 'test_config',
            'valor' => '10',
        ]);

        // Actualizar valor
        ConfiguracionClase::establecer($this->clase->id, 'test_config', 20, 'integer');

        $this->assertDatabaseHas('configuracion_clase', [
            'id_clase' => $this->clase->id,
            'clave' => 'test_config',
            'valor' => '20',
        ]);

        // No debe haber duplicados
        $count = ConfiguracionClase::where('id_clase', $this->clase->id)
            ->where('clave', 'test_config')
            ->count();
        
        $this->assertEquals(1, $count);
    }

    /** @test */
    public function obtener_todas_de_clase_funciona()
    {
        ConfiguracionClase::establecer($this->clase->id, 'config1', 100, 'integer');
        ConfiguracionClase::establecer($this->clase->id, 'config2', true, 'boolean');
        ConfiguracionClase::establecer($this->clase->id, 'config3', 'texto', 'string');

        $todas = ConfiguracionClase::obtenerTodasDeClase($this->clase->id);

        $this->assertIsArray($todas);
        $this->assertEquals(100, $todas['config1']);
        $this->assertTrue($todas['config2']);
        $this->assertEquals('texto', $todas['config3']);
    }

    /** @test */
    public function conversion_tipos_funciona_correctamente()
    {
        $config = new ConfiguracionClase([
            'valor' => '1',
            'tipo' => 'boolean'
        ]);

        $this->assertTrue($config->valor_convertido);

        $config2 = new ConfiguracionClase([
            'valor' => '0',
            'tipo' => 'boolean'
        ]);

        $this->assertFalse($config2->valor_convertido);

        $config3 = new ConfiguracionClase([
            'valor' => '42',
            'tipo' => 'integer'
        ]);

        $this->assertEquals(42, $config3->valor_convertido);
    }
}