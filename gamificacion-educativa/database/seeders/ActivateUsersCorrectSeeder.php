<?php
// database/seeders/ActivateUsersCorrectSeeder.php
namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Usuario;
use App\Models\EstadoUsuario;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class ActivateUsersCorrectSeeder extends Seeder
{
    public function run()
    {
        $this->command->info('🔓 Activando usuarios con estructura correcta...');

        // Asegurar que existe el estado 'activo'
        $estadoActivo = EstadoUsuario::firstOrCreate(
            ['nombre' => 'activo'],
            ['descripcion' => 'Usuario activo']
        );

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
                
                // Actualizar usuario con la estructura correcta
                $usuario->update([
                    'contraseña_hash' => Hash::make($password . $salt),
                    'salt' => $salt,
                    'id_estado' => $estadoActivo->id, // ← USAR id_estado EN LUGAR DE activo
                    'eliminado' => false, // ← ASEGURAR QUE NO ESTÉ ELIMINADO
                    'ultimo_acceso' => now(),
                ]);
                
                $this->command->line("✅ Activado y arreglado: {$email} -> {$password}");
            } else {
                $this->command->warn("⚠️  No encontrado: {$email}");
            }
        }

        // Activar todos los demás usuarios que no estén activos
        $usuariosInactivos = Usuario::where('id_estado', '!=', $estadoActivo->id)
            ->orWhere('eliminado', true)
            ->get();

        foreach ($usuariosInactivos as $usuario) {
            $usuario->update([
                'id_estado' => $estadoActivo->id,
                'eliminado' => false,
                'ultimo_acceso' => now(),
            ]);
            
            $this->command->line("✅ Activado: {$usuario->correo}");
        }

        $this->command->info("✅ Todos los usuarios activados!");
        $this->mostrarCredenciales();
    }

    private function mostrarCredenciales()
    {
        $this->command->info("\n🔑 CREDENCIALES LISTAS PARA USAR:");
        $this->command->line("📧 maria.garcia@eduapp.com");
        $this->command->line("🔐 password123");
        $this->command->line("🟢 ACTIVO (id_estado = activo)");
        $this->command->line("");
        $this->command->line("📧 analopez@estudiante.com");
        $this->command->line("🔐 estudiante123");
        $this->command->line("🟢 ACTIVO (id_estado = activo)");
        $this->command->line("");
        $this->command->line("🌐 PRUEBA AHORA:");
        $this->command->line("   http://localhost:8000/login");
    }
}