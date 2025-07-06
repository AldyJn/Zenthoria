// src/app/student/dashboard/page.tsx
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Dashboard Estudiante - Zenthoria',
  description: 'Panel de control para estudiantes en Zenthoria',
}

export default function StudentDashboard() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-void-900 via-slate-900 to-arc-800 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center text-white">
          <h1 className="text-4xl font-bold mb-4">Dashboard del Estudiante</h1>
          <p className="text-xl text-gray-300 mb-8">
            ¡Bienvenido, Guardián! Aquí podrás ver tus clases, personajes y progreso.
          </p>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/20">
            <h2 className="text-2xl font-semibold mb-4">🚧 En Construcción</h2>
            <p className="text-gray-300">
              El dashboard del estudiante estará disponible en el siguiente prompt.
              El sistema de autenticación está completamente funcional.
            </p>
            
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-void-500/20 p-4 rounded-lg border border-void-500/30">
                <h3 className="font-medium text-void-200">Mis Clases</h3>
                <p className="text-sm text-gray-300 mt-2">Unirse y ver clases disponibles</p>
              </div>
              
              <div className="bg-arc-500/20 p-4 rounded-lg border border-arc-500/30">
                <h3 className="font-medium text-arc-200">Mi Personaje</h3>
                <p className="text-sm text-gray-300 mt-2">Crear y personalizar tu Guardián</p>
              </div>
              
              <div className="bg-stasis-500/20 p-4 rounded-lg border border-stasis-500/30">
                <h3 className="font-medium text-stasis-200">Progreso</h3>
                <p className="text-sm text-gray-300 mt-2">Ver estadísticas y logros</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}