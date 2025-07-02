// resources/js/Layouts/GuestLayout.vue
<template>
  <v-app>
    <v-main>
      <v-container class="fill-height" fluid>
        <v-row align="center" justify="center">
          <v-col cols="12" sm="8" md="6" lg="4">
            <!-- Logo -->
            <div class="text-center mb-8">
              <v-img
                src="/images/logo.png"
                alt="EduApp Gamificada"
                max-width="120"
                class="mx-auto mb-4"
              ></v-img>
              <h1 class="text-h4 font-weight-bold text-primary">
                EduApp Gamificada
              </h1>
              <p class="text-subtitle-1 text-medium-emphasis">
                Aprende jugando, crece compitiendo
              </p>
            </div>

            <!-- Content -->
            <slot />

            <!-- Footer -->
            <div class="text-center mt-8">
              <p class="text-caption text-medium-emphasis">
                &copy; {{ new Date().getFullYear() }} EduApp Gamificada
              </p>
            </div>
          </v-col>
        </v-row>
      </v-container>
    </v-main>
  </v-app>
</template>

// resources/js/Components/GameElements/ExperienceBar.vue
<template>
  <div class="experience-bar">
    <div class="d-flex justify-space-between align-center mb-2">
      <span class="text-body-2">
        <v-icon size="small" color="experience">mdi-star</v-icon>
        Nivel {{ nivel }}
      </span>
      <span class="text-caption text-medium-emphasis">
        {{ experiencia }} / {{ experienciaSiguienteNivel }} XP
      </span>
    </div>
    
    <v-progress-linear
      :model-value="porcentaje"
      height="8"
      color="experience"
      bg-color="grey-lighten-3"
      rounded
    ></v-progress-linear>
    
    <div class="text-caption text-medium-emphasis mt-1">
      {{ experienciaRestante }} XP para el siguiente nivel
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  nivel: {
    type: Number,
    required: true
  },
  experiencia: {
    type: Number,
    required: true
  },
  experienciaSiguienteNivel: {
    type: Number,
    required: true
  }
});

const porcentaje = computed(() => {
  if (props.experienciaSiguienteNivel === 0) return 100;
  return (props.experiencia / props.experienciaSiguienteNivel) * 100;
});

const experienciaRestante = computed(() => {
  return Math.max(0, props.experienciaSiguienteNivel - props.experiencia);
});
</script>
