// src/app/student/classes/[classId]/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  UserIcon, 
  AcademicCapIcon,
  ChartBarIcon,
  ClockIcon,
  StarIcon,
  UserGroupIcon,
  ExclamationTriangleIcon,
  PlusIcon
} from '@heroicons/react/24/outline'
import { ClassWithDetails, StudentCharacterWithDetails } from '@/types'
import { useAuth } from '@/hooks/useAuth'
import { toast } from 'react-hot-toast'
import { cn } from '@/lib/utils/cn'

// Componentes
import { StatBar } from '@/components/ui/StatBar'
import { EmptyStateStudent } from '@/components/ui/EmptyState'
import { Modal } from '@/components/ui/Modal'

export default function StudentClassDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user, isAuthenticated } = useAuth()
  const classId = params.classId as string

  const [classData, setClassData] = useState<ClassWithDetails | null>(null)
  const [myCharacter, setMyCharacter] = useState<StudentCharacterWithDetails | null>(null)
  const [classmates, setClassmates] = useState<StudentCharacterWithDetails[]>([])
  const [recentActivity, setRecentActivity] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'character' | 'classmates' | 'activity'>('overview')
  const [showCreateCharacterModal, setShowCreateCharacterModal] = useState(false)

  useEffect(() => {
    if (isAuthenticated && user?.role === 'student') {
      fetchClassData()
    }
  }, [isAuthenticated, user, classId])

  const fetchClassData = async () => {
    try {
      setIsLoading(true)

      // Obtener datos de la clase
      const classResponse = await fetch(`/api/classes/${classId}`)
      if (!classResponse.ok) {
        throw new Error('Error al cargar la clase')
      }
      const classResult = await classResponse.json()
      setClassData(classResult.data)

      // Obtener mi personaje en esta clase
      if (user?.studentId) {
        const characterResponse = await fetch(`/api/students/${user.studentId}/characters/${classId}`)
        if (characterResponse.ok) {
          const characterResult = await characterResponse.json()
          setMyCharacter(characterResult.data)
        }
      }

      // Obtener compañeros de clase
      const classmatesResponse = await fetch(`/api/classes/${classId}/students`)
      if (classmatesResponse.ok) {
        const classmatesResult = await classmatesResponse.json()
        const allStudents = classmatesResult.data || []
        // Filtrar para excluir mi propio personaje
        setClassmates(allStudents.filter((s: StudentCharacterWithDetails) => 
          s.student.id !== user?.studentId
        ))
      }

      // Obtener actividad reciente
      const activityResponse = await fetch(`/api/classes/${classId}/activity`)
      if (activityResponse.ok) {
        const activityResult = await activityResponse.json()
        setRecentActivity(activityResult.data || [])
      }

    } catch (error) {
      console.error('Error cargando datos de la clase:', error)
      toast.error('Error al cargar los datos de la clase')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateCharacter = () => {
    router.push(`/student/characters/create?classId=${classId}`)
  }

  const getCharacterTypeIcon = (typeName: string) => {
    switch (typeName.toLowerCase()) {
      case 'hunter': return '🏹'
      case 'titan': return '🛡️'
      case 'warlock': return '🔮'
      default: return '⭐'
    }
  }

  const getCharacterTypeColor = (typeName: string) => {
    switch (typeName.toLowerCase()) {
      case 'hunter': return 'from-solar-500 to-orange-500'
      case 'titan': return 'from-arc-500 to-blue-500'
      case 'warlock': return 'from-void-500 to-purple-500'
      default: return 'from-gray-500 to-gray-600'
    }
  }

  // Calcular estadísticas de progreso
  const progressStats = myCharacter ? {
    experienceForNextLevel: Math.floor(100 * Math.pow(1.5, myCharacter.level)),
    experienceProgress: myCharacter.experiencePoints % Math.floor(100 * Math.pow(1.5, myCharacter.level - 1)),
    healthPercentage: (myCharacter.currentHealth / myCharacter.maxHealth) * 100,
    lightPercentage: (myCharacter.currentLight / myCharacter.maxLight) * 100,
    classRanking: classmates.filter(c => c.experiencePoints > myCharacter.experiencePoints).length + 1
  } : null

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-800 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-white">Cargando datos de la clase...</p>
        </div>
      </div>
    )
  }

  if (!classData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-800 flex items-center justify-center">
        <div className="text-center space-y-4">
          <ExclamationTriangleIcon className="w-16 h-16 text-red-400 mx-auto" />
          <h2 className="text-2xl font-bold text-white">Clase no encontrada</h2>
          <p className="text-gray-400">La clase que buscas no existe o no estás inscrito en ella.</p>
          <button
            onClick={() => router.push('/student/dashboard')}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
          >
            Volver al Dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">
                {classData.name}
              </h1>
              <p className="text-gray-400 text-lg">
                {classData.description || 'Tu aventura como Guardián continúa'}
              </p>
              <div className="flex items-center gap-4 mt-2">
                <span className="text-sm text-gray-400">
                  👨‍🏫 Profesor: {classData.teacher.user.firstName} {classData.teacher.user.lastName}
                </span>
                <span className="text-sm text-gray-400">
                  📅 Desde: {new Date(classData.startDate).toLocaleDateString('es-ES')}
                </span>
              </div>
            </div>
            
            {!myCharacter && (
              <button
                onClick={handleCreateCharacter}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                <PlusIcon className="w-5 h-5" />
                Crear Guardián
              </button>
            )}
          </div>

          {/* My Character Overview */}
          {myCharacter ? (
            <div className="p-6 bg-gradient-to-r from-white/10 to-white/5 rounded-2xl border border-white/20 mb-6">
              <div className="flex items-center gap-6">
                <div className={cn(
                  'w-20 h-20 rounded-2xl flex items-center justify-center text-4xl',
                  `bg-gradient-to-br ${getCharacterTypeColor(myCharacter.characterType.name)}`
                )}>
                  {getCharacterTypeIcon(myCharacter.characterType.name)}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-2xl font-bold text-white">
                      {myCharacter.characterName}
                    </h3>
                    <span className="px-3 py-1 bg-blue-600 text-white rounded-full text-sm font-medium">
                      Nivel {myCharacter.level}
                    </span>
                    {progressStats && (
                      <span className="px-3 py-1 bg-purple-600 text-white rounded-full text-sm">
                        #{progressStats.classRanking} en clase
                      </span>
                    )}
                  </div>
                  
                  <p className="text-gray-400 mb-4 capitalize">
                    {myCharacter.characterType.name} • {myCharacter.experiencePoints.toLocaleString()} XP
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <StatBar
                      label="Salud"
                      current={myCharacter.currentHealth}
                      max={myCharacter.maxHealth}
                      type="health"
                      size="sm"
                      glowEffect={true}
                    />
                    <StatBar
                      label="Luz"
                      current={myCharacter.currentLight}
                      max={myCharacter.maxLight}
                      type="light"
                      size="sm"
                      glowEffect={true}
                    />
                    <StatBar
                      label="Experiencia"
                      current={progressStats?.experienceProgress || 0}
                      max={progressStats?.experienceForNextLevel || 100}
                      type="experience"
                      size="sm"
                      glowEffect={true}
                    />
                  </div>
                </div>
                
                <button
                  onClick={() => router.push(`/student/characters/${myCharacter.id}`)}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
                >
                  Ver Detalles
                </button>
              </div>
            </div>
          ) : (
            <EmptyStateStudent
              variant="no-characters"
              actionButton={
                <button
                  onClick={handleCreateCharacter}
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg transition-all duration-300"
                >
                  🚀 Crear tu Guardián
                </button>
              }
            />
          )}

          {/* Navigation Tabs */}
          <div className="flex bg-white/5 rounded-xl p-1 border border-white/10">
            {[
              { id: 'overview', label: 'Resumen', icon: '📊' },
              { id: 'character', label: 'Mi Guardián', icon: '⚔️' },
              { id: 'classmates', label: 'Compañeros', icon: '👥' },
              { id: 'activity', label: 'Actividad', icon: '📝' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={cn(
                  'flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg transition-all duration-200',
                  activeTab === tab.id
                    ? 'bg-purple-600 text-white shadow-lg'
                    : 'text-gray-300 hover:text-white hover:bg-white/10'
                )}
              >
                <span>{tab.icon}</span>
                <span className="font-medium">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {activeTab === 'overview' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Class Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="p-4 bg-white/10 rounded-xl border border-white/20">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                      <UserGroupIcon className="w-6 h-6 text-blue-400" />
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Compañeros</p>
                      <p className="text-xl font-bold text-white">
                        {classmates.length + 1}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-white/10 rounded-xl border border-white/20">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                      <StarIcon className="w-6 h-6 text-green-400" />
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Mi Ranking</p>
                      <p className="text-xl font-bold text-white">
                        #{progressStats?.classRanking || '-'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-white/10 rounded-xl border border-white/20">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                      <ChartBarIcon className="w-6 h-6 text-purple-400" />
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Mi Nivel</p>
                      <p className="text-xl font-bold text-white">
                        {myCharacter?.level || '-'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-white/10 rounded-xl border border-white/20">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-yellow-500/20 rounded-xl flex items-center justify-center">
                      <span className="text-2xl">🏆</span>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Mi XP</p>
                      <p className="text-xl font-bold text-white">
                        {myCharacter?.experiencePoints.toLocaleString() || '0'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Progress Overview */}
              {myCharacter && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="p-6 bg-white/5 rounded-xl border border-white/10">
                    <h3 className="text-xl font-semibold text-white mb-4">
                      📈 Mi Progreso
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-gray-300">Experiencia</span>
                          <span className="text-purple-400 font-medium">
                            {progressStats?.experienceProgress} / {progressStats?.experienceForNextLevel}
                          </span>
                        </div>
                        <StatBar
                          label=""
                          current={progressStats?.experienceProgress || 0}
                          max={progressStats?.experienceForNextLevel || 100}
                          type="experience"
                          size="md"
                          showValues={false}
                          glowEffect={true}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4 pt-4">
                        <div className="text-center p-3 bg-white/5 rounded-lg">
                          <div className="text-lg font-bold text-green-400">
                            {Math.round(progressStats?.healthPercentage || 0)}%
                          </div>
                          <div className="text-xs text-gray-400">❤️ Salud</div>
                        </div>
                        <div className="text-center p-3 bg-white/5 rounded-lg">
                          <div className="text-lg font-bold text-yellow-400">
                            {Math.round(progressStats?.lightPercentage || 0)}%
                          </div>
                          <div className="text-xs text-gray-400">✨ Luz</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 bg-white/5 rounded-xl border border-white/10">
                    <h3 className="text-xl font-semibold text-white mb-4">
                      📊 Estadísticas del Guardián
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                        <div className="text-xl font-bold text-green-400">
                          {myCharacter.discipline}
                        </div>
                        <div className="text-sm text-gray-400">🛡️ Disciplina</div>
                      </div>
                      <div className="text-center p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                        <div className="text-xl font-bold text-blue-400">
                          {myCharacter.intellect}
                        </div>
                        <div className="text-sm text-gray-400">🧠 Intelecto</div>
                      </div>
                      <div className="text-center p-3 bg-orange-500/10 rounded-lg border border-orange-500/20">
                        <div className="text-xl font-bold text-orange-400">
                          {myCharacter.strength}
                        </div>
                        <div className="text-sm text-gray-400">💪 Fuerza</div>
                      </div>
                      <div className="text-center p-3 bg-purple-500/10 rounded-lg border border-purple-500/20">
                        <div className="text-xl font-bold text-purple-400">
                          {myCharacter.charisma}
                        </div>
                        <div className="text-sm text-gray-400">⭐ Carisma</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'character' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {myCharacter ? (
                <div className="space-y-6">
                  {/* Character Details */}
                  <div className="p-6 bg-white/5 rounded-xl border border-white/10">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-2xl font-bold text-white">
                        Detalles del Guardián
                      </h3>
                      <button
                        onClick={() => router.push(`/student/characters/${myCharacter.id}`)}
                        className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                      >
                        Ver Perfil Completo
                      </button>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      {/* Character Info */}
                      <div>
                        <div className="flex items-center gap-4 mb-6">
                          <div className={cn(
                            'w-24 h-24 rounded-2xl flex items-center justify-center text-5xl',
                            `bg-gradient-to-br ${getCharacterTypeColor(myCharacter.characterType.name)}`
                          )}>
                            {getCharacterTypeIcon(myCharacter.characterType.name)}
                          </div>
                          <div>
                            <h4 className="text-2xl font-bold text-white">
                              {myCharacter.characterName}
                            </h4>
                            <p className="text-gray-400 capitalize">
                              {myCharacter.characterType.name}
                            </p>
                            <p className="text-sm text-gray-500">
                              {myCharacter.characterType.description}
                            </p>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <h5 className="font-semibold text-white">Habilidad Especial:</h5>
                          <p className="text-gray-300 text-sm p-3 bg-white/5 rounded-lg">
                            {myCharacter.characterType.specialAbility}
                          </p>
                        </div>
                      </div>

                      {/* Stats Detailed */}
                      <div className="space-y-4">
                        <h5 className="font-semibold text-white">Estado Actual:</h5>
                        
                        <StatBar
                          label="Salud"
                          current={myCharacter.currentHealth}
                          max={myCharacter.maxHealth}
                          type="health"
                          showValues={true}
                          glowEffect={true}
                        />
                        
                        <StatBar
                          label="Luz"
                          current={myCharacter.currentLight}
                          max={myCharacter.maxLight}
                          type="light"
                          showValues={true}
                          glowEffect={true}
                        />
                        
                        <StatBar
                          label="Experiencia"
                          current={progressStats?.experienceProgress || 0}
                          max={progressStats?.experienceForNextLevel || 100}
                          type="experience"
                          showValues={true}
                          glowEffect={true}
                        />

                        <div className="pt-4">
                          <h6 className="font-medium text-white mb-3">Atributos:</h6>
                          <div className="grid grid-cols-2 gap-2">
                            <StatBar
                              label="Disciplina"
                              current={myCharacter.discipline}
                              max={20}
                              type="discipline"
                              size="sm"
                              showValues={true}
                            />
                            <StatBar
                              label="Intelecto"
                              current={myCharacter.intellect}
                              max={20}
                              type="intellect"
                              size="sm"
                              showValues={true}
                            />
                            <StatBar
                              label="Fuerza"
                              current={myCharacter.strength}
                              max={20}
                              type="strength"
                              size="sm"
                              showValues={true}
                            />
                            <StatBar
                              label="Carisma"
                              current={myCharacter.charisma}
                              max={20}
                              type="charisma"
                              size="sm"
                              showValues={true}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button
                      onClick={() => router.push(`/student/characters/${myCharacter.id}/powers`)}
                      className="p-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl transition-all duration-300 text-left"
                    >
                      <div className="text-2xl mb-2">⚡</div>
                      <h4 className="font-semibold">Poderes</h4>
                      <p className="text-sm text-gray-200">Gestionar habilidades</p>
                    </button>

                    <button
                      onClick={() => router.push(`/student/characters/${myCharacter.id}/accessories`)}
                      className="p-4 bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white rounded-xl transition-all duration-300 text-left"
                    >
                      <div className="text-2xl mb-2">🎒</div>
                      <h4 className="font-semibold">Inventario</h4>
                      <p className="text-sm text-gray-200">Equipar accesorios</p>
                    </button>

                    <button
                      onClick={() => router.push(`/student/characters/${myCharacter.id}/customize`)}
                      className="p-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl transition-all duration-300 text-left"
                    >
                      <div className="text-2xl mb-2">🎨</div>
                      <h4 className="font-semibold">Personalizar</h4>
                      <p className="text-sm text-gray-200">Modificar apariencia</p>
                    </button>
                  </div>
                </div>
              ) : (
                <EmptyStateStudent
                  variant="no-characters"
                  actionButton={
                    <button
                      onClick={handleCreateCharacter}
                      className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg transition-all duration-300"
                    >
                      🚀 Crear tu Guardián
                    </button>
                  }
                />
              )}
            </motion.div>
          )}

          {activeTab === 'classmates' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {classmates.length > 0 ? (
                <div className="space-y-4">
                  <h3 className="text-2xl font-bold text-white mb-6">
                    👥 Compañeros de Clase ({classmates.length})
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {classmates.map((classmate, index) => (
                      <motion.div
                        key={classmate.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="p-4 bg-white/5 rounded-xl border border-white/10 hover:border-white/20 transition-all duration-300"
                      >
                        <div className="flex items-center gap-3 mb-3">
                          <div className={cn(
                            'w-12 h-12 rounded-xl flex items-center justify-center text-xl',
                            `bg-gradient-to-br ${getCharacterTypeColor(classmate.characterType.name)}`
                          )}>
                            {getCharacterTypeIcon(classmate.characterType.name)}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-white">
                              {classmate.student.user.firstName} {classmate.student.user.lastName}
                            </h4>
                            <p className="text-sm text-gray-400">
                              {classmate.characterName}
                            </p>
                          </div>
                          <span className="px-2 py-1 bg-blue-600 text-white rounded text-xs">
                            Nv. {classmate.level}
                          </span>
                        </div>

                        <div className="space-y-2">
                          <StatBar
                            label=""
                            current={classmate.currentHealth}
                            max={classmate.maxHealth}
                            type="health"
                            size="sm"
                            showValues={false}
                          />
                          <StatBar
                            label=""
                            current={classmate.currentLight}
                            max={classmate.maxLight}
                            type="light"
                            size="sm"
                            showValues={false}
                          />
                        </div>

                        <div className="mt-3 pt-3 border-t border-white/10 text-center">
                          <span className="text-purple-400 font-medium text-sm">
                            {classmate.experiencePoints.toLocaleString()} XP
                          </span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center p-12 bg-white/5 rounded-xl border border-white/10">
                  <UserGroupIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">
                    Aún no hay compañeros
                  </h3>
                  <p className="text-gray-400">
                    Eres el primer Guardián en unirse a esta clase. 
                    ¡Pronto tendrás compañeros de aventura!
                  </p>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'activity' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="space-y-4">
                <h3 className="text-2xl font-bold text-white mb-6">
                  📝 Actividad de la Clase
                </h3>

                {recentActivity.length > 0 ? (
                  <div className="space-y-3">
                    {recentActivity.map((activity, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-4 p-4 bg-white/5 rounded-xl border border-white/10"
                      >
                        <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center">
                          <ClockIcon className="w-5 h-5 text-blue-400" />
                        </div>
                        <div className="flex-1">
                          <p className="text-white">{activity.description}</p>
                          <p className="text-gray-400 text-sm">
                            {new Date(activity.timestamp).toLocaleDateString('es-ES')}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center p-12 bg-white/5 rounded-xl border border-white/10">
                    <ClockIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">
                      Sin actividad reciente
                    </h3>
                    <p className="text-gray-400">
                      Las actividades de la clase aparecerán aquí.
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}