<?php

// routes/web.php - SISTEMA COMPLETO EDUAPP GAMIFICADA
use App\Http\Controllers\AuthController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ClaseController;
use App\Http\Controllers\PersonajeController;
use App\Http\Controllers\ComportamientoController;
use App\Http\Controllers\TipoComportamientoController;
use App\Http\Controllers\ActividadController;
use App\Http\Controllers\AsistenciaController;
use App\Http\Controllers\ReporteController;
use App\Http\Controllers\SesionClaseController;
use App\Http\Controllers\MisionController;
use App\Http\Controllers\MonedaController;
use App\Http\Controllers\NotificacionController;
use App\Http\Controllers\BadgeController;
use App\Http\Controllers\ConfiguracionController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\PerfilController;
use App\Http\Controllers\DocenteController;
use App\Http\Controllers\EstudianteController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// ==========================================
// PÁGINA DE INICIO Y PÚBLICAS
// ==========================================
Route::get('/', function () {
    if (auth()->check()) {
        return redirect()->route('dashboard');
    }
    
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'appName' => config('app.name'),
        'features' => [
            'Personajes RPG con niveles',
            'Sistema de puntos y experiencia',
            'Actividades gamificadas',
            'Reportes en tiempo real',
            'Códigos QR para unirse',
            'Dashboard personalizado'
        ]
    ]);
})->name('home');

Route::get('/sobre-nosotros', function () {
    return Inertia::render('Publico/SobreNosotros');
})->name('sobre-nosotros');

Route::get('/como-funciona', function () {
    return Inertia::render('Publico/ComoFunciona');
})->name('como-funciona');

Route::get('/contacto', function () {
    return Inertia::render('Publico/Contacto');
})->name('contacto');

// ==========================================
// AUTENTICACIÓN
// ==========================================
Route::middleware('guest')->group(function () {
    Route::get('/login', [AuthController::class, 'showLogin'])->name('login');
    Route::post('/login', [AuthController::class, 'login']);
    Route::get('/register', [AuthController::class, 'showRegister'])->name('register');
    Route::post('/register', [AuthController::class, 'register']);
});

Route::post('/logout', [AuthController::class, 'logout'])
    ->middleware('auth')
    ->name('logout');

// ==========================================
// RUTAS PROTEGIDAS POR AUTENTICACIÓN
// ==========================================
Route::middleware(['auth', 'verified'])->group(function () {
    
    // ==========================================
    // DASHBOARD PRINCIPAL
    // ==========================================
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // Rutas rápidas de navegación
    Route::get('/mi-perfil', function() {
        if (auth()->user()->esDocente()) {
            return redirect()->route('docentes.perfil');
        }
        return redirect()->route('estudiantes.perfil');
    })->name('mi-perfil');

    Route::get('/mi-resumen', function() {
        if (auth()->user()->esDocente()) {
            return redirect()->route('docentes.estadisticas');
        }
        return redirect()->route('estudiantes.historial-academico');
    })->name('mi-resumen');

    // ==========================================
    // GESTIÓN INTEGRAL DE DOCENTES
    // ==========================================
    Route::prefix('docentes')->name('docentes.')->group(function () {
        
        // Rutas para docentes autenticados
        Route::middleware('user.type:docente')->group(function () {
            Route::get('/', [DocenteController::class, 'index'])->name('index');
            Route::get('/perfil', [DocenteController::class, 'perfil'])->name('perfil');
            Route::get('/mis-clases', [DocenteController::class, 'misClases'])->name('mis-clases');
            Route::get('/mis-estudiantes', [DocenteController::class, 'misEstudiantes'])->name('mis-estudiantes');
            Route::get('/estadisticas', [DocenteController::class, 'estadisticas'])->name('estadisticas');
            Route::get('/exportar/{tipo}', [DocenteController::class, 'exportarDatos'])->name('exportar');
        });
        
        // Rutas específicas de docente (con permisos)
        Route::get('/{docente}', [DocenteController::class, 'show'])->name('show');
        Route::get('/{docente}/editar', [DocenteController::class, 'edit'])->name('edit');
        Route::put('/{docente}', [DocenteController::class, 'update'])->name('update');
    });

    // ==========================================
    // GESTIÓN INTEGRAL DE ESTUDIANTES
    // ==========================================
    Route::prefix('estudiantes')->name('estudiantes.')->group(function () {
        
        // Rutas para estudiantes autenticados
        Route::middleware('user.type:estudiante')->group(function () {
            Route::get('/perfil', [EstudianteController::class, 'perfil'])->name('perfil');
            Route::get('/mis-clases', [EstudianteController::class, 'misClases'])->name('mis-clases');
            Route::get('/mis-personajes', [EstudianteController::class, 'misPersonajes'])->name('mis-personajes');
            Route::get('/mis-actividades', [EstudianteController::class, 'misActividades'])->name('mis-actividades');
            Route::get('/mi-comportamiento', [EstudianteController::class, 'miComportamiento'])->name('mi-comportamiento');
            Route::get('/mis-badges', [EstudianteController::class, 'misBadges'])->name('mis-badges');
            Route::get('/historial-academico', [EstudianteController::class, 'historialAcademico'])->name('historial-academico');
            Route::get('/exportar/{tipo}', [EstudianteController::class, 'exportarDatos'])->name('exportar');
        });
        
        // Rutas para docentes (ver estudiantes)
        Route::middleware('user.type:docente')->group(function () {
            Route::get('/', [EstudianteController::class, 'index'])->name('index');
        });
        
        // Rutas específicas de estudiante (con permisos)
        Route::get('/{estudiante}', [EstudianteController::class, 'show'])->name('show');
        Route::get('/{estudiante}/editar', [EstudianteController::class, 'edit'])->name('edit');
        Route::put('/{estudiante}', [EstudianteController::class, 'update'])->name('update');
    });

    // ==========================================
    // GESTIÓN DE CLASES
    // ==========================================
    Route::prefix('clases')->name('clases.')->group(function () {
        Route::get('/', [ClaseController::class, 'index'])->name('index');
        
        // Rutas para Docentes
        Route::middleware('user.type:docente')->group(function () {
            Route::get('/crear', [ClaseController::class, 'create'])->name('create');
            Route::post('/', [ClaseController::class, 'store'])->name('store');
            Route::get('/{clase}/editar', [ClaseController::class, 'edit'])->name('edit');
            Route::put('/{clase}', [ClaseController::class, 'update'])->name('update');
            Route::delete('/{clase}', [ClaseController::class, 'destroy'])->name('destroy');
            Route::post('/{clase}/regenerar-codigo', [ClaseController::class, 'regenerarCodigo'])->name('regenerar-codigo');
        });
        
        // Rutas para Estudiantes
        Route::middleware('user.type:estudiante')->group(function () {
            Route::get('/unirse/formulario', [ClaseController::class, 'mostrarFormularioUnirse'])->name('unirse.form');
            Route::post('/unirse', [ClaseController::class, 'unirse'])->name('unirse');
        });
        
        // Rutas compartidas
        Route::get('/{clase}', [ClaseController::class, 'show'])->name('show');
    });

    // ==========================================
    // GESTIÓN DE SESIONES DE CLASE
    // ==========================================
    Route::prefix('clases/{clase}/sesiones')->name('sesiones.')->middleware('user.type:docente')->group(function () {
        Route::post('/iniciar', [SesionClaseController::class, 'iniciar'])->name('iniciar');
    });

    Route::prefix('sesiones')->name('sesiones.')->middleware('user.type:docente')->group(function () {
        Route::get('/{sesion}', [SesionClaseController::class, 'show'])->name('show');
        Route::post('/{sesion}/seleccionar-estudiante', [SesionClaseController::class, 'seleccionarEstudianteAleatorio'])->name('seleccionar-estudiante');
        Route::post('/{sesion}/pausar', [SesionClaseController::class, 'pausar'])->name('pausar');
        Route::post('/{sesion}/reanudar', [SesionClaseController::class, 'reanudar'])->name('reanudar');
        Route::post('/{sesion}/terminar', [SesionClaseController::class, 'terminar'])->name('terminar');
    });

    // ==========================================
    // GESTIÓN DE PERSONAJES
    // ==========================================
    Route::prefix('personajes')->name('personajes.')->group(function () {
        Route::get('/{personaje}', [PersonajeController::class, 'show'])->name('show');
        Route::get('/clase/{clase}/ranking', [PersonajeController::class, 'ranking'])->name('ranking');
        
        // Solo estudiantes pueden editar sus personajes
        Route::middleware('user.type:estudiante')->group(function () {
            Route::get('/{personaje}/editar', [PersonajeController::class, 'edit'])->name('edit');
            Route::put('/{personaje}', [PersonajeController::class, 'update'])->name('update');
        });
    });

    // ==========================================
    // GESTIÓN DE COMPORTAMIENTO
    // ==========================================
    Route::prefix('clases/{clase}/comportamiento')->name('comportamiento.')->group(function () {
        Route::get('/', [ComportamientoController::class, 'index'])->name('index');
        Route::get('/estudiante/{estudiante}', [ComportamientoController::class, 'reporteEstudiante'])->name('reporte-estudiante');
        
        // Solo docentes pueden gestionar comportamientos
        Route::middleware('user.type:docente')->group(function () {
            Route::get('/crear', [ComportamientoController::class, 'create'])->name('create');
            Route::post('/', [ComportamientoController::class, 'store'])->name('store');
            Route::post('/rapido', [ComportamientoController::class, 'registroRapido'])->name('rapido');
            Route::delete('/{registro}', [ComportamientoController::class, 'destroy'])->name('destroy');
        });
    });

    // ==========================================
    // TIPOS DE COMPORTAMIENTO (Solo Docentes)
    // ==========================================
    Route::prefix('tipos-comportamiento')->name('tipo-comportamiento.')->middleware('user.type:docente')->group(function () {
        Route::get('/', [TipoComportamientoController::class, 'index'])->name('index');
        Route::get('/crear', [TipoComportamientoController::class, 'create'])->name('create');
        Route::post('/', [TipoComportamientoController::class, 'store'])->name('store');
        Route::get('/{tipo}/editar', [TipoComportamientoController::class, 'edit'])->name('edit');
        Route::put('/{tipo}', [TipoComportamientoController::class, 'update'])->name('update');
        Route::delete('/{tipo}', [TipoComportamientoController::class, 'destroy'])->name('destroy');
    });

    // ==========================================
    // GESTIÓN DE MISIONES
    // ==========================================
    Route::prefix('clases/{clase}/misiones')->name('misiones.')->group(function () {
        Route::get('/', [MisionController::class, 'index'])->name('index');
        
        // Solo docentes pueden crear/editar misiones
        Route::middleware('user.type:docente')->group(function () {
            Route::get('/crear', [MisionController::class, 'create'])->name('create');
            Route::post('/', [MisionController::class, 'store'])->name('store');
        });
    });

    Route::prefix('misiones')->name('misiones.')->group(function () {
        Route::get('/{mision}', [MisionController::class, 'show'])->name('show');
        
        Route::middleware('user.type:docente')->group(function () {
            Route::get('/{mision}/editar', [MisionController::class, 'edit'])->name('edit');
            Route::put('/{mision}', [MisionController::class, 'update'])->name('update');
            Route::delete('/{mision}', [MisionController::class, 'destroy'])->name('destroy');
        });
    });

    // ==========================================
    // GESTIÓN DE ACTIVIDADES
    // ==========================================
    Route::prefix('clases/{clase}/actividades')->name('actividades.')->group(function () {
        Route::get('/', [ActividadController::class, 'index'])->name('index');
        
        // Solo docentes pueden crear actividades
        Route::middleware('user.type:docente')->group(function () {
            Route::get('/crear', [ActividadController::class, 'create'])->name('create');
            Route::post('/', [ActividadController::class, 'store'])->name('store');
        });
    });

    Route::prefix('actividades')->name('actividades.')->group(function () {
        Route::get('/{actividad}', [ActividadController::class, 'show'])->name('show');
        
        // Docentes
        Route::middleware('user.type:docente')->group(function () {
            Route::get('/{actividad}/editar', [ActividadController::class, 'edit'])->name('edit');
            Route::put('/{actividad}', [ActividadController::class, 'update'])->name('update');
            Route::delete('/{actividad}', [ActividadController::class, 'destroy'])->name('destroy');
            Route::put('/entregas/{entrega}/calificar', [ActividadController::class, 'calificar'])->name('calificar');
        });
        
        // Estudiantes
        Route::middleware('user.type:estudiante')->group(function () {
            Route::post('/{actividad}/entregar', [ActividadController::class, 'entregar'])->name('entregar');
        });
    });

    // ==========================================
    // GESTIÓN DE ASISTENCIA
    // ==========================================
    Route::prefix('clases/{clase}/asistencia')->name('asistencia.')->group(function () {
        Route::get('/reporte', [AsistenciaController::class, 'reporte'])->name('reporte');
        Route::get('/estudiante/{estudiante}', [AsistenciaController::class, 'estudianteReporte'])->name('estudiante-reporte');
        
        // Solo docentes pueden marcar asistencia
        Route::middleware('user.type:docente')->group(function () {
            Route::get('/', [AsistenciaController::class, 'index'])->name('index');
            Route::post('/marcar', [AsistenciaController::class, 'marcar'])->name('marcar');
        });
    });

    // ==========================================
    // SISTEMA DE MONEDAS
    // ==========================================
    Route::prefix('monedas')->name('monedas.')->group(function () {
        Route::get('/estudiante/{estudiante}/clase/{clase}', [MonedaController::class, 'saldoEstudiante'])->name('saldo-estudiante');
        Route::get('/clase/{clase}/tienda', [MonedaController::class, 'tienda'])->name('tienda');
        
        // Estudiantes pueden comprar
        Route::middleware('user.type:estudiante')->group(function () {
            Route::post('/items/{item}/comprar', [MonedaController::class, 'comprar'])->name('comprar');
        });
        
        // Docentes pueden agregar monedas
        Route::middleware('user.type:docente')->group(function () {
            Route::post('/estudiante/{estudiante}/clase/{clase}/agregar', [MonedaController::class, 'agregarMonedas'])->name('agregar');
        });
    });

    // ==========================================
    // SISTEMA DE BADGES/LOGROS
    // ==========================================
    Route::prefix('badges')->name('badges.')->group(function () {
        Route::get('/estudiante/{estudiante}/clase/{clase}', [BadgeController::class, 'estudianteBadges'])->name('estudiante');
        Route::post('/verificar/{estudiante}/clase/{clase}', [BadgeController::class, 'verificarBadges'])->name('verificar');
        
        // Solo docentes pueden gestionar badges
        Route::middleware('user.type:docente')->group(function () {
            Route::get('/', [BadgeController::class, 'index'])->name('index');
            Route::get('/crear', [BadgeController::class, 'create'])->name('create');
            Route::post('/', [BadgeController::class, 'store'])->name('store');
        });
    });

    // ==========================================
    // NOTIFICACIONES
    // ==========================================
    Route::prefix('notificaciones')->name('notificaciones.')->group(function () {
        Route::get('/', [NotificacionController::class, 'index'])->name('index');
        Route::patch('/{notificacion}/marcar-leida', [NotificacionController::class, 'marcarComoLeida'])->name('marcar-leida');
        Route::post('/marcar-todas-leidas', [NotificacionController::class, 'marcarTodasComoLeidas'])->name('marcar-todas-leidas');
        Route::delete('/{notificacion}', [NotificacionController::class, 'eliminar'])->name('eliminar');
    });

    // ==========================================
    // CONFIGURACIÓN DE CLASES
    // ==========================================
    Route::prefix('clases/{clase}/configuracion')->name('configuracion.')->middleware('user.type:docente')->group(function () {
        Route::get('/', [ConfiguracionController::class, 'show'])->name('show');
        Route::put('/', [ConfiguracionController::class, 'update'])->name('update');
    });

    // ==========================================
    // REPORTES
    // ==========================================
    Route::prefix('reportes')->name('reportes.')->group(function () {
        Route::get('/estudiante/{estudiante}/clase/{clase}', [ReporteController::class, 'boletinEstudiante'])->name('boletin-estudiante');
        Route::get('/clase/{clase}/estadisticas', [ReporteController::class, 'estadisticasClase'])->name('estadisticas-clase');
    });

    // ==========================================
    // ADMINISTRACIÓN (Solo Docentes)
    // ==========================================
    Route::prefix('admin')->name('admin.')->middleware('user.type:docente')->group(function () {
        Route::get('/dashboard', [AdminController::class, 'dashboard'])->name('dashboard');
        Route::get('/usuarios', [AdminController::class, 'usuarios'])->name('usuarios');
        Route::post('/usuarios/{usuario}/toggle', [AdminController::class, 'toggleUsuario'])->name('toggle-usuario');
        Route::get('/reporte-general', [AdminController::class, 'reporteGeneral'])->name('reporte-general');
        Route::get('/exportar/{tipo}', [AdminController::class, 'exportarDatos'])->name('exportar-datos');
    });

    // ==========================================
    // GESTIÓN DE PERFIL
    // ==========================================
    Route::prefix('perfil')->name('perfil.')->group(function () {
        Route::get('/', [PerfilController::class, 'edit'])->name('edit');
        Route::patch('/informacion', [PerfilController::class, 'updateInformacion'])->name('update-informacion');
        Route::patch('/password', [PerfilController::class, 'updatePassword'])->name('update-password');
        Route::delete('/', [PerfilController::class, 'destroy'])->name('destroy');
    });

    // ==========================================
    // API ENDPOINTS (Para AJAX/Vue Components)
    // ==========================================
    Route::prefix('api')->name('api.')->group(function () {
        
        // Datos rápidos para dashboards
        Route::get('/dashboard/stats', function() {
            $user = auth()->user();
            if ($user->esDocente()) {
                return response()->json([
                    'total_clases' => $user->docente->clases()->count(),
                    'estudiantes_activos' => $user->docente->totalEstudiantes(),
                    'actividades_pendientes' => $user->docente->clases()
                        ->join('actividad', 'clase.id', '=', 'actividad.id_clase')
                        ->where('actividad.activa', true)
                        ->where('actividad.fecha_entrega', '>', now())
                        ->count(),
                    'comportamientos_este_mes' => \App\Models\RegistroComportamiento::whereIn('id_clase', 
                        $user->docente->clases()->pluck('id'))
                        ->whereMonth('created_at', now()->month)
                        ->count(),
                ]);
            } else {
                return response()->json([
                    'total_clases' => $user->estudiante->clasesActivas()->count(),
                    'nivel_promedio' => $user->estudiante->personajes()->avg('nivel') ?? 1,
                    'experiencia_total' => $user->estudiante->personajes()->sum('experiencia'),
                    'actividades_pendientes' => $user->estudiante->clases()
                        ->join('actividad', 'clase.id', '=', 'actividad.id_clase')
                        ->leftJoin('entrega_actividad', function($join) use ($user) {
                            $join->on('actividad.id', '=', 'entrega_actividad.id_actividad')
                                 ->where('entrega_actividad.id_estudiante', $user->estudiante->id);
                        })
                        ->whereNull('entrega_actividad.id')
                        ->where('actividad.activa', true)
                        ->where('actividad.fecha_entrega', '>', now())
                        ->count(),
                ]);
            }
        })->name('dashboard.stats');

        // Datos del perfil para widgets
        Route::get('/mi-perfil/resumen', function() {
            $user = auth()->user();
            
            if ($user->esDocente()) {
                $docente = $user->docente;
                return response()->json([
                    'tipo' => 'docente',
                    'total_clases' => $docente->clases()->count(),
                    'clases_activas' => $docente->clasesActivas()->count(),
                    'total_estudiantes' => $docente->totalEstudiantes(),
                    'especialidad' => $docente->especialidad,
                    'ultimo_acceso' => $user->ultimo_acceso,
                ]);
            } else {
                $estudiante = $user->estudiante;
                return response()->json([
                    'tipo' => 'estudiante',
                    'total_clases' => $estudiante->clasesActivas()->count(),
                    'nivel_promedio' => $estudiante->personajes()->avg('nivel') ?? 1,
                    'experiencia_total' => $estudiante->personajes()->sum('experiencia'),
                    'codigo_estudiante' => $estudiante->codigo_estudiante,
                    'grado' => $estudiante->grado,
                    'actividades_pendientes' => $estudiante->clases()
                        ->join('actividad', 'clase.id', '=', 'actividad.id_clase')
                        ->leftJoin('entrega_actividad', function($join) use ($estudiante) {
                            $join->on('actividad.id', '=', 'entrega_actividad.id_actividad')
                                 ->where('entrega_actividad.id_estudiante', $estudiante->id);
                        })
                        ->whereNull('entrega_actividad.id')
                        ->where('actividad.activa', true)
                        ->where('actividad.fecha_entrega', '>', now())
                        ->count(),
                ]);
            }
        })->name('mi-perfil.resumen');

        // Notificaciones no leídas
        Route::get('/notificaciones/no-leidas', function() {
            return response()->json([
                'count' => \App\Models\Notificacion::where('id_usuario', auth()->id())
                    ->where('leida', false)
                    ->count(),
                'latest' => \App\Models\Notificacion::where('id_usuario', auth()->id())
                    ->where('leida', false)
                    ->latest()
                    ->limit(5)
                    ->get()
            ]);
        })->name('notificaciones.no-leidas');

        // Búsqueda rápida de estudiantes en una clase
        Route::get('/clases/{clase}/estudiantes/buscar', function($claseId) {
            $busqueda = request('q');
            $clase = \App\Models\Clase::findOrFail($claseId);
            
            // Verificar permisos
            abort_unless(auth()->user()->esDocente() && $clase->id_docente === auth()->user()->docente->id, 403);
            
            $estudiantes = $clase->estudiantesActivos()
                ->whereHas('usuario', function($query) use ($busqueda) {
                    $query->where('nombre', 'ILIKE', "%{$busqueda}%")
                          ->orWhere('correo', 'ILIKE', "%{$busqueda}%");
                })
                ->with('usuario')
                ->limit(10)
                ->get();

            return response()->json($estudiantes);
        })->name('clases.estudiantes.buscar');

        // Verificar código de clase
        Route::post('/clases/verificar-codigo', function() {
            $codigo = request('codigo');
            $clase = \App\Models\Clase::where('codigo_invitacion', strtoupper($codigo))
                ->where('activo', true)
                ->first();

            if ($clase) {
                return response()->json([
                    'valido' => true,
                    'clase' => [
                        'id' => $clase->id,
                        'nombre' => $clase->nombre,
                        'descripcion' => $clase->descripcion,
                        'docente' => $clase->docente->usuario->nombre,
                        'grado' => $clase->grado,
                        'seccion' => $clase->seccion,
                    ]
                ]);
            }

            return response()->json(['valido' => false]);
        })->name('clases.verificar-codigo');

        // Progreso del estudiante en una clase específica
        Route::get('/estudiantes/{estudiante}/clase/{clase}/progreso', function($estudianteId, $claseId) {
            $estudiante = \App\Models\Estudiante::findOrFail($estudianteId);
            $clase = \App\Models\Clase::findOrFail($claseId);
            
            // Verificar permisos
            $user = auth()->user();
            if ($user->esEstudiante() && $user->estudiante->id != $estudianteId) {
                abort(403);
            }
            if ($user->esDocente() && $clase->id_docente != $user->docente->id) {
                abort(403);
            }
            
            $personaje = $estudiante->personajeEnClase($claseId);
            $totalActividades = $clase->actividades()->count();
            $actividadesCompletadas = $estudiante->entregasActividad()
                ->whereHas('actividad', function($q) use ($claseId) {
                    $q->where('id_clase', $claseId);
                })
                ->whereNotNull('nota')
                ->count();
            
            return response()->json([
                'personaje' => $personaje,
                'progreso_actividades' => $totalActividades > 0 ? ($actividadesCompletadas / $totalActividades) * 100 : 0,
                'actividades_completadas' => $actividadesCompletadas,
                'total_actividades' => $totalActividades,
                'asistencia' => \App\Models\Asistencia::porcentajeAsistencia($estudianteId, $claseId),
                'promedio_notas' => $estudiante->entregasActividad()
                    ->whereHas('actividad', function($q) use ($claseId) {
                        $q->where('id_clase', $claseId);
                    })
                    ->whereNotNull('nota')
                    ->avg('nota') ?? 0,
                'saldo_monedas' => \App\Models\TransaccionMoneda::obtenerSaldo($estudianteId, $claseId),
            ]);
        })->name('estudiantes.progreso-clase');

        // Estadísticas rápidas de una clase para el docente
        Route::get('/clases/{clase}/estadisticas-rapidas', function($claseId) {
            $clase = \App\Models\Clase::with(['estudiantes', 'actividades'])->findOrFail($claseId);
            
            // Solo el docente de la clase puede ver estas estadísticas
            abort_unless(auth()->user()->esDocente() && $clase->id_docente === auth()->user()->docente->id, 403);
            
            $totalEstudiantes = $clase->estudiantesActivos()->count();
            $promedioNivel = $clase->personajes()->avg('nivel') ?? 1;
            $actividadesPendientes = $clase->actividades()
                ->where('activa', true)
                ->where('fecha_entrega', '>', now())
                ->count();
            
            return response()->json([
                'total_estudiantes' => $totalEstudiantes,
                'promedio_nivel' => round($promedioNivel, 1),
                'actividades_pendientes' => $actividadesPendientes,
                'entregas_sin_calificar' => \App\Models\EntregaActividad::whereHas('actividad', function($q) use ($claseId) {
                        $q->where('id_clase', $claseId);
                    })
                    ->whereNull('nota')
                    ->count(),
                'asistencia_promedio' => $clase->asistencias()->count() > 0 
                    ? ($clase->asistencias()->where('presente', true)->count() / $clase->asistencias()->count()) * 100 
                    : 0,
                'comportamientos_registrados_hoy' => \App\Models\RegistroComportamiento::where('id_clase', $claseId)
                    ->whereDate('fecha', today())
                    ->count(),
            ]);
        })->name('clases.estadisticas-rapidas');

        // Ranking en tiempo real de una clase
        Route::get('/clases/{clase}/ranking-tiempo-real', function($claseId) {
            $clase = \App\Models\Clase::findOrFail($claseId);
            
            // Verificar permisos de acceso a la clase
            $user = auth()->user();
            if ($user->esDocente() && $clase->id_docente !== $user->docente->id) {
                abort(403);
            }
            if ($user->esEstudiante() && !$clase->estudiantes()->where('estudiante.id', $user->estudiante->id)->exists()) {
                abort(403);
            }
            
            $ranking = \App\Models\Personaje::where('id_clase', $claseId)
                ->with(['estudiante.usuario', 'claseRpg'])
                ->orderBy('experiencia', 'desc')
                ->orderBy('nivel', 'desc')
                ->limit(10)
                ->get()
                ->map(function($personaje, $index) {
                    return [
                        'posicion' => $index + 1,
                        'estudiante' => $personaje->estudiante->usuario->nombre,
                        'personaje' => $personaje->nombre,
                        'clase_rpg' => $personaje->claseRpg->nombre,
                        'nivel' => $personaje->nivel,
                        'experiencia' => $personaje->experiencia,
                    ];
                });
            
            return response()->json($ranking);
        })->name('clases.ranking-tiempo-real');

        // Actividades próximas a vencer
        Route::get('/actividades/proximas-vencer', function() {
            $user = auth()->user();
            
            if ($user->esDocente()) {
                $actividades = \App\Models\Actividad::whereIn('id_clase', $user->docente->clases()->pluck('id'))
                    ->where('activa', true)
                    ->where('fecha_entrega', '>', now())
                    ->where('fecha_entrega', '<=', now()->addDays(3))
                    ->with(['clase', 'tipoActividad'])
                    ->withCount('entregas')
                    ->orderBy('fecha_entrega')
                    ->get();
            } else {
                $actividades = \App\Models\Actividad::whereIn('id_clase', $user->estudiante->clases()->pluck('id'))
                    ->where('activa', true)
                    ->where('fecha_entrega', '>', now())
                    ->where('fecha_entrega', '<=', now()->addDays(3))
                    ->whereDoesntHave('entregas', function($q) use ($user) {
                        $q->where('id_estudiante', $user->estudiante->id);
                    })
                    ->with(['clase', 'tipoActividad'])
                    ->orderBy('fecha_entrega')
                    ->get();
            }
            
            return response()->json($actividades);
        })->name('actividades.proximas-vencer');

        // Subir nivel de personaje (para testing)
        Route::post('/personajes/{personaje}/agregar-experiencia', function($personajeId) {
            $personaje = \App\Models\Personaje::findOrFail($personajeId);
            
            // Solo el estudiante dueño del personaje o su docente
            $user = auth()->user();
            if ($user->esEstudiante() && $personaje->id_estudiante !== $user->estudiante->id) {
                abort(403);
            }
            if ($user->esDocente() && $personaje->clase->id_docente !== $user->docente->id) {
                abort(403);
            }
            
            $experiencia = request('experiencia', 10);
            $nivelAnterior = $personaje->nivel;
            $subioNivel = $personaje->agregarExperiencia($experiencia);
            
            return response()->json([
                'experiencia_agregada' => $experiencia,
                'experiencia_total' => $personaje->experiencia,
                'nivel_anterior' => $nivelAnterior,
                'nivel_actual' => $personaje->nivel,
                'subio_nivel' => $subioNivel,
                'experiencia_siguiente_nivel' => $personaje->experienciaParaSiguienteNivel(),
            ]);
        })->name('personajes.agregar-experiencia');
    });

});

// ==========================================
// RUTAS DE MANTENIMIENTO Y ERROR
// ==========================================
Route::get('/mantenimiento', function () {
    return Inertia::render('Mantenimiento', [
        'mensaje' => 'Sistema en mantenimiento. Volveremos pronto.',
        'tiempo_estimado' => '30 minutos',
    ]);
})->name('mantenimiento');

// ==========================================
// RUTAS DE TESTING (Solo en desarrollo)
// ==========================================
if (app()->environment('local', 'testing')) {
    Route::prefix('testing')->name('testing.')->middleware('auth')->group(function () {
        
        // Página de testing para desarrolladores
        Route::get('/dashboard', function() {
            return Inertia::render('Testing/Dashboard', [
                'user' => auth()->user(),
                'rutas_disponibles' => [
                    'Dashboard' => route('dashboard'),
                    'Mi Perfil' => route('mi-perfil'),
                    'Clases' => route('clases.index'),
                    'Notificaciones' => route('notificaciones.index'),
                ],
            ]);
        })->name('dashboard');
        
        // Simular datos para testing
        Route::post('/generar-datos-prueba', function() {
            \Artisan::call('eduapp:generar-datos', ['--todo' => true]);
            return back()->with('success', 'Datos de prueba generados.');
        })->name('generar-datos');
        
        // Limpiar datos de testing
        Route::post('/limpiar-datos', function() {
            \App\Models\RegistroComportamiento::truncate();
            \App\Models\EntregaActividad::truncate();
            \App\Models\Actividad::truncate();
            return back()->with('success', 'Datos de testing eliminados.');
        })->name('limpiar-datos');
    });
}

// ==========================================
// WEBHOOKS Y APIS EXTERNAS (Futuro)
// ==========================================
Route::prefix('webhooks')->name('webhooks.')->group(function () {
    // Para integraciones futuras con Google Classroom, Moodle, etc.
    Route::post('/google-classroom', function() {
        // Webhook para Google Classroom
        return response()->json(['status' => 'received']);
    })->name('google-classroom');
    
    Route::post('/moodle-sync', function() {
        // Webhook para sincronización con Moodle
        return response()->json(['status' => 'received']);
    })->name('moodle-sync');
});

// ==========================================
// RUTAS DE ERROR Y FALLBACK
// ==========================================
Route::fallback(function () {
    return Inertia::render('Error', [
        'status' => 404,
        'message' => 'Página no encontrada',
        'description' => 'La página que buscas no existe o ha sido movida.',
        'suggestions' => [
            ['text' => 'Ir al Dashboard', 'url' => route('dashboard')],
            ['text' => 'Ver mis Clases', 'url' => route('clases.index')],
            ['text' => 'Contactar Soporte', 'url' => route('contacto')],
        ]
    ]);
});

