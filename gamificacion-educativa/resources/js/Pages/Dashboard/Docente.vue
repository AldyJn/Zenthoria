<!-- resources/js/Pages/Dashboard/Docente.vue -->
<template>
  <DestinyLayout>
    <!-- Starmap Header -->
    <div class="starmap-header">
      <div class="hud-container">
        <div class="professor-badge">
          <div class="badge-glow"></div>
          <div class="badge-icon">
            <i class="icon-star"></i>
          </div>
          <div class="badge-info">
            <h1 class="professor-name">{{ $page.props.auth.user.nombre }}</h1>
            <p class="professor-title">COMANDANTE ACADÉMICO</p>
          </div>
        </div>
        
        <!-- Stats Cards Flotantes -->
        <div class="floating-stats">
          <div class="stat-card" v-for="stat in statsCards" :key="stat.key">
            <div class="stat-border"></div>
            <div class="stat-glow"></div>
            <div class="stat-content">
              <div class="stat-icon">
                <i :class="stat.icon"></i>
              </div>
              <div class="stat-data">
                <span class="stat-number">{{ stat.value }}</span>
                <span class="stat-label">{{ stat.label }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Starmap Main -->
    <div class="starmap-container">
      <!-- Background Particles -->
      <div class="space-particles">
        <div v-for="n in 50" :key="n" class="particle" 
             :style="getParticleStyle()"></div>
      </div>

      <!-- Constellation Grid -->
      <div class="constellation-grid">
        <!-- Clase Nodes -->
        <div v-for="clase in clases" :key="clase.id" 
             class="class-node-container"
             :style="getNodePosition(clase.id)">
          
          <!-- Node Connection Lines -->
          <svg class="connection-lines">
            <line v-for="connection in getConnections(clase.id)" 
                  :key="connection.id"
                  :x1="connection.x1" :y1="connection.y1"
                  :x2="connection.x2" :y2="connection.y2"
                  class="connection-line" />
          </svg>

          <!-- Main Class Node -->
          <div class="class-node" 
               :class="getNodeClass(clase)"
               @click="selectClass(clase)"
               @mouseenter="showClassPreview(clase)"
               @mouseleave="hideClassPreview">
            
            <!-- Node Glow Effect -->
            <div class="node-glow"></div>
            
            <!-- Node Core -->
            <div class="node-core">
              <div class="node-ring"></div>
              <div class="node-center">
                <i class="node-icon mdi mdi-google-classroom"></i>
              </div>
              
              <!-- Progress Ring -->
              <svg class="progress-ring" width="80" height="80">
                <circle cx="40" cy="40" r="35" 
                        class="progress-ring-background"/>
                <circle cx="40" cy="40" r="35" 
                        class="progress-ring-progress"
                        :stroke-dasharray="circumference"
                        :stroke-dashoffset="getProgressOffset(clase.completion || 0)"/>
              </svg>
            </div>

            <!-- Node Label -->
            <div class="node-label">
              <span class="node-name">{{ clase.nombre }}</span>
              <span class="node-details">{{ clase.estudiantes_count || 0 }} ESTUDIANTES</span>
            </div>
          </div>

          <!-- Hover Preview Card -->
          <transition name="preview-fade">
            <div v-if="hoveredClass === clase.id" class="class-preview-card">
              <div class="preview-border"></div>
              <div class="preview-content">
                <h3 class="preview-title">{{ clase.nombre }}</h3>
                <div class="preview-stats">
                  <div class="preview-stat">
                    <span class="stat-icon">⚡</span>
                    <span>{{ clase.asistencia_promedio || 0 }}% Asistencia</span>
                  </div>
                  <div class="preview-stat">
                    <span class="stat-icon">📋</span>
                    <span>{{ clase.tareas_pendientes || 0 }} Tareas Pendientes</span>
                  </div>
                  <div class="preview-stat">
                    <span class="stat-icon">🎯</span>
                    <span>Nivel Promedio: {{ clase.nivel_promedio || 'N/A' }}</span>
                  </div>
                </div>
                <div class="preview-action">
                  <button class="access-button">
                    <span>ACCEDER AL CENTRO DE COMANDO</span>
                    <i class="mdi mdi-arrow-right"></i>
                  </button>
                </div>
              </div>
            </div>
          </transition>
        </div>
      </div>

      <!-- Selected Class Detail Panel -->
      <transition name="panel-slide">
        <div v-if="selectedClass" class="class-detail-panel">
          <div class="panel-border"></div>
          <div class="panel-content">
            <div class="panel-header">
              <h2 class="panel-title">{{ selectedClass.nombre }}</h2>
              <button class="close-panel" @click="selectedClass = null">
                <i class="mdi mdi-close"></i>
              </button>
            </div>
            
            <div class="panel-body">
              <!-- Quick Actions -->
              <div class="quick-actions">
                <button class="action-btn primary" @click="openGrading">
                  <i class="mdi mdi-clipboard-check"></i>
                  <span>REVISAR ENTREGAS</span>
                </button>
                <button class="action-btn secondary" @click="openAttendance">
                  <i class="mdi mdi-account-check"></i>
                  <span>ASISTENCIA</span>
                </button>
                <button class="action-btn accent" @click="openReports">
                  <i class="mdi mdi-chart-line"></i>
                  <span>REPORTES</span>
                </button>
              </div>

              <!-- Students Grid -->
              <div class="students-grid">
                <h3 class="grid-title">CADETES ACTIVOS</h3>
                <div class="student-items">
                  <div v-for="student in selectedClass.estudiantes" 
                       :key="student.id" 
                       class="student-card">
                    <div class="student-avatar">
                      <img :src="student.avatar || '/images/default-avatar.png'" 
                           :alt="student.nombre">
                      <div class="level-badge">{{ student.nivel || 1 }}</div>
                    </div>
                    <div class="student-info">
                      <span class="student-name">{{ student.nombre }}</span>
                      <span class="student-class">{{ student.clase_rpg || 'Explorador' }}</span>
                    </div>
                    <div class="student-progress">
                      <div class="progress-bar">
                        <div class="progress-fill" 
                             :style="`width: ${student.experiencia_porcentaje || 0}%`"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </transition>
    </div>

    <!-- HUD Sidebar -->
    <div class="hud-sidebar">
      <div class="hud-border"></div>
      <nav class="hud-nav">
        <a v-for="item in navItems" 
           :key="item.key"
           :href="item.route"
           class="nav-item"
           :class="{ active: item.active }">
          <div class="nav-glow"></div>
          <i :class="item.icon"></i>
          <span class="nav-label">{{ item.label }}</span>
        </a>
      </nav>
    </div>

    <!-- Bottom Action Bar -->
    <div class="bottom-action-bar">
      <div class="action-group">
        <button class="action-btn-floating" @click="openXPDialog">
          <i class="mdi mdi-plus"></i>
          <span>XP</span>
        </button>
        <button class="action-btn-floating" @click="openBehaviorDialog">
          <i class="mdi mdi-account-alert"></i>
          <span>CONDUCTA</span>
        </button>
        <button class="action-btn-floating" @click="generateQR">
          <i class="mdi mdi-qrcode"></i>
          <span>QR</span>
        </button>
        <button class="action-btn-floating" @click="createTask">
          <i class="mdi mdi-plus-circle"></i>
          <span>TAREA</span>
        </button>
      </div>
    </div>
  </DestinyLayout>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import DestinyLayout from '@/Layouts/DestinyLayout.vue'

// Props
const props = defineProps({
  clases: {
    type: Array,
    default: () => []
  },
  estadisticas: {
    type: Object,
    default: () => ({
      total_clases: 0,
      total_estudiantes: 0,
      actividades_pendientes: 0,
      comportamientos_este_mes: 0
    })
  }
})

// Reactive data
const hoveredClass = ref(null)
const selectedClass = ref(null)
const circumference = 2 * Math.PI * 35

// Computed properties
const statsCards = computed(() => [
  {
    key: 'clases',
    icon: 'mdi mdi-google-classroom',
    value: props.estadisticas?.total_clases || 0,
    label: 'SECTORES ACTIVOS'
  },
  {
    key: 'estudiantes',
    icon: 'mdi mdi-account-group',
    value: props.estadisticas?.total_estudiantes || 0,
    label: 'CADETES TOTALES'
  },
  {
    key: 'pendientes',
    icon: 'mdi mdi-clipboard-alert',
    value: props.estadisticas?.actividades_pendientes || 0,
    label: 'MISIONES PENDIENTES'
  },
  {
    key: 'comportamientos',
    icon: 'mdi mdi-star-circle',
    value: props.estadisticas?.comportamientos_este_mes || 0,
    label: 'REGISTROS DEL MES'
  }
])

const navItems = [
  { key: 'dashboard', icon: 'mdi mdi-view-dashboard', label: 'PUENTE', route: '/dashboard', active: true },
  { key: 'classes', icon: 'mdi mdi-google-classroom', label: 'SECTORES', route: '/clases' },
  { key: 'reports', icon: 'mdi mdi-chart-line', label: 'INFORMES', route: '/reportes' },
  { key: 'config', icon: 'mdi mdi-cog', label: 'CONFIGURACIÓN', route: '/configuracion' }
]

// Methods
const getParticleStyle = () => {
  return {
    '--x': Math.random() * 100 + '%',
    '--y': Math.random() * 100 + '%',
    '--duration': (Math.random() * 20 + 10) + 's',
    '--delay': Math.random() * 5 + 's'
  }
}

const getNodePosition = (classId) => {
  // Distribute nodes in a constellation pattern
  const angle = (classId * 60) % 360
  const radius = 200 + (classId % 3) * 80
  const x = 50 + Math.cos(angle * Math.PI / 180) * radius / 10
  const y = 50 + Math.sin(angle * Math.PI / 180) * radius / 10
  
  return {
    left: x + '%',
    top: y + '%'
  }
}

const getNodeClass = (clase) => {
  const classes = ['class-node']
  if (clase.activo) classes.push('active')
  if (clase.alertas && clase.alertas > 0) classes.push('alert')
  if (clase.completion && clase.completion >= 80) classes.push('complete')
  return classes
}

const getProgressOffset = (completion) => {
  const completionValue = completion || 0
  return circumference - (completionValue / 100) * circumference
}

const getConnections = (classId) => {
  // Generate connection lines between related nodes
  return []
}

const selectClass = (clase) => {
  selectedClass.value = clase
}

const showClassPreview = (clase) => {
  hoveredClass.value = clase.id
}

const hideClassPreview = () => {
  hoveredClass.value = null
}

// Action methods
const openGrading = () => {
  if (selectedClass.value) {
    window.location.href = `/clases/${selectedClass.value.id}/actividades`
  }
}

const openAttendance = () => {
  if (selectedClass.value) {
    window.location.href = `/clases/${selectedClass.value.id}/asistencia`
  }
}

const openReports = () => {
  if (selectedClass.value) {
    window.location.href = `/reportes/clase/${selectedClass.value.id}/estadisticas`
  }
}

const openXPDialog = () => {
  // Open XP assignment modal
  console.log('Opening XP dialog')
}

const openBehaviorDialog = () => {
  // Open behavior registration modal
  console.log('Opening behavior dialog')
}

const generateQR = () => {
  // Generate QR code for class access
  console.log('Generating QR code')
}

const createTask = () => {
  // Open new task creation modal
  console.log('Creating new task')
}

</script>

<style scoped>
/* Destiny 2 Inspired Styling */
.starmap-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 120px;
  background: linear-gradient(180deg, rgba(27, 28, 41, 0.95) 0%, rgba(27, 28, 41, 0.7) 100%);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(199, 184, 138, 0.3);
  z-index: 100;
}

.hud-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 40px;
  height: 100%;
}

.professor-badge {
  display: flex;
  align-items: center;
  gap: 16px;
  position: relative;
}

.badge-glow {
  position: absolute;
  inset: -4px;
  background: linear-gradient(45deg, #C7B88A, #6EC1E4, #B6A1E4);
  border-radius: 12px;
  opacity: 0.6;
  filter: blur(8px);
  animation: pulse 2s ease-in-out infinite;
}

.badge-icon {
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, #3A3D53 0%, #2E2F3D 100%);
  border: 2px solid #C7B88A;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 2;
}

.icon-star {
  width: 24px;
  height: 24px;
  background: #C7B88A;
  clip-path: polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%);
}

.badge-info {
  color: #FFFFFF;
}

.professor-name {
  font-family: 'Orbitron', sans-serif;
  font-size: 24px;
  font-weight: 700;
  letter-spacing: 2px;
  text-transform: uppercase;
  margin: 0;
  text-shadow: 0 0 10px rgba(199, 184, 138, 0.5);
}

.professor-title {
  font-family: 'Exo 2', sans-serif;
  font-size: 12px;
  color: #6EC1E4;
  letter-spacing: 1px;
  margin: 4px 0 0 0;
}

.floating-stats {
  display: flex;
  gap: 24px;
}

.stat-card {
  position: relative;
  width: 160px;
  height: 80px;
  background: rgba(46, 47, 61, 0.8);
  backdrop-filter: blur(10px);
  border-radius: 8px;
  overflow: hidden;
}

.stat-border {
  position: absolute;
  inset: 0;
  padding: 1px;
  background: linear-gradient(45deg, #C7B88A, transparent, #6EC1E4);
  border-radius: 8px;
  mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  mask-composite: xor;
}

.stat-glow {
  position: absolute;
  inset: -2px;
  background: linear-gradient(45deg, #C7B88A, #6EC1E4);
  border-radius: 8px;
  opacity: 0.3;
  filter: blur(4px);
}

.stat-content {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  height: 100%;
}

.stat-icon {
  font-size: 24px;
  color: #C7B88A;
}

.stat-data {
  display: flex;
  flex-direction: column;
}

.stat-number {
  font-family: 'Orbitron', sans-serif;
  font-size: 24px;
  font-weight: 700;
  color: #FFFFFF;
  line-height: 1;
}

.stat-label {
  font-family: 'Exo 2', sans-serif;
  font-size: 10px;
  color: #6EC1E4;
  letter-spacing: 1px;
  text-transform: uppercase;
}

.starmap-container {
  position: relative;
  height: 100vh;
  padding-top: 120px;
  background: radial-gradient(ellipse at center, rgba(58, 61, 83, 0.3) 0%, rgba(27, 28, 41, 1) 100%);
  overflow: hidden;
}

.space-particles {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.particle {
  position: absolute;
  width: 2px;
  height: 2px;
  background: #C7B88A;
  border-radius: 50%;
  left: var(--x);
  top: var(--y);
  animation: twinkle var(--duration) var(--delay) infinite ease-in-out;
}

@keyframes twinkle {
  0%, 100% { opacity: 0.3; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.5); }
}

@keyframes pulse {
  0%, 100% { opacity: 0.6; }
  50% { opacity: 0.3; }
}

.constellation-grid {
  position: relative;
  width: 100%;
  height: 100%;
}

.class-node-container {
  position: absolute;
  transform: translate(-50%, -50%);
}

.class-node {
  position: relative;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.class-node:hover {
  transform: scale(1.1);
}

.node-glow {
  position: absolute;
  inset: -10px;
  background: radial-gradient(circle, rgba(199, 184, 138, 0.4) 0%, transparent 70%);
  border-radius: 50%;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.class-node:hover .node-glow {
  opacity: 1;
}

.node-core {
  width: 80px;
  height: 80px;
  position: relative;
}

.node-ring {
  position: absolute;
  inset: 0;
  border: 2px solid #C7B88A;
  border-radius: 50%;
  background: rgba(46, 47, 61, 0.9);
  backdrop-filter: blur(10px);
}

.node-center {
  position: absolute;
  inset: 20px;
  background: linear-gradient(135deg, #3A3D53 0%, #2E2F3D 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(199, 184, 138, 0.5);
}

.node-icon {
  font-size: 20px;
  color: #6EC1E4;
}

.progress-ring {
  position: absolute;
  inset: 0;
  transform: rotate(-90deg);
}

.progress-ring-background {
  fill: none;
  stroke: rgba(199, 184, 138, 0.2);
  stroke-width: 2;
}

.progress-ring-progress {
  fill: none;
  stroke: #C7B88A;
  stroke-width: 2;
  stroke-linecap: round;
  transition: stroke-dashoffset 0.5s ease;
  filter: drop-shadow(0 0 4px rgba(199, 184, 138, 0.8));
}

.node-label {
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  text-align: center;
  margin-top: 12px;
  white-space: nowrap;
}

.node-name {
  display: block;
  font-family: 'Orbitron', sans-serif;
  font-size: 12px;
  font-weight: 600;
  color: #FFFFFF;
  letter-spacing: 1px;
  text-transform: uppercase;
}

.node-details {
  display: block;
  font-family: 'Exo 2', sans-serif;
  font-size: 10px;
  color: #6EC1E4;
  letter-spacing: 0.5px;
  margin-top: 2px;
}

.class-node.active .progress-ring-progress {
  stroke: #6EC1E4;
}

.class-node.alert .node-ring {
  border-color: #FF6B6B;
  box-shadow: 0 0 20px rgba(255, 107, 107, 0.5);
}

.class-node.complete .progress-ring-progress {
  stroke: #4ECDC4;
}

.class-preview-card {
  position: absolute;
  top: -20px;
  left: 120px;
  width: 300px;
  background: rgba(46, 47, 61, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 12px;
  overflow: hidden;
  z-index: 50;
}

.preview-border {
  position: absolute;
  inset: 0;
  padding: 1px;
  background: linear-gradient(45deg, #C7B88A, #6EC1E4, #B6A1E4);
  border-radius: 12px;
  mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  mask-composite: xor;
}

.preview-content {
  position: relative;
  z-index: 2;
  padding: 20px;
}

.preview-title {
  font-family: 'Orbitron', sans-serif;
  font-size: 16px;
  font-weight: 700;
  color: #FFFFFF;
  letter-spacing: 1px;
  text-transform: uppercase;
  margin: 0 0 16px 0;
}

.preview-stats {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
}

.preview-stat {
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: 'Exo 2', sans-serif;
  font-size: 12px;
  color: #FFFFFF;
}

.stat-icon {
  font-size: 14px;
}

.access-button {
  width: 100%;
  padding: 12px 16px;
  background: linear-gradient(135deg, #6EC1E4 0%, #B6A1E4 100%);
  border: none;
  border-radius: 8px;
  color: #FFFFFF;
  font-family: 'Orbitron', sans-serif;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 1px;
  text-transform: uppercase;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  transition: all 0.3s ease;
}

.access-button:hover {
  background: linear-gradient(135deg, #5AB0D1 0%, #A388D1 100%);
  box-shadow: 0 4px 20px rgba(110, 193, 228, 0.4);
}

.preview-fade-enter-active,
.preview-fade-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.preview-fade-enter-from,
.preview-fade-leave-to {
  opacity: 0;
  transform: translateY(10px) scale(0.95);
}

.class-detail-panel {
  position: fixed;
  right: 0;
  top: 120px;
  bottom: 80px;
  width: 400px;
  background: rgba(46, 47, 61, 0.95);
  backdrop-filter: blur(20px);
  border-left: 1px solid rgba(199, 184, 138, 0.3);
  z-index: 80;
  overflow: hidden;
}

.panel-border {
  position: absolute;
  inset: 0;
  padding: 1px 0 1px 1px;
  background: linear-gradient(to bottom, #C7B88A, #6EC1E4, #B6A1E4);
  mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  mask-composite: xor;
}

.panel-content {
  position: relative;
  z-index: 2;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px;
  border-bottom: 1px solid rgba(199, 184, 138, 0.2);
}

.panel-title {
  font-family: 'Orbitron', sans-serif;
  font-size: 18px;
  font-weight: 700;
  color: #FFFFFF;
  letter-spacing: 1px;
  text-transform: uppercase;
  margin: 0;
}

.close-panel {
  width: 32px;
  height: 32px;
  background: transparent;
  border: 1px solid rgba(199, 184, 138, 0.5);
  border-radius: 50%;
  color: #C7B88A;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.close-panel:hover {
  background: rgba(199, 184, 138, 0.1);
  border-color: #C7B88A;
}

.panel-body {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
}

.quick-actions {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
}

.action-btn {
  flex: 1;
  padding: 12px 16px;
  border: none;
  border-radius: 8px;
  font-family: 'Orbitron', sans-serif;
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 1px;
  text-transform: uppercase;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  transition: all 0.3s ease;
}

.action-btn.primary {
  background: linear-gradient(135deg, #6EC1E4 0%, #B6A1E4 100%);
  color: #FFFFFF;
}

.action-btn.secondary {
  background: linear-gradient(135deg, #C7B88A 0%, #6EC1E4 100%);
  color: #FFFFFF;
}

.action-btn.accent {
  background: linear-gradient(135deg, #B6A1E4 0%, #C7B88A 100%);
  color: #FFFFFF;
}

.action-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 20px rgba(110, 193, 228, 0.3);
}

.action-btn i {
  font-size: 16px;
}

.students-grid {
  margin-top: 24px;
}

.grid-title {
  font-family: 'Orbitron', sans-serif;
  font-size: 14px;
  font-weight: 700;
  color: #C7B88A;
  letter-spacing: 1px;
  text-transform: uppercase;
  margin: 0 0 16px 0;
}

.student-items {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.student-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: rgba(58, 61, 83, 0.5);
  border-radius: 8px;
  border: 1px solid rgba(199, 184, 138, 0.2);
  transition: all 0.3s ease;
}

.student-card:hover {
  background: rgba(58, 61, 83, 0.8);
  border-color: rgba(199, 184, 138, 0.4);
}

.student-avatar {
  position: relative;
  width: 40px;
  height: 40px;
}

.student-avatar img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  border: 2px solid #6EC1E4;
}

.level-badge {
  position: absolute;
  bottom: -4px;
  right: -4px;
  width: 20px;
  height: 20px;
  background: linear-gradient(135deg, #C7B88A 0%, #6EC1E4 100%);
  border: 2px solid #1B1C29;
  border-radius: 50%;
  font-family: 'Orbitron', sans-serif;
  font-size: 10px;
  font-weight: 700;
  color: #FFFFFF;
  display: flex;
  align-items: center;
  justify-content: center;
}

.student-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.student-name {
  font-family: 'Exo 2', sans-serif;
  font-size: 12px;
  font-weight: 600;
  color: #FFFFFF;
}

.student-class {
  font-family: 'Exo 2', sans-serif;
  font-size: 10px;
  color: #6EC1E4;
  text-transform: uppercase;
}

.student-progress {
  width: 60px;
}

.progress-bar {
  width: 100%;
  height: 4px;
  background: rgba(199, 184, 138, 0.2);
  border-radius: 2px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(to right, #6EC1E4, #B6A1E4);
  border-radius: 2px;
  transition: width 0.3s ease;
}

.panel-slide-enter-active,
.panel-slide-leave-active {
  transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.panel-slide-enter-from,
.panel-slide-leave-to {
  transform: translateX(100%);
}

.hud-sidebar {
  position: fixed;
  left: 0;
  top: 120px;
  bottom: 80px;
  width: 80px;
  background: rgba(46, 47, 61, 0.8);
  backdrop-filter: blur(10px);
  border-right: 1px solid rgba(199, 184, 138, 0.3);
  z-index: 90;
}

.hud-border {
  position: absolute;
  top: 0;
  right: 0;
  width: 1px;
  height: 100%;
  background: linear-gradient(to bottom, transparent, #C7B88A, transparent);
}

.hud-nav {
  display: flex;
  flex-direction: column;
  padding: 20px 0;
  gap: 8px;
}

.nav-item {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 16px 8px;
  color: rgba(255, 255, 255, 0.6);
  text-decoration: none;
  transition: all 0.3s ease;
}

.nav-item:hover,
.nav-item.active {
  color: #FFFFFF;
}

.nav-glow {
  position: absolute;
  inset: 8px;
  background: linear-gradient(135deg, #6EC1E4, #B6A1E4);
  border-radius: 8px;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.nav-item:hover .nav-glow,
.nav-item.active .nav-glow {
  opacity: 0.2;
}

.nav-item i {
  font-size: 20px;
  position: relative;
  z-index: 2;
}

.nav-label {
  font-family: 'Exo 2', sans-serif;
  font-size: 8px;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  text-align: center;
  position: relative;
  z-index: 2;
}

.bottom-action-bar {
  position: fixed;
  bottom: 0;
  left: 80px;
  right: 0;
  height: 80px;
  background: rgba(46, 47, 61, 0.9);
  backdrop-filter: blur(15px);
  border-top: 1px solid rgba(199, 184, 138, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 90;
}

.action-group {
  display: flex;
  gap: 24px;
}

.action-btn-floating {
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, #3A3D53 0%, #2E2F3D 100%);
  border: 2px solid #C7B88A;
  border-radius: 50%;
  color: #6EC1E4;
  font-family: 'Orbitron', sans-serif;
  font-size: 8px;
  font-weight: 600;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  position: relative;
  transition: all 0.3s ease;
}

.action-btn-floating:hover {
  background: linear-gradient(135deg, #4A4D63 0%, #3E3F4D 100%);
  box-shadow: 0 0 20px rgba(199, 184, 138, 0.4);
  transform: translateY(-2px);
}

.action-btn-floating i {
  font-size: 16px;
}

/* Connection Lines */
.connection-lines {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: -1;
}

.connection-line {
  stroke: rgba(199, 184, 138, 0.3);
  stroke-width: 1;
  stroke-dasharray: 4 4;
  animation: dash 20s linear infinite;
}

@keyframes dash {
  to {
    stroke-dashoffset: -100;
  }
}

/* Responsive adjustments */
@media (max-width: 1200px) {
  .floating-stats {
    gap: 16px;
  }
  
  .stat-card {
    width: 140px;
  }
  
  .class-detail-panel {
    width: 350px;
  }
}

@media (max-width: 768px) {
  .hud-container {
    padding: 15px 20px;
  }
  
  .professor-name {
    font-size: 18px;
  }
  
  .floating-stats {
    gap: 12px;
  }
  
  .stat-card {
    width: 120px;
    height: 70px;
  }
  
  .stat-number {
    font-size: 18px;
  }
  
  .stat-label {
    font-size: 8px;
  }
  
  .class-detail-panel {
    width: 300px;
  }
  
  .hud-sidebar {
    width: 60px;
  }
  
  .bottom-action-bar {
    left: 60px;
  }
  
  .action-btn-floating {
    width: 50px;
    height: 50px;
    font-size: 7px;
  }
  
  .action-btn-floating i {
    font-size: 14px;
  }
}