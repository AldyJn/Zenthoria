// src/app/student/dashboard/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  PlusIcon,
  AcademicCapIcon,
  UserIcon,
  SparklesIcon,
  TrophyIcon,
  FireIcon,
  BoltIcon,
  EyeIcon,
  StarIcon,
  ChartBarIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline'
import { useAuth, useStudentInfo } from '@/hooks/useAuth'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { JoinClassModal } from '@/components/student/JoinClassModal'
import { cn } from '@/lib/utils/cn'
import { toast } from 'react-hot-toast'

export default function StudentDashboard() {
  const { user, isAuthenticated } = useAuth()
  const { studentId } = useStudentInfo()
  const [classes, setClasses] = useState<any[]>([])
  const [characters, setCharacters] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showJoinModal, setShowJoinModal] = useState(false)

  useEffect(() => {
    if (isAuthenticated && studentId) {
      fetchStudentData()
    }
  }, [isAuthenticated, studentId])

  const fetchStudentData = async () => {
    try {
      setIsLoading(true)
      
      // Obtener clases del estudiante
      const classesResponse = await fetch(`/api/students/${studentId}/classes`)
      if (classesResponse.ok) {
        const classesResult = await classesResponse.json()
        setClasses(classesResult.data || [])
      }

      // Obtener personajes del estudiante
      const charactersResponse = await fetch(`/api/students/${studentId}/characters`)
      if (charactersResponse.ok) {
        const charactersResult = await charactersResponse.json()
        setCharacters(charactersResult.data || [])
      }

    } catch (error) {
      console.error('Error al cargar datos del estudiante:', error)
      toast.error('Error al cargar tu información')
    } finally {
      setIsLoading(false)
    }
  }

  // Calcular estadísticas del estudiante
  const totalClasses = classes.length
  const totalCharacters = characters.length
  const totalLevel = characters.reduce((sum, char) => sum + (char.level || 1), 0)
  const averageLevel = totalCharacters > 0 ? Math.round(totalLevel / totalCharacters) : 0
  
  // Obtener personaje más avanzado
  const highestLevelCharacter = characters.length > 0 
    ? characters.reduce((prev, current) => ((prev.level || 1) > (current.level || 1)) ? prev : current)
    : null

  // Clases activas
  const activeClasses = classes.filter(cls => {
    const now = new Date()
    const startDate = new Date(cls.startDate)
    const endDate = new Date(cls.endDate)
    return startDate <= now && now <= endDate
  })

  if (isLoading) {
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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">
                ¡Bienvenido, Guardián {user?.name}!
              </h1>
              <p className="text-xl text-gray-300">
                Tu Light crece más fuerte cada día. Continúa tu entrenamiento.
              </p>
            </div>
            <div className="text-right">
              <p className="text-gray-400 text-sm">Tu progreso hoy</p>
              <p className="text-white font-medium">
                {new Date().toLocaleDateString('es-ES', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Tarjetas de Estadísticas Principales */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <StatsCard
            title="Clases Activas"
            value={activeClasses.length}
            subtitle={`${totalClasses} total`}
            icon={<AcademicCapIcon className="w-8 h-8" />}
            color="from-arc-500 to-blue-600"
            bgColor="bg-arc-500/20"
            borderColor="border-arc-500/30"
            trend={activeClasses.length > 0 ? "En entrenamiento" : undefined}
          />
          
          <StatsCard
            title="Mis Personajes"
            value={totalCharacters}
            subtitle={`Nivel promedio: ${averageLevel}`}
            icon={<UserIcon className="w-8 h-8" />}
            color="from-emerald-500 to-green-600"
            bgColor="bg-emerald-500/20"
            borderColor="border-emerald-500/30"
            trend={highestLevelCharacter ? `Máx: Nv.${highestLevelCharacter.level || 1}` : undefined}
          />
          
          <StatsCard
            title="Poder Total"
            value={totalLevel}
            subtitle="Light acumulado"
            icon={<BoltIcon className="w-8 h-8" />}
            color="from-yellow-500 to-orange-600"
            bgColor="bg-yellow-500/20"
            borderColor="border-yellow-500/30"
            trend="Creciendo"
          />
          
          <StatsCard
            title="Logros"
            value="3"
            subtitle="Desbloqueados"
            icon={<TrophyIcon className="w-8 h-8" />}
            color="from-purple-500 to-violet-600"
            bgColor="bg-purple-500/20"
            borderColor="border-purple-500/30"
            trend="¡Nuevo!"
          />
        </motion.div>

        {/* Acciones Rápidas */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <h2 className="text-2xl font-bold text-white mb-6">Acciones Rápidas</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <QuickActionCard
              title="Unirse a Clase"
              description="Únete a una nueva clase con un código"
              icon={<PlusIcon className="w-6 h-6" />}
              onClick={() => setShowJoinModal(true)}
              color="from-arc-500 to-blue-600"
              trend="¡Explora nuevos conocimientos!"
            />
            
            <QuickActionCard
              title="Ver Mis Clases"
              description="Revisa tus clases y progreso"
              icon={<AcademicCapIcon className="w-6 h-6" />}
              onClick={() => window.location.href = '/student/classes'}
              color="from-emerald-500 to-green-600"
              disabled={totalClasses === 0}
              badge={totalClasses > 0 ? `${totalClasses}` : undefined}
            />
            
            <QuickActionCard
              title="Mis Personajes"
              description="Gestiona tus Guardianes"
              icon={<UserIcon className="w-6 h-6" />}
              onClick={() => window.location.href = '/student/characters'}
              color="from-purple-500 to-violet-600"
              disabled={totalCharacters === 0}
              badge={totalCharacters > 0 ? `${totalCharacters}` : undefined}
            />
            
            <QuickActionCard
              title="Entrenar"
              description="Actividades de práctica"
              icon={<SparklesIcon className="w-6 h-6" />}
              onClick={() => toast('Modo entrenamiento - Próximamente', { icon: '🚧' })}
              color="from-orange-500 to-red-600"
              disabled={totalCharacters === 0}
            />
          </div>
        </motion.div>

        {/* Clases Activas */}
        {activeClasses.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-8"
          >
            <h2 className="text-2xl font-bold text-white mb-6">Clases Activas</h2>
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-emerald-300">
                  ⚡ {activeClasses.length} clase{activeClasses.length !== 1 ? 's' : ''} en progreso
                </h3>
                <span className="text-emerald-400 text-sm">Continúa tu entrenamiento</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {activeClasses.slice(0, 3).map((cls) => (
                  <motion.div
                    key={cls.id}
                    whileHover={{ scale: 1.02 }}
                    className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 p-4 hover:border-emerald-500/40 transition-all duration-200"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="text-white font-semibold truncate">{cls.name}</h4>
                        <div className="flex items-center space-x-2 text-sm text-gray-400 mt-1">
                          <span>Activa</span>
                          <span>•</span>
                          <span>Código: {cls.classCode}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 text-sm">
                        {new Date(cls.updatedAt).toLocaleDateString()}
                      </span>
                      <button
                        onClick={() => window.location.href = `/student/classes/${cls.id}`}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                        title="Ver clase"
                      >
                        <EyeIcon className="w-4 h-4 text-gray-400 hover:text-white" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Personajes Destacados */}
        {characters.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-8"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Mis Guardianes</h2>
              <button
                onClick={() => window.location.href = '/student/characters'}
                className="flex items-center space-x-2 text-arc-400 hover:text-arc-300 transition-colors"
              >
                <span>Ver todos</span>
                <ArrowRightIcon className="w-4 h-4" />
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {characters.slice(0, 3).map((character) => (
                <motion.div
                  key={character.id}
                  whileHover={{ scale: 1.02 }}
                  className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 p-6 hover:border-white/30 transition-all duration-200"
                >
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-arc-500 to-void-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-xl">
                        {character.characterName.charAt(0)}
                      </span>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-white font-semibold">{character.characterName}</h3>
                      <p className="text-gray-400 text-sm">{character.characterType?.name || 'Guardian'}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 text-sm">Nivel</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-white font-bold">{character.level || 1}</span>
                        <StarIcon className="w-4 h-4 text-yellow-400" />
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 text-sm">Clase</span>
                      <span className="text-white text-sm">{character.class?.name || 'Sin asignar'}</span>
                    </div>
                    
                    {/* Barra de progreso */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-400">Progreso</span>
                        <span className="text-gray-400">75%</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-arc-500 to-blue-600 h-2 rounded-full transition-all duration-1000"
                          style={{ width: '75%' }}
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Sección Principal */}
        <motion.div
          id="main-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Mi Progreso</h2>
          </div>

          {totalClasses === 0 && totalCharacters === 0 ? (
            <EmptyState onJoinClick={() => setShowJoinModal(true)} />
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Resumen de actividad */}
              <div className="bg-white/10 rounded-xl border border-white/20 p-6">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center space-x-2">
                  <ChartBarIcon className="w-5 h-5" />
                  <span>Actividad Reciente</span>
                </h3>
                
                <div className="space-y-4">
                  {[
                    { action: 'Completaste una lección', time: 'hace 2 horas', icon: '📚' },
                    { action: 'Subiste al nivel 3', time: 'hace 1 día', icon: '⭐' },
                    { action: 'Te uniste a nueva clase', time: 'hace 3 días', icon: '🎓' },
                    { action: 'Desbloqueaste logro', time: 'hace 1 semana', icon: '🏆' }
                  ].map((activity, index) => (
                    <div key={index} className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg">
                      <span className="text-2xl">{activity.icon}</span>
                      <div className="flex-1">
                        <p className="text-white text-sm font-medium">{activity.action}</p>
                        <p className="text-gray-400 text-xs">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Objetivos */}
              <div className="bg-white/10 rounded-xl border border-white/20 p-6">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center space-x-2">
                  <TrophyIcon className="w-5 h-5" />
                  <span>Objetivos Semanales</span>
                </h3>
                
                <div className="space-y-4">
                  {[
                    { goal: 'Completar 3 lecciones', progress: 66, current: 2, total: 3 },
                    { goal: 'Subir 1 nivel', progress: 40, current: 2, total: 5 },
                    { goal: 'Participar en clase', progress: 100, current: 3, total: 3 },
                    { goal: 'Crear nuevo personaje', progress: 0, current: 0, total: 1 }
                  ].map((objective, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-white text-sm font-medium">{objective.goal}</span>
                        <span className="text-gray-400 text-xs">{objective.current}/{objective.total}</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div 
                          className={cn(
                            "h-2 rounded-full transition-all duration-1000",
                            objective.progress === 100 
                              ? "bg-gradient-to-r from-emerald-500 to-green-600"
                              : "bg-gradient-to-r from-arc-500 to-blue-600"
                          )}
                          style={{ width: `${objective.progress}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* Modal Unirse a Clase */}
      <JoinClassModal
        isOpen={showJoinModal}
        onClose={() => setShowJoinModal(false)}
        onSuccess={() => {
          setShowJoinModal(false)
          fetchStudentData()
        }}
      />
    </div>
  )
}

// Componente para tarjetas de estadísticas
interface StatsCardProps {
  title: string
  value: string | number
  subtitle: string
  icon: React.ReactNode
  color: string
  bgColor: string
  borderColor: string
  trend?: string
}

function StatsCard({ title, value, subtitle, icon, color, bgColor, borderColor, trend }: StatsCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -4 }}
      className={cn(
        "p-6 rounded-xl border backdrop-blur-sm transition-all duration-200",
        bgColor,
        borderColor
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-gray-400 text-sm font-medium">{title}</p>
          <p className="text-3xl font-bold text-white mt-2">{value}</p>
          <p className="text-gray-300 text-sm mt-1">{subtitle}</p>
          {trend && (
            <p className="text-xs font-medium mt-2 opacity-75">
              {trend}
            </p>
          )}
        </div>
        <div className={cn(
          "w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br",
          color
        )}>
          <div className="text-white">
            {icon}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// Componente para acciones rápidas
interface QuickActionCardProps {
  title: string
  description: string
  icon: React.ReactNode
  onClick: () => void
  color: string
  disabled?: boolean
  trend?: string
  badge?: string
}

function QuickActionCard({ title, description, icon, onClick, color, disabled, trend, badge }: QuickActionCardProps) {
  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "text-left p-6 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 hover:bg-white/15 transition-all duration-200 group",
        disabled ? "opacity-50 cursor-not-allowed" : "hover:scale-105"
      )}
      whileHover={!disabled ? { scale: 1.05 } : undefined}
      whileTap={!disabled ? { scale: 0.95 } : undefined}
    >
      <div className="flex items-start justify-between mb-4">
        <div className={cn(
          "w-12 h-12 rounded-lg bg-gradient-to-br flex items-center justify-center group-hover:scale-110 transition-transform duration-200",
          color
        )}>
          <div className="text-white">
            {icon}
          </div>
        </div>
        {badge && (
          <span className="bg-white/20 text-white text-xs px-2 py-1 rounded-full">
            {badge}
          </span>
        )}
      </div>
      <h3 className="text-white font-semibold mb-2">{title}</h3>
      <p className="text-gray-400 text-sm">{description}</p>
      {trend && (
        <p className="text-xs font-medium mt-2 text-arc-400">
          {trend}
        </p>
      )}
    </motion.button>
  )
}

// Componente para estado vacío
interface EmptyStateProps {
  onJoinClick: () => void
}

function EmptyState({ onJoinClick }: EmptyStateProps) {
  return (
    <div className="text-center py-16 px-6 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: 'spring' }}
        className="w-32 h-32 mx-auto mb-8 bg-gradient-to-br from-arc-500/20 to-void-600/20 rounded-full flex items-center justify-center"
      >
        <AcademicCapIcon className="w-16 h-16 text-arc-400" />
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <h3 className="text-3xl font-bold text-white mb-4">
          ¡Comienza tu entrenamiento!
        </h3>
        <p className="text-gray-300 mb-8 max-w-md mx-auto">
          Únete a tu primera clase para comenzar tu viaje como Guardián y desbloquear tu potencial.
        </p>
        <motion.button
          onClick={onJoinClick}
          className="inline-flex items-center space-x-2 bg-gradient-to-r from-arc-500 to-blue-600 text-white px-8 py-4 rounded-lg hover:from-arc-600 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 font-medium text-lg"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <PlusIcon className="w-6 h-6" />
          <span>Unirse a Primera Clase</span>
        </motion.button>
      </motion.div>
    </div>
  )
}