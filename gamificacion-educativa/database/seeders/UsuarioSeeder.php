<?php 
namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Usuario;
use App\Models\Docente;
use App\Models\Estudiante;
use Illuminate\Support\Facades\Hash;

class UsuarioSeeder extends Seeder
{
    public function run()
    {
        // Crear usuario docente de prueba
        $salt = bin2hex(random_bytes(64));
        $docenteUser = Usuario::create([
            'nombre' => 'Profesor Demo',
            'correo' => 'profesor@eduapp.com',
            'contraseña_hash' => Hash::make('password' . $salt),
            'salt' => $salt,
            'id_tipo_usuario' => 2, // Docente
            'id_estado' => 1, // Activo
        ]);

        Docente::create([
            'id_usuario' => $docenteUser->id,
            'especialidad' => 'Matemáticas y Ciencias',
        ]);

        // Crear usuario estudiante de prueba
        $salt2 = bin2hex(random_bytes(64));
        $estudianteUser = Usuario::create([
            'nombre' => 'Estudiante Demo',
            'correo' => 'estudiante@eduapp.com',
            'contraseña_hash' => Hash::make('password' . $salt2),
            'salt' => $salt2,
            'id_tipo_usuario' => 1, // Estudiante
            'id_estado' => 1, // Activo
        ]);

        Estudiante::create([
            'id_usuario' => $estudianteUser->id,
            'codigo_estudiante' => 'EST001',
            'grado' => '5to Grado',
            'seccion' => 'A',
        ]);

        // Crear más estudiantes para testing
        for ($i = 2; $i <= 10; $i++) {
            $salt = bin2hex(random_bytes(64));
            $user = Usuario::create([
                'nombre' => "Estudiante {$i}",
                'correo' => "estudiante{$i}@eduapp.com",
                'contraseña_hash' => Hash::make('password' . $salt),
                'salt' => $salt,
                'id_tipo_usuario' => 1,
                'id_estado' => 1,
            ]);

            Estudiante::create([
                'id_usuario' => $user->id,
                'codigo_estudiante' => 'EST' . str_pad($i, 3, '0', STR_PAD_LEFT),
                'grado' => rand(1, 6) . 'to Grado',
                'seccion' => ['A', 'B', 'C'][rand(0, 2)],
            ]);
        }
    }
}

