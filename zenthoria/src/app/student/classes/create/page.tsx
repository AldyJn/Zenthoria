// src/app/student/characters/create/page.tsx
'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { 
  ArrowLeftIcon, 
  ArrowRightIcon,
  CheckIcon,
  SparklesIcon
} from '@heroicons/react/24/outline'
import { CharacterType, ClassWithDetails } from '@/types'
import { useAuth } from '@/hooks/useAuth'
import { toast } from 'react-hot-toast'
import { cn } from '@/lib/utils/cn'

// Componentes
import { CharacterSelector } from '@/components/characters/CharacterSelector'
import { Modal } from '@/components/ui/Modal'

// Esquema de validación
const characterSchema = z.object({
  characterName: z.string()
    .min(2, 'El nombre debe tener al least 2 caracteres')
    .max(30, 'El nombre no puede exceder 30 caracteres')
    .regex(/^[a-zA-ZÀ-ÿ\u00f1\u00d1\s]+$/, 'Solo se permiten letras y espacios'),
  characterTypeId: z.string().min(1, 'Debes seleccionar un tipo de personaje'),
  classId: z.string().min(1, 'Clase requerida'),
  avatarCustomization: z.object({
    primaryColor: z.string().default('#3B82F6'),
    secondaryColor: z.string().default('#1E40AF'),
    pattern: z.string().default('solid'),
    emblem: z.string().default('star')
  }).optional()
})

type CharacterFormData = z.infer<typeof characterSchema>

type Step = 'type' | 'customize' | 'confirm'

export default function CreateCharacterPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, isAuthenticated } = useAuth()
  
  const [currentStep, setCurrentStep] = useState<Step>('type')
  const [characterTypes, setCharacterTypes] = useState<CharacterType[]>([])
  const [selectedClass, setSelectedClass] = useState<ClassWithDetails | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [showPreviewModal, setShowPreviewModal] = useState(false)

  const classId = searchParams.get('classId')

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isValid }
  } = useForm<CharacterFormData>({
    resolver: zodResolver(characterSchema),
    mode: 'onChange',
    defaultValues: {
      classId: classId || '',
      avatarCustomization: {
        primaryColor: '#3B82F6',
        secondaryColor: '#1E40AF',
        pattern: 'solid',
        emblem: 'star'
      }
    }
  })

  const watchedData = watch()
  const selectedTypeId = watchedData.characterTypeId
  const selectedType = characterTypes.find(t => t.id === selectedTypeId)

  const fetchInitialData = useCallback(async () => {
    try {
      setIsLoading(true)

      // Obtener tipos de personajes
      const typesResponse = await fetch('/api/characters/types')
      if (typesResponse.ok) {
        const typesResult = await typesResponse.json()
        setCharacterTypes(typesResult.data || [])
      }

      // Obtener información de la clase si se especificó
      if (classId) {
        const classResponse = await fetch(`/api/classes/${classId}`)
        if (classResponse.ok) {
          const classResult = await classResponse.json()
          setSelectedClass(classResult.data)
        }
      }

    } catch (error) {
      console.error('Error cargando datos:', error)
      toast.error('Error al cargar los datos necesarios')
    } finally {
      setIsLoading(false)
    }
  }, [classId])

  useEffect(() => {
    if (isAuthenticated && user?.role === 'student') {
      fetchInitialData()
    }
  }, [isAuthenticated, user, fetchInitialData])

  const handleNext = () => {
    if (currentStep === 'type' && selectedTypeId) {
      setCurrentStep('customize')
    } else if (currentStep === 'customize') {
      setCurrentStep('confirm')
    }
  }

  const handleBack = () => {
    if (currentStep === 'customize') {
      setCurrentStep('type')
    } else if (currentStep === 'confirm') {
      setCurrentStep('customize')
    } else {
      router.back()
    }
  }

  const onSubmit = async (data: CharacterFormData) => {
    try {
      setIsCreating(true)

      const response = await fetch('/api/characters', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          studentId: user?.studentId,
          classId: data.classId,
          characterTypeId: data.characterTypeId,
          characterName: data.characterName,
          avatarCustomization: data.avatarCustomization
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al crear el personaje')
      }

      const result = await response.json()
      const newCharacter = result.data

      toast.success('¡Tu Guardián ha sido creado exitosamente!')
      
      // Redirigir al perfil del personaje creado
      router.push(`/student/characters/${newCharacter.id}`)

    } catch (error) {
      console.error('Error creando personaje:', error)
      toast.error(error instanceof Error ? error.message : 'Error al crear el personaje')
    } finally {
      setIsCreating(false)
    }
  }

  const getStepProgress = () => {
    switch (currentStep) {
      case 'type': return 33
      case 'customize': return 66
      case 'confirm': return 100
      default: return 0
    }
  }

  const canProceed = () => {
    switch (currentStep) {
      case 'type': return !!selectedTypeId
      case 'customize': return !!watchedData.characterName && watchedData.characterName.length >= 2
      case 'confirm': return isValid
      default: return false
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-800 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-white">Preparando el forge de Guardianes...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-800">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <div className="text-center mb-8">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-bold text-white mb-4"
          >
            🔮 Forge de Guardianes
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-gray-400 text-lg"
          >
            {selectedClass 
              ? `Creando tu Guardián para la clase: ${selectedClass.name}`
              : 'Crea tu Guardián personalizado para comenzar tu aventura'
            }
          </motion.p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-purple-300">
              Paso {currentStep === 'type' ? '1' : currentStep === 'customize' ? '2' : '3'} de 3
            </span>
            <span className="text-sm text-gray-400">
              {Math.round(getStepProgress())}% completado
            </span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${getStepProgress()}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </div>
        </div>

        {/* Step Indicators */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center space-x-8">
            {[
              { step: 'type', label: 'Tipo', icon: '⚔️' },
              { step: 'customize', label: 'Personalizar', icon: '🎨' },
              { step: 'confirm', label: 'Confirmar', icon: '✨' }
            ].map(({ step, label, icon }, index) => (
              <div key={step} className="flex items-center">
                <div className={cn(
                  'w-12 h-12 rounded-full flex items-center justify-center text-xl font-semibold transition-all duration-300',
                  currentStep === step || 
                  (step === 'customize' && ['customize', 'confirm'].includes(currentStep)) ||
                  (step === 'confirm' && currentStep === 'confirm')
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                    : 'bg-gray-700 text-gray-400'
                )}>
                  {currentStep === step ? icon : 
                   (step === 'type' && ['customize', 'confirm'].includes(currentStep)) ||
                   (step === 'customize' && currentStep === 'confirm') ? <CheckIcon className="w-6 h-6" /> : icon}
                </div>
                <span className={cn(
                  'ml-3 text-sm font-medium',
                  currentStep === step ? 'text-white' : 'text-gray-400'
                )}>
                  {label}
                </span>
                {index < 2 && (
                  <div className="w-8 h-1 mx-4 bg-gray-700 rounded-full" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit(onSubmit)}>
          <AnimatePresence mode="wait">
            {currentStep === 'type' && (
              <motion.div
                key="type"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3 }}
              >
                <CharacterSelector
                  characterTypes={characterTypes}
                  selectedTypeId={selectedTypeId}
                  onSelect={(typeId) => setValue('characterTypeId', typeId)}
                />
              </motion.div>
            )}

            {currentStep === 'customize' && selectedType && (
              <motion.div
                key="customize"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3 }}
                className="space-y-8"
              >
                {/* Character Name */}
                <div className="max-w-2xl mx-auto">
                  <div className="p-8 bg-white/10 rounded-2xl border border-white/20">
                    <h3 className="text-2xl font-bold text-white mb-6 text-center">
                      Nomina a tu {selectedType.name}
                    </h3>
                    
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="characterName" className="block text-sm font-medium text-gray-300 mb-2">
                          Nombre del Guardián
                        </label>
                        <input
                          {...register('characterName')}
                          type="text"
                          id="characterName"
                          placeholder="Ingresa un nombre épico..."
                          className={cn(
                            'w-full px-4 py-3 bg-gray-700 border rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-all',
                            errors.characterName
                              ? 'border-red-500 focus:ring-red-500'
                              : 'border-gray-600 focus:ring-purple-500 focus:border-purple-500'
                          )}
                          maxLength={30}
                        />
                        {errors.characterName && (
                          <p className="mt-2 text-sm text-red-400">
                            {errors.characterName.message}
                          </p>
                        )}
                        <p className="mt-2 text-xs text-gray-400">
                          {watchedData.characterName?.length || 0}/30 caracteres
                        </p>
                      </div>

                      <div className="p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
                        <p className="text-blue-300 text-sm">
                          💡 <strong>Consejo:</strong> Elige un nombre que refleje la personalidad y el estilo de tu Guardián. 
                          Puede ser inspirado en mitología, fantasía o algo completamente original.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Customization Options */}
                <div className="max-w-4xl mx-auto">
                  <div className="p-8 bg-white/10 rounded-2xl border border-white/20">
                    <h3 className="text-2xl font-bold text-white mb-6 text-center">
                      Personalización del Guardián
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {/* Color Scheme */}
                      <div>
                        <h4 className="text-lg font-semibold text-white mb-4">🎨 Esquema de Colores</h4>
                        
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm text-gray-300 mb-2">Color Primario</label>
                            <div className="flex items-center gap-3">
                              <input
                                {...register('avatarCustomization.primaryColor')}
                                type="color"
                                className="w-12 h-12 rounded-lg border-2 border-gray-600 cursor-pointer"
                              />
                              <input
                                {...register('avatarCustomization.primaryColor')}
                                type="text"
                                className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm"
                                placeholder="#3B82F6"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm text-gray-300 mb-2">Color Secundario</label>
                            <div className="flex items-center gap-3">
                              <input
                                {...register('avatarCustomization.secondaryColor')}
                                type="color"
                                className="w-12 h-12 rounded-lg border-2 border-gray-600 cursor-pointer"
                              />
                              <input
                                {...register('avatarCustomization.secondaryColor')}
                                type="text"
                                className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm"
                                placeholder="#1E40AF"
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Pattern and Emblem */}
                      <div>
                        <h4 className="text-lg font-semibold text-white mb-4">✨ Detalles Visuales</h4>
                        
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm text-gray-300 mb-2">Patrón</label>
                            <select
                              {...register('avatarCustomization.pattern')}
                              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                            >
                              <option value="solid">Sólido</option>
                              <option value="stripes">Rayas</option>
                              <option value="dots">Puntos</option>
                              <option value="gradient">Degradado</option>
                              <option value="metallic">Metálico</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-sm text-gray-300 mb-2">Emblema</label>
                            <select
                              {...register('avatarCustomization.emblem')}
                              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                            >
                              <option value="star">⭐ Estrella</option>
                              <option value="shield">🛡️ Escudo</option>
                              <option value="sword">⚔️ Espada</option>
                              <option value="flame">🔥 Llama</option>
                              <option value="lightning">⚡ Rayo</option>
                              <option value="moon">🌙 Luna</option>
                              <option value="sun">☀️ Sol</option>
                              <option value="wolf">🐺 Lobo</option>
                              <option value="eagle">🦅 Águila</option>
                              <option value="dragon">🐉 Dragón</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Preview Button */}
                    <div className="mt-6 text-center">
                      <button
                        type="button"
                        onClick={() => setShowPreviewModal(true)}
                        className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl transition-all duration-300"
                      >
                        👁️ Vista Previa del Guardián
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {currentStep === 'confirm' && selectedType && (
              <motion.div
                key="confirm"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3 }}
              >
                <div className="max-w-4xl mx-auto">
                  <div className="p-8 bg-white/10 rounded-2xl border border-white/20">
                    <h3 className="text-3xl font-bold text-white mb-8 text-center">
                      🎯 Confirmación del Guardián
                    </h3>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      {/* Character Summary */}
                      <div className="space-y-6">
                        <div className="p-6 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl border border-purple-500/30">
                          <h4 className="text-xl font-semibold text-white mb-4">Resumen del Guardián</h4>
                          
                          <div className="space-y-3">
                            <div className="flex justify-between">
                              <span className="text-gray-300">Nombre:</span>
                              <span className="text-white font-medium">{watchedData.characterName}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-300">Tipo:</span>
                              <span className="text-white font-medium capitalize">{selectedType.name}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-300">Clase:</span>
                              <span className="text-white font-medium">{selectedClass?.name || 'Sin asignar'}</span>
                            </div>
                          </div>
                        </div>

                        <div className="p-6 bg-white/5 rounded-xl border border-white/10">
                          <h4 className="text-lg font-semibold text-white mb-4">Estadísticas Base</h4>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div className="text-center p-3 bg-red-500/10 rounded-lg border border-red-500/20">
                              <div className="text-xl font-bold text-red-400">{selectedType.baseHealth}</div>
                              <div className="text-sm text-gray-400">❤️ Salud</div>
                            </div>
                            <div className="text-center p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                              <div className="text-xl font-bold text-yellow-400">{selectedType.baseLight}</div>
                              <div className="text-sm text-gray-400">✨ Luz</div>
                            </div>
                          </div>
                        </div>

                        <div className="p-6 bg-white/5 rounded-xl border border-white/10">
                          <h4 className="text-lg font-semibold text-white mb-3">Habilidad Especial</h4>
                          <p className="text-gray-300 text-sm">
                            {selectedType.specialAbility}
                          </p>
                        </div>
                      </div>

                      {/* Visual Preview */}
                      <div className="text-center">
                        <div className="p-8 bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl border border-white/10 mb-6">
                          <h4 className="text-lg font-semibold text-white mb-6">Vista Previa</h4>
                          
                          {/* Character Avatar Preview */}
                          <div 
                            className="w-32 h-40 mx-auto rounded-xl border-2 border-white/20 flex items-center justify-center text-6xl"
                            style={{
                              background: `linear-gradient(135deg, ${watchedData.avatarCustomization?.primaryColor}, ${watchedData.avatarCustomization?.secondaryColor})`
                            }}
                          >
                            {selectedType.name === 'hunter' ? '🏹' : 
                             selectedType.name === 'titan' ? '🛡️' : '🔮'}
                          </div>
                          
                          <div className="mt-4 space-y-2">
                            <p className="text-white font-semibold">{watchedData.characterName}</p>
                            <p className="text-gray-400 text-sm capitalize">{selectedType.name}</p>
                            <div className="flex justify-center gap-2 text-sm">
                              <span className="px-2 py-1 bg-white/10 rounded">
                                {watchedData.avatarCustomization?.pattern}
                              </span>
                              <span className="px-2 py-1 bg-white/10 rounded">
                                {watchedData.avatarCustomization?.emblem}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/20">
                          <p className="text-green-300 text-sm">
                            ✅ <strong>Todo listo!</strong> Tu Guardián está preparado para comenzar la aventura.
                            Una vez creado, podrás equipar poderes, coleccionar accesorios y subir de nivel.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex justify-between items-center mt-8">
            <button
              type="button"
              onClick={handleBack}
              className="flex items-center gap-2 px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-xl transition-all duration-300"
            >
              <ArrowLeftIcon className="w-5 h-5" />
              {currentStep === 'type' ? 'Cancelar' : 'Anterior'}
            </button>

            <div className="text-center">
              <span className="text-gray-400 text-sm">
                {currentStep === 'type' && 'Selecciona el tipo de tu Guardián'}
                {currentStep === 'customize' && 'Personaliza tu Guardián'}
                {currentStep === 'confirm' && 'Revisa y confirma'}
              </span>
            </div>

            {currentStep !== 'confirm' ? (
              <button
                type="button"
                onClick={handleNext}
                disabled={!canProceed()}
                className={cn(
                  'flex items-center gap-2 px-6 py-3 rounded-xl transition-all duration-300',
                  canProceed()
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg hover:shadow-xl'
                    : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                )}
              >
                Siguiente
                <ArrowRightIcon className="w-5 h-5" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={!canProceed() || isCreating}
                className={cn(
                  'flex items-center gap-2 px-8 py-4 rounded-xl transition-all duration-300 font-semibold',
                  canProceed() && !isCreating
                    ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl'
                    : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                )}
              >
                {isCreating ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Creando Guardián...
                  </>
                ) : (
                  <>
                    <SparklesIcon className="w-5 h-5" />
                    Crear Guardián
                  </>
                )}
              </button>
            )}
          </div>
        </form>

        {/* Preview Modal */}
        <Modal
          isOpen={showPreviewModal}
          onClose={() => setShowPreviewModal(false)}
          title="Vista Previa del Guardián"
          size="lg"
        >
          <div className="text-center space-y-6">
            <div 
              className="w-48 h-60 mx-auto rounded-2xl border-2 border-white/20 flex items-center justify-center text-8xl"
              style={{
                background: `linear-gradient(135deg, ${watchedData.avatarCustomization?.primaryColor}, ${watchedData.avatarCustomization?.secondaryColor})`
              }}
            >
              {selectedType && (selectedType.name === 'hunter' ? '🏹' : 
               selectedType.name === 'titan' ? '🛡️' : '🔮')}
            </div>
            
            <div>
              <h3 className="text-2xl font-bold text-white mb-2">
                {watchedData.characterName || 'Tu Guardián'}
              </h3>
              <p className="text-gray-400 capitalize">
                {selectedType?.name} • Nivel 1
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
              <div className="p-3 bg-white/5 rounded-lg">
                <div className="text-sm text-gray-400">Patrón</div>
                <div className="text-white capitalize">{watchedData.avatarCustomization?.pattern}</div>
              </div>
              <div className="p-3 bg-white/5 rounded-lg">
                <div className="text-sm text-gray-400">Emblema</div>
                <div className="text-white">{watchedData.avatarCustomization?.emblem}</div>
              </div>
            </div>

            <p className="text-gray-400 text-sm">
              Esta es una vista previa básica. Tu Guardián tendrá más detalles visuales una vez creado.
            </p>
          </div>
        </Modal>
      </div>
    </div>
  )
}