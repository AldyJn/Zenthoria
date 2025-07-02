<!-- resources/js/Pages/Clases/Unirse.vue -->
<template>
  <Head title="Unirse a Clase" />

  <AuthenticatedLayout>
    <template #header>
      <h2 class="font-semibold text-xl text-gray-800 leading-tight">
        Unirse a una Clase
      </h2>
    </template>

    <div class="py-12">
      <div class="max-w-md mx-auto sm:px-6 lg:px-8">
        <div class="bg-white overflow-hidden shadow-sm sm:rounded-lg">
          <div class="p-6 bg-white">
            <!-- Instrucciones -->
            <div class="text-center mb-6">
              <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                <UserPlusIcon class="h-6 w-6 text-green-600" />
              </div>
              <h3 class="mt-2 text-lg font-medium text-gray-900">Unirse a una Clase</h3>
              <p class="mt-1 text-sm text-gray-500">
                Ingresa el código que te proporcionó tu profesor para unirte a su clase.
              </p>
            </div>

            <!-- Formulario -->
            <form @submit.prevent="submit" class="space-y-6">
              <!-- Código de invitación -->
              <div>
                <label for="codigo" class="block text-sm font-medium text-gray-700">
                  Código de Clase *
                </label>
                <div class="mt-1 relative">
                  <input
                    id="codigo"
                    v-model="form.codigo"
                    type="text"
                    class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 text-center text-lg font-mono tracking-wider uppercase"
                    placeholder="ABC123"
                    maxlength="6"
                    required
                    @input="form.codigo = $event.target.value.toUpperCase()"
                  />
                  <div v-if="verificando" class="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-green-500"></div>
                  </div>
                </div>
                <div v-if="form.errors.codigo" class="mt-2 text-sm text-red-600">
                  {{ form.errors.codigo }}
                </div>
                <p class="mt-2 text-xs text-gray-500">
                  El código debe tener 6 caracteres (letras y números)
                </p>
              </div>

              <!-- Vista previa de la clase -->
              <div v-if="claseEncontrada && !form.errors.codigo" 
                   class="border border-green-200 rounded-lg p-4 bg-green-50">
                <div class="flex items-center">
                  <CheckCircleIcon class="h-5 w-5 text-green-400" />
                  <h4 class="ml-2 text-sm font-medium text-green-800">Clase encontrada</h4>
                </div>
                <div class="mt-2 text-sm text-green-700">
                  <p><strong>{{ claseEncontrada.nombre }}</strong></p>
                  <p>{{ claseEncontrada.grado }} - {{ claseEncontrada.seccion }}</p>
                  <p class="text-xs">{{ claseEncontrada.descripcion }}</p>
                </div>
              </div>

              <!-- Selección de personaje -->
              <div v-if="claseEncontrada && claseEncontrada.configuracion?.gamificacion_activa" 
                   class="border-t pt-6">
                <h4 class="text-sm font-medium text-gray-900 mb-4">Crea tu Personaje</h4>
                
                <!-- Nombre del personaje -->
                <div class="mb-4">
                  <label for="nombre_personaje" class="block text-sm font-medium text-gray-700">
                    Nombre del Personaje *
                  </label>
                  <input
                    id="nombre_personaje"
                    v-model="form.personaje.nombre"
                    type="text"
                    class="mt-1 block w-full border-gray-300 focus:border-green-500 focus:ring-green-500 rounded-md shadow-sm"
                    placeholder="Ej: Alex el Sabio"
                    maxlength="50"
                    required
                  />
                  <div v-if="form.errors['personaje.nombre']" class="mt-2 text-sm text-red-600">
                    {{ form.errors['personaje.nombre'] }}
                  </div>
                </div>

                <!-- Clase RPG -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-3">
                    Clase de Personaje *
                  </label>
                  <div class="grid grid-cols-1 gap-3">
                    <div
                      v-for="clase in clasesRpg"
                      :key="clase.id"
                      @click="form.personaje.id_clase_rpg = clase.id"
                      :class="[
                        'relative rounded-lg border p-4 cursor-pointer focus:outline-none',
                        form.personaje.id_clase_rpg === clase.id
                          ? 'border-green-500 bg-green-50'
                          : 'border-gray-300 hover:border-gray-400'
                      ]"
                    >
                      <div class="flex items-center">
                        <div class="flex-shrink-0">
                          <span class="text-2xl">{{ clase.icono }}</span>
                        </div>
                        <div class="ml-3">
                          <h5 class="text-sm font-medium text-gray-900">{{ clase.nombre }}</h5>
                          <p class="text-xs text-gray-500">{{ clase.descripcion }}</p>
                        </div>
                      </div>
                      <div v-if="form.personaje.id_clase_rpg === clase.id"
                           class="absolute -inset-px rounded-lg border-2 border-green-500 pointer-events-none"></div>
                    </div>
                  </div>
                  <div v-if="form.errors['personaje.id_clase_rpg']" class="mt-2 text-sm text-red-600">
                    {{ form.errors['personaje.id_clase_rpg'] }}
                  </div>
                </div>
              </div>

              <!-- Botones -->
              <div class="flex items-center justify-end space-x-4 pt-6 border-t">
                <Link
                  :href="route('dashboard')"
                  class="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancelar
                </Link>
                
                <button
                  type="submit"
                  :disabled="form.processing || !claseEncontrada"
                  class="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                >
                  <span v-if="form.processing">Uniéndose...</span>
                  <span v-else>Unirse a la Clase</span>
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
import { 
  UserPlusIcon, 
  CheckCircleIcon 
} from '@heroicons/vue/24/outline'
import { ref, watch } from 'vue'

defineProps({
  clasesRpg: Array,
})

const verificando = ref(false)
const claseEncontrada = ref(null)

const form = useForm({
  codigo: '',
  personaje: {
    nombre: '',
    id_clase_rpg: null,
  }
})

// Verificar código cuando cambie
watch(() => form.codigo, async (nuevoCodigo) => {
  if (nuevoCodigo.length === 6) {
    verificando.value = true
    try {
      const response = await fetch(route('api.clases.verificar-codigo'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
        },
        body: JSON.stringify({ codigo: nuevoCodigo })
      })
      
      const data = await response.json()
      
      if (data.valido) {
        claseEncontrada.value = data.clase
        form.clearErrors('codigo')
      } else {
        claseEncontrada.value = null
        form.setError('codigo', 'Código de clase no válido')
      }
    } catch (error) {
      claseEncontrada.value = null
      form.setError('codigo', 'Error al verificar el código')
    } finally {
      verificando.value = false
    }
  } else {
    claseEncontrada.value = null
  }
})

const submit = () => {
  form.post(route('clases.unirse'), {
    onSuccess: () => {
      form.reset()
    },
  })
}
</script>