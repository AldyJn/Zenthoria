'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { EyeIcon, EyeSlashIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { registerSchema, RegisterFormData } from '@/lib/validations/auth'
import { extractNameFromEmail, validatePasswordStrength } from '@/lib/auth/validation'
import { RoleDetectionBadge, EmailFormatInfo } from './AuthLayout'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/lib/utils/cn'

export function RegisterForm() {
  const { register: registerUser, verifyEmail, isRegistering } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [showEmailInfo, setShowEmailInfo] = useState(false)
  const [emailVerification, setEmailVerification] = useState<{
    isAvailable: boolean
    detectedRole: 'teacher' | 'student' | null
    displayName: string
  } | null>(null)
  const [passwordStrength, setPasswordStrength] = useState<{
    isValid: boolean
    errors: string[]
  }>({ isValid: false, errors: [] })

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isValid }
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: 'onChange',
    defaultValues: {
      acceptTerms: false
    }
  })

  const watchedEmail = watch('email')
  const watchedPassword = watch('password')
  const watchedRole = emailVerification?.detectedRole

  // Verificar email en tiempo real
  useEffect(() => {
    const checkEmail = async () => {
      if (watchedEmail && watchedEmail.includes('@example.com')) {
        const result = await verifyEmail(watchedEmail)
        if (result) {
          setEmailVerification(result)
          
          // Auto-completar nombres si el email es válido
          if (result.isAvailable && result.detectedRole) {
            try {
              const { firstName, lastName } = extractNameFromEmail(watchedEmail, result.detectedRole)
              setValue('firstName', firstName)
              setValue('lastName', lastName)
            } catch (error) {
              console.log('No se pudieron extraer nombres automáticamente')
            }
          }
        } else {
          setEmailVerification(null)
        }
      } else {
        setEmailVerification(null)
      }
    }

    const timeoutId = setTimeout(checkEmail, 500)
    return () => clearTimeout(timeoutId)
  }, [watchedEmail, verifyEmail, setValue])

  // Validar fuerza de contraseña en tiempo real
  useEffect(() => {
    if (watchedPassword) {
      const strength = validatePasswordStrength(watchedPassword)
      setPasswordStrength(strength)
    } else {
      setPasswordStrength({ isValid: false, errors: [] })
    }
  }, [watchedPassword])

  const onSubmit = async (data: RegisterFormData) => {
    const success = await registerUser(data)
    
    if (success) {
      console.log('✅ Registro exitoso, redirigiendo a login...')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Campo Email */}
      <div>
        <div className="flex items-center justify-between">
          <label htmlFor="email" className="block text-sm font-medium text-gray-200">
            Email
          </label>
          <button
            type="button"
            onClick={() => setShowEmailInfo(!showEmailInfo)}
            className="text-xs text-arc-400 hover:text-arc-300 transition-colors"
          >
            {showEmailInfo ? 'Ocultar formatos' : 'Ver formatos válidos'}
          </button>
        </div>
        
        <div className="mt-1">
          <input
            {...register('email')}
            type="email"
            id="email"
            autoComplete="email"
            placeholder="tu.email@example.com"
            className={cn(
              "block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 sm:text-sm transition-colors",
              "bg-white/10 backdrop-blur-sm border-white/20 text-white",
              "focus:ring-arc-500 focus:border-arc-500",
              errors.email && "border-red-500 focus:ring-red-500 focus:border-red-500"
            )}
          />
          
          {/* Información de formatos de email */}
          <AnimatePresence>
            {showEmailInfo && <EmailFormatInfo />}
          </AnimatePresence>

          {/* Estado de verificación del email */}
          <AnimatePresence>
            {emailVerification && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mt-2"
              >
                <RoleDetectionBadge
                  role={emailVerification.detectedRole}
                  displayName={emailVerification.displayName}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Error de email */}
          {errors.email && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-2 text-sm text-red-400"
            >
              {errors.email.message}
            </motion.p>
          )}
        </div>
      </div>

      {/* Campos Nombre y Apellido (lado a lado) */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="firstName" className="block text-sm font-medium text-gray-200">
            Nombre
          </label>
          <input
            {...register('firstName')}
            type="text"
            id="firstName"
            autoComplete="given-name"
            placeholder="Nombre"
            className={cn(
              "mt-1 block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 sm:text-sm transition-colors",
              "bg-white/10 backdrop-blur-sm border-white/20 text-white",
              "focus:ring-arc-500 focus:border-arc-500",
              errors.firstName && "border-red-500 focus:ring-red-500 focus:border-red-500"
            )}
          />
          {errors.firstName && (
            <p className="mt-1 text-xs text-red-400">{errors.firstName.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="lastName" className="block text-sm font-medium text-gray-200">
            Apellido
          </label>
          <input
            {...register('lastName')}
            type="text"
            id="lastName"
            autoComplete="family-name"
            placeholder="Apellido"
            className={cn(
              "mt-1 block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 sm:text-sm transition-colors",
              "bg-white/10 backdrop-blur-sm border-white/20 text-white",
              "focus:ring-arc-500 focus:border-arc-500",
              errors.lastName && "border-red-500 focus:ring-red-500 focus:border-red-500"
            )}
          />
          {errors.lastName && (
            <p className="mt-1 text-xs text-red-400">{errors.lastName.message}</p>
          )}
        </div>
      </div>

      {/* Campos adicionales para profesores */}
      <AnimatePresence>
        {watchedRole === 'teacher' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-4"
          >
            <div>
              <label htmlFor="department" className="block text-sm font-medium text-gray-200">
                Departamento (Opcional)
              </label>
              <input
                {...register('department')}
                type="text"
                id="department"
                placeholder="Ej: Matemáticas, Historia, Ciencias..."
                className={cn(
                  "mt-1 block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 sm:text-sm transition-colors",
                  "bg-white/10 backdrop-blur-sm border-white/20 text-white",
                  "focus:ring-solar-500 focus:border-solar-500"
                )}
              />
            </div>

            <div>
              <label htmlFor="bio" className="block text-sm font-medium text-gray-200">
                Biografía (Opcional)
              </label>
              <textarea
                {...register('bio')}
                id="bio"
                rows={3}
                placeholder="Cuéntanos sobre tu experiencia docente..."
                className={cn(
                  "mt-1 block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 sm:text-sm transition-colors resize-none",
                  "bg-white/10 backdrop-blur-sm border-white/20 text-white",
                  "focus:ring-solar-500 focus:border-solar-500"
                )}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Campo Contraseña */}
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-200">
          Contraseña
        </label>
        <div className="mt-1 relative">
          <input
            {...register('password')}
            type={showPassword ? 'text' : 'password'}
            id="password"
            autoComplete="new-password"
            placeholder="••••••••"
            className={cn(
              "block w-full px-3 py-2 pr-10 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 sm:text-sm transition-colors",
              "bg-white/10 backdrop-blur-sm border-white/20 text-white",
              "focus:ring-arc-500 focus:border-arc-500",
              errors.password && "border-red-500 focus:ring-red-500 focus:border-red-500"
            )}
          />
          
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-200 transition-colors"
          >
            {showPassword ? (
              <EyeSlashIcon className="h-5 w-5" />
            ) : (
              <EyeIcon className="h-5 w-5" />
            )}
          </button>
        </div>

        {/* Indicadores de fuerza de contraseña */}
        {watchedPassword && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-2 space-y-1"
          >
            {passwordStrength.errors.map((error, index) => (
              <div key={index} className="flex items-center gap-2 text-xs">
                {passwordStrength.isValid ? (
                  <CheckIcon className="w-3 h-3 text-green-400" />
                ) : (
                  <XMarkIcon className="w-3 h-3 text-red-400" />
                )}
                <span className={passwordStrength.isValid ? 'text-green-400' : 'text-red-400'}>
                  {error}
                </span>
              </div>
            ))}
          </motion.div>
        )}

        {errors.password && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-2 text-sm text-red-400"
          >
            {errors.password.message}
          </motion.p>
        )}
      </div>

      {/* Campo Confirmar Contraseña */}
      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-200">
          Confirmar Contraseña
        </label>
        <div className="mt-1 relative">
          <input
            {...register('confirmPassword')}
            type={showConfirmPassword ? 'text' : 'password'}
            id="confirmPassword"
            autoComplete="new-password"
            placeholder="••••••••"
            className={cn(
              "block w-full px-3 py-2 pr-10 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 sm:text-sm transition-colors",
              "bg-white/10 backdrop-blur-sm border-white/20 text-white",
              "focus:ring-arc-500 focus:border-arc-500",
              errors.confirmPassword && "border-red-500 focus:ring-red-500 focus:border-red-500"
            )}
          />
          
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-200 transition-colors"
          >
            {showConfirmPassword ? (
              <EyeSlashIcon className="h-5 w-5" />
            ) : (
              <EyeIcon className="h-5 w-5" />
            )}
          </button>
        </div>

        {errors.confirmPassword && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-2 text-sm text-red-400"
          >
            {errors.confirmPassword.message}
          </motion.p>
        )}
        
      </div>

      {/* Checkbox de términos y condiciones */}
      <div>
        <div className="flex items-start">
          <div className="flex items-center h-5">
            <input
              {...register('acceptTerms')}
              id="acceptTerms"
              type="checkbox"
              className="focus:ring-arc-500 h-4 w-4 text-arc-600 border-gray-300 rounded bg-white/10 border-white/20"
            />
          </div>
          <div className="ml-3 text-sm">
            <label htmlFor="acceptTerms" className="text-gray-300">
              Acepto los{' '}
              <Link href="/terms" className="text-arc-400 hover:text-arc-300 transition-colors">
                términos y condiciones
              </Link>
              {' '}y la{' '}
              <Link href="/privacy" className="text-arc-400 hover:text-arc-300 transition-colors">
                política de privacidad
              </Link>
            </label>
          </div>
        </div>
        
        {errors.acceptTerms && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-2 text-sm text-red-400"
          >
            {errors.acceptTerms.message}
          </motion.p>
        )}
      </div>

      {/* Botón de submit */}
      <div>
        <motion.button
          type="submit"
          disabled={!isValid || isRegistering || !emailVerification?.isAvailable}
          className={cn(
            "group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md transition-all duration-200",
            "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-arc-500",
            isValid && !isRegistering && emailVerification?.isAvailable
              ? "text-white bg-gradient-to-r from-arc-500 to-void-500 hover:from-arc-600 hover:to-void-600 shadow-lg hover:shadow-arc-500/25"
              : "text-gray-400 bg-gray-600 cursor-not-allowed"
          )}
          whileHover={isValid && !isRegistering && emailVerification?.isAvailable ? { scale: 1.02 } : {}}
          whileTap={isValid && !isRegistering && emailVerification?.isAvailable ? { scale: 0.98 } : {}}
        >
          {isRegistering ? (
            <div className="flex items-center gap-2">
              <LoadingSpinner size="sm" variant="arc" />
              <span>Creando cuenta...</span>
            </div>
          ) : (
            'Crear Cuenta'
          )}
        </motion.button>
      </div>

      {/* Enlace a login */}
      <div className="text-center">
        <p className="text-sm text-gray-400">
          ¿Ya tienes cuenta?{' '}
          <Link
            href="/auth/login"
            className="font-medium text-arc-400 hover:text-arc-300 transition-colors"
          >
            Inicia sesión aquí
          </Link>
        </p>
      </div>

      {/* Enlaces adicionales */}
      <div className="flex items-center justify-center text-sm">
        <Link
          href="/"
          className="text-gray-400 hover:text-gray-200 transition-colors"
        >
          ← Volver al inicio
        </Link>
      </div>
    </form>
  )
}
