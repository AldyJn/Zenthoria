<!-- resources/js/Pages/Clases/Unirse.vue -->
<template>
  <Head title="Unirse a Clase" />

  <AuthenticatedLayout>
    <template #header>
      <h2 class="text-h4 font-weight-bold">Unirse a una Clase</h2>
    </template>

    <v-container>
      <v-row justify="center">
        <v-col cols="12" md="6" lg="4">
          <v-card>
            <!-- Header -->
            <v-card-title class="text-center pa-6">
              <v-avatar size="80" color="success" class="mb-4">
                <v-icon size="40">mdi-account-plus</v-icon>
              </v-avatar>
              <h3 class="text-h5 mb-2">Unirse a una Clase</h3>
              <p class="text-body-2 text-medium-emphasis">
                Ingresa el código que te proporcionó tu profesor
              </p>
            </v-card-title>

            <v-card-text>
              <v-form @submit.prevent="submit">
                <!-- Código de invitación -->
                <v-text-field
                  v-model="form.codigo"
                  label="Código de Clase *"
                  placeholder="ABC123"
                  prepend-icon="mdi-key"
                  :error-messages="form.errors.codigo"
                  variant="outlined"
                  maxlength="6"
                  class="text-center"
                  style="font-family: monospace; font-size: 1.2em; letter-spacing: 0.2em"
                  :loading="verificando"
                  @input="form.codigo = $event.target.value.toUpperCase()"
                  required
                >
                  <template v-slot:append-inner>
                    <v-progress-circular
                      v-if="verificando"
                      indeterminate
                      size="20"
                      width="2"
                    ></v-progress-circular>
                    <v-icon
                      v-else-if="claseEncontrada"
                      color="success"
                    >
                      mdi-check-circle
                    </v-icon>
                  </template>
                </v-text-field>

                <v-alert
                  type="info"
                  variant="tonal"
                  class="mb-4"
                >
                  El código debe tener 6 caracteres (letras y números)
                </v-alert>

                <!-- Vista previa de la clase -->
                <v-card
                  v-if="claseEncontrada && !form.errors.codigo"
                  variant="tonal"
                  color="success"
                  class="mb-4"
                >
                  <v-card-text>
                    <div class="d-flex align-center mb-2">
                      <v-icon class="mr-2" color="success">mdi-check-circle</v-icon>
                      <span class="font-weight-bold">Clase encontrada</span>
                    </div>
                    <h4 class="text-h6">{{ claseEncontrada.nombre }}</h4>
                    <p class="text-body-2">{{ claseEncontrada.grado }} - {{ claseEncontrada.seccion }}</p>
                    <p class="text-caption">{{ claseEncontrada.descripcion }}</p>
                  </v-card-text>
                </v-card>

                <!-- Selección de personaje -->
                <div v-if="claseEncontrada && claseEncontrada.configuracion?.gamificacion_activa">
                  <v-divider class="my-4"></v-divider>
                  
                  <h4 class="text-h6 mb-4">Crea tu Personaje</h4>
                  
                  <!-- Nombre del personaje -->
                  <v-text-field
                    v-model="form.personaje.nombre"
                    label="Nombre del Personaje *"
                    placeholder="Ej: Alex el Sabio"
                    prepend-icon="mdi-account"
                    :error-messages="form.errors['personaje.nombre']"
                    variant="outlined"
                    maxlength="50"
                    required
                  ></v-text-field>

                  <!-- Clase RPG -->
                  <v-card variant="outlined" class="mb-4">
                    <v-card-title class="text-subtitle-1">
                      Clase de Personaje *
                    </v-card-title>
                    <v-card-text>
                      <v-row>
                        <v-col
                          v-for="clase in clasesRpg"
                          :key="clase.id"
                          cols="12"
                          sm="6"
                        >
                          <v-card
                            :variant="form.personaje.id_clase_rpg === clase.id ? 'elevated' : 'outlined'"
                            :color="form.personaje.id_clase_rpg === clase.id ? 'primary' : undefined"
                            class="cursor-pointer"
                            @click="form.personaje.id_clase_rpg = clase.id"
                          >
                            <v-card-text class="text-center">
                              <div class="text-h4 mb-2">{{ clase.icono }}</div>
                              <h5 class="text-subtitle-1 font-weight-bold">{{ clase.nombre }}</h5>
                              <p class="text-caption">{{ clase.descripcion }}</p>
                            </v-card-text>
                          </v-card>
                        </v-col>
                      </v-row>
                      
                      <v-alert
                        v-if="form.errors['personaje.id_clase_rpg']"
                        type="error"
                        variant="text"
                        class="mt-2"
                      >
                        {{ form.errors['personaje.id_clase_rpg'] }}
                      </v-alert>
                    </v-card-text>
                  </v-card>
                </div>

                <!-- Botones -->
                <v-row class="mt-4">
                  <v-col>
                    <v-btn
                      :to="route('dashboard')"
                      variant="outlined"
                      size="large"
                      class="mr-3"
                    >
                      Cancelar
                    </v-btn>
                    
                    <v-btn
                      type="submit"
                      color="success"
                      size="large"
                      :loading="form.processing"
                      :disabled="!claseEncontrada"
                    >
                      Unirse a la Clase
                    </v-btn>
                  </v-col>
                </v-row>
              </v-form>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </AuthenticatedLayout>
</template>

<script setup>
import { Head, useForm } from '@inertiajs/vue3'
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.vue'
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

<style scoped>
.cursor-pointer {
  cursor: pointer;
}
</style>