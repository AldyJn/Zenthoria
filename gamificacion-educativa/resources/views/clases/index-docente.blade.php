@extends('layouts.app')

@section('title', 'Mis Clases')

@section('content')
<div class="container mx-auto px-4 py-6">
    <!-- Header -->
    <div class="flex justify-between items-center mb-6">
        <div>
            <h1 class="text-3xl font-bold text-gray-900">Mis Clases</h1>
            <p class="text-gray-600 mt-1">Gestiona tus clases y estudiantes</p>
        </div>
        <a href="{{ route('clases.create') }}" 
           class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
            </svg>
            Crear Nueva Clase
        </a>
    </div>

    <!-- Estadísticas rápidas -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div class="bg-white rounded-lg shadow-md p-6">
            <div class="flex items-center justify-between">
                <div>
                    <p class="text-gray-600 text-sm">Total de Clases</p>
                    <p class="text-3xl font-bold text-blue-600">{{ $clases->count() }}</p>
                </div>
                <div class="bg-blue-100 p-3 rounded-full">
                    <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                    </svg>
                </div>
            </div>
        </div>

        <div class="bg-white rounded-lg shadow-md p-6">
            <div class="flex items-center justify-between">
                <div>
                    <p class="text-gray-600 text-sm">Total Estudiantes</p>
                    <p class="text-3xl font-bold text-green-600">{{ $clases->sum('estudiantes_count') }}</p>
                </div>
                <div class="bg-green-100 p-3 rounded-full">
                    <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5 0a5.986 5.986 0 00-6.5-5.5"/>
                    </svg>
                </div>
            </div>
        </div>

        <div class="bg-white rounded-lg shadow-md p-6">
            <div class="flex items-center justify-between">
                <div>
                    <p class="text-gray-600 text-sm">Clases Activas</p>
                    <p class="text-3xl font-bold text-purple-600">{{ $clases->where('activo', true)->count() }}</p>
                </div>
                <div class="bg-purple-100 p-3 rounded-full">
                    <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                </div>
            </div>
        </div>
    </div>

    <!-- Lista de clases -->
    @if($clases->isEmpty())
        <div class="bg-white rounded-lg shadow-md p-12 text-center">
            <svg class="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
            </svg>
            <h3 class="text-xl font-semibold text-gray-900 mb-2">No tienes clases creadas</h3>
            <p class="text-gray-600 mb-6">Comienza creando tu primera clase para empezar a gestionar estudiantes</p>
            <a href="{{ route('clases.create') }}" 
               class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg inline-flex items-center gap-2 transition-colors">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
                </svg>
                Crear Primera Clase
            </a>
        </div>
    @else
        <div class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            @foreach($clases as $clase)
                <div class="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
                    <div class="p-6">
                        <!-- Header de la tarjeta -->
                        <div class="flex justify-between items-start mb-4">
                            <div class="flex-1">
                                <h3 class="text-xl font-semibold text-gray-900 mb-1">{{ $clase->nombre }}</h3>
                                <p class="text-gray-600 text-sm">{{ $clase->grado }} - {{ $clase->seccion }}</p>
                            </div>
                            <div class="flex items-center gap-2">
                                @if($clase->activo)
                                    <span class="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">Activa</span>
                                @else
                                    <span class="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">Inactiva</span>
                                @endif
                            </div>
                        </div>

                        <!-- Descripción -->
                        @if($clase->descripcion)
                            <p class="text-gray-600 text-sm mb-4 line-clamp-2">{{ $clase->descripcion }}</p>
                        @endif

                        <!-- Estadísticas de la clase -->
                        <div class="grid grid-cols-2 gap-4 mb-4">
                            <div class="text-center">
                                <p class="text-2xl font-bold text-blue-600">{{ $clase->estudiantes_count }}</p>
                                <p class="text-gray-600 text-xs">Estudiantes</p>
                            </div>
                            <div class="text-center">
                                <p class="text-2xl font-bold text-purple-600">{{ $clase->inscripciones_count }}</p>
                                <p class="text-gray-600 text-xs">Inscripciones</p>
                            </div>
                        </div>

                        <!-- Código de invitación -->
                        <div class="bg-gray-50 rounded-lg p-3 mb-4">
                            <p class="text-xs text-gray-600 mb-1">Código de Invitación</p>
                            <div class="flex items-center justify-between">
                                <code class="text-lg font-mono font-bold text-gray-900">{{ $clase->codigo_invitacion }}</code>
                                <button onclick="copiarCodigo('{{ $clase->codigo_invitacion }}')" 
                                        class="text-blue-600 hover:text-blue-700 text-sm">
                                    Copiar
                                </button>
                            </div>
                        </div>

                        <!-- Fechas -->
                        <div class="text-xs text-gray-600 mb-4">
                            <p>Inicio: {{ \Carbon\Carbon::parse($clase->fecha_inicio)->format('d/m/Y') }}</p>
                            <p>Fin: {{ \Carbon\Carbon::parse($clase->fecha_fin)->format('d/m/Y') }}</p>
                        </div>

                        <!-- Acciones -->
                        <div class="flex gap-2">
                            <a href="{{ route('clases.show', $clase) }}" 
                               class="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-center py-2 px-4 rounded-lg text-sm transition-colors">
                                Ver Clase
                            </a>
                            <a href="{{ route('clases.edit', $clase) }}" 
                               class="bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 px-4 rounded-lg text-sm transition-colors">
                                Editar
                            </a>
                        </div>
                    </div>
                </div>
            @endforeach
        </div>
    @endif
</div>

<script>
function copiarCodigo(codigo) {
    navigator.clipboard.writeText(codigo).then(function() {
        // Mostrar mensaje de éxito (puedes usar toast notification)
        alert('Código copiado: ' + codigo);
    }).catch(function(err) {
        console.error('Error al copiar: ', err);
    });
}
</script>
@endsection