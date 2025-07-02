<!-- resources/js/Pages/Auth/Login.vue -->
<template>
  <Head title="Iniciar Sesión" />

  <div class="destiny-auth-container">
    <!-- Fondo animado con partículas -->
    <div class="destiny-background-auth"></div>

    <!-- Logo y título central -->
    <div class="auth-header">
      <div class="auth-logo">
        <div class="logo-emblem">
          <i class="mdi mdi-gamepad-variant text-6xl"></i>
        </div>
        <h1 class="destiny-title text-4xl mb-2">EDUAPP</h1>
        <h2 class="destiny-subtitle text-xl mb-4">GAMIFICADA</h2>
        <p class="destiny-caption">SISTEMA EDUCATIVO DEL FUTURO</p>
      </div>
    </div>

    <!-- Panel de login central -->
    <div class="auth-panel-container">
      <div class="destiny-panel auth-panel">
        <!-- Header del panel -->
        <div class="panel-header">
          <div class="header-icon">
            <i class="mdi mdi-login text-3xl text-cyan-400"></i>
          </div>
          <h3 class="destiny-title text-xl">ACCESO AL SISTEMA</h3>
          <p class="destiny-subtitle text-sm">Identifícate como Guardián o Instructor</p>
        </div>

        <!-- Formulario de login -->
        <form @submit.prevent="submit" class="auth-form">
          <!-- Email -->
          <div class="form-group">
            <label class="destiny-caption">IDENTIFICACIÓN</label>
            <div class="input-container">
              <i class="mdi mdi-email input-icon"></i>
              <input
                v-model="form.email"
                type="email"
                class="destiny-input"
                placeholder="correo@ejemplo.com"
                required
                autocomplete="email"
                :class="{ 'input-error': form.errors.email }"
              />
            </div>
            <div v-if="form.errors.email" class="error-message">
              <i class="mdi mdi-alert-circle mr-2"></i>
              {{ form.errors.email }}
            </div>
          </div>

          <!-- Password -->
          <div class="form-group">
            <label class="destiny-caption">CÓDIGO DE ACCESO</label>
            <div class="input-container">
              <i class="mdi mdi-lock input-icon"></i>
              <input
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                class="destiny-input"
                placeholder="••••••••"
                required
                autocomplete="current-password"
                :class="{ 'input-error': form.errors.password }"
              />
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="password-toggle"
              >
                <i :class="showPassword ? 'mdi mdi-eye-off' : 'mdi mdi-eye'"></i>
              </button>
            </div>
            <div v-if="form.errors.password" class="error-message">
              <i class="mdi mdi-alert-circle mr-2"></i>
              {{ form.errors.password }}
            </div>
          </div>

          <!-- Remember me -->
          <div class="form-group checkbox-group">
            <label class="destiny-checkbox">
              <input
                v-model="form.remember"
                type="checkbox"
                class="checkbox-input"
              />
              <span class="checkbox-custom"></span>
              <span class="checkbox-label">Mantener sesión activa</span>
            </label>
          </div>

          <!-- Botón de login -->
          <button
            type="submit"
            class="destiny-btn destiny-btn-cyan w-full auth-submit"
            :disabled="form.processing"
          >
            <i v-if="form.processing" class="mdi mdi-loading animate-spin mr-2"></i>
            <i v-else class="mdi mdi-login mr-2"></i>
            {{ form.processing ? 'ACCEDIENDO...' : 'INICIAR TRANSMISIÓN' }}
          </button>

          <!-- Error general -->
          <div v-if="form.errors.general" class="error-message general-error">
            <i class="mdi mdi-alert-circle mr-2"></i>
            {{ form.errors.general }}
          </div>
        </form>

        <!-- Divider -->
        <div class="auth-divider">
          <div class="divider-line"></div>
          <span class="divider-text destiny-caption">NUEVO EN EL SISTEMA</span>
          <div class="divider-line"></div>
        </div>

        <!-- Link a registro -->
        <div class="auth-footer">
          <p class="destiny-body text-center mb-4">
            ¿No tienes acceso al sistema?
          </p>
          <Link
            :href="route('register')"
            class="destiny-btn destiny-btn-purple w-full"
          >
            <i class="mdi mdi-account-plus mr-2"></i>
            REGISTRARSE COMO GUARDIÁN
          </Link>
        </div>
      </div>

      <!-- Panel de información lateral -->
      <div class="info-panel">
        <div class="destiny-panel">
          <div class="info-header">
            <i class="mdi mdi-information text-2xl text-blue-400 mb-3"></i>
            <h4 class="destiny-subtitle text-lg mb-4">BIENVENIDO A LA TORRE</h4>
          </div>
          
          <div class="info-content">
            <div class="info-item">
              <i class="mdi mdi-shield-account text-cyan-400"></i>
              <div class="info-text">
                <h5 class="destiny-caption">PARA INSTRUCTORES</h5>
                <p class="text-sm">Gestiona clases, crea misiones y evalúa el progreso de tus Guardianes.</p>
              </div>
            </div>
            
            <div class="info-item">
              <i class="mdi mdi-sword text-purple-400"></i>
              <div class="info-text">
                <h5 class="destiny-caption">PARA ESTUDIANTES</h5>
                <p class="text-sm">Crea tu personaje, únete a clases y evoluciona como Guardián del conocimiento.</p>
              </div>
            </div>
            
            <div class="info-item">
              <i class="mdi mdi-trophy text-gold-400"></i>
              <div class="info-text">
                <h5 class="destiny-caption">SISTEMA GAMIFICADO</h5>
                <p class="text-sm">Gana experiencia, sube de nivel y desbloquea logros en tu aventura educativa.</p>
              </div>
            </div>
          </div>

          <div class="info-footer">
            <div class="stats-grid">
              <div class="stat-item">
                <div class="stat-value destiny-title">1,247</div>
                <div class="stat-label destiny-caption">GUARDIANES ACTIVOS</div>
              </div>
              <div class="stat-item">
                <div class="stat-value destiny-title">89</div>
                <div class="stat-label destiny-caption">INSTRUCTORES</div>
              </div>
              <div class="stat-item">
                <div class="stat-value destiny-title">3,521</div>
                <div class="stat-label destiny-caption">MISIONES COMPLETADAS</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <div class="auth-footer-bottom">
      <p class="destiny-caption">
        &copy; {{ new Date().getFullYear() }} EduApp Gamificada - Forjando el futuro de la educación
      </p>
    </div>
  </div>
</template>

<script setup>
import { Head, Link, useForm } from '@inertiajs/vue3'
import { ref } from 'vue'

defineProps({
  canResetPassword: Boolean,
  status: String,
})

const form = useForm({
  email: '',
  password: '',
  remember: false,
})

const showPassword = ref(false)

const submit = () => {
  form.post(route('login'), {
    onFinish: () => form.reset('password'),
  })
}
</script>

<style scoped>
.destiny-auth-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  position: relative;
  background: #0a0b13;
  padding: 2rem;
}

/* Fondo animado específico para auth */
.destiny-background-auth {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -1;
  background: radial-gradient(ellipse at center, #1a1b29, #0a0b13);
  overflow: hidden;
}

.destiny-background-auth::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: 
    radial-gradient(3px 3px at 30px 40px, rgba(110, 193, 228, 0.4), transparent),
    radial-gradient(2px 2px at 60px 80px, rgba(199, 184, 138, 0.3), transparent),
    radial-gradient(2px 2px at 120px 60px, rgba(182, 161, 228, 0.5), transparent),
    radial-gradient(1px 1px at 200px 100px, rgba(110, 193, 228, 0.3), transparent);
  background-repeat: repeat;
  background-size: 250px 250px;
  animation: float 25s ease-in-out infinite;
}

/* Header con logo */
.auth-header {
  position: absolute;
  top: 3rem;
  text-align: center;
  z-index: 10;
}

.auth-logo {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.logo-emblem {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #6EC1E4, #B6A1E4);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #0a0b13;
  margin-bottom: 1rem;
  box-shadow: 
    0 0 30px rgba(110, 193, 228, 0.3),
    0 8px 32px rgba(0, 0, 0, 0.3);
  animation: destiny-glow-pulse 3s ease-in-out infinite;
}

/* Container del panel */
.auth-panel-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3rem;
  max-width: 1000px;
  width: 100%;
  margin-top: 6rem;
}

/* Panel principal de auth */
.auth-panel {
  padding: 2.5rem;
  min-height: 500px;
}

.panel-header {
  text-align: center;
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid rgba(110, 193, 228, 0.2);
}

.header-icon {
  margin-bottom: 1rem;
}

/* Formulario */
.auth-form {
  space-y: 1.5rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: #C7B88A;
}

.input-container {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon {
  position: absolute;
  left: 1rem;
  color: #6EC1E4;
  z-index: 2;
}

.destiny-input {
  background: rgba(46, 47, 61, 0.8);
  border: 1px solid rgba(110, 193, 228, 0.3);
  border-radius: 8px;
  color: #E6E6E6;
  padding: 1rem 1rem 1rem 3rem;
  font-family: 'Exo 2', sans-serif;
  font-size: 0.9rem;
  transition: all 0.3s ease;
  width: 100%;
}

.destiny-input:focus {
  outline: none;
  border-color: #6EC1E4;
  box-shadow: 0 0 20px rgba(110, 193, 228, 0.3);
  background: rgba(46, 47, 61, 0.95);
}

.destiny-input.input-error {
  border-color: #EF4444;
  box-shadow: 0 0 20px rgba(239, 68, 68, 0.3);
}

.password-toggle {
  position: absolute;
  right: 1rem;
  background: none;
  border: none;
  color: #8C8C8C;
  cursor: pointer;
  padding: 0.5rem;
  transition: color 0.3s ease;
}

.password-toggle:hover {
  color: #6EC1E4;
}

/* Checkbox personalizado */
.destiny-checkbox {
  display: flex;
  align-items: center;
  cursor: pointer;
  gap: 0.75rem;
}

.checkbox-input {
  display: none;
}

.checkbox-custom {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(110, 193, 228, 0.4);
  border-radius: 4px;
  background: rgba(46, 47, 61, 0.8);
  position: relative;
  transition: all 0.3s ease;
}

.checkbox-input:checked + .checkbox-custom {
  background: #6EC1E4;
  border-color: #6EC1E4;
  box-shadow: 0 0 10px rgba(110, 193, 228, 0.4);
}

.checkbox-input:checked + .checkbox-custom::after {
  content: '✓';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: #0a0b13;
  font-weight: bold;
  font-size: 0.8rem;
}

.checkbox-label {
  font-size: 0.9rem;
  color: #B8B8B8;
}

/* Botón de submit */
.auth-submit {
  padding: 1rem 2rem;
  font-size: 1rem;
  margin-top: 1.5rem;
}

/* Mensajes de error */
.error-message {
  display: flex;
  align-items: center;
  color: #EF4444;
  font-size: 0.8rem;
  margin-top: 0.5rem;
  padding: 0.5rem;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 4px;
}

.general-error {
  margin-top: 1rem;
  justify-content: center;
}

/* Divider */
.auth-divider {
  display: flex;
  align-items: center;
  margin: 2rem 0;
}

.divider-line {
  flex: 1;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(110, 193, 228, 0.3), transparent);
}

.divider-text {
  margin: 0 1rem;
  color: #8C8C8C;
}

/* Footer del auth */
.auth-footer {
  text-align: center;
}

/* Panel de información lateral */
.info-panel {
  display: flex;
  flex-direction: column;
}

.info-header {
  text-align: center;
  margin-bottom: 1.5rem;
}

.info-content {
  space-y: 1.5rem;
  margin-bottom: 2rem;
}

.info-item {
  display: flex;
  gap: 1rem;
  align-items: flex-start;
}

.info-item i {
  font-size: 1.5rem;
  margin-top: 0.25rem;
}

.info-text h5 {
  margin-bottom: 0.5rem;
  color: #C7B88A;
}

.info-text p {
  color: #B8B8B8;
  line-height: 1.5;
}

/* Stats grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  padding-top: 1.5rem;
  border-top: 1px solid rgba(110, 193, 228, 0.2);
}

.stat-item {
  text-align: center;
}

.stat-value {
  font-size: 1.25rem;
  color: #6EC1E4;
  margin-bottom: 0.25rem;
}

.stat-label {
  font-size: 0.7rem;
  color: #8C8C8C;
}

/* Footer bottom */
.auth-footer-bottom {
  position: absolute;
  bottom: 1rem;
  text-align: center;
  color: #8C8C8C;
}

/* Responsive */
@media (max-width: 768px) {
  .auth-panel-container {
    grid-template-columns: 1fr;
    gap: 2rem;
    margin-top: 4rem;
  }
  
  .info-panel {
    order: -1;
  }
  
  .auth-panel {
    padding: 2rem;
  }
  
  .auth-header {
    position: relative;
    top: 0;
    margin-bottom: 2rem;
  }
}

/* Utilidades específicas */
.w-full {
  width: 100%;
}

.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>