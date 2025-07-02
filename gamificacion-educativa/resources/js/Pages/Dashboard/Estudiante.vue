<!-- resources/js/Pages/Dashboard/Estudiante.vue -->
<template>
  <Head title="Dashboard Estudiante" />

  <AuthenticatedLayout>
    <template #header>
      <div class="d-flex justify-space-between align-center">
        <div>
          <h1 class="text-h4 font-weight-bold">Mi Dashboard</h1>
          <p class="text-subtitle-1 text-medium-emphasis">
            ¡Bienvenido, {{ $page.props.auth.user.nombre }}! 🎮
          </p>
        </div>
        
        <v-btn
          color="success"
          size="large"
          :to="route('clases.unirse.form')"
          prepend-icon="mdi-plus"
        >
          Unirse a Clase
        </v-btn>
      </div>
    </template>

    <!-- Mensaje de bienvenida -->
    <v-card class="mb-6" color="primary" variant="tonal">
      <v-card-text>
        <div class="d-flex align-center">
          <v-avatar size="64" class="mr-4">
            <v-icon size="32">mdi-gamepad-variant</v-icon>
          </v-avatar>
          <div>
            <h2 class="text-h5 mb-2">¡Aventura de Aprendizaje! 🚀</h2>
            <p class="text-body-1">
              {{ clases.length === 0 
                ? 'Únete a tu primera clase para comenzar tu aventura de aprendizaje.' 
                : `Tienes ${clases.length} ${clases.length === 1 ? 'clase activa' : 'clases activas'}. ¡Sigue aprendiendo!`
              }}
            </p>
          </div>
        </div>
      </v-card-text>
    </v-card>

    <!-- Sin clases -->
    <v-card v-if="clases.length === 0" class="text-center pa-8">
      <v-avatar size="128" color="grey-lighten-3" class="mb-4">
        <v-icon size="64" color="grey">mdi-google-classroom</v-icon>
      </v-avatar>
      <h3 class="text-h5 mb-2">No estás inscrito en ninguna clase</h3>
      <p class="text-body-1 mb-6 text-medium-emphasis">
        Pídele a tu profesor el código de la clase para unirte y comenzar tu aventura de aprendizaje.
      </p>
      <v-btn
        color="success"
        size="large"
        :to="route('clases.unirse.form')"
        prepend-icon="mdi-plus"
      >
        Unirse a una clase
      </v-btn>
    </v-card>

    <!-- Mis clases -->
    <div v-else>
      <v-card>
        <v-card-title class="d-flex align-center">
          <v-icon class="mr-2">mdi-google-classroom</v-icon>
          Mis Clases
        </v-card-title>
        
        <v-card-text>
          <v-row>
            <v-col
              v-for="clase in clases"
              :key="clase.clase.id"
              cols="12"
              md="6"
              lg="4"
            >
              <v-card hover class="h-100">
                <!-- Header gradiente -->
                <div class="bg-gradient pa-4 text-white">
                  <h4 class="text-h6 font-weight-bold">{{ clase.clase.nombre }}</h4>
                  <p class="text-body-2 mb-1">{{ clase.clase.grado }} - {{ clase.clase.seccion }}</p>
                  <p class="text-caption">Prof. {{ clase.clase.docente.usuario.nombre }}</p>
                </div>

                <v-card-text>
                  <!-- Mi personaje -->
                  <div v-if="clase.personaje" class="mb-4">
                    <v-card variant="tonal" color="primary">
                      <v-card-text class="pa-3">
                        <div class="d-flex justify-space-between align-center mb-2">
                          <h5 class="text-subtitle-2 font-weight-bold">Mi Personaje</h5>
                          <v-chip size="small" color="primary">
                            Nivel {{ clase.personaje.nivel }}
                          </v-chip>
                        </div>
                        <p class="text-body-2 mb-1">{{ clase.personaje.nombre }}</p>
                        <p class="text-caption text-medium-emphasis">{{ clase.personaje.clase_rpg }}</p>
                        
                        <!-- Barra de experiencia -->
                        <div class="mt-3">
                          <div class="d-flex justify-space-between text-caption mb-1">
                            <span>XP: {{ clase.personaje.experiencia }}</span>
                            <span>{{ clase.personaje.experiencia_siguiente_nivel }} para siguiente nivel</span>
                          </div>
                          <v-progress-linear
                            :model-value="(clase.personaje.experiencia_nivel_actual / clase.personaje.experiencia_para_nivel) * 100"
                            color="experience"
                            height="6"
                            rounded
                          ></v-progress-linear>
                        </div>
                      </v-card-text>
                    </v-card>
                  </div>

                  <!-- Estadísticas -->
                  <v-row dense class="mb-4">
                    <v-col cols="6">
                      <div class="text-center">
                        <v-avatar size="40" color="gold" class="mb-2">
                          <v-icon>mdi-coin</v-icon>
                        </v-avatar>
                        <p class="text-h6 font-weight-bold">{{ clase.saldo_monedas || 0 }}</p>
                        <p class="text-caption">Monedas</p>
                      </div>
                    </v-col>
                    <v-col cols="6">
                      <div class="text-center">
                        <v-avatar size="40" color="error" class="mb-2">
                          <v-icon>mdi-clipboard-alert</v-icon>
                        </v-avatar>
                        <p class="text-h6 font-weight-bold">{{ clase.actividades_pendientes || 0 }}</p>
                        <p class="text-caption">Pendientes</p>
                      </div>
                    </v-col>
                  </v-row>

                  <!-- Promedio -->
                  <div v-if="clase.promedio_notas" class="text-center mb-4">
                    <v-avatar size="40" color="success" class="mb-2">
                      <v-icon>mdi-chart-line</v-icon>
                    </v-avatar>
                    <p class="text-h6 font-weight-bold">{{ clase.promedio_notas.toFixed(1) }}</p>
                    <p class="text-caption">Promedio</p>
                  </div>
                </v-card-text>

                <!-- Acciones -->
                <v-card-actions class="pa-4">
                  <v-btn
                    variant="elevated"
                    color="primary"
                    block
                    :to="route('clases.show', clase.clase.id)"
                    class="mb-2"
                  >
                    Entrar a Clase
                  </v-btn>
                  
                  <v-btn
                    v-if="clase.actividades_pendientes > 0"
                    variant="outlined"
                    color="warning"
                    block
                    :to="route('actividades.index', clase.clase.id)"
                  >
                    Ver Actividades ({{ clase.actividades_pendientes }})
                  </v-btn>
                </v-card-actions>
              </v-card>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>

      <!-- Actividades próximas a vencer -->
      <v-card v-if="actividades_proximas.length > 0" class="mt-6">
        <v-card-title class="d-flex align-center">
          <v-icon class="mr-2" color="warning">mdi-alert-circle</v-icon>
          Actividades Próximas a Vencer
        </v-card-title>
        
        <v-card-text>
          <v-list>
            <v-list-item
              v-for="actividad in actividades_proximas"
              :key="actividad.id"
              class="pa-3"
            >
              <template v-slot:prepend>
                <v-avatar color="warning">
                  <v-icon>mdi-clock-alert</v-icon>
                </v-avatar>
              </template>

              <v-list-item-title>{{ actividad.titulo }}</v-list-item-title>
              <v-list-item-subtitle>
                {{ actividad.clase.nombre }} • Vence: {{ formatearFecha(actividad.fecha_entrega) }}
              </v-list-item-subtitle>

              <template v-slot:append>
                <v-btn
                  variant="outlined"
                  color="warning"
                  :to="route('actividades.show', actividad.id)"
                >
                  Ver
                </v-btn>
              </template>
            </v-list-item>
          </v-list>
        </v-card-text>
      </v-card>
    </div>
  </AuthenticatedLayout>
</template>

<script setup>
import { Head } from '@inertiajs/vue3'
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.vue'

defineProps({
  clases: Array,
  actividades_proximas: Array,
})

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

<style scoped>
.bg-gradient {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}
</style>