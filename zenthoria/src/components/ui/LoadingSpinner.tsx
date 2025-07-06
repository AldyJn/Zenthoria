import { motion } from 'framer-motion'
import { cn } from '@/lib/utils/cn'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  variant?: 'solar' | 'arc' | 'void' | 'stasis'
  className?: string
  text?: string
}

const sizeClasses = {
  sm: 'w-4 h-4',
  md: 'w-6 h-6', 
  lg: 'w-8 h-8',
  xl: 'w-12 h-12'
}

const colorClasses = {
  solar: 'text-solar-500',
  arc: 'text-arc-500',
  void: 'text-void-600',
  stasis: 'text-stasis-500'
}

export function LoadingSpinner({ 
  size = 'md', 
  variant = 'arc',
  className,
  text 
}: LoadingSpinnerProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center gap-3', className)}>
      <motion.div
        className={cn(
          'border-2 border-current border-t-transparent rounded-full',
          sizeClasses[size],
          colorClasses[variant]
        )}
        animate={{ rotate: 360 }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: 'linear'
        }}
      />
      
      {text && (
        <motion.p
          className={cn('text-sm font-medium', colorClasses[variant])}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {text}
        </motion.p>
      )}
    </div>
  )
}

// Variante con tres puntos orbitando (más elaborada)
export function DestinySpinner({ 
  size = 'md',
  className 
}: Pick<LoadingSpinnerProps, 'size' | 'className'>) {
  const dotSize = size === 'sm' ? 'w-1 h-1' : 
                 size === 'md' ? 'w-2 h-2' :
                 size === 'lg' ? 'w-3 h-3' : 'w-4 h-4'

  const containerSize = size === 'sm' ? 'w-8 h-8' : 
                       size === 'md' ? 'w-12 h-12' :
                       size === 'lg' ? 'w-16 h-16' : 'w-20 h-20'

  return (
    <div className={cn('relative', containerSize, className)}>
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className={cn(
            'absolute rounded-full',
            dotSize,
            i === 0 && 'bg-solar-500',
            i === 1 && 'bg-arc-500', 
            i === 2 && 'bg-void-500'
          )}
          initial={{ 
            x: '50%', 
            y: '50%',
            rotate: i * 120 
          }}
          animate={{ 
            rotate: i * 120 + 360,
            x: ['50%', '150%', '50%'],
            y: ['50%', '50%', '50%']
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: i * 0.2
          }}
          style={{
            transformOrigin: '0 0'
          }}
        />
      ))}
    </div>
  )
}

// Spinner con efecto de luz pulsante
export function GlowSpinner({ 
  size = 'md',
  variant = 'arc',
  className 
}: Pick<LoadingSpinnerProps, 'size' | 'variant' | 'className'>) {
  return (
    <div className={cn('relative', className)}>
      <motion.div
        className={cn(
          'rounded-full border-2 border-transparent',
          sizeClasses[size],
          variant === 'solar' && 'bg-gradient-to-r from-solar-400 to-solar-600',
          variant === 'arc' && 'bg-gradient-to-r from-arc-400 to-arc-600',
          variant === 'void' && 'bg-gradient-to-r from-void-400 to-void-600',
          variant === 'stasis' && 'bg-gradient-to-r from-stasis-400 to-stasis-600'
        )}
        animate={{ 
          rotate: 360,
          scale: [1, 1.1, 1]
        }}
        transition={{
          rotate: {
            duration: 1.5,
            repeat: Infinity,
            ease: 'linear'
          },
          scale: {
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut'
          }
        }}
      />
      
      <motion.div
        className={cn(
          'absolute inset-0 rounded-full',
          variant === 'solar' && 'shadow-lg shadow-solar-500/50',
          variant === 'arc' && 'shadow-lg shadow-arc-500/50',
          variant === 'void' && 'shadow-lg shadow-void-500/50',
          variant === 'stasis' && 'shadow-lg shadow-stasis-500/50'
        )}
        animate={{
          opacity: [0.5, 1, 0.5]
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
      />
    </div>
  )
}

// Componente principal que agrupa todo
export function ZenthoriaLoading({ 
  size = 'lg',
  variant = 'arc',
  text = 'Cargando...',
  type = 'simple',
  className 
}: LoadingSpinnerProps & { 
  type?: 'simple' | 'destiny' | 'glow' 
}) {
  const LoadingComponent = type === 'destiny' ? DestinySpinner :
                          type === 'glow' ? GlowSpinner :
                          LoadingSpinner

  return (
    <div className={cn('flex flex-col items-center justify-center p-8', className)}>
      <LoadingComponent size={size} variant={variant} />
      {text && (
        <motion.p
          className="mt-4 text-sm font-medium text-gray-600 dark:text-gray-300"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {text}
        </motion.p>
      )}
    </div>
  )
}