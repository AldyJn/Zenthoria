@extends('layouts.app')

@section('content')
<div class="container">
    <!-- Header -->
    <div class="row mb-4">
        <div class="col">
            <h1 class="display-5 fw-bold">
                <i class="mdi mdi-view-dashboard text-primary me-3"></i>
                ¡Bienvenido, Profesor {{ auth()->user()->nombre }}!
            </h1>
            <p class="lead text-muted">Panel de control para instructores</p>
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
                    <i class="mdi mdi-account-group display-4 mb-3"></i>
                    <h3 class="card-title">{{ $estadisticas['total_estudiantes'] }}</h3>
                    <p class="card-text">Estudiantes</p>
                </div>
            </div>
        </div>

        <div class="col-lg-3 col-md-6 mb-4">
            <div class="card border-0 shadow-sm bg-warning text-white h-100">
                <div class="card-body text-center">
                    <i class="mdi mdi-clipboard-text display-4 mb-3"></i>
                    <h3 class="card-title">{{ $estadisticas['actividades_pendientes'] }}</h3>
                    <p class="card-text">Actividades</p>
                </div>
            </div>
        </div>

        <div class="col-lg-3 col-md-6 mb-4">
            <div class="card border-0 shadow-sm bg-info text-white h-100">
                <div class="card-body text-center">
                    <i class="mdi mdi-star display-4 mb-3"></i>
                    <h3 class="card-title">{{ $estadisticas['comportamientos_hoy'] }}</h3>
                    <p class="card-text">Comportamientos Hoy</p>
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
                            <a href="{{ route('clases.create') }}" class="btn btn-primary w-100 btn-lg">
                                <i class="mdi mdi-plus-circle me-2"></i>
                                Nueva Clase
                            </a>
                        </div>
                        <div class="col-md-3 mb-3">
                            <a href="{{ route('clases.index') }}" class="btn btn-success w-100 btn-lg">
                                <i class="mdi mdi-school me-2"></i>
                                Ver Mis Clases
                            </a>
                        </div>
                        <div class="col-md-3 mb-3">
                            <a href="{{ route('docentes.mis-estudiantes') }}" class="btn btn-info w-100 btn-lg">
                                <i class="mdi mdi-account-group me-2"></i>
                                Mis Estudiantes
                            </a>
                        </div>
                        <div class="col-md-3 mb-3">
                            <a href="{{ route('docentes.estadisticas') }}" class="btn btn-warning w-100 btn-lg">
                                <i class="mdi mdi-chart-line me-2"></i>
                                Estadísticas
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Mis Clases -->
    <div class="row">
        <div class="col">
            <div class="card border-0 shadow-sm">
                <div class="card-header bg-light d-flex justify-content-between align-items-center">
                    <h5 class="card-title mb-0">
                        <i class="mdi mdi-school text-primary me-2"></i>
                        Mis Clases
                    </h5>
                    <a href="{{ route('clases.create') }}" class="btn btn-primary">
                        <i class="mdi mdi-plus me-1"></i>
                        Nueva Clase
                    </a>
                </div>
                <div class="card-body">
                    @if($clases->count() > 0)
                        <div class="row">
                            @foreach($clases as $clase)
                                <div class="col-lg-4 col-md-6 mb-4">
                                    <div class="card border-0 shadow-sm h-100 game-card">
                                        <div class="card-body">
                                            <div class="d-flex justify-content-between align-items-start mb-3">
                                                <h6 class="card-title fw-bold">{{ $clase['nombre'] }}</h6>
                                                <span class="badge {{ $clase['activa'] ? 'bg-success' : 'bg-secondary' }}">
                                                    {{ $clase['activa'] ? 'Activa' : 'Inactiva' }}
                                                </span>
                                            </div>
                                            
                                            <p class="card-text text-muted small">{{ $clase['descripcion'] }}</p>
                                            
                                            <div class="row text-center mb-3">
                                                <div class="col-6">
                                                    <div class="border-end">
                                                        <div class="fw-bold text-primary">{{ $clase['estudiantes_count'] }}</div>
                                                        <small class="text-muted">Estudiantes</small>
                                                    </div>
                                                </div>
                                                <div class="col-6">
                                                    <div class="fw-bold text-info">{{ $clase['codigo_invitacion'] }}</div>
                                                    <small class="text-muted">Código</small>
                                                </div>
                                            </div>
                                            
                                            <div class="d-grid gap-2">
                                                <a href="{{ route('clases.show', $clase['id']) }}" class="btn btn-outline-primary btn-sm">
                                                    <i class="mdi mdi-eye me-1"></i>
                                                    Ver Detalles
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            @endforeach
                        </div>
                    @else
                        <div class="text-center py-5">
                            <i class="mdi mdi-school-outline display-1 text-muted mb-3"></i>
                            <h5 class="text-muted">No tienes clases creadas</h5>
                            <p class="text-muted">Crea tu primera clase para comenzar a gamificar el aprendizaje</p>
                            <a href="{{ route('clases.create') }}" class="btn btn-primary">
                                <i class="mdi mdi-plus me-2"></i>
                                Crear Mi Primera Clase
                            </a>
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

.badge {
    font-size: 0.75rem;
}
</style>
@endpush
@endsection