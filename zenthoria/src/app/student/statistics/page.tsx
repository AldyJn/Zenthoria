// src/app/student/statistics/page.tsx
'use client'

import { motion } from 'framer-motion'
import { ChartBarIcon, TrophyIcon } from '@heroicons/react/24/outline'
import { StudentBackButton } from '@/components/ui/StudentBackButton'

export default function StudentStatisticsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-arc-900 via-slate-900 to-void-800 p-8">
      <div className="max-w-7xl mx-auto">
        <StudentBackButton className="mb-6" />
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="text-center mb-12">
            <ChartBarIcon className="w-24 h-24 text-green-500 mx-auto mb-6" />
            <h1 className="text-4xl font-bold text-white mb-4">Estadísticas</h1>
            <p className="text-xl text-gray-300">
              Analiza tu progreso y rendimiento detallado
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <StatCard title="Tiempo Jugado" value="0h" icon="⏱️" color="from-blue-500 to-cyan-600" />
            <StatCard title="XP Total" value="0" icon="⭐" color="from-yellow-500 to-orange-600" />
            <StatCard title="Misiones" value="0" icon="🎯" color="from-green-500 to-emerald-600" />
            <StatCard title="Ranking" value="N/A" icon="🏆" color="from-purple-500 to-violet-600" />
          </div>

          <div className="bg-white/10 rounded-xl p-8 border border-white/20">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center space-x-3">
              <TrophyIcon className="w-6 h-6" />
              <span>Estadísticas Detalladas</span>
            </h2>
            <div className="text-center py-12">
              <p className="text-gray-400 text-lg">
                Las estadísticas detalladas estarán disponibles cuando comiences tu aventura
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

interface StatCardProps {
  title: string
  value: string | number
  icon: string
  color: string
}

function StatCard({ title, value, icon, color }: StatCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className="relative overflow-hidden rounded-xl border border-white/20 bg-white/5 p-6"
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-10`} />
      <div className="relative z-10">
        <div className="text-3xl mb-2">{icon}</div>
        <h3 className="text-gray-400 text-sm font-medium mb-1">{title}</h3>
        <p className="text-2xl font-bold text-white">{value}</p>
      </div>
    </motion.div>
  )
}