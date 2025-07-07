// src/app/student/inventory/page.tsx
'use client'

import { motion } from 'framer-motion'
import { CubeIcon, SparklesIcon } from '@heroicons/react/24/outline'
import { StudentBackButton } from '@/components/ui/StudentBackButton'

export default function StudentInventoryPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-arc-900 via-slate-900 to-void-800 p-8">
      <div className="max-w-7xl mx-auto">
        <StudentBackButton className="mb-6" />
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-20"
        >
          <CubeIcon className="w-24 h-24 text-purple-500 mx-auto mb-6" />
          <h1 className="text-4xl font-bold text-white mb-4">Inventario</h1>
          <p className="text-xl text-gray-300 mb-8">
            Tu inventario de items y equipamiento llegará pronto
          </p>
          <div className="bg-white/10 rounded-xl p-8 border border-white/20 max-w-2xl mx-auto">
            <SparklesIcon className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
            <h3 className="text-2xl font-semibold text-white mb-4">Próximamente</h3>
            <ul className="text-left text-gray-300 space-y-2 max-w-md mx-auto">
              <li>• Gestiona tu equipamiento</li>
              <li>• Colecciona items únicos</li>
              <li>• Mejora tus estadísticas</li>
              <li>• Personaliza tu apariencia</li>
              <li>• Intercambia con otros Guardianes</li>
            </ul>
          </div>
        </motion.div>
      </div>
    </div>
  )
}