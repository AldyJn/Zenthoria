<!-- resources/js/Pages/Dashboard/Estudiante.vue -->
<template>
  <Head title="Dashboard Estudiante" />

  <AuthenticatedLayout>
    <!-- Fondo animado estilo Destiny -->
    <div class="destiny-background"></div>
    
    <div class="min-h-screen relative overflow-hidden">
      <!-- Header flotante tipo HUD -->
      <div class="fixed top-6 left-1/2 transform -translate-x-1/2 z-30">
        <div class="destiny-panel px-8 py-4">
          <h1 class="destiny-title text-2xl text-center mb-2">
            TORRE DEL GUARDIÁN
          </h1>
          <p class="destiny-subtitle text-center text-sm">
            {{ $page.props.auth.user.nombre }} - GUARDIÁN
          </p>
        </div>
      </div>

      <!-- Panel lateral izquierdo - Stats del Guardián -->
      <div class="fixed left-6 top-1/2 transform -translate-y-1/2 z-20 space-y-4">
        <!-- XP y Monedas Totales -->
        <div class="destiny-panel p-6 w-64">
          <h3 class="destiny-subtitle text-sm mb-4">PODER TOTAL</h3>
          
          <div class="space-y-4">
            <!-- XP Total -->
            <div class="stat-row">
              <div class="stat-icon-small">
                <i class="mdi mdi-star text-xl text-blue-400"></i>
              </div>
              <div class="stat-info">
                <div class="stat-value-large">{{ totalExperience }}</div>
                <div class="stat-label-small">EXPERIENCIA TOTAL</div>
              </div>
            </div>
            
            <!-- Monedas Totales -->
            <div class="stat-row">
              <div class="stat-icon-small">
                <i class="mdi mdi-coin text-xl text-yellow-400"></i>
              </div>
              <div class="stat-info">
                <div class="stat-value-large">{{ totalCoins }}</div>
                <div class="stat-label-small">MONEDAS TOTALES</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Ranking -->
        <div class="destiny-panel p-6 w-64">
          <h3 class="destiny-subtitle text-sm mb-4">CLASIFICACIÓN</h3>
          
          <div v-if="ranking" class="space-y-3">
            <!-- Mi posición -->
            <div class="rank-item my-rank">
              <div class="rank-position">#{{ ranking.my_position }}</div>
              <div class="rank-info">
                <div class="rank-name">TÚ</div>
                <div class="rank-xp">{{ ranking.my_xp }} XP</div>
              </div>
            </div>
            
            <!-- Top 3 -->
            <div class="divider"></div>
            <div 
              v-for="(player, index) in ranking.top_players" 
              :key="player.id"
              class="rank-item"
              :class="{
                'rank-first': index === 0,
                'rank-second': index === 1,
                'rank-third': index === 2
              }"
            >
              <div class="rank-position">#{{ index + 1 }}</div>
              <div class="rank-info">
                <div class="rank-name">{{ player.name }}</div>
                <div class="rank-xp">{{ player.xp }} XP</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Logros Recientes -->
        <div class="destiny-panel p-6 w-64">
          <h3 class="destiny-subtitle text-sm mb-4">LOGROS RECIENTES</h3>
          
          <div class="space-y-3">
            <div 
              v-for="achievement in recentAchievements" 
              :key="achievement.id"
              class="achievement-badge"
            >
              <div class="achievement-icon">
                <i :class="achievement.icon" class="text-lg"></i>
              </div>
              <div class="achievement-info">
                <div class="achievement-name">{{ achievement.name }}</div>
                <div class="achievement-date">{{ formatDate(achievement.date) }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Área central - Personaje principal y clases orbitando -->
      <div class="flex-1 flex items-center justify-center pt-32 pb-24">
        <div v-if="clases.length === 0" class="empty-guardian-state">
          <div class="destiny-panel p-12 text-center max-w-lg">
            <div class="empty-guardian-icon mb-6">
              <i class="mdi mdi-account-search text-8xl text-purple-400 opacity-50"></i>
            </div>
            <h3 class="destiny-title text-xl mb-4">GUARDIÁN SIN MISIONES</h3>
            <p class="destiny-body text-gray-400 mb-8">
              Tu luz permanece dormida. Únete a una clase para despertar tu potencial como Guardián.
            </p>
            <button 
              @click="$inertia.visit(route('clases.unirse.form'))"
              class="destiny-btn destiny-btn-purple text-lg px-8 py-4"
            >
              <i class="mdi mdi-plus mr-2"></i>
              UNIRSE A MISIÓN
            </button>
          </div>
        </div>

        <div v-else class="guardian-constellation">
          <!-- Personaje central -->
          <div class="guardian-center">
            <div 
              v-for="(clase, index) in clases" 
              :key="clase.clase.id"
              v-show="selectedClassIndex === index"
              class="guardian-character"
            >
              <!-- Avatar del personaje -->
              <div class="character-avatar">
                <div class="character-frame">
                  <img 
                    v-if="clase.personaje?.imagen_perfil"
                    :src="clase.personaje.imagen_perfil"
                    :alt="clase.personaje.nombre"
                    class="character-image"
                  />
                  <div v-else class="character-placeholder">
                    <i class="mdi mdi-sword text-6xl text-purple-400"></i>
                  </div>
                  
                  <!-- Nivel -->
                  <div class="character-level">
                    {{ clase.personaje?.nivel || 1 }}
                  </div>
                </div>
                
                <!-- Barra circular de XP -->
                <svg class="xp-ring" viewBox="0 0 160 160">
                  <circle
                    cx="80"
                    cy="80"
                    r="75"
                    fill="none"
                    stroke="rgba(182, 161, 228, 0.3)"
                    stroke-width="4"
                  />
                  <circle
                    cx="80"
                    cy="80"
                    r="75"
                    fill="none"
                    stroke="#B6A1E4"
                    stroke-width="4"
                    stroke-linecap="round"
                    :stroke-dasharray="471"
                    :stroke-dashoffset="471 - (471 * (clase.personaje?.experiencia_nivel_actual || 0) / (clase.personaje?.experiencia_para_nivel || 100))"
                    class="xp-progress"
                  />
                </svg>
              </div>
              
              <!-- Info del personaje -->
              <div class="character-info">
                <h3 class="destiny-title text-xl mb-1">
                  {{ clase.personaje?.nombre || 'Guardián Sin Nombre' }}
                </h3>
                <p class="destiny-subtitle text-sm mb-4">
                  {{ clase.personaje?.clase_rpg || 'Clase RPG' }} - NIVEL {{ clase.personaje?.nivel || 1 }}
                </p>
                
                <!-- Stats -->
                <div class="character-stats">
                  <div class="stat-item">
                    <span class="stat-value">{{ clase.personaje?.experiencia || 0 }}</span>
                    <span class="stat-name">XP</span>
                  </div>
                  <div class="stat-item">
                    <span class="stat-value">{{ clase.saldo_monedas || 0 }}</span>
                    <span class="stat-name">MONEDAS</span>
                  </div>
                  <div class="stat-item" v-if="clase.promedio_notas">
                    <span class="stat-value">{{ clase.promedio_notas.toFixed(1) }}</span>
                    <span class="stat-name">PROMEDIO</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Selector de clase -->
            <div v-if="clases.length > 1" class="class-selector">
              <button
                v-for="(clase, index) in clases"
                :key="clase.clase.id"
                @click="selectedClassIndex = index"
                class="class-tab"
                :class="{ active: selectedClassIndex === index }"
              >
                {{ clase.clase.nombre }}
              </button>
            </div>
          </div>

          <!-- Nodos orbitando - Clases -->
          <div class="orbital-classes">
            <div
              v-for="(clase, index) in clases"
              :key="clase.clase.id"
              class="orbital-node"
              :style="getOrbitalPosition(index, clases.length)"
              @click="$inertia.visit(route('clases.show', clase.clase.id))"
            >
              <div class="orbital-circle" :class="{ active: selectedClassIndex === index }">
                <div class="orbital-inner">
                  <i class="mdi mdi-google-classroom text-2xl"></i>
                  <div class="orbital-label">{{ clase.clase.nombre.slice(0, 3) }}</div>
                </div>
                
                <!-- Indicador de actividades pendientes -->
                <div v-if="clase.actividades_pendientes > 0" class="pending-indicator">
                  {{ clase.actividades_pendientes }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Panel derecho - Actividades y notificaciones -->
      <div class="fixed right-6 top-1/2 transform -translate-y-1/2 z-20 space-y-4">
        <!-- Actividades próximas -->
        <div class="destiny-panel p-6 w-80">
          <h3 class="destiny-subtitle text-sm mb-4 flex items-center">
            <i class="mdi mdi-clock-alert mr-2"></i>
            MISIONES URGENTES
          </h3>
          
          <div v-if="actividades_proximas.length === 0" class="text-center py-4">
            <i class="mdi mdi-check-circle text-3xl text-green-400 mb-2"></i>
            <p class="text-sm text-gray-400">Todas las misiones completadas</p>
          </div>
          
          <div v-else class="space-y-3 max-h-64 overflow-y-auto">
            <div
              v-for="actividad in actividades_proximas"
              :key="actividad.id"
              class="mission-card"
              :class="getMissionPriority(actividad.fecha_entrega)"
              @click="$inertia.visit(route('actividades.show', actividad.id))"
            >
              <div class="mission-header">
                <div class="mission-title">{{ actividad.titulo }}</div>
                <div class="mission-class">{{ actividad.clase.nombre }}</div>
              </div>
              
              <div class="mission-time">
                <i class="mdi mdi-clock mr-1"></i>
                {{ getTimeRemaining(actividad.fecha_entrega) }}
              </div>
              
              <div class="mission-rewards">
                <span class="reward-item">
                  <i class="mdi mdi-star text-blue-400"></i>
                  {{ actividad.puntos_experiencia }}
                </span>
                <span class="reward-item">
                  <i class="mdi mdi-coin text-yellow-400"></i>
                  {{ actividad.puntos_moneda }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Notificaciones tipo Torre -->
        <div class="destiny-panel p-6 w-80">
          <h3 class="destiny-subtitle text-sm mb-4 flex items-center">
            <i class="mdi mdi-bell mr-2"></i>
            TRANSMISIONES DE LA TORRE
          </h3>
          
          <div class="space-y-3 max-h-48 overflow-y-auto">
            <div
              v-for="notification in towerNotifications"
              :key="notification.id"
              class="tower-message"
              :class="notification.type"
            >
              <div class="message-icon">
                <i :class="notification.icon"></i>
              </div>
              <div class="message-content">
                <div class="message-title">{{ notification.title }}</div>
                <div class="message-text">{{ notification.message }}</div>
                <div class="message-time">{{ formatDate(notification.time) }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Barra flotante inferior - Acciones del Guardián -->
      <div class="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-20">
        <div class="destiny-panel p-4">
          <div class="flex items-center space-x-6">
            <button 
              @click="$inertia.visit(route('clases.unirse.form'))"
              class="guardian-action"
              title="Unirse a Nueva Clase"
            >
              <i class="mdi mdi-plus text-2xl text-green-400"></i>
            </button>
            
            <button class="guardian-action" title="Ver Perfil">
              <i class="mdi mdi-account text-2xl text-cyan-400"></i>
            </button>
            
            <button class="guardian-action" title="Inventario">
              <i class="mdi mdi-package-variant text-2xl text-purple-400"></i>
            </button>
            
            <button class="guardian-action" title="Configuración">
              <i class="mdi mdi-cog text-2xl text-gray-400"></i>
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
import { ref, computed } from 'vue'

defineProps({
  clases: Array,
  actividades_proximas: Array,
})

const selectedClassIndex = ref(0)

// Datos computados
const totalExperience = computed(() => {
  return clases.reduce((total, clase) => total + (clase.personaje?.experiencia || 0), 0)
})

const totalCoins = computed(() => {
  return clases.reduce((total, clase) => total + (clase.saldo_monedas || 0), 0)
})

// Datos mock para demo
const ranking = ref({
  my_position: 3,
  my_xp: 1250,
  top_players: [
    { id: 1, name: 'IKORA REY', xp: 2100 },
    { id: 2, name: 'CAYDE-6', xp: 1800 },
    { id: 3, name: 'ZAVALA', xp: 1650 }
  ]
})

const recentAchievements = ref([
  { id: 1, name: 'Primera Tarea', icon: 'mdi mdi-trophy text-gold-400', date: '2025-01-01' },
  { id: 2, name: 'Participación', icon: 'mdi mdi-star text-blue-400', date: '2025-01-02' },
  { id: 3, name: 'Trabajo en Equipo', icon: 'mdi mdi-account-group text-green-400', date: '2025-01-03' }
])

const towerNotifications = ref([
  {
    id: 1,
    type: 'info',
    icon: 'mdi mdi-information',
    title: 'Nueva misión disponible',
    message: 'El Instructor ha publicado una nueva tarea en Matemáticas.',
    time: '2025-01-02T10:30:00'
  },
  {
    id: 2,
    type: 'warning',
    icon: 'mdi mdi-alert',
    title: 'Misión próxima a vencer',
    message: 'La tarea de Física vence en 2 horas.',
    time: '2025-01-02T08:00:00'
  },
  {
    id: 3,
    type: 'success',
    icon: 'mdi mdi-check-circle',
    title: 'Subiste de nivel',
    message: '¡Felicidades! Has alcanzado el nivel 15.',
    time: '2025-01-01T15:20:00'
  }
])

// Métodos
const getOrbitalPosition = (index, total) => {
  const radius = 180
  const angle = (index / total) * 2 * Math.PI - Math.PI / 2
  const x = 50 + (radius / 10) * Math.cos(angle)
  const y = 50 + (radius / 10) * Math.sin(angle)
  
  return {
    position: 'absolute',
    left: `${x}%`,
    top: `${y}%`,
    transform: 'translate(-50%, -50%)',
  }
}

const getMissionPriority = (fechaEntrega) => {
  const now = new Date()
  const entrega = new Date(fechaEntrega)
  const hoursRemaining = (entrega - now) / (1000 * 60 * 60)
  
  if (hoursRemaining < 2) return 'critical'
  if (hoursRemaining < 24) return 'urgent'
  return 'normal'
}

const getTimeRemaining = (fechaEntrega) => {
  const now = new Date()
  const entrega = new Date(fechaEntrega)
  const diff = entrega - now
  
  if (diff < 0) return 'VENCIDA'
  
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  
  if (hours < 1) return `${minutes}m`
  if (hours < 24) return `${hours}h ${minutes}m`
  
  const days = Math.floor(hours / 24)
  return `${days}d ${hours % 24}h`
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('es-ES', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>

<style scoped>
/* Hereda estilos base del dashboard profesor */
@import url('./profesor-destiny-styles.css');

/* Específicos del estudiante */
.guardian-constellation {
  width: 80vw;
  height: 60vh;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.guardian-center {
  position: relative;
  z-index: 10;
}

.guardian-character {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.character-avatar {
  position: relative;
  margin-bottom: 24px;
}

.character-frame {
  width: 140px;
  height: 140px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(182, 161, 228, 0.3), rgba(46, 47, 61, 0.9));
  border: 3px solid #B6A1E4;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 3;
  overflow: hidden;
}

.character-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
}

.character-placeholder {
  color: #B6A1E4;
}

.character-level {
  position: absolute;
  bottom: -5px;
  right: -5px;
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #B6A1E4, #6EC1E4);
  border: 2px solid #1B1C29;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Orbitron', monospace;
  font-weight: 700;
  font-size: 1rem;
  color: #1B1C29;
  z-index: 4;
}

.xp-ring {
  position: absolute;
  top: -15px;
  left: -15px;
  width: 170px;
  height: 170px;
  z-index: 2;
}

.xp-progress {
  transition: stroke-dashoffset 1s ease;
  transform-origin: center;
  transform: rotate(-90deg);
}

.character-info {
  max-width: 300px;
}

.character-stats {
  display: flex;
  gap: 24px;
  justify-content: center;
  margin-top: 16px;
}

.stat-item {
  text-align: center;
}

.stat-value {
  display: block;
  font-family: 'Orbitron', monospace;
  font-size: 1.25rem;
  font-weight: 700;
  color: #E6E6E6;
}

.stat-name {
  display: block;
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #8C8C8C;
  margin-top: 4px;
}

.class-selector {
  display: flex;
  gap: 8px;
  margin-top: 24px;
  justify-content: center;
}

.class-tab {
  padding: 8px 16px;
  background: rgba(46, 47, 61, 0.6);
  border: 1px solid rgba(110, 193, 228, 0.3);
  border-radius: 4px;
  color: #B8B8B8;
  font-size: 0.75rem;
  text-transform: uppercase;
  cursor: pointer;
  transition: all 0.3s ease;
}

.class-tab.active,
.class-tab:hover {
  background: rgba(110, 193, 228, 0.2);
  border-color: #6EC1E4;
  color: #6EC1E4;
}

/* Nodos orbitales */
.orbital-classes {
  position: absolute;
  width: 100%;
  height: 100%;
}

.orbital-node {
  cursor: pointer;
}

.orbital-circle {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(110, 193, 228, 0.2), rgba(46, 47, 61, 0.8));
  border: 2px solid rgba(110, 193, 228, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  position: relative;
}

.orbital-circle:hover,
.orbital-circle.active {
  transform: scale(1.1);
  border-color: #6EC1E4;
  box-shadow: 0 0 20px rgba(110, 193, 228, 0.4);
}

.orbital-inner {
  text-align: center;
  color: #6EC1E4;
}

.orbital-label {
  font-size: 0.6rem;
  font-weight: 600;
  text-transform: uppercase;
  margin-top: 4px;
}

.pending-indicator {
  position: absolute;
  top: -8px;
  right: -8px;
  width: 24px;
  height: 24px;
  background: #EF4444;
  border: 2px solid #1B1C29;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 700;
  color: white;
}

/* Stats laterales */
.stat-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.stat-icon-small {
  width: 40px;
  height: 40px;
  border: 1px solid rgba(110, 193, 228, 0.3);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-info {
  flex: 1;
}

.stat-value-large {
  font-family: 'Orbitron', monospace;
  font-size: 1.5rem;
  font-weight: 700;
  color: #E6E6E6;
}

.stat-label-small {
  font-size: 0.7rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #8C8C8C;
}

/* Ranking */
.rank-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px;
  border-radius: 6px;
  transition: all 0.3s ease;
}

.rank-item.my-rank {
  background: rgba(110, 193, 228, 0.1);
  border: 1px solid rgba(110, 193, 228, 0.3);
}

.rank-item.rank-first .rank-position {
  color: #FFD700;
}

.rank-item.rank-second .rank-position {
  color: #C0C0C0;
}

.rank-item.rank-third .rank-position {
  color: #CD7F32;
}

.rank-position {
  font-family: 'Orbitron', monospace;
  font-weight: 700;
  min-width: 32px;
}

.rank-info {
  flex: 1;
}

.rank-name {
  font-size: 0.85rem;
  font-weight: 600;
  color: #E6E6E6;
}

.rank-xp {
  font-size: 0.7rem;
  color: #8C8C8C;
}

.divider {
  height: 1px;
  background: rgba(110, 193, 228, 0.2);
  margin: 8px 0;
}

/* Logros */
.achievement-badge {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px;
  background: rgba(199, 184, 138, 0.1);
  border: 1px solid rgba(199, 184, 138, 0.3);
  border-radius: 6px;
}

.achievement-icon {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.achievement-name {
  font-size: 0.8rem;
  font-weight: 600;
  color: #E6E6E6;
}

.achievement-date {
  font-size: 0.7rem;
  color: #8C8C8C;
}

/* Misiones */
.mission-card {
  padding: 12px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
  border-left: 4px solid transparent;
}

.mission-card.normal {
  background: rgba(110, 193, 228, 0.1);
  border-left-color: #6EC1E4;
}

.mission-card.urgent {
  background: rgba(251, 191, 36, 0.1);
  border-left-color: #FBB804;
}

.mission-card.critical {
  background: rgba(239, 68, 68, 0.1);
  border-left-color: #EF4444;
}

.mission-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.mission-header {
  margin-bottom: 8px;
}

.mission-title {
  font-weight: 600;
  color: #E6E6E6;
  font-size: 0.9rem;
  margin-bottom: 2px;
}

.mission-class {
  font-size: 0.75rem;
  color: #8C8C8C;
}

.mission-time {
  font-size: 0.8rem;
  color: #C7B88A;
  margin-bottom: 8px;
}

.mission-rewards {
  display: flex;
  gap: 12px;
}

.reward-item {
  font-size: 0.75rem;
  color: #B8B8B8;
}

/* Notificaciones Torre */
.tower-message {
  display: flex;
  gap: 12px;
  padding: 12px;
  border-radius: 6px;
  border-left: 4px solid transparent;
}

.tower-message.info {
  background: rgba(110, 193, 228, 0.1);
  border-left-color: #6EC1E4;
}

.tower-message.warning {
  background: rgba(251, 191, 36, 0.1);
  border-left-color: #FBB804;
}

.tower-message.success {
  background: rgba(34, 197, 94, 0.1);
  border-left-color: #22C55E;
}

.message-icon {
  color: inherit;
  margin-top: 2px;
}

.message-title {
  font-weight: 600;
  color: #E6E6E6;
  font-size: 0.85rem;
  margin-bottom: 2px;
}

.message-text {
  font-size: 0.8rem;
  color: #B8B8B8;
  margin-bottom: 4px;
}

.message-time {
  font-size: 0.7rem;
  color: #8C8C8C;
}

/* Acciones del Guardián */
.guardian-action {
  width: 50px;
  height: 50px;
  border: 1px solid rgba(182, 161, 228, 0.3);
  border-radius: 50%;
  background: rgba(46, 47, 61, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.guardian-action:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
  border-color: #B6A1E4;
}

/* Empty State */
.empty-guardian-state {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}

.empty-guardian-icon {
  animation: pulse 2s ease-in-out infinite;
}

.destiny-btn-purple {
  border-color: #B6A1E4;
  background: linear-gradient(135deg, rgba(182, 161, 228, 0.2), rgba(58, 61, 83, 0.8));
}

.destiny-btn-purple:hover {
  background: linear-gradient(135deg, rgba(182, 161, 228, 0.4), rgba(58, 61, 83, 0.9));
  box-shadow: 0 0 20px rgba(182, 161, 228, 0.3);
}
</style>