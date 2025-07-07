'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  EyeIcon,
  PencilIcon,
  TrashIcon,
  UserGroupIcon,
  CalendarDaysIcon,
  ClipboardDocumentIcon,
  QrCodeIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline'
import { ClassWithDetails } from '@/types'
import { QRModal } from '@/components/ui/QRCodeDisplay'
import { cn } from '@/lib/utils/cn'

// ✅ INTERFAZ CORREGIDA CON TODAS LAS PROPS
interface ClassCardProps {
  classData: ClassWithDetails
  onUpdate?: () => void
  onDelete?: () => Promise<void>
  onCopyCode?: () => Promise<void>
  onShowQR?: () => void
}

export function ClassCard({ 
  classData, 
  onUpdate,
  onDelete,
  onCopyCode,
  onShowQR 
}: ClassCardProps) {
  const [showQRModal, setShowQRModal] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  // Calcular estado de la clase
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
      borderColor: 'border-blue-500/30',
      textColor: 'text-blue-300'
    },
    active: {
      label: 'Activa',
      color: 'from-emerald-500 to-green-600',
      bgColor: 'bg-emerald-500/20',
      borderColor: 'border-emerald-500/30',
      textColor: 'text-emerald-300'
    },
    ended: {
      label: 'Finalizada',
      color: 'from-gray-500 to-gray-600',
      bgColor: 'bg-gray-500/20',
      borderColor: 'border-gray-500/30',
      textColor: 'text-gray-300'
    }
  }

  const status = statusConfig[classStatus]

  // ✅ HANDLERS QUE USAN LAS PROPS PASADAS
  const handleCopyCode = async () => {
    if (onCopyCode) {
      await onCopyCode()
    }
  }

  const handleDelete = async () => {
    if (!onDelete) return
    
    setIsDeleting(true)
    try {
      await onDelete()
    } finally {
      setIsDeleting(false)
    }
  }

  const handleShowQR = () => {
    if (onShowQR) {
      onShowQR()
    } else {
      // Fallback: mostrar modal interno
      setShowQRModal(true)
    }
  }

  const handleViewClass = () => {
    window.location.href = `/teacher/classes/${classData.id}`
  }

  const handleEditClass = () => {
    // TODO: Implementar modal de edición
    console.log('Editar clase:', classData.id)
  }

  return (
    <>
      <motion.div
        whileHover={{ y: -4, scale: 1.02 }}
        transition={{ duration: 0.2 }}
        className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 overflow-hidden hover:border-white/30 transition-all duration-200"
      >
        {/* Header con estado */}
        <div className="p-6 pb-4">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h3 className="text-xl font-bold text-white mb-2 line-clamp-1">
                {classData.name}
              </h3>
              {classData.description && (
                <p className="text-gray-400 text-sm line-clamp-2 mb-3">
                  {classData.description}
                </p>
              )}
            </div>
            
            {/* Badge de estado */}
            <div className={cn(
              "px-3 py-1 rounded-full text-xs font-medium border",
              status.bgColor,
              status.borderColor,
              status.textColor
            )}>
              {status.label}
            </div>
          </div>

          {/* Código de clase */}
          <div className="flex items-center justify-between mb-4 p-3 bg-white/5 rounded-lg border border-white/10">
            <div>
              <p className="text-gray-400 text-xs mb-1">Código de Clase</p>
              <p className="text-white font-mono text-lg font-bold tracking-wider">
                {classData.classCode}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleCopyCode}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors group"
                title="Copiar código"
              >
                <ClipboardDocumentIcon className="w-4 h-4 text-gray-400 group-hover:text-white" />
              </button>
              <button
                onClick={handleShowQR}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors group"
                title="Ver código QR"
              >
                <QrCodeIcon className="w-4 h-4 text-gray-400 group-hover:text-white" />
              </button>
            </div>
          </div>

          {/* Estadísticas */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="text-center">
              <div className="flex items-center justify-center space-x-2 mb-1">
                <UserGroupIcon className="w-4 h-4 text-gray-400" />
                <span className="text-2xl font-bold text-white">
                  {classData._count.enrollments}
                </span>
              </div>
              <p className="text-gray-400 text-xs">
                Estudiantes
              </p>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center space-x-2 mb-1">
                <ChartBarIcon className="w-4 h-4 text-gray-400" />
                <span className="text-2xl font-bold text-white">
                  {Math.round((classData._count.enrollments / classData.maxStudents) * 100)}%
                </span>
              </div>
              <p className="text-gray-400 text-xs">
                Capacidad
              </p>
            </div>
          </div>

          {/* Barra de progreso de capacidad */}
          <div className="mb-4">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="text-gray-400">Capacidad</span>
              <span className="text-gray-400">
                {classData._count.enrollments}/{classData.maxStudents}
              </span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-2">
              <motion.div
                initial={{ width: 0 }}
                animate={{ 
                  width: `${Math.min((classData._count.enrollments / classData.maxStudents) * 100, 100)}%` 
                }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className={cn(
                  "h-2 rounded-full bg-gradient-to-r",
                  classData._count.enrollments >= classData.maxStudents
                    ? "from-red-500 to-red-600"
                    : classData._count.enrollments / classData.maxStudents > 0.8
                    ? "from-yellow-500 to-orange-600"
                    : "from-emerald-500 to-green-600"
                )}
              />
            </div>
          </div>

          {/* Fechas */}
          <div className="flex items-center justify-between text-sm mb-4">
            <div className="flex items-center space-x-2 text-gray-400">
              <CalendarDaysIcon className="w-4 h-4" />
              <span>{new Date(startDate).toLocaleDateString()}</span>
            </div>
            <div className="text-gray-400">
              hasta {new Date(endDate).toLocaleDateString()}
            </div>
          </div>
        </div>

        {/* Footer con acciones */}
        <div className="px-6 py-4 bg-white/5 border-t border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <button
                onClick={handleViewClass}
                className="flex items-center space-x-2 px-3 py-2 bg-gradient-to-r from-solar-500 to-orange-600 text-white text-sm rounded-lg hover:from-solar-600 hover:to-orange-700 transition-all duration-200"
              >
                <EyeIcon className="w-4 h-4" />
                <span>Ver Clase</span>
              </button>
            </div>

            <div className="flex items-center space-x-1">
              <button
                onClick={handleEditClass}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors group"
                title="Editar clase"
              >
                <PencilIcon className="w-4 h-4 text-gray-400 group-hover:text-blue-400" />
              </button>
              
              {onDelete && (
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors group disabled:opacity-50"
                  title="Eliminar clase"
                >
                  <TrashIcon className="w-4 h-4 text-gray-400 group-hover:text-red-400" />
                </button>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Modal QR - Solo si no se maneja externamente */}
      {!onShowQR && (
        <QRModal
          isOpen={showQRModal}
          onClose={() => setShowQRModal(false)}
          value={`${window.location.origin}/join/${classData.classCode}`}
          title={`Código QR - ${classData.name}`}
          description="Los estudiantes pueden escanear este código para unirse a la clase"
        />
      )}
    </>
  )
}

// ✅ COMPONENTE ClassListItem TAMBIÉN CORREGIDO
interface ClassListItemProps {
  classData: ClassWithDetails
  onUpdate?: () => void
  onDelete?: () => Promise<void>
  onCopyCode?: () => Promise<void>
  onShowQR?: () => void
}

export function ClassListItem({ 
  classData, 
  onUpdate, 
  onDelete, 
  onCopyCode, 
  onShowQR 
}: ClassListItemProps) {
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
        {onCopyCode && (
          <button
            onClick={onCopyCode}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            title="Copiar código"
          >
            <ClipboardDocumentIcon className="w-4 h-4 text-gray-400 hover:text-white" />
          </button>
        )}
        {onShowQR && (
          <button
            onClick={onShowQR}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            title="Ver QR"
          >
            <QrCodeIcon className="w-4 h-4 text-gray-400 hover:text-white" />
          </button>
        )}
        {onDelete && (
          <button
            onClick={onDelete}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            title="Eliminar"
          >
            <TrashIcon className="w-4 h-4 text-gray-400 hover:text-red-400" />
          </button>
        )}
      </motion.div>
    </motion.div>
  )
}
