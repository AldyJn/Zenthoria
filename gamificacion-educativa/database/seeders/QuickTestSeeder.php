<?php
// database/seeders/QuickTestSeeder.php
namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Usuario;
use App\Models\TipoUsuario;
use App\Models\Docente;
use App\Models\Estudiante;
use App\Models\Clase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class QuickTestSeeder extends Seeder
{
    public function run()
    {
        $this->command->info('🚀 Creando datos de prueba rápidos...');

        // Asegurar que existen los tipos de usuario
        $tipoDocente = TipoUsuario::firstOrCreate(
            ['nombre' => 'docente'],
            ['descripcion' => 'Usuario docente']
        );

        $tipoEstudiante = TipoUsuario::firstOrCreate(
            ['nombre' => 'estudiante'],
            ['descripcion' => 'Usuario estudiante']
        );

        // CREAR DOCENTE DE PRUEBA
        $this->command->info('👨‍🏫 Creando docente de prueba...');
        
        $saltDocente = Str::random(128);
        $usuarioDocente = Usuario::create([
            'nombre' => 'Prof. Juan Pérez',
            'correo' => 'docente@test.com',
            'contraseña_hash' => Hash::make('password' . $saltDocente),
            'salt' => $saltDocente,
            'id_tipo_usuario' => $tipoDocente->id,
            'ultimo_acceso' => now(),
        ]);

        $docente = Docente::create([
            'id_usuario' => $usuarioDocente->id,
            'especialidad' => 'Matemáticas y Ciencias',
        ]);

        // CREAR ESTUDIANTE DE PRUEBA
        $this->command->info('👨‍🎓 Creando estudiante de prueba...');
        
        $saltEstudiante = Str::random(128);
        $usuarioEstudiante = Usuario::create([
            'nombre' => 'Ana García',
            'correo' => 'estudiante@test.com',
            'contraseña_hash' => Hash::make('password' . $saltEstudiante),
            'salt' => $saltEstudiante,
            'id_tipo_usuario' => $tipoEstudiante->id,
            'ultimo_acceso' => now(),
        ]);

        $estudiante = Estudiante::create([
            'id_usuario' => $usuarioEstudiante->id,
            'codigo_estudiante' => 'EST001',
            'grado' => '10°',
            'seccion' => 'A',
        ]);

        // CREAR CLASE DE PRUEBA
        $this->command->info('🏫 Creando clase de prueba...');
        
        $clase = Clase::create([
            'nombre' => 'Matemáticas 10° A',
            'descripcion' => 'Clase de matemáticas para décimo grado',
            'codigo_invitacion' => 'MAT10A',
            'id_docente' => $docente->id,
        ]);

        // INSCRIBIR ESTUDIANTE EN CLASE (si existe la tabla)
        try {
            DB::table('estudiante_clase')->insert([
                'id_estudiante' => $estudiante->id,
                'id_clase' => $clase->id,
                'fecha_inscripcion' => now(),
                'created_at' => now(),
                'updated_at' => now(),
            ]);
            $this->command->info('✅ Estudiante inscrito en clase');
        } catch (\Exception $e) {
            $this->command->warn('⚠️  No se pudo inscribir estudiante en clase (tabla puede no existir)');
        }

        $this->command->info('✅ Datos de prueba creados exitosamente!');
        $this->mostrarCredenciales();
    }

    private function mostrarCredenciales()
    {
        $this->command->info("\n🔑 CREDENCIALES DE PRUEBA:");
        $this->command->line("📧 DOCENTE:");
        $this->command->line("   Email: docente@test.com");
        $this->command->line("   Password: password");
        $this->command->line("");
        $this->command->line("📧 ESTUDIANTE:");
        $this->command->line("   Email: estudiante@test.com");
        $this->command->line("   Password: password");
        $this->command->line("");
        $this->command->line("🏫 CLASE:");
        $this->command->line("   Código: MAT10A");
        $this->command->line("");
        $this->command->line("🌐 PRÓXIMO PASO:");
        $this->command->line("   1. php artisan serve");
        $this->command->line("   2. Ir a http://localhost:8000/login");
        $this->command->line("   3. Probar con las credenciales de arriba");
    }
}