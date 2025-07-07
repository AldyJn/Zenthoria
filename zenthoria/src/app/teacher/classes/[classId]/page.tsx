// src/app/teacher/classes/[classId]/page.tsx
'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  UserGroupIcon, 
  QrCodeIcon, 
  ChartBarIcon,
  PencilIcon,
  ShareIcon,
  ExclamationTriangleIcon,
  LinkIcon,
  ArrowLeftIcon,
  ClipboardDocumentIcon,
  EyeIcon,
  TrashIcon,
  CalendarDaysIcon,
  ClockIcon,
  StarIcon,
  SparklesIcon,
  CogIcon
} from '@heroicons/react/24/outline'
import { ClassWithDetails, StudentCharacterWithDetails } from '@/types'
import { useAuth } from '@/hooks/useAuth'
import { toast } from 'react-hot-toast'
import { cn } from '@/lib/utils/cn'

// Componentes importados
import { BackButton, ClassBackButton } from '@/components/ui/BackButton'
import { ClassJoinLinkModal } from '@/components/teacher/ClassJoinLinkModal'
import { QRCodeDisplay, ClassCodeQR } from '@/components/ui/QRCodeDisplay'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { Modal } from '@/components/ui/Modal'

export default function TeacherClassDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user, isAuthenticated } = useAuth()
  const classId = params.classId as string

  const [classData, setClassData] = useState<ClassWithDetails | null>(null)
  const [students, setStudents] = useState<StudentCharacterWithDetails[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'students' | 'random' | 'analytics'>('overview')
  const [showQRModal, setShowQRModal] = useState(false)
  const [showJoinLinkModal, setShowJoinLinkModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState<StudentCharacterWithDetails | null>(null)

  const fetchClassData = useCallback(async () => {
    try {
      setIsLoading(true)

      // Obtener datos de la clase
      const classResponse = await fetch(`/api/classes/${classId}`)
      if (!classResponse.ok) {
        throw new Error('Error al cargar la clase')
      }
      const classResult = await classResponse.json()
      setClassData(classResult.data)

      // Obtener estudiantes de la clase
      const studentsResponse = await fetch(`/api/classes/${classId}/students`)
      if (studentsResponse.ok) {
        const studentsResult = await studentsResponse.json()
        setStudents(studentsResult.data || [])
      }

    } catch (error) {
      console.error('Error al cargar datos:', error)
      toast.error('Error al cargar la información de la clase')
    } finally {
      setIsLoading(false)
    }
  }, [classId])

  useEffect(() => {
    if (isAuthenticated && user?.role === 'teacher') {
      fetchClassData()
    }
  }, [isAuthenticated, user, fetchClassData])

  // Funciones auxiliares
  const copyClassCode = async () => {
    if (!classData) return
    try {
      await navigator.clipboard.writeText(classData.classCode)
      toast.success(`Código "${classData.classCode}" copiado`)
    } catch (error) {
      toast.error('Error al copiar código')
    }
  }

  const shareClassLink = async () => {
    if (!classData) return
    const joinUrl = `${window.location.origin}/join/${classData.classCode}`
    try {
      await navigator.clipboard.writeText(joinUrl)
      toast.success('Enlace de unión copiado')
    } catch (error) {
      toast.error('Error al copiar enlace')
    }
  }

  const handleDeleteClass = async () => {
    if (!classData) return
    
    try {
      const response = await fetch(`/api/classes/${classId}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        toast.success('Clase eliminada exitosamente')
        router.push('/teacher/dashboard')
      } else {
        throw new Error('Error al eliminar la clase')
      }
    } catch (error) {
      toast.error('Error al eliminar la clase')
    }
    setShowDeleteModal(false)
  }

  const selectRandomStudent = () => {
    if (students.length === 0) {
      toast('No hay estudiantes para seleccionar', { icon: 'ℹ️' })
      return
    }
    
    const randomIndex = Math.floor(Math.random() * students.length)
    const selected = students[randomIndex]
    setSelectedStudent(selected)
    toast.success(`¡${selected.characterName} ha sido seleccionado!`)
  }

  // Función auxiliar para determinar si un estudiante está activo
  const isStudentActive = (student: StudentCharacterWithDetails) => {
    // Considera activo si se unió en los últimos 7 días
    const daysSinceJoined = (Date.now() - new Date(student.createdAt).getTime()) / (1000 * 60 * 60 * 24)
    return daysSinceJoined <= 7
  }

  // Calcular estadísticas
  const classStats = {
    totalStudents: students.length,
    activeStudents: students.filter(s => isStudentActive(s)).length,
    averageLevel: students.length > 0 
      ? Math.round(students.reduce((sum, s) => sum + (s.level || 1), 0) / students.length)
      : 0,
    completionRate: 75, // TODO: Calcular basado en actividades reales
    engagement: Math.round(Math.random() * 30 + 70), // Placeholder
    lastActivity: new Date()
  }

  // Calcular estado de la clase
  const now = new Date()
  const startDate = new Date(classData?.startDate || now)
  const endDate = new Date(classData?.endDate || now)
  const isActive = now >= startDate && now <= endDate
  const isUpcoming = now < startDate
  const isEnded = now > endDate

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 flex items-center justify-center">
        <LoadingSpinner size="xl" variant="solar" text="Cargando clase..." />
      </div>
    )
  }

  if (!classData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <ExclamationTriangleIcon className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Clase no encontrada</h2>
          <p className="text-gray-400 mb-6">La clase que buscas no existe o no tienes permisos para verla.</p>
          <ClassBackButton />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header con botón de retroceso */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <ClassBackButton />
              <div>
                <h1 className="text-4xl font-bold text-white mb-2">
                  {classData.name}
                </h1>
                <p className="text-gray-400 text-lg">
                  {classData.description || 'Gestiona a tus Guardianes y monitorea su progreso'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowJoinLinkModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
                title="Ver enlace de unión para estudiantes"
              >
                <LinkIcon className="w-5 h-5" />
                <span>Enlace de Unión</span>
              </button>
              
              <button
                onClick={() => setShowQRModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
              >
                <QrCodeIcon className="w-5 h-5" />
                <span>Código QR</span>
              </button>
              
              <button
                onClick={shareClassLink}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                <ShareIcon className="w-5 h-5" />
                <span>Compartir</span>
              </button>
              
              <button
                onClick={() => router.push(`/teacher/classes/${classId}/edit`)}
                className="flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
              >
                <PencilIcon className="w-5 h-5" />
                <span>Editar</span>
              </button>
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
              <span>{isActive ? '🟢' : isUpcoming ? '🔵' : '⚫'}</span>
              <span>{isActive ? 'Activa' : isUpcoming ? 'Próxima' : 'Finalizada'}</span>
            </span>
            <span className="text-gray-400 flex items-center space-x-2">
              <CalendarDaysIcon className="w-4 h-4" />
              <span>{new Date(classData.startDate).toLocaleDateString()} - {new Date(classData.endDate).toLocaleDateString()}</span>
            </span>
            <span className="text-gray-400 flex items-center space-x-2">
              <ClockIcon className="w-4 h-4" />
              <span>Última actualización: {new Date(classData.updatedAt).toLocaleString()}</span>
            </span>
          </div>
        </div>

        {/* Tarjetas de información de la clase */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 bg-white/10 rounded-xl border border-white/20 hover:bg-white/15 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                <span className="text-2xl">🎓</span>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Código de Clase</p>
                <button
                  onClick={copyClassCode}
                  className="text-xl font-bold text-blue-400 hover:text-blue-300 transition-colors"
                >
                  {classData.classCode}
                </button>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="p-6 bg-white/10 rounded-xl border border-white/20 hover:bg-white/15 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                <UserGroupIcon className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Estudiantes</p>
                <p className="text-xl font-bold text-white">
                  {classStats.totalStudents} / {classData.maxStudents}
                </p>
                <p className="text-xs text-green-400">{classStats.activeStudents} activos</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="p-6 bg-white/10 rounded-xl border border-white/20 hover:bg-white/15 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                <StarIcon className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Nivel Promedio</p>
                <p className="text-xl font-bold text-white">
                  {classStats.averageLevel}
                </p>
                <p className="text-xs text-purple-400">Guardian Level</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="p-6 bg-white/10 rounded-xl border border-white/20 hover:bg-white/15 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center">
                <ChartBarIcon className="w-6 h-6 text-orange-400" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Engagement</p>
                <p className="text-xl font-bold text-white">
                  {classStats.engagement}%
                </p>
                <p className="text-xs text-orange-400">Participación</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Navegación por pestañas */}
        <div className="mb-8">
          <div className="flex items-center space-x-1 bg-white/10 rounded-lg p-1 max-w-fit">
            {[
              { key: 'overview', label: 'Resumen', icon: '📊' },
              { key: 'students', label: 'Estudiantes', icon: '👥', badge: classStats.totalStudents },
              { key: 'random', label: 'Selección', icon: '🎲' },
              { key: 'analytics', label: 'Analíticas', icon: '📈' }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={cn(
                  "flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors",
                  activeTab === tab.key 
                    ? "bg-solar-500 text-white" 
                    : "text-gray-400 hover:text-white hover:bg-white/10"
                )}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
                {tab.badge && (
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
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center space-x-2">
                    <CogIcon className="w-5 h-5" />
                    <span>Información de la Clase</span>
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Fecha de inicio:</span>
                      <span className="text-white">{new Date(classData.startDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Fecha de fin:</span>
                      <span className="text-white">{new Date(classData.endDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Capacidad:</span>
                      <span className="text-white">{classData.maxStudents} estudiantes</span>
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
                    <div className="flex justify-between">
                      <span className="text-gray-400">Ocupación:</span>
                      <span className="text-white">
                        {Math.round((classStats.totalStudents / classData.maxStudents) * 100)}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Acceso Rápido */}
                <div className="bg-white/10 rounded-xl border border-white/20 p-6">
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center space-x-2">
                    <SparklesIcon className="w-5 h-5" />
                    <span>Acceso Rápido</span>
                  </h3>
                  <div className="space-y-3">
                    <button
                      onClick={() => setShowJoinLinkModal(true)}
                      className="w-full flex items-center justify-between p-3 bg-emerald-500/20 border border-emerald-500/30 rounded-lg hover:bg-emerald-500/30 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <LinkIcon className="w-5 h-5 text-emerald-400" />
                        <span className="text-white font-medium">Ver Enlace de Unión</span>
                      </div>
                      <span className="text-emerald-400">→</span>
                    </button>

                    <button
                      onClick={() => setShowQRModal(true)}
                      className="w-full flex items-center justify-between p-3 bg-purple-500/20 border border-purple-500/30 rounded-lg hover:bg-purple-500/30 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <QrCodeIcon className="w-5 h-5 text-purple-400" />
                        <span className="text-white font-medium">Generar Código QR</span>
                      </div>
                      <span className="text-purple-400">→</span>
                    </button>

                    <button
                      onClick={copyClassCode}
                      className="w-full flex items-center justify-between p-3 bg-blue-500/20 border border-blue-500/30 rounded-lg hover:bg-blue-500/30 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <ClipboardDocumentIcon className="w-5 h-5 text-blue-400" />
                        <span className="text-white font-medium">Copiar Código</span>
                      </div>
                      <span className="text-blue-400 font-mono">{classData.classCode}</span>
                    </button>

                    <button
                      onClick={selectRandomStudent}
                      disabled={students.length === 0}
                      className="w-full flex items-center justify-between p-3 bg-yellow-500/20 border border-yellow-500/30 rounded-lg hover:bg-yellow-500/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <div className="flex items-center space-x-3">
                        <SparklesIcon className="w-5 h-5 text-yellow-400" />
                        <span className="text-white font-medium">Selección Aleatoria</span>
                      </div>
                      <span className="text-yellow-400">🎲</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Estadísticas Rápidas */}
              <div className="bg-white/10 rounded-xl border border-white/20 p-6">
                <h3 className="text-xl font-bold text-white mb-4">Estadísticas Rápidas</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
                    <div className="text-2xl font-bold text-blue-400">{classStats.totalStudents}</div>
                    <div className="text-sm text-gray-400">Total Estudiantes</div>
                  </div>
                  <div className="text-center p-4 bg-green-500/10 rounded-lg border border-green-500/20">
                    <div className="text-2xl font-bold text-green-400">{classStats.activeStudents}</div>
                    <div className="text-sm text-gray-400">Activos Hoy</div>
                  </div>
                  <div className="text-center p-4 bg-purple-500/10 rounded-lg border border-purple-500/20">
                    <div className="text-2xl font-bold text-purple-400">{classStats.averageLevel}</div>
                    <div className="text-sm text-gray-400">Nivel Promedio</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'students' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white">Lista de Estudiantes</h3>
                <div className="text-sm text-gray-400">
                  {classStats.totalStudents} de {classData.maxStudents} estudiantes
                </div>
              </div>

              {students.length === 0 ? (
                <div className="text-center py-12 bg-white/10 rounded-xl border border-white/20">
                  <UserGroupIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-white mb-2">No hay estudiantes aún</h3>
                  <p className="text-gray-400 mb-4">Comparte el código de clase para que los estudiantes se unan</p>
                  <button
                    onClick={() => setShowJoinLinkModal(true)}
                    className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg"
                  >
                    Obtener Enlace de Unión
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {students.map((student) => (
                    <motion.div
                      key={student.id}
                      whileHover={{ scale: 1.02 }}
                      className="bg-white/10 rounded-xl border border-white/20 p-4 hover:border-white/30 transition-all"
                    >
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-solar-500 to-orange-600 rounded-full flex items-center justify-center">
                          <span className="text-white font-bold">
                            {student.characterName.charAt(0)}
                          </span>
                        </div>
                        <div className="flex-1">
                          <h4 className="text-white font-semibold">{student.characterName}</h4>
                          <p className="text-gray-400 text-sm">{student.characterType?.name || 'Guardian'}</p>
                        </div>
                        <span className={cn(
                          "w-3 h-3 rounded-full",
                          isStudentActive(student) ? "bg-green-400" : "bg-gray-400"
                        )} />
                      </div>
                      
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Nivel:</span>
                          <span className="text-white font-medium">{student.level || 1}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">XP:</span>
                          <span className="text-white font-medium">{student.experiencePoints || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Unido:</span>
                          <span className="text-white font-medium">
                            {new Date(student.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'random' && (
            <div className="space-y-6">
              <div className="text-center bg-white/10 rounded-xl border border-white/20 p-8">
                <h3 className="text-2xl font-bold text-white mb-4">Selección Aleatoria de Estudiantes</h3>
                <p className="text-gray-400 mb-6">
                  Utiliza esta herramienta para seleccionar estudiantes de forma aleatoria para participar en actividades
                </p>
                
                {selectedStudent && (
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="mb-6 p-6 bg-gradient-to-br from-solar-500/20 to-orange-600/20 rounded-xl border border-solar-500/30"
                  >
                    <h4 className="text-xl font-bold text-white mb-2">Estudiante Seleccionado:</h4>
                    <div className="flex items-center justify-center space-x-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-solar-500 to-orange-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-xl">
                          {selectedStudent.characterName.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-white">{selectedStudent.characterName}</p>
                        <p className="text-solar-400">{selectedStudent.characterType?.name || 'Guardian'}</p>
                      </div>
                    </div>
                  </motion.div>
                )}
                
                <button
                  onClick={selectRandomStudent}
                  disabled={students.length === 0}
                  className="px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg hover:from-purple-600 hover:to-pink-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed font-medium text-lg"
                >
                  <SparklesIcon className="w-6 h-6 inline mr-2" />
                  {students.length === 0 ? 'No hay estudiantes' : 'Seleccionar Estudiante'}
                </button>
                
                <div className="mt-6 text-gray-400 text-sm">
                  {students.length > 0 && `${students.length} estudiante${students.length !== 1 ? 's' : ''} disponible${students.length !== 1 ? 's' : ''} para selección`}
                </div>
              </div>

              {/* Lista de todos los estudiantes para selección */}
              {students.length > 0 && (
                <div className="bg-white/10 rounded-xl border border-white/20 p-6">
                  <h4 className="text-lg font-bold text-white mb-4">Todos los Estudiantes</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {students.map((student) => (
                      <button
                        key={student.id}
                        onClick={() => setSelectedStudent(student)}
                        className={cn(
                          "p-3 rounded-lg border transition-all text-left",
                          selectedStudent?.id === student.id
                            ? "bg-solar-500/20 border-solar-500/50 text-white"
                            : "bg-white/10 border-white/20 text-gray-300 hover:bg-white/20 hover:border-white/30"
                        )}
                      >
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 bg-gradient-to-br from-solar-500 to-orange-600 rounded-full flex items-center justify-center">
                            <span className="text-white font-bold text-sm">
                              {student.characterName.charAt(0)}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{student.characterName}</p>
                            <p className="text-xs opacity-75">Nv. {student.level || 1}</p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <div className="bg-white/10 rounded-xl border border-white/20 p-8 text-center">
                <ChartBarIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-white mb-4">Analíticas Avanzadas</h3>
                <p className="text-gray-400 mb-6">Próximamente dispondremos de métricas detalladas de rendimiento y engagement</p>
                
                {/* Métricas placeholder */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                  <div className="p-6 bg-blue-500/10 rounded-lg border border-blue-500/20">
                    <h4 className="font-medium text-blue-300 mb-2">📊 Participación</h4>
                    <div className="text-2xl font-bold text-white mb-1">{classStats.engagement}%</div>
                    <p className="text-sm text-gray-400">Engagement promedio</p>
                    <div className="mt-3 bg-blue-500/20 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full transition-all duration-1000"
                        style={{ width: `${classStats.engagement}%` }}
                      />
                    </div>
                  </div>
                  
                  <div className="p-6 bg-green-500/10 rounded-lg border border-green-500/20">
                    <h4 className="font-medium text-green-300 mb-2">📈 Progreso</h4>
                    <div className="text-2xl font-bold text-white mb-1">{classStats.completionRate}%</div>
                    <p className="text-sm text-gray-400">Tasa de completitud</p>
                    <div className="mt-3 bg-green-500/20 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full transition-all duration-1000"
                        style={{ width: `${classStats.completionRate}%` }}
                      />
                    </div>
                  </div>
                  
                  <div className="p-6 bg-purple-500/10 rounded-lg border border-purple-500/20">
                    <h4 className="font-medium text-purple-300 mb-2">🎯 Rendimiento</h4>
                    <div className="text-2xl font-bold text-white mb-1">{classStats.averageLevel}</div>
                    <p className="text-sm text-gray-400">Nivel promedio alcanzado</p>
                    <div className="mt-3 bg-purple-500/20 rounded-full h-2">
                      <div 
                        className="bg-purple-500 h-2 rounded-full transition-all duration-1000"
                        style={{ width: `${(classStats.averageLevel / 10) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Gráfico de actividad placeholder */}
                <div className="mt-8 p-6 bg-slate-800/50 rounded-lg border border-white/10">
                  <h4 className="font-medium text-white mb-4 text-left">Actividad Semanal</h4>
                  <div className="flex items-end justify-between h-32 space-x-2">
                    {Array.from({ length: 7 }, (_, i) => {
                      const height = Math.random() * 80 + 20;
                      const day = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'][i];
                      return (
                        <div key={i} className="flex-1 flex flex-col items-center">
                          <div 
                            className="w-full bg-gradient-to-t from-solar-500 to-orange-400 rounded-t-sm transition-all duration-1000"
                            style={{ height: `${height}%` }}
                          />
                          <span className="text-xs text-gray-400 mt-2">{day}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Lista de actividades recientes */}
                <div className="mt-8 p-6 bg-slate-800/50 rounded-lg border border-white/10">
                  <h4 className="font-medium text-white mb-4 text-left">Actividad Reciente</h4>
                  <div className="space-y-3 text-left">
                    {[
                      { user: 'Ana Guardián', action: 'completó una misión', time: 'hace 2 horas' },
                      { user: 'Carlos Titan', action: 'subió al nivel 5', time: 'hace 4 horas' },
                      { user: 'María Cazadora', action: 'se unió a la clase', time: 'hace 1 día' },
                      { user: 'Luis Hechicero', action: 'completó 3 actividades', time: 'hace 2 días' }
                    ].map((activity, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-solar-500 to-orange-600 rounded-full flex items-center justify-center">
                            <span className="text-white font-bold text-sm">
                              {activity.user.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <p className="text-white text-sm">
                              <span className="font-medium">{activity.user}</span> {activity.action}
                            </p>
                          </div>
                        </div>
                        <span className="text-gray-400 text-xs">{activity.time}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </motion.div>

        {/* Footer de acciones */}
        <div className="mt-8 flex justify-between items-center p-4 bg-white/5 rounded-xl border border-white/10">
          <div className="flex items-center space-x-6 text-sm text-gray-400">
            <span>Última actualización: {new Date(classData.updatedAt).toLocaleDateString('es-ES')}</span>
            <span>•</span>
            <span>Creada: {new Date(classData.createdAt).toLocaleDateString('es-ES')}</span>
            <span>•</span>
            <span>ID: {classData.id.slice(0, 8)}...</span>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => router.push(`/teacher/classes/${classId}/edit`)}
              className="px-4 py-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors flex items-center space-x-2"
            >
              <PencilIcon className="w-4 h-4" />
              <span>Editar</span>
            </button>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="px-4 py-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors flex items-center space-x-2"
            >
              <TrashIcon className="w-4 h-4" />
              <span>Eliminar Clase</span>
            </button>
          </div>
        </div>
      </div>

      {/* Modal de Código QR */}
      <Modal
        isOpen={showQRModal}
        onClose={() => setShowQRModal(false)}
        title="Código QR de la Clase"
        size="md"
      >
        <div className="text-center space-y-6">
          <p className="text-gray-400">
            Los estudiantes pueden escanear este código QR para unirse a tu clase '{classData.name}'
          </p>
          
          <ClassCodeQR
            classCode={classData.classCode}
            size={250}
          />
          
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
            <h4 className="text-blue-300 font-medium mb-2">Instrucciones para Estudiantes</h4>
            <ol className="text-gray-300 text-sm space-y-1 text-left">
              <li>1. Abre la cámara de tu teléfono</li>
              <li>2. Escanea el código QR</li>
              <li>3. Sigue el enlace automático</li>
              <li>4. Regístrate y crea tu personaje Guardian</li>
              <li>5. ¡Comienza tu entrenamiento!</li>
            </ol>
          </div>
        </div>
      </Modal>

      {/* Modal de Enlace de Unión */}
      <ClassJoinLinkModal
        isOpen={showJoinLinkModal}
        onClose={() => setShowJoinLinkModal(false)}
        classData={classData}
      />

      {/* Modal de Confirmación de Eliminación */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Confirmar Eliminación"
        size="sm"
      >
        <div className="text-center space-y-6">
          <ExclamationTriangleIcon className="w-16 h-16 text-red-400 mx-auto" />
          <div>
            <h3 className="text-xl font-bold text-white mb-2">¿Eliminar clase?</h3>
            <p className="text-gray-400 mb-4">
              Esta acción eliminará permanentemente la clase '{classData.name}' y todos los datos asociados.
            </p>
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
              <p className="text-red-400 text-sm font-medium">
                ⚠️ Esta acción no se puede deshacer
              </p>
              <p className="text-gray-400 text-xs mt-1">
                Se eliminarán {classStats.totalStudents} estudiantes y todos sus progresos
              </p>
            </div>
          </div>
          <div className="flex items-center justify-center space-x-3">
            <button
              onClick={() => setShowDeleteModal(false)}
              className="px-6 py-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleDeleteClass}
              className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium"
            >
              Eliminar Definitivamente
            </button>
          </div>
        </div>
      </Modal>

      {/* Toast de estudiante seleccionado */}
      <AnimatePresence>
        {selectedStudent && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 50 }}
            className="fixed bottom-4 right-4 bg-gradient-to-r from-solar-500 to-orange-600 text-white p-4 rounded-lg shadow-xl border border-white/20 z-50"
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <span className="font-bold">{selectedStudent.characterName.charAt(0)}</span>
              </div>
              <div>
                <p className="font-medium">¡Estudiante Seleccionado!</p>
                <p className="text-sm opacity-90">{selectedStudent.characterName}</p>
              </div>
              <button
                onClick={() => setSelectedStudent(null)}
                className="p-1 hover:bg-white/20 rounded"
              >
                ×
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}