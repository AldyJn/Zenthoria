<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Clase;
use App\Models\ConfiguracionClase;

class InicializarConfiguracionesCommand extends Command
{
    /**
     * The name and signature of the console command.
     */
    protected $signature = 'configuracion:inicializar 
                            {--clase= : ID específico de clase a inicializar}
                            {--todas : Inicializar todas las clases}
                            {--forzar : Sobreescribir configuraciones existentes}';

    /**
     * The console command description.
     */
    protected $description = 'Inicializar configuraciones por defecto para las clases';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        if ($this->option('clase')) {
            $this->inicializarClaseEspecifica($this->option('clase'));
        } elseif ($this->option('todas')) {
            $this->inicializarTodasLasClases();
        } else {
            $this->error('Debes especificar --clase=ID o --todas');
            return 1;
        }

        return 0;
    }

    /**
     * Inicializar configuraciones para una clase específica
     */
    private function inicializarClaseEspecifica($claseId)
    {
        $clase = Clase::find($claseId);

        if (!$clase) {
            $this->error("La clase con ID {$claseId} no existe.");
            return;
        }

        $forzar = $this->option('forzar');
        $configuracionesExistentes = $clase->configuraciones()->count();

        if ($configuracionesExistentes > 0 && !$forzar) {
            if (!$this->confirm("La clase '{$clase->nombre}' ya tiene {$configuracionesExistentes} configuraciones. ¿Deseas continuar?")) {
                $this->info('Operación cancelada.');
                return;
            }
        }

        $this->info("Inicializando configuraciones para la clase: {$clase->nombre}");
        
        $configuracionesInicializadas = $this->crearConfiguracionesParaClase($clase->id, $forzar);
        
        $this->info("✅ {$configuracionesInicializadas} configuraciones inicializadas para la clase '{$clase->nombre}'");
    }

    /**
     * Inicializar configuraciones para todas las clases
     */
    private function inicializarTodasLasClases()
    {
        $clases = Clase::where('activo', true)->get();
        $forzar = $this->option('forzar');

        if ($clases->isEmpty()) {
            $this->warn('No se encontraron clases activas.');
            return;
        }

        $this->info("Inicializando configuraciones para {$clases->count()} clases...");

        $bar = $this->output->createProgressBar($clases->count());
        $bar->start();

        $totalConfiguraciones = 0;

        foreach ($clases as $clase) {
            $configuraciones = $this->crearConfiguracionesParaClase($clase->id, $forzar);
            $totalConfiguraciones += $configuraciones;
            $bar->advance();
        }

        $bar->finish();
        $this->newLine();
        $this->info("✅ {$totalConfiguraciones} configuraciones inicializadas para {$clases->count()} clases");
    }

    /**
     * Crear configuraciones para una clase específica
     */
    private function crearConfiguracionesParaClase($claseId, $forzar = false)
    {
        $configuracionesDefecto = ConfiguracionClase::configuracionesDefecto();
        $configuracionesCreadas = 0;

        foreach ($configuracionesDefecto as $clave => $config) {
            $existe = ConfiguracionClase::where('id_clase', $claseId)
                ->where('clave', $clave)
                ->exists();

            if (!$existe || $forzar) {
                ConfiguracionClase::updateOrCreate(
                    [
                        'id_clase' => $claseId,
                        'clave' => $clave,
                    ],
                    [
                        'valor' => is_bool($config['valor']) ? ($config['valor'] ? '1' : '0') : (string) $config['valor'],
                        'tipo' => $config['tipo'],
                    ]
                );
                $configuracionesCreadas++;
            }
        }

        return $configuracionesCreadas;
    }

    /**
     * Mostrar estadísticas de configuraciones
     */
    public function mostrarEstadisticas()
    {
        $this->info('📊 Estadísticas de Configuraciones:');
        
        $totalClases = Clase::where('activo', true)->count();
        $clasesConConfiguracion = Clase::where('activo', true)
            ->whereHas('configuraciones')
            ->count();
        
        $this->table(
            ['Métrica', 'Valor'],
            [
                ['Total de clases activas', $totalClases],
                ['Clases con configuraciones', $clasesConConfiguracion],
                ['Clases sin configuraciones', $totalClases - $clasesConConfiguracion],
                ['Total de configuraciones', ConfiguracionClase::count()],
            ]
        );

        if ($clasesConConfiguracion < $totalClases) {
            $this->warn('⚠️  Algunas clases no tienen configuraciones inicializadas.');
            $this->info('💡 Ejecuta: php artisan configuracion:inicializar --todas');
        }
    }
}