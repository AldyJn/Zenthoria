@extends('layouts.guest')

@section('title', $appName)

@section('content')
<div class="container-fluid min-vh-100 d-flex align-items-center justify-content-center auth-gradient">
    <div class="row w-100 justify-content-center">
        <div class="col-12 col-lg-8">
            
            <!-- Logo y título principal -->
            <div class="text-center mb-5">
                <div class="auth-logo mb-4">
                    <div class="logo-emblem mx-auto">
                        <i class="mdi mdi-gamepad-variant"></i>
                    </div>
                </div>
                <h1 class="display-3 fw-bold text-white mb-3">{{ $appName }}</h1>
                <p class="h4 text-white-50 mb-4">Transforma el aprendizaje en una aventura épica</p>
                
                <!-- Botones principales -->
                <div class="d-flex flex-column flex-sm-row gap-3 justify-content-center mb-5">
                    @if($canLogin)
                        <a href="{{ route('login') }}" class="btn btn-primary btn-lg px-5 py-3">
                            <i class="mdi mdi-login me-2"></i>
                            Iniciar Sesión
                        </a>
                    @endif
                    
                    @if($canRegister)
                        <a href="{{ route('register') }}" class="btn btn-outline-light btn-lg px-5 py-3">
                            <i class="mdi mdi-account-plus me-2"></i>
                            Registrarse
                        </a>
                    @endif
                </div>
            </div>

            <!-- Features destacadas -->
            <div class="row mb-5">
                @foreach($features as $index => $feature)
                    <div class="col-lg-4 col-md-6 mb-4">
                        <div class="card bg-white bg-opacity-10 text-white border-0 h-100">
                            <div class="card-body text-center p-4">
                                <i class="mdi mdi-star display-4 mb-3 text-warning"></i>
                                <h5 class="fw-bold mb-2">{{ $feature }}</h5>
                                <p class="small text-white-50">
                                    @switch($index)
                                        @case(0)
                                            Crea personajes únicos con clases RPG y sistemas de niveles
                                            @break
                                        @case(1)
                                            Gana experiencia completando actividades y logros
                                            @break
                                        @case(2)
                                            Misiones, desafíos y contenido interactivo
                                            @break
                                        @case(3)
                                            Seguimiento en tiempo real del progreso estudiantil
                                            @break
                                        @case(4)
                                            Únete a clases fácilmente escaneando códigos QR
                                            @break
                                        @case(5)
                                            Panel personalizado según tu rol de usuario
                                            @break
                                    @endswitch
                                </p>
                            </div>
                        </div>
                    </div>
                @endforeach
            </div>

            <!-- Sección "Cómo funciona" -->
            <div class="text-center mb-5">
                <h2 class="h3 text-white mb-4">¿Cómo funciona?</h2>
                <div class="row">
                    <div class="col-md-4 mb-4">
                        <div class="card bg-primary text-white border-0 h-100">
                            <div class="card-body text-center p-4">
                                <div class="rounded-circle bg-white text-primary d-inline-flex align-items-center justify-content-center mb-3" style="width: 60px; height: 60px;">
                                    <span class="h4 fw-bold mb-0">1</span>
                                </div>
                                <h5 class="fw-bold">Regístrate</h5>
                                <p class="small">Crea tu cuenta como docente o estudiante</p>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-4 mb-4">
                        <div class="card bg-success text-white border-0 h-100">
                            <div class="card-body text-center p-4">
                                <div class="rounded-circle bg-white text-success d-inline-flex align-items-center justify-content-center mb-3" style="width: 60px; height: 60px;">
                                    <span class="h4 fw-bold mb-0">2</span>
                                </div>
                                <h5 class="fw-bold">Crea o Únete</h5>
                                <p class="small">Los docentes crean clases, los estudiantes se unen</p>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-4 mb-4">
                        <div class="card bg-warning text-dark border-0 h-100">
                            <div class="card-body text-center p-4">
                                <div class="rounded-circle bg-white text-warning d-inline-flex align-items-center justify-content-center mb-3" style="width: 60px; height: 60px;">
                                    <span class="h4 fw-bold mb-0">3</span>
                                </div>
                                <h5 class="fw-bold">¡Juega y Aprende!</h5>
                                <p class="small">Gana experiencia y completa misiones educativas</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Estadísticas -->
            <div class="text-center">
                <h3 class="h4 text-white mb-4">Únete a nuestra comunidad</h3>
                <div class="row">
                    <div class="col-md-4 mb-3">
                        <div class="text-white">
                            <div class="h2 fw-bold">1,247</div>
                            <p class="mb-0 text-white-50">Guardianes Activos</p>
                        </div>
                    </div>
                    <div class="col-md-4 mb-3">
                        <div class="text-white">
                            <div class="h2 fw-bold">89</div>
                            <p class="mb-0 text-white-50">Instructores</p>
                        </div>
                    </div>
                    <div class="col-md-4 mb-3">
                        <div class="text-white">
                            <div class="h2 fw-bold">3,521</div>
                            <p class="mb-0 text-white-50">Misiones Completadas</p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Footer -->
            <div class="text-center mt-5">
                <p class="text-white-50">
                    &copy; {{ date('Y') }} {{ $appName }} - Forjando el futuro de la educación
                </p>
            </div>
        </div>
    </div>
</div>
@endsection