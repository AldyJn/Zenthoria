<!-- resources/js/Layouts/AuthenticatedLayout.vue -->
<template>
  <div class="destiny-app">
    <!-- Fondo base con partículas -->
    <div class="destiny-background-base"></div>
    
    <!-- HUD Superior -->
    <div class="destiny-hud-top">
      <div class="hud-left">
        <!-- Logo/Título -->
        <div class="destiny-logo">
          <div class="logo-icon">
            <i class="mdi mdi-gamepad-variant text-3xl"></i>
          </div>
          <div class="logo-text">
            <h1 class="destiny-title text-lg">EDUAPP</h1>
            <p class="destiny-subtitle text-xs">GAMIFICADA</p>
          </div>
        </div>
      </div>

      <!-- Centro - Slot para header personalizado -->
      <div class="hud-center">
        <slot name="header"></slot>
      </div>

      <!-- Derecha - User info y controles -->
      <div class="hud-right">
        <!-- Indicadores de estado -->
        <div class="status-indicators">
          <!-- Notificaciones -->
          <div class="status-item">
            <button class="status-button" @click="toggleNotifications">
              <i class="mdi mdi-bell text-xl"></i>
              <div v-if="notificationCount > 0" class="notification-badge">
                {{ notificationCount }}
              </div>
            </button>
          </div>

          <!-- Configuración -->
          <div class="status-item">
            <button class="status-button" @click="toggleSettings">
              <i class="mdi mdi-cog text-xl"></i>
            </button>
          </div>
        </div>

        <!-- User Avatar y menú -->
        <div class="user-section" @click="toggleUserMenu">
          <div class="user-avatar">
            <img 
              v-if="$page.props.auth.user.avatar_url"
              :src="$page.props.auth.user.avatar_url"
              :alt="$page.props.auth.user.nombre"
              class="avatar-image"
            />
            <div v-else class="avatar-placeholder">
              <i class="mdi mdi-account text-xl"></i>
            </div>
          </div>
          
          <div class="user-info">
            <div class="user-name">{{ $page.props.auth.user.nombre }}</div>
            <div class="user-type">
              {{ $page.props.auth.user.tipo_usuario === 'docente' ? 'INSTRUCTOR' : 'GUARDIÁN' }}
            </div>
          </div>
          
          <div class="user-dropdown-arrow">
            <i class="mdi mdi-chevron-down"></i>
          </div>
        </div>
      </div>
    </div>

    <!-- Menú de usuario flotante -->
    <Transition name="slide-down">
      <div v-if="showUserMenu" class="user-menu-overlay" @click="closeUserMenu">
        <div class="user-menu" @click.stop>
          <div class="destiny-panel p-6">
            <!-- Header del menú -->
            <div class="menu-header">
              <div class="user-avatar-large">
                <img 
                  v-if="$page.props.auth.user.avatar_url"
                  :src="$page.props.auth.user.avatar_url"
                  :alt="$page.props.auth.user.nombre"
                  class="avatar-image"
                />
                <div v-else class="avatar-placeholder">
                  <i class="mdi mdi-account text-3xl"></i>
                </div>
              </div>
              <div class="menu-user-info">
                <h3 class="destiny-title text-lg">{{ $page.props.auth.user.nombre }}</h3>
                <p class="destiny-subtitle text-sm">
                  {{ $page.props.auth.user.tipo_usuario === 'docente' ? 'INSTRUCTOR' : 'GUARDIÁN' }}
                </p>
                <p class="text-xs text-gray-400">{{ $page.props.auth.user.correo }}</p>
              </div>
            </div>

            <!-- Opciones del menú -->
            <div class="menu-options">
              <button 
                @click="navigateToProfile"
                class="menu-option"
              >
                <i class="mdi mdi-account mr-3"></i>
                <span>Mi Perfil</span>
                <i class="mdi mdi-chevron-right ml-auto"></i>
              </button>
              
              <button 
                @click="navigateToDashboard"
                class="menu-option"
              >
                <i class="mdi mdi-view-dashboard mr-3"></i>
                <span>Dashboard</span>
                <i class="mdi mdi-chevron-right ml-auto"></i>
              </button>
              
              <button 
                v-if="$page.props.auth.user.tipo_usuario === 'docente'"
                @click="navigateToClasses"
                class="menu-option"
              >
                <i class="mdi mdi-google-classroom mr-3"></i>
                <span>Mis Clases</span>
                <i class="mdi mdi-chevron-right ml-auto"></i>
              </button>
              
              <button 
                v-if="$page.props.auth.user.tipo_usuario === 'estudiante'"
                @click="navigateToJoinClass"
                class="menu-option"
              >
                <i class="mdi mdi-plus-circle mr-3"></i>
                <span>Unirse a Clase</span>
                <i class="mdi mdi-chevron-right ml-auto"></i>
              </button>

              <div class="menu-divider"></div>
              
              <button 
                @click="toggleTheme"
                class="menu-option"
              >
                <i :class="isDark ? 'mdi mdi-weather-sunny' : 'mdi mdi-weather-night'" class="mr-3"></i>
                <span>{{ isDark ? 'Modo Claro' : 'Modo Oscuro' }}</span>
                <i class="mdi mdi-chevron-right ml-auto"></i>
              </button>
              
              <button 
                @click="logout"
                class="menu-option danger"
              >
                <i class="mdi mdi-logout mr-3"></i>
                <span>Cerrar Sesión</span>
                <i class="mdi mdi-chevron-right ml-auto"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Panel de notificaciones -->
    <Transition name="slide-left">
      <div v-if="showNotifications" class="notifications-overlay" @click="closeNotifications">
        <div class="notifications-panel" @click.stop>
          <div class="destiny-panel p-6 h-full">
            <div class="panel-header">
              <h3 class="destiny-title text-lg mb-2">TRANSMISIONES</h3>
              <p class="destiny-subtitle text-sm">Mensajes de la Torre</p>
            </div>
            
            <div class="notifications-content">
              <div v-if="notifications.length === 0" class="empty-notifications">
                <i class="mdi mdi-bell-off text-4xl text-gray-500 mb-4"></i>
                <p class="text-gray-400">No hay transmisiones</p>
              </div>
              
              <div v-else class="notifications-list">
                <div 
                  v-for="notification in notifications"
                  :key="notification.id"
                  class="notification-item"
                  :class="{ unread: !notification.read }"
                >
                  <div class="notification-icon">
                    <i :class="getNotificationIcon(notification.type)"></i>
                  </div>
                  <div class="notification-content">
                    <div class="notification-title">{{ notification.title }}</div>
                    <div class="notification-message">{{ notification.message }}</div>
                    <div class="notification-time">{{ formatTime(notification.created_at) }}</div>
                  </div>
                  <div v-if="!notification.read" class="notification-unread-dot"></div>
                </div>
              </div>
            </div>
            
            <div class="panel-footer">
              <button class="destiny-btn w-full">
                Ver Todas las Transmisiones
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Contenido principal -->
    <main class="destiny-main">
      <!-- Flash Messages flotantes -->
      <div class="flash-messages">
        <Transition name="fade">
          <div 
            v-if="$page.props.flash?.success"
            class="flash-message success"
          >
            <i class="mdi mdi-check-circle mr-3"></i>
            {{ $page.props.flash.success }}
          </div>
        </Transition>
        
        <Transition name="fade">
          <div 
            v-if="$page.props.flash?.error"
            class="flash-message error"
          >
            <i class="mdi mdi-alert-circle mr-3"></i>
            {{ $page.props.flash.error }}
          </div>
        </Transition>
        
        <Transition name="fade">
          <div 
            v-if="$page.props.flash?.info"
            class="flash-message info"
          >
            <i class="mdi mdi-information mr-3"></i>
            {{ $page.props.flash.info }}
          </div>
        </Transition>
      </div>

      <!-- Slot principal del contenido -->
      <slot />
    </main>

    <!-- Footer HUD -->
    <div class="destiny-hud-bottom">
      <div class="hud-bottom-content">
        <div class="copyright">
          &copy; {{ new Date().getFullYear() }} EduApp Gamificada - Sistema Educativo del Futuro
        </div>
        <div class="version">
          v1.0.0 - BETA
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { router } from '@inertiajs/vue3'
import { ref, computed, onMounted } from 'vue'

// Estados reactivos
const showUserMenu = ref(false)
const showNotifications = ref(false)
const showSettings = ref(false)
const isDark = ref(true)
const notificationCount = ref(3)
const notifications = ref([
  {
    id: 1,
    type: 'info',
    title: 'Nueva Misión Disponible',
    message: 'El Instructor ha publicado una nueva tarea en Matemáticas Avanzadas.',
    created_at: '2025-01-02T10:30:00',
    read: false
  },
  {
    id: 2,
    type: 'warning',
    title: 'Misión Próxima a Vencer',
    message: 'La tarea de Física Cuántica vence en 2 horas.',
    created_at: '2025-01-02T08:00:00',
    read: false
  },
  {
    id: 3,
    type: 'success',
    title: 'Subiste de Nivel',
    message: '¡Felicidades! Tu personaje ha alcanzado el nivel 15.',
    created_at: '2025-01-01T15:20:00',
    read: true
  }
])

// Métodos
const toggleUserMenu = () => {
  showUserMenu.value = !showUserMenu.value
  showNotifications.value = false
  showSettings.value = false
}

const closeUserMenu = () => {
  showUserMenu.value = false
}

const toggleNotifications = () => {
  showNotifications.value = !showNotifications.value
  showUserMenu.value = false
  showSettings.value = false
}

const closeNotifications = () => {
  showNotifications.value = false
}

const toggleSettings = () => {
  showSettings.value = !showSettings.value
  showUserMenu.value = false
  showNotifications.value = false
}

const toggleTheme = () => {
  isDark.value = !isDark.value
  // Aquí puedes implementar la lógica del tema
  document.documentElement.classList.toggle('dark', isDark.value)
  localStorage.setItem('theme', isDark.value ? 'dark' : 'light')
}

const navigateToProfile = () => {
  router.visit(route('perfil.edit'))
  showUserMenu.value = false
}

const navigateToDashboard = () => {
  router.visit(route('dashboard'))
  showUserMenu.value = false
}

const navigateToClasses = () => {
  router.visit(route('clases.index'))
  showUserMenu.value = false
}

const navigateToJoinClass = () => {
  router.visit(route('clases.unirse.form'))
  showUserMenu.value = false
}

const logout = () => {
  router.post(route('logout'))
}

const getNotificationIcon = (type) => {
  const icons = {
    info: 'mdi mdi-information text-blue-400',
    warning: 'mdi mdi-alert text-yellow-400',
    success: 'mdi mdi-check-circle text-green-400',
    error: 'mdi mdi-alert-circle text-red-400'
  }
  return icons[type] || 'mdi mdi-bell text-gray-400'
}

const formatTime = (timestamp) => {
  return new Date(timestamp).toLocaleDateString('es-ES', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Cerrar menús al hacer clic fuera
onMounted(() => {
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.user-section') && !e.target.closest('.user-menu')) {
      showUserMenu.value = false
    }
    if (!e.target.closest('.status-button') && !e.target.closest('.notifications-panel')) {
      showNotifications.value = false
    }
  })

  // Cargar tema guardado
  const savedTheme = localStorage.getItem('theme')
  if (savedTheme) {
    isDark.value = savedTheme === 'dark'
    document.documentElement.classList.toggle('dark', isDark.value)
  }
})
</script>

<style scoped>
/* Destiny UI Framework - Layout Base */
.destiny-app {
  min-height: 100vh;
  background: #1B1C29;
  color: #E6E6E6;
  font-family: 'Exo 2', sans-serif;
  position: relative;
  overflow-x: hidden;
}

/* Fondo con partículas */
.destiny-background-base {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -1;
  background: radial-gradient(ellipse at top, #1e2139, #1B1C29);
  overflow: hidden;
}

.destiny-background-base::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: 
    radial-gradient(2px 2px at 20px 30px, rgba(110, 193, 228, 0.3), transparent),
    radial-gradient(2px 2px at 40px 70px, rgba(199, 184, 138, 0.2), transparent),
    radial-gradient(1px 1px at 90px 40px, rgba(182, 161, 228, 0.4), transparent),
    radial-gradient(1px 1px at 130px 80px, rgba(110, 193, 228, 0.2), transparent);
  background-repeat: repeat;
  background-size: 200px 200px;
  animation: float 20s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0px) translateX(0px); }
  25% { transform: translateY(-10px) translateX(5px); }
  50% { transform: translateY(5px) translateX(-5px); }
  75% { transform: translateY(-5px) translateX(10px); }
}

/* HUD Superior */
.destiny-hud-top {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 80px;
  background: rgba(46, 47, 61, 0.95);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(110, 193, 228, 0.3);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  z-index: 50;
  box-shadow: 0 2px 20px rgba(0, 0, 0, 0.3);
}

.hud-left {
  display: flex;
  align-items: center;
}

.destiny-logo {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo-icon {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #6EC1E4, #B6A1E4);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #1B1C29;
}

.destiny-title {
  font-family: 'Orbitron', monospace;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: #6EC1E4;
  text-shadow: 0 0 10px rgba(110, 193, 228, 0.5);
  margin: 0;
}

.destiny-subtitle {
  font-family: 'Orbitron', monospace;
  font-weight: 400;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #C7B88A;
  margin: 0;
}

.hud-center {
  flex: 1;
  display: flex;
  justify-content: center;
}

.hud-right {
  display: flex;
  align-items: center;
  gap: 24px;
}

/* Status Indicators */
.status-indicators {
  display: flex;
  gap: 12px;
}

.status-button {
  width: 44px;
  height: 44px;
  background: rgba(110, 193, 228, 0.1);
  border: 1px solid rgba(110, 193, 228, 0.3);
  border-radius: 8px;
  color: #6EC1E4;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.status-button:hover {
  background: rgba(110, 193, 228, 0.2);
  border-color: #6EC1E4;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(110, 193, 228, 0.2);
}

.notification-badge {
  position: absolute;
  top: -4px;
  right: -4px;
  width: 20px;
  height: 20px;
  background: #EF4444;
  border: 2px solid #1B1C29;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.7rem;
  font-weight: 700;
  color: white;
}

/* User Section */
.user-section {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 16px;
  background: rgba(46, 47, 61, 0.6);
  border: 1px solid rgba(110, 193, 228, 0.2);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.user-section:hover {
  background: rgba(46, 47, 61, 0.8);
  border-color: rgba(110, 193, 228, 0.4);
  transform: translateY(-1px);
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  overflow: hidden;
  border: 2px solid rgba(110, 193, 228, 0.3);
}

.avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  width: 100%;
  height: 100%;
  background: rgba(110, 193, 228, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6EC1E4;
}

.user-info {
  text-align: left;
}

.user-name {
  font-weight: 600;
  font-size: 0.9rem;
  color: #E6E6E6;
  line-height: 1.2;
}

.user-type {
  font-size: 0.75rem;
  color: #C7B88A;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-family: 'Orbitron', monospace;
}

.user-dropdown-arrow {
  color: #8C8C8C;
  transition: transform 0.3s ease;
}

/* User Menu Dropdown */
.user-menu-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 60;
}

.user-menu {
  position: absolute;
  top: 90px;
  right: 24px;
  width: 320px;
}

.destiny-panel {
  background: rgba(46, 47, 61, 0.95);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(110, 193, 228, 0.4);
  border-radius: 12px;
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

.menu-header {
  display: flex;
  gap: 16px;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid rgba(110, 193, 228, 0.2);
}

.user-avatar-large {
  width: 64px;
  height: 64px;
  border-radius: 12px;
  overflow: hidden;
  border: 2px solid rgba(110, 193, 228, 0.4);
}

.menu-user-info {
  flex: 1;
}

.menu-options {
  space-y: 2px;
}

.menu-option {
  width: 100%;
  display: flex;
  align-items: center;
  padding: 12px 16px;
  background: transparent;
  border: none;
  border-radius: 8px;
  color: #E6E6E6;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9rem;
  margin-bottom: 2px;
}

.menu-option:hover {
  background: rgba(110, 193, 228, 0.1);
  color: #6EC1E4;
  transform: translateX(4px);
}

.menu-option.danger:hover {
  background: rgba(239, 68, 68, 0.1);
  color: #EF4444;
}

.menu-divider {
  height: 1px;
  background: rgba(110, 193, 228, 0.2);
  margin: 16px 0;
}

/* Notifications Panel */
.notifications-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 60;
}

.notifications-panel {
  position: absolute;
  top: 90px;
  right: 24px;
  width: 400px;
  height: 500px;
}

.panel-header {
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid rgba(110, 193, 228, 0.2);
}

.notifications-content {
  flex: 1;
  overflow-y: auto;
  margin-bottom: 24px;
}

.empty-notifications {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
}

.notifications-list {
  space-y: 12px;
}

.notification-item {
  display: flex;
  gap: 12px;
  padding: 16px;
  background: rgba(58, 61, 83, 0.5);
  border-radius: 8px;
  border-left: 4px solid transparent;
  transition: all 0.3s ease;
  position: relative;
}

.notification-item:hover {
  background: rgba(58, 61, 83, 0.8);
  transform: translateY(-1px);
}

.notification-item.unread {
  border-left-color: #6EC1E4;
  background: rgba(110, 193, 228, 0.1);
}

.notification-icon {
  margin-top: 4px;
}

.notification-content {
  flex: 1;
}

.notification-title {
  font-weight: 600;
  color: #E6E6E6;
  font-size: 0.9rem;
  margin-bottom: 4px;
}

.notification-message {
  font-size: 0.8rem;
  color: #B8B8B8;
  line-height: 1.4;
  margin-bottom: 8px;
}

.notification-time {
  font-size: 0.7rem;
  color: #8C8C8C;
}

.notification-unread-dot {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 8px;
  height: 8px;
  background: #6EC1E4;
  border-radius: 50%;
  box-shadow: 0 0 8px rgba(110, 193, 228, 0.5);
}

/* Main Content */
.destiny-main {
  padding-top: 80px;
  padding-bottom: 60px;
  min-height: 100vh;
}

/* Flash Messages */
.flash-messages {
  position: fixed;
  top: 100px;
  right: 24px;
  z-index: 40;
  space-y: 12px;
}

.flash-message {
  display: flex;
  align-items: center;
  padding: 16px 20px;
  border-radius: 8px;
  backdrop-filter: blur(12px);
  border: 1px solid;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  font-weight: 500;
  max-width: 400px;
}

.flash-message.success {
  background: rgba(34, 197, 94, 0.1);
  border-color: rgba(34, 197, 94, 0.3);
  color: #22C55E;
}

.flash-message.error {
  background: rgba(239, 68, 68, 0.1);
  border-color: rgba(239, 68, 68, 0.3);
  color: #EF4444;
}

.flash-message.info {
  background: rgba(110, 193, 228, 0.1);
  border-color: rgba(110, 193, 228, 0.3);
  color: #6EC1E4;
}

/* HUD Inferior */
.destiny-hud-bottom {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 60px;
  background: rgba(46, 47, 61, 0.95);
  backdrop-filter: blur(12px);
  border-top: 1px solid rgba(110, 193, 228, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 30;
}

.hud-bottom-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  max-width: 1200px;
  padding: 0 24px;
}

.copyright {
  font-size: 0.8rem;
  color: #8C8C8C;
}

.version {
  font-size: 0.8rem;
  color: #C7B88A;
  font-family: 'Orbitron', monospace;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

/* Destiny Button */
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

/* Transitions */
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s ease;
}

.slide-down-enter-from {
  opacity: 0;
  transform: translateY(-20px);
}

.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

.slide-left-enter-active,
.slide-left-leave-active {
  transition: all 0.3s ease;
}

.slide-left-enter-from {
  opacity: 0;
  transform: translateX(20px);
}

.slide-left-leave-to {
  opacity: 0;
  transform: translateX(20px);
}

.fade-enter-active,
.fade-leave-active {
  transition: all 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(10px);
}
</style>