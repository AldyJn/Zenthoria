// src/components/characters/CharacterSelector.tsx
'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CharacterType } from '@prisma/client'
import { cn } from '@/lib/utils/cn'

interface CharacterSelectorProps {
  characterTypes: CharacterType[]
  selectedTypeId: string | null
  onSelect: (typeId: string) => void
  className?: string
}

// Configuración visual para cada tipo de personaje
const typeVisualConfig = {
  'hunter': {
    gradient: 'from-solar-500 via-orange-500 to-red-500',
    glowColor: 'shadow-solar-500/30',
    bgPattern: 'bg-solar-900/20',
    borderColor: 'border-solar-500/40',
    element: 'Solar',
    elementIcon: '🔥',
    specialties: ['Agilidad', 'Precisión', 'Sigilo'],
    description: 'Maestros de la caza, rápidos y letales a distancia.',
    model: (
      <div className="relative w-32 h-40 mx-auto">
        <div className="absolute inset-0 bg-gradient-to-b from-solar-400/20 to-solar-600/40 rounded-lg"></div>
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 w-8 h-8 bg-solar-500 rounded-full shadow-lg"></div>
        <div className="absolute top-12 left-1/2 transform -translate-x-1/2 w-12 h-16 bg-gradient-to-b from-solar-400 to-solar-600 rounded-lg"></div>
        <div className="absolute top-28 left-1/2 transform -translate-x-1/2 w-8 h-12 bg-solar-600 rounded-lg"></div>
        <div className="absolute top-20 right-6 w-6 h-8 bg-orange-500 rounded transform rotate-12"></div>
      </div>
    )
  },
  'titan': {
    gradient: 'from-arc-500 via-blue-500 to-purple-500',
    glowColor: 'shadow-arc-500/30',
    bgPattern: 'bg-arc-900/20',
    borderColor: 'border-arc-500/40',
    element: 'Arc',
    elementIcon: '⚡',
    specialties: ['Resistencia', 'Fuerza', 'Defensa'],
    description: 'Guardianes fortificados, tanques imparables en combate.',
    model: (
      <div className="relative w-32 h-40 mx-auto">
        <div className="absolute inset-0 bg-gradient-to-b from-arc-400/20 to-arc-600/40 rounded-lg"></div>
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 w-10 h-10 bg-arc-500 rounded-full shadow-lg"></div>
        <div className="absolute top-12 left-1/2 transform -translate-x-1/2 w-16 h-18 bg-gradient-to-b from-arc-400 to-arc-600 rounded-lg"></div>
        <div className="absolute top-30 left-1/2 transform -translate-x-1/2 w-12 h-10 bg-arc-600 rounded-lg"></div>
        <div className="absolute top-18 left-4 w-4 h-12 bg-blue-500 rounded"></div>
        <div className="absolute top-18 right-4 w-4 h-12 bg-blue-500 rounded"></div>
      </div>
    )
  },
  'warlock': {
    gradient: 'from-void-500 via-purple-500 to-pink-500',
    glowColor: 'shadow-void-500/30',
    bgPattern: 'bg-void-900/20',
    borderColor: 'border-void-500/40',
    element: 'Void',
    elementIcon: '🌌',
    specialties: ['Intelecto', 'Magia', 'Recuperación'],
    description: 'Maestros de las artes arcanas y energías cósmicas.',
    model: (
      <div className="relative w-32 h-40 mx-auto">
        <div className="absolute inset-0 bg-gradient-to-b from-void-400/20 to-void-600/40 rounded-lg"></div>
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 w-8 h-8 bg-void-500 rounded-full shadow-lg"></div>
        <div className="absolute top-12 left-1/2 transform -translate-x-1/2 w-10 h-16 bg-gradient-to-b from-void-400 to-void-600 rounded-lg"></div>
        <div className="absolute top-28 left-1/2 transform -translate-x-1/2 w-6 h-12 bg-void-600 rounded-lg"></div>
        <div className="absolute top-16 left-6 w-2 h-16 bg-purple-500 rounded transform -rotate-12"></div>
        <div className="absolute top-16 right-6 w-2 h-16 bg-purple-500 rounded transform rotate-12"></div>
      </div>
    )
  }
}

export function CharacterSelector({
  characterTypes,
  selectedTypeId,
  onSelect,
  className
}: CharacterSelectorProps) {
  const [hoveredTypeId, setHoveredTypeId] = useState<string | null>(null)

  const getTypeConfig = (typeName: string) => {
    const normalizedName = typeName.toLowerCase()
    return typeVisualConfig[normalizedName as keyof typeof typeVisualConfig] || typeVisualConfig.hunter
  }

  return (
    <div className={cn('space-y-8', className)}>
      {/* Header */}
      <div className="text-center space-y-4">
        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold text-white"
        >
          Elige tu clase de Guardián
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-gray-400 text-lg max-w-2xl mx-auto"
        >
          Cada clase tiene habilidades únicas y estilos de juego diferentes. Elige sabiamente, Guardián.
        </motion.p>
      </div>

      {/* Character Type Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {characterTypes.map((type, index) => {
          const config = getTypeConfig(type.name)
          const isSelected = selectedTypeId === type.id
          const isHovered = hoveredTypeId === type.id

          return (
            <motion.div
              key={type.id}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.2 }}
              className="relative"
            >
              <motion.div
                className={cn(
                  'relative p-6 rounded-2xl border-2 cursor-pointer transition-all duration-300 overflow-hidden',
                  config.bgPattern,
                  isSelected 
                    ? `${config.borderColor} ${config.glowColor} shadow-2xl scale-105`
                    : 'border-white/10 hover:border-white/30',
                  'group'
                )}
                onClick={() => onSelect(type.id)}
                onHoverStart={() => setHoveredTypeId(type.id)}
                onHoverEnd={() => setHoveredTypeId(null)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {/* Background Gradient Effect */}
                <div className={cn(
                  'absolute inset-0 bg-gradient-to-br opacity-0 transition-opacity duration-300',
                  config.gradient,
                  isSelected || isHovered ? 'opacity-10' : ''
                )} />

                {/* Element Badge */}
                <div className="absolute top-4 right-4 flex items-center gap-2 px-3 py-1 bg-black/50 rounded-full">
                  <span className="text-lg">{config.elementIcon}</span>
                  <span className="text-sm font-medium text-white">{config.element}</span>
                </div>

                {/* Character Model */}
                <div className="relative mb-6">
                  <motion.div
                    animate={isSelected || isHovered ? { scale: 1.1 } : { scale: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    {config.model}
                  </motion.div>
                  
                  {/* Glow Effect */}
                  <AnimatePresence>
                    {(isSelected || isHovered) && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className={cn(
                          'absolute inset-0 rounded-lg blur-xl -z-10',
                          `bg-gradient-to-br ${config.gradient}`,
                          'opacity-30'
                        )}
                      />
                    )}
                  </AnimatePresence>
                </div>

                {/* Character Info */}
                <div className="space-y-4 text-center">
                  <h3 className="text-2xl font-bold text-white capitalize">
                    {type.name}
                  </h3>
                  
                  <p className="text-gray-400 text-sm">
                    {config.description}
                  </p>

                  {/* Stats Preview */}
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="text-center p-2 bg-white/5 rounded-lg">
                      <div className="font-medium text-red-400">❤️ {type.baseHealth}</div>
                      <div className="text-gray-500">Salud</div>
                    </div>
                    <div className="text-center p-2 bg-white/5 rounded-lg">
                      <div className="font-medium text-yellow-400">✨ {type.baseLight}</div>
                      <div className="text-gray-500">Luz</div>
                    </div>
                    <div className="text-center p-2 bg-white/5 rounded-lg">
                      <div className="font-medium text-purple-400">⚡ {type.specialAbility.slice(0, 3)}</div>
                      <div className="text-gray-500">Especial</div>
                    </div>
                  </div>

                  {/* Specialties */}
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-gray-300">Especialidades:</p>
                    <div className="flex flex-wrap gap-1 justify-center">
                      {config.specialties.map((specialty) => (
                        <span
                          key={specialty}
                          className="px-2 py-1 text-xs bg-white/10 rounded-full text-gray-300"
                        >
                          {specialty}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Selection Indicator */}
                <AnimatePresence>
                  {isSelected && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0 }}
                      className="absolute top-4 left-4 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center"
                    >
                      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Hover Effect Border */}
                <motion.div
                  className={cn(
                    'absolute inset-0 rounded-2xl border-2 opacity-0 transition-opacity duration-300',
                    `border-gradient-to-r ${config.gradient}`
                  )}
                  animate={{ opacity: isHovered ? 1 : 0 }}
                />
              </motion.div>
            </motion.div>
          )
        })}
      </div>

      {/* Detailed Comparison */}
      <AnimatePresence>
        {selectedTypeId && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-8 p-6 bg-white/5 rounded-xl border border-white/10"
          >
            <h4 className="text-lg font-semibold text-white mb-4 text-center">
              Comparación de Estadísticas Base
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {characterTypes.map((type) => {
                const config = getTypeConfig(type.name)
                const isSelected = selectedTypeId === type.id
                
                return (
                  <div
                    key={type.id}
                    className={cn(
                      'p-4 rounded-lg border transition-all duration-300',
                      isSelected 
                        ? `${config.borderColor} ${config.bgPattern}` 
                        : 'border-white/10 bg-white/5'
                    )}
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-lg">{config.elementIcon}</span>
                      <h5 className="font-medium text-white capitalize">{type.name}</h5>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Salud Base:</span>
                        <span className="text-red-400 font-medium">{type.baseHealth}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Luz Base:</span>
                        <span className="text-yellow-400 font-medium">{type.baseLight}</span>
                      </div>
                      <div className="mt-3">
                        <span className="text-gray-400 text-xs">Habilidad Especial:</span>
                        <p className="text-white text-xs mt-1">{type.specialAbility}</p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}