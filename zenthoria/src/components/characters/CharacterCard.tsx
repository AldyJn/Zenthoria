'use client'

import { motion } from 'framer-motion'
import { 
  EyeIcon,
  HeartIcon,
  BoltIcon,
  SparklesIcon,
  TrophyIcon
} from '@heroicons/react/24/outline'
import { StudentCharacterWithDetails } from '@/types'
import { cn } from '@/lib/utils/cn'

interface CharacterCardProps {
  character: StudentCharacterWithDetails
}

export function CharacterCard({ character }: CharacterCardProps) {
  const healthPercentage = (character.currentHealth / character.maxHealth) * 100
  const lightPercentage = (character.currentLight / character.maxLight) * 100
  
  // Calcular experiencia para el siguiente nivel
  const expForNextLevel = (character.level + 1) * 100
  const expProgress = (character.experiencePoints / expForNextLevel) * 100

  const getTypeColor = (typeName: string) => {
    switch (typeName.toLowerCase()) {
      case 'hunter':
        return 'from-emerald-500 to-green-600'
      case 'titan':
        return 'from-orange-500 to-red-600'
      case 'warlock':
        return 'from-purple-500 to-violet-600'
      default:
        return 'from-gray-500 to-gray-600'
    }
  }

  const handleViewCharacter = () => {
    window.location.href = `/student/characters/${character.id}`
  }

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.02 }}
      transition={{ duration: 0.2 }}
      className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 overflow-hidden hover:border-white/30 transition-all duration-200"
    >
      {/* Header */}
      <div className="p-6">
        <div className="flex items-center space-x-4 mb-4">
          <div className={cn(
            "w-16 h-16 rounded-full flex items-center justify-center bg-gradient-to-br",
            getTypeColor(character.characterType.name)
          )}>
            <span className="text-white text-2xl font-bold">
              {character.characterName.charAt(0).toUpperCase()}
            </span>
          </div>
          
          <div className="flex-1">
            <h3 className="text-xl font-bold text-white">{character.characterName}</h3>
            <p className="text-gray-400">{character.characterType.name}</p>
            <p className="text-gray-500 text-sm">{character.class.name}</p>
          </div>
          
          <div className="text-right">
            <div className="flex items-center space-x-1 mb-1">
              <TrophyIcon className="w-4 h-4 text-yellow-400" />
              <span className="text-2xl font-bold text-white">{character.level}</span>
            </div>
            <p className="text-gray-400 text-xs">Nivel</p>
          </div>
        </div>

        {/* Barras de Estado */}
        <div className="space-y-3 mb-4">
          {/* Salud */}
          <div>
            <div className="flex items-center justify-between text-sm mb-1">
              <div className="flex items-center space-x-2">
                <HeartIcon className="w-4 h-4 text-red-400" />
                <span className="text-gray-300">Salud</span>
              </div>
              <span className="text-white">
                {character.currentHealth}/{character.maxHealth}
              </span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-2">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${healthPercentage}%` }}
                transition={{ duration: 0.8 }}
                className="h-2 rounded-full bg-gradient-to-r from-red-500 to-red-600"
              />
            </div>
          </div>

          {/* Light */}
          <div>
            <div className="flex items-center justify-between text-sm mb-1">
              <div className="flex items-center space-x-2">
                <BoltIcon className="w-4 h-4 text-blue-400" />
                <span className="text-gray-300">Light</span>
              </div>
              <span className="text-white">
                {character.currentLight}/{character.maxLight}
              </span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-2">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${lightPercentage}%` }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-cyan-600"
              />
            </div>
          </div>

          {/* Experiencia */}
          <div>
            <div className="flex items-center justify-between text-sm mb-1">
              <div className="flex items-center space-x-2">
                <SparklesIcon className="w-4 h-4 text-yellow-400" />
                <span className="text-gray-300">Experiencia</span>
              </div>
              <span className="text-white">
                {character.experiencePoints}/{expForNextLevel}
              </span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-2">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(expProgress, 100)}%` }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="h-2 rounded-full bg-gradient-to-r from-yellow-500 to-orange-600"
              />
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-white">{character.discipline}</p>
            <p className="text-gray-400 text-xs">Disciplina</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-white">{character.intellect}</p>
            <p className="text-gray-400 text-xs">Intelecto</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-white">{character.strength}</p>
            <p className="text-gray-400 text-xs">Fuerza</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-white">{character.charisma}</p>
            <p className="text-gray-400 text-xs">Carisma</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 py-4 bg-white/5 border-t border-white/10">
        <button
          onClick={handleViewCharacter}
          className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-gradient-to-r from-void-500 to-purple-600 text-white rounded-lg hover:from-void-600 hover:to-purple-700 transition-all duration-200"
        >
          <EyeIcon className="w-4 h-4" />
          <span>Ver Personaje</span>
        </button>
      </div>
    </motion.div>
  )
}