<!-- resources/js/Pages/Auth/ForgotPassword.vue -->
<template>
  <Head title="Recuperar Contraseña - Zenthoria" />

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
        <p class="zenthoria-caption">RECUPERACIÓN DE ACCESO</p>
      </div>
    </div>

    <!-- Panel de recuperación central -->
    <div class="auth-panel-single">
      <div class="zenthoria-panel auth-panel">
        <!-- Header del panel -->
        <div class="panel-header">
          <div class="header-icon">
            <i class="mdi mdi-key-variant text-3xl text-yellow-400"></i>
          </div>
          <h3 class="zenthoria-title text-xl">RECUPERAR ACCESO</h3>
          <p class="zenthoria-subtitle text-sm">Ingresa tu correo para recibir un código de recuperación</p>
        </div>

        <!-- Formulario de recuperación -->
        <form @submit.prevent="submit" class="auth-form">
          <!-- Email -->
          <div class="form-group">
            <label class="zenthoria-caption">CORREO ELECTRÓNICO</label>
            <div class="input-container">
              <i class="mdi mdi-email input-icon"></i>
              <input
                v-model="form.email"
                type="email"
                class="zenthoria-input"
                placeholder="tu-correo@ejemplo.com"
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

          <!-- Botón de envío -->
          <button
            type="submit"
            class="zenthoria-btn zenthoria-btn-primary w-full auth-submit"
            :disabled="form.processing"
          >
            <i v-if="form.processing" class="mdi mdi-loading animate-spin mr-2"></i>
            <i v-else class="mdi mdi-send mr-2"></i>
            {{ form.processing ? 'ENVIANDO CÓDIGO...' : 'ENVIAR CÓDIGO' }}
          </button>

          <!-- Error general -->
          <div v-if="form.errors.general" class="error-message general-error">
            <i class="mdi mdi-alert-circle mr-2"></i>
            {{ form.errors.general }}
          </div>

          <!-- Mensaje de éxito -->
          <div v-if="$page.props.flash.success" class="success-message general-success">
            <i class="mdi mdi-check-circle mr-2"></i>
            {{ $page.props.flash.success }}
          </div>
        </form>

        <!-- Divider -->
        <div class="auth-divider">
          <div class="divider-line"></div>
          <span class="divider-text zenthoria-caption">OTRAS OPCIONES</span>
          <div class="divider-line"></div>
        </div>

        <!-- Links de navegación -->
        <div class="auth-footer">
          <div class="footer-links">
            <Link
              :href="route('login')"
              class="zenthoria-btn zenthoria-btn-outline"
            >
              <i class="mdi mdi-arrow-left mr-2"></i>
              VOLVER AL LOGIN
            </Link>
            
            <Link
              :href="route('register')"
              class="zenthoria-btn zenthoria-btn-ghost"
            >
              <i class="mdi mdi-account-plus mr-2"></i>
              CREAR CUENTA
            </Link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Head, Link, useForm } from '@inertiajs/vue3'

// Estado del formulario
const form = useForm({
  email: '',
})

// Métodos
const submit = () => {
  form.post(route('password.email'))
}
</script>

<style scoped>
/* Usar los mismos estilos base de la página de login/registro */
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
    radial-gradient(2px 2px at 120px 60px, rgba(182, 161, 228, 0.5), transparent);
  background-repeat: repeat;
  background-size: 250px 250px;
  animation: float 25s ease-in-out infinite;
}

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

.zenthoria-btn-ghost {
  background: transparent;
  color: #B3B3B3;
  border: 1px solid rgba(179, 179, 179, 0.3);
}

.zenthoria-btn-ghost:hover {
  color: #E6E6E6;
  border-color: rgba(230, 230, 230, 0.5);
  background: rgba(230, 230, 230, 0.05);
}

.w-full {
  width: 100%;
}

.auth-submit {
  margin-top: 1rem;
  padding: 1rem 2rem;
  font-size: 1rem;
}

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

.general-error, .general-success {
  margin-top: 1rem;
  padding: 0.75rem;
  border-radius: 6px;
}

.general-error {
  background: rgba(255, 107, 107, 0.1);
  border: 1px solid rgba(255, 107, 107, 0.3);
}

.general-success {
  background: rgba(76, 175, 80, 0.1);
  border: 1px solid rgba(76, 175, 80, 0.3);
}

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

.auth-footer {
  text-align: center;
}

.footer-links {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

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

@media (max-width: 768px) {
  .zenthoria-auth-container {
    padding: 1rem;
  }
  
  .auth-header {
    position: relative;
    top: 0;
    margin-bottom: 2rem;
  }
  
  .auth-panel-single {
    margin-top: 0;
  }
  
  .auth-panel {
    padding: 2rem;
  }
  
  .footer-links {
    flex-direction: column;
  }
}
</style> 700;
  letter-spacing: 2px;
  text-transform: uppercase;
}

.zenthoria-title {
  background: linear-gradient(45deg, #6EC1E4, #B6A1E4);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.auth-panel-single {
  max-width: 500px;
  width: 100%;
  margin-top: 6rem;
}

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

.auth-form {
  margin-bottom: 2rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: #C7B88A;
  font-size: 0.8rem;
  font-weight: 600;
  letter-spacing: 1px;
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

.zenthoria-input {
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

.zenthoria-input:focus {
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

.zenthoria-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-family: inherit;
  font-weight: