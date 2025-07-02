@extends('layouts.guest')

@section('title', 'Iniciar Sesión')

@section('content')
<div class="container-fluid min-vh-100 d-flex align-items-center justify-content-center auth-gradient">
    <div class="row w-100 justify-content-center">
        <div class="col-12 col-sm-8 col-md-6 col-lg-4">
            
            <!-- Logo y título -->
            <div class="text-center mb-5">
                <div class="auth-logo mb-4">
                    <div class="logo-emblem mx-auto">
                        <i class="mdi mdi-gamepad-variant"></i>
                    </div>
                </div>
                <h1 class="display-6 fw-bold text-white mb-2">EDUAPP</h1>
                <h2 class="h4 text-white mb-3">GAMIFICADA</h2>
                <p class="text-white-50">Sistema Educativo del Futuro</p>
            </div>

            <!-- Card de login -->
            <div class="card shadow-lg border-0">
                <div class="card-body p-5">
                    <!-- Header del panel -->
                    <div class="text-center mb-4">
                        <div class="text-primary mb-3">
                            <i class="mdi mdi-login display-6"></i>
                        </div>
                        <h3 class="h4 fw-bold">ACCESO AL SISTEMA</h3>
                        <p class="text-muted">Identifícate como Guardián o Instructor</p>
                    </div>

                    <!-- Formulario de login -->
                    <form method="POST" action="{{ route('login') }}">
                        @csrf

                        <!-- Email -->
                        <div class="mb-3">
                            <label for="email" class="form-label fw-semibold text-uppercase small">
                                <i class="mdi mdi-email me-1"></i>Identificación
                            </label>
                            <input 
                                type="email" 
                                class="form-control form-control-lg @error('email') is-invalid @enderror" 
                                id="email" 
                                name="email" 
                                value="{{ old('email') }}" 
                                placeholder="correo@ejemplo.com"
                                required 
                                autocomplete="email" 
                                autofocus
                            >
                            @error('email')
                                <div class="invalid-feedback">
                                    <i class="mdi mdi-alert-circle me-1"></i>{{ $message }}
                                </div>
                            @enderror
                        </div>

                        <!-- Password -->
                        <div class="mb-3">
                            <label for="password" class="form-label fw-semibold text-uppercase small">
                                <i class="mdi mdi-lock me-1"></i>Código de Acceso
                            </label>
                            <div class="input-group">
                                <input 
                                    type="password" 
                                    class="form-control form-control-lg @error('password') is-invalid @enderror" 
                                    id="password" 
                                    name="password" 
                                    placeholder="••••••••"
                                    required 
                                    autocomplete="current-password"
                                >
                                <button class="btn btn-outline-secondary" type="button" onclick="togglePassword()">
                                    <i class="mdi mdi-eye" id="toggleIcon"></i>
                                </button>
                                @error('password')
                                    <div class="invalid-feedback">
                                        <i class="mdi mdi-alert-circle me-1"></i>{{ $message }}
                                    </div>
                                @enderror
                            </div>
                        </div>

                        <!-- Remember me -->
                        <div class="mb-4">
                            <div class="form-check">
                                <input 
                                    class="form-check-input" 
                                    type="checkbox" 
                                    id="remember" 
                                    name="remember"
                                    {{ old('remember') ? 'checked' : '' }}
                                >
                                <label class="form-check-label" for="remember">
                                    Mantener sesión activa
                                </label>
                            </div>
                        </div>

                        <!-- Botón de login -->
                        <button type="submit" class="btn btn-primary btn-lg w-100 mb-3">
                            <i class="mdi mdi-rocket-launch me-2"></i>
                            INICIAR TRANSMISIÓN
                        </button>

                        <!-- Error general -->
                        @error('general')
                            <div class="alert alert-danger">
                                <i class="mdi mdi-alert-circle me-2"></i>{{ $message }}
                            </div>
                        @enderror
                    </form>

                    <!-- Divider -->
                    <hr class="my-4">
                    <div class="text-center mb-3">
                        <small class="text-muted text-uppercase">Nuevo en el sistema</small>
                    </div>

                    <!-- Link a registro -->
                    <div class="text-center">
                        <p class="mb-3">¿No tienes acceso al sistema?</p>
                        <a href="{{ route('register') }}" class="btn btn-outline-secondary w-100">
                            <i class="mdi mdi-account-plus me-2"></i>
                            REGISTRARSE COMO GUARDIÁN
                        </a>
                    </div>
                </div>
            </div>

            <!-- Info cards -->
            <div class="row mt-4">
                <div class="col-md-4 mb-3">
                    <div class="card bg-primary text-white text-center h-100">
                        <div class="card-body p-3">
                            <i class="mdi mdi-shield-account display-6 mb-2"></i>
                            <h6 class="fw-bold">Para Instructores</h6>
                            <small>Gestiona clases y evalúa progreso</small>
                        </div>
                    </div>
                </div>
                <div class="col-md-4 mb-3">
                    <div class="card bg-success text-white text-center h-100">
                        <div class="card-body p-3">
                            <i class="mdi mdi-sword display-6 mb-2"></i>
                            <h6 class="fw-bold">Para Estudiantes</h6>
                            <small>Crea tu personaje y evoluciona</small>
                        </div>
                    </div>
                </div>
                <div class="col-md-4 mb-3">
                    <div class="card bg-warning text-dark text-center h-100">
                        <div class="card-body p-3">
                            <i class="mdi mdi-trophy display-6 mb-2"></i>
                            <h6 class="fw-bold">Gamificado</h6>
                            <small>Gana XP y sube de nivel</small>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Stats -->
            <div class="row mt-4">
                <div class="col-4 text-center">
                    <div class="text-white">
                        <div class="h4 fw-bold">1,247</div>
                        <small class="text-white-50">Guardianes Activos</small>
                    </div>
                </div>
                <div class="col-4 text-center">
                    <div class="text-white">
                        <div class="h4 fw-bold">89</div>
                        <small class="text-white-50">Instructores</small>
                    </div>
                </div>
                <div class="col-4 text-center">
                    <div class="text-white">
                        <div class="h4 fw-bold">3,521</div>
                        <small class="text-white-50">Misiones Completadas</small>
                    </div>
                </div>
            </div>

            <!-- Footer -->
            <div class="text-center mt-4">
                <p class="text-white-50 small">
                    &copy; {{ date('Y') }} EduApp Gamificada - Forjando el futuro de la educación
                </p>
            </div>
        </div>
    </div>
</div>

<script>
function togglePassword() {
    const passwordInput = document.getElementById('password');
    const toggleIcon = document.getElementById('toggleIcon');
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        toggleIcon.className = 'mdi mdi-eye-off';
    } else {
        passwordInput.type = 'password';
        toggleIcon.className = 'mdi mdi-eye';
    }
}
</script>
@endsection