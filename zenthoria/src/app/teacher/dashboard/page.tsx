// src/app/teacher/dashboard/page.tsx - Solución 2 Completa
'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  PlusIcon,
  AcademicCapIcon,
  EyeIcon,
  SparklesIcon,
  ClipboardDocumentIcon,
  QrCodeIcon,
  TrashIcon,
  LinkIcon,
  UserGroupIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline'
import { useAuth, useTeacherInfo } from '@/hooks/useAuth'
import { useClasses } from '@/hooks/useClasses'
import { ClassWithDetails } from '@/types'
import { toast } from 'react-hot-toast'
import { cn } from '@/lib/utils/cn'

// Componentes
import { CreateClassModal } from '@/components/teacher/CreateClassModal'
import { ClassJoinLinkModal } from '@/components/teacher/ClassJoinLinkModal'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { Modal } from '@/components/ui/Modal'

export default function TeacherDashboardPage() {
  const { user, isAuthenticated } = useAuth()
  const { teacherId } = useTeacherInfo()
  const { classes: rawClasses, isLoading, refreshClasses, deleteClass } = useClasses()
  
  // Usar el tipo oficial de ClassWithDetails
  const classes = (rawClasses || []) as ClassWithDetails[]
  
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showJoinLinkModal, setShowJoinLinkModal] = useState(false)
  const [showQRModal, setShowQRModal] = useState(false)
  const [selectedClassForQR, setSelectedClassForQR] = useState<ClassWithDetails | null>(null)
  const [selectedClassForLink, setSelectedClassForLink] = useState<ClassWithDetails | null>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  useEffect(() => {
    if (isAuthenticated && teacherId) {
      refreshClasses()
    }
  }, [isAuthenticated, teacherId, refreshClasses])

  // Función helper para obtener el conteo de estudiantes de forma segura
  const getStudentCount = (classData: ClassWithDetails): number => {
    // Intentar _count primero, luego enrollments.length, luego 0
    return classData._count?.enrollments || 
           classData.enrollments?.length || 
           0
  }

  // Función helper para obtener el conteo de personajes de forma segura
  // const getCharacterCount = (classData: ClassWithDetails): number => {
  //   return classData._count?.characters || 
  //          classData.characters?.length || 
  //          0
  // }

  // Cálculos de estadísticas con funciones helper
  const totalClasses = classes.length
  const activeClasses = classes.filter(cls => {
    const now = new Date()
    const start = new Date(cls.startDate)
    const end = new Date(cls.endDate)
    return now >= start && now <= end
  })
  const upcomingClasses = classes.filter(cls => new Date(cls.startDate) > new Date())
  const totalStudents = classes.reduce((sum, cls) => sum + getStudentCount(cls), 0)
  const averageStudentsPerClass = totalClasses > 0 ? Math.round(totalStudents / totalClasses) : 0
  const totalCapacity = classes.reduce((sum, cls) => sum + cls.maxStudents, 0)
  const capacityUsage = totalCapacity > 0 ? Math.round((totalStudents / totalCapacity) * 100) : 0

  const copyClassCode = async (code: string, className: string) => {
    try {
      await navigator.clipboard.writeText(code)
      toast.success(`Código de '${className}' copiado`)
    } catch (error) {
      toast.error('Error al copiar código')
    }
  }

  const handleDeleteClass = async (classId: string, className: string) => {
    if (!confirm(`¿Estás seguro de que quieres eliminar la clase '${className}'? Esta acción no se puede deshacer.`)) {
      return
    }

    const success = await deleteClass(classId)
    if (success) {
      refreshClasses()
    }
  }

  const handleShowQR = (classData: ClassWithDetails) => {
    setSelectedClassForQR(classData)
    setShowQRModal(true)
  }

  const handleShowJoinLink = (classData: ClassWithDetails) => {
    setSelectedClassForLink(classData)
    setShowJoinLinkModal(true)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-solar-900 via-slate-900 to-solar-800 flex items-center justify-center">
        <LoadingSpinner size="xl" variant="solar" text="Cargando dashboard..." />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-solar-900 via-slate-900 to-solar-800 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Principal */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">
                ¡Bienvenido, Guardián Instructor {user?.name}!
              </h1>
              <p className="text-xl text-gray-300">
                Gestiona tus clases y guía a los nuevos Guardianes en su entrenamiento.
              </p>
            </div>
            <div className="text-right">
              <p className="text-gray-400 text-sm">Última actualización</p>
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
            title="Total de Clases"
            value={totalClasses}
            subtitle={`${activeClasses.length} activas`}
            icon={<AcademicCapIcon className="w-8 h-8" />}
            color="from-solar-500 to-orange-600"
            bgColor="bg-solar-500/20"
            borderColor="border-solar-500/30"
            trend={upcomingClasses.length > 0 ? `+${upcomingClasses.length} próximas` : undefined}
          />
          
          <StatsCard
            title="Total Estudiantes"
            value={totalStudents}
            subtitle={`${averageStudentsPerClass} por clase`}
            icon={<UserGroupIcon className="w-8 h-8" />}
            color="from-emerald-500 to-green-600"
            bgColor="bg-emerald-500/20"
            borderColor="border-emerald-500/30"
            trend={totalStudents > 0 ? "Creciendo" : undefined}
          />
          
          <StatsCard
            title="Clases Activas"
            value={activeClasses.length}
            subtitle="En curso ahora"
            icon={<SparklesIcon className="w-8 h-8" />}
            color="from-blue-500 to-cyan-600"
            bgColor="bg-blue-500/20"
            borderColor="border-blue-500/30"
            trend={activeClasses.length > 0 ? "En línea" : "Inactivo"}
          />
          
          <StatsCard
            title="Uso de Capacidad"
            value={`${capacityUsage}%`}
            subtitle={`${totalStudents} de ${totalCapacity} plazas`}
            icon={<ChartBarIcon className="w-8 h-8" />}
            color="from-purple-500 to-violet-600"
            bgColor="bg-purple-500/20"
            borderColor="border-purple-500/30"
            trend={capacityUsage > 75 ? "Alta ocupación" : "Disponible"}
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
              title="Crear Nueva Clase"
              description="Configura una nueva clase para tus estudiantes"
              icon={<PlusIcon className="w-6 h-6" />}
              onClick={() => setShowCreateModal(true)}
              color="from-solar-500 to-orange-600"
              trend={totalClasses === 0 ? "¡Comienza aquí!" : undefined}
            />
            
            <QuickActionCard
              title="Ver Todas las Clases"
              description="Gestiona y revisa todas tus clases"
              icon={<EyeIcon className="w-6 h-6" />}
              onClick={() => {
                if (totalClasses === 0) {
                  toast('Primero crea una clase', { icon: 'ℹ️' })
                  return
                }
                document.getElementById('classes-section')?.scrollIntoView({ behavior: 'smooth' })
              }}
              color="from-blue-500 to-cyan-600"
              disabled={totalClasses === 0}
            />
            
            <QuickActionCard
              title="Selección Aleatoria"
              description="Herramienta de participación para clases activas"
              icon={<SparklesIcon className="w-6 h-6" />}
              onClick={() => {
                if (activeClasses.length === 0) {
                  toast('No hay clases activas para selección', { icon: 'ℹ️' })
                  return
                }
                toast('Herramienta de selección - Próximamente', { icon: '🚧' })
              }}
              color="from-purple-500 to-violet-600"
              disabled={activeClasses.length === 0}
              badge={activeClasses.length > 0 ? `${activeClasses.length} activa${activeClasses.length !== 1 ? 's' : ''}` : undefined}
            />
            
            <QuickActionCard
              title="Estadísticas Generales"
              description="Analiza el rendimiento global"
              icon={<ChartBarIcon className="w-6 h-6" />}
              onClick={() => toast('Panel de estadísticas - Próximamente', { icon: '🚧' })}
              color="from-emerald-500 to-green-600"
              disabled={totalStudents === 0}
            />
          </div>
        </motion.div>

        {/* Clases Destacadas si hay clases activas */}
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
                  🟢 {activeClasses.length} clase{activeClasses.length !== 1 ? 's' : ''} en curso
                </h3>
                <span className="text-emerald-400 text-sm">Acceso rápido</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {activeClasses.slice(0, 3).map((cls) => {
                  const studentCount = getStudentCount(cls)
                  return (
                    <motion.div
                      key={cls.id}
                      whileHover={{ scale: 1.02 }}
                      className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 p-4 hover:border-emerald-500/40 transition-all duration-200"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h4 className="text-white font-semibold truncate">{cls.name}</h4>
                          <div className="flex items-center space-x-2 text-sm text-gray-400 mt-1">
                            <span>{studentCount} estudiante{studentCount !== 1 ? 's' : ''}</span>
                            <span>•</span>
                            <span>Código: {cls.classCode}</span>
                            <span>•</span>
                            <span>Activa</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <span className="text-gray-400 text-sm">
                          {new Date(cls.updatedAt).toLocaleDateString()}
                        </span>
                        <div className="flex items-center space-x-1 ml-auto">
                          <button
                            onClick={() => window.location.href = `/teacher/classes/${cls.id}`}
                            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                            title="Ver clase"
                          >
                            <EyeIcon className="w-4 h-4 text-gray-400 hover:text-white" />
                          </button>
                          <button
                            onClick={() => handleShowJoinLink(cls)}
                            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                            title="Enlace de unión"
                          >
                            <LinkIcon className="w-4 h-4 text-gray-400 hover:text-emerald-400" />
                          </button>
                          <button
                            onClick={() => copyClassCode(cls.classCode, cls.name)}
                            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                            title="Copiar código"
                          >
                            <ClipboardDocumentIcon className="w-4 h-4 text-gray-400 hover:text-white" />
                          </button>
                          <button
                            onClick={() => handleShowQR(cls)}
                            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                            title="Ver QR"
                          >
                            <QrCodeIcon className="w-4 h-4 text-gray-400 hover:text-white" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </div>
          </motion.div>
        )}

        {/* Sección Principal de Clases */}
        <motion.div
          id="classes-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Mis Clases ({totalClasses})</h2>
            <div className="flex items-center space-x-4">
              {/* Toggle de vista */}
              <div className="flex items-center space-x-2 bg-white/10 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={cn(
                    "px-3 py-1 rounded-md text-sm transition-colors",
                    viewMode === 'grid' 
                      ? "bg-solar-500 text-white" 
                      : "text-gray-400 hover:text-white"
                  )}
                >
                  Cuadrícula
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={cn(
                    "px-3 py-1 rounded-md text-sm transition-colors",
                    viewMode === 'list' 
                      ? "bg-solar-500 text-white" 
                      : "text-gray-400 hover:text-white"
                  )}
                >
                  Lista
                </button>
              </div>
              
              {/* Botón crear clase */}
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center space-x-2 bg-gradient-to-r from-solar-500 to-orange-600 text-white px-4 py-2 rounded-lg hover:from-solar-600 hover:to-orange-700 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <PlusIcon className="w-5 h-5" />
                <span>Nueva Clase</span>
              </button>
            </div>
          </div>

          {/* Lista/Grid de Clases */}
          {totalClasses === 0 ? (
            <EmptyState onCreateClick={() => setShowCreateModal(true)} />
          ) : (
            <div className={cn(
              "gap-6",
              viewMode === 'grid' 
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3" 
                : "space-y-4"
            )}>
              {classes.map((cls) => (
                <ClassCard
                  key={cls.id}
                  classData={cls}
                  viewMode={viewMode}
                  onCopyCode={() => copyClassCode(cls.classCode, cls.name)}
                  onShowQR={() => handleShowQR(cls)}
                  onShowJoinLink={() => handleShowJoinLink(cls)}
                  onDelete={() => handleDeleteClass(cls.id, cls.name)}
                  getStudentCount={getStudentCount}
                />
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* Modal Crear Clase */}
      <CreateClassModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={() => {
          setShowCreateModal(false)
          refreshClasses()
        }}
      />

      {/* Modal QR */}
      <Modal
        isOpen={showQRModal}
        onClose={() => setShowQRModal(false)}
        title="Código QR de la Clase"
        size="md"
      >
        {selectedClassForQR && (
          <div className="text-center space-y-6">
            <p className="text-gray-400">
              Los estudiantes pueden escanear este código QR para unirse a &quot;{selectedClassForQR.name}&quot;
            </p>
            
            <div className="flex justify-center">
              <div className="bg-white p-4 rounded-lg">
                <div className="text-2xl font-mono">{selectedClassForQR.classCode}</div>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal Enlace de Unión */}
      {selectedClassForLink && (
        <ClassJoinLinkModal
          isOpen={showJoinLinkModal}
          onClose={() => setShowJoinLinkModal(false)}
          classData={selectedClassForLink}
        />
      )}
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
        <p className="text-xs font-medium mt-2 text-solar-400">
          {trend}
        </p>
      )}
    </motion.button>
  )
}

// Componente para las tarjetas de clase
interface ClassCardProps {
  classData: ClassWithDetails
  viewMode: 'grid' | 'list'
  onCopyCode: () => void
  onShowQR: () => void
  onShowJoinLink: () => void
  onDelete: () => void
  getStudentCount: (classData: ClassWithDetails) => number
}

function ClassCard({ classData, viewMode, onCopyCode, onShowQR, onShowJoinLink, onDelete, getStudentCount }: ClassCardProps) {
  const now = new Date()
  const startDate = new Date(classData.startDate)
  const endDate = new Date(classData.endDate)
  
  const isActive = now >= startDate && now <= endDate
  const isUpcoming = now < startDate

  const statusConfig = {
    active: { label: 'Activa', color: 'text-emerald-300', bg: 'bg-emerald-500/20' },
    upcoming: { label: 'Próxima', color: 'text-blue-300', bg: 'bg-blue-500/20' },
    ended: { label: 'Finalizada', color: 'text-gray-300', bg: 'bg-gray-500/20' }
  }

  const status = isActive ? statusConfig.active : 
                isUpcoming ? statusConfig.upcoming : 
                statusConfig.ended

  const enrollmentCount = getStudentCount(classData)

  if (viewMode === 'list') {
    return (
      <motion.div
        whileHover={{ scale: 1.01 }}
        className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 p-6 hover:border-white/30 transition-all duration-200"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className={cn("w-3 h-3 rounded-full", status.bg)}></div>
            <div>
              <h3 className="text-xl font-semibold text-white">{classData.name}</h3>
              <div className="flex items-center space-x-4 text-sm text-gray-400 mt-1">
                <span>{enrollmentCount} estudiantes</span>
                <span>•</span>
                <span>Código: {classData.classCode}</span>
                <span>•</span>
                <span className={status.color}>{status.label}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => window.location.href = `/teacher/classes/${classData.id}`}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              title="Ver clase"
            >
              <EyeIcon className="w-5 h-5 text-gray-400 hover:text-white" />
            </button>
            <button
              onClick={onShowJoinLink}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              title="Enlace de unión"
            >
              <LinkIcon className="w-5 h-5 text-gray-400 hover:text-emerald-400" />
            </button>
            <button
              onClick={onCopyCode}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              title="Copiar código"
            >
              <ClipboardDocumentIcon className="w-5 h-5 text-gray-400 hover:text-white" />
            </button>
            <button
              onClick={onShowQR}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              title="Ver QR"
            >
              <QrCodeIcon className="w-5 h-5 text-gray-400 hover:text-white" />
            </button>
            <button
              onClick={onDelete}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              title="Eliminar"
            >
              <TrashIcon className="w-5 h-5 text-gray-400 hover:text-red-400" />
            </button>
          </div>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.02 }}
      transition={{ duration: 0.2 }}
      className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 overflow-hidden hover:border-white/30 transition-all duration-200"
    >
      {/* Header */}
      <div className="p-6 pb-4">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-white mb-2">{classData.name}</h3>
            <span className={cn(
              "inline-block px-3 py-1 rounded-full text-sm font-medium",
              status.bg,
              status.color
            )}>
              {status.label}
            </span>
          </div>
        </div>

        {/* Stats */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">Estudiantes</span>
            <span className="text-white font-medium">
              {enrollmentCount} / {classData.maxStudents}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">Código</span>
            <span className="text-white font-mono">{classData.classCode}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">Inicio</span>
            <span className="text-white">{new Date(classData.startDate).toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="px-6 pb-6">
        <div className="flex items-center justify-between">
          <button
            onClick={() => window.location.href = `/teacher/classes/${classData.id}`}
            className="flex items-center space-x-2 px-4 py-2 bg-solar-500 hover:bg-solar-600 text-white rounded-lg transition-colors text-sm font-medium"
          >
            <EyeIcon className="w-4 h-4" />
            <span>Ver Clase</span>
          </button>
          
          <div className="flex items-center space-x-1">
            <button
              onClick={onShowJoinLink}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              title="Enlace de unión"
            >
              <LinkIcon className="w-4 h-4 text-gray-400 hover:text-emerald-400" />
            </button>
            <button
              onClick={onCopyCode}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              title="Copiar código"
            >
              <ClipboardDocumentIcon className="w-4 h-4 text-gray-400 hover:text-white" />
            </button>
            <button
              onClick={onShowQR}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              title="Ver QR"
            >
              <QrCodeIcon className="w-4 h-4 text-gray-400 hover:text-white" />
            </button>
            <button
              onClick={onDelete}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              title="Eliminar"
            >
              <TrashIcon className="w-4 h-4 text-gray-400 hover:text-red-400" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// Componente para estado vacío
interface EmptyStateProps {
  onCreateClick: () => void
}

function EmptyState({ onCreateClick }: EmptyStateProps) {
  return (
    <div className="text-center py-16 px-6 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: 'spring' }}
        className="w-32 h-32 mx-auto mb-8 bg-gradient-to-br from-solar-500/20 to-orange-600/20 rounded-full flex items-center justify-center"
      >
        <AcademicCapIcon className="w-16 h-16 text-solar-400" />
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <h3 className="text-3xl font-bold text-white mb-4">
          ¡Comienza tu primera clase!
        </h3>
        <p className="text-gray-300 mb-8 max-w-md mx-auto">
          Crea tu primera clase para comenzar a guiar a los nuevos Guardianes en su entrenamiento.
        </p>
        <motion.button
          onClick={onCreateClick}
          className="inline-flex items-center space-x-2 bg-gradient-to-r from-solar-500 to-orange-600 text-white px-8 py-4 rounded-lg hover:from-solar-600 hover:to-orange-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 font-medium text-lg"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <PlusIcon className="w-6 h-6" />
          <span>Crear Mi Primera Clase</span>
        </motion.button>
      </motion.div>
    </div>
  )
}