// src/components/teacher/CreateClassModal.tsx
'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  XMarkIcon, 
  AcademicCapIcon,
  CalendarDaysIcon,
  UserGroupIcon,
  QrCodeIcon,
  ClipboardDocumentIcon
} from '@heroicons/react/24/outline'
import { createClassSchema, CreateClassData } from '@/lib/validations/classes'
import { useClasses } from '@/hooks/useClasses'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { QRCodeDisplay } from '@/components/ui/QRCodeDisplay'
import { cn } from '@/lib/utils/cn'

interface CreateClassModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

export function CreateClassModal({ isOpen, onClose, onSuccess }: CreateClassModalProps) {
  const { createClass, isCreating } = useClasses()
  const [step, setStep] = useState<'form' | 'success'>('form')
  const [createdClass, setCreatedClass] = useState<any>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    reset,
    watch
  } = useForm<CreateClassData>({
    resolver: zodResolver(createClassSchema),
    mode: 'onChange',
    defaultValues: {
      maxStudents: 30
    }
  })

  const watchedData = watch()

  const onSubmit = async (data: CreateClassData) => {
    try {
      const newClass = await createClass(data)
      
      if (newClass) {
        setCreatedClass(newClass)
        setStep('success')
      }
    } catch (error) {
      console.error('Error al crear clase:', error)
    }
  }

  const handleClose = () => {
    setStep('form')
    setCreatedClass(null)
    reset()
    onClose()
  }

  const handleSuccess = () => {
    handleClose()
    onSuccess?.()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
            onClick={handleClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl border border-white/20 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
              
              {step === 'form' ? (
                <FormStep
                  onSubmit={handleSubmit(onSubmit)}
                  register={register}
                  errors={errors}
                  isValid={isValid}
                  isCreating={isCreating}
                  watchedData={watchedData}
                  onClose={handleClose}
                />
              ) : (
                <SuccessStep
                  classData={createdClass}
                  onClose={handleSuccess}
                />
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

// Paso 1: Formulario
interface FormStepProps {
  onSubmit: () => void
  register: any
  errors: any
  isValid: boolean
  isCreating: boolean
  watchedData: CreateClassData
  onClose: () => void
}

function FormStep({ onSubmit, register, errors, isValid, isCreating, watchedData, onClose }: FormStepProps) {
  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-white/20">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-solar-500 to-orange-600 rounded-lg flex items-center justify-center">
            <AcademicCapIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Crear Nueva Clase</h2>
            <p className="text-gray-400">Configura los detalles de tu nueva clase</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
        >
          <XMarkIcon className="w-6 h-6 text-gray-400" />
        </button>
      </div>

      {/* Content */}
      <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
        <form onSubmit={onSubmit} className="space-y-6">
          {/* Nombre de la clase */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-200 mb-2">
              Nombre de la Clase *
            </label>
            <input
              {...register('name')}
              type="text"
              id="name"
              placeholder="ej. Matemáticas Avanzadas"
              className={cn(
                "w-full px-4 py-3 bg-white/10 border rounded-lg text-white placeholder-gray-400 transition-colors",
                "focus:outline-none focus:ring-2 focus:ring-solar-500 focus:border-transparent",
                errors.name ? "border-red-500" : "border-white/20"
              )}
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-400">{errors.name.message}</p>
            )}
          </div>

          {/* Descripción */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-200 mb-2">
              Descripción
            </label>
            <textarea
              {...register('description')}
              id="description"
              rows={3}
              placeholder="Describe el contenido y objetivos de la clase..."
              className={cn(
                "w-full px-4 py-3 bg-white/10 border rounded-lg text-white placeholder-gray-400 transition-colors resize-none",
                "focus:outline-none focus:ring-2 focus:ring-solar-500 focus:border-transparent",
                errors.description ? "border-red-500" : "border-white/20"
              )}
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-400">{errors.description.message}</p>
            )}
          </div>

          {/* Fechas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-200 mb-2">
                Fecha de Inicio *
              </label>
              <div className="relative">
                <input
                  {...register('startDate')}
                  type="date"
                  id="startDate"
                  className={cn(
                    "w-full px-4 py-3 bg-white/10 border rounded-lg text-white transition-colors",
                    "focus:outline-none focus:ring-2 focus:ring-solar-500 focus:border-transparent",
                    errors.startDate ? "border-red-500" : "border-white/20"
                  )}
                />
                <CalendarDaysIcon className="absolute right-3 top-3 w-5 h-5 text-gray-400 pointer-events-none" />
              </div>
              {errors.startDate && (
                <p className="mt-1 text-sm text-red-400">{errors.startDate.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="endDate" className="block text-sm font-medium text-gray-200 mb-2">
                Fecha de Fin *
              </label>
              <div className="relative">
                <input
                  {...register('endDate')}
                  type="date"
                  id="endDate"
                  className={cn(
                    "w-full px-4 py-3 bg-white/10 border rounded-lg text-white transition-colors",
                    "focus:outline-none focus:ring-2 focus:ring-solar-500 focus:border-transparent",
                    errors.endDate ? "border-red-500" : "border-white/20"
                  )}
                />
                <CalendarDaysIcon className="absolute right-3 top-3 w-5 h-5 text-gray-400 pointer-events-none" />
              </div>
              {errors.endDate && (
                <p className="mt-1 text-sm text-red-400">{errors.endDate.message}</p>
              )}
            </div>
          </div>

          {/* Máximo de estudiantes */}
          <div>
            <label htmlFor="maxStudents" className="block text-sm font-medium text-gray-200 mb-2">
              Máximo de Estudiantes
            </label>
            <div className="relative">
              <input
                {...register('maxStudents', { valueAsNumber: true })}
                type="number"
                id="maxStudents"
                min="1"
                max="100"
                className={cn(
                  "w-full px-4 py-3 bg-white/10 border rounded-lg text-white transition-colors",
                  "focus:outline-none focus:ring-2 focus:ring-solar-500 focus:border-transparent",
                  errors.maxStudents ? "border-red-500" : "border-white/20"
                )}
              />
              <UserGroupIcon className="absolute right-3 top-3 w-5 h-5 text-gray-400 pointer-events-none" />
            </div>
            {errors.maxStudents && (
              <p className="mt-1 text-sm text-red-400">{errors.maxStudents.message}</p>
            )}
            <p className="mt-1 text-sm text-gray-400">
              Número máximo de estudiantes que pueden unirse a la clase
            </p>
          </div>

          {/* Vista previa */}
          {watchedData.name && (
            <div className="bg-white/5 rounded-lg p-4 border border-white/10">
              <h4 className="text-white font-medium mb-2">Vista Previa</h4>
              <div className="space-y-2 text-sm">
                <p className="text-gray-300">
                  <span className="font-medium">Clase:</span> {watchedData.name}
                </p>
                {watchedData.description && (
                  <p className="text-gray-300">
                    <span className="font-medium">Descripción:</span> {watchedData.description}
                  </p>
                )}
                <p className="text-gray-300">
                  <span className="font-medium">Capacidad:</span> {watchedData.maxStudents || 30} estudiantes
                </p>
              </div>
            </div>
          )}
        </form>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-end space-x-3 p-6 border-t border-white/20">
        <button
          type="button"
          onClick={onClose}
          className="px-6 py-2 text-gray-400 hover:text-white transition-colors"
        >
          Cancelar
        </button>
        <button
          onClick={onSubmit}
          disabled={!isValid || isCreating}
          className={cn(
            "flex items-center space-x-2 px-6 py-2 rounded-lg font-medium transition-all duration-200",
            "bg-gradient-to-r from-solar-500 to-orange-600 text-white",
            "hover:from-solar-600 hover:to-orange-700 shadow-lg hover:shadow-xl",
            "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-lg"
          )}
        >
          {isCreating ? (
            <>
              <LoadingSpinner size="sm" variant="solar" />
              <span>Creando...</span>
            </>
          ) : (
            <>
              <AcademicCapIcon className="w-5 h-5" />
              <span>Crear Clase</span>
            </>
          )}
        </button>
      </div>
    </>
  )
}

// Paso 2: Éxito
interface SuccessStepProps {
  classData: any
  onClose: () => void
}

function SuccessStep({ classData, onClose }: SuccessStepProps) {
  const [copied, setCopied] = useState(false)

  const copyClassCode = () => {
    navigator.clipboard.writeText(classData.classCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-white/20">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-green-600 rounded-lg flex items-center justify-center">
            <AcademicCapIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">¡Clase Creada!</h2>
            <p className="text-gray-400">Tu clase está lista para recibir estudiantes</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
        >
          <XMarkIcon className="w-6 h-6 text-gray-400" />
        </button>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="text-center mb-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
            className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-emerald-500 to-green-600 rounded-full flex items-center justify-center"
          >
            <AcademicCapIcon className="w-10 h-10 text-white" />
          </motion.div>
          
          <h3 className="text-xl font-bold text-white mb-2">{classData.name}</h3>
          <p className="text-gray-400">Clase creada exitosamente</p>
        </div>

        {/* Código de clase */}
        <div className="bg-white/10 rounded-xl p-6 border border-white/20 mb-6">
          <div className="text-center mb-4">
            <h4 className="text-white font-semibold mb-2">Código de Clase</h4>
            <div className="text-3xl font-bold text-solar-400 tracking-wider mb-4">
              {classData.classCode}
            </div>
            <button
              onClick={copyClassCode}
              className="flex items-center space-x-2 mx-auto px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
            >
              <ClipboardDocumentIcon className="w-5 h-5" />
              <span className="text-white">{copied ? 'Copiado!' : 'Copiar Código'}</span>
            </button>
          </div>

          {/* QR Code */}
          <div className="text-center">
            <QRCodeDisplay value={classData.classCode} size={150} />
            <p className="text-gray-400 text-sm mt-2">
              Los estudiantes pueden escanear este código QR para unirse
            </p>
          </div>
        </div>

        {/* Información adicional */}
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
          <h4 className="text-blue-300 font-medium mb-2">Próximos Pasos</h4>
          <ul className="text-gray-300 text-sm space-y-1">
            <li>• Comparte el código de clase con tus estudiantes</li>
            <li>• Los estudiantes pueden unirse usando el código o escaneando el QR</li>
            <li>• Una vez unidos, podrán crear sus personajes</li>
            <li>• Usa las herramientas de selección aleatoria para actividades</li>
          </ul>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-end space-x-3 p-6 border-t border-white/20">
        <button
          onClick={onClose}
          className="flex items-center space-x-2 px-6 py-2 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-lg hover:from-emerald-600 hover:to-green-700 transition-all duration-200 shadow-lg hover:shadow-xl"
        >
          <span>Continuar</span>
        </button>
      </div>
    </>
  )
}