// src/app/student/dashboard/page.tsx
'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  PlusIcon,
  AcademicCapIcon,
  UserIcon,
  SparklesIcon,
  TrophyIcon,
  FireIcon,
  BoltIcon
} from '@heroicons/react/24/outline'
import { useAuth } from '@/hooks/useAuth'
import { useCharacters } from '@/hooks/useCharacters'
import { useClasses } from '@/hooks/useClasses'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { JoinClassModal } from '@/components/student/JoinClassModal'
import { StudentClassCard } from '@/components/student/ClassCard'
import { CharacterCard } from '@/components/characters/CharacterCard'
import { cn } from '@/lib/utils/cn'

export default function StudentDashboard() {
  const { user } = useAuth()
  const { characters, isLoading: loadingCharacters } = useCharacters()
  const { classes, isLoading: loadingClasses } = useClasses()
  const [showJoinModal, setShowJoinModal] = useState(false)

  // Calcular estadísticas del estudiante
  const totalClasses = classes.length
  const totalCharacters = characters.length
  const totalLevel = characters.reduce((sum, char) => sum + char.level, 0)
  const totalExperience = characters.reduce((sum, char) => sum + char.experiencePoints, 0)
  
  // Obtener personaje más avanzado
  const highestLevelCharacter = characters.length > 0 
    ? characters.reduce((prev, current) => (prev.level > current.level) ? prev : current)
    : null

  // Clases activas
  const activeClasses = classes.filter(cls => {
    const now = new Date()
    const startDate = new Date(cls.startDate)
    const endDate = new Date(cls.endDate)
    return startDate <= now && now <= endDate
  })

  if (loadingClasses || loadingCharacters) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-arc-900 via-slate-900 to-void-800 flex items-center justify-center">
        <LoadingSpinner size="xl" variant="arc" text="Cargando tu progreso..." />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-arc-900 via-slate-900 to-void-800 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header de bienvenida */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-2">
            ¡Bienvenido, Guardián {user?.name}!
          </h1>
          <p className="text-xl text-gray-300">
            Tu Light crece más fuerte cada día. Continúa tu entrenamiento.
          </p>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <StatsCard
            title="Clases Activas"
            value={totalClasses}
            icon={<AcademicCapIcon className="w-8 h-8" />}
            color="from-arc-500 to-blue-600"
            bgColor="bg-arc-500/20"
            borderColor="border-arc-500/30"
          />
          
          <StatsCard
            title="Personajes"
            value={totalCharacters}
            icon={<UserIcon className="w-8 h-8" />}
            color="from-void-500 to-purple-600"
            bgColor="bg-void-500/20"
            borderColor="border-void-500/30"
          />
          
          <StatsCard
            title="Nivel Total"
            value={totalLevel}
            icon={<TrophyIcon className="w-8 h-8" />}
            color="from-solar-500 to-orange-600"
            bgColor="bg-solar-500/20"
            borderColor="border-solar-500/30"
          />
          
          <StatsCard
            title="Experiencia"
            value={totalExperience}
            icon={<SparklesIcon className="w-8 h-8" />}
            color="from-emerald-500 to-green-600"
            bgColor="bg-emerald-500/20"
            borderColor="border-emerald-500/30"
          />
        </motion.div>

        {/* Personaje Destacado */}
        {highestLevelCharacter && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center space-x-2">
              <FireIcon className="w-6 h-6 text-solar-500" />
              <span>Tu Guardián Más Poderoso</span>
            </h2>
            
            <div className="bg-gradient-to-r from-solar-500/20 to-orange-600/20 rounded-xl border border-solar-500/30 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-solar-500 to-orange-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-2xl font-bold">
                      {highestLevelCharacter.characterName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-bold text-white">
                      {highestLevelCharacter.characterName}
                    </h3>
                    <p className="text-solar-300">
                      {highestLevelCharacter.characterType.name} • Nivel {highestLevelCharacter.level}
                    </p>
                    <p className="text-gray-400 text-sm">
                      {highestLevelCharacter.class.name}
                    </p>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="flex items-center space-x-4 mb-2">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-red-400">
                        {highestLevelCharacter.currentHealth}
                      </p>
                      <p className="text-xs text-gray-400">Salud</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-400">
                        {highestLevelCharacter.currentLight}
                      </p>
                      <p className="text-xs text-gray-400">Light</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <BoltIcon className="w-4 h-4 text-yellow-400" />
                    <span className="text-white">
                      {highestLevelCharacter.experiencePoints} EXP
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-white">Acciones Rápidas</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <QuickActionCard
              title="Unirse a Clase"
              description="Únete a una nueva clase con un código"
              icon={<PlusIcon className="w-6 h-6" />}
              onClick={() => setShowJoinModal(true)}
              color="from-emerald-500 to-green-600"
            />
            
            <QuickActionCard
              title="Ver Personajes"
              description="Gestiona todos tus personajes"
              icon={<UserIcon className="w-6 h-6" />}
              onClick={() => window.location.href = '/student/characters'}
              color="from-purple-500 to-violet-600"
            />
            
            <QuickActionCard
              title="Progreso"
              description="Revisa tu progreso y estadísticas"
              icon={<TrophyIcon className="w-6 h-6" />}
              onClick={() => console.log('Progreso - Próximamente')}
              color="from-blue-500 to-cyan-600"
            />
          </div>
        </motion.div>

        {/* Mis Clases */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Mis Clases</h2>
            <button
              onClick={() => setShowJoinModal(true)}
              className="flex items-center space-x-2 bg-gradient-to-r from-arc-500 to-blue-600 text-white px-4 py-2 rounded-lg hover:from-arc-600 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <PlusIcon className="w-5 h-5" />
              <span>Unirse a Clase</span>
            </button>
          </div>

          {classes.length === 0 ? (
            <EmptyClasses onJoinClick={() => setShowJoinModal(true)} />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {classes.map((cls, index) => (
                <motion.div
                  key={cls.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                >
                  <StudentClassCard
                    classData={cls}
                    character={characters.find(char => char.class.id === cls.id)}
                  />
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Mis Personajes */}
        {characters.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Mis Personajes</h2>
              <button
                onClick={() => window.location.href = '/student/characters'}
                className="text-arc-400 hover:text-arc-300 transition-colors"
              >
                Ver todos →
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {characters.slice(0, 6).map((character, index) => (
                <motion.div
                  key={character.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                >
                  <CharacterCard character={character} />
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Join Class Modal */}
        <JoinClassModal
          isOpen={showJoinModal}
          onClose={() => setShowJoinModal(false)}
          onSuccess={() => {
            setShowJoinModal(false)
            // Refresh data
          }}
        />
      </div>
    </div>
  )
}

// Componente para tarjetas de estadísticas
interface StatsCardProps {
  title: string
  value: number
  icon: React.ReactNode
  color: string
  bgColor: string
  borderColor: string
}

function StatsCard({ title, value, icon, color, bgColor, borderColor }: StatsCardProps) {
  return (
    <div className={cn(
      "rounded-xl border backdrop-blur-sm p-6 transition-all duration-200 hover:scale-105",
      bgColor,
      borderColor
    )}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-300 text-sm font-medium">{title}</p>
          <p className="text-3xl font-bold text-white mt-1">{value}</p>
        </div>
        <div className={cn("p-3 rounded-lg bg-gradient-to-br", color)}>
          <div className="text-white">
            {icon}
          </div>
        </div>
      </div>
    </div>
  )
}

// Componente para acciones rápidas
interface QuickActionCardProps {
  title: string
  description: string
  icon: React.ReactNode
  onClick: () => void
  color: string
}

function QuickActionCard({ title, description, icon, onClick, color }: QuickActionCardProps) {
  return (
    <button
      onClick={onClick}
      className="text-left p-6 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 hover:bg-white/15 transition-all duration-200 hover:scale-105 group"
    >
      <div className={cn(
        "w-12 h-12 rounded-lg bg-gradient-to-br flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200",
        color
      )}>
        <div className="text-white">
          {icon}
        </div>
      </div>
      <h3 className="text-white font-semibold mb-2">{title}</h3>
      <p className="text-gray-400 text-sm">{description}</p>
    </button>
  )
}

// Componente para estado vacío de clases
interface EmptyClassesProps {
  onJoinClick: () => void
}

function EmptyClasses({ onJoinClick }: EmptyClassesProps) {
  return (
    <div className="text-center py-12 px-6 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
      <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-arc-500/20 to-blue-600/20 rounded-full flex items-center justify-center">
        <AcademicCapIcon className="w-12 h-12 text-arc-400" />
      </div>
      
      <h3 className="text-2xl font-bold text-white mb-4">
        ¡Únete a tu primera clase!
      </h3>
      
      <p className="text-gray-300 mb-8 max-w-md mx-auto">
        Pide a tu profesor el código de clase para comenzar tu entrenamiento como Guardián.
      </p>
      
      <button
        onClick={onJoinClick}
        className="inline-flex items-center space-x-2 bg-gradient-to-r from-arc-500 to-blue-600 text-white px-6 py-3 rounded-lg hover:from-arc-600 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
      >
        <PlusIcon className="w-5 h-5" />
        <span>Unirse a Clase</span>
      </button>
    </div>
  )
}