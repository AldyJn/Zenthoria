// src/components/ui/EmptyState.tsx
'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils/cn'

interface EmptyStateProps {
  variant: 'no-classes' | 'no-students' | 'no-characters' | 'no-powers' | 'no-accessories' | 'no-selections' | 'no-activities'
  title?: string
  description?: string
  actionButton?: React.ReactNode
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

const variantConfig = {
  'no-classes': {
    icon: (
      <svg className="w-24 h-24 text-gray-400" fill="none" viewBox="0 0 24 24">
        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} 
          d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292M12 6.042A8.967 8.967 0 0118 3.75c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0118 18a8.967 8.967 0 00-6 2.292M12 6.042v11.5" />
      </svg>
    ),
    defaultTitle: 'No hay clases aún',
    defaultDescription: 'Comienza creando tu primera clase para organizar a tus Guardianes.',
    bgGradient: 'from-solar-500/10 to-orange-500/10',
    borderColor: 'border-solar-500/20'
  },
  'no-students': {
    icon: (
      <svg className="w-24 h-24 text-gray-400" fill="none" viewBox="0 0 24 24">
        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} 
          d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
      </svg>
    ),
    defaultTitle: 'La clase está vacía',
    defaultDescription: 'Comparte el código de clase con tus estudiantes para que se unan.',
    bgGradient: 'from-void-500/10 to-purple-500/10',
    borderColor: 'border-void-500/20'
  },
  'no-characters': {
    icon: (
      <svg className="w-24 h-24 text-gray-400" fill="none" viewBox="0 0 24 24">
        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} 
          d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    defaultTitle: 'Aún no tienes un Guardián',
    defaultDescription: 'Crea tu personaje para comenzar tu aventura en esta clase.',
    bgGradient: 'from-arc-500/10 to-blue-500/10',
    borderColor: 'border-arc-500/20'
  },
  'no-powers': {
    icon: (
      <svg className="w-24 h-24 text-gray-400" fill="none" viewBox="0 0 24 24">
        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} 
          d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
      </svg>
    ),
    defaultTitle: 'No hay poderes equipados',
    defaultDescription: 'Explora y equipa poderes para potenciar a tu Guardián.',
    bgGradient: 'from-stasis-500/10 to-cyan-500/10',
    borderColor: 'border-stasis-500/20'
  },
  'no-accessories': {
    icon: (
      <svg className="w-24 h-24 text-gray-400" fill="none" viewBox="0 0 24 24">
        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} 
          d="M21 12a2.25 2.25 0 00-2.25-2.25H15a3 3 0 11-6 0H5.25A2.25 2.25 0 003 12m18 0v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 9m18 0V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v3" />
      </svg>
    ),
    defaultTitle: 'Inventario vacío',
    defaultDescription: 'Colecciona accesorios para personalizar tu Guardián.',
    bgGradient: 'from-solar-500/10 to-yellow-500/10',
    borderColor: 'border-solar-500/20'
  },
  'no-selections': {
    icon: (
      <svg className="w-24 h-24 text-gray-400" fill="none" viewBox="0 0 24 24">
        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} 
          d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
      </svg>
    ),
    defaultTitle: 'Sin selecciones recientes',
    defaultDescription: 'Usa la herramienta de selección aleatoria para elegir estudiantes.',
    bgGradient: 'from-arc-500/10 to-indigo-500/10',
    borderColor: 'border-arc-500/20'
  },
  'no-activities': {
    icon: (
      <svg className="w-24 h-24 text-gray-400" fill="none" viewBox="0 0 24 24">
        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} 
          d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0.621 0 1.125-.504 1.125-1.125V9.375c0-.621.504-1.125 1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
      </svg>
    ),
    defaultTitle: 'Sin actividades registradas',
    defaultDescription: 'Las actividades y participaciones aparecerán aquí.',
    bgGradient: 'from-void-500/10 to-gray-500/10',
    borderColor: 'border-void-500/20'
  }
}

const sizeConfig = {
  sm: {
    container: 'py-8 px-6',
    iconSize: 'w-16 h-16',
    titleSize: 'text-lg',
    descriptionSize: 'text-sm'
  },
  md: {
    container: 'py-12 px-8',
    iconSize: 'w-24 h-24',
    titleSize: 'text-xl',
    descriptionSize: 'text-base'
  },
  lg: {
    container: 'py-16 px-12',
    iconSize: 'w-32 h-32',
    titleSize: 'text-2xl',
    descriptionSize: 'text-lg'
  }
}

export function EmptyState({
  variant,
  title,
  description,
  actionButton,
  className,
  size = 'md'
}: EmptyStateProps) {
  const config = variantConfig[variant]
  const sizeConf = sizeConfig[size]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={cn(
        'flex flex-col items-center justify-center text-center rounded-xl border',
        `bg-gradient-to-br ${config.bgGradient}`,
        config.borderColor,
        sizeConf.container,
        className
      )}
    >
      {/* Animated Icon */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className={cn('mb-6', sizeConf.iconSize)}
      >
        {config.icon}
      </motion.div>

      {/* Title */}
      <motion.h3
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className={cn(
          'font-semibold text-gray-200 mb-2',
          sizeConf.titleSize
        )}
      >
        {title || config.defaultTitle}
      </motion.h3>

      {/* Description */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.5 }}
        className={cn(
          'text-gray-400 mb-6 max-w-md',
          sizeConf.descriptionSize
        )}
      >
        {description || config.defaultDescription}
      </motion.p>

      {/* Action Button */}
      {actionButton && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.5 }}
        >
          {actionButton}
        </motion.div>
      )}
    </motion.div>
  )
}

// Variante especializada para profesores
export function EmptyStateTeacher({ variant, ...props }: Omit<EmptyStateProps, 'variant'> & { variant: 'no-classes' | 'no-students' | 'no-selections' }) {
  return <EmptyState {...props} variant={variant} />
}

// Variante especializada para estudiantes  
export function EmptyStateStudent({ variant, ...props }: Omit<EmptyStateProps, 'variant'> & { variant: 'no-classes' | 'no-characters' | 'no-powers' | 'no-accessories' }) {
  return <EmptyState {...props} variant={variant} />
}