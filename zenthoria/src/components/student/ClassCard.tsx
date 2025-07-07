'use client'

import { motion } from 'framer-motion'
import { 
  EyeIcon,
  UserIcon,
  CalendarDaysIcon,
  SparklesIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline'
import { ClassWithDetails, StudentCharacterWithDetails } from '@/types'
import { cn } from '@/lib/utils/cn'

interface StudentClassCardProps {
  classData: ClassWithDetails
  character?: StudentCharacterWithDetails
}

export function StudentClassCard({ classData, character }: StudentClassCardProps) {
  const now = new Date()
  const startDate = new Date(classData.startDate)
  const endDate = new Date(classData.endDate)
  
  const classStatus = now < startDate ? 'upcoming' : 
                     now > endDate ? 'ended' : 'active'

  const statusConfig = {
    upcoming: {
      label: 'Próxima',
      color: 'from-blue-500 to-cyan-600',
      bgColor: 'bg-blue-500/20',
      borderColor: 'border-blue-500/30'
    },
    active: {
      label: 'Activa',
      color: 'from-emerald-500 to-green-600',
      bgColor: 'bg-emerald-500/20',
      borderColor: 'border-emerald-500/30'
    },
    ended: {
      label: 'Finalizada',
      color: 'from-gray-500 to-gray-600',
      bgColor: 'bg-gray-500/20',
      borderColor: 'border-gray-500/30'
    }
  }

  const status = statusConfig[classStatus]

  const handleViewClass = () => {
    window.location.href = `/student/classes/${classData.id}`
  }

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.02 }}
      transition={{ duration: 0.2 }}
      className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 overflow-hidden hover:border-white/30 transition-all duration-200"
    >
      {/* Header */}
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-xl font-bold text-white mb-2">{classData.name}</h3>
            {classData.description && (
              <p className="text-gray-400 text-sm line-clamp-2 mb-3">
                {classData.description}
              </p>
            )}
          </div>
          
          <div className={cn(
            "px-3 py-1 rounded-full text-xs font-medium border",
            status.bgColor,
            status.borderColor,
            "text-white"
          )}>
            {status.label}
          </div>
        </div>

        {/* Profesor */}
        <div className="mb-4">
          <p className="text-gray-400 text-xs mb-1">Profesor</p>
          <p className="text-white font-medium">
            {classData.teacher.user.firstName} {classData.teacher.user.lastName}
          </p>
        </div>

        {/* Mi Personaje */}
        {character ? (
          <div className="bg-white/5 rounded-lg p-4 mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-void-500 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold">
                  {character.characterName.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1">
                <p className="text-white font-medium">{character.characterName}</p>
                <p className="text-gray-400 text-sm">
                  {character.characterType.name} • Nivel {character.level}
                </p>
              </div>
              <div className="text-right">
                <p className="text-yellow-400 font-bold">{character.experiencePoints}</p>
                <p className="text-gray-400 text-xs">EXP</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 mb-4">
            <div className="flex items-center space-x-3">
              <UserIcon className="w-8 h-8 text-yellow-400" />
              <div>
                <p className="text-yellow-300 font-medium">Sin Personaje</p>
                <p className="text-yellow-400 text-sm">Crea tu personaje para esta clase</p>
              </div>
            </div>
          </div>
        )}

        {/* Estadísticas */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-1 mb-1">
              <UserIcon className="w-4 h-4 text-gray-400" />
              <span className="text-xl font-bold text-white">
                {classData._count.enrollments}
              </span>
            </div>
            <p className="text-gray-400 text-xs">Compañeros</p>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center space-x-1 mb-1">
              <CalendarDaysIcon className="w-4 h-4 text-gray-400" />
              <span className="text-xl font-bold text-white">
                {Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))}
              </span>
            </div>
            <p className="text-gray-400 text-xs">Días restantes</p>
          </div>
        </div>

        {/* Fechas */}
        <div className="text-center text-sm text-gray-400 mb-4">
          {startDate.toLocaleDateString()} - {endDate.toLocaleDateString()}
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 py-4 bg-white/5 border-t border-white/10">
        <button
          onClick={handleViewClass}
          className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-gradient-to-r from-arc-500 to-blue-600 text-white rounded-lg hover:from-arc-600 hover:to-blue-700 transition-all duration-200"
        >
          <EyeIcon className="w-4 h-4" />
          <span>Ver Clase</span>
        </button>
      </div>
    </motion.div>
  )
}