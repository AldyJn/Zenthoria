<template>
  <v-card
    :class="[
      'clase-rpg-card',
      { 'selected': isSelected },
      `border-${claseColor}`
    ]"
    :color="isSelected ? claseColor : undefined"
    :variant="isSelected ? 'tonal' : 'elevated'"
    @click="$emit('select', clase)"
  >
    <v-card-text class="text-center">
      <v-avatar size="64" class="mb-3">
        <v-img
          :src="clase.imagen_url || `/images/clases/${clase.nombre.toLowerCase()}.png`"
          :alt="clase.nombre"
        ></v-img>
      </v-avatar>
      
      <h3 class="text-h6 mb-2">{{ clase.nombre }}</h3>
      <p class="text-caption text-medium-emphasis">
        {{ clase.descripcion }}
      </p>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  clase: {
    type: Object,
    required: true
  },
  isSelected: {
    type: Boolean,
    default: false
  }
});

defineEmits(['select']);

const claseColor = computed(() => {
  const colors = {
    'Guerrero': 'guerrero',
    'Mago': 'mago',
    'Arquero': 'arquero'
  };
  return colors[props.clase.nombre] || 'primary';
});
</script>

<!-- <style scoped>
.clase-rpg-card {
  cursor: pointer;
  transition: all 0.3s ease;
}

.clase-rpg-card:hover {
  transform: translateY(-2px);
}

.selected {
  box-shadow: 0 0 0 2px currentColor !important;
} -->