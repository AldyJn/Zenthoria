<?php
// database/seeders/DatosPruebaSeeder.php - VERSIÓN CORREGIDA

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Usuario;
use App\Models\TipoUsuario;
use App\Models\EstadoUsuario;
use App\Models\Estudiante;
use App\Models\Docente;
use App\Models\Clase;
use App\Models\Personaje;
use App\Models\Actividad;
use App\Models\EntregaActividad;
use App\Models\Mision;
use App\Models\RegistroComportamiento;
use App\Models\Asistencia;
use App\Models\TransaccionMoneda;
use App\Models\ItemTienda;
use App\Models\InscripcionClase; // ✅ USAR EL MODELO CORRECTO
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use Illuminate\Support\Str;

class DatosPruebaSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->command->info('🌱 Generando datos de prueba...');

        // Verificar que existen los tipos básicos
        $this->verificarDatosBase();

        // Crear usuarios de prueba
        $docente = $this->crearDocentePrueba();
        $estudiantes = $this->crearEstudiantesPrueba();

        // Crear clase de prueba
        $clase = $this->crearClasePrueba($docente);

        // Inscribir estudiantes en la clase
        $this->inscribirEstudiantesEnClase($clase, $estudiantes);

        // Crear personajes para estudiantes
        $personajes = $this->crearPersonajesEstudiantes($clase, $estudiantes);

        // Crear misiones
        $misiones = $this->crearMisionesPrueba($clase);

        // Crear actividades
        $actividades = $this->crearActividadesPrueba($clase, $misiones);

        // Crear entregas de actividades
        $this->crearEntregasPrueba($actividades, $estudiantes);

        // Crear registros de comportamiento
        $this->crearComportamientosPrueba($clase, $estudiantes);

        // Crear registros de asistencia
        $this->crearAsistenciasPrueba($clase, $estudiantes);

        // Crear items de tienda
        $this->crearItemsTiendaPrueba($clase);

        // Crear transacciones de monedas
        $this->crearTransaccionesPrueba($clase, $estudiantes);

        $this->command->info('✅ Datos de prueba generados exitosamente!');
        $this->mostrarResumenDatos();
    }

    private function verificarDatosBase()
    {
        // Crear tipos de usuario si no existen
        TipoUsuario::firstOrCreate(['nombre' => 'estudiante'], ['descripcion' => 'Usuario estudiante']);
        TipoUsuario::firstOrCreate(['nombre' => 'docente'], ['descripcion' => 'Usuario docente']);

        // Crear estados de usuario si no existen
        EstadoUsuario::firstOrCreate(['nombre' => 'activo'], ['descripcion' => 'Usuario activo']);
        EstadoUsuario::firstOrCreate(['nombre' => 'inactivo'], ['descripcion' => 'Usuario inactivo']);
    }

    private function crearDocentePrueba()
    {
        $usuario = Usuario::create([
            'nombre' => 'Prof. María García',
            'correo' => 'maria.garcia@eduapp.com',
            'contraseña_hash' => Hash::make('password123'),
            'salt' => Str::random(128),
            'id_tipo_usuario' => TipoUsuario::where('nombre', 'docente')->first()->id,
            'id_estado' => EstadoUsuario::where('nombre', 'activo')->first()->id,
        ]);

        return Docente::create([
            'id_usuario' => $usuario->id,
            'especialidad' => 'Matemáticas y Ciencias',
        ]);
    }

    private function crearEstudiantesPrueba()
    {
        $estudiantes = collect(); // Inicializar como Collection
        $nombres = [
            'Ana López', 'Carlos Rodríguez', 'Isabella Chen', 'Diego Morales',
            'Sofía Mendez', 'Alejandro Torres', 'Camila Vargas', 'Sebastián Ruiz',
            'Valentina Castillo', 'Nicolás Herrera', 'Gabriela Santos', 'Mateo Silva'
        ];

        foreach ($nombres as $index => $nombre) {
            $correo = strtolower(str_replace([' ', 'á', 'é', 'í', 'ó', 'ú'], 
                ['', 'a', 'e', 'i', 'o', 'u'], $nombre)) . '@estudiante.com';
                
            $usuario = Usuario::create([
                'nombre' => $nombre,
                'correo' => $correo,
                'contraseña_hash' => Hash::make('estudiante123'),
                'salt' => Str::random(128),
                'id_tipo_usuario' => TipoUsuario::where('nombre', 'estudiante')->first()->id,
                'id_estado' => EstadoUsuario::where('nombre', 'activo')->first()->id,
            ]);

            $estudiante = Estudiante::create([
                'id_usuario' => $usuario->id,
                'codigo_estudiante' => 'EST2025' . str_pad($index + 1, 3, '0', STR_PAD_LEFT),
                'grado' => '10°',
                'seccion' => 'A',
            ]);
            
            $estudiantes->push($estudiante); // Agregar a la Collection
        }

        return $estudiantes;
    }

    private function crearClasePrueba($docente)
    {
        return Clase::create([
            'nombre' => 'Matemáticas 10° A - 2025',
            'descripcion' => 'Clase de matemáticas para décimo grado, sección A. Incluye álgebra, geometría y trigonometría.',
            'id_docente' => $docente->id,
            'grado' => '10°',
            'seccion' => 'A',
            'año_academico' => 2025,
            'activo' => true,
            'codigo_invitacion' => 'MAT10A25',
            'fecha_inicio' => Carbon::now()->startOfYear()->addMonths(2),
            'fecha_fin' => Carbon::now()->endOfYear()->subMonths(1),
        ]);
    }

    private function inscribirEstudiantesEnClase($clase, $estudiantes)
    {
        foreach ($estudiantes as $estudiante) {
            // ✅ USAR LA TABLA CORRECTA: inscripcion_clase
            InscripcionClase::create([
                'id_clase' => $clase->id,
                'id_estudiante' => $estudiante->id,
                'fecha_ingreso' => Carbon::now()->subDays(rand(30, 60)),
                'activo' => true,
            ]);
        }
    }

    private function crearPersonajesEstudiantes($clase, $estudiantes)
    {
        $clasesRpg = \App\Models\ClaseRpg::all();
        
        // Si no hay clases RPG, crear una básica
        if ($clasesRpg->isEmpty()) {
            $guerrero = \App\Models\ClaseRpg::create([
                'nombre' => 'Guerrero',
                'descripcion' => 'Valiente combatiente',
                'habilidades_especiales' => json_encode(['Golpe Crítico']),
                'stats_base' => json_encode(['vida' => 120, 'ataque' => 85]),
            ]);
            $clasesRpg = collect([$guerrero]);
        }
        
        $personajes = collect(); // Inicializar como Collection

        foreach ($estudiantes as $index => $estudiante) {
            $claseRpg = $clasesRpg->random();
            $personaje = Personaje::create([
                'id_estudiante' => $estudiante->id,
                'id_clase' => $clase->id,
                'id_clase_rpg' => $claseRpg->id,
                'nombre' => $estudiante->usuario->nombre . ' el ' . $claseRpg->nombre,
                'nivel' => rand(1, 8),
                'experiencia' => rand(100, 2000),
                'avatar_base' => strtolower($claseRpg->nombre),
            ]);
            
            $personajes->push($personaje); // Agregar a la Collection
        }

        return $personajes;
    }

    private function crearMisionesPrueba($clase)
    {
        $misiones = collect(); // Inicializar como Collection
        
        $datosMisiones = [
            [
                'titulo' => 'Maestro de Ecuaciones',
                'descripcion' => 'Demuestra tu dominio resolviendo ecuaciones lineales y cuadráticas.',
                'puntos_experiencia_bonus' => 100,
                'puntos_moneda_bonus' => 50,
                'orden' => 1,
            ],
            [
                'titulo' => 'Explorador Geométrico',
                'descripcion' => 'Explora el mundo de la geometría y descubre sus secretos.',
                'puntos_experiencia_bonus' => 150,
                'puntos_moneda_bonus' => 75,
                'orden' => 2,
            ],
        ];

        foreach ($datosMisiones as $datos) {
            $mision = Mision::create([
                'id_clase' => $clase->id,
                'titulo' => $datos['titulo'],
                'descripcion' => $datos['descripcion'],
                'fecha_inicio' => Carbon::now()->subDays(20),
                'fecha_fin' => Carbon::now()->addDays(10),
                'puntos_experiencia_bonus' => $datos['puntos_experiencia_bonus'],
                'puntos_moneda_bonus' => $datos['puntos_moneda_bonus'],
                'activa' => true,
                'orden' => $datos['orden'],
            ]);
            
            $misiones->push($mision); // Agregar a la Collection
        }

        return $misiones;
    }

    private function crearActividadesPrueba($clase, $misiones)
    {
        $tiposActividad = \App\Models\TipoActividad::all();
        
        // Si no hay tipos, crear uno básico
        if ($tiposActividad->isEmpty()) {
            $tarea = \App\Models\TipoActividad::create([
                'nombre' => 'Tarea',
                'descripcion' => 'Actividad para realizar en casa',
            ]);
            $tiposActividad = collect([$tarea]);
        }
        
        $actividades = collect(); // Inicializar como Collection

        $datosActividades = [
            'Resolver ecuaciones lineales',
            'Ejercicios de geometría plana',
            'Problemas de trigonometría',
            'Análisis de funciones',
            'Ejercicios de álgebra',
        ];

        foreach ($datosActividades as $index => $titulo) {
            $actividad = Actividad::create([
                'id_clase' => $clase->id,
                'id_tipo_actividad' => $tiposActividad->random()->id,
                'id_mision' => $misiones->isNotEmpty() ? $misiones->random()->id : null,
                'titulo' => $titulo,
                'descripcion' => "Descripción detallada de: {$titulo}",
                'fecha_inicio' => Carbon::now()->subDays(rand(1, 15)),
                'fecha_entrega' => Carbon::now()->addDays(rand(1, 7)),
                'puntos_experiencia' => rand(50, 200),
                'puntos_moneda' => rand(25, 100),
                'activa' => true,
            ]);
            
            $actividades->push($actividad); // Agregar a la Collection
        }

        return $actividades;
    }

    private function crearEntregasPrueba($actividades, $estudiantes)
    {
        foreach ($actividades as $actividad) {
            // 70% de los estudiantes entregan cada actividad
            $cantidadQueEntregan = intval($estudiantes->count() * 0.7);
            $estudiantesQueEntregan = $estudiantes->random($cantidadQueEntregan);
            
            foreach ($estudiantesQueEntregan as $estudiante) {
                $nota = rand(60, 100);
                
                EntregaActividad::create([
                    'id_actividad' => $actividad->id,
                    'id_estudiante' => $estudiante->id,
                    'archivo' => 'entrega_' . $estudiante->id . '_' . $actividad->id . '.pdf',
                    'descripcion_entrega' => 'Entrega de la actividad: ' . $actividad->titulo,
                    'fecha_entrega' => Carbon::now()->subDays(rand(0, 7)),
                    'nota' => rand(0, 100) < 80 ? $nota : null, // 80% están calificadas
                    'comentario_docente' => $this->generarComentarioAleatorio($nota),
                ]);
            }
        }
    }

    private function crearComportamientosPrueba($clase, $estudiantes)
    {
        $tiposComportamiento = \App\Models\TipoComportamiento::all();
        
        // Si no hay tipos, crear uno básico
        if ($tiposComportamiento->isEmpty()) {
            $participacion = \App\Models\TipoComportamiento::create([
                'nombre' => 'Participación Activa',
                'descripcion' => 'Participa activamente en clase',
                'puntos' => 15,
                'tipo' => 'positivo',
            ]);
            $tiposComportamiento = collect([$participacion]);
        }
        
        foreach ($estudiantes as $estudiante) {
            $numeroRegistros = rand(3, 8);
            
            for ($i = 0; $i < $numeroRegistros; $i++) {
                RegistroComportamiento::create([
                    'id_estudiante' => $estudiante->id,
                    'id_clase' => $clase->id,
                    'id_tipo_comportamiento' => $tiposComportamiento->random()->id,
                    'descripcion' => 'Registro automático de comportamiento',
                    'observacion' => $this->generarObservacionComportamiento(),
                    'fecha' => Carbon::now()->subDays(rand(1, 30)),
                ]);
            }
        }
    }

    private function crearAsistenciasPrueba($clase, $estudiantes)
    {
        for ($dia = 30; $dia >= 1; $dia--) {
            $fecha = Carbon::now()->subDays($dia);
            
            if ($fecha->isWeekday()) {
                foreach ($estudiantes as $estudiante) {
                    $presente = rand(1, 100) <= 85;
                    
                    Asistencia::create([
                        'id_clase' => $clase->id,
                        'id_estudiante' => $estudiante->id,
                        'id_docente' => $clase->id_docente,
                        'fecha' => $fecha->toDateString(),
                        'presente' => $presente,
                        'justificacion' => !$presente && rand(1, 100) <= 60 ? 
                            'Cita médica' : null,
                    ]);
                }
            }
        }
    }

    private function crearItemsTiendaPrueba($clase)
    {
        $items = [
            [
                'nombre' => 'Avatar Premium',
                'descripcion' => 'Personaliza tu avatar con estilos únicos',
                'precio' => 200,
                'tipo' => 'avatar',
            ],
            [
                'nombre' => 'Extensión de Tiempo',
                'descripcion' => 'Extiende la fecha de entrega 2 días',
                'precio' => 150,
                'tipo' => 'privilegio',
            ],
            [
                'nombre' => 'Pista Extra',
                'descripcion' => 'Obtén una pista adicional para la actividad',
                'precio' => 100,
                'tipo' => 'privilegio',
            ],
        ];

        foreach ($items as $item) {
            ItemTienda::create([
                'id_clase' => $clase->id,
                'nombre' => $item['nombre'],
                'descripcion' => $item['descripcion'],
                'precio' => $item['precio'],
                'tipo' => $item['tipo'],
                'disponible' => true,
            ]);
        }
    }

    private function crearTransaccionesPrueba($clase, $estudiantes)
    {
        foreach ($estudiantes as $estudiante) {
            $numeroTransacciones = rand(5, 15);
            
            for ($i = 0; $i < $numeroTransacciones; $i++) {
                TransaccionMoneda::create([
                    'id_estudiante' => $estudiante->id,
                    'id_clase' => $clase->id,
                    'tipo' => rand(1, 100) <= 80 ? 'ingreso' : 'gasto',
                    'cantidad' => rand(25, 150),
                    'descripcion' => $this->generarDescripcionTransaccion(),
                    'referencia_tipo' => 'actividad',
                    'referencia_id' => rand(1, 5),
                    'otorgado_por' => $clase->id_docente,
                ]);
            }
        }
    }

    private function generarComentarioAleatorio($nota)
    {
        if ($nota >= 90) {
            $comentarios = [
                'Excelente trabajo, sigue así',
                'Demuestra gran comprensión del tema',
                'Trabajo sobresaliente'
            ];
        } elseif ($nota >= 70) {
            $comentarios = [
                'Buen trabajo, puedes mejorar algunos detalles',
                'Está bien, sigue practicando',
                'Trabajo satisfactorio'
            ];
        } else {
            $comentarios = [
                'Necesita más práctica',
                'Revisa los conceptos básicos',
                'Demuestra buen entendimiento pero hay errores'
            ];
        }

        return $comentarios[array_rand($comentarios)];
    }

    private function generarObservacionComportamiento()
    {
        $observaciones = [
            'Comportamiento observado durante la clase',
            'Actitud positiva hacia el aprendizaje',
            'Interacción constructiva con compañeros',
            'Necesita mejorar la atención en clase',
            'Muestra interés por los temas tratados',
            'Contribuye al ambiente de aprendizaje'
        ];

        return $observaciones[array_rand($observaciones)];
    }

    private function generarDescripcionTransaccion()
    {
        $descripciones = [
            'Bonus por actividad completada',
            'Participación en clase',
            'Comportamiento positivo',
            'Compra en tienda virtual',
            'Bonus por asistencia perfecta',
            'Premio por mejora continua'
        ];

        return $descripciones[array_rand($descripciones)];
    }

    private function mostrarResumenDatos()
    {
        $this->command->info("\n📊 Resumen de Datos Generados:");
        $this->command->table(
            ['Tipo de Dato', 'Cantidad'],
            [
                ['Usuarios Totales', Usuario::count()],
                ['Docentes', Docente::count()],
                ['Estudiantes', Estudiante::count()],
                ['Clases', Clase::count()],
                ['Inscripciones', InscripcionClase::count()],
                ['Personajes', Personaje::count()],
                ['Actividades', Actividad::count()],
                ['Entregas', EntregaActividad::count()],
                ['Misiones', Mision::count()],
                ['Comportamientos', RegistroComportamiento::count()],
                ['Registros Asistencia', Asistencia::count()],
                ['Items Tienda', ItemTienda::count()],
                ['Transacciones', TransaccionMoneda::count()],
            ]
        );

        $this->command->info("\n🔑 Credenciales de Prueba:");
        $this->command->line("📧 Docente: maria.garcia@eduapp.com | 🔐 password123");
        $this->command->line("📧 Estudiante: analopez@estudiante.com | 🔐 estudiante123");
        $this->command->line("🏫 Código de Clase: MAT10A25");
    }
}