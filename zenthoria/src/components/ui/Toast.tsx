'use client'
import { toast as hotToast, Toaster, ToastOptions } from 'react-hot-toast'
import { motion } from 'framer-motion'
import { 
  CheckCircleIcon, 
  XCircleIcon, 
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'
import { cn } from '@/lib/utils/cn'

// Tipos para los toasts personalizados
export type ToastType = 'success' | 'error' | 'warning' | 'info'

interface CustomToastProps {
  type: ToastType
  title: string
  message?: string
  onDismiss?: () => void
}

// Configuración de iconos y colores para cada tipo
const toastConfig = {
  success: {
    icon: CheckCircleIcon,
    bgColor: 'bg-green-50 dark:bg-green-900/20',
    borderColor: 'border-green-200 dark:border-green-800',
    iconColor: 'text-green-500',
    titleColor: 'text-green-800 dark:text-green-200',
    messageColor: 'text-green-600 dark:text-green-300'
  },
  error: {
    icon: XCircleIcon,
    bgColor: 'bg-red-50 dark:bg-red-900/20',
    borderColor: 'border-red-200 dark:border-red-800',
    iconColor: 'text-red-500',
    titleColor: 'text-red-800 dark:text-red-200',
    messageColor: 'text-red-600 dark:text-red-300'
  },
  warning: {
    icon: ExclamationTriangleIcon,
    bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
    borderColor: 'border-yellow-200 dark:border-yellow-800',
    iconColor: 'text-yellow-500',
    titleColor: 'text-yellow-800 dark:text-yellow-200',
    messageColor: 'text-yellow-600 dark:text-yellow-300'
  },
  info: {
    icon: InformationCircleIcon,
    bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    borderColor: 'border-blue-200 dark:border-blue-800',
    iconColor: 'text-blue-500',
    titleColor: 'text-blue-800 dark:text-blue-200',
    messageColor: 'text-blue-600 dark:text-blue-300'
  }
}

// Componente de toast personalizado
function CustomToast({ type, title, message, onDismiss }: CustomToastProps) {
  const config = toastConfig[type]
  const Icon = config.icon

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: -20 }}
      className={cn(
        'relative flex items-start gap-3 p-4 rounded-lg border shadow-lg max-w-md',
        config.bgColor,
        config.borderColor
      )}
    >
      {/* Icono */}
      <Icon className={cn('w-5 h-5 mt-0.5 flex-shrink-0', config.iconColor)} />
      
      {/* Contenido */}
      <div className="flex-1 min-w-0">
        <h4 className={cn('text-sm font-medium', config.titleColor)}>
          {title}
        </h4>
        {message && (
          <p className={cn('mt-1 text-sm', config.messageColor)}>
            {message}
          </p>
        )}
      </div>

      {/* Botón de cerrar */}
      {onDismiss && (
        <button
          onClick={onDismiss}
          className={cn(
            'flex-shrink-0 rounded-md p-1 hover:bg-black/5 dark:hover:bg-white/5 transition-colors',
            config.iconColor
          )}
        >
          <XMarkIcon className="w-4 h-4" />
        </button>
      )}
    </motion.div>
  )
}

// Funciones helper para mostrar toasts - DECLARACIÓN ÚNICA
export const toast = {
  success: (title: string, message?: string, options?: ToastOptions) => {
    return hotToast.custom(
      (t) => (
        <CustomToast
          type="success"
          title={title}
          message={message}
          onDismiss={() => hotToast.dismiss(t.id)}
        />
      ),
      {
        duration: 4000,
        ...options
      }
    )
  },

  error: (title: string, message?: string, options?: ToastOptions) => {
    return hotToast.custom(
      (t) => (
        <CustomToast
          type="error"
          title={title}
          message={message}
          onDismiss={() => hotToast.dismiss(t.id)}
        />
      ),
      {
        duration: 6000,
        ...options
      }
    )
  },

  warning: (title: string, message?: string, options?: ToastOptions) => {
    return hotToast.custom(
      (t) => (
        <CustomToast
          type="warning"
          title={title}
          message={message}
          onDismiss={() => hotToast.dismiss(t.id)}
        />
      ),
      {
        duration: 5000,
        ...options
      }
    )
  },

  info: (title: string, message?: string, options?: ToastOptions) => {
    return hotToast.custom(
      (t) => (
        <CustomToast
          type="info"
          title={title}
          message={message}
          onDismiss={() => hotToast.dismiss(t.id)}
        />
      ),
      {
        duration: 4000,
        ...options
      }
    )
  },

  // Métodos simples compatibles con react-hot-toast
  simple: {
    success: (message: string, options?: ToastOptions) => hotToast.success(message, options),
    error: (message: string, options?: ToastOptions) => hotToast.error(message, options),
    loading: (message: string, options?: ToastOptions) => hotToast.loading(message, options),
    info: (message: string, options?: ToastOptions) => hotToast(message, {
      icon: 'ℹ️',
      duration: 4000,
      ...options
    })
  }
}

// Configuración del Toaster principal
export function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      gutter={12}
      containerStyle={{
        top: 20,
        right: 20
      }}
      toastOptions={{
        duration: 4000,
        style: {
          background: 'transparent',
          boxShadow: 'none',
          padding: 0,
          margin: 0
        }
      }}
    />
  )
}

// Toast especial para autenticación con tema Destiny 2
// ✅ USAR REFERENCIA AL toast YA DECLARADO ARRIBA
export const authToast = {
  loginSuccess: (userName: string) => {
    toast.success(
      '¡Bienvenido Guardián!',
      `Hola ${userName}, tu Light ha sido restaurado.`
    )
  },

  loginError: () => {
    toast.error(
      'Acceso Denegado',
      'Las credenciales proporcionadas no son válidas.'
    )
  },

  registerSuccess: () => {
    toast.success(
      '¡Guardián Registrado!',
      'Tu cuenta ha sido creada exitosamente. Ahora puedes iniciar sesión.'
    )
  },

  registerError: (message?: string) => {
    toast.error(
      'Error en Registro',
      message || 'No se pudo crear la cuenta. Intenta nuevamente.'
    )
  },

  logoutSuccess: () => {
    toast.info(
      'Sesión Cerrada',
      'Has regresado a la órbita. ¡Hasta la próxima, Guardián!'
    )
  },

  sessionExpired: () => {
    toast.warning(
      'Sesión Expirada',
      'Tu Light se ha desvanecido. Inicia sesión nuevamente.'
    )
  },

  emailTaken: () => {
    toast.warning(
      'Email en Uso',
      'Este email ya está registrado. Intenta iniciar sesión.'
    )
  },

  networkError: () => {
    toast.error(
      'Error de Conexión',
      'Problema de red. Verifica tu conexión a internet.'
    )
  }
}