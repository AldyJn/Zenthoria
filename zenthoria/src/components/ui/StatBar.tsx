// src/components/ui/StatBar.tsx
'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils/cn'

interface StatBarProps {
  label: string
  current: number
  max: number
  type?: 'health' | 'light' | 'experience' | 'discipline' | 'intellect' | 'strength' | 'charisma'
  showValues?: boolean
  showPercentage?: boolean
  size?: 'sm' | 'md' | 'lg'
  animated?: boolean
  glowEffect?: boolean
  className?: string
}

const typeConfig = {
  health: {
    bgColor: 'bg-red-900/20',
    fillColor: 'from-red-500 to-red-600',
    glowColor: 'shadow-red-500/30',
    icon: '❤️'
  },
  light: {
    bgColor: 'bg-yellow-900/20', 
    fillColor: 'from-yellow-400 to-yellow-500',
    glowColor: 'shadow-yellow-500/30',
    icon: '✨'
  },
  experience: {
    bgColor: 'bg-blue-900/20',
    fillColor: 'from-blue-400 to-purple-500',
    glowColor: 'shadow-blue-500/30',
    icon: '⭐'
  },
  discipline: {
    bgColor: 'bg-green-900/20',
    fillColor: 'from-green-400 to-green-500',
    glowColor: 'shadow-green-500/30',
    icon: '🛡️'
  },
  intellect: {
    bgColor: 'bg-blue-900/20',
    fillColor: 'from-blue-400 to-cyan-500',
    glowColor: 'shadow-blue-500/30',
    icon: '🧠'
  },
  strength: {
    bgColor: 'bg-orange-900/20',
    fillColor: 'from-orange-400 to-red-500',
    glowColor: 'shadow-orange-500/30',
    icon: '💪'
  },
  charisma: {
    bgColor: 'bg-purple-900/20',
    fillColor: 'from-purple-400 to-pink-500',
    glowColor: 'shadow-purple-500/30',
    icon: '⭐'
  }
}

const sizeConfig = {
  sm: {
    height: 'h-2',
    labelSize: 'text-xs',
    valueSize: 'text-xs'
  },
  md: {
    height: 'h-3',
    labelSize: 'text-sm',
    valueSize: 'text-sm'
  },
  lg: {
    height: 'h-4',
    labelSize: 'text-base',
    valueSize: 'text-base'
  }
}

export function StatBar({
  label,
  current,
  max,
  type = 'experience',
  showValues = true,
  showPercentage = false,
  size = 'md',
  animated = true,
  glowEffect = false,
  className
}: StatBarProps) {
  const [animatedValue, setAnimatedValue] = useState(0)
  const config = typeConfig[type]
  const sizeConf = sizeConfig[size]
  const percentage = Math.min((current / max) * 100, 100)

  useEffect(() => {
    if (animated) {
      const timer = setTimeout(() => {
        setAnimatedValue(percentage)
      }, 100)
      return () => clearTimeout(timer)
    } else {
      setAnimatedValue(percentage)
    }
  }, [percentage, animated])

  return (
    <div className={cn('space-y-2', className)}>
      {/* Label and Values */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm">{config.icon}</span>
          <span className={cn('font-medium text-white', sizeConf.labelSize)}>
            {label}
          </span>
        </div>
        
        {(showValues || showPercentage) && (
          <div className={cn('text-gray-300', sizeConf.valueSize)}>
            {showValues && (
              <span>{current.toLocaleString()} / {max.toLocaleString()}</span>
            )}
            {showValues && showPercentage && <span className="mx-1">•</span>}
            {showPercentage && (
              <span>{Math.round(percentage)}%</span>
            )}
          </div>
        )}
      </div>

      {/* Progress Bar */}
      <div className="relative">
        {/* Background */}
        <div 
          className={cn(
            'w-full rounded-full border border-white/10 overflow-hidden',
            config.bgColor,
            sizeConf.height
          )}
        >
          {/* Fill */}
          <motion.div
            className={cn(
              'h-full rounded-full bg-gradient-to-r relative',
              config.fillColor,
              glowEffect && `shadow-lg ${config.glowColor}`
            )}
            initial={{ width: 0 }}
            animate={{ width: `${animatedValue}%` }}
            transition={{ 
              duration: animated ? 1.5 : 0,
              ease: 'easeOut',
              delay: animated ? 0.2 : 0
            }}
          >
            {/* Shine Effect */}
            {glowEffect && (
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                initial={{ x: '-100%' }}
                animate={{ x: '100%' }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatDelay: 3,
                  ease: 'linear'
                }}
              />
            )}
          </motion.div>
        </div>

        {/* Glow Effect Overlay */}
        {glowEffect && percentage > 0 && (
          <motion.div
            className={cn(
              'absolute inset-0 rounded-full blur-md opacity-30',
              `bg-gradient-to-r ${config.fillColor}`
            )}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.3 }}
            transition={{ duration: 0.5 }}
          />
        )}
      </div>

      {/* Overflow Indicator */}
      {current > max && (
        <div className="flex items-center gap-1 text-yellow-400 text-xs">
          <span>⚡</span>
          <span>+{(current - max).toLocaleString()} adicional</span>
        </div>
      )}
    </div>
  )
}

// Componente especializado para barras de experiencia con level up
interface ExperienceBarProps extends Omit<StatBarProps, 'type'> {
  level: number
  onLevelUp?: (newLevel: number) => void
}

export function ExperienceBar({
  current,
  max,
  level,
  onLevelUp,
  ...props
}: ExperienceBarProps) {
  const [prevLevel, setPrevLevel] = useState(level)

  useEffect(() => {
    if (level > prevLevel && onLevelUp) {
      onLevelUp(level)
    }
    setPrevLevel(level)
  }, [level, prevLevel, onLevelUp])

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-white">
          Nivel {level}
        </span>
        <span className="text-xs text-gray-400">
          Siguiente nivel: {max - current} XP
        </span>
      </div>
      
      <StatBar
        {...props}
        current={current}
        max={max}
        type="experience"
        glowEffect={true}
        animated={true}
      />
    </div>
  )
}