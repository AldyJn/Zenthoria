<!-- resources/js/Pages/Auth/Register.vue -->
<template>
  <Head title="Crear Cuenta - Zenthoria" />

  <div class="zenthoria-auth-container">
    <!-- Fondo animado con partículas -->
    <div class="zenthoria-background-auth"></div>

    <!-- Logo y título central -->
    <div class="auth-header">
      <div class="auth-logo">
        <div class="logo-emblem">
          <i class="mdi mdi-sword-cross text-6xl"></i>
        </div>
        <h1 class="zenthoria-title text-4xl mb-2">ZENTHORIA</h1>
        <h2 class="zenthoria-subtitle text-xl mb-4">PLATAFORMA EDUCATIVA</h2>
        <p class="zenthoria-caption">ÚNETE A LA REVOLUCIÓN DEL APRENDIZAJE</p>
      </div>
    </div>

    <!-- Panel de registro central -->
    <div class="auth-panel-container">
      <div class="zenthoria-panel auth-panel">
        <!-- Header del panel -->
        <div class="panel-header">
          <div class="header-icon">
            <i class="mdi mdi-account-plus text-3xl text-cyan-400"></i>
          </div>
          <h3 class="zenthoria-title text-xl">CREAR CUENTA</h3>
          <p class="zenthoria-subtitle text-sm">Únete como Guardián o Instructor</p>
        </div>

        <!-- Formulario de registro -->
        <form @submit.prevent="submit" class="auth-form">
          <!-- Tipo de usuario -->
          <div class="form-group">
            <label class="zenthoria-caption">TIPO DE CUENTA</label>
            <div class="user-type-selector">
              <div 
                v-for="tipo in tipos_usuario" 
                :key="tipo.id"
                @click="selectUserType(tipo)"
                class="user-type-card"
                :class="{ 'selected': form.tipo_usuario === tipo.id }"
              >
                <div class="type-icon">
                  <i :class="tipo.nombre === 'docente' ? 'mdi mdi-shield-account' : 'mdi mdi-sword'"></i>
                </div>
                <div class="type-info">
                  <h4 class="type-title">
                    {{ tipo.nombre === 'docente' ? 'INSTRUCTOR' : 'GUARDIÁN' }}
                  </h4>
                  <p class="type-description">
                    {{ tipo.nombre === 'docente' ? 'Gestiona clases y misiones' : 'Completa aventuras educativas' }}
                  </p>
                </div>
                <div class="type-check">
                  <i class="mdi mdi-check-circle"></i>
                </div>
              </div>
            </div>
            <div v-if="form.errors.tipo_usuario" class="error-message">
              <i class="mdi mdi-alert-circle mr-2"></i>
              {{ form.errors.tipo_usuario }}
            </div>
          </div>

          <!-- Información básica -->
          <div class="form-section">
            <h4 class="section-title">INFORMACIÓN BÁSICA</h4>
            
            <!-- Nombre completo -->
            <div class="form-group">
              <label class="zenthoria-caption">NOMBRE COMPLETO</label>
              <div class="input-container">
                <i class="mdi mdi-account input-icon"></i>
                <input
                  v-model="form.nombre"
                  type="text"
                  class="zenthoria-input"
                  placeholder="Tu nombre completo"
                  required
                  autocomplete="name"
                  :class="{ 'input-error': form.errors.nombre }"
                />
              </div>
              <div v-if="form.errors.nombre" class="error-message">
                <i class="mdi mdi-alert-circle mr-2"></i>
                {{ form.errors.nombre }}
              </div>
            </div>

            <!-- Email -->
            <div class="form-group">
              <label class="zenthoria-caption">CORREO ELECTRÓNICO</label>
              <div class="input-container">
                <i class="mdi mdi-email input-icon"></i>
                <input
                  v-model="form.correo"
                  type="email"
                  class="zenthoria-input"
                  placeholder="correo@ejemplo.com"
                  required
                  autocomplete="email"
                  :class="{ 'input-error': form.errors.correo }"
                  @blur="checkEmailAvailability"
                />
                <div v-if="emailChecking" class="input-status">
                  <i class="mdi mdi-loading animate-spin"></i>
                </div>
                <div v-else-if="emailStatus" class="input-status" :class="emailStatus.type">
                  <i :class="emailStatus.icon"></i>
                </div>
              </div>
              <div v-if="form.errors.correo" class="error-message">
                <i class="mdi mdi-alert-circle mr-2"></i>
                {{ form.errors.correo }}
              </div>
              <div v-else-if="emailStatus && emailStatus.type === 'error'" class="error-message">
                <i class="mdi mdi-alert-circle mr-2"></i>
                {{ emailStatus.message }}
              </div>
              <div v-else-if="emailStatus && emailStatus.type === 'success'" class="success-message">
                <i class="mdi mdi-check-circle mr-2"></i>
                {{ emailStatus.message }}
              </div>
            </div>

            <!-- Contraseñas -->
            <div class="form-row">
              <div class="form-group">
                <label class="zenthoria-caption">CONTRASEÑA</label>
                <div class="input-container">
                  <i class="mdi mdi-lock input-icon"></i>
                  <input
                    v-model="form.password"
                    :type="showPassword ? 'text' : 'password'"
                    class="zenthoria-input"
                    placeholder="••••••••"
                    required
                    autocomplete="new-password"
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

              <div class="form-group">
                <label class="zenthoria-caption">CONFIRMAR CONTRASEÑA</label>
                <div class="input-container">
                  <i class="mdi mdi-lock-check input-icon"></i>
                  <input
                    v-model="form.password_confirmation"
                    :type="showPasswordConfirm ? 'text' : 'password'"
                    class="zenthoria-input"
                    placeholder="••••••••"
                    required
                    autocomplete="new-password"
                    :class="{ 'input-error': form.errors.password_confirmation }"
                  />
                  <button
                    type="button"
                    @click="showPasswordConfirm = !showPasswordConfirm"
                    class="password-toggle"
                  >
                    <i :class="showPasswordConfirm ? 'mdi mdi-eye-off' : 'mdi mdi-eye'"></i>
                  </button>
                </div>
                <div v-if="form.errors.password_confirmation" class="error-message">
                  <i class="mdi mdi-alert-circle mr-2"></i>
                  {{ form.errors.password_confirmation }}
                </div>
              </div>
            </div>
          </div>

          <!-- Información específica del tipo de usuario -->
          <div v-if="selectedUserType" class="form-section">
            <h4 class="section-title">
              INFORMACIÓN {{ selectedUserType.nombre === 'docente' ? 'DE INSTRUCTOR' : 'DE GUARDIÁN' }}
            </h4>
            
            <!-- Campos para docente -->
            <div v-if="selectedUserType.nombre === 'docente'">
              <div class="form-group">
                <label class="zenthoria-caption">ESPECIALIDAD</label>
                <div class="input-container">
                  <i class="mdi mdi-book-open input-icon"></i>
                  <input
                    v-model="form.especialidad"
                    type="text"
                    class="zenthoria-input"
                    placeholder="Ej: Matemáticas, Ciencias, Historia..."
                    required
                    :class="{ 'input-error': form.errors.especialidad }"
                  />
                </div>
                <div v-if="form.errors.especialidad" class="error-message">
                  <i class="mdi mdi-alert-circle mr-2"></i>
                  {{ form.errors.especialidad }}
                </div>
              </div>
            </div>

            <!-- Campos para estudiante -->
            <div v-if="selectedUserType.nombre === 'estudiante'">
              <div class="form-row">
                <div class="form-group">
                  <label class="zenthoria-caption">GRADO ACADÉMICO</label>
                  <div class="input-container">
                    <i class="mdi mdi-school input-icon"></i>
                    <select
                      v-model="form.grado"
                      class="zenthoria-select"
                      required
                      :class="{ 'input-error': form.errors.grado }"
                    >
                      <option value="">Seleccionar grado</option>
                      <option value="1ro Primaria">1ro Primaria</option>
                      <option value="2do Primaria">2do Primaria</option>
                      <option value="3ro Primaria">3ro Primaria</option>
                      <option value="4to Primaria">4to Primaria</option>
                      <option value="5to Primaria">5to Primaria</option>
                      <option value="6to Primaria">6to Primaria</option>
                      <option value="1ro Secundaria">1ro Secundaria</option>
                      <option value="2do Secundaria">2do Secundaria</option>
                      <option value="3ro Secundaria">3ro Secundaria</option>
                      <option value="4to Secundaria">4to Secundaria</option>
                      <option value="5to Secundaria">5to Secundaria</option>
                      <option value="Universitario">Universitario</option>
                    </select>
                  </div>
                  <div v-if="form.errors.grado" class="error-message">
                    <i class="mdi mdi-alert-circle mr-2"></i>
                    {{ form.errors.grado }}
                  </div>
                </div>

                <div class="form-group">
                  <label class="zenthoria-caption">SECCIÓN (OPCIONAL)</label>
                  <div class="input-container">
                    <i class="mdi mdi-format-letter-case input-icon"></i>
                    <input
                      v-model="form.seccion"
                      type="text"
                      class="zenthoria-input"
                      placeholder="Ej: A, B, C..."
                      maxlength="10"
                      :class="{ 'input-error': form.errors.seccion }"
                    />
                  </div>
                  <div v-if="form.errors.seccion" class="error-message">
                    <i class="mdi mdi-alert-circle mr-2"></i>
                    {{ form.errors.seccion }}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Términos y condiciones -->
          <div class="form-group">
            <label class="zenthoria-checkbox">
              <input
                v-model="form.terminos"
                type="checkbox"
                class="checkbox-input"
                required
              />
              <span class="checkbox-custom"></span>
              <span class="checkbox-label">
                Acepto los 
                <a href="#" class="text-cyan-400 hover:text-cyan-300">términos y condiciones</a>
                y la 
                <a href="#" class="text-cyan-400 hover:text-cyan-300">política de privacidad</a>
              </span>
            </label>
            <div v-if="form.errors.terminos" class="error-message">
              <i class="mdi mdi-alert-circle mr-2"></i>
              {{ form.errors.terminos }}
            </div>
          </div>

          <!-- Botón de registro -->
          <button
            type="submit"
            class="zenthoria-btn zenthoria-btn-primary w-full auth-submit"
            :disabled="form.processing || !canSubmit"
          >
            <i v-if="form.processing" class="mdi mdi-loading animate-spin mr-2"></i>
            <i v-else class="mdi mdi-rocket-launch mr-2"></i>
            {{ form.processing ? 'CREANDO CUENTA...' : 'INICIAR AVENTURA' }}
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
          <span class="divider-text zenthoria-caption">YA TIENES CUENTA</span>
          <div class="divider-line"></div>
        </div>

        <!-- Link a login -->
        <div class="auth-footer">
          <p class="zenthoria-body text-center mb-4">
            ¿Ya eres parte de la comunidad?
          </p>
          <Link
            :href="route('login')"
            class="zenthoria-btn zenthoria-btn-outline w-full"
          >
            <i class="mdi mdi-login mr-2"></i>
            INICIAR SESIÓN
          </Link>
        </div>
      </div>

      <!-- Panel de información lateral -->
      <div class="info-panel">
        <div class="zenthoria-panel">
          <div class="info-header">
            <i class="mdi mdi-information text-2xl text-blue-400 mb-3"></i>
            <h4 class="zenthoria-subtitle text-lg mb-4">¡ÚNETE A ZENTHORIA!</h4>
          </div>
          
          <div class="info-content">
            <div class="info-item">
              <i class="mdi mdi-shield-account text-cyan-400"></i>
              <div class="info-text">
                <h5 class="zenthoria-caption">PARA INSTRUCTORES</h5>
                <p class="text-sm">Crea clases épicas, diseña misiones educativas y guía a tus estudiantes en su aventura de aprendizaje.</p>
              </div>
            </div>
            
            <div class="info-item">
              <i class="mdi mdi-sword text-purple-400"></i>
              <div class="info-text">
                <h5 class="zenthoria-caption">PARA GUARDIANES</h5>
                <p class="text-sm">Crea tu personaje único, únete a clases emocionantes y evoluciona mientras aprendes.</p>
              </div>
            </div>
            
            <div class="info-item">
              <i class="mdi mdi-trophy text-gold-400"></i>
              <div class="info-text">
                <h5 class="zenthoria-caption">GAMIFICACIÓN TOTAL</h5>
                <p class="text-sm">Sistema completo de niveles, experiencia, logros y recompensas que hace del aprendizaje una aventura.</p>
              </div>
            </div>

            <div class="info-item">
              <i class="mdi mdi-qrcode-scan text-green-400"></i>
              <div class="info-text">
                <h5 class="zenthoria-caption">ACCESO RÁPIDO</h5>
                <p class="text-sm">Únete a clases instantáneamente escaneando códigos QR o ingresando códigos únicos.</p>
              </div>
            </div>
          </div>

          <div class="info-footer">
            <div class="stats-grid">
              <div class="stat-item">
                <div class="stat-number">2.5K+</div>
                <div class="stat-label">Guardianes</div>
              </div>
              <div class="stat-item">
                <div class="stat-number">150+</div>
                <div class="stat-label">Instituciones</div>
              </div>
              <div class="stat-item">
                <div class="stat-number">50K+</div>
                <div class="stat-label">Misiones</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Head, Link, useForm } from '@inertiajs/vue3'
import { ref, computed, watch } from 'vue'
import axios from 'axios'

const props = defineProps({
  tipos_usuario: Array,
})

// Estado del formulario
const form = useForm({
  nombre: '',
  correo: '',
  password: '',
  password_confirmation: '',
  tipo_usuario: null,
  especialidad: '',
  grado: '',
  seccion: '',
  terminos: false,
})

// Estados reactivos
const showPassword = ref(false)
const showPasswordConfirm = ref(false)
const emailChecking = ref(false)
const emailStatus = ref(null)

// Computadas
const selectedUserType = computed(() => {
  return props.tipos_usuario.find(tipo => tipo.id === form.tipo_usuario)
})

const canSubmit = computed(() => {
  return form.terminos && 
         form.nombre && 
         form.correo && 
         form.password && 
         form.password_confirmation && 
         form.tipo_usuario &&
         (!emailStatus.value || emailStatus.value.type === 'success')
})

// Métodos
const selectUserType = (tipo) => {
  form.tipo_usuario = tipo.id
  // Limpiar campos específicos cuando se cambia el tipo
  form.especialidad = ''
  form.grado = ''
  form.seccion = ''
}

const checkEmailAvailability = async () => {
  if (!form.correo || !isValidEmail(form.correo)) {
    emailStatus.value = null
    return
  }

  emailChecking.value = true
  emailStatus.value = null

  try {
    const response = await axios.post('/auth/check-email', {
      email: form.correo
    })

    emailStatus.value = {
      type: response.data.available ? 'success' : 'error',
      message: response.data.message,
      icon: response.data.available ? 'mdi mdi-check-circle' : 'mdi mdi-alert-circle'
    }
  } catch (error) {
    emailStatus.value = {
      type: 'error',
      message: 'Error al verificar el correo',
      icon: 'mdi mdi-alert-circle'
    }
  } finally {
    emailChecking.value = false
  }
}

const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

const submit = () => {
  // Agregar el nombre del tipo de usuario para validación
  const selectedType = selectedUserType.value
  if (selectedType) {
    form.transform((data) => ({
      ...data,
      tipo_usuario_nombre: selectedType.nombre
    })).post(route('register'))
  }
}

// Watchers
watch(() => form.correo, () => {
  emailStatus.value = null
})
</script>

<style scoped>
/* Zenthoria Auth Styles - Destiny 2 Inspired */
.zenthoria-auth-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #0a0b13 0%, #1e2139 50%, #0f1419 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  position: relative;
  font-family: 'Exo 2', sans-serif;
}

/* Fondo animado */
.zenthoria-background-auth {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -1;
  background: 
    radial-gradient(ellipse at top left, rgba(110, 193, 228, 0.1) 0%, transparent 50%),
    radial-gradient(ellipse at bottom right, rgba(182, 161, 228, 0.1) 0%, transparent 50%);
}

.zenthoria-background-auth::before {
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
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #0a0b13;
  margin-bottom: 1rem;
  box-shadow: 
    0 0 30px rgba(110, 193, 228, 0.3),
    0 8px 32px rgba(0, 0, 0, 0.3);
  animation: zenthoria-glow-pulse 3s ease-in-out infinite;
}

@keyframes zenthoria-glow-pulse {
  0%, 100% { 
    box-shadow: 0 0 30px rgba(110, 193, 228, 0.3), 0 8px 32px rgba(0, 0, 0, 0.3);
  }
  50% { 
    box-shadow: 0 0 40px rgba(110, 193, 228, 0.5), 0 12px 40px rgba(0, 0, 0, 0.4);
  }
}

.zenthoria-title, .zenthoria-subtitle, .zenthoria-caption {
  color: #E6E6E6;
  font-weight: 700;
  letter-spacing: 2px;
  text-transform: uppercase;
}

.zenthoria-title {
  background: linear-gradient(45deg, #6EC1E4, #B6A1E4);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

/* Container del panel */
.auth-panel-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3rem;
  max-width: 1200px;
  width: 100%;
  margin-top: 6rem;
}

/* Panel principal de auth */
.zenthoria-panel {
  background: rgba(30, 33, 57, 0.9);
  border: 1px solid rgba(110, 193, 228, 0.2);
  border-radius: 16px;
  backdrop-filter: blur(20px);
  box-shadow: 
    0 20px 40px rgba(0, 0, 0, 0.3),
    0 0 80px rgba(110, 193, 228, 0.1);
}

.auth-panel {
  padding: 2.5rem;
  min-height: 600px;
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

.form-section {
  margin-bottom: 2rem;
}

.section-title {
  color: #C7B88A;
  font-size: 0.9rem;
  font-weight: 600;
  letter-spacing: 1px;
  text-transform: uppercase;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid rgba(199, 184, 138, 0.2);
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: #C7B88A;
  font-size: 0.8rem;
  font-weight: 600;
  letter-spacing: 1px;
}

/* Selector de tipo de usuario */
.user-type-selector {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}

.user-type-card {
  flex: 1;
  background: rgba(46, 47, 61, 0.6);
  border: 2px solid rgba(110, 193, 228, 0.2);
  border-radius: 12px;
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.user-type-card:hover {
  border-color: rgba(110, 193, 228, 0.4);
  transform: translateY(-2px);
}

.user-type-card.selected {
  border-color: #6EC1E4;
  background: rgba(110, 193, 228, 0.1);
}

.user-type-card.selected .type-check {
  opacity: 1;
}

.type-icon {
  font-size: 2rem;
  color: #6EC1E4;
  margin-bottom: 0.75rem;
}

.type-title {
  color: #E6E6E6;
  font-size: 0.9rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.type-description {
  color: #B3B3B3;
  font-size: 0.8rem;
  line-height: 1.4;
}

.type-check {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  color: #6EC1E4;
  font-size: 1.2rem;
  opacity: 0;
  transition: opacity 0.3s ease;
}

/* Inputs */
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

.zenthoria-input, .zenthoria-select {
  background: rgba(46, 47, 61, 0.8);
  border: 1px solid rgba(110, 193, 228, 0.3);
  border-radius: 8px;
  color: #E6E6E6;
  font-family: inherit;
  font-size: 0.9rem;
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 3rem;
  transition: all 0.3s ease;
}

.zenthoria-input:focus, .zenthoria-select:focus {
  outline: none;
  border-color: #6EC1E4;
  box-shadow: 0 0 0 3px rgba(110, 193, 228, 0.1);
  background: rgba(46, 47, 61, 0.9);
}

.zenthoria-input::placeholder {
  color: #8A8A8A;
}

.input-error {
  border-color: #ff6b6b !important;
  box-shadow: 0 0 0 3px rgba(255, 107, 107, 0.1) !important;
}

.password-toggle {
  position: absolute;
  right: 1rem;
  background: none;
  border: none;
  color: #8A8A8A;
  cursor: pointer;
  padding: 0.25rem;
  z-index: 2;
  transition: color 0.3s ease;
}

.password-toggle:hover {
  color: #6EC1E4;
}

.input-status {
  position: absolute;
  right: 1rem;
  z-index: 2;
}

.input-status.success {
  color: #4CAF50;
}

.input-status.error {
  color: #ff6b6b;
}

/* Checkbox */
.zenthoria-checkbox {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  cursor: pointer;
  color: #B3B3B3;
  font-size: 0.9rem;
  line-height: 1.5;
}

.checkbox-input {
  display: none;
}

.checkbox-custom {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(110, 193, 228, 0.3);
  border-radius: 4px;
  background: rgba(46, 47, 61, 0.6);
  position: relative;
  transition: all 0.3s ease;
  flex-shrink: 0;
  margin-top: 2px;
}

.checkbox-input:checked + .checkbox-custom {
  background: #6EC1E4;
  border-color: #6EC1E4;
}

.checkbox-input:checked + .checkbox-custom::after {
  content: '✓';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: #0a0b13;
  font-weight: bold;
  font-size: 12px;
}

/* Botones */
.zenthoria-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-family: inherit;
  font-weight: 600;
  font-size: 0.9rem;
  letter-spacing: 1px;
  text-decoration: none;
  text-transform: uppercase;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.zenthoria-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
  transition: left 0.6s ease;
}

.zenthoria-btn:hover::before {
  left: 100%;
}

.zenthoria-btn-primary {
  background: linear-gradient(135deg, #6EC1E4, #5A9BD4);
  color: #0a0b13;
  box-shadow: 0 4px 15px rgba(110, 193, 228, 0.3);
}

.zenthoria-btn-primary:hover:not(:disabled) {
  background: linear-gradient(135deg, #5A9BD4, #4A8BC2);
  box-shadow: 0 6px 20px rgba(110, 193, 228, 0.4);
  transform: translateY(-2px);
}

.zenthoria-btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.zenthoria-btn-outline {
  background: transparent;
  color: #6EC1E4;
  border: 2px solid #6EC1E4;
}

.zenthoria-btn-outline:hover {
  background: rgba(110, 193, 228, 0.1);
  box-shadow: 0 4px 15px rgba(110, 193, 228, 0.2);
  transform: translateY(-2px);
}

.w-full {
  width: 100%;
}

.auth-submit {
  margin-top: 1rem;
  padding: 1rem 2rem;
  font-size: 1rem;
}

/* Mensajes */
.error-message, .success-message {
  display: flex;
  align-items: center;
  margin-top: 0.5rem;
  font-size: 0.8rem;
}

.error-message {
  color: #ff6b6b;
}

.success-message {
  color: #4CAF50;
}

.general-error {
  margin-top: 1rem;
  padding: 0.75rem;
  background: rgba(255, 107, 107, 0.1);
  border: 1px solid rgba(255, 107, 107, 0.3);
  border-radius: 6px;
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
  background: rgba(110, 193, 228, 0.2);
}

.divider-text {
  margin: 0 1rem;
  color: #8A8A8A;
  font-size: 0.8rem;
}

/* Footer del auth */
.auth-footer {
  text-align: center;
}

.zenthoria-body {
  color: #B3B3B3;
}

/* Panel de información */
.info-panel .zenthoria-panel {
  padding: 2rem;
  height: fit-content;
}

.info-header {
  text-align: center;
  margin-bottom: 2rem;
}

.info-content {
  space-y: 1.5rem;
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
  color: #E6E6E6;
  font-size: 0.8rem;
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.info-text p {
  color: #B3B3B3;
  line-height: 1.4;
}

.info-footer {
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid rgba(110, 193, 228, 0.2);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  text-align: center;
}

.stat-number {
  color: #6EC1E4;
  font-size: 1.2rem;
  font-weight: 700;
  margin-bottom: 0.25rem;
}

.stat-label {
  color: #8A8A8A;
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 1px;
}

/* Animaciones */
@keyframes float {
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-20px) rotate(1deg); }
}

.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* Responsive */
@media (max-width: 1024px) {
  .auth-panel-container {
    grid-template-columns: 1fr;
    gap: 2rem;
    max-width: 600px;
  }
  
  .info-panel {
    order: -1;
  }
}

@media (max-width: 768px) {
  .zenthoria-auth-container {
    padding: 1rem;
  }
  
  .auth-header {
    position: relative;
    top: 0;
    margin-bottom: 2rem;
  }
  
  .auth-panel-container {
    margin-top: 0;
  }
  
  .auth-panel {
    padding: 2rem;
  }
  
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .user-type-selector {
    flex-direction: column;
  }
}
</style>