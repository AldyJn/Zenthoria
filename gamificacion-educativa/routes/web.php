<?php

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

// ==========================================
// PÁGINA DE INICIO Y PÚBLICAS
// ==========================================
Route::get('/', function () {
    if (auth()->check()) {
        return redirect()->route('dashboard');
    }
    
    return view('welcome', [
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
    return view('public.sobre-nosotros');
})->name('sobre-nosotros');

Route::get('/como-funciona', function () {
    return view('public.como-funciona');
})->name('como-funciona');

Route::get('/contacto', function () {
    return view('public.contacto');
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

    // ==========================================
    // GESTIÓN INTEGRAL DE DOCENTES
    // ==========================================
    Route::prefix('docentes')->name('docentes.')->group(function () {
        Route::middleware('user.type:docente')->group(function () {
            Route::get('/', [DocenteController::class, 'index'])->name('index');
            Route::get('/perfil', [DocenteController::class, 'perfil'])->name('perfil');
            Route::get('/mis-clases', [DocenteController::class, 'misClases'])->name('mis-clases');
            Route::get('/mis-estudiantes', [DocenteController::class, 'misEstudiantes'])->name('mis-estudiantes');
            Route::get('/estadisticas', [DocenteController::class, 'estadisticas'])->name('estadisticas');
        });
    });

    // ==========================================
    // GESTIÓN INTEGRAL DE ESTUDIANTES
    // ==========================================
    Route::prefix('estudiantes')->name('estudiantes.')->group(function () {
        Route::middleware('user.type:estudiante')->group(function () {
            Route::get('/', [EstudianteController::class, 'index'])->name('index');
            Route::get('/perfil', [EstudianteController::class, 'perfil'])->name('perfil');
            Route::get('/mis-clases', [EstudianteController::class, 'misClases'])->name('mis-clases');
            Route::get('/mi-progreso', [EstudianteController::class, 'miProgreso'])->name('mi-progreso');
        });
    });

    // ==========================================
    // GESTIÓN COMPLETA DE CLASES
    // ==========================================
    Route::prefix('clases')->name('clases.')->group(function () {
        Route::get('/', [ClaseController::class, 'index'])->name('index');
        Route::get('/create', [ClaseController::class, 'create'])->name('create')->middleware('user.type:docente');
        Route::post('/', [ClaseController::class, 'store'])->name('store')->middleware('user.type:docente');
        Route::get('/unirse', [ClaseController::class, 'showUnirse'])->name('unirse')->middleware('user.type:estudiante');
        Route::post('/unirse', [ClaseController::class, 'unirse'])->name('unirse.post')->middleware('user.type:estudiante');
        Route::get('/{clase}', [ClaseController::class, 'show'])->name('show');
        Route::get('/{clase}/edit', [ClaseController::class, 'edit'])->name('edit')->middleware('user.type:docente');
        Route::put('/{clase}', [ClaseController::class, 'update'])->name('update')->middleware('user.type:docente');
        Route::delete('/{clase}', [ClaseController::class, 'destroy'])->name('destroy')->middleware('user.type:docente');
    });

    // ==========================================
    // GESTIÓN DE PERSONAJES RPG
    // ==========================================
    Route::prefix('clases/{clase}/personajes')->name('personajes.')->group(function () {
        Route::get('/', [PersonajeController::class, 'index'])->name('index');
        Route::get('/create', [PersonajeController::class, 'create'])->name('create');
        Route::post('/', [PersonajeController::class, 'store'])->name('store');
        Route::get('/{personaje}', [PersonajeController::class, 'show'])->name('show');
        Route::get('/{personaje}/edit', [PersonajeController::class, 'edit'])->name('edit');
        Route::put('/{personaje}', [PersonajeController::class, 'update'])->name('update');
        Route::delete('/{personaje}', [PersonajeController::class, 'destroy'])->name('destroy');
    });

    // ==========================================
    // GESTIÓN DE ACTIVIDADES
    // ==========================================
    Route::prefix('clases/{clase}/actividades')->name('actividades.')->group(function () {
        Route::get('/', [ActividadController::class, 'index'])->name('index');
        Route::get('/create', [ActividadController::class, 'create'])->name('create')->middleware('user.type:docente');
        Route::post('/', [ActividadController::class, 'store'])->name('store')->middleware('user.type:docente');
        Route::get('/{actividad}', [ActividadController::class, 'show'])->name('show');
        Route::get('/{actividad}/edit', [ActividadController::class, 'edit'])->name('edit')->middleware('user.type:docente');
        Route::put('/{actividad}', [ActividadController::class, 'update'])->name('update')->middleware('user.type:docente');
        Route::delete('/{actividad}', [ActividadController::class, 'destroy'])->name('destroy')->middleware('user.type:docente');
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
    // GESTIÓN DE PERFIL
    // ==========================================
    Route::prefix('perfil')->name('perfil.')->group(function () {
        Route::get('/', [PerfilController::class, 'edit'])->name('edit');
        Route::patch('/informacion', [PerfilController::class, 'updateInformacion'])->name('update-informacion');
        Route::patch('/password', [PerfilController::class, 'updatePassword'])->name('update-password');
        Route::delete('/', [PerfilController::class, 'destroy'])->name('destroy');
    });
});

// ==========================================
// APIS PARA AJAX
// ==========================================
Route::middleware(['auth'])->prefix('api')->name('api.')->group(function () {
    Route::get('/dashboard/stats', [DashboardController::class, 'stats'])->name('dashboard.stats');
    Route::post('/clases/verificar-codigo', [ClaseController::class, 'verificarCodigo'])->name('clases.verificar-codigo');
    Route::post('/personajes/{personaje}/agregar-experiencia', [PersonajeController::class, 'agregarExperiencia'])->name('personajes.agregar-experiencia');
});

// ==========================================
// RUTAS DE TESTING (Solo en desarrollo)
// ==========================================
if (app()->environment('local', 'testing')) {
    Route::get('/test', function () {
        return view('test', [
            'message' => 'Si ves esto, Blade está funcionando correctamente',
            'data' => [
                'timestamp' => now()->format('Y-m-d H:i:s'),
                'user_agent' => request()->userAgent(),
            ]
        ]);
    })->name('test');
}