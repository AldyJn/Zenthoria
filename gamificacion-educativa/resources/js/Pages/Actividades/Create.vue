<!-- resources/js/Pages/Actividades/Create.vue -->
<template>
  <Head title="Crear Actividad" />

  <AuthenticatedLayout>
    <template #header>
      <div class="flex items-center space-x-4">
        <Link
          :href="route('actividades.index', clase.id)"
          class="text-gray-600 hover:text-gray-900"
        >
          ← Volver a actividades
        </Link>
        <h2 class="font-semibold text-xl text-gray-800 leading-tight">
          Crear Nueva Actividad - {{ clase.nombre }}
        </h2>
      </div>
    </template>

    <div class="py-12">
      <div class="max-w-4xl mx-auto sm:px-6 lg:px-8">
        <div class="bg-white overflow-hidden shadow-sm sm:rounded-lg">
          <div class="p-6 bg-white">
            <form @submit.prevent="submit" class="space-y-8">
              
              <!-- Información básica -->
              <div class="border-b border-gray-200 pb-6">
                <h3 class="text-lg font-medium text-gray-900 mb-4">Información Básica</h3>
                
                <div class="space-y-4">
                  <!-- Título -->
                  <div>
                    <label for="titulo" class="block text-sm font-medium text-gray-700">
                      Título de la actividad *
                    </label>
                    <input
                      id="titulo"
                      v-model="form.titulo"
                      type="text"
                      class="mt-1 block w-full border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-md shadow-sm"
                      placeholder="Ej: Ejercicios de Ecuaciones Lineales"
                      required
                    />
                    <div v-if="form.errors.titulo" class="mt-2 text-sm text-red-600">
                      {{ form.errors.titulo }}
                    </div>
                  </div>

                  <!-- Descripción -->
                  <div>
                    <label for="descripcion" class="block text-sm font-medium text-gray-700">
                      Descripción *
                    </label>
                    <textarea
                      id="descripcion"
                      v-model="form.descripcion"
                      rows="4"
                      class="mt-1 block w-full border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-md shadow-sm"
                      placeholder="Describe claramente qué deben hacer los estudiantes..."
                      required
                    />
                    <div v-if="form.errors.descripcion" class="mt-2 text-sm text-red-600">
                      {{ form.errors.descripcion }}
                    </div>
                  </div>

                  <!-- Tipo de actividad -->
                  <div>
                    <label for="id_tipo_actividad" class="block text-sm font-medium text-gray-700">
                      Tipo de actividad *
                    </label>
                    <select
                      id="id_tipo_actividad"
                      v-model="form.id_tipo_actividad"
                      class="mt-1 block w-full border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-md shadow-sm"
                      required
                    >
                      <option value="">Seleccionar tipo</option>
                      <option 
                        v-for="tipo in tipos_actividad" 
                        :key="tipo.id" 
                        :value="tipo.id"
                      >
                        {{ tipo.nombre }} - {{ tipo.descripcion }}
                      </option>
                    </select>
                    <div v-if="form.errors.id_tipo_actividad" class="mt-2 text-sm text-red-600">
                      {{ form.errors.id_tipo_actividad }}
                    </div>
                  </div>
                </div>
              </div>

              <!-- Fechas y tiempo -->
              <div class="border-b border-gray-200 pb-6">
                <h3 class="text-lg font-medium text-gray-900 mb-4">Fechas y Tiempo</h3>
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <!-- Fecha de entrega -->
                  <div>
                    <label for="fecha_entrega" class="block text-sm font-medium text-gray-700">
                      Fecha y hora de entrega *
                    </label>
                    <input
                      id="fecha_entrega"
                      v-model="form.fecha_entrega"
                      type="datetime-local"
                      class="mt-1 block w-full border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-md shadow-sm"
                      :min="fechaMinima"
                      required
                    />
                    <div v-if="form.errors.fecha_entrega" class="mt-2 text-sm text-red-600">
                      {{ form.errors.fecha_entrega }}
                    </div>
                    <p class="mt-1 text-xs text-gray-500">
                      Los estudiantes podrán entregar hasta esta fecha
                    </p>
                  </div>

                  <!-- Permite entrega tardía -->
                  <div class="flex items-center space-x-3">
                    <input
                      id="permite_entrega_tardia"
                      v-model="form.permite_entrega_tardia"
                      type="checkbox"
                      class="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                    />
                    <label for="permite_entrega_tardia" class="text-sm text-gray-700">
                      Permitir entrega tardía (con penalización)
                    </label>
                  </div>
                </div>
              </div>

              <!-- Gamificación -->
              <div class="border-b border-gray-200 pb-6">
                <h3 class="text-lg font-medium text-gray-900 mb-4">Recompensas</h3>
                
                <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <!-- Puntos de experiencia -->
                  <div>
                    <label for="puntos_experiencia" class="block text-sm font-medium text-gray-700">
                      Puntos de experiencia (XP) *
                    </label>
                    <input
                      id="puntos_experiencia"
                      v-model="form.puntos_experiencia"
                      type="number"
                      min="1"
                      max="500"
                      class="mt-1 block w-full border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-md shadow-sm"
                      required
                    />
                    <div v-if="form.errors.puntos_experiencia" class="mt-2 text-sm text-red-600">
                      {{ form.errors.puntos_experiencia }}
                    </div>
                    <p class="mt-1 text-xs text-gray-500">XP que ganarán los estudiantes</p>
                  </div>

                  <!-- Puntos de moneda -->
                  <div>
                    <label for="puntos_moneda" class="block text-sm font-medium text-gray-700">
                      Monedas *
                    </label>
                    <input
                      id="puntos_moneda"
                      v-model="form.puntos_moneda"
                      type="number"
                      min="1"
                      max="100"
                      class="mt-1 block w-full border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-md shadow-sm"
                      required
                    />
                    <div v-if="form.errors.puntos_moneda" class="mt-2 text-sm text-red-600">
                      {{ form.errors.puntos_moneda }}
                    </div>
                    <p class="mt-1 text-xs text-gray-500">Monedas para la tienda</p>
                  </div>

                  <!-- Dificultad -->
                  <div>
                    <label for="dificultad" class="block text-sm font-medium text-gray-700">
                      Nivel de dificultad
                    </label>
                    <select
                      id="dificultad"
                      v-model="form.dificultad"
                      class="mt-1 block w-full border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-md shadow-sm"
                    >
                      <option value="Fácil">⭐ Fácil</option>
                      <option value="Medio">⭐⭐ Medio</option>
                      <option value="Difícil">⭐⭐⭐ Difícil</option>
                      <option value="Muy Difícil">⭐⭐⭐⭐ Muy Difícil</option>
                    </select>
                    <p class="mt-1 text-xs text-gray-500">Ayuda a los estudiantes a prepararse</p>
                  </div>
                </div>
              </div>

              <!-- Misión asociada -->
              <div v-if="misiones.length > 0" class="border-b border-gray-200 pb-6">
                <h3 class="text-lg font-medium text-gray-900 mb-4">Misión (Opcional)</h3>
                
                <div>
                  <label for="id_mision" class="block text-sm font-medium text-gray-700">
                    Asociar a una misión
                  </label>
                  <select
                    id="id_mision"
                    v-model="form.id_mision"
                    class="mt-1 block w-full border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-md shadow-sm"
                  >
                    <option value="">Sin misión</option>
                    <option 
                      v-for="mision in misiones" 
                      :key="mision.id" 
                      :value="mision.id"
                    >
                      🎯 {{ mision.titulo }} ({{ mision.puntos_experiencia_bonus }} XP bonus)
                    </option>
                  </select>
                  <div v-if="form.errors.id_mision" class="mt-2 text-sm text-red-600">
                    {{ form.errors.id_mision }}
                  </div>
                  <p class="mt-1 text-xs text-gray-500">
                    Los estudiantes ganarán puntos extra si completan todas las actividades de la misión
                  </p>
                </div>
              </div>

              <!-- Configuración adicional -->
              <div class="border-b border-gray-200 pb-6">
                <h3 class="text-lg font-medium text-gray-900 mb-4">Configuración Adicional</h3>
                
                <div class="space-y-4">
                  <!-- Archivos permitidos -->
                  <div>
                    <label for="archivos_permitidos" class="block text-sm font-medium text-gray-700">
                      Tipos de archivo permitidos para entrega
                    </label>
                    <div class="mt-2 space-y-2">
                      <label class="inline-flex items-center mr-6">
                        <input
                          v-model="form.archivos_permitidos"
                          type="checkbox"
                          value="pdf"
                          class="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                        />
                        <span class="ml-2 text-sm text-gray-600">PDF</span>
                      </label>
                      <label class="inline-flex items-center mr-6">
                        <input
                          v-model="form.archivos_permitidos"
                          type="checkbox"
                          value="docx"
                          class="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                        />
                        <span class="ml-2 text-sm text-gray-600">Word (.docx)</span>
                      </label>
                      <label class="inline-flex items-center mr-6">
                        <input
                          v-model="form.archivos_permitidos"
                          type="checkbox"
                          value="jpg,png"
                          class="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                        />
                        <span class="ml-2 text-sm text-gray-600">Imágenes (JPG, PNG)</span>
                      </label>
                    </div>
                  </div>

                  <!-- Intentos permitidos -->
                  <div>
                    <label for="intentos_permitidos" class="block text-sm font-medium text-gray-700">
                      Número de intentos permitidos
                    </label>
                    <select
                      id="intentos_permitidos"
                      v-model="form.intentos_permitidos"
                      class="mt-1 block w-48 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-md shadow-sm"
                    >
                      <option value="1">1 intento (sin reentrega)</option>
                      <option value="2">2 intentos</option>
                      <option value="3">3 intentos</option>
                      <option value="-1">Intentos ilimitados</option>
                    </select>
                    <p class="mt-1 text-xs text-gray-500">
                      Número de veces que un estudiante puede entregar la actividad
                    </p>
                  </div>

                  <!-- Visible para estudiantes -->
                  <div class="flex items-center space-x-3">
                    <input
                      id="visible_estudiantes"
                      v-model="form.visible_estudiantes"
                      type="checkbox"
                      class="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                    />
                    <label for="visible_estudiantes" class="text-sm text-gray-700">
                      Visible para estudiantes inmediatamente
                    </label>
                    <p class="text-xs text-gray-500">
                      (Si no, permanecerá como borrador hasta que la actives)
                    </p>
                  </div>
                </div>
              </div>

              <!-- Instrucciones adicionales -->
              <div>
                <h3 class="text-lg font-medium text-gray-900 mb-4">Instrucciones Adicionales</h3>
                
                <div>
                  <label for="instrucciones_adicionales" class="block text-sm font-medium text-gray-700">
                    Instrucciones detalladas (opcional)
                  </label>
                  <textarea
                    id="instrucciones_adicionales"
                    v-model="form.instrucciones_adicionales"
                    rows="6"
                    class="mt-1 block w-full border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-md shadow-sm"
                    placeholder="Incluye aquí cualquier información adicional que los estudiantes necesiten para completar la actividad..."
                  />
                  <div v-if="form.errors.instrucciones_adicionales" class="mt-2 text-sm text-red-600">
                    {{ form.errors.instrucciones_adicionales }}
                  </div>
                  <p class="mt-1 text-xs text-gray-500">
                    Puedes incluir enlaces, recursos adicionales, criterios de evaluación, etc.
                  </p>
                </div>
              </div>

              <!-- Botones -->
              <div class="flex items-center justify-end space-x-4 pt-6 border-t">
                <Link
                  :href="route('actividades.index', clase.id)"
                  class="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancelar
                </Link>
                
                <button
                  type="button"
                  @click="guardarBorrador"
                  :disabled="form.processing"
                  class="py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  Guardar como Borrador
                </button>
                
                <button
                  type="submit"
                  :disabled="form.processing"
                  class="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  <span v-if="form.processing">Creando...</span>
                  <span v-else>Crear y Publicar Actividad</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </AuthenticatedLayout>
</template>

<script setup>
import { Head, Link, useForm } from '@inertiajs/vue3'
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.vue'
import { computed } from 'vue'

defineProps({
  clase: Object,
  tipos_actividad: Array,
  misiones: Array,
})

const form = useForm({
  titulo: '',
  descripcion: '',
  id_tipo_actividad: '',
  fecha_entrega: '',
  permite_entrega_tardia: false,
  puntos_experiencia: 25,
  puntos_moneda: 10,
  dificultad: 'Medio',
  id_mision: '',
  archivos_permitidos: ['pdf'],
  intentos_permitidos: '1',
  visible_estudiantes: true,
  instrucciones_adicionales: '',
})

const fechaMinima = computed(() => {
  const ahora = new Date()
  ahora.setMinutes(ahora.getMinutes() - ahora.getTimezoneOffset())
  return ahora.toISOString().slice(0, 16)
})

const submit = () => {
  form.visible_estudiantes = true
  form.post(route('actividades.store', clase.id))
}

const guardarBorrador = () => {
  form.visible_estudiantes = false
  form.post(route('actividades.store', clase.id))
}
</script>