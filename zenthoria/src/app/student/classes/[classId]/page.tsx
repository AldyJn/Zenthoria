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
  PlusIcon,
  BoltIcon,
  TrophyIcon,
  FireIcon,
  SparklesIcon
} from '@heroicons/react/24/outline'
import { ClassWithDetails, StudentCharacterWithDetails } from '@/types'
import { useAuth, useStudentInfo } from '@/hooks/useAuth'
import { toast } from 'react-hot-toast'
import { cn } from '@/lib/utils/cn'

// Componentes
import { StudentClassBackButton } from '@/components/ui/StudentBackButton'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { Modal } from '@/components/ui/Modal'

export default function StudentClassDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user, isAuthenticated } = useAuth()
  const { studentId } = useStudentInfo()
  const classId = params.classId as string

  const [classData, setClassData] = useState<ClassWithDetails | null>(null)
  const [myCharacter, setMyCharacter] = useState<StudentCharacterWithDetails | null>(null)
  const [classmates, setClassmates] = useState<StudentCharacterWithDetails[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'character' | 'classmates' | 'activity'>('overview')
  const [showCreateCharacterModal, setShowCreateCharacterModal] = useState(false)

  useEffect(() => {
    if (isAuthenticated && studentId) {
      fetchClassData()
    }
  }, [isAuthenticated, studentId, classId])

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
      if (studentId) {
        const characterResponse = await fetch(`/api/students/${studentId}/characters/${classId}`)
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
        const filteredClassmates = allStudents.filter((student: any) => 
          student.studentId !== studentId
        )
        setClassmates(filteredClassmates)
      }

    } catch (error) {
      console.error('Error al cargar datos:', error)
      toast.error('Error al cargar la información de la clase')
    } finally {
      setIsLoading(false)
    }
  }

  // Calcular estado de la clase
  const now = new Date()
  const startDate = new Date(classData?.startDate || now)
  const endDate = new Date(classData?.endDate || now)
  const isActive = now >= startDate && now <= endDate
  const isUpcoming = now < startDate
  const isEnded = now > endDate

  // Calcular estadísticas
  const classStats = {
    totalStudents: classmates.length + (myCharacter ? 1 : 0),
    myLevel: myCharacter?.level || 1,
    myProgress: 65, // Placeholder
    classRank: Math.floor(Math.random() * classmates.length) + 1
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-arc-900 via-slate-900 to-void-800 flex items-center justify-center">
        <LoadingSpinner size="xl" variant="arc" text="Cargando clase..." />
      </div>
    )
  }

  if (!classData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-arc-900 via-slate-900 to-void-800 flex items-center justify-center">
        <div className="text-center">
          <ExclamationTriangleIcon className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Clase no encontrada</h2>
          <p className="text-gray-400 mb-6">La clase que buscas no existe o no tienes acceso a ella.</p>
          <StudentClassBackButton />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-arc-900 via-slate-900 to-void-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header con botón de retroceso */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <StudentClassBackButton />
              <div>
                <h1 className="text-4xl font-bold text-white mb-2">
                  {classData.name}
                </h1>
                <p className="text-gray-400 text-lg">
                  {classData.description || 'Continúa tu entrenamiento como Guardián'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {!myCharacter && (
                <button
                  onClick={() => router.push(`/student/characters/create?classId=${classId}`)}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-arc-500 to-blue-600 hover:from-arc-600 hover:to-blue-700 text-white rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  <PlusIcon className="w-5 h-5" />
                  <span>Crear Personaje</span>
                </button>
              )}
            </div>
          </div>

          {/* Estado de la clase */}
          <div className="flex items-center space-x-4 mb-6">
            <span className={cn(
              "px-4 py-2 rounded-full text-sm font-medium flex items-center space-x-2",
              isActive ? "bg-emerald-500/20 text-emerald-300" :
              isUpcoming ? "bg-blue-500/20 text-blue-300" :
              "bg-gray-500/20 text-gray-300"
            )}>
              <span>{isActive ? '⚡' : isUpcoming ? '🔵' : '⚫'}</span>
              <span>{isActive ? 'Activa' : isUpcoming ? 'Próxima' : 'Finalizada'}</span>
            </span>
            <span className="text-gray-400 flex items-center space-x-2">
              <ClockIcon className="w-4 h-4" />
              <span>{new Date(classData.startDate).toLocaleDateString()} - {new Date(classData.endDate).toLocaleDateString()}</span>
            </span>
          </div>
        </div>

        {/* Mi Personaje o Crear Personaje */}
        {myCharacter ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 bg-gradient-to-br from-arc-500/10 to-blue-600/10 border border-arc-500/20 rounded-xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white">Mi Guardián</h3>
              <span className="text-arc-400 text-sm">Nivel {myCharacter.level || 1}</span>
            </div>
            
            <div className="flex items-center space-x-6">
              <div className="w-20 h-20 bg-gradient-to-br from-arc-500 to-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-2xl">
                  {myCharacter.characterName.charAt(0)}
                </span>
              </div>
              
              <div className="flex-1">
                <h4 className="text-2xl font-bold text-white">{myCharacter.characterName}</h4>
                <p className="text-arc-400 text-lg">{myCharacter.characterType?.name || 'Guardian'}</p>
                
                <div className="flex items-center space-x-6 mt-3">
                  <div className="flex items-center space-x-2">
                    <StarIcon className="w-5 h-5 text-yellow-400" />
                    <span className="text-white">Nivel {myCharacter.level || 1}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <BoltIcon className="w-5 h-5 text-blue-400" />
                    <span className="text-white">{classStats.myProgress}% Progreso</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <TrophyIcon className="w-5 h-5 text-purple-400" />
                    <span className="text-white">Ranking #{classStats.classRank}</span>
                  </div>
                </div>
                
                {/* Barra de progreso */}
                <div className="mt-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-400">Progreso en la clase</span>
                    <span className="text-arc-400">{classStats.myProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-3">
                    <div 
                      className="bg-gradient-to-r from-arc-500 to-blue-600 h-3 rounded-full transition-all duration-1000"
                      style={{ width: `${classStats.myProgress}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 bg-gradient-to-br from-yellow-500/10 to-orange-600/10 border border-yellow-500/20 rounded-xl p-6 text-center"
          >
            <SparklesIcon className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-white mb-2">¡Crea tu Guardián!</h3>
            <p className="text-gray-400 mb-6">
              Para participar en esta clase, necesitas crear tu personaje Guardián
            </p>
            <button
              onClick={() => router.push(`/student/characters/create?classId=${classId}`)}
              className="inline-flex items-center space-x-2 bg-gradient-to-r from-arc-500 to-blue-600 text-white px-6 py-3 rounded-lg hover:from-arc-600 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl font-medium"
            >
              <PlusIcon className="w-5 h-5" />
              <span>Crear Mi Personaje</span>
            </button>
          </motion.div>
        )}

        {/* Navegación por pestañas */}
        <div className="mb-8">
          <div className="flex items-center space-x-1 bg-white/10 rounded-lg p-1 max-w-fit">
            {[
              { key: 'overview', label: 'Resumen', icon: '📊' },
              { key: 'character', label: 'Mi Progreso', icon: '👤', disabled: !myCharacter },
              { key: 'classmates', label: 'Compañeros', icon: '👥', badge: classStats.totalStudents },
              { key: 'activity', label: 'Actividad', icon: '⚡' }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => !tab.disabled && setActiveTab(tab.key as any)}
                disabled={tab.disabled}
                className={cn(
                  "flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors",
                  activeTab === tab.key 
                    ? "bg-arc-500 text-white" 
                    : tab.disabled 
                    ? "text-gray-500 cursor-not-allowed"
                    : "text-gray-400 hover:text-white hover:bg-white/10"
                )}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
                {tab.badge && !tab.disabled && (
                  <span className="bg-white/20 text-xs px-2 py-1 rounded-full">
                    {tab.badge}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Contenido de pestañas */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Información de la Clase */}
                <div className="bg-white/10 rounded-xl border border-white/20 p-6">
                  <h3 className="text-xl font-bold text-white mb-4">Información de la Clase</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Instructor:</span>
                      <span className="text-white">{classData.teacher?.user?.firstName || 'Instructor'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Estudiantes:</span>
                      <span className="text-white">{classStats.totalStudents} / {classData.maxStudents}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Código:</span>
                      <span className="text-white font-mono">{classData.classCode}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Estado:</span>
                      <span className={cn(
                        "font-medium",
                        isActive ? "text-emerald-300" :
                        isUpcoming ? "text-blue-300" : "text-gray-300"
                      )}>
                        {isActive ? 'Activa' : isUpcoming ? 'Próxima' : 'Finalizada'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Mi Estado en la Clase */}
                <div className="bg-white/10 rounded-xl border border-white/20 p-6">
                  <h3 className="text-xl font-bold text-white mb-4">Mi Estado</h3>
                  {myCharacter ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-emerald-500/10 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <UserIcon className="w-5 h-5 text-emerald-400" />
                          <span className="text-white">Personaje Creado</span>
                        </div>
                        <span className="text-emerald-400">✓</span>
                      </div>
                      
                      <div className="flex items-center justify-between p-3 bg-blue-500/10 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <StarIcon className="w-5 h-5 text-blue-400" />
                          <span className="text-white">Nivel Actual</span>
                        </div>
                        <span className="text-blue-400">{myCharacter.level || 1}</span>
                      </div>
                      
                      <div className="flex items-center justify-between p-3 bg-purple-500/10 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <TrophyIcon className="w-5 h-5 text-purple-400" />
                          <span className="text-white">Ranking</span>
                        </div>
                        <span className="text-purple-400">#{classStats.classRank}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <UserIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-400">Crea tu personaje para comenzar</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Actividades Recientes */}
              <div className="bg-white/10 rounded-xl border border-white/20 p-6">
                <h3 className="text-xl font-bold text-white mb-4">Actividades Recientes</h3>
                <div className="space-y-3">
                  {[
                    { action: 'Te uniste a la clase', time: 'hace 2 días', icon: '🎓' },
                    { action: 'Creaste tu personaje', time: 'hace 2 días', icon: '👤' },
                    { action: 'Completaste primera misión', time: 'hace 1 día', icon: '⭐' },
                    { action: 'Interactuaste con compañeros', time: 'hace 3 horas', icon: '👥' }
                  ].slice(0, myCharacter ? 4 : 2).map((activity, index) => (
                    <div key={index} className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg">
                      <span className="text-2xl">{activity.icon}</span>
                      <div className="flex-1">
                        <p className="text-white text-sm">{activity.action}</p>
                        <p className="text-gray-400 text-xs">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'character' && myCharacter && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Estadísticas del Personaje */}
                <div className="bg-white/10 rounded-xl border border-white/20 p-6">
                  <h3 className="text-xl font-bold text-white mb-4">Estadísticas de {myCharacter.characterName}</h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Nivel</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-white font-bold text-lg">{myCharacter.level || 1}</span>
                        <StarIcon className="w-5 h-5 text-yellow-400" />
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Tipo</span>
                      <span className="text-white">{myCharacter.characterType?.name || 'Guardian'}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Poder</span>
                      <span className="text-white">{(myCharacter.level || 1) * 100 + 750}</span>
                    </div>
                    
                    {/* Barras de habilidades */}
                    <div className="space-y-3 mt-6">
                      {[
                        { skill: 'Fuerza', value: Math.min(((myCharacter.level || 1) * 15 + 25), 100) },
                        { skill: 'Velocidad', value: Math.min(((myCharacter.level || 1) * 12 + 30), 100) },
                        { skill: 'Inteligencia', value: Math.min(((myCharacter.level || 1) * 18 + 20), 100) },
                        { skill: 'Resistencia', value: Math.min(((myCharacter.level || 1) * 10 + 35), 100) }
                      ].map((stat, index) => (
                        <div key={index} className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-400">{stat.skill}</span>
                            <span className="text-white">{stat.value}%</span>
                          </div>
                          <div className="w-full bg-gray-700 rounded-full h-2">
                            <div 
                              className="bg-gradient-to-r from-arc-500 to-blue-600 h-2 rounded-full transition-all duration-1000"
                              style={{ width: `${stat.value}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Progreso en la Clase */}
                <div className="bg-white/10 rounded-xl border border-white/20 p-6">
                  <h3 className="text-xl font-bold text-white mb-4">Progreso en la Clase</h3>
                  
                  <div className="space-y-4">
                    {/* Progreso general */}
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Progreso General</span>
                        <span className="text-arc-400">{classStats.myProgress}%</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-3">
                        <div 
                          className="bg-gradient-to-r from-arc-500 to-blue-600 h-3 rounded-full transition-all duration-1000"
                          style={{ width: `${classStats.myProgress}%` }}
                        />
                      </div>
                    </div>

                    {/* Objetivos */}
                    <div className="space-y-3">
                      <h4 className="text-white font-medium">Objetivos Completados</h4>
                      {[
                        { goal: 'Crear personaje', completed: true },
                        { goal: 'Primera participación', completed: true },
                        { goal: 'Alcanzar nivel 2', completed: (myCharacter.level || 1) >= 2 },
                        { goal: 'Completar 5 actividades', completed: false }
                      ].map((objective, index) => (
                        <div key={index} className="flex items-center justify-between p-2 rounded">
                          <span className={cn(
                            "text-sm",
                            objective.completed ? "text-white" : "text-gray-400"
                          )}>
                            {objective.goal}
                          </span>
                          <span className={cn(
                            "text-sm",
                            objective.completed ? "text-emerald-400" : "text-gray-500"
                          )}>
                            {objective.completed ? "✓" : "○"}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'classmates' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white">Compañeros de Clase</h3>
                <div className="text-sm text-gray-400">
                  {classStats.totalStudents} Guardianes en entrenamiento
                </div>
              </div>

              {classmates.length === 0 ? (
                <div className="text-center py-12 bg-white/10 rounded-xl border border-white/20">
                  <UserGroupIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-white mb-2">Aún no hay compañeros</h3>
                  <p className="text-gray-400">Sé el primero en unirte y crear tu personaje</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Mi personaje primero */}
                  {myCharacter && (
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      className="bg-gradient-to-br from-arc-500/20 to-blue-600/20 rounded-xl border border-arc-500/30 p-4"
                    >
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-arc-500 to-blue-600 rounded-full flex items-center justify-center">
                          <span className="text-white font-bold">
                            {myCharacter.characterName.charAt(0)}
                          </span>
                        </div>
                        <div className="flex-1">
                          <h4 className="text-white font-semibold">{myCharacter.characterName}</h4>
                          <p className="text-arc-400 text-sm">{myCharacter.characterType?.name || 'Guardian'}</p>
                        </div>
                        <span className="text-arc-400 text-xs font-medium">TÚ</span>
                      </div>
                      
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Nivel:</span>
                        <span className="text-white font-medium">{myCharacter.level || 1}</span>
                      </div>
                    </motion.div>
                  )}

                  {/* Compañeros */}
                  {classmates.map((classmate) => (
                    <motion.div
                      key={classmate.id}
                      whileHover={{ scale: 1.02 }}
                      className="bg-white/10 rounded-xl border border-white/20 p-4 hover:border-white/30 transition-all"
                    >
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-gray-500 to-gray-600 rounded-full flex items-center justify-center">
                          <span className="text-white font-bold">
                            {classmate.characterName.charAt(0)}
                          </span>
                        </div>
                        <div className="flex-1">
                          <h4 className="text-white font-semibold">{classmate.characterName}</h4>
                          <p className="text-gray-400 text-sm">{classmate.characterType?.name || 'Guardian'}</p>
                        </div>
                      </div>
                      
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Nivel:</span>
                          <span className="text-white font-medium">{classmate.level || 1}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Unido:</span>
                          <span className="text-white font-medium">
                            {new Date(classmate.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'activity' && (
            <div className="space-y-6">
              <div className="bg-white/10 rounded-xl border border-white/20 p-6">
                <h3 className="text-xl font-bold text-white mb-4">Actividad de la Clase</h3>
                
                <div className="space-y-4">
                  {[
                    { event: 'Nuevo estudiante se unió', user: 'Carlos Titan', time: 'hace 1 hora', icon: '🎓' },
                    { event: 'Completó actividad', user: 'Ana Cazadora', time: 'hace 2 horas', icon: '⭐' },
                    { event: 'Subió de nivel', user: 'Luis Hechicero', time: 'hace 4 horas', icon: '📈' },
                    { event: 'Nuevo personaje creado', user: 'María Guardiana', time: 'hace 6 horas', icon: '👤' },
                    { event: 'Participó en discusión', user: 'Diego Explorador', time: 'hace 8 horas', icon: '💬' }
                  ].map((activity, index) => (
                    <div key={index} className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg">
                      <span className="text-2xl">{activity.icon}</span>
                      <div className="flex-1">
                        <p className="text-white text-sm">
                          <span className="font-medium">{activity.user}</span> {activity.event.toLowerCase()}
                        </p>
                        <p className="text-gray-400 text-xs">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}