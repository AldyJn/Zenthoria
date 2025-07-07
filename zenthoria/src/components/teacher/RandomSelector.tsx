// src/components/teacher/RandomSelector.tsx
'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { StudentCharacterWithDetails, SelectionType, SelectionMethod } from '@/types'
import { cn } from '@/lib/utils/cn'
import { toast } from 'react-hot-toast'

interface RandomSelectorProps {
  students: StudentCharacterWithDetails[]
  classId: string
  onSelection: (selectedStudent: StudentCharacterWithDetails) => void
  className?: string
}

interface SelectionConfig {
  type: SelectionType
  method: SelectionMethod
  filters: {
    excludeRecent: boolean
    minLevel?: number
    maxLevel?: number
    characterType?: string
  }
}

export function RandomSelector({
  students,
  classId,
  onSelection,
  className
}: RandomSelectorProps) {
  const [isSpinning, setIsSpinning] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState<StudentCharacterWithDetails | null>(null)
  const [config, setConfig] = useState<SelectionConfig>({
    type: 'random_student',
    method: 'wheel',
    filters: {
      excludeRecent: true
    }
  })
  const [recentSelections, setRecentSelections] = useState<string[]>([])
  const wheelRef = useRef<HTMLDivElement>(null)

  // Filtrar estudiantes basado en configuración
  const filteredStudents = students.filter(student => {
    if (config.filters.excludeRecent && recentSelections.includes(student.id)) {
      return false
    }
    if (config.filters.minLevel && student.level < config.filters.minLevel) {
      return false
    }
    if (config.filters.maxLevel && student.level > config.filters.maxLevel) {
      return false
    }
    if (config.filters.characterType && student.characterType.name !== config.filters.characterType) {
      return false
    }
    return true
  })

  const performSelection = async () => {
    if (filteredStudents.length === 0) {
      toast.error('No hay estudiantes disponibles con los filtros actuales')
      return
    }

    setIsSpinning(true)
    setSelectedStudent(null)

    try {
      // Simular llamada a API
      const response = await fetch(`/api/classes/${classId}/random-select`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          selectionType: config.type,
          selectionMethod: config.method,
          filters: config.filters
        }),
      })

      if (!response.ok) {
        throw new Error('Error en la selección')
      }

      const result = await response.json()
      const selected = result.data.selectedStudent

      // Animación de ruleta
      await animateSelection(selected)
      
      setSelectedStudent(selected)
      onSelection(selected)
      
      // Agregar a selecciones recientes
      setRecentSelections(prev => [selected.id, ...prev.slice(0, 4)])
      
      toast.success(`¡${selected.student.user.firstName} ${selected.student.user.lastName} ha sido seleccionado!`)

    } catch (error) {
      console.error('Error en selección:', error)
      toast.error('Error al realizar la selección')
    } finally {
      setIsSpinning(false)
    }
  }

  const animateSelection = async (targetStudent: StudentCharacterWithDetails) => {
    return new Promise<void>((resolve) => {
      let currentIndex = 0
      const duration = 3000 // 3 segundos
      const startTime = Date.now()
      
      const animate = () => {
        const elapsed = Date.now() - startTime
        const progress = Math.min(elapsed / duration, 1)
        
        // Velocidad decreciente
        const speed = Math.max(50, 200 * (1 - progress))
        
        if (progress < 1) {
          currentIndex = (currentIndex + 1) % filteredStudents.length
          setSelectedStudent(filteredStudents[currentIndex])
          setTimeout(animate, speed)
        } else {
          setSelectedStudent(targetStudent)
          resolve()
        }
      }
      
      animate()
    })
  }

  const getCharacterTypeIcon = (typeName: string) => {
    switch (typeName.toLowerCase()) {
      case 'hunter': return '🏹'
      case 'titan': return '🛡️'
      case 'warlock': return '🔮'
      default: return '⭐'
    }
  }

  const getElementColor = (characterType: string) => {
    switch (characterType.toLowerCase()) {
      case 'hunter': return 'from-solar-500 to-orange-500'
      case 'titan': return 'from-arc-500 to-blue-500'
      case 'warlock': return 'from-void-500 to-purple-500'
      default: return 'from-gray-500 to-gray-600'
    }
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="text-center">
        <h3 className="text-2xl font-bold text-white mb-2">
          Selección Aleatoria de Guardianes
        </h3>
        <p className="text-gray-400">
          Usa la ruleta cósmica para elegir estudiantes de forma justa
        </p>
      </div>

      {/* Configuration Panel */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-white/5 rounded-xl border border-white/10">
        {/* Selection Type */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-3">
            Tipo de Selección
          </label>
          <div className="space-y-2">
            {[
              { value: 'random_student', label: 'Estudiante Aleatorio', icon: '👤' },
              { value: 'participation', label: 'Participación', icon: '🙋' },
              { value: 'quiz', label: 'Pregunta', icon: '❓' },
              { value: 'activity', label: 'Actividad', icon: '📝' }
            ].map((option) => (
              <label key={option.value} className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="selectionType"
                  value={option.value}
                  checked={config.type === option.value}
                  onChange={(e) => setConfig(prev => ({ ...prev, type: e.target.value as SelectionType }))}
                  className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600"
                />
                <span className="text-lg">{option.icon}</span>
                <span className="text-white">{option.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Filters */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-3">
            Filtros
          </label>
          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={config.filters.excludeRecent}
                onChange={(e) => setConfig(prev => ({
                  ...prev,
                  filters: { ...prev.filters, excludeRecent: e.target.checked }
                }))}
                className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded"
              />
              <span className="text-white">Excluir selecciones recientes</span>
            </label>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Nivel mínimo</label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={config.filters.minLevel || ''}
                  onChange={(e) => setConfig(prev => ({
                    ...prev,
                    filters: { ...prev.filters, minLevel: e.target.value ? parseInt(e.target.value) : undefined }
                  }))}
                  className="w-full px-2 py-1 text-sm bg-gray-700 border border-gray-600 rounded text-white"
                  placeholder="Cualquiera"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Nivel máximo</label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={config.filters.maxLevel || ''}
                  onChange={(e) => setConfig(prev => ({
                    ...prev,
                    filters: { ...prev.filters, maxLevel: e.target.value ? parseInt(e.target.value) : undefined }
                  }))}
                  className="w-full px-2 py-1 text-sm bg-gray-700 border border-gray-600 rounded text-white"
                  placeholder="Cualquiera"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Wheel Container */}
      <div className="relative">
        {/* Spinning Wheel */}
        <div className="relative mx-auto w-80 h-80 rounded-full border-4 border-white/20 overflow-hidden">
          {/* Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-900" />
          
          {/* Student Segments */}
          <div className="relative w-full h-full">
            {filteredStudents.map((student, index) => {
              const angle = (360 / filteredStudents.length) * index
              const isHighlighted = selectedStudent?.id === student.id
              
              return (
                <motion.div
                  key={student.id}
                  className={cn(
                    'absolute w-full h-full transition-all duration-200',
                    isHighlighted && 'z-10'
                  )}
                  style={{
                    transform: `rotate(${angle}deg)`,
                    transformOrigin: 'center'
                  }}
                  animate={isHighlighted ? { scale: 1.1 } : { scale: 1 }}
                >
                  <div
                    className={cn(
                      'absolute top-0 left-1/2 w-2 h-20 -translate-x-1/2 rounded-b-full transition-all duration-200',
                      isHighlighted 
                        ? `bg-gradient-to-b ${getElementColor(student.characterType.name)} shadow-lg`
                        : 'bg-white/20'
                    )}
                  />
                  
                  {/* Student Avatar */}
                  <div 
                    className="absolute top-8 left-1/2 -translate-x-1/2 w-12 h-12 rounded-full border-2 border-white/30 overflow-hidden bg-gray-700 flex items-center justify-center"
                  >
                    <span className="text-2xl">
                      {getCharacterTypeIcon(student.characterType.name)}
                    </span>
                  </div>
                </motion.div>
              )
            })}
          </div>

          {/* Center Hub */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-gradient-to-br from-white/20 to-white/10 rounded-full border-2 border-white/30 flex items-center justify-center">
            <motion.div
              animate={{ rotate: isSpinning ? 360 : 0 }}
              transition={{ 
                duration: isSpinning ? 0.5 : 0,
                repeat: isSpinning ? Infinity : 0,
                ease: 'linear'
              }}
              className="text-2xl"
            >
              🎯
            </motion.div>
          </div>

          {/* Spinning Overlay */}
          <AnimatePresence>
            {isSpinning && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 animate-pulse"
              />
            )}
          </AnimatePresence>
        </div>

        {/* Pointer */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-b-8 border-l-transparent border-r-transparent border-b-yellow-400 z-20">
          <div className="absolute -top-2 -left-1 w-2 h-2 bg-yellow-400 rounded-full"></div>
        </div>
      </div>

      {/* Controls */}
      <div className="text-center space-y-4">
        <motion.button
          onClick={performSelection}
          disabled={isSpinning || filteredStudents.length === 0}
          className={cn(
            'px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300',
            'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600',
            'text-white shadow-lg hover:shadow-xl',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            isSpinning && 'animate-pulse'
          )}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {isSpinning ? (
            <div className="flex items-center gap-3">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="w-6 h-6 border-2 border-white border-t-transparent rounded-full"
              />
              Seleccionando...
            </div>
          ) : (
            `🎲 Girar Ruleta (${filteredStudents.length} estudiantes)`
          )}
        </motion.button>

        {filteredStudents.length === 0 && (
          <p className="text-yellow-400 text-sm">
            ⚠️ No hay estudiantes disponibles con los filtros actuales
          </p>
        )}
      </div>

      {/* Selection Result */}
      <AnimatePresence>
        {selectedStudent && !isSpinning && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -20 }}
            className="p-6 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-xl border border-green-500/30"
          >
            <div className="text-center space-y-4">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                className="text-6xl"
              >
                🏆
              </motion.div>
              
              <div>
                <h4 className="text-2xl font-bold text-white mb-2">
                  ¡Guardián Seleccionado!
                </h4>
                <div className="flex items-center justify-center gap-4 mb-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gray-600 to-gray-800 flex items-center justify-center text-2xl">
                    {getCharacterTypeIcon(selectedStudent.characterType.name)}
                  </div>
                  <div className="text-left">
                    <p className="text-xl font-semibold text-white">
                      {selectedStudent.student.user.firstName} {selectedStudent.student.user.lastName}
                    </p>
                    <p className="text-gray-400">
                      {selectedStudent.characterName} • Nivel {selectedStudent.level}
                    </p>
                    <p className="text-sm text-gray-500 capitalize">
                      {selectedStudent.characterType.name} • {getCharacterTypeIcon(selectedStudent.characterType.name)}
                    </p>
                  </div>
                </div>
                
                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
                  <div className="text-center p-3 bg-white/5 rounded-lg">
                    <div className="text-lg font-bold text-red-400">
                      {selectedStudent.currentHealth}/{selectedStudent.maxHealth}
                    </div>
                    <div className="text-xs text-gray-400">❤️ Salud</div>
                  </div>
                  <div className="text-center p-3 bg-white/5 rounded-lg">
                    <div className="text-lg font-bold text-yellow-400">
                      {selectedStudent.currentLight}/{selectedStudent.maxLight}
                    </div>
                    <div className="text-xs text-gray-400">✨ Luz</div>
                  </div>
                  <div className="text-center p-3 bg-white/5 rounded-lg">
                    <div className="text-lg font-bold text-blue-400">
                      {selectedStudent.experiencePoints}
                    </div>
                    <div className="text-xs text-gray-400">⭐ XP</div>
                  </div>
                </div>
              </div>

              {/* Award Experience Button */}
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                onClick={() => {
                  // Aquí se puede implementar otorgar experiencia
                  toast.success('¡Experiencia otorgada!')
                }}
                className="px-6 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white rounded-lg font-medium transition-all duration-300 hover:shadow-lg"
              >
                🌟 Otorgar +50 XP
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Recent Selections */}
      {recentSelections.length > 0 && (
        <div className="p-4 bg-white/5 rounded-xl border border-white/10">
          <h4 className="text-lg font-semibold text-white mb-3">
            📊 Selecciones Recientes
          </h4>
          <div className="flex flex-wrap gap-2">
            {recentSelections.slice(0, 5).map((studentId, index) => {
              const student = students.find(s => s.id === studentId)
              if (!student) return null
              
              return (
                <div
                  key={studentId}
                  className={cn(
                    'px-3 py-1 rounded-full text-sm border',
                    index === 0 
                      ? 'bg-green-500/20 border-green-500/40 text-green-300'
                      : 'bg-white/10 border-white/20 text-gray-300'
                  )}
                >
                  {student.student.user.firstName} {student.student.user.lastName.charAt(0)}.
                  {index === 0 && ' (Último)'}
                </div>
              )
            })}
          </div>
          
          {recentSelections.length > 0 && (
            <button
              onClick={() => setRecentSelections([])}
              className="mt-2 text-xs text-gray-400 hover:text-white transition-colors"
            >
              🗑️ Limpiar historial
            </button>
          )}
        </div>
      )}

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-white/5 rounded-xl border border-white/10 text-center">
          <div className="text-2xl font-bold text-blue-400">{students.length}</div>
          <div className="text-sm text-gray-400">Total Estudiantes</div>
        </div>
        <div className="p-4 bg-white/5 rounded-xl border border-white/10 text-center">
          <div className="text-2xl font-bold text-green-400">{filteredStudents.length}</div>
          <div className="text-sm text-gray-400">Disponibles</div>
        </div>
        <div className="p-4 bg-white/5 rounded-xl border border-white/10 text-center">
          <div className="text-2xl font-bold text-purple-400">{recentSelections.length}</div>
          <div className="text-sm text-gray-400">Recientes</div>
        </div>
      </div>
    </div>
  )
}