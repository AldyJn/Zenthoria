<!-- resources/js/Layouts/AuthenticatedLayout.vue -->
<template>
  <v-app>
    <!-- Navigation Drawer -->
    <v-navigation-drawer
      v-model="drawer"
      :rail="rail"
      permanent
      @click="rail = false"
    >
      <v-list-item
        prepend-avatar="/images/logo.png"
        :title="appName"
        :subtitle="userRole"
        nav
      >
        <template v-slot:append>
          <v-btn
            variant="text"
            icon="mdi-chevron-left"
            @click.stop="rail = !rail"
          ></v-btn>
        </template>
      </v-list-item>

      <v-divider></v-divider>

      <v-list density="compact" nav>
        <!-- Dashboard -->
        <v-list-item
          prepend-icon="mdi-view-dashboard"
          title="Dashboard"
          :to="route('dashboard')"
          exact
        ></v-list-item>

        <!-- Clases -->
        <v-list-group value="clases">
          <template v-slot:activator="{ props }">
            <v-list-item
              v-bind="props"
              prepend-icon="mdi-google-classroom"
              title="Clases"
            ></v-list-item>
          </template>

          <v-list-item
            prepend-icon="mdi-format-list-bulleted"
            title="Mis Clases"
            :to="route('clases.index')"
          ></v-list-item>

          <v-list-item
            v-if="$page.props.auth.user.tipo_usuario === 'docente'"
            prepend-icon="mdi-plus"
            title="Crear Clase"
            :to="route('clases.create')"
          ></v-list-item>

          <v-list-item
            v-if="$page.props.auth.user.tipo_usuario === 'estudiante'"
            prepend-icon="mdi-qrcode-scan"
            title="Unirse a Clase"
            :to="route('clases.unirse.form')"
          ></v-list-item>
        </v-list-group>

        <!-- Gamificación -->
        <v-list-group value="gamificacion" v-if="$page.props.auth.user.tipo_usuario === 'estudiante'">
          <template v-slot:activator="{ props }">
            <v-list-item
              v-bind="props"
              prepend-icon="mdi-sword"
              title="Mi Personaje"
            ></v-list-item>
          </template>

          <v-list-item
            prepend-icon="mdi-account-circle"
            title="Ver Personajes"
            :to="route('personajes.index')"
          ></v-list-item>

          <v-list-item
            prepend-icon="mdi-trophy"
            title="Rankings"
            :to="route('rankings.index')"
          ></v-list-item>
        </v-list-group>

        <!-- Gestión (Solo Docentes) -->
        <v-list-group value="gestion" v-if="$page.props.auth.user.tipo_usuario === 'docente'">
          <template v-slot:activator="{ props }">
            <v-list-item
              v-bind="props"
              prepend-icon="mdi-cog"
              title="Gestión"
            ></v-list-item>
          </template>

          <v-list-item
            prepend-icon="mdi-emoticon"
            title="Comportamientos"
            :to="route('comportamientos.index')"
          ></v-list-item>
        </v-list-group>

        <!-- Reportes -->
        <v-list-item
          prepend-icon="mdi-chart-line"
          title="Reportes"
          :to="route('reportes.index')"
        ></v-list-item>
      </v-list>
    </v-navigation-drawer>

    <!-- App Bar -->
    <v-app-bar>
      <v-app-bar-nav-icon @click="drawer = !drawer"></v-app-bar-nav-icon>
      
      <v-toolbar-title>
        <slot name="header">EduApp Gamificada</slot>
      </v-toolbar-title>

      <v-spacer></v-spacer>

      <!-- Theme Toggle -->
      <v-btn
        icon
        @click="toggleTheme"
      >
        <v-icon>{{ isDark ? 'mdi-weather-sunny' : 'mdi-weather-night' }}</v-icon>
      </v-btn>

      <!-- Notifications -->
      <v-btn icon>
        <v-badge color="error" :content="notificationCount" :model-value="notificationCount > 0">
          <v-icon>mdi-bell</v-icon>
        </v-badge>
      </v-btn>

      <!-- User Menu -->
      <v-menu>
        <template v-slot:activator="{ props }">
          <v-btn
            v-bind="props"
            icon
          >
            <v-avatar>
              <v-img
                :src="$page.props.auth.user.avatar || '/images/default-avatar.png'"
                :alt="$page.props.auth.user.nombre"
              ></v-img>
            </v-avatar>
          </v-btn>
        </template>

        <v-list>
          <v-list-item :subtitle="$page.props.auth.user.correo">
            <v-list-item-title>{{ $page.props.auth.user.nombre }}</v-list-item-title>
          </v-list-item>

          <v-divider></v-divider>

          <v-list-item
            prepend-icon="mdi-account"
            title="Perfil"
            :to="route('perfil.edit')"
          ></v-list-item>

          <v-list-item
            prepend-icon="mdi-logout"
            title="Cerrar Sesión"
            @click="logout"
          ></v-list-item>
        </v-list>
      </v-menu>
    </v-app-bar>

    <!-- Main Content -->
    <v-main>
      <v-container fluid>
        <!-- Flash Messages -->
        <v-alert
          v-if="$page.props.flash?.success"
          type="success"
          variant="tonal"
          closable
          class="mb-4"
        >
          {{ $page.props.flash.success }}
        </v-alert>

        <v-alert
          v-if="$page.props.flash?.error"
          type="error"
          variant="tonal"
          closable
          class="mb-4"
        >
          {{ $page.props.flash.error }}
        </v-alert>

        <!-- Page Content -->
        <slot />
      </v-container>
    </v-main>

    <!-- Footer -->
    <v-footer app>
      <v-spacer></v-spacer>
      <div>&copy; {{ new Date().getFullYear() }} EduApp Gamificada. Todos los derechos reservados.</div>
      <v-spacer></v-spacer>
    </v-footer>
  </v-app>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useTheme } from 'vuetify'
import { router } from '@inertiajs/vue3'

// Data
const drawer = ref(true)
const rail = ref(false)
const notificationCount = ref(0)

// Theme
const theme = useTheme()
const isDark = computed(() => theme.global.name.value === 'dark')

// Computed
const appName = 'EduApp Gamificada'
const userRole = computed(() => {
  return $page.props.auth.user.tipo_usuario === 'docente' ? 'Docente' : 'Estudiante'
})

// Methods
const toggleTheme = () => {
  theme.global.name.value = isDark.value ? 'light' : 'dark'
  localStorage.setItem('theme', theme.global.name.value)
}

const logout = () => {
  router.post(route('logout'))
}

// Load saved theme
if (localStorage.getItem('theme')) {
  theme.global.name.value = localStorage.getItem('theme')
}
</script>