// src/app/teacher/dashboard/page.tsx
'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  PlusIcon, 
  AcademicCapIcon, 
  UserGroupIcon, 
  ChartBarIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  ClipboardDocumentIcon,
  QrCodeIcon,
  CalendarDaysIcon,
  SparklesIcon,
  TrophyIcon,
  ClockIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'
import { useAuth } from '@/hooks/useAuth'
import { useClasses } from '@/hooks/useClasses'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { CreateClassModal } from '@/components/teacher/CreateClassModal'
import { ClassCard } from '@/components/teacher/ClassCard'
import { QRModal } from '@/components/ui/QRCodeDisplay'
import { toast } from '@/components/ui/Toast'
import { cn } from '@/lib/utils/cn'

export default function TeacherDashboard() {
  const { user } = useAuth()
  const { classes, isLoading, refreshClasses, deleteClass } = useClasses()
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedClassForQR, setSelectedClassForQR] = useState<any>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  // Calcular estadísticas avanzadas
  const totalClasses = classes.length
  const totalStudents = classes.reduce((sum, cls) => sum + cls._count.enrollments, 0)
  
  const now = new Date()
  const activeClasses = classes.filter(cls => {
    const startDate = new Date(cls.startDate)
    const endDate = new Date(cls.endDate)
    return startDate <= now && now <= endDate
  })
  
  const upcomingClasses = classes.filter(cls => {
    const startDate = new Date(cls.startDate)
    return startDate > now
  })
  
  const endedClasses = classes.filter(cls => {
    const endDate = new Date(cls.endDate)
    return endDate < now
  })

  // Clases que necesitan atención
  const classesNeedingAttention = classes.filter(cls => {
    const daysUntilStart = Math.ceil((new Date(cls.startDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    const daysUntilEnd = Math.ceil((new Date(cls.endDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    
    return (
      (daysUntilStart <= 7 && daysUntilStart > 0) || // Empiezan en menos de 7 días
      (daysUntilEnd <= 7 && daysUntilEnd > 0) || // Terminan en menos de 7 días
      cls._count.enrollments === 0 // Sin estudiantes
    )
  })

  // Actividad reciente (últimas clases actualizadas)
  const recentActivity = classes
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5)

  // Estadísticas de ocupación
  const averageOccupancy = totalClasses > 0 
    ? Math.round((totalStudents / classes.reduce((sum, cls) => sum + cls.maxStudents, 0)) * 100)
    : 0

  const copyClassCode = async (code: string, className: string) => {
    try {
      await navigator.clipboard.writeText(code)
      toast.success(`Código de "${className}" copiado`)
    } catch (error) {
      toast.error('Error al copiar código')
    }
  }

  const handleDeleteClass = async (classId: string, className: string) => {
    if (!confirm(`¿Estás seguro de que quieres eliminar la clase "${className}"? Esta acción no se puede deshacer.`)) {
      return
    }

    const success = await deleteClass(classId)
    if (success) {
      refreshClasses()
    }
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
            title="Estudiantes Totales"
            value={totalStudents}
            subtitle={`${averageOccupancy}% ocupación`}
            icon={<UserGroupIcon className="w-8 h-8" />}
            color="from-arc-500 to-blue-600"
            bgColor="bg-arc-500/20"
            borderColor="border-arc-500/30"
            trend={totalStudents > 0 ? `Promedio: ${Math.round(totalStudents / totalClasses)} por clase` : undefined}
          />
          
          <StatsCard
            title="Clases Activas"
            value={activeClasses.length}
            subtitle="En progreso ahora"
            icon={<ClockIcon className="w-8 h-8" />}
            color="from-emerald-500 to-green-600"
            bgColor="bg-emerald-500/20"
            borderColor="border-emerald-500/30"
            trend={endedClasses.length > 0 ? `${endedClasses.length} completadas` : undefined}
          />
          
          <StatsCard
            title="Necesitan Atención"
            value={classesNeedingAttention.length}
            subtitle="Revisar pronto"
            icon={<ExclamationTriangleIcon className="w-8 h-8" />}
            color="from-yellow-500 to-orange-600"
            bgColor="bg-yellow-500/20"
            borderColor="border-yellow-500/30"
            isAlert={classesNeedingAttention.length > 0}
          />
        </motion.div>

        {/* Alertas y Notificaciones */}
        {classesNeedingAttention.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-6">
              <div className="flex items-start space-x-4">
                <ExclamationTriangleIcon className="w-6 h-6 text-yellow-400 mt-1 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="text-yellow-300 font-semibold mb-2">
                    Clases que Necesitan Atención ({classesNeedingAttention.length})
                  </h3>
                  <div className="space-y-2">
                    {classesNeedingAttention.slice(0, 3).map(cls => {
                      const daysUntilStart = Math.ceil((new Date(cls.startDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
                      const daysUntilEnd = Math.ceil((new Date(cls.endDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
                      
                      let alertText = ''
                      if (cls._count.enrollments === 0) {
                        alertText = 'Sin estudiantes inscritos'
                      } else if (daysUntilStart <= 7 && daysUntilStart > 0) {
                        alertText = `Comienza en ${daysUntilStart} día${daysUntilStart !== 1 ? 's' : ''}`
                      } else if (daysUntilEnd <= 7 && daysUntilEnd > 0) {
                        alertText = `Termina en ${daysUntilEnd} día${daysUntilEnd !== 1 ? 's' : ''}`
                      }
                      
                      return (
                        <div key={cls.id} className="flex items-center justify-between text-sm">
                          <span className="text-yellow-200">{cls.name}</span>
                          <span className="text-yellow-400">{alertText}</span>
                        </div>
                      )
                    })}
                    {classesNeedingAttention.length > 3 && (
                      <p className="text-yellow-300 text-sm">
                        y {classesNeedingAttention.length - 3} más...
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Acciones Rápidas */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <h2 className="text-2xl font-bold text-white mb-4">Acciones Rápidas</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <QuickActionCard
              title="Crear Nueva Clase"
              description="Configura una nueva clase para tus estudiantes"
              icon={<PlusIcon className="w-6 h-6" />}
              onClick={() => setShowCreateModal(true)}
              color="from-emerald-500 to-green-600"
              badge={totalClasses === 0 ? "¡Comienza aquí!" : undefined}
            />
            
            <QuickActionCard
              title="Ver Todas las Clases"
              description="Gestiona y revisa todas tus clases"
              icon={<EyeIcon className="w-6 h-6" />}
              onClick={() => {
                if (totalClasses === 0) {
                  toast.info('Primero crea una clase')
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
                  toast.info('No hay clases activas para selección')
                  return
                }
                // TODO: Abrir modal de selección aleatoria
                toast.info('Herramienta de selección - Próximamente')
              }}
              color="from-purple-500 to-violet-600"
              disabled={activeClasses.length === 0}
              badge={activeClasses.length > 0 ? `${activeClasses.length} disponibles` : undefined}
            />
            
            <QuickActionCard
              title="Reportes"
              description="Genera reportes de progreso estudiantil"
              icon={<ChartBarIcon className="w-6 h-6" />}
              onClick={() => toast.info('Reportes - Próximamente')}
              color="from-orange-500 to-red-600"
              disabled={totalStudents === 0}
            />
          </div>
        </motion.div>

        {/* Actividad Reciente */}
        {recentActivity.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-8"
          >
            <h2 className="text-2xl font-bold text-white mb-4">Actividad Reciente</h2>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 p-6">
              <div className="space-y-4">
                {recentActivity.map((cls, index) => {
                  const isActive = activeClasses.some(active => active.id === cls.id)
                  const isUpcoming = upcomingClasses.some(upcoming => upcoming.id === cls.id)
                  
                  return (
                    <motion.div 
                      key={cls.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 * index }}
                      className="flex items-center justify-between p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                    >
                      <div className="flex items-center space-x-4">
                        <div className={cn(
                          "w-3 h-3 rounded-full",
                          isActive ? "bg-emerald-500" : 
                          isUpcoming ? "bg-blue-500" : "bg-gray-500"
                        )}></div>
                        <div>
                          <p className="text-white font-medium">{cls.name}</p>
                          <div className="flex items-center space-x-4 text-sm text-gray-400">
                            <span>{cls._count.enrollments} estudiante{cls._count.enrollments !== 1 ? 's' : ''}</span>
                            <span>•</span>
                            <span>Código: {cls.classCode}</span>
                            <span>•</span>
                            <span>
                              {isActive ? 'Activa' : 
                               isUpcoming ? 'Próxima' : 'Finalizada'}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <span className="text-gray-400 text-sm">
                          {new Date(cls.updatedAt).toLocaleDateString()}
                        </span>
                        <div className="flex items-center space-x-1">
                          <button
                            onClick={() => copyClassCode(cls.classCode, cls.name)}
                            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                            title="Copiar código"
                          >
                            <ClipboardDocumentIcon className="w-4 h-4 text-gray-400 hover:text-white" />
                          </button>
                          <button
                            onClick={() => setSelectedClassForQR(cls)}
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
                  Tarjetas
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
              
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center space-x-2 bg-gradient-to-r from-solar-500 to-orange-600 text-white px-4 py-2 rounded-lg hover:from-solar-600 hover:to-orange-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <PlusIcon className="w-5 h-5" />
                <span>Nueva Clase</span>
              </button>
            </div>
          </div>

          {classes.length === 0 ? (
            <EmptyState onCreateClick={() => setShowCreateModal(true)} />
          ) : (
            <div className={cn(
              viewMode === 'grid' 
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                : "space-y-4"
            )}>
              {classes.map((cls, index) => (
                <motion.div
                  key={cls.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                >
                  {viewMode === 'grid' ? (
                    <ClassCard 
                      classData={cls} 
                      onUpdate={refreshClasses}
                      onDelete={() => handleDeleteClass(cls.id, cls.name)}
                      onCopyCode={() => copyClassCode(cls.classCode, cls.name)}
                      onShowQR={() => setSelectedClassForQR(cls)}
                    />
                  ) : (
                    <ClassListItem 
                      classData={cls}
                      onUpdate={refreshClasses}
                      onDelete={() => handleDeleteClass(cls.id, cls.name)}
                      onCopyCode={() => copyClassCode(cls.classCode, cls.name)}
                      onShowQR={() => setSelectedClassForQR(cls)}
                    />
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Modales */}
        <CreateClassModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false)
            refreshClasses()
          }}
        />

        {selectedClassForQR && (
          <QRModal
            isOpen={!!selectedClassForQR}
            onClose={() => setSelectedClassForQR(null)}
            value={`${window.location.origin}/join/${selectedClassForQR.classCode}`}
            title={`Código QR - ${selectedClassForQR.name}`}
            description="Los estudiantes pueden escanear este código para unirse a la clase"
          />
        )}
      </div>
    </div>
  )
}

// Componente para tarjetas de estadísticas mejoradas
interface StatsCardProps {
  title: string
  value: number
  subtitle?: string
  icon: React.ReactNode
  color: string
  bgColor: string
  borderColor: string
  trend?: string
  isAlert?: boolean
}

function StatsCard({ 
  title, 
  value, 
  subtitle, 
  icon, 
  color, 
  bgColor, 
  borderColor, 
  trend,
  isAlert = false 
}: StatsCardProps) {
  return (
    <div className={cn(
      "rounded-xl border backdrop-blur-sm p-6 transition-all duration-200 hover:scale-105",
      bgColor,
      borderColor,
      isAlert && "ring-2 ring-yellow-500/50"
    )}>
      <div className="flex items-center justify-between mb-4">
        <div className={cn("p-3 rounded-lg bg-gradient-to-br", color)}>
          <div className="text-white">
            {icon}
          </div>
        </div>
        {isAlert && (
          <ExclamationTriangleIcon className="w-5 h-5 text-yellow-400" />
        )}
      </div>
      
      <div>
        <p className="text-gray-300 text-sm font-medium">{title}</p>
        <p className="text-3xl font-bold text-white mt-1">{value}</p>
        {subtitle && (
          <p className="text-gray-400 text-sm mt-1">{subtitle}</p>
        )}
        {trend && (
          <p className="text-gray-500 text-xs mt-2">{trend}</p>
        )}
      </div>
    </div>
  )
}

// Componente para acciones rápidas mejorado
interface QuickActionCardProps {
  title: string
  description: string
  icon: React.ReactNode
  onClick: () => void
  color: string
  disabled?: boolean
  badge?: string
}

function QuickActionCard({ 
  title, 
  description, 
  icon, 
  onClick, 
  color, 
  disabled = false,
  badge 
}: QuickActionCardProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "relative text-left p-6 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 transition-all duration-200 group",
        disabled 
          ? "opacity-50 cursor-not-allowed" 
          : "hover:bg-white/15 hover:scale-105"
      )}
    >
      {badge && (
        <span className="absolute -top-2 -right-2 px-2 py-1 bg-solar-500 text-white text-xs rounded-full">
          {badge}
        </span>
      )}
      
      <div className={cn(
        "w-12 h-12 rounded-lg bg-gradient-to-br flex items-center justify-center mb-4 transition-transform duration-200",
        color,
        !disabled && "group-hover:scale-110"
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

// Componente para vista de lista
interface ClassListItemProps {
  classData: any
  onUpdate: () => void
  onDelete: () => void
  onCopyCode: () => void
  onShowQR: () => void
}

function ClassListItem({ classData, onUpdate, onDelete, onCopyCode, onShowQR }: ClassListItemProps) {
  const [showActions, setShowActions] = useState(false)
  
  const now = new Date()
  const startDate = new Date(classData.startDate)
  const endDate = new Date(classData.endDate)
  const isActive = startDate <= now && now <= endDate
  const isUpcoming = startDate > now
  
  return (
    <motion.div
      onHoverStart={() => setShowActions(true)}
      onHoverEnd={() => setShowActions(false)}
      className="flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 hover:border-white/20 transition-all duration-200"
    >
      <div className="flex items-center space-x-4 flex-1">
        <div className={cn(
          "w-12 h-12 rounded-lg flex items-center justify-center bg-gradient-to-br",
          isActive ? "from-emerald-500 to-green-600" :
          isUpcoming ? "from-blue-500 to-cyan-600" :
          "from-gray-500 to-gray-600"
        )}>
          <span className="text-white font-bold text-sm">
            {classData.name.charAt(0).toUpperCase()}
          </span>
        </div>
        
        <div className="flex-1">
          <div className="flex items-center space-x-3">
            <h4 className="text-white font-medium">{classData.name}</h4>
            <span className={cn(
              "px-2 py-1 rounded-full text-xs font-medium",
              isActive ? "bg-emerald-500/20 text-emerald-300" :
              isUpcoming ? "bg-blue-500/20 text-blue-300" :
              "bg-gray-500/20 text-gray-300"
            )}>
              {isActive ? 'Activa' : isUpcoming ? 'Próxima' : 'Finalizada'}
            </span>
          </div>
          <div className="flex items-center space-x-4 text-sm text-gray-400 mt-1">
            <span>{classData._count.enrollments} estudiantes</span>
            <span>•</span>
            <span>Código: {classData.classCode}</span>
            <span>•</span>
            <span>{new Date(classData.startDate).toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: showActions ? 1 : 0, x: showActions ? 0 : 20 }}
        className="flex items-center space-x-2"
      >
        <button
          onClick={() => window.location.href = `/teacher/classes/${classData.id}`}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          title="Ver clase"
        >
          <EyeIcon className="w-4 h-4 text-gray-400 hover:text-white" />
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
      </motion.div>
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
        
        <p className="text-gray-300 mb-8 max-w-lg mx-auto text-lg">
          Crea tu primera clase para empezar a entrenar nuevos Guardianes. 
          Configura el nombre, descripción y fechas para comenzar tu aventura como instructor.
        </p>
        
        <div className="space-y-4">
          <button
            onClick={onCreateClick}
            className="inline-flex items-center space-x-3 bg-gradient-to-r from-solar-500 to-orange-600 text-white px-8 py-4 rounded-lg hover:from-solar-600 hover:to-orange-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 text-lg font-medium"
          >
            <PlusIcon className="w-6 h-6" />
            <span>Crear Mi Primera Clase</span>
          </button>
          
          <div className="text-gray-400 text-sm max-w-md mx-auto">
            <p className="mb-2">📚 Gestiona múltiples clases</p>
            <p className="mb-2">🎮 Sistema de gamificación integrado</p>
            <p>🎯 Herramientas de participación interactiva</p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}