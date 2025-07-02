<?php
// database/seeders/FixPasswordsSeeder.php
namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Usuario;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class FixPasswordsSeeder extends Seeder
{
    public function run()
    {
        $this->command->info('🔧 Arreglando contraseñas existentes...');

        // Usuarios conocidos con sus contraseñas correctas
        $usuarios = [
            'maria.garcia@eduapp.com' => 'password123',
            'analopez@estudiante.com' => 'estudiante123',
            'profesor@eduapp.com' => 'password',
            'estudiante@eduapp.com' => 'password',
        ];

        foreach ($usuarios as $email => $password) {
            $usuario = Usuario::where('correo', $email)->first();
            
            if ($usuario) {
                // Generar nuevo salt
                $salt = Str::random(128);
                
                // Actualizar con salt correcto
                $usuario->update([
                    'contraseña_hash' => Hash::make($password . $salt),
                    'salt' => $salt,
                ]);
                
                $this->command->line("✅ Arreglado: {$email} -> {$password}");
            } else {
                $this->command->warn("⚠️  No encontrado: {$email}");
            }
        }

        // Arreglar cualquier otro usuario que tenga salt pero contraseña sin salt
        $usuariosConProblemas = Usuario::whereNotNull('salt')
            ->where('salt', '!=', '')
            ->get();

        foreach ($usuariosConProblemas as $usuario) {
            if (!in_array($usuario->correo, array_keys($usuarios))) {
                // Para usuarios desconocidos, asignar contraseña genérica
                $salt = Str::random(128);
                $usuario->update([
                    'contraseña_hash' => Hash::make('password' . $salt),
                    'salt' => $salt,
                ]);
                
                $this->command->line("✅ Genérico: {$usuario->correo} -> password");
            }
        }

        $this->command->info("✅ Contraseñas arregladas!");
        $this->mostrarCredenciales();
    }

    private function mostrarCredenciales()
    {
        $this->command->info("\n🔑 CREDENCIALES ACTUALIZADAS:");
        $this->command->line("📧 maria.garcia@eduapp.com");
        $this->command->line("🔐 password123");
        $this->command->line("");
        $this->command->line("📧 analopez@estudiante.com");
        $this->command->line("🔐 estudiante123");
        $this->command->line("");
        $this->command->line("🌐 PRUEBA AHORA:");
        $this->command->line("   http://localhost:8000/login");
    }
}