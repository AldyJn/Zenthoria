import { Metadata } from 'next'
import Link from 'next/link'
import { motion } from 'framer-motion'

export const metadata: Metadata = {
  title: 'Zenthoria - Plataforma Educativa Gamificada',
  description: 'Transforma la educación con una experiencia gamificada única',
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-void-900 via-slate-900 to-arc-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Efectos de fondo */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-solar-500/10 rounded-full blur-xl animate-pulse-slow" />
          <div className="absolute top-3/4 right-1/4 w-24 h-24 bg-arc-500/10 rounded-full blur-xl animate-bounce-slow" />
          <div className="absolute top-1/2 right-1/3 w-20 h-20 bg-void-500/10 rounded-full blur-xl animate-glow" />
        </div>

        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 text-center">
          {/* Logo */}
          <div className="w-24 h-24 bg-gradient-to-br from-solar-400 to-arc-500 rounded-full flex items-center justify-center mb-8 shadow-2xl shadow-arc-500/25">
            <span className="text-3xl font-bold text-white">Z</span>
          </div>

          {/* Título principal */}
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 tracking-tight">
            <span className="bg-gradient-to-r from-solar-400 via-arc-400 to-void-400 bg-clip-text text-transparent">
              Zenthoria
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-gray-300 mb-4 max-w-3xl">
            Plataforma de educación gamificada
          </p>

          <p className="text-lg text-gray-400 mb-12 max-w-2xl">
            Transforma el aprendizaje en una aventura épica donde profesores y estudiantes 
            se convierten en Guardianes del conocimiento
          </p>

          {/* Botones de acción */}
          <div className="flex flex-col sm:flex-row gap-4 mb-16">
            <Link
              href="/auth/register"
              className="px-8 py-4 bg-gradient-to-r from-arc-500 to-void-500 text-white font-semibold rounded-lg shadow-lg hover:shadow-arc-500/25 transform hover:scale-105 transition-all duration-200"
            >
              Comenzar Aventura
            </Link>
            
            <Link
              href="/auth/login"
              className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white font-semibold rounded-lg border border-white/20 hover:bg-white/20 transition-all duration-200"
            >
              Iniciar Sesión
            </Link>
          </div>

          {/* Características */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl">
            <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20">
              <div className="w-12 h-12 bg-solar-500/20 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">👨‍🏫</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Para Profesores</h3>
              <p className="text-gray-300 text-sm">
                Crea clases gamificadas, gestiona estudiantes y usa herramientas de selección aleatoria
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20">
              <div className="w-12 h-12 bg-arc-500/20 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">👨‍🎓</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Para Estudiantes</h3>
              <p className="text-gray-300 text-sm">
                Crea tu personaje, únete a clases y progresa en tu aventura educativa
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20">
              <div className="w-12 h-12 bg-void-500/20 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">⚡</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Gamificación</h3>
              <p className="text-gray-300 text-sm">
                Sistema de niveles, poderes, accesorios y selecciones aleatorias para hacer el aprendizaje divertido
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 bg-black/20 border-t border-white/10 py-8">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className="text-gray-400 text-sm">
            © 2024 Zenthoria. Plataforma educativa gamificada.
          </p>
          <div className="mt-4 flex justify-center gap-6 text-sm">
            <Link href="/terms" className="text-gray-400 hover:text-white transition-colors">
              Términos de Servicio
            </Link>
            <Link href="/privacy" className="text-gray-400 hover:text-white transition-colors">
              Política de Privacidad
            </Link>
            <Link href="/about" className="text-gray-400 hover:text-white transition-colors">
              Acerca de
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}