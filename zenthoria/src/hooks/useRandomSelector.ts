// src/hooks/useRandomSelector.ts
import { useState, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from '@/components/ui/Toast'
import { SelectionType, SelectionMethod } from '@prisma/client'
import { ApiResponse } from '@/types'

interface RandomSelection {
  id: string
  student: {
    name: string
    character: {
      name: string
      type: string
    }
  }
  selectionType: SelectionType
  selectionMethod: SelectionMethod
  rewards: {
    experience: number
    light: number
  }
  selectedAt: string
  resolvedAt?: string
}

interface SelectionRequest {
  selectionType?: SelectionType
  selectionMethod?: SelectionMethod
  experienceReward?: number
  lightReward?: number
}

interface SelectionResult {
  selection: {
    id: string
    student: {
      id: string
      name: string
      character: {
        id: string
        name: string
        type: string
        level: number
      }
    }
    rewards: {
      experience: number
      light: number
    }
    method: SelectionMethod
    timestamp: string
  }
  classInfo: {
    totalStudents: number
    availableForSelection: number
    recentSelections: number
  }
}

interface UseRandomSelectorReturn {
  // Estado de la selección
  currentSelection: SelectionResult | null
  isSelecting: boolean
  isAnimating: boolean
  
  // Historial
  selectionHistory: RandomSelection[]
  isLoadingHistory: boolean
  
  // Funciones principales
  selectRandomStudent: (classId: string, options?: SelectionRequest) => Promise<SelectionResult | null>
  startSelectionAnimation: () => void
  stopSelectionAnimation: () => void
  clearCurrentSelection: () => void
  
  // Gestión del historial
  refreshHistory: (classId: string) => void
  getSelectionHistory: (classId: string, page?: number, limit?: number) => void
}

export function useRandomSelector(): UseRandomSelectorReturn {
  const queryClient = useQueryClient()
  
  // Estados locales
  const [currentSelection, setCurrentSelection] = useState<SelectionResult | null>(null)
  const [isSelecting, setIsSelecting] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  const [currentClassId, setCurrentClassId] = useState<string | null>(null)

  // Query para el historial de selecciones
  const {
    data: selectionHistory = [],
    isLoading: isLoadingHistory,
    refetch: refreshHistory
  } = useQuery({
    queryKey: ['selection-history', currentClassId],
    queryFn: async (): Promise<RandomSelection[]> => {
      if (!currentClassId) return []
      
      const response = await fetch(`/api/classes/${currentClassId}/random-select?limit=20`)
      
      if (!response.ok) {
        throw new Error('Error al obtener historial de selecciones')
      }
      
      const result: ApiResponse = await response.json()
      
      if (!result.success) {
        throw new Error(result.error || 'Error al obtener historial')
      }
      
      return result.data?.selections || []
    },
    enabled: !!currentClassId,
    staleTime: 1 * 60 * 1000, // 1 minuto
    retry: 2
  })

  // Mutation para realizar selección aleatoria
  const selectMutation = useMutation({
    mutationFn: async ({ classId, options }: { classId: string; options: SelectionRequest }): Promise<SelectionResult> => {
      const response = await fetch(`/api/classes/${classId}/random-select`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          selectionType: SelectionType.random_student,
          selectionMethod: SelectionMethod.wheel,
          experienceReward: 10,
          lightReward: 5,
          ...options
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al realizar selección')
      }

      const result: ApiResponse<SelectionResult> = await response.json()
      
      if (!result.success) {
        throw new Error(result.error || 'Error al realizar selección')
      }

      return result.data!
    },
    onSuccess: (result, { classId }) => {
      setCurrentSelection(result)
      
      // Actualizar historial en cache
      queryClient.setQueryData(['selection-history', classId], (oldHistory: RandomSelection[] = []) => {
        const newSelection: RandomSelection = {
          id: result.selection.id,
          student: result.selection.student,
          selectionType: SelectionType.random_student,
          selectionMethod: result.selection.method,
          rewards: result.selection.rewards,
          selectedAt: result.selection.timestamp
        }
        return [newSelection, ...oldHistory.slice(0, 19)] // Mantener solo los últimos 20
      })
      
      toast.success(`¡${result.selection.student.name} ha sido seleccionado!`)
    },
    onError: (error: Error) => {
      toast.error(error.message)
      setIsSelecting(false)
      setIsAnimating(false)
    }
  })

  // Funciones públicas del hook
  const selectRandomStudent = useCallback(async (
    classId: string, 
    options: SelectionRequest = {}
  ): Promise<SelectionResult | null> => {
    if (isSelecting) return null

    setIsSelecting(true)
    setIsAnimating(true)
    setCurrentClassId(classId)

    try {
      // Simular animación de ruleta
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const result = await selectMutation.mutateAsync({ classId, options })
      
      setIsAnimating(false)
      return result
    } catch (error) {
      setIsAnimating(false)
      setIsSelecting(false)
      return null
    } finally {
      setIsSelecting(false)
    }
  }, [isSelecting, selectMutation])

  const startSelectionAnimation = useCallback(() => {
    setIsAnimating(true)
  }, [])

  const stopSelectionAnimation = useCallback(() => {
    setIsAnimating(false)
  }, [])

  const clearCurrentSelection = useCallback(() => {
    setCurrentSelection(null)
  }, [])

  const getSelectionHistory = useCallback((classId: string, page = 1, limit = 20) => {
    setCurrentClassId(classId)
    
    // Trigger refetch con parámetros específicos
    queryClient.fetchQuery({
      queryKey: ['selection-history', classId, page, limit],
      queryFn: async () => {
        const response = await fetch(`/api/classes/${classId}/random-select?page=${page}&limit=${limit}`)
        
        if (!response.ok) {
          throw new Error('Error al obtener historial')
        }
        
        const result: ApiResponse = await response.json()
        
        if (!result.success) {
          throw new Error(result.error || 'Error al obtener historial')
        }
        
        return result.data?.selections || []
      }
    })
  }, [queryClient])

  const refreshHistoryForClass = useCallback((classId: string) => {
    setCurrentClassId(classId)
    refreshHistory()
  }, [refreshHistory])

  return {
    // Estado de la selección
    currentSelection,
    isSelecting,
    isAnimating,
    
    // Historial
    selectionHistory,
    isLoadingHistory,
    
    // Funciones principales
    selectRandomStudent,
    startSelectionAnimation,
    stopSelectionAnimation,
    clearCurrentSelection,
    
    // Gestión del historial
    refreshHistory: refreshHistoryForClass,
    getSelectionHistory
  }
}

// Hook específico para animaciones de selección
export function useSelectionAnimation() {
  const [isSpinning, setIsSpinning] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const [animationSpeed, setAnimationSpeed] = useState(100)

  const startWheelAnimation = useCallback((totalStudents: number, finalIndex: number, duration = 2000) => {
    setIsSpinning(true)
    setSelectedIndex(null)
    
    const startTime = Date.now()
    const initialSpeed = 50
    const finalSpeed = 200
    
    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      
      // Función de easing para desaceleración
      const easeOut = 1 - Math.pow(1 - progress, 3)
      const currentSpeed = initialSpeed + (finalSpeed - initialSpeed) * easeOut
      
      setAnimationSpeed(currentSpeed)
      
      if (progress < 1) {
        // Continuar animación
        setTimeout(animate, currentSpeed)
      } else {
        // Finalizar en el índice correcto
        setSelectedIndex(finalIndex)
        setIsSpinning(false)
        setAnimationSpeed(100)
      }
    }
    
    animate()
  }, [])

  const stopAnimation = useCallback(() => {
    setIsSpinning(false)
    setAnimationSpeed(100)
  }, [])

  const resetAnimation = useCallback(() => {
    setIsSpinning(false)
    setSelectedIndex(null)
    setAnimationSpeed(100)
  }, [])

  return {
    isSpinning,
    selectedIndex,
    animationSpeed,
    startWheelAnimation,
    stopAnimation,
    resetAnimation
  }
}

// Hook para estadísticas de selecciones
export function useSelectionStats(classId: string) {
  return useQuery({
    queryKey: ['selection-stats', classId],
    queryFn: async () => {
      const response = await fetch(`/api/classes/${classId}/random-select/stats`)
      
      if (!response.ok) {
        throw new Error('Error al obtener estadísticas')
      }
      
      const result: ApiResponse = await response.json()
      
      if (!result.success) {
        throw new Error(result.error || 'Error al obtener estadísticas')
      }
      
      return result.data || {}
    },
    enabled: !!classId,
    staleTime: 5 * 60 * 1000, // 5 minutos
    retry: 2
  })
}