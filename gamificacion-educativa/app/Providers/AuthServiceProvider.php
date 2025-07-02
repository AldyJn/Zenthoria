<?php

namespace App\Providers;

use App\Models\Actividad;
use App\Models\Badge;
use App\Models\Clase;
use App\Models\Mision;
use App\Models\Personaje;
use App\Models\RegistroComportamiento;
use App\Models\TransaccionMoneda;
use App\Models\ItemTienda;
use App\Policies\ActividadPolicy;
use App\Policies\BadgePolicy;
use App\Policies\ClasePolicy;
use App\Policies\MisionPolicy;
use App\Policies\PersonajePolicy;
use App\Policies\ComportamientoPolicy;
use App\Policies\MonedaPolicy;
use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;
use Illuminate\Support\Facades\Gate;

class AuthServiceProvider extends ServiceProvider
{
    /**
     * The model to policy mappings for the application.
     *
     * @var array<class-string, class-string>
     */
    protected $policies = [
        Clase::class => ClasePolicy::class,
        Actividad::class => ActividadPolicy::class,
        Personaje::class => PersonajePolicy::class,
        Mision::class => MisionPolicy::class,
        Badge::class => BadgePolicy::class,
        RegistroComportamiento::class => ComportamientoPolicy::class,
        TransaccionMoneda::class => MonedaPolicy::class,
        ItemTienda::class => ItemTiendaPolicy::class,
    ];

    /**
     * Register any authentication / authorization services.
     */
    public function boot(): void
    {
        $this->registerPolicies();

        // Gates personalizados para casos especiales
        $this->registerCustomGates();
    }

    /**
     * Registrar Gates personalizados
     */
    private function registerCustomGates(): void
    {
        // Gate para verificar si es docente
        Gate::define('es-docente', function ($user) {
            return $user->esDocente();
        });

        // Gate para verificar si es estudiante
        Gate::define('es-estudiante', function ($user) {
            return $user->esEstudiante();
        });

        // Gate para administración general
        Gate::define('administrar-sistema', function ($user) {
            // Solo docentes pueden administrar (en el futuro podría ser un rol específico)
            return $user->esDocente();
        });

        // Gate para gestionar configuraciones de clase
        Gate::define('gestionar-configuracion-clase', function ($user, $clase) {
            return $user->esDocente() && $clase->id_docente === $user->docente->id;
        });

        // Gate para ver reportes avanzados
        Gate::define('ver-reportes-avanzados', function ($user, $clase) {
            return $user->esDocente() && $clase->id_docente === $user->docente->id;
        });

        // Gate para exportar datos
        Gate::define('exportar-datos', function ($user, $clase = null) {
            if (!$user->esDocente()) {
                return false;
            }

            // Si se especifica clase, debe ser docente de esa clase
            if ($clase) {
                return $clase->id_docente === $user->docente->id;
            }

            return true;
        });

        // Gate para gestionar usuarios (solo docentes por ahora)
        Gate::define('gestionar-usuarios', function ($user) {
            return $user->esDocente();
        });

        // Gate para acceder a funciones de testing (solo en desarrollo)
        Gate::define('acceder-testing', function ($user) {
            return app()->environment(['local', 'testing']) && $user->esDocente();
        });

        // Gate para otorgar experiencia manual
        Gate::define('otorgar-experiencia-manual', function ($user, $personaje) {
            return $user->esDocente() && 
                   $personaje->clase->id_docente === $user->docente->id;
        });

        // Gate para resetear progreso de estudiantes
        Gate::define('resetear-progreso-estudiante', function ($user, $clase) {
            return $user->esDocente() && $clase->id_docente === $user->docente->id;
        });

        // Gate para gestionar items de tienda
        Gate::define('gestionar-tienda', function ($user, $clase) {
            return $user->esDocente() && $clase->id_docente === $user->docente->id;
        });

        // Gate para ver dashboard administrativo
        Gate::define('ver-dashboard-admin', function ($user) {
            return $user->esDocente();
        });

        // Gate para gestionar badges del sistema
        Gate::define('gestionar-badges-sistema', function ($user) {
            return $user->esDocente();
        });

        // Gate para crear y gestionar tipos de actividad
        Gate::define('gestionar-tipos-actividad', function ($user) {
            return $user->esDocente();
        });

        // Gate para gestionar tipos de comportamiento
        Gate::define('gestionar-tipos-comportamiento', function ($user) {
            return $user->esDocente();
        });

        // Gate para inscribir estudiantes en clases
        Gate::define('inscribir-estudiantes', function ($user, $clase) {
            return $user->esDocente() && $clase->id_docente === $user->docente->id;
        });

        // Gate para remover estudiantes de clases
        Gate::define('remover-estudiantes', function ($user, $clase) {
            return $user->esDocente() && $clase->id_docente === $user->docente->id;
        });

        // Gate para generar códigos QR de clases
        Gate::define('generar-qr-clase', function ($user, $clase) {
            return $user->esDocente() && $clase->id_docente === $user->docente->id;
        });

        // Gate para gestionar sesiones de clase en tiempo real
        Gate::define('gestionar-sesiones-clase', function ($user, $clase) {
            return $user->esDocente() && $clase->id_docente === $user->docente->id;
        });

        // Gate para acceder a estadísticas detalladas
        Gate::define('ver-estadisticas-detalladas', function ($user, $clase = null) {
            if ($user->esDocente()) {
                return $clase ? $clase->id_docente === $user->docente->id : true;
            }

            // Los estudiantes pueden ver sus propias estadísticas limitadas
            if ($user->esEstudiante() && $clase) {
                return $user->estudiante->clases()
                    ->wherePivot('activo', true)
                    ->where('clase.id', $clase->id)
                    ->exists();
            }

            return false;
        });

        // Gate para comparar rendimiento entre estudiantes
        Gate::define('comparar-estudiantes', function ($user, $clase) {
            return $user->esDocente() && $clase->id_docente === $user->docente->id;
        });

        // Gate para enviar notificaciones masivas
        Gate::define('enviar-notificaciones-masivas', function ($user, $clase) {
            return $user->esDocente() && $clase->id_docente === $user->docente->id;
        });

        // Gate para verificar badges automáticamente
        Gate::define('verificar-badges-automatico', function ($user, $clase) {
            return $user->esDocente() && $clase->id_docente === $user->docente->id;
        });

        // Gate para acceder a herramientas de importación/exportación
        Gate::define('usar-herramientas-importacion', function ($user) {
            return $user->esDocente();
        });

        // Gate para gestionar calendario académico
        Gate::define('gestionar-calendario', function ($user, $clase) {
            return $user->esDocente() && $clase->id_docente === $user->docente->id;
        });

        // Gate especial para estudiantes: ver compañeros de clase
        Gate::define('ver-compañeros-clase', function ($user, $clase) {
            if ($user->esEstudiante()) {
                return $user->estudiante->clases()
                    ->wherePivot('activo', true)
                    ->where('clase.id', $clase->id)
                    ->exists();
            }

            return false;
        });
    }
}