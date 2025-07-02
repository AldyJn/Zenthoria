@extends('layouts.guest')

@section('title', 'Crear Cuenta')

@section('content')
<div class="container-fluid min-vh-100 d-flex align-items-center justify-content-center auth-gradient">
    <div class="row w-100 justify-content-center">
        <div class="col-12 col-sm-8 col-md-6 col-lg-5">
            
            <!-- Logo y título -->
            <div class="text-center mb-4">
                <div class="auth-logo mb-3">
                    <div class="logo-emblem mx-auto">
                        <i class="mdi mdi-gamepad-variant"></i>
                    </div>
                </div>
                <h1 class="h3 fw-bold text-white mb-2">CREAR CUENTA</h1>
                <p class="text-white-50">Únete a la aventura educativa</p>
            </div>

            <!-- Card de registro -->
            <div class="card shadow-lg border-0">
                <div class="card-body p-4">
                    <!-- Header del panel -->
                    <div class="text-center mb-4">
                        <div class="text-primary mb-2">
                            <i class="mdi mdi-account-plus display-6"></i>
                        </div>
                        <h3 class="h5 fw-bold">REGISTRO DE GUARDIÁN</h3>
                        <p class="text-muted small">Complete los datos para acceder al sistema</p>
                    </div>

                    <!-- Formulario de registro -->
                    <form method="POST" action="{{ route('register') }}">
                        @csrf

                        <!-- Nombre -->
                        <div class="mb-3">
                            <label for="nombre" class="form-label fw-semibold">
                                <i class="mdi mdi-account me-1"></i>Nombre Completo
                            </label>
                            <input 
                                type="text" 
                                class="form-control @error('nombre') is-invalid @enderror" 
                                id="nombre" 
                                name="nombre" 
                                value="{{ old('nombre') }}" 
                                placeholder="Tu nombre completo"
                                required 
                                autofocus
                            >
                            @error('nombre')
                                <div class="invalid-feedback">
                                    <i class="mdi mdi-alert-circle me-1"></i>{{ $message }}
                                </div>
                            @enderror
                        </div>

                        <!-- Email -->
                        <div class="mb-3">
                            <label for="email" class="form-label fw-semibold">
                                <i class="mdi mdi-email me-1"></i>Correo Electrónico
                            </label>
                            <input 
                                type="email" 
                                class="form-control @error('email') is-invalid @enderror" 
                                id="email" 
                                name="email" 
                                value="{{ old('email') }}" 
                                placeholder="correo@ejemplo.com"
                                required 
                                autocomplete="email"
                            >
                            @error('email')
                                <div class="invalid-feedback">
                                    <i class="mdi mdi-alert-circle me-1"></i>{{ $message }}
                                </div>
                            @enderror
                        </div>

                        <!-- Tipo de usuario -->
                        <div class="mb-3">
                            <label for="tipo_usuario" class="form-label fw-semibold">
                                <i class="mdi mdi-account-group me-1"></i>Soy...
                            </label>
                            <select 
                                class="form-select @error('tipo_usuario') is-invalid @enderror" 
                                id="tipo_usuario" 
                                name="tipo_usuario" 
                                required
                            >
                                <option value="">Selecciona tu rol</option>
                                @foreach($tiposUsuario as $tipo)
                                    <option value="{{ $tipo->id }}" {{ old('tipo_usuario') == $tipo->id ? 'selected' : '' }}>
                                        {{ $tipo->nombre === 'docente' ? 'Docente/Profesor' : 'Estudiante' }}
                                    </option>
                                @endforeach
                            </select>
                            @error('tipo_usuario')
                                <div class="invalid-feedback">
                                    <i class="mdi mdi-alert-circle me-1"></i>{{ $message }}
                                </div>
                            @enderror
                        </div>

                        <!-- Campos condicionales -->
                        <div id="camposDocente" class="d-none">
                            <div class="mb-3">
                                <label for="especialidad" class="form-label fw-semibold">
                                    <i class="mdi mdi-school me-1"></i>Especialidad
                                </label>
                                <input 
                                    type="text" 
                                    class="form-control" 
                                    id="especialidad" 
                                    name="especialidad" 
                                    value="{{ old('especialidad') }}" 
                                    placeholder="Ej: Matemáticas, Historia, etc."
                                >
                            </div>
                        </div>

                        <div id="camposEstudiante" class="d-none">
                            <div class="row">
                                <div class="col-md-8 mb-3">
                                    <label for="grado" class="form-label fw-semibold">
                                        <i class="mdi mdi-book-open me-1"></i>Grado
                                    </label>
                                    <input 
                                        type="text" 
                                        class="form-control" 
                                        id="grado" 
                                        name="grado" 
                                        value="{{ old('grado') }}" 
                                        placeholder="Ej: 1ro, 2do, etc."
                                    >
                                </div>
                                <div class="col-md-4 mb-3">
                                    <label for="seccion" class="form-label fw-semibold">Sección</label>
                                    <input 
                                        type="text" 
                                        class="form-control" 
                                        id="seccion" 
                                        name="seccion" 
                                        value="{{ old('seccion') }}" 
                                        placeholder="A, B, C..."
                                    >
                                </div>
                            </div>
                        </div>

                        <!-- Password -->
                        <div class="mb-3">
                            <label for="password" class="form-label fw-semibold">
                                <i class="mdi mdi-lock me-1"></i>Contraseña
                            </label>
                            <input 
                                type="password" 
                                class="form-control @error('password') is-invalid @enderror" 
                                id="password" 
                                name="password" 
                                placeholder="Mínimo 8 caracteres"
                                required 
                                autocomplete="new-password"
                            >
                            @error('password')
                                <div class="invalid-feedback">
                                    <i class="mdi mdi-alert-circle me-1"></i>{{ $message }}
                                </div>
                            @enderror
                        </div>

                        <!-- Confirm Password -->
                        <div class="mb-4">
                            <label for="password_confirmation" class="form-label fw-semibold">
                                <i class="mdi mdi-lock-check me-1"></i>Confirmar Contraseña
                            </label>
                            <input 
                                type="password" 
                                class="form-control" 
                                id="password_confirmation" 
                                name="password_confirmation" 
                                placeholder="Repite tu contraseña"
                                required 
                                autocomplete="new-password"
                            >
                        </div>

                        <!-- Submit button -->
                        <button type="submit" class="btn btn-primary w-100 mb-3">
                            <i class="mdi mdi-account-plus me-2"></i>
                            CREAR CUENTA
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

                    <!-- Login link -->
                    <div class="text-center">
                        <p class="mb-0">¿Ya tienes cuenta?</p>
                        <a href="{{ route('login') }}" class="btn btn-outline-primary">
                            <i class="mdi mdi-login me-2"></i>
                            Iniciar Sesión
                        </a>
                    </div>
                </div>
            </div>

            <!-- Footer -->
            <div class="text-center mt-3">
                <p class="text-white-50 small">
                    &copy; {{ date('Y') }} EduApp Gamificada
                </p>
            </div>
        </div>
    </div>
</div>

<script>
document.getElementById('tipo_usuario').addEventListener('change', function() {
    const tipoUsuario = this.value;
    const camposDocente = document.getElementById('camposDocente');
    const camposEstudiante = document.getElementById('camposEstudiante');
    
    // Ocultar todos los campos condicionales
    camposDocente.classList.add('d-none');
    camposEstudiante.classList.add('d-none');
    
    // Mostrar campos según el tipo seleccionado
    @foreach($tiposUsuario as $tipo)
        if (tipoUsuario === '{{ $tipo->id }}') {
            if ('{{ $tipo->nombre }}' === 'docente') {
                camposDocente.classList.remove('d-none');
            } else if ('{{ $tipo->nombre }}' === 'estudiante') {
                camposEstudiante.classList.remove('d-none');
            }
        }
    @endforeach
});

// Activar campos condicionales si ya hay un valor seleccionado (para old() values)
document.addEventListener('DOMContentLoaded', function() {
    const tipoUsuario = document.getElementById('tipo_usuario');
    if (tipoUsuario.value) {
        tipoUsuario.dispatchEvent(new Event('change'));
    }
});
</script>
@endsection