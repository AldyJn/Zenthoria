<!-- resources/js/Pages/Actividades/Index.vue -->
<template>
  <Head title="Actividades" />

  <AuthenticatedLayout>
    <template #header>
      <div class="flex justify-between items-center">
        <div>
          <h2 class="font-semibold text-xl text-gray-800 leading-tight">
            Actividades - {{ clase.nombre }}
          </h2>
          <p class="text-sm text-gray-600">{{ clase.grado }} - {{ clase.seccion }}</p>
        </div>
        
        <div class="flex items-center space-x-4">
          <Link
            :href="route('clases.show', clase.id)"
            class="text-gray-600 hover:text-gray-900"
          >
            ← Volver a la clase
          </Link>
          
          <Link
            v-if="puede_crear"
            :href="route('actividades.create', clase.id)"
            class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded flex items-center gap-2"
          >
            <PlusIcon class="h-5 w-5" />
            Nueva Actividad
          </Link>
        </div>
      </div>
    </template>

    <div class="py-12">
      <div class="max-w-7xl mx-auto sm:px-6 lg:px-8">
        
        <!-- Filtros -->
        <div class="bg-white rounded-lg shadow-sm mb-6 p-4">
          <div class="flex flex-wrap items-center justify-between gap-4">
            <div class="flex items-center space-x-4">
              <!-- Filtro por tipo -->
              <div>
                <select
                  v-model="filtros.tipo"
                  @change="aplicarFiltros"
                  class="border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-md shadow-sm text-sm"
                >
                  <option value="">Todos los tipos</option>
                  <option value="Tarea">Tareas</option>
                  <option value="Proyecto">Proyectos</option>
                  <option value="Quiz">Quizzes</option>
                  <option value="Examen">Exámenes</option>
                </select>
              </div>
              
              <!-- Filtro por estado -->
              <div v-if="$page.props.auth.user.tipo_usuario === 'estudiante'">
                <select
                  v-model="filtros.estado"
                  @change="aplicarFiltros"
                  class="border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-md shadow-sm text-sm"
                >
                  <option value="">Todos los estados</option>
                  <option value="pendiente">Pendientes</option>
                  <option value="entregado">Entregadas</option>
                  <option value="calificado">Calificadas</option>
                  <option value="vencido">Vencidas</option>
                </select>
              </div>
            </div>
            
            <!-- Buscador -->
            <div class="flex-1 max-w-md">
              <input
                v-model="filtros.busqueda"
                @input="buscar"
                type="text"
                placeholder="Buscar actividades..."
                class="w-full border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-md shadow-sm text-sm"
              />
            </div>
          </div>
        </div>

        <!-- Lista de actividades -->
        <div v-if="actividades.data.length === 0" class="bg-white rounded-lg shadow-sm p-8 text-center">
          <DocumentIcon class="mx-auto h-16 w-16 text-gray-400 mb-4" />
          <h3 class="text-xl font-semibold text-gray-900 mb-2">No hay actividades</h3>
          <p class="text-gray-600 mb-6">
            {{ puede_crear 
              ? 'Crea la primera actividad para esta clase.' 
              : 'El profesor aún no ha creado actividades para esta clase.'
            }}
          </p>
          <Link
            v-if="puede_crear"
            :href="route('actividades.create', clase.id)"
            class="inline-flex items-center px-4 py-2 bg-blue-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-blue-700"
          >
            <PlusIcon class="h-4 w-4 mr-2" />
            Crear primera actividad
          </Link>
        </div>

        <div v-else class="space-y-4">
          <div
            v-for="actividad in actividades.data"
            :key="actividad.id"
            class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
          >
            <div class="p-6">
              <div class="flex items-start justify-between">
                <div class="flex-1">
                  <!-- Encabezado -->
                  <div class="flex items-center space-x-3 mb-3">
                    <span :class="[
                      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                      obtenerColorTipo(actividad.tipo_actividad.nombre)
                    ]">
                      {{ actividad.tipo_actividad.nombre }}
                    </span>
                    
                    <span v-if="actividad.mision" class="text-xs text-purple-600 bg-purple-100 px-2 py-1 rounded-full">
                      🎯 {{ actividad.mision.titulo }}
                    </span>
                    
                    <span v-if="$page.props.auth.user.tipo_usuario === 'estudiante'" :class="[
                      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                      obtenerColorEstado(actividad.estado_entrega)
                    ]">
                      {{ obtenerTextoEstado(actividad.estado_entrega) }}
                    </span>
                  </div>
                  
                  <!-- Título y descripción -->
                  <h3 class="text-lg font-semibold text-gray-900 mb-2">{{ actividad.titulo }}</h3>
                  <p class="text-gray-600 mb-4">{{ actividad.descripcion }}</p>
                  
                  <!-- Información adicional -->
                  <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-500">
                    <div>
                      <span class="font-medium">Fecha entrega:</span>
                      <p :class="{ 'text-red-600': esVencida(actividad.fecha_entrega) }">
                        {{ formatearFecha(actividad.fecha_entrega) }}
                      </p>
                    </div>
                    
                    <div>
                      <span class="font-medium">Puntos XP:</span>
                      <p class="text-blue-600">{{ actividad.puntos_experiencia }}</p>
                    </div>
                    
                    <div>
                      <span class="font-medium">Monedas:</span>
                      <p class="text-yellow-600">{{ actividad.puntos_moneda }}</p>
                    </div>
                    
                    <div v-if="$page.props.auth.user.tipo_usuario === 'docente'">
                      <span class="font-medium">Entregas:</span>
                      <p>{{ actividad.entregas_count }} estudiantes</p>
                    </div>
                    
                    <div v-if="$page.props.auth.user.tipo_usuario === 'estudiante' && actividad.mi_entrega?.nota">
                      <span class="font-medium">Mi nota:</span>
                      <p :class="obtenerColorNota(actividad.mi_entrega.nota)">
                        {{ actividad.mi_entrega.nota }}/100
                      </p>
                    </div>
                  </div>
                </div>
                
                <!-- Acciones -->
                <div class="flex flex-col space-y-2 ml-4">
                  <Link
                    :href="route('actividades.show', actividad.id)"
                    class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded text-center text-sm"
                  >
                    Ver Detalles
                  </Link>
                  
                  <!-- Acciones para docente -->
                  <template v-if="$page.props.auth.user.tipo_usuario === 'docente'">
                    <Link
                      :href="route('actividades.edit', actividad.id)"
                      class="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded text-center text-sm"
                    >
                      Editar
                    </Link>
                    
                    <Link
                      :href="route('actividades.entregas', actividad.id)"
                      class="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded text-center text-sm"
                    >
                      Entregas ({{ actividad.entregas_count }})
                    </Link>
                  </template>
                  
                  <!-- Acciones para estudiante -->
                  <template v-if="$page.props.auth.user.tipo_usuario === 'estudiante'">
                    <Link
                      v-if="!actividad.mi_entrega && !esVencida(actividad.fecha_entrega)"
                      :href="route('entregas.create', actividad.id)"
                      class="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded text-center text-sm"
                    >
                      Entregar
                    </Link>
                    
                    <Link
                      v-else-if="actividad.mi_entrega && !actividad.mi_entrega.nota"
                      :href="route('entregas.show', actividad.mi_entrega.id)"
                      class="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded text-center text-sm"
                    >
                      Mi Entrega
                    </Link>
                  </template>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Paginación -->
        <div v-if="actividades.data.length > 0 && (actividades.prev_page_url || actividades.next_page_url)" 
             class="mt-6 flex justify-between items-center">
          <Link
            v-if="actividades.prev_page_url"
            :href="actividades.prev_page_url"
            class="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            ← Anterior
          </Link>
          <span class="text-sm text-gray-500">
            Página {{ actividades.current_page }} de {{ actividades.last_page }}
          </span>
          <Link
            v-if="actividades.next_page_url"
            :href="actividades.next_page_url"
            class="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Siguiente →
          </Link>
        </div>
      </div>
    </div>
  </AuthenticatedLayout>
</template>

<script setup>
import { Head, Link } from '@inertiajs/vue3'
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.vue'
import { PlusIcon, DocumentIcon } from '@heroicons/vue/24/outline'
import { ref, reactive } from 'vue'

defineProps({
  clase: Object,
  actividades: Object,
  puede_crear: Boolean,
})

const filtros = reactive({
  tipo: '',
  estado: '',
  busqueda: '',
})

const aplicarFiltros = () => {
  // Lógica para aplicar filtros via Inertia
  const params = {}
  if (filtros.tipo) params.tipo = filtros.tipo
  if (filtros.estado) params.estado = filtros.estado
  if (filtros.busqueda) params.busqueda = filtros.busqueda
  
  router.get(route('actividades.index', clase.id), params, {
    preserveState: true,
    preserveScroll: true,
  })
}

const buscar = () => {
  // Debounce para la búsqueda
  clearTimeout(window.searchTimeout)
  window.searchTimeout = setTimeout(() => {
    aplicarFiltros()
  }, 300)
}

const obtenerColorTipo = (tipo) => {
  const colores = {
    'Tarea': 'bg-blue-100 text-blue-800',
    'Proyecto': 'bg-purple-100 text-purple-800',
    'Quiz': 'bg-green-100 text-green-800',
    'Examen': 'bg-red-100 text-red-800',
    'Participación': 'bg-yellow-100 text-yellow-800',
  }
  return colores[tipo] || 'bg-gray-100 text-gray-800'
}

const obtenerColorEstado = (estado) => {
  const colores = {
    'pendiente': 'bg-orange-100 text-orange-800',
    'entregado': 'bg-blue-100 text-blue-800',
    'calificado': 'bg-green-100 text-green-800',
    'vencido': 'bg-red-100 text-red-800',
  }
  return colores[estado] || 'bg-gray-100 text-gray-800'
}

const obtenerTextoEstado = (estado) => {
  const textos = {
    'pendiente': 'Pendiente',
    'entregado': 'Entregado',
    'calificado': 'Calificado',
    'vencido': 'Vencido',
  }
  return textos[estado] || 'Sin estado'
}

const obtenerColorNota = (nota) => {
  if (nota >= 90) return 'text-green-600 font-semibold'
  if (nota >= 80) return 'text-blue-600 font-semibold'
  if (nota >= 70) return 'text-yellow-600 font-semibold'
  return 'text-red-600 font-semibold'
}

const esVencida = (fechaEntrega) => {
  return new Date(fechaEntrega) < new Date()
}

const formatearFecha = (fecha) => {
  return new Date(fecha).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>