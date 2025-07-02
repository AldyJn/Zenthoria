<?php
// database/seeders/EstadoUsuarioSeeder.php
namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\EstadoUsuario;

class EstadoUsuarioSeeder extends Seeder
{
    public function run(): void
    {
        $estados = [
            ['nombre' => 'activo', 'descripcion' => 'Usuario activo en el sistema'],
            ['nombre' => 'inactivo', 'descripcion' => 'Usuario temporalmente inactivo'],
            ['nombre' => 'suspendido', 'descripcion' => 'Usuario suspendido por violación de normas'],
            ['nombre' => 'graduado', 'descripcion' => 'Estudiante que ya se graduó'],
        ];

        foreach ($estados as $estado) {
            EstadoUsuario::updateOrCreate(['nombre' => $estado['nombre']], $estado);
        }

        $this->command->info('✅ Estados de usuario creados: ' . count($estados));
    }
}