'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline'
import { loginSchema, LoginFormData } from '@/lib/validations/auth'
import { getEmailDisplayInfo } from '@/lib/auth/validation'
import { RoleDetectionBadge } from './AuthLayout'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/lib/utils/cn'

export function LoginForm() {
  const { login, isLoggingIn } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [emailInfo, setEmailInfo] = useState<{
    role: 'teacher' | 'student' | null
    displayName: string
    isValid: boolean
  } | null>(null)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isValid }
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: 'onChange'
  })

  const watchedEmail = watch('email')

  // Detectar rol en tiempo real mientras el usuario escribe
  useEffect(() => {
    if (watchedEmail && watchedEmail.includes('@')) {
      const info = getEmailDisplayInfo(watchedEmail)
      setEmailInfo(info)
    } else {
      setEmailInfo(null)
    }
  }, [watchedEmail])

  const onSubmit = async (data: LoginFormData) => {
    const success = await login(data)
    
    if (success) {
      // El redirect se maneja automáticamente en useAuth
      console.log('✅ Login exitoso, redirigiendo...')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Campo Email */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-200">
          Email
        </label>
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
          
          {/* Mostrar información del rol detectado */}
          <AnimatePresence>
            {emailInfo?.isValid && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mt-2"
              >
                <RoleDetectionBadge
                  role={emailInfo.role}
                  displayName={emailInfo.displayName}
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
            autoComplete="current-password"
            placeholder="••••••••"
            className={cn(
              "block w-full px-3 py-2 pr-10 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 sm:text-sm transition-colors",
              "bg-white/10 backdrop-blur-sm border-white/20 text-white",
              "focus:ring-arc-500 focus:border-arc-500",
              errors.password && "border-red-500 focus:ring-red-500 focus:border-red-500"
            )}
          />
          
          {/* Botón mostrar/ocultar contraseña */}
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

        {/* Error de contraseña */}
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

      {/* Botón de submit */}
      <div>
        <motion.button
          type="submit"
          disabled={!isValid || isLoggingIn}
          className={cn(
            "group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md transition-all duration-200",
            "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-arc-500",
            isValid && !isLoggingIn
              ? "text-white bg-gradient-to-r from-arc-500 to-void-500 hover:from-arc-600 hover:to-void-600 shadow-lg hover:shadow-arc-500/25"
              : "text-gray-400 bg-gray-600 cursor-not-allowed"
          )}
          whileHover={isValid && !isLoggingIn ? { scale: 1.02 } : {}}
          whileTap={isValid && !isLoggingIn ? { scale: 0.98 } : {}}
        >
          {isLoggingIn ? (
            <div className="flex items-center gap-2">
              <LoadingSpinner size="sm" variant="arc" />
              <span>Iniciando sesión...</span>
            </div>
          ) : (
            'Iniciar Sesión'
          )}
        </motion.button>
      </div>

      {/* Enlace a registro */}
      <div className="text-center">
        <p className="text-sm text-gray-400">
          ¿No tienes cuenta?{' '}
          <Link
            href="/auth/register"
            className="font-medium text-arc-400 hover:text-arc-300 transition-colors"
          >
            Regístrate aquí
          </Link>
        </p>
      </div>

      {/* Enlaces adicionales */}
      <div className="flex items-center justify-between text-sm">
        <Link
          href="/auth/forgot-password"
          className="text-gray-400 hover:text-gray-200 transition-colors"
        >
          ¿Olvidaste tu contraseña?
        </Link>
        
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