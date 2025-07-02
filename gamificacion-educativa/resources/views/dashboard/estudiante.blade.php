@extends('layouts.app')

@section('content')
<div class="container">
    <!-- Header -->
    <div class="row mb-4">
        <div class="col">
            <h1 class="display-5 fw-bold">
                <i class="mdi mdi-sword text-success me-3"></i>
                ¡Bienvenido, Guardián {{ auth()->user()->nombre }}!
            </h1>
            <p class="lead text-muted">Tu aventura educativa continúa</p>
        </div>
    </div>

    <!-- Estadísticas -->
    <div class="row mb-5">
        <div class="col-lg-3 col-md-6 mb-4">
            <div class="card border-0 shadow-sm bg-primary text-white h-100">
                <div class="card-body text-center">
                    <i class="mdi mdi-school display-4 mb-3"></i>
                    <h3 class="card-title">{{ $estadisticas['total_clases'] }}</h3>
                    <p class="card-text">Clases Activas</p>
                </div>
            </div>
        </div>

        <div class="col-lg-3 col-md-6 mb-4">
            <div class="card border-0 shadow-sm bg-success text-white h-100">
                <div class="card-body text-center">
                    <i class="mdi mdi-account-star display-4 mb-3"></i>
                    <h3 class="card-title">{{ $estadisticas['total_personajes'] }}</h3>
                    <p class="card-text">Personajes</p>
                </div>
            </div>
        </div>

        <div class="col-lg-3 col-md-6 mb-4">
            <div class="card border-0 shadow-sm bg-warning text-white h-100">
                <div class="card-body text-center">
                    <i class="mdi mdi-trending-up display-4 mb-3"></i>
                    <h3 class="card-title">{{ number_format($estadisticas['nivel_promedio'], 1) }}</h3>
                    <p class="card-text">Nivel Promedio</p>
                </div>
            </div>
        </div>

        <div class="col-lg-3 col-md-6 mb-4">
            <div class="card border-0 shadow-sm bg-info text-white h-100">
                <div class="card-body text-center">
                    <i class="mdi mdi-star display-4 mb-3"></i>
                    <h3 class="card-title">{{ number_format($estadisticas['experiencia_total']) }}</h3>
                    <p class="card-text">XP Total</p>
                </div>
            </div>
        </div>
    </div>

    <!-- Acciones rápidas -->
    <div class="row mb-5">
        <div class="col">
            <div class="card border-0 shadow-sm">
                <div class="card-header bg-light">
                    <h5 class="card-title mb-0">
                        <i class="mdi mdi-lightning-bolt text-warning me-2"></i>
                        Acciones Rápidas
                    </h5>
                </div>
                <div class="card-body">
                    <div class="row">
                        <div class="col-md-3 mb-3">
                            <a href="{{ route('clases.unirse') }}" class="btn btn-primary w-100 btn-lg">
                                <i class="mdi mdi-account-plus me-2"></i>
                                Unirse a Clase
                            </a>
                        </div>
                        <div class="col-md-3 mb-3">
                            <a href="{{ route('clases.index') }}" class="btn btn-success w-100 btn-lg">
                                <i class="mdi mdi-school me-2"></i>
                                Mis Clases
                            </a>
                        </div>
                        <div class="col-md-3 mb-3">
                            <a href="{{ route('estudiantes.mi-progreso') }}" class="btn btn-info w-100 btn-lg">
                                <i class="mdi mdi-chart-line me-2"></i>
                                Mi Progreso
                            </a>
                        </div>
                        <div class="col-md-3 mb-3">
                            <a href="{{ route('perfil.edit') }}" class="btn btn-warning w-100 btn-lg">
                                <i class="mdi mdi-account me-2"></i>
                                Mi Perfil
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <div class="row">
        <!-- Mis Clases -->
        <div class="col-lg-6 mb-4">
            <div class="card border-0 shadow-sm h-100">
                <div class="card-header bg-light d-flex justify-content-between align-items-center">
                    <h5 class="card-title mb-0">
                        <i class="mdi mdi-school text-primary me-2"></i>
                        Mis Clases
                    </h5>
                    <a href="{{ route('clases.unirse') }}" class="btn btn-sm btn-primary">
                        <i class="mdi mdi-plus me-1"></i>
                        Unirse
                    </a>
                </div>
                <div class="card-body">
                    @if($clases->count() > 0)
                        @foreach($clases as $clase)
                            <div class="d-flex align-items-center border-bottom py-3">
                                <div class="me-3">
                                    <div class="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center" style="width: 48px; height: 48px;">
                                        <i class="mdi mdi-school"></i>
                                    </div>
                                </div>
                                <div class="flex-grow-1">
                                    <h6 class="mb-1 fw-bold">{{ $clase['nombre'] }}</h6>
                                    <p class="mb-0 text-muted small">{{ $clase['descripcion'] }}</p>
                                    <small class="text-primary">Instructor: {{ $clase['docente'] }}</small>
                                </div>
                                <div>
                                    <a href="{{ route('clases.show', $clase['id']) }}" class="btn btn-sm btn-outline-primary">
                                        <i class="mdi mdi-eye"></i>
                                    </a>
                                </div>
                            </div>
                        @endforeach
                    @else
                        <div class="text-center py-4">
                            <i class="mdi mdi-school-outline display-4 text-muted mb-3"></i>
                            <h6 class="text-muted">No estás en ninguna clase</h6>
                            <p class="text-muted small">Únete a una clase para comenzar tu aventura</p>
                            <a href="{{ route('clases.unirse') }}" class="btn btn-primary btn-sm">
                                <i class="mdi mdi-plus me-1"></i>
                                Unirse a Clase
                            </a>
                        </div>
                    @endif
                </div>
            </div>
        </div>

        <!-- Mis Personajes -->
        <div class="col-lg-6 mb-4">
            <div class="card border-0 shadow-sm h-100">
                <div class="card-header bg-light">
                    <h5 class="card-title mb-0">
                        <i class="mdi mdi-account-star text-success me-2"></i>
                        Mis Personajes
                    </h5>
                </div>
                <div class="card-body">
                    @if($personajes->count() > 0)
                        @foreach($personajes as $personaje)
                            <div class="d-flex align-items-center border-bottom py-3">
                                <div class="me-3">
                                    <div class="bg-{{ $personaje['clase_rpg'] === 'guerrero' ? 'danger' : ($personaje['clase_rpg'] === 'mago' ? 'purple' : 'success') }} text-white rounded-circle d-flex align-items-center justify-content-center" style="width: 48px; height: 48px;">
                                        <i class="mdi mdi-{{ $personaje['clase_rpg'] === 'guerrero' ? 'sword' : ($personaje['clase_rpg'] === 'mago' ? 'auto-fix' : 'bow-arrow') }}"></i>
                                    </div>
                                </div>
                                <div class="flex-grow-1">
                                    <h6 class="mb-1 fw-bold">{{ $personaje['nombre'] }}</h6>
                                    <div class="d-flex align-items-center mb-2">
                                        <span class="badge bg-warning text-dark me-2">Nivel {{ $personaje['nivel'] }}</span>
                                        <span class="badge bg-info">{{ ucfirst($personaje['clase_rpg']) }}</span>
                                    </div>
                                    <div class="progress" style="height: 6px;">
                                        <div class="progress-bar bg-warning" style="width: {{ ($personaje['experiencia'] % 100) }}%"></div>
                                    </div>
                                    <small class="text-muted">{{ $personaje['experiencia'] }} XP • {{ $personaje['clase_nombre'] }}</small>
                                </div>
                            </div>
                        @endforeach
                    @else
                        <div class="text-center py-4">
                            <i class="mdi mdi-account-star-outline display-4 text-muted mb-3"></i>
                            <h6 class="text-muted">No tienes personajes</h6>
                            <p class="text-muted small">Crea tu primer personaje en una de tus clases</p>
                        </div>
                    @endif
                </div>
            </div>
        </div>
    </div>
</div>

@push('styles')
<style>
.game-card {
    transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
}

.game-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 25px rgba(0,0,0,0.15) !important;
}

.display-4 {
    font-size: 2.5rem;
}

.card {
    border-radius: 12px;
}

.btn-lg {
    padding: 12px 24px;
    font-size: 1rem;
}

.progress {
    background-color: #f8f9fa;
}

.bg-purple {
    background-color: #7B1FA2 !important;
}

.border-bottom:last-child {
    border-bottom: none !important;
}
</style>
@endpush
@endsection