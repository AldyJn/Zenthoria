<!-- resources/js/Pages/Welcome.vue -->
<template>
  <Head title="Zenthoria - Plataforma Educativa Gamificada" />

  <div class="zenthoria-landing">
    <!-- Navigation Header -->
    <header class="zenthoria-header">
      <div class="header-container">
        <div class="header-left">
          <div class="zenthoria-logo">
            <div class="logo-emblem">
              <i class="mdi mdi-sword-cross"></i>
            </div>
            <h1 class="logo-text">ZENTHORIA</h1>
          </div>
        </div>
        
        <nav class="header-nav">
          <a href="#caracteristicas" class="nav-link">CARACTERÍSTICAS</a>
          <a href="#como-funciona" class="nav-link">CÓMO FUNCIONA</a>
          <a href="#contacto" class="nav-link">CONTACTO</a>
        </nav>
        
        <div class="header-auth">
          <Link 
            v-if="canLogin" 
            :href="route('login')" 
            class="zenthoria-btn zenthoria-btn-outline"
          >
            INICIAR SESIÓN
          </Link>
          <Link 
            v-if="canRegister" 
            :href="route('register')" 
            class="zenthoria-btn zenthoria-btn-primary"
          >
            REGISTRARSE
          </Link>
        </div>
      </div>
    </header>

    <!-- Hero Section -->
    <section class="hero-section">
      <div class="hero-background">
        <div class="hero-particles"></div>
        <div class="hero-gradient"></div>
      </div>
      
      <div class="hero-content">
        <div class="hero-left">
          <div class="hero-badge">
            <i class="mdi mdi-new-box"></i>
            <span>Educación del Futuro</span>
          </div>
          
          <h1 class="hero-title">
            TRANSFORMA LA
            <span class="hero-highlight">EDUCACIÓN</span>
            CON GAMIFICACIÓN
          </h1>
          
          <p class="hero-description">
            Zenthoria revoluciona el aprendizaje combinando mecánicas de RPG con educación avanzada. 
            Crea personajes únicos, completa misiones educativas y evoluciona como Guardián del Conocimiento.
          </p>
          
          <div class="hero-actions">
            <Link 
              :href="route('register')" 
              class="zenthoria-btn zenthoria-btn-large zenthoria-btn-primary"
            >
              <i class="mdi mdi-rocket-launch"></i>
              COMENZAR AVENTURA
            </Link>
            
            <button class="zenthoria-btn zenthoria-btn-large zenthoria-btn-outline">
              <i class="mdi mdi-play-circle"></i>
              VER DEMO
            </button>
          </div>
          
          <div class="hero-stats">
            <div class="stat-item">
              <div class="stat-number">2,500+</div>
              <div class="stat-label">Estudiantes Activos</div>
            </div>
            <div class="stat-item">
              <div class="stat-number">150+</div>
              <div class="stat-label">Instituciones</div>
            </div>
            <div class="stat-item">
              <div class="stat-number">50k+</div>
              <div class="stat-label">Misiones Completadas</div>
            </div>
          </div>
        </div>
        
        <div class="hero-right">
          <div class="hero-visual">
            <div class="character-showcase">
              <div class="character-frame">
                <div class="character-avatar">
                  <i class="mdi mdi-account-circle"></i>
                </div>
                <div class="character-info">
                  <div class="character-name">Guardián Elite</div>
                  <div class="character-level">Nivel 47</div>
                  <div class="character-exp">
                    <div class="exp-bar">
                      <div class="exp-fill" style="width: 73%"></div>
                    </div>
                    <span>2,847 / 3,900 EXP</span>
                  </div>
                </div>
              </div>
              
              <div class="achievement-popup">
                <i class="mdi mdi-trophy achievement-icon"></i>
                <div class="achievement-text">
                  <div class="achievement-title">¡Logro Desbloqueado!</div>
                  <div class="achievement-desc">Maestro de Matemáticas</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section id="caracteristicas" class="features-section">
      <div class="section-container">
        <div class="section-header">
          <h2 class="section-title">CARACTERÍSTICAS ÉPICAS</h2>
          <p class="section-subtitle">
            Descubre el poder de la gamificación educativa con herramientas diseñadas para inspirar y motivar
          </p>
        </div>
        
        <div class="features-grid">
          <div class="feature-card" v-for="feature in features" :key="feature.id">
            <div class="feature-icon">
              <i :class="feature.icon"></i>
            </div>
            <h3 class="feature-title">{{ feature.title }}</h3>
            <p class="feature-description">{{ feature.description }}</p>
            <div class="feature-accent"></div>
          </div>
        </div>
      </div>
    </section>

    <!-- How It Works Section -->
    <section id="como-funciona" class="how-it-works-section">
      <div class="section-container">
        <div class="section-header">
          <h2 class="section-title">CÓMO FUNCIONA LA MAGIA</h2>
          <p class="section-subtitle">
            Tres pasos simples para transformar tu experiencia educativa
          </p>
        </div>
        
        <div class="steps-timeline">
          <div class="step-item" v-for="(step, index) in steps" :key="index">
            <div class="step-number">{{ index + 1 }}</div>
            <div class="step-content">
              <h3 class="step-title">{{ step.title }}</h3>
              <p class="step-description">{{ step.description }}</p>
            </div>
            <div v-if="index < steps.length - 1" class="step-connector"></div>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="cta-section">
      <div class="cta-background">
        <div class="cta-particles"></div>
      </div>
      
      <div class="cta-content">
        <h2 class="cta-title">¿LISTO PARA LA AVENTURA?</h2>
        <p class="cta-description">
          Únete a miles de Guardianes que ya están transformando su educación
        </p>
        
        <div class="cta-actions">
          <Link 
            :href="route('register')" 
            class="zenthoria-btn zenthoria-btn-xlarge zenthoria-btn-primary"
          >
            <i class="mdi mdi-sword-cross"></i>
            CREAR CUENTA GRATUITA
          </Link>
        </div>
        
        <div class="cta-note">
          <i class="mdi mdi-shield-check"></i>
          <span>Sin compromisos • Gratis para siempre • Soporte 24/7</span>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer id="contacto" class="zenthoria-footer">
      <div class="footer-container">
        <div class="footer-main">
          <div class="footer-brand">
            <div class="zenthoria-logo">
              <div class="logo-emblem">
                <i class="mdi mdi-sword-cross"></i>
              </div>
              <h3 class="logo-text">ZENTHORIA</h3>
            </div>
            <p class="footer-description">
              La plataforma educativa gamificada que está redefiniendo el futuro del aprendizaje.
            </p>
          </div>
          
          <div class="footer-links">
            <div class="footer-column">
              <h4 class="footer-column-title">Plataforma</h4>
              <a href="#" class="footer-link">Características</a>
              <a href="#" class="footer-link">Precios</a>
              <a href="#" class="footer-link">Integraciones</a>
              <a href="#" class="footer-link">API</a>
            </div>
            
            <div class="footer-column">
              <h4 class="footer-column-title">Recursos</h4>
              <a href="#" class="footer-link">Documentación</a>
              <a href="#" class="footer-link">Guías</a>
              <a href="#" class="footer-link">Blog</a>
              <a href="#" class="footer-link">Soporte</a>
            </div>
            
            <div class="footer-column">
              <h4 class="footer-column-title">Empresa</h4>
              <a href="#" class="footer-link">Acerca de</a>
              <a href="#" class="footer-link">Carreras</a>
              <a href="#" class="footer-link">Prensa</a>
              <a href="#" class="footer-link">Contacto</a>
            </div>
          </div>
        </div>
        
        <div class="footer-bottom">
          <div class="footer-copyright">
            <p>&copy; 2025 Zenthoria. Todos los derechos reservados.</p>
          </div>
          <div class="footer-social">
            <a href="#" class="social-link"><i class="mdi mdi-twitter"></i></a>
            <a href="#" class="social-link"><i class="mdi mdi-linkedin"></i></a>
            <a href="#" class="social-link"><i class="mdi mdi-discord"></i></a>
            <a href="#" class="social-link"><i class="mdi mdi-github"></i></a>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { Head, Link } from '@inertiajs/vue3'

defineProps({
  canLogin: Boolean,
  canRegister: Boolean,
  features: Array,
})

const features = [
  {
    id: 1,
    icon: 'mdi mdi-account-circle text-4xl text-blue-400',
    title: 'Personajes RPG',
    description: 'Crea y personaliza tu avatar único con clases, niveles y habilidades especiales que evolucionan con tu aprendizaje.'
  },
  {
    id: 2,
    icon: 'mdi mdi-trophy text-4xl text-yellow-400',
    title: 'Sistema de Logros',
    description: 'Desbloquea badges, títulos y recompensas mientras completas misiones y alcanzas objetivos académicos.'
  },
  {
    id: 3,
    icon: 'mdi mdi-sword text-4xl text-purple-400',
    title: 'Misiones Educativas',
    description: 'Transforma tareas y proyectos en emocionantes misiones con narrativas envolventes y desafíos progresivos.'
  },
  {
    id: 4,
    icon: 'mdi mdi-chart-line text-4xl text-green-400',
    title: 'Análisis en Tiempo Real',
    description: 'Monitorea el progreso con dashboards interactivos y métricas detalladas de rendimiento académico.'
  },
  {
    id: 5,
    icon: 'mdi mdi-qrcode-scan text-4xl text-cyan-400',
    title: 'Códigos QR Mágicos',
    description: 'Únete a clases instantáneamente escaneando códigos QR únicos generados por tus instructores.'
  },
  {
    id: 6,
    icon: 'mdi mdi-account-group text-4xl text-red-400',
    title: 'Colaboración Social',
    description: 'Forma equipos, compite en rankings y colabora en proyectos grupales con herramientas sociales integradas.'
  }
]

const steps = [
  {
    title: 'Crea tu Guardián',
    description: 'Regístrate y diseña tu personaje único con atributos especiales y una clase RPG personalizada.'
  },
  {
    title: 'Únete a tu Academia',
    description: 'Escanea el código QR de tu instructor o ingresa el código de clase para comenzar tu aventura educativa.'
  },
  {
    title: 'Completa Misiones',
    description: 'Participa en actividades gamificadas, gana experiencia y desbloquea nuevos niveles de conocimiento.'
  }
]
</script>

<style scoped>
/* Zenthoria Landing Page Styles - Destiny 2 Inspired */
.zenthoria-landing {
  min-height: 100vh;
  background: linear-gradient(135deg, #0a0b13 0%, #1e2139 50%, #0f1419 100%);
  color: #E6E6E6;
  font-family: 'Exo 2', 'Helvetica', sans-serif;
  overflow-x: hidden;
}

/* Header Navigation */
.zenthoria-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  background: rgba(10, 11, 19, 0.95);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(110, 193, 228, 0.2);
  transition: all 0.3s ease;
}

.header-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem 2rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.zenthoria-logo {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.logo-emblem {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #6EC1E4, #B6A1E4);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #0a0b13;
  font-size: 1.5rem;
  box-shadow: 0 0 20px rgba(110, 193, 228, 0.3);
}

.logo-text {
  font-size: 1.5rem;
  font-weight: 700;
  background: linear-gradient(45deg, #6EC1E4, #B6A1E4);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  letter-spacing: 2px;
}

.header-nav {
  display: flex;
  gap: 2rem;
}

.nav-link {
  color: #C7B88A;
  text-decoration: none;
  font-weight: 500;
  font-size: 0.9rem;
  letter-spacing: 1px;
  transition: color 0.3s ease;
  position: relative;
}

.nav-link:hover {
  color: #6EC1E4;
}

.nav-link::after {
  content: '';
  position: absolute;
  bottom: -4px;
  left: 0;
  width: 0;
  height: 2px;
  background: linear-gradient(45deg, #6EC1E4, #B6A1E4);
  transition: width 0.3s ease;
}

.nav-link:hover::after {
  width: 100%;
}

.header-auth {
  display: flex;
  gap: 1rem;
}

/* Buttons */
.zenthoria-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 6px;
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

.zenthoria-btn-primary:hover {
  background: linear-gradient(135deg, #5A9BD4, #4A8BC2);
  box-shadow: 0 6px 20px rgba(110, 193, 228, 0.4);
  transform: translateY(-2px);
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

.zenthoria-btn-large {
  padding: 1rem 2rem;
  font-size: 1rem;
}

.zenthoria-btn-xlarge {
  padding: 1.25rem 2.5rem;
  font-size: 1.1rem;
}

/* Hero Section */
.hero-section {
  min-height: 100vh;
  display: flex;
  align-items: center;
  position: relative;
  padding: 8rem 2rem 4rem;
}

.hero-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: -1;
}

.hero-particles {
  position: absolute;
  width: 100%;
  height: 100%;
  background-image: 
    radial-gradient(2px 2px at 20px 30px, rgba(110, 193, 228, 0.4), transparent),
    radial-gradient(3px 3px at 40px 70px, rgba(199, 184, 138, 0.3), transparent),
    radial-gradient(1px 1px at 90px 40px, rgba(182, 161, 228, 0.5), transparent),
    radial-gradient(2px 2px at 130px 80px, rgba(110, 193, 228, 0.3), transparent);
  background-repeat: repeat;
  background-size: 200px 200px;
  animation: float 20s ease-in-out infinite;
}

.hero-gradient {
  position: absolute;
  width: 100%;
  height: 100%;
  background: radial-gradient(ellipse at center, rgba(110, 193, 228, 0.1) 0%, transparent 50%);
}

@keyframes float {
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-20px) rotate(1deg); }
}

.hero-content {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
  align-items: center;
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: rgba(110, 193, 228, 0.1);
  border: 1px solid rgba(110, 193, 228, 0.3);
  border-radius: 20px;
  color: #6EC1E4;
  font-size: 0.9rem;
  font-weight: 500;
  margin-bottom: 2rem;
}

.hero-title {
  font-size: 3.5rem;
  font-weight: 800;
  line-height: 1.1;
  margin-bottom: 1.5rem;
  color: #E6E6E6;
}

.hero-highlight {
  background: linear-gradient(45deg, #6EC1E4, #B6A1E4);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  display: block;
}

.hero-description {
  font-size: 1.2rem;
  line-height: 1.6;
  color: #B3B3B3;
  margin-bottom: 2.5rem;
}

.hero-actions {
  display: flex;
  gap: 1rem;
  margin-bottom: 3rem;
}

.hero-stats {
  display: flex;
  gap: 2rem;
}

.stat-item {
  text-align: center;
}

.stat-number {
  font-size: 2rem;
  font-weight: 700;
  color: #6EC1E4;
  margin-bottom: 0.25rem;
}

.stat-label {
  font-size: 0.9rem;
  color: #B3B3B3;
  text-transform: uppercase;
  letter-spacing: 1px;
}

/* Hero Visual */
.hero-visual {
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
}

.character-showcase {
  position: relative;
  animation: float 6s ease-in-out infinite;
}

.character-frame {
  background: rgba(30, 33, 57, 0.8);
  border: 2px solid rgba(110, 193, 228, 0.3);
  border-radius: 16px;
  padding: 2rem;
  backdrop-filter: blur(10px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
}

.character-avatar {
  width: 120px;
  height: 120px;
  background: linear-gradient(135deg, #6EC1E4, #B6A1E4);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 4rem;
  color: #0a0b13;
  margin: 0 auto 1rem;
  box-shadow: 0 0 30px rgba(110, 193, 228, 0.4);
}

.character-info {
  text-align: center;
}

.character-name {
  font-size: 1.3rem;
  font-weight: 600;
  color: #E6E6E6;
  margin-bottom: 0.5rem;
}

.character-level {
  color: #C7B88A;
  font-size: 1rem;
  margin-bottom: 1rem;
}

.character-exp {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  align-items: center;
}

.exp-bar {
  width: 200px;
  height: 8px;
  background: rgba(110, 193, 228, 0.2);
  border-radius: 4px;
  overflow: hidden;
}

.exp-fill {
  height: 100%;
  background: linear-gradient(90deg, #6EC1E4, #B6A1E4);
  border-radius: 4px;
  transition: width 0.3s ease;
}

.achievement-popup {
  position: absolute;
  top: -20px;
  right: -40px;
  background: rgba(182, 161, 228, 0.9);
  color: #0a0b13;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  font-weight: 600;
  box-shadow: 0 8px 16px rgba(182, 161, 228, 0.3);
  animation: bounce 2s ease-in-out infinite;
}

.achievement-icon {
  font-size: 1.2rem;
  color: #C7B88A;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
}

/* Features Section */
.features-section {
  padding: 8rem 2rem;
  background: rgba(30, 33, 57, 0.3);
}

.section-container {
  max-width: 1200px;
  margin: 0 auto;
}

.section-header {
  text-align: center;
  margin-bottom: 4rem;
}

.section-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #E6E6E6;
  margin-bottom: 1rem;
}

.section-subtitle {
  font-size: 1.2rem;
  color: #B3B3B3;
  max-width: 600px;
  margin: 0 auto;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 2rem;
}

.feature-card {
  background: rgba(30, 33, 57, 0.6);
  border: 1px solid rgba(110, 193, 228, 0.2);
  border-radius: 12px;
  padding: 2rem;
  position: relative;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

.feature-card:hover {
  transform: translateY(-8px);
  border-color: rgba(110, 193, 228, 0.4);
  box-shadow: 0 20px 40px rgba(110, 193, 228, 0.1);
}

.feature-icon {
  margin-bottom: 1.5rem;
}

.feature-title {
  font-size: 1.3rem;
  font-weight: 600;
  color: #E6E6E6;
  margin-bottom: 1rem;
}

.feature-description {
  color: #B3B3B3;
  line-height: 1.6;
}

.feature-accent {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, #6EC1E4, #B6A1E4);
  border-radius: 0 0 12px 12px;
  transform: scaleX(0);
  transition: transform 0.3s ease;
}

.feature-card:hover .feature-accent {
  transform: scaleX(1);
}

/* How It Works Section */
.how-it-works-section {
  padding: 8rem 2rem;
}

.steps-timeline {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 2rem;
  max-width: 1000px;
  margin: 0 auto;
}

.step-item {
  flex: 1;
  text-align: center;
  position: relative;
}

.step-number {
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, #6EC1E4, #B6A1E4);
  color: #0a0b13;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0 auto 1.5rem;
  box-shadow: 0 8px 16px rgba(110, 193, 228, 0.3);
}

.step-title {
  font-size: 1.3rem;
  font-weight: 600;
  color: #E6E6E6;
  margin-bottom: 0.75rem;
}

.step-description {
  color: #B3B3B3;
  line-height: 1.6;
}

.step-connector {
  position: absolute;
  top: 30px;
  right: -50%;
  width: 100%;
  height: 2px;
  background: linear-gradient(90deg, #6EC1E4, #B6A1E4);
  z-index: -1;
}

/* CTA Section */
.cta-section {
  padding: 8rem 2rem;
  position: relative;
  background: rgba(10, 11, 19, 0.8);
}

.cta-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: -1;
}

.cta-particles {
  position: absolute;
  width: 100%;
  height: 100%;
  background-image: 
    radial-gradient(3px 3px at 30px 40px, rgba(110, 193, 228, 0.6), transparent),
    radial-gradient(2px 2px at 60px 80px, rgba(199, 184, 138, 0.4), transparent),
    radial-gradient(2px 2px at 120px 60px, rgba(182, 161, 228, 0.7), transparent);
  background-repeat: repeat;
  background-size: 150px 150px;
  animation: float 15s ease-in-out infinite reverse;
}

.cta-content {
  max-width: 800px;
  margin: 0 auto;
  text-align: center;
}

.cta-title {
  font-size: 3rem;
  font-weight: 800;
  color: #E6E6E6;
  margin-bottom: 1.5rem;
  background: linear-gradient(45deg, #6EC1E4, #B6A1E4);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.cta-description {
  font-size: 1.3rem;
  color: #B3B3B3;
  margin-bottom: 3rem;
  line-height: 1.6;
}

.cta-actions {
  margin-bottom: 2rem;
}

.cta-note {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  color: #C7B88A;
  font-size: 0.9rem;
}

/* Footer */
.zenthoria-footer {
  background: rgba(10, 11, 19, 0.95);
  border-top: 1px solid rgba(110, 193, 228, 0.2);
  padding: 4rem 2rem 2rem;
}

.footer-container {
  max-width: 1200px;
  margin: 0 auto;
}

.footer-main {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 4rem;
  margin-bottom: 3rem;
}

.footer-brand {
  max-width: 400px;
}

.footer-description {
  color: #B3B3B3;
  line-height: 1.6;
  margin-top: 1rem;
}

.footer-links {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
}

.footer-column-title {
  color: #E6E6E6;
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 1rem;
}

.footer-link {
  display: block;
  color: #B3B3B3;
  text-decoration: none;
  margin-bottom: 0.5rem;
  transition: color 0.3s ease;
}

.footer-link:hover {
  color: #6EC1E4;
}

.footer-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 2rem;
  border-top: 1px solid rgba(110, 193, 228, 0.1);
}

.footer-copyright {
  color: #B3B3B3;
  font-size: 0.9rem;
}

.footer-social {
  display: flex;
  gap: 1rem;
}

.social-link {
  width: 40px;
  height: 40px;
  background: rgba(110, 193, 228, 0.1);
  border: 1px solid rgba(110, 193, 228, 0.2);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6EC1E4;
  text-decoration: none;
  transition: all 0.3s ease;
}

.social-link:hover {
  background: rgba(110, 193, 228, 0.2);
  border-color: rgba(110, 193, 228, 0.4);
  transform: translateY(-2px);
}

/* Responsive Design */
@media (max-width: 768px) {
  .header-container {
    padding: 1rem;
  }
  
  .header-nav {
    display: none;
  }
  
  .hero-content {
    grid-template-columns: 1fr;
    gap: 2rem;
    text-align: center;
  }
  
  .hero-title {
    font-size: 2.5rem;
  }
  
  .hero-actions {
    flex-direction: column;
    align-items: center;
  }
  
  .hero-stats {
    justify-content: center;
  }
  
  .features-grid {
    grid-template-columns: 1fr;
  }
  
  .steps-timeline {
    flex-direction: column;
    gap: 3rem;
  }
  
  .step-connector {
    display: none;
  }
  
  .footer-main {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
  
  .footer-links {
    grid-template-columns: 1fr;
  }
  
  .footer-bottom {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }
}

@media (max-width: 480px) {
  .hero-title {
    font-size: 2rem;
  }
  
  .cta-title {
    font-size: 2.5rem;
  }
  
  .zenthoria-btn-xlarge {
    padding: 1rem 1.5rem;
    font-size: 1rem;
  }
}

/* Smooth scrolling */
html {
  scroll-behavior: smooth;
}

/* Custom scrollbar */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: #1B1C29;
}

::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, #6EC1E4, #B6A1E4);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(180deg, #5A9BD4, #9A85D4);
}
</style>