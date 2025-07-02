<!-- resources/js/Pages/Clases/Create.vue -->
<template>
  <Head title="Crear Clase" />

  <AuthenticatedLayout>
    <template #header>
      <h2 class="font-semibold text-xl text-gray-800 leading-tight">
        Crear Nueva Clase
      </h2>
    </template>

    <div class="py-12">
      <div class="max-w-2xl mx-auto sm:px-6 lg:px-8">
        <div class="bg-white overflow-hidden shadow-sm sm:rounded-lg">
          <div class="p-6 bg-white border-b border-gray-200">
            <form @submit.prevent="submit" class="space-y-6">
              <!-- Nombre de la clase -->
              <div>
                <label for="nombre" class="block text-sm font-medium text-gray-700">
                  Nombre de la clase *
                </label>
                <input
                  id="nombre"
                  v-model="form.nombre"
                  type="text"
                  class="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                  placeholder="Ej: Matemáticas Avanzadas"
                  required
                />
                <div v-if="form.errors.nombre" class="mt-2 text-sm text-red-600">
                  {{ form.errors.nombre }}
                </div>
              </div>

              <!-- Descripción -->
              <div>
                <label for="descripcion" class="block text-sm font-medium text-gray-700">
                  Descripción
                </label>
                <textarea
                  id="descripcion"
                  v-model="form.descripcion"
                  rows="3"
                  class="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                  placeholder="Descripción de la clase y objetivos de aprendizaje"
                />
                <div v-if="form.errors.descripcion" class="mt-2 text-sm text-red-600">
                  {{ form.errors.descripcion }}
                </div>
              </div>

              <!-- Grado y Sección -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label for="grado" class="block text-sm font-medium text-gray-700">
                    Grado *
                  </label>
                  <select
                    id="grado"
                    v-model="form.grado"
                    class="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                    required
                  >
                    <option value="">Seleccionar grado</option>
                    <option v-for="grado in grados" :key="grado" :value="grado">
                      {{ grado }}
                    </option>
                  </select>
                  <div v-if="form.errors.grado" class="mt-2 text-sm text-red-600">
                    {{ form.errors.grado }}
                  </div>
                </div>

                <div>
                  <label for="seccion" class="block text-sm font-medium text-gray-700">
                    Sección *
                  </label>
                  <select
                    id="seccion"
                    v-model="form.seccion"
                    class="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                    required
                  >
                    <option value="">Seleccionar sección</option>
                    <option v-for="seccion in secciones" :key="seccion" :value="seccion">
                      {{ seccion }}
                    </option>
                  </select>
                  <div v-if="form.errors.seccion" class="mt-2 text-sm text-red-600">
                    {{ form.errors.seccion }}
                  </div>
                </div>
              </div>

              <!-- Año académico -->
              <div>
                <label for="año_academico" class="block text-sm font-medium text-gray-700">
                  Año Académico *
                </label>
                <input
                  id="año_academico"
                  v-model="form.año_academico"
                  type="number"
                  min="2020"
                  max="2030"
                  class="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                  required
                />
                <div v-if="form.errors.año_academico" class="mt-2 text-sm text-red-600">
                  {{ form.errors.año_academico }}
                </div>
              </div>

              <!-- Configuración Inicial -->
              <div class="border-t pt-6">
                <h3 class="text-lg font-medium text-gray-900 mb-4">Configuración Inicial</h3>
                
                <div class="space-y-4">
                  <!-- Configuración de gamificación -->
                  <div>
                    <label class="flex items-center">
                      <input
                        v-model="form.configuracion.gamificacion_activa"
                        type="checkbox"
                        class="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                      />
                      <span class="ml-2 text-sm text-gray-600">Activar gamificación para esta clase</span>
                    </label>
                  </div>

                  <!-- Puntos por actividad -->
                  <div v-if="form.configuracion.gamificacion_activa" class="ml-6 space-y-4">
                    <div>
                      <label for="puntos_base" class="block text-sm font-medium text-gray-700">
                        Puntos base por actividad
                      </label>
                      <input
                        id="puntos_base"
                        v-model="form.configuracion.puntos_base_actividad"
                        type="number"
                        min="1"
                        max="100"
                        class="mt-1 block w-32 border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                      />
                    </div>

                    <div>
                      <label for="monedas_base" class="block text-sm font-medium text-gray-700">
                        Monedas base por actividad
                      </label>
                      <input
                        id="monedas_base"
                        v-model="form.configuracion.monedas_base_actividad"
                        type="number"
                        min="1"
                        max="50"
                        class="mt-1 block w-32 border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <!-- Botones -->
              <div class="flex items-center justify-end space-x-4 pt-6 border-t">
                <Link
                  :href="route('clases.index')"
                  class="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Cancelar
                </Link>
                
                <button
                  type="submit"
                  :disabled="form.processing"
                  class="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                  <span v-if="form.processing">Creando...</span>
                  <span v-else>Crear Clase</span>
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

const grados = ['6°', '7°', '8°', '9°', '10°', '11°']
const secciones = ['A', 'B', 'C', 'D', 'E']

const form = useForm({
  nombre: '',
  descripcion: '',
  grado: '',
  seccion: '',
  año_academico: new Date().getFullYear(),
  configuracion: {
    gamificacion_activa: true,
    puntos_base_actividad: 25,
    monedas_base_actividad: 10,
  }
})

const submit = () => {
  form.post(route('clases.store'), {
    onSuccess: () => {
      form.reset()
    },
  })
}
</script>