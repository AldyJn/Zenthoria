// src/components/student/JoinClassModal.tsx
'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  XMarkIcon, 
  AcademicCapIcon,
  MagnifyingGlassIcon,
  QrCodeIcon
} from '@heroicons/react/24/outline'
import { joinClassSchema, JoinClassData } from '@/lib/validations/classes'
import { useClasses } from '@/hooks/useClasses'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { toast } from '@/components/ui/Toast'
import { cn } from '@/lib/utils/cn'

interface JoinClassModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

export function JoinClassModal({ isOpen, onClose, onSuccess }: JoinClassModalProps) {
  const { joinClass, isJoining } = useClasses()
  const [step, setStep] = useState<'form' | 'success'>('form')
  const [classInfo, setClassInfo] = useState<any>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    reset,
    watch
  } = useForm<JoinClassData>({
    resolver: zodResolver(joinClassSchema),
    mode: 'onChange'
  })

  const watchedCode = watch('classCode')

  const onSubmit = async (data: JoinClassData) => {
    try {
      const success = await joinClass(data)
      
      if (success) {
        setStep('success')
        setClassInfo({ name: 'Clase Encontrada', code: data.classCode })
      }
    } catch (error) {
      console.error('Error al unirse a clase:', error)
    }
  }

  const handleClose = () => {
    setStep('form')
    setClassInfo(null)
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
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
            onClick={handleClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl border border-white/20 shadow-2xl max-w-md w-full">
              
              {step === 'form' ? (
                <>
                  {/* Header */}
                  <div className="flex items-center justify-between p-6 border-b border-white/20">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-arc-500 to-blue-600 rounded-lg flex items-center justify-center">
                        <AcademicCapIcon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-white">Unirse a Clase</h2>
                        <p className="text-gray-400 text-sm">Ingresa el código proporcionado por tu profesor</p>
                      </div>
                    </div>
                    <button
                      onClick={handleClose}
                      className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    >
                      <XMarkIcon className="w-5 h-5 text-gray-400" />
                    </button>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                      <div>
                        <label htmlFor="classCode" className="block text-sm font-medium text-gray-200 mb-2">
                          Código de Clase *
                        </label>
                        <div className="relative">
                          <input
                            {...register('classCode')}
                            type="text"
                            id="classCode"
                            placeholder="ABC123"
                            className={cn(
                              "w-full px-4 py-3 bg-white/10 border rounded-lg text-white placeholder-gray-400 transition-colors uppercase tracking-wider text-center text-lg font-mono",
                              "focus:outline-none focus:ring-2 focus:ring-arc-500 focus:border-transparent",
                              errors.classCode ? "border-red-500" : "border-white/20"
                            )}
                            maxLength={6}
                          />
                          <MagnifyingGlassIcon className="absolute right-3 top-3 w-5 h-5 text-gray-400 pointer-events-none" />
                        </div>
                        {errors.classCode && (
                          <p className="mt-1 text-sm text-red-400">{errors.classCode.message}</p>
                        )}
                        <p className="mt-2 text-xs text-gray-400">
                          El código tiene 6 caracteres (letras y números)
                        </p>
                      </div>

                      {/* Vista previa del código */}
                      {watchedCode && watchedCode.length === 6 && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="bg-arc-500/10 border border-arc-500/20 rounded-lg p-4"
                        >
                          <h4 className="text-arc-300 font-medium mb-2">Código Ingresado</h4>
                          <p className="text-white font-mono text-lg tracking-wider text-center">
                            {watchedCode.toUpperCase()}
                          </p>
                        </motion.div>
                      )}

                      {/* Opción QR */}
                      <div className="text-center">
                        <div className="relative">
                          <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-white/20" />
                          </div>
                          <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-slate-900 text-gray-400">o</span>
                          </div>
                        </div>
                        
                        <button
                          type="button"
                          onClick={() => toast.info('Función de escaneo QR - Próximamente')}
                          className="mt-4 flex items-center justify-center space-x-2 w-full px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg transition-colors text-white"
                        >
                          <QrCodeIcon className="w-5 h-5" />
                          <span>Escanear Código QR</span>
                        </button>
                      </div>
                    </form>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-end space-x-3 p-6 border-t border-white/20">
                    <button
                      type="button"
                      onClick={handleClose}
                      className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleSubmit(onSubmit)}
                      disabled={!isValid || isJoining}
                      className={cn(
                        "flex items-center space-x-2 px-6 py-2 rounded-lg font-medium transition-all duration-200",
                        "bg-gradient-to-r from-arc-500 to-blue-600 text-white",
                        "hover:from-arc-600 hover:to-blue-700 shadow-lg hover:shadow-xl",
                        "disabled:opacity-50 disabled:cursor-not-allowed"
                      )}
                    >
                      {isJoining ? (
                        <>
                          <LoadingSpinner size="sm" variant="arc" />
                          <span>Uniéndose...</span>
                        </>
                      ) : (
                        <>
                          <AcademicCapIcon className="w-5 h-5" />
                          <span>Unirse</span>
                        </>
                      )}
                    </button>
                  </div>
                </>
              ) : (
                <>
                  {/* Success Step */}
                  <div className="p-6 text-center">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.2, type: 'spring' }}
                      className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-emerald-500 to-green-600 rounded-full flex items-center justify-center"
                    >
                      <AcademicCapIcon className="w-8 h-8 text-white" />
                    </motion.div>
                    
                    <h3 className="text-xl font-bold text-white mb-2">¡Te has unido!</h3>
                    <p className="text-gray-400 mb-6">
                      Ahora puedes crear tu personaje para esta clase
                    </p>
                    
                    <button
                      onClick={handleSuccess}
                      className="px-6 py-2 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-lg hover:from-emerald-600 hover:to-green-700 transition-all duration-200"
                    >
                      Continuar
                    </button>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}