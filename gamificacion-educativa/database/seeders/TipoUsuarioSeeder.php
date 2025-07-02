<?php
// database/seeders/TipoUsuarioSeeder.php
namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\TipoUsuario;

class TipoUsuarioSeeder extends Seeder
{
    public function run(): void
    {
        $tipos = [
            ['nombre' => 'estudiante', 'descripcion' => 'Usuario tipo estudiante'],
            ['nombre' => 'docente', 'descripcion' => 'Usuario tipo docente'],
            ['nombre' => 'admin', 'descripcion' => 'Usuario administrador del sistema'],
        ];

        foreach ($tipos as $tipo) {
            TipoUsuario::updateOrCreate(['nombre' => $tipo['nombre']], $tipo);
        }

        $this->command->info('✅ Tipos de usuario creados: ' . count($tipos));
    }
}

