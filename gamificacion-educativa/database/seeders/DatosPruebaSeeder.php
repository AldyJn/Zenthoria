<?php

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
use Illuminate\Support\Facades\Hash;
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
        $estudiantes = [];
        $nombres = [
            'Ana López', 'Carlos Rodríguez', 'Isabella Chen', 'Diego Morales',
            'Sofía Mendez', 'Alejandro Torres', 'Camila Vargas', 'Sebastián Ruiz',
            'Valentina Castillo', 'Nicolás Herrera', 'Gabriela Santos', 'Mateo Silva'
        ];

        foreach ($nombres as $index => $nombre) {
            $usuario = Usuario::create([
                'nombre' => $nombre,
                'correo' => strtolower(str_replace([' ', 'á', 'é', 'í', 'ó', 'ú'], ['', 'a', 'e', 'i', 'o', 'u'], $nombre)) . '@estudiante.com',
                'contraseña_hash' => Hash::make('estudiante123'),
                'salt' => Str::random(128),
                'id_tipo_usuario' => TipoUsuario::where('nombre', 'estudiante')->first()->id,
                'id_estado' => EstadoUsuario::where('nombre', 'activo')->first()->id,
            ]);

            $estudiantes[] = Estudiante::create([
                'id_usuario' => $usuario->id,
                'codigo_estudiante' => 'EST2025' . str_pad($index + 1, 3, '0', STR_PAD_LEFT),
                'grado' => '10°',
                'seccion' => 'A',
            ]);
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
            'fecha_inicio' => Carbon::now()->startOfYear()->addMonths(2), // Marzo
            'fecha_fin' => Carbon::now()->endOfYear()->subMonths(1), // Noviembre
        ]);
    }

    private function inscribirEstudiantesEnClase($clase, $estudiantes)
    {
        foreach ($estudiantes as $estudiante) {
            $clase->estudiantes()->attach($estudiante->id, [
                'fecha_ingreso' => Carbon::now()->subDays(rand(30, 60)),
                'activo' => true,
            ]);
        }
    }

    private function crearPersonajesEstudiantes($clase, $estudiantes)
    {
        $clasesRpg = \App\Models\ClaseRpg::all();
        $personajes = [];

        foreach ($estudiantes as $index => $estudiante) {
            $claseRpg = $clasesRpg->random();
            $personajes[] = Personaje::create([
                'id_estudiante' => $estudiante->id,
                'id_clase' => $clase->id,
                'id_clase_rpg' => $claseRpg->id,
                'nombre' => $estudiante->usuario->nombre . ' el ' . $claseRpg->nombre,
                'nivel' => rand(1, 8),
                'experiencia' => rand(100, 2000),
                'avatar_base' => strtolower($claseRpg->nombre),
            ]);
        }

        return $personajes;
    }

    private function crearMisionesPrueba($clase)
    {
        $misiones = [
            [
                'titulo' => 'Maestro de Ecuaciones',
                'descripcion' => 'Demuestra tu dominio resolviendo ecuaciones lineales y cuadráticas.',
                'fecha_inicio' => Carbon::now()->subDays(20),
                'fecha_fin' => Carbon::now()->addDays(10),
                'puntos_experiencia_bonus' => 100,
                'puntos_moneda_bonus' => 50,
                'orden' => 1,
            ],
            [
                'titulo' => 'Explorador Geométrico',
                'descripcion' => 'Explora el mundo de la geometría y descubre sus secretos.',
                'fecha_inicio' => Carbon::now()->addDays(5),
                'fecha_fin' => Carbon::now()->addDays(25),
                'puntos_experiencia_bonus' => 150,
                'puntos_moneda_bonus' => 75,
                'orden' => 2,
            ],
            [
                'titulo' => 'Guerrero Trigonométrico',
                'descripcion' => 'Conquista los triángulos y domina las funciones trigonométricas.',
                'fecha_inicio' => Carbon::now()->addDays(15),
                'fecha_fin' => Carbon::now()->addDays(35),
                'puntos_experiencia_bonus' => 200,
                'puntos_moneda_bonus' => 100,
                'orden' => 3,
            ],
        ];

        $misionesCreadas = [];
        foreach ($misiones as $misionData) {
            $misionesCreadas[] = Mision::create([
                'id_clase' => $clase->id,
                'titulo' => $misionData['titulo'],
                'descripcion' => $misionData['descripcion'],
                'fecha_inicio' => $misionData['fecha_inicio'],
                'fecha_fin' => $misionData['fecha_fin'],
                'puntos_experiencia_bonus' => $misionData['puntos_experiencia_bonus'],
                'puntos_moneda_bonus' => $misionData['puntos_moneda_bonus'],
                'activa' => true,
                'orden' => $misionData['orden'],
            ]);
        }

        return $misionesCreadas;
    }

    private function crearActividadesPrueba($clase, $misiones)
    {
        $tiposActividad = \App\Models\TipoActividad::all();
        $actividades = [];

        $actividadesData = [
            [
                'titulo' => 'Ejercicios de Ecuaciones Lineales',
                'descripcion' => 'Resolver 15 ecuaciones lineales de diferentes tipos.',
                'puntos_experiencia' => 25,
                'puntos_moneda' => 15,
                'fecha_entrega' => Carbon::now()->addDays(7),
                'mision' => 0,
            ],
            [
                'titulo' => 'Proyecto: Aplicaciones de Ecuaciones',
                'descripcion' => 'Investigar y presentar aplicaciones reales de ecuaciones en la vida cotidiana.',
                'puntos_experiencia' => 50,
                'puntos_moneda' => 30,
                'fecha_entrega' => Carbon::now()->addDays(14),
                'mision' => 0,
            ],
            [
                'titulo' => 'Quiz: Propiedades Geométricas',
                'descripcion' => 'Evaluación rápida sobre propiedades básicas de figuras geométricas.',
                'puntos_experiencia' => 20,
                'puntos_moneda' => 10,
                'fecha_entrega' => Carbon::now()->addDays(3),
                'mision' => 1,
            ],
            [
                'titulo' => 'Construcciones Geométricas',
                'descripcion' => 'Realizar construcciones geométricas básicas usando regla y compás.',
                'puntos_experiencia' => 35,
                'puntos_moneda' => 20,
                'fecha_entrega' => Carbon::now()->addDays(10),
                'mision' => 1,
            ],
            [
                'titulo' => 'Tarea: Funciones Trigonométricas',
                'descripcion' => 'Calcular valores de seno, coseno y tangente para ángulos dados.',
                'puntos_experiencia' => 30,
                'puntos_moneda' => 18,
                'fecha_entrega' => Carbon::now()->addDays(21),
                'mision' => 2,
            ],
        ];

        foreach ($actividadesData as $actData) {
            $actividades[] = Actividad::create([
                'id_clase' => $clase->id,
                'id_tipo_actividad' => $tiposActividad->random()->id,
                'titulo' => $actData['titulo'],
                'descripcion' => $actData['descripcion'],
                'fecha_inicio' => Carbon::now()->subDays(2),
                'fecha_entrega' => $actData['fecha_entrega'],
                'puntos_experiencia' => $actData['puntos_experiencia'],
                'puntos_moneda' => $actData['puntos_moneda'],
                'id_mision' => isset($misiones[$actData['mision']]) ? $misiones[$actData['mision']]->id : null,
                'activa' => true,
            ]);
        }

        return $actividades;
    }

    private function crearEntregasPrueba($actividades, $estudiantes)
    {
        foreach ($actividades as $actividad) {
            // 70% de estudiantes entregan la actividad
            $estudiantesQueEntregan = $estudiantes->random(ceil(count($estudiantes) * 0.7));
            
            foreach ($estudiantesQueEntregan as $estudiante) {
                $fechaEntrega = Carbon::parse($actividad->fecha_entrega)->subDays(rand(0, 5));
                $nota = $this->generarNotaRealista();
                
                EntregaActividad::create([
                    'id_actividad' => $actividad->id,
                    'id_estudiante' => $estudiante->id,
                    'archivo' => 'uploads/entregas/ejemplo_' . $estudiante->id . '_' . $actividad->id . '.pdf',
                    'fecha_entrega' => $fechaEntrega,
                    'nota' => rand(0, 100) < 80 ? $nota : null, // 80% están calificadas
                    'comentario' => $this->generarComentarioAleatorio($nota),
                ]);
            }
        }
    }

    private function crearComportamientosPrueba($clase, $estudiantes)
    {
        $tiposComportamiento = \App\Models\TipoComportamiento::all();
        
        foreach ($estudiantes as $estudiante) {
            // Cada estudiante tiene entre 3 y 8 registros de comportamiento
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
        // Crear registros de asistencia para los últimos 30 días
        for ($dia = 30; $dia >= 1; $dia--) {
            $fecha = Carbon::now()->subDays($dia);
            
            // Solo días laborables
            if ($fecha->isWeekday()) {
                foreach ($estudiantes as $estudiante) {
                    // 85% de probabilidad de asistir
                    $presente = rand(1, 100) <= 85;
                    
                    Asistencia::create([
                        'id_clase' => $clase->id,
                        'id_estudiante' => $estudiante->id,
                        'id_docente' => $clase->id_docente,
                        'fecha' => $fecha->toDateString(),
                        'presente' => $presente,
                        'justificacion' => !$presente && rand(1, 100) <= 60 ? 'Enfermedad familiar' : null,
                    ]);
                }
            }
        }
    }

    private function crearItemsTiendaPrueba($clase)
    {
        $items = [
            [
                'nombre' => 'Avatar Guerrero Dorado',
                'descripcion' => 'Transforma tu personaje en un guerrero con armadura dorada',
                'precio' => 150,
                'tipo' => 'avatar',
                'imagen_url' => '/images/avatars/guerrero-dorado.png',
            ],
            [
                'nombre' => 'Asiento Preferencial',
                'descripcion' => 'Derecho a elegir tu asiento en clase por una semana',
                'precio' => 50,
                'tipo' => 'privilegio',
                'cantidad_limitada' => true,
                'cantidad_disponible' => 5,
            ],
            [
                'nombre' => 'Mascota Virtual: Dragón',
                'descripcion' => 'Un dragón virtual que te acompaña en tus aventuras',
                'precio' => 200,
                'tipo' => 'item_virtual',
            ],
            [
                'nombre' => 'Poción de Experiencia',
                'descripcion' => 'Duplica la experiencia de tu próxima actividad',
                'precio' => 75,
                'tipo' => 'consumible',
                'cantidad_limitada' => true,
                'cantidad_disponible' => 10,
            ],
            [
                'nombre' => 'Extensión de Tiempo',
                'descripcion' => 'Un día extra para entregar tu próxima tarea',
                'precio' => 100,
                'tipo' => 'privilegio',
                'cantidad_limitada' => true,
                'cantidad_disponible' => 3,
            ],
        ];

        foreach ($items as $itemData) {
            ItemTienda::create([
                'id_clase' => $clase->id,
                'nombre' => $itemData['nombre'],
                'descripcion' => $itemData['descripcion'],
                'precio' => $itemData['precio'],
                'tipo' => $itemData['tipo'],
                'imagen_url' => $itemData['imagen_url'] ?? null,
                'disponible' => true,
                'cantidad_limitada' => $itemData['cantidad_limitada'] ?? false,
                'cantidad_disponible' => $itemData['cantidad_disponible'] ?? null,
            ]);
        }
    }

    private function crearTransaccionesPrueba($clase, $estudiantes)
    {
        foreach ($estudiantes as $estudiante) {
            // Cada estudiante tiene algunas transacciones de monedas
            $transacciones = rand(5, 12);
            
            for ($i = 0; $i < $transacciones; $i++) {
                TransaccionMoneda::create([
                    'id_estudiante' => $estudiante->id,
                    'id_clase' => $clase->id,
                    'tipo' => rand(1, 100) <= 80 ? 'ingreso' : 'gasto', // 80% ingresos
                    'cantidad' => rand(5, 50),
                    'descripcion' => $this->generarDescripcionTransaccion(),
                    'referencia_tipo' => ['actividad', 'comportamiento', 'manual_docente', 'item_tienda'][rand(0, 3)],
                    'referencia_id' => rand(1, 10),
                    'otorgado_por' => rand(1, 100) <= 30 ? $clase->id_docente : null,
                    'created_at' => Carbon::now()->subDays(rand(1, 20)),
                ]);
            }
        }
    }

    // Métodos auxiliares
    private function generarNotaRealista()
    {
        // Distribución realista de notas (más notas altas que bajas)
        $random = rand(1, 100);
        if ($random <= 10) return rand(5, 10);      // 10% notas bajas
        if ($random <= 25) return rand(11, 13);     // 15% notas regulares
        if ($random <= 65) return rand(14, 16);     // 40% notas buenas
        if ($random <= 90) return rand(17, 18);     // 25% notas muy buenas
        return rand(19, 20);                        // 10% notas excelentes
    }

    private function generarComentarioAleatorio($nota)
    {
        if (!$nota) return null;
        
        $comentarios = [
            'Excelente trabajo, sigue así',
            'Buen esfuerzo, pero puede mejorar',
            'Necesita repasar los conceptos básicos',
            'Muy bien desarrollado el ejercicio',
            'Falta claridad en la explicación',
            'Trabajo completo y bien presentado',
            'Revisa los errores de cálculo',
            'Demuestra buen entendimiento del tema'
        ];

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
        $this->command->line("📧 Estudiante: ana.lopez@estudiante.com | 🔐 estudiante123");
        $this->command->line("🏫 Código de Clase: MAT10A25");
    }
}