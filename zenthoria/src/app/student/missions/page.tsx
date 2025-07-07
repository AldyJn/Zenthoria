// src/app/student/missions/page.tsx
'use client'

import { motion } from 'framer-motion'
import { RocketLaunchIcon, FireIcon, StarIcon } from '@heroicons/react/24/outline'
import { StudentBackButton } from '@/components/ui/StudentBackButton'

export default function StudentMissionsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-arc-900 via-slate-900 to-void-800 p-8">
      <div className="max-w-7xl mx-auto">
        <StudentBackButton className="mb-6" />
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-20"
        >
          <RocketLaunchIcon className="w-24 h-24 text-arc-500 mx-auto mb-6" />
          <h1 className="text-4xl font-bold text-white mb-4">Misiones</h1>
          <p className="text-xl text-gray-300 mb-8">
            Las misiones estarán disponibles próximamente
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
            <div className="bg-white/10 rounded-xl p-6 border border-white/20">
              <FireIcon className="w-12 h-12 text-orange-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Misiones Diarias</h3>
              <p className="text-gray-400 text-sm">Completa tareas diarias para ganar XP</p>
            </div>
            <div className="bg-white/10 rounded-xl p-6 border border-white/20">
              <StarIcon className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Misiones de Clase</h3>
              <p className="text-gray-400 text-sm">Participa en actividades de tu clase</p>
            </div>
            <div className="bg-white/10 rounded-xl p-6 border border-white/20">
              <RocketLaunchIcon className="w-12 h-12 text-purple-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Misiones Épicas</h3>
              <p className="text-gray-400 text-sm">Desafíos especiales con grandes recompensas</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}