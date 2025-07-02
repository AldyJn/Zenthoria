<!-- resources/js/Pages/Dashboard/Profesor.vue -->
<template>
  <Head title="Dashboard Profesor" />

  <AuthenticatedLayout>
    <template #header>
      <div class="flex justify-between items-center">
        <h2 class="font-semibold text-xl text-gray-800 leading-tight">
          Dashboard - Profesor
        </h2>
        <Link
          :href="route('clases.create')"
          class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded flex items-center gap-2"
        >
          <PlusCircleIcon class="h-5 w-5" />
          Crear Clase
        </Link>
      </div>
    </template>

    <div class="py-12">
      <div class="max-w-7xl mx-auto sm:px-6 lg:px-8">
        <!-- Estadísticas Generales -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div class="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
            <div class="flex items-center">
              <BookOpenIcon class="h-8 w-8 text-blue-500" />
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-500">Clases Activas</p>
                <p class="text-2xl font-semibold text-gray-900">{{ estadisticas.clases_activas }}</p>
              </div>
            </div>
          </div>

          <div class="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
            <div class="flex items-center">
              <UserGroupIcon class="h-8 w-8 text-green-500" />
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-500">Total Estudiantes</p>
                <p class="text-2xl font-semibold text-gray-900">{{ estadisticas.total_estudiantes }}</p>
              </div>
            </div>
          </div>

          <div class="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
            <div class="flex items-center">
              <ChartBarIcon class="h-8 w-8 text-purple-500" />
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-500">Actividades Este Mes</p>
                <p class="text-2xl font-semibold text-gray-900">{{ estadisticas.actividades_mes }}</p>
              </div>
            </div>
          </div>

          <div class="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
            <div class="flex items-center">
              <div class="h-8 w-8 bg-yellow-500 rounded-full flex items-center justify-center">
                <span class="text-white font-bold">⭐</span>
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-500">Promedio General</p>
                <p class="text-2xl font-semibold text-gray-900">
                  {{ estadisticas.promedio_general ? estadisticas.promedio_general.toFixed(1) : 'N/A' }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Lista de Clases -->
        <div class="bg-white overflow-hidden shadow-sm sm:rounded-lg">
          <div class="p-6 bg-white border-b border-gray-200">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Mis Clases</h3>
            
            <!-- Sin clases -->
            <div v-if="clases.data.length === 0" class="text-center py-8">
              <BookOpenIcon class="mx-auto h-12 w-12 text-gray-400" />
              <h3 class="mt-2 text-sm font-medium text-gray-900">No tienes clases</h3>
              <p class="mt-1 text-sm text-gray-500">
                Empieza creando tu primera clase.
              </p>
              <div class="mt-6">
                <Link
                  :href="route('clases.create')"
                  class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  <PlusCircleIcon class="-ml-1 mr-2 h-5 w-5" />
                  Crear Clase
                </Link>
              </div>
            </div>

            <!-- Grid de clases -->
            <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div
                v-for="clase in clases.data"
                :key="clase.id"
                class="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
              >
                <div class="flex justify-between items-start mb-4">
                  <h4 class="text-lg font-semibold text-gray-900">{{ clase.nombre }}</h4>
                  <span
                    :class="[
                      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                      clase.activo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    ]"
                  >
                    {{ clase.activo ? 'Activa' : 'Inactiva' }}
                  </span>
                </div>
                
                <p class="text-sm text-gray-600 mb-4">{{ clase.descripcion }}</p>
                
                <div class="space-y-2 text-sm text-gray-500 mb-4">
                  <p><strong>Grado:</strong> {{ clase.grado }} - {{ clase.seccion }}</p>
                  <p><strong>Estudiantes:</strong> {{ clase.estudiantes_count }}</p>
                  <p><strong>Código:</strong> 
                    <span class="font-mono bg-gray-100 px-2 py-1 rounded">{{ clase.codigo_invitacion }}</span>
                  </p>
                </div>
                
                <div class="flex justify-between">
                  <Link
                    :href="route('clases.show', clase.id)"
                    class="text-blue-600 hover:text-blue-900 font-medium"
                  >
                    Ver Clase
                  </Link>
                  <Link
                    :href="route('clases.edit', clase.id)"
                    class="text-gray-600 hover:text-gray-900"
                  >
                    Editar
                  </Link>
                </div>
              </div>
            </div>

            <!-- Paginación -->
            <div v-if="clases.data.length > 0 && (clases.prev_page_url || clases.next_page_url)" 
                 class="mt-6 flex justify-between items-center">
              <Link
                v-if="clases.prev_page_url"
                :href="clases.prev_page_url"
                class="px-4 py-2 text-sm text-gray-600 hover:text-gray-900"
              >
                ← Anterior
              </Link>
              <span class="text-sm text-gray-500">
                Página {{ clases.current_page }} de {{ clases.last_page }}
              </span>
              <Link
                v-if="clases.next_page_url"
                :href="clases.next_page_url"
                class="px-4 py-2 text-sm text-gray-600 hover:text-gray-900"
              >
                Siguiente →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  </AuthenticatedLayout>
</template>

<script setup>
import { Head, Link } from '@inertiajs/vue3'
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.vue'
import { 
  BookOpenIcon, 
  UserGroupIcon, 
  ChartBarIcon, 
  PlusCircleIcon 
} from '@heroicons/vue/24/outline'

defineProps({
  clases: Object,
  estadisticas: Object,
})
</script>