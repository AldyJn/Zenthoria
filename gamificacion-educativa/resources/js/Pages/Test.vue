<template>
  <div style="padding: 20px; font-family: Arial;">
    <h1>Test de Inertia</h1>
    <p>{{ message }}</p>
    <pre>{{ JSON.stringify(data, null, 2) }}</pre>
  </div>
</template>

<script setup>
defineProps(['message', 'data']);
</script>