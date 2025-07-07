// src/components/auth/CharacterSelection.tsx
'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CharacterType } from '@/types'
import { cn } from '@/lib/utils/cn'

interface CharacterSelectionProps {
  characterTypes: CharacterType[]
  onSelect: (characterTypeId: string, characterName: string) => void
  onSkip?: () => void
}

export function CharacterSelection({ characterTypes, onSelect, onSkip }: CharacterSelectionProps) {
  const [selectedType, setSelectedType] = useState<string | null>(null)
  const [characterName, setCharacterName] = useState('')
  const [step, setStep] = useState<'select' | 'name'>('select')

  const handleContinue = () => {
    if (step === 'select' && selectedType) {
      setStep('name')
    } else if (step === 'name' && characterName.trim().length >= 2) {
      onSelect(selectedType!, characterName.trim())
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-arc-900 via-slate-900 to-void-800 p-8">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-white mb-4">
            {step === 'select' ? 'Elige tu Clase de Guardián' : 'Nombra a tu Guardián'}
          </h1>
          <p className="text-xl text-gray-300">
            {step === 'select' 
              ? 'Cada clase tiene habilidades únicas. Elige sabiamente.'
              : 'Dale un nombre único a tu personaje.'}
          </p>
        </motion.div>

        <AnimatePresence mode="wait">
          {step === 'select' ? (
            <motion.div
              key="select"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12"
            >
              {characterTypes.map((type) => (
                <CharacterTypeCard
                  key={type.id}
                  characterType={type}
                  isSelected={selectedType === type.id}
                  onSelect={() => setSelectedType(type.id)}
                />
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="name"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="max-w-md mx-auto"
            >
              <div className="bg-white/10 rounded-xl p-8 border border-white/20">
                <div className="mb-6">
                  <label className="block text-white font-medium mb-2">
                    Nombre del Guardián
                  </label>
                  <input
                    type="text"
                    value={characterName}
                    onChange={(e) => setCharacterName(e.target.value)}
                    placeholder="Ej: Shadowblade, Arcanum..."
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-arc-500"
                    maxLength={30}
                  />
                  <p className="text-gray-400 text-sm mt-2">
                    {characterName.length}/30 caracteres
                  </p>
                </div>

                {selectedType && (
                  <div className="bg-white/5 rounded-lg p-4 mb-6">
                    <p className="text-gray-400 text-sm mb-1">Clase seleccionada:</p>
                    <p className="text-white font-semibold">
                      {characterTypes.find(t => t.id === selectedType)?.name}
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex justify-center space-x-4">
          {step === 'name' && (
            <button
              onClick={() => setStep('select')}
              className="px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-white font-medium transition-all duration-200"
            >
              Volver
            </button>
          )}
          
          <button
            onClick={handleContinue}
            disabled={
              (step === 'select' && !selectedType) ||
              (step === 'name' && characterName.trim().length < 2)
            }
            className={cn(
              "px-8 py-3 rounded-lg font-medium transition-all duration-200",
              "bg-gradient-to-r from-arc-500 to-blue-600 hover:from-arc-600 hover:to-blue-700",
              "text-white shadow-lg hover:shadow-xl",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
          >
            {step === 'select' ? 'Continuar' : 'Crear Guardián'}
          </button>

          {onSkip && (
            <button
              onClick={onSkip}
              className="px-6 py-3 text-gray-400 hover:text-white transition-colors duration-200"
            >
              Omitir por ahora
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

interface CharacterTypeCardProps {
  characterType: CharacterType
  isSelected: boolean
  onSelect: () => void
}

function CharacterTypeCard({ characterType, isSelected, onSelect }: CharacterTypeCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onSelect}
      className={cn(
        "relative cursor-pointer rounded-xl p-6 transition-all duration-300",
        "bg-white/10 border-2",
        isSelected 
          ? "border-arc-500 shadow-lg shadow-arc-500/50" 
          : "border-white/20 hover:border-white/40"
      )}
    >
      {characterType.imageUrl && (
        <img 
          src={characterType.imageUrl} 
          alt={characterType.name}
          className="w-32 h-32 mx-auto mb-4 rounded-full"
        />
      )}
      
      <h3 className="text-2xl font-bold text-white mb-2 text-center">
        {characterType.name}
      </h3>
      
      <p className="text-gray-300 text-sm mb-4 text-center">
        {characterType.description}
      </p>
      
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-400">Salud Base:</span>
          <span className="text-white font-medium">{characterType.baseHealth}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Light Base:</span>
          <span className="text-white font-medium">{characterType.baseLight}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Habilidad:</span>
          <span className="text-arc-400 font-medium">{characterType.specialAbility}</span>
        </div>
      </div>

      {isSelected && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -top-2 -right-2 w-8 h-8 bg-arc-500 rounded-full flex items-center justify-center"
        >
          <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </motion.div>
      )}
    </motion.div>
  )
}