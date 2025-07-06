import { motion } from 'framer-motion'
import { cn } from '@/lib/utils/cn'
import { ReactNode } from 'react'

interface AuthLayoutProps {
  children: ReactNode
  title: string
  subtitle?: string
  className?: string
}

export function AuthLayout({ children, title, subtitle, className }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-void-900 via-slate-900 to-arc-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* Efectos de fondo con tema Destiny 2 */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* Círculos de luz orbitando */}
        <motion.div
          className="absolute top-1/4 left-1/4 w-32 h-32 bg-solar-500/10 rounded-full blur-xl"
          animate={{
            x: [0, 100, 0],
            y: [0, -50, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        
        <motion.div
          className="absolute top-3/4 right-1/4 w-24 h-24 bg-arc-500/10 rounded-full blur-xl"
          animate={{
            x: [0, -80, 0],
            y: [0, 60, 0],
            scale: [1, 0.8, 1],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
        />

        <motion.div
          className="absolute top-1/2 right-1/3 w-20 h-20 bg-void-500/10 rounded-full blur-xl"
          animate={{
            x: [0, 60, 0],
            y: [0, -80, 0],
            scale: [1, 1.5, 1],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 4
          }}
        />
      </div>

      {/* Contenido principal */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        {/* Logo y título */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          {/* Logo de Zenthoria */}
          <motion.div
            className="mx-auto w-20 h-20 bg-gradient-to-br from-solar-400 to-arc-500 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-arc-500/25"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span className="text-2xl font-bold text-white">Z</span>
          </motion.div>

          <h1 className="text-4xl font-bold text-white mb-2">
            Zenthoria
          </h1>
          
          <motion.h2
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-xl font-semibold text-gray-200 mb-2"
          >
            {title}
          </motion.h2>
          
          {subtitle && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="text-sm text-gray-400"
            >
              {subtitle}
            </motion.p>
          )}
        </motion.div>
      </div>

      {/* Formulario */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.6 }}
        className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10"
      >
        <div className={cn(
          "bg-white/10 backdrop-blur-xl py-8 px-6 shadow-2xl sm:rounded-xl sm:px-10 border border-white/20",
          className
        )}>
          {children}
        </div>
      </motion.div>

      {/* Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.6 }}
        className="mt-8 text-center relative z-10"
      >
        <p className="text-xs text-gray-400">
          Plataforma de educación gamificada inspirada en Destiny 2
        </p>
        <p className="text-xs text-gray-500 mt-1">
          © 2024 Zenthoria. Todos los derechos reservados.
        </p>
      </motion.div>
    </div>
  )
}

// Componente para mostrar información sobre formatos de email
export function EmailFormatInfo() {
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="mt-4 p-4 bg-arc-500/10 border border-arc-500/20 rounded-lg"
    >
      <h4 className="text-sm font-medium text-arc-200 mb-2">
        Formatos de Email Aceptados:
      </h4>
      
      <div className="space-y-2 text-xs">
        <div>
          <span className="text-solar-300 font-medium">Profesores:</span>
          <span className="text-gray-300 ml-2">inicial + apellido@example.com</span>
          <div className="text-gray-400 ml-6">Ejemplo: jperez@example.com</div>
        </div>
        
        <div>
          <span className="text-void-300 font-medium">Estudiantes:</span>
          <span className="text-gray-300 ml-2">nombre.apellido@example.com</span>
          <div className="text-gray-400 ml-6">Ejemplo: pedro.suarez@example.com</div>
        </div>
      </div>
    </motion.div>
  )
}

// Componente para mostrar el rol detectado
interface RoleDetectionBadgeProps {
  role: 'teacher' | 'student' | null
  displayName?: string
  className?: string
}

export function RoleDetectionBadge({ role, displayName, className }: RoleDetectionBadgeProps) {
  if (!role) return null

  const roleConfig = {
    teacher: {
      label: 'Profesor',
      bgColor: 'bg-solar-500/20',
      borderColor: 'border-solar-500/40',
      textColor: 'text-solar-200',
      icon: '👨‍🏫'
    },
    student: {
      label: 'Estudiante', 
      bgColor: 'bg-void-500/20',
      borderColor: 'border-void-500/40',
      textColor: 'text-void-200',
      icon: '👨‍🎓'
    }
  }

  const config = roleConfig[role]

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        'flex items-center gap-2 px-3 py-2 rounded-lg border text-sm',
        config.bgColor,
        config.borderColor,
        className
      )}
    >
      <span>{config.icon}</span>
      <div>
        <span className={cn('font-medium', config.textColor)}>
          {config.label}
        </span>
        {displayName && (
          <span className="text-gray-300 ml-1">
            - {displayName}
          </span>
        )}
      </div>
    </motion.div>
  )
}