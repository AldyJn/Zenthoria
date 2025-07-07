// src/hooks/useCharacters.ts
import { useState, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from '@/components/ui/Toast'
import { CreateCharacterData, UpdateCharacterData } from '@/lib/validations/characters'
import { StudentCharacterWithDetails, CharacterType, ApiResponse } from '@/types'

interface UseCharactersReturn {
  // Datos
  characters: StudentCharacterWithDetails[]
  characterTypes: CharacterType[]
  currentCharacter: StudentCharacterWithDetails | null
  isLoading: boolean
  isLoadingTypes: boolean
  isError: boolean
  error: string | null

  // Funciones CRUD
  createCharacter: (data: CreateCharacterData) => Promise<StudentCharacterWithDetails | null>
  updateCharacter: (characterId: string, data: UpdateCharacterData) => Promise<StudentCharacterWithDetails | null>
  
  // Funciones de gestión
  getCharacterDetails: (characterId: string) => Promise<StudentCharacterWithDetails | null>
  getCharacterByClass: (classId: string) => StudentCharacterWithDetails | null
  refreshCharacters: () => void
  
  // Estados de loading específicos
  isCreating: boolean
  isUpdating: boolean
}

export function useCharacters(classId?: string): UseCharactersReturn {
  const queryClient = useQueryClient()
  
  // Estados locales
  const [currentCharacter, setCurrentCharacter] = useState<StudentCharacterWithDetails | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)

  // Query para obtener tipos de personajes (cache permanente)
  const {
    data: characterTypes = [],
    isLoading: isLoadingTypes
  } = useQuery({
    queryKey: ['character-types'],
    queryFn: async (): Promise<CharacterType[]> => {
      const response = await fetch('/api/characters/types')
      
      if (!response.ok) {
        throw new Error('Error al obtener tipos de personajes')
      }
      
      const result: ApiResponse<CharacterType[]> = await response.json()
      
      if (!result.success) {
        throw new Error(result.error || 'Error al obtener tipos de personajes')
      }
      
      return result.data || []
    },
    staleTime: 30 * 60 * 1000, // 30 minutos (los tipos cambian raramente)
    retry: 2
  })

  // Query para obtener personajes del estudiante
  const {
    data: characters = [],
    isLoading,
    isError,
    error: queryError,
    refetch: refreshCharacters
  } = useQuery({
    queryKey: ['characters', classId],
    queryFn: async (): Promise<StudentCharacterWithDetails[]> => {
      const url = classId ? `/api/characters?classId=${classId}` : '/api/characters'
      const response = await fetch(url)
      
      if (!response.ok) {
        throw new Error('Error al obtener personajes')
      }
      
      const result: ApiResponse<StudentCharacterWithDetails[]> = await response.json()
      
      if (!result.success) {
        throw new Error(result.error || 'Error al obtener personajes')
      }
      
      return result.data || []
    },
    staleTime: 2 * 60 * 1000, // 2 minutos
    retry: 2
  })

  // Mutation para crear personaje
  const createCharacterMutation = useMutation({
    mutationFn: async (data: CreateCharacterData): Promise<StudentCharacterWithDetails> => {
      const response = await fetch('/api/characters', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al crear personaje')
      }

      const result: ApiResponse<StudentCharacterWithDetails> = await response.json()
      
      if (!result.success) {
        throw new Error(result.error || 'Error al crear personaje')
      }

      return result.data!
    },
    onSuccess: (newCharacter) => {
      // Actualizar cache con optimistic update
      queryClient.setQueryData(['characters', classId], (oldCharacters: StudentCharacterWithDetails[] = []) => [
        newCharacter,
        ...oldCharacters
      ])
      
      // También actualizar cache general si no hay filtro de clase
      if (!classId) {
        queryClient.setQueryData(['characters'], (oldCharacters: StudentCharacterWithDetails[] = []) => [
          newCharacter,
          ...oldCharacters
        ])
      }
      
      toast.success(`Personaje "${newCharacter.characterName}" creado exitosamente`)
    },
    onError: (error: Error) => {
      toast.error(error.message)
    }
  })

  // Mutation para actualizar personaje
  const updateCharacterMutation = useMutation({
    mutationFn: async ({ characterId, data }: { characterId: string; data: UpdateCharacterData }): Promise<StudentCharacterWithDetails> => {
      const response = await fetch(`/api/characters/${characterId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al actualizar personaje')
      }

      const result: ApiResponse<StudentCharacterWithDetails> = await response.json()
      
      if (!result.success) {
        throw new Error(result.error || 'Error al actualizar personaje')
      }

      return result.data!
    },
    onSuccess: (updatedCharacter) => {
      // Actualizar cache
      queryClient.setQueryData(['characters', classId], (oldCharacters: StudentCharacterWithDetails[] = []) =>
        oldCharacters.map(char => char.id === updatedCharacter.id ? updatedCharacter : char)
      )
      
      // Actualizar cache general
      queryClient.setQueryData(['characters'], (oldCharacters: StudentCharacterWithDetails[] = []) =>
        oldCharacters.map(char => char.id === updatedCharacter.id ? updatedCharacter : char)
      )
      
      // Actualizar personaje actual si coincide
      if (currentCharacter?.id === updatedCharacter.id) {
        setCurrentCharacter(updatedCharacter)
      }
      
      toast.success('Personaje actualizado exitosamente')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    }
  })

  // Funciones públicas del hook
  const createCharacter = useCallback(async (data: CreateCharacterData): Promise<StudentCharacterWithDetails | null> => {
    if (isCreating) return null

    setIsCreating(true)
    try {
      const result = await createCharacterMutation.mutateAsync(data)
      return result
    } catch (error) {
      return null
    } finally {
      setIsCreating(false)
    }
  }, [isCreating, createCharacterMutation])

  const updateCharacter = useCallback(async (characterId: string, data: UpdateCharacterData): Promise<StudentCharacterWithDetails | null> => {
    if (isUpdating) return null

    setIsUpdating(true)
    try {
      const result = await updateCharacterMutation.mutateAsync({ characterId, data })
      return result
    } catch (error) {
      return null
    } finally {
      setIsUpdating(false)
    }
  }, [isUpdating, updateCharacterMutation])

  const getCharacterDetails = useCallback(async (characterId: string): Promise<StudentCharacterWithDetails | null> => {
    try {
      const response = await fetch(`/api/characters/${characterId}`)
      
      if (!response.ok) {
        throw new Error('Error al obtener detalles del personaje')
      }
      
      const result: ApiResponse<StudentCharacterWithDetails> = await response.json()
      
      if (!result.success) {
        throw new Error(result.error || 'Error al obtener detalles del personaje')
      }
      
      const characterDetails = result.data!
      setCurrentCharacter(characterDetails)
      
      return characterDetails
    } catch (error) {
      console.error('Error al obtener detalles del personaje:', error)
      toast.error('Error al cargar los detalles del personaje')
      return null
    }
  }, [])

  const getCharacterByClass = useCallback((classId: string): StudentCharacterWithDetails | null => {
    return characters.find(char => char.class.id === classId) || null
  }, [characters])

  return {
    // Datos
    characters,
    characterTypes,
    currentCharacter,
    isLoading,
    isLoadingTypes,
    isError,
    error: queryError?.message || null,

    // Funciones CRUD
    createCharacter,
    updateCharacter,
    
    // Funciones de gestión
    getCharacterDetails,
    getCharacterByClass,
    refreshCharacters,
    
    // Estados de loading específicos
    isCreating,
    isUpdating
  }
}

// Hook específico para obtener un personaje individual
export function useCharacter(characterId: string | null) {
  return useQuery({
    queryKey: ['character', characterId],
    queryFn: async (): Promise<StudentCharacterWithDetails | null> => {
      if (!characterId) return null
      
      const response = await fetch(`/api/characters/${characterId}`)
      
      if (!response.ok) {
        throw new Error('Error al obtener personaje')
      }
      
      const result: ApiResponse<StudentCharacterWithDetails> = await response.json()
      
      if (!result.success) {
        throw new Error(result.error || 'Error al obtener personaje')
      }
      
      return result.data || null
    },
    enabled: !!characterId,
    staleTime: 2 * 60 * 1000 // 2 minutos
  })
}

// Hook para obtener tipos de personajes con información extendida
export function useCharacterTypes() {
  return useQuery({
    queryKey: ['character-types-extended'],
    queryFn: async () => {
      const response = await fetch('/api/characters/types')
      
      if (!response.ok) {
        throw new Error('Error al obtener tipos de personajes')
      }
      
      const result: ApiResponse = await response.json()
      
      if (!result.success) {
        throw new Error(result.error || 'Error al obtener tipos de personajes')
      }
      
      return result.data || []
    },
    staleTime: 30 * 60 * 1000, // 30 minutos
    retry: 2
  })
}