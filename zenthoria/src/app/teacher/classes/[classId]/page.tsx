// src/app/teacher/classes/[classId]/page.tsx
'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  UserGroupIcon, 
  QrCodeIcon, 
  ChartBarIcon,
  PencilIcon,
  ShareIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'
import { ClassWithDetails, StudentCharacterWithDetails } from '@/types'
import { useAuth } from '@/hooks/useAuth'
import { toast } from 'react-hot-toast'
import { cn } from '@/lib/utils/cn'

// Componentes que vamos a usar
import { RandomSelector } from '@/components/teacher/RandomSelector'
import { StudentsList } from '@/components/teacher/StudentsList'
import { EmptyStateTeacher } from '@/components/ui/EmptyState'
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
  const [showDeleteModal, setShowDeleteModal] = useState(false)

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
      console.error('Error cargando datos de la clase:', error)
      toast.error('Error al cargar los datos de la clase')
    } finally {
      setIsLoading(false)
    }
  }, [classId])

  useEffect(() => {
    if (isAuthenticated && user?.role === 'teacher') {
      fetchClassData()
    }
  }, [isAuthenticated, user, fetchClassData])

  const handleBulkAction = async (action: string, studentIds: string[]) => {
    try {
      switch (action) {
        case 'award_experience':
          // Implementar otorgamiento masivo de experiencia
          const xpResponse = await fetch(`/api/classes/${classId}/bulk-award-xp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              studentIds, 
              amount: 50, 
              reason: 'Participación grupal' 
            })
          })
          
          if (xpResponse.ok) {
            toast.success(`Experiencia otorgada a ${studentIds.length} estudiante(s)`)
            fetchClassData() // Recargar datos
          } else {
            throw new Error('Error otorgando experiencia')
          }
          break

        case 'send_message':
          // Implementar envío de mensajes (placeholder)
          toast.success(`Mensaje enviado a ${studentIds.length} estudiante(s)`)
          break

        default:
          toast.error('Acción no reconocida')
      }
    } catch (error) {
      console.error('Error en acción masiva:', error)
      toast.error('Error al ejecutar la acción')
    }
  }

  const handleDeleteClass = async () => {
    try {
      const response = await fetch(`/api/classes/${classId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast.success('Clase eliminada exitosamente')
        router.push('/teacher/dashboard')
      } else {
        throw new Error('Error eliminando clase')
      }
    } catch (error) {
      console.error('Error eliminando clase:', error)
      toast.error('Error al eliminar la clase')
    }
    setShowDeleteModal(false)
  }

  const copyClassCode = () => {
    if (classData?.classCode) {
      navigator.clipboard.writeText(classData.classCode)
      toast.success('Código de clase copiado al portapapeles')
    }
  }

  const shareClassLink = () => {
    if (classData?.classCode) {
      const shareUrl = `${window.location.origin}/student/join/${classData.classCode}`
      navigator.clipboard.writeText(shareUrl)
      toast.success('Enlace de clase copiado al portapapeles')
    }
  }

  // Calcular estadísticas de la clase
  const classStats = {
    totalStudents: students.length,
    averageLevel: students.length > 0 
      ? Math.round(students.reduce((sum, s) => sum + s.level, 0) / students.length)
      : 0,
    totalExperience: students.reduce((sum, s) => sum + s.experiencePoints, 0),
    characterTypeDistribution: students.reduce((acc, s) => {
      acc[s.characterType.name] = (acc[s.characterType.name] || 0) + 1
      return acc
    }, {} as Record<string, number>),
    healthDistribution: {
      healthy: students.filter(s => (s.currentHealth / s.maxHealth) > 0.7).length,
      injured: students.filter(s => (s.currentHealth / s.maxHealth) <= 0.7 && (s.currentHealth / s.maxHealth) > 0.3).length,
      critical: students.filter(s => (s.currentHealth / s.maxHealth) <= 0.3).length
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-white">Cargando datos de la clase...</p>
        </div>
      </div>
    )
  }

  if (!classData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 flex items-center justify-center">
        <div className="text-center space-y-4">
          <ExclamationTriangleIcon className="w-16 h-16 text-red-400 mx-auto" />
          <h2 className="text-2xl font-bold text-white">Clase no encontrada</h2>
          <p className="text-gray-400">La clase que buscas no existe o no tienes permisos para verla.</p>
          <button
            onClick={() => router.push('/teacher/dashboard')}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Volver al Dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">
                {classData.name}
              </h1>
              <p className="text-gray-400 text-lg">
                {classData.description || 'Gestiona a tus Guardianes y monitorea su progreso'}
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowQRModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
              >
                <QrCodeIcon className="w-5 h-5" />
                Código QR
              </button>
              
              <button
                onClick={shareClassLink}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
              >
                <ShareIcon className="w-5 h-5" />
                Compartir
              </button>
              
              <button
                onClick={() => router.push(`/teacher/classes/${classId}/edit`)}
                className="flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
              >
                <PencilIcon className="w-5 h-5" />
                Editar
              </button>
            </div>
          </div>

          {/* Class Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="p-4 bg-white/10 rounded-xl border border-white/20">
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
            </div>

            <div className="p-4 bg-white/10 rounded-xl border border-white/20">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                  <UserGroupIcon className="w-6 h-6 text-green-400" />
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Estudiantes</p>
                  <p className="text-xl font-bold text-white">
                    {classStats.totalStudents} / {classData.maxStudents}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-white/10 rounded-xl border border-white/20">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                  <span className="text-2xl">⭐</span>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Nivel Promedio</p>
                  <p className="text-xl font-bold text-white">
                    {classStats.averageLevel}
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
                  <p className="text-gray-400 text-sm">XP Total</p>
                  <p className="text-xl font-bold text-white">
                    {classStats.totalExperience.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex bg-white/5 rounded-xl p-1 border border-white/10">
            {[
              { id: 'overview', label: 'Resumen', icon: '📊' },
              { id: 'students', label: 'Estudiantes', icon: '👥' },
              { id: 'random', label: 'Selección Aleatoria', icon: '🎲' },
              { id: 'analytics', label: 'Análisis', icon: '📈' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={cn(
                  'flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg transition-all duration-200',
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white shadow-lg'
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
              {/* Quick Stats */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="p-6 bg-white/5 rounded-xl border border-white/10">
                  <h3 className="text-xl font-semibold text-white mb-4">
                    📊 Distribución por Tipo
                  </h3>
                  <div className="space-y-3">
                    {Object.entries(classStats.characterTypeDistribution).map(([type, count]) => (
                      <div key={type} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">
                            {type === 'hunter' ? '🏹' : type === 'titan' ? '🛡️' : '🔮'}
                          </span>
                          <span className="text-white capitalize">{type}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-24 h-2 bg-gray-700 rounded-full overflow-hidden">
                            <div
                              className={cn(
                                'h-full transition-all duration-500',
                                type === 'hunter' ? 'bg-orange-500' :
                                type === 'titan' ? 'bg-blue-500' : 'bg-purple-500'
                              )}
                              style={{
                                width: `${(count / classStats.totalStudents) * 100}%`
                              }}
                            />
                          </div>
                          <span className="text-gray-300 text-sm w-8 text-right">{count}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-6 bg-white/5 rounded-xl border border-white/10">
                  <h3 className="text-xl font-semibold text-white mb-4">
                    ❤️ Estado de Salud
                  </h3>
                  <div className="space-y-3">
                    {[
                      { status: 'healthy', label: 'Saludables', count: classStats.healthDistribution.healthy, color: 'bg-green-500' },
                      { status: 'injured', label: 'Heridos', count: classStats.healthDistribution.injured, color: 'bg-yellow-500' },
                      { status: 'critical', label: 'Críticos', count: classStats.healthDistribution.critical, color: 'bg-red-500' }
                    ].map(({ status, label, count, color }) => (
                      <div key={status} className="flex items-center justify-between">
                        <span className="text-white">{label}</span>
                        <div className="flex items-center gap-3">
                          <div className="w-24 h-2 bg-gray-700 rounded-full overflow-hidden">
                            <div
                              className={cn('h-full transition-all duration-500', color)}
                              style={{
                                width: classStats.totalStudents > 0 
                                  ? `${(count / classStats.totalStudents) * 100}%` 
                                  : '0%'
                              }}
                            />
                          </div>
                          <span className="text-gray-300 text-sm w-8 text-right">{count}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="p-6 bg-white/5 rounded-xl border border-white/10">
                <h3 className="text-xl font-semibold text-white mb-4">
                  🕐 Actividad Reciente
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                    <span className="text-2xl">🎯</span>
                    <div className="flex-1">
                      <p className="text-white">Clase creada</p>
                      <p className="text-gray-400 text-sm">
                        {new Date(classData.createdAt).toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                  
                  {students.slice(0, 3).map((student) => (
                    <div key={student.id} className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                      <span className="text-2xl">
                        {student.characterType.name === 'hunter' ? '🏹' : 
                         student.characterType.name === 'titan' ? '🛡️' : '🔮'}
                      </span>
                      <div className="flex-1">
                        <p className="text-white">
                          {student.student.user.firstName} {student.student.user.lastName} se unió a la clase
                        </p>
                        <p className="text-gray-400 text-sm">
                          {student.characterName} • Nivel {student.level}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'students' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {students.length > 0 ? (
                <StudentsList
                  students={students}
                  onBulkAction={handleBulkAction}
                />
              ) : (
                <EmptyStateTeacher
                  variant="no-students"
                  actionButton={
                    <button
                      onClick={() => setShowQRModal(true)}
                      className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                    >
                      🎯 Mostrar Código QR
                    </button>
                  }
                />
              )}
            </motion.div>
          )}

          {activeTab === 'random' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {students.length > 0 ? (
                <RandomSelector
                  students={students}
                  classId={classId}
                  onSelection={() => {
                    // Refrescar datos después de selección
                    fetchClassData()
                  }}
                />
              ) : (
                <EmptyStateTeacher
                  variant="no-students"
                  title="Necesitas estudiantes para usar la selección aleatoria"
                  description="Invita estudiantes a tu clase para poder usar la herramienta de selección aleatoria."
                />
              )}
            </motion.div>
          )}

          {activeTab === 'analytics' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="text-center p-12 bg-white/5 rounded-xl border border-white/10">
                <ChartBarIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-2xl font-semibold text-white mb-2">
                  Análisis Avanzado
                </h3>
                <p className="text-gray-400 mb-6">
                  Esta funcionalidad estará disponible próximamente con gráficos detallados,
                  métricas de participación y reportes personalizados.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
                    <h4 className="font-medium text-blue-300">📊 Participación</h4>
                    <p className="text-sm text-gray-400 mt-1">Métricas de engagement</p>
                  </div>
                  <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/20">
                    <h4 className="font-medium text-green-300">📈 Progreso</h4>
                    <p className="text-sm text-gray-400 mt-1">Evolución temporal</p>
                  </div>
                  <div className="p-4 bg-purple-500/10 rounded-lg border border-purple-500/20">
                    <h4 className="font-medium text-purple-300">🎯 Rendimiento</h4>
                    <p className="text-sm text-gray-400 mt-1">Análisis comparativo</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Actions Footer */}
        <div className="mt-8 flex justify-between items-center p-4 bg-white/5 rounded-xl border border-white/10">
          <div className="text-gray-400 text-sm">
            Última actualización: {new Date(classData.updatedAt).toLocaleDateString('es-ES')}
          </div>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="px-4 py-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
          >
            🗑️ Eliminar Clase
          </button>
        </div>
      </div>

      {/* QR Code Modal */}
      <Modal
        isOpen={showQRModal}
        onClose={() => setShowQRModal(false)}
        title="Código QR de la Clase"
        size="md"
      >
        <div className="text-center space-y-6">
          <p className="text-gray-400">
            Los estudiantes pueden escanear este código QR para unirse a tu clase
          </p>
          
          {/* QR Code Placeholder */}
          <div className="w-64 h-64 mx-auto bg-white rounded-xl flex items-center justify-center">
            <div className="text-center">
              <QrCodeIcon className="w-24 h-24 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600 text-sm">Código QR</p>
              <p className="text-lg font-bold text-gray-800">{classData?.classCode}</p>
            </div>
          </div>
          
          <div className="space-y-3">
            <button
              onClick={copyClassCode}
              className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              📋 Copiar Código: {classData?.classCode}
            </button>
            
            <button
              onClick={shareClassLink}
              className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
            >
              🔗 Copiar Enlace de Invitación
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="⚠️ Eliminar Clase"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-gray-300">
            ¿Estás seguro de que quieres eliminar la clase <strong>&quot;{classData?.name}&quot;</strong>?
          </p>
          <p className="text-red-400 text-sm">
            Esta acción no se puede deshacer. Se perderán todos los datos de estudiantes y progreso.
          </p>
          
          <div className="flex gap-3 pt-4">
            <button
              onClick={() => setShowDeleteModal(false)}
              className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleDeleteClass}
              className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
            >
              Eliminar Clase
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}