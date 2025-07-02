<!-- resources/js/Pages/Dashboard/Profesor.vue -->
<template>
  <Head title="Dashboard Profesor" />

  <AuthenticatedLayout>
    <!-- Fondo animado estilo Destiny -->
    <div class="destiny-background"></div>
    
    <div class="min-h-screen relative overflow-hidden">
      <!-- Header flotante tipo HUD -->
      <div class="fixed top-6 left-1/2 transform -translate-x-1/2 z-30">
        <div class="destiny-panel px-8 py-4">
          <h1 class="destiny-title text-2xl text-center mb-2">
            COMANDO CENTRAL
          </h1>
          <p class="destiny-subtitle text-center text-sm">
            {{ $page.props.auth.user.nombre }} - INSTRUCTOR
          </p>
        </div>
      </div>

      <!-- Barra lateral HUD vertical -->
      <div class="fixed left-6 top-1/2 transform -translate-y-1/2 z-20">
        <div class="destiny-panel p-4 space-y-6">
          <div class="hud-icon-container">
            <div class="hud-icon active">
              <i class="mdi mdi-view-dashboard text-2xl"></i>
            </div>
          </div>
          
          <div class="hud-icon-container">
            <div class="hud-icon" @click="$inertia.visit(route('clases.index'))">
              <i class="mdi mdi-google-classroom text-2xl"></i>
            </div>
          </div>
          
          <div class="hud-icon-container">
            <div class="hud-icon">
              <i class="mdi mdi-chart-line text-2xl"></i>
            </div>
          </div>
          
          <div class="hud-icon-container">
            <div class="hud-icon">
              <i class="mdi mdi-cog text-2xl"></i>
            </div>
          </div>
        </div>
      </div>

      <!-- Tarjetas estadísticas flotantes -->
      <div class="fixed top-24 right-6 space-y-4 z-20">
        <div class="stat-card cyan">
          <div class="stat-icon">
            <i class="mdi mdi-google-classroom text-3xl"></i>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ estadisticas.clases_activas }}</div>
            <div class="stat-label">CLASES ACTIVAS</div>
          </div>
        </div>

        <div class="stat-card gold">
          <div class="stat-icon">
            <i class="mdi mdi-account-group text-3xl"></i>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ estadisticas.total_estudiantes }}</div>
            <div class="stat-label">ESTUDIANTES</div>
          </div>
        </div>

        <div class="stat-card purple">
          <div class="stat-icon">
            <i class="mdi mdi-clipboard-list text-3xl"></i>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ estadisticas.actividades_mes }}</div>
            <div class="stat-label">ACTIVIDADES</div>
          </div>
        </div>

        <div class="stat-card gold">
          <div class="stat-icon">
            <i class="mdi mdi-star text-3xl"></i>
          </div>
          <div class="stat-content">
            <div class="stat-value">
              {{ estadisticas.promedio_general ? estadisticas.promedio_general.toFixed(1) : '--' }}
            </div>
            <div class="stat-label">PROMEDIO</div>
          </div>
        </div>
      </div>

      <!-- Carta Estelar - Nodos de clases flotantes -->
      <div class="flex-1 flex items-center justify-center pt-32 pb-24">
        <div class="stellar-map">
          <!-- Sin clases -->
          <div v-if="clases.data.length === 0" class="empty-state">
            <div class="destiny-panel p-12 text-center max-w-lg">
              <div class="empty-icon mb-6">
                <i class="mdi mdi-google-classroom text-8xl text-cyan-400 opacity-50"></i>
              </div>
              <h3 class="destiny-title text-xl mb-4">NO HAY TRANSMISIONES ACTIVAS</h3>
              <p class="destiny-body text-gray-400 mb-8">
                Inicia tu primera misión educativa creando una clase para tus estudiantes.
              </p>
              <button 
                @click="$inertia.visit(route('clases.create'))"
                class="destiny-btn destiny-btn-cyan text-lg px-8 py-4"
              >
                <i class="mdi mdi-plus mr-2"></i>
                CREAR PRIMERA CLASE
              </button>
            </div>
          </div>

          <!-- Nodos de clases flotantes -->
          <div v-else class="stellar-nodes">
            <div
              v-for="(clase, index) in clases.data"
              :key="clase.id"
              class="stellar-node"
              :style="getNodePosition(index, clases.data.length)"
              @click="$inertia.visit(route('clases.show', clase.id))"
              @mouseenter="hoveredClass = clase"
              @mouseleave="hoveredClass = null"
            >
              <!-- Nodo principal -->
              <div class="node-circle" :class="{ active: clase.activo }">
                <div class="node-inner">
                  <div class="node-icon">
                    <i class="mdi mdi-google-classroom text-3xl"></i>
                  </div>
                  <div class="node-level">{{ clase.estudiantes_count }}</div>
                </div>
                
                <!-- Anillo de progreso -->
                <svg class="node-ring" viewBox="0 0 120 120">
                  <circle
                    cx="60"
                    cy="60"
                    r="55"
                    fill="none"
                    stroke="rgba(110, 193, 228, 0.3)"
                    stroke-width="2"
                  />
                  <circle
                    cx="60"
                    cy="60"
                    r="55"
                    fill="none"
                    stroke="#6EC1E4"
                    stroke-width="2"
                    stroke-linecap="round"
                    :stroke-dasharray="345"
                    :stroke-dashoffset="345 - (345 * (clase.estudiantes_count / 30))"
                    class="progress-ring"
                  />
                </svg>
              </div>

              <!-- Tooltip flotante -->
              <Transition name="fade">
                <div v-if="hoveredClass?.id === clase.id" class="node-tooltip">
                  <div class="destiny-panel p-4 min-w-64">
                    <h4 class="destiny-subtitle text-lg mb-2">{{ clase.nombre }}</h4>
                    <p class="text-sm text-gray-300 mb-3">{{ clase.descripcion }}</p>
                    
                    <div class="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div class="text-cyan-400">{{ clase.grado }} - {{ clase.seccion }}</div>
                        <div class="text-xs text-gray-400">NIVEL</div>
                      </div>
                      <div>
                        <div class="text-gold-400">{{ clase.estudiantes_count }}/30</div>
                        <div class="text-xs text-gray-400">ESTUDIANTES</div>
                      </div>
                    </div>
                    
                    <div class="mt-4 flex items-center justify-between">
                      <div class="flex items-center space-x-2">
                        <div class="status-indicator" :class="{ active: clase.activo }"></div>
                        <span class="text-xs">{{ clase.activo ? 'ACTIVA' : 'INACTIVA' }}</span>
                      </div>
                      <div class="text-xs text-gray-400">
                        CÓDIGO: {{ clase.codigo_invitacion }}
                      </div>
                    </div>
                  </div>
                </div>
              </Transition>
            </div>
          </div>
        </div>
      </div>

      <!-- Barra flotante inferior - Accesos rápidos -->
      <div class="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-20">
        <div class="destiny-panel p-4">
          <div class="flex items-center space-x-6">
            <button class="quick-action" title="Agregar Experiencia">
              <i class="mdi mdi-plus-circle text-2xl text-green-400"></i>
            </button>
            
            <button class="quick-action" title="Registrar Comportamiento">
              <i class="mdi mdi-minus-circle text-2xl text-red-400"></i>
            </button>
            
            <button class="quick-action" title="Generar QR">
              <i class="mdi mdi-qrcode text-2xl text-purple-400"></i>
            </button>
            
            <button 
              @click="$inertia.visit(route('clases.create'))"
              class="quick-action primary"
              title="Crear Tarea"
            >
              <i class="mdi mdi-plus text-2xl"></i>
            </button>
            
            <button class="quick-action" title="Seleccionar Estudiante">
              <i class="mdi mdi-account-question text-2xl text-yellow-400"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  </AuthenticatedLayout>
</template>

<script setup>
import { Head } from '@inertiajs/vue3'
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.vue'
import { ref } from 'vue'

defineProps({
  clases: Object,
  estadisticas: Object,
})

const hoveredClass = ref(null)

// Posicionar nodos en círculo
const getNodePosition = (index, total) => {
  const centerX = 50
  const centerY = 50
  const radius = Math.min(30, 10 + total * 2)
  
  const angle = (index / total) * 2 * Math.PI - Math.PI / 2
  const x = centerX + radius * Math.cos(angle)
  const y = centerY + radius * Math.sin(angle)
  
  return {
    position: 'absolute',
    left: `${x}%`,
    top: `${y}%`,
    transform: 'translate(-50%, -50%)',
  }
}
</script>

<style scoped>
/* Destiny UI Base Styles */
.destiny-background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -1;
  background: radial-gradient(ellipse at top, #1e2139, #1B1C29);
  overflow: hidden;
}

.destiny-background::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: 
    radial-gradient(2px 2px at 20px 30px, rgba(110, 193, 228, 0.3), transparent),
    radial-gradient(2px 2px at 40px 70px, rgba(199, 184, 138, 0.2), transparent),
    radial-gradient(1px 1px at 90px 40px, rgba(182, 161, 228, 0.4), transparent);
  background-repeat: repeat;
  background-size: 200px 200px;
  animation: float 20s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0px) translateX(0px); }
  50% { transform: translateY(-10px) translateX(5px); }
}

.destiny-panel {
  background: rgba(46, 47, 61, 0.9);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(110, 193, 228, 0.4);
  border-radius: 8px;
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

.destiny-title {
  font-family: 'Orbitron', monospace;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: #6EC1E4;
  text-shadow: 0 0 10px rgba(110, 193, 228, 0.5);
}

.destiny-subtitle {
  font-family: 'Orbitron', monospace;
  font-weight: 400;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #C7B88A;
}

.destiny-body {
  font-family: 'Exo 2', sans-serif;
  line-height: 1.6;
}

/* HUD Icons */
.hud-icon-container {
  position: relative;
}

.hud-icon {
  width: 50px;
  height: 50px;
  border: 1px solid rgba(110, 193, 228, 0.3);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  color: #6EC1E4;
}

.hud-icon:hover,
.hud-icon.active {
  background: rgba(110, 193, 228, 0.2);
  border-color: #6EC1E4;
  box-shadow: 0 0 20px rgba(110, 193, 228, 0.3);
}

/* Stat Cards */
.stat-card {
  background: rgba(46, 47, 61, 0.9);
  backdrop-filter: blur(12px);
  border-radius: 8px;
  padding: 16px;
  min-width: 140px;
  display: flex;
  align-items: center;
  gap: 12px;
  transition: all 0.3s ease;
}

.stat-card.cyan {
  border: 1px solid rgba(110, 193, 228, 0.4);
  box-shadow: 0 0 15px rgba(110, 193, 228, 0.2);
}

.stat-card.gold {
  border: 1px solid rgba(199, 184, 138, 0.4);
  box-shadow: 0 0 15px rgba(199, 184, 138, 0.2);
}

.stat-card.purple {
  border: 1px solid rgba(182, 161, 228, 0.4);
  box-shadow: 0 0 15px rgba(182, 161, 228, 0.2);
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
}

.stat-icon {
  color: inherit;
}

.stat-value {
  font-family: 'Orbitron', monospace;
  font-size: 1.5rem;
  font-weight: 700;
  color: #E6E6E6;
}

.stat-label {
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #8C8C8C;
}

/* Stellar Map */
.stellar-map {
  width: 80vw;
  height: 60vh;
  position: relative;
}

.stellar-nodes {
  width: 100%;
  height: 100%;
  position: relative;
}

/* Stellar Nodes */
.stellar-node {
  cursor: pointer;
}

.node-circle {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  position: relative;
  transition: all 0.4s ease;
}

.node-circle:hover {
  transform: scale(1.1);
}

.node-circle.active {
  box-shadow: 0 0 30px rgba(110, 193, 228, 0.6);
}

.node-inner {
  width: 100%;
  height: 100%;
  background: radial-gradient(circle, rgba(110, 193, 228, 0.3), rgba(46, 47, 61, 0.9));
  border: 2px solid #6EC1E4;
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 2;
}

.node-icon {
  color: #6EC1E4;
  margin-bottom: 4px;
}

.node-level {
  font-family: 'Orbitron', monospace;
  font-size: 0.75rem;
  font-weight: 700;
  color: #C7B88A;
}

.node-ring {
  position: absolute;
  top: -10px;
  left: -10px;
  width: 120px;
  height: 120px;
  z-index: 1;
}

.progress-ring {
  transition: stroke-dashoffset 0.5s ease;
  transform-origin: center;
  transform: rotate(-90deg);
}

/* Node Tooltip */
.node-tooltip {
  position: absolute;
  top: -20px;
  left: 120px;
  z-index: 10;
}

.status-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #666;
}

.status-indicator.active {
  background: #4ADE80;
  box-shadow: 0 0 8px rgba(74, 222, 128, 0.5);
}

/* Quick Actions */
.quick-action {
  width: 50px;
  height: 50px;
  border: 1px solid rgba(110, 193, 228, 0.3);
  border-radius: 50%;
  background: rgba(46, 47, 61, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.quick-action:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
}

.quick-action.primary {
  background: rgba(110, 193, 228, 0.3);
  border-color: #6EC1E4;
  color: #6EC1E4;
}

.quick-action.primary:hover {
  background: rgba(110, 193, 228, 0.5);
  box-shadow: 0 0 20px rgba(110, 193, 228, 0.4);
}

/* Destiny Buttons */
.destiny-btn {
  background: linear-gradient(135deg, rgba(110, 193, 228, 0.2), rgba(58, 61, 83, 0.8));
  border: 1px solid #6EC1E4;
  color: #E6E6E6;
  padding: 12px 24px;
  border-radius: 6px;
  font-family: 'Orbitron', monospace;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.destiny-btn:hover {
  background: linear-gradient(135deg, rgba(110, 193, 228, 0.4), rgba(58, 61, 83, 0.9));
  box-shadow: 0 0 20px rgba(110, 193, 228, 0.3);
  transform: translateY(-2px);
}

.destiny-btn-cyan {
  border-color: #6EC1E4;
}

/* Transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Empty State */
.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}

.empty-icon {
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 0.5; }
  50% { opacity: 0.8; }
}
</style>