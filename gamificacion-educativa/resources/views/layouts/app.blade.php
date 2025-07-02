<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="{{ csrf_token() }}">

    <title>{{ $title ?? config('app.name', 'EduApp Gamificada') }}</title>

    <!-- Fonts -->
    <link rel="preconnect" href="https://fonts.bunny.net">
    <link href="https://fonts.bunny.net/css?family=roboto:400,500,600&display=swap" rel="stylesheet" />
    
    <!-- Bootstrap CSS -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    
    <!-- Material Design Icons -->
    <link href="https://cdn.jsdelivr.net/npm/@mdi/font@latest/css/materialdesignicons.min.css" rel="stylesheet">
    
    <!-- Custom CSS -->
    @vite(['resources/css/app.css'])
    
    @stack('styles')
</head>
<body class="bg-light">
    <!-- Navigation -->
    @auth
        <nav class="navbar navbar-expand-lg navbar-dark bg-primary">
            <div class="container">
                <a class="navbar-brand fw-bold" href="{{ route('dashboard') }}">
                    <i class="mdi mdi-gamepad-variant me-2"></i>
                    EduApp Gamificada
                </a>
                
                <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                    <span class="navbar-toggler-icon"></span>
                </button>
                
                <div class="collapse navbar-collapse" id="navbarNav">
                    <ul class="navbar-nav me-auto">
                        <li class="nav-item">
                            <a class="nav-link" href="{{ route('dashboard') }}">
                                <i class="mdi mdi-view-dashboard me-1"></i>
                                Dashboard
                            </a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" href="{{ route('clases.index') }}">
                                <i class="mdi mdi-school me-1"></i>
                                Clases
                            </a>
                        </li>
                        @if(auth()->user()->esDocente())
                            <li class="nav-item">
                                <a class="nav-link" href="{{ route('clases.create') }}">
                                    <i class="mdi mdi-plus me-1"></i>
                                    Nueva Clase
                                </a>
                            </li>
                        @endif
                        @if(auth()->user()->esEstudiante())
                            <li class="nav-item">
                                <a class="nav-link" href="{{ route('clases.unirse') }}">
                                    <i class="mdi mdi-account-plus me-1"></i>
                                    Unirse a Clase
                                </a>
                            </li>
                        @endif
                    </ul>
                    
                    <ul class="navbar-nav">
                        <li class="nav-item dropdown">
                            <a class="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown">
                                <i class="mdi mdi-account-circle me-1"></i>
                                {{ auth()->user()->nombre }}
                            </a>
                            <ul class="dropdown-menu">
                                <li><a class="dropdown-item" href="{{ route('perfil.edit') }}">
                                    <i class="mdi mdi-account me-2"></i>Perfil
                                </a></li>
                                <li><a class="dropdown-item" href="{{ route('notificaciones.index') }}">
                                    <i class="mdi mdi-bell me-2"></i>Notificaciones
                                </a></li>
                                <li><hr class="dropdown-divider"></li>
                                <li>
                                    <form method="POST" action="{{ route('logout') }}" class="d-inline">
                                        @csrf
                                        <button type="submit" class="dropdown-item">
                                            <i class="mdi mdi-logout me-2"></i>Cerrar Sesión
                                        </button>
                                    </form>
                                </li>
                            </ul>
                        </li>
                    </ul>
                </div>
            </div>
        </nav>
    @endauth

    <!-- Flash Messages -->
    @if(session('success'))
        <div class="alert alert-success alert-dismissible fade show m-3" role="alert">
            <i class="mdi mdi-check-circle me-2"></i>
            {{ session('success') }}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>
    @endif

    @if(session('error'))
        <div class="alert alert-danger alert-dismissible fade show m-3" role="alert">
            <i class="mdi mdi-alert-circle me-2"></i>
            {{ session('error') }}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>
    @endif

    @if(session('warning'))
        <div class="alert alert-warning alert-dismissible fade show m-3" role="alert">
            <i class="mdi mdi-alert me-2"></i>
            {{ session('warning') }}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>
    @endif

    <!-- Main Content -->
    <main class="py-4">
        @yield('content')
    </main>

    <!-- Footer -->
    <footer class="bg-dark text-light py-4 mt-5">
        <div class="container">
            <div class="row">
                <div class="col-md-6">
                    <h5><i class="mdi mdi-gamepad-variant me-2"></i>EduApp Gamificada</h5>
                    <p class="mb-0">Transformando la educación a través de la gamificación</p>
                </div>
                <div class="col-md-6 text-md-end">
                    <p class="mb-0">&copy; {{ date('Y') }} EduApp Gamificada. Todos los derechos reservados.</p>
                </div>
            </div>
        </div>
    </footer>

    <!-- Bootstrap JS -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    
    <!-- Custom JS -->
    @vite(['resources/js/app.js'])
    
    @stack('scripts')
</body>
</html>