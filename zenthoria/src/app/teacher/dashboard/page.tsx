// src/app/teacher/dashboard/page.tsx
import { Metadata } from 'next'
import { useAuth } from '@/hooks/useAuth'
import { ZenthoriaLoading } from '@/components/ui/LoadingSpinner'

export const metadata: Metadata = {
  title: 'Dashboard Profesor - Zenthoria',
  description: 'Panel de control para profesores en Zenthoria',
}

export default function TeacherDashboard() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-solar-900 via-slate-900 to-solar-800 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center text-white">
          <h1 className="text-4xl font-bold mb-4">Dashboard del Profesor</h1>
          <p className="text-xl text-gray-300 mb-8">
            ¡Bienvenido, Guardián Instructor! Aquí podrás gestionar tus clases y estudiantes.
          </p>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/20">
            <h2 className="text-2xl font-semibold mb-4">🚧 En Construcción</h2>
            <p className="text-gray-300">
              El dashboard del profesor estará disponible en el siguiente prompt.
              El sistema de autenticación está completamente funcional.
            </p>
            
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-solar-500/20 p-4 rounded-lg border border-solar-500/30">
                <h3 className="font-medium text-solar-200">Gestionar Clases</h3>
                <p className="text-sm text-gray-300 mt-2">Crear y administrar tus clases</p>
              </div>
              
              <div className="bg-arc-500/20 p-4 rounded-lg border border-arc-500/30">
                <h3 className="font-medium text-arc-200">Ver Estudiantes</h3>
                <p className="text-sm text-gray-300 mt-2">Monitor del progreso estudiantil</p>
              </div>
              
              <div className="bg-void-500/20 p-4 rounded-lg border border-void-500/30">
                <h3 className="font-medium text-void-200">Selecciones Aleatorias</h3>
                <p className="text-sm text-gray-300 mt-2">Sistema de participación gamificado</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}