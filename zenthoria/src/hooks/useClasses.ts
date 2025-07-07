// src/hooks/useClasses.ts
import { useState, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from '@/components/ui/Toast'
import { CreateClassData, UpdateClassData, JoinClassData } from '@/lib/validations/classes'
import { ClassWithDetails, ApiResponse } from '@/types'

interface UseClassesReturn {
  // Datos
  classes: ClassWithDetails[]
  currentClass: ClassWithDetails | null
  isLoading: boolean
  isError: boolean
  error: string | null

  // Funciones CRUD
  createClass: (data: CreateClassData) => Promise<ClassWithDetails | null>
  updateClass: (classId: string, data: UpdateClassData) => Promise<ClassWithDetails | null>
  deleteClass: (classId: string) => Promise<boolean>
  joinClass: (data: JoinClassData) => Promise<boolean>
  
  // Funciones de gestión
  getClassDetails: (classId: string) => Promise<ClassWithDetails | null>
  refreshClasses: () => void
  
  // Estados de loading específicos
  isCreating: boolean
  isUpdating: boolean
  isDeleting: boolean
  isJoining: boolean
}

export function useClasses(): UseClassesReturn {
  const queryClient = useQueryClient()
  
  // Estados locales
  const [currentClass, setCurrentClass] = useState<ClassWithDetails | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isJoining, setIsJoining] = useState(false)

  // Query para obtener clases
  const {
    data: classes = [],
    isLoading,
    isError,
    error: queryError,
    refetch: refreshClasses
  } = useQuery({
    queryKey: ['classes'],
    queryFn: async (): Promise<ClassWithDetails[]> => {
      const response = await fetch('/api/classes')
      
      if (!response.ok) {
        throw new Error('Error al obtener clases')
      }
      
      const result: ApiResponse<ClassWithDetails[]> = await response.json()
      
      if (!result.success) {
        throw new Error(result.error || 'Error al obtener clases')
      }
      
      return result.data || []
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    retry: 2
  })

  // Mutation para crear clase
  const createClassMutation = useMutation({
    mutationFn: async (data: CreateClassData): Promise<ClassWithDetails> => {
      const response = await fetch('/api/classes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al crear clase')
      }

      const result: ApiResponse<ClassWithDetails> = await response.json()
      
      if (!result.success) {
        throw new Error(result.error || 'Error al crear clase')
      }

      return result.data!
    },
    onSuccess: (newClass) => {
      // Actualizar cache con optimistic update
      queryClient.setQueryData(['classes'], (oldClasses: ClassWithDetails[] = []) => [
        newClass,
        ...oldClasses
      ])
      
      toast.success(`Clase "${newClass.name}" creada exitosamente`)
    },
    onError: (error: Error) => {
      toast.error(error.message)
    }
  })

  // Mutation para actualizar clase
  const updateClassMutation = useMutation({
    mutationFn: async ({ classId, data }: { classId: string; data: UpdateClassData }): Promise<ClassWithDetails> => {
      const response = await fetch(`/api/classes/${classId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al actualizar clase')
      }

      const result: ApiResponse<ClassWithDetails> = await response.json()
      
      if (!result.success) {
        throw new Error(result.error || 'Error al actualizar clase')
      }

      return result.data!
    },
    onSuccess: (updatedClass) => {
      // Actualizar cache
      queryClient.setQueryData(['classes'], (oldClasses: ClassWithDetails[] = []) =>
        oldClasses.map(cls => cls.id === updatedClass.id ? updatedClass : cls)
      )
      
      // Actualizar clase actual si coincide
      if (currentClass?.id === updatedClass.id) {
        setCurrentClass(updatedClass)
      }
      
      toast.success('Clase actualizada exitosamente')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    }
  })

  // Mutation para eliminar clase
  const deleteClassMutation = useMutation({
    mutationFn: async (classId: string): Promise<void> => {
      const response = await fetch(`/api/classes/${classId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al eliminar clase')
      }

      const result: ApiResponse = await response.json()
      
      if (!result.success) {
        throw new Error(result.error || 'Error al eliminar clase')
      }
    },
    onSuccess: (_, classId) => {
      // Remover de cache
      queryClient.setQueryData(['classes'], (oldClasses: ClassWithDetails[] = []) =>
        oldClasses.filter(cls => cls.id !== classId)
      )
      
      // Limpiar clase actual si coincide
      if (currentClass?.id === classId) {
        setCurrentClass(null)
      }
      
      toast.success('Clase eliminada exitosamente')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    }
  })

  // Mutation para unirse a clase (estudiantes)
  const joinClassMutation = useMutation({
    mutationFn: async (data: JoinClassData): Promise<void> => {
      const response = await fetch('/api/classes/join', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al unirse a la clase')
      }

      const result: ApiResponse = await response.json()
      
      if (!result.success) {
        throw new Error(result.error || 'Error al unirse a la clase')
      }
    },
    onSuccess: () => {
      // Refrescar clases para mostrar la nueva inscripción
      refreshClasses()
      toast.success('Te has unido a la clase exitosamente')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    }
  })

  // Funciones públicas del hook
  const createClass = useCallback(async (data: CreateClassData): Promise<ClassWithDetails | null> => {
    if (isCreating) return null

    setIsCreating(true)
    try {
      const result = await createClassMutation.mutateAsync(data)
      return result
    } catch (error) {
      return null
    } finally {
      setIsCreating(false)
    }
  }, [isCreating, createClassMutation])

  const updateClass = useCallback(async (classId: string, data: UpdateClassData): Promise<ClassWithDetails | null> => {
    if (isUpdating) return null

    setIsUpdating(true)
    try {
      const result = await updateClassMutation.mutateAsync({ classId, data })
      return result
    } catch (error) {
      return null
    } finally {
      setIsUpdating(false)
    }
  }, [isUpdating, updateClassMutation])

  const deleteClass = useCallback(async (classId: string): Promise<boolean> => {
    if (isDeleting) return false

    setIsDeleting(true)
    try {
      await deleteClassMutation.mutateAsync(classId)
      return true
    } catch (error) {
      return false
    } finally {
      setIsDeleting(false)
    }
  }, [isDeleting, deleteClassMutation])

  const joinClass = useCallback(async (data: JoinClassData): Promise<boolean> => {
    if (isJoining) return false

    setIsJoining(true)
    try {
      await joinClassMutation.mutateAsync(data)
      return true
    } catch (error) {
      return false
    } finally {
      setIsJoining(false)
    }
  }, [isJoining, joinClassMutation])

  const getClassDetails = useCallback(async (classId: string): Promise<ClassWithDetails | null> => {
    try {
      const response = await fetch(`/api/classes/${classId}`)
      
      if (!response.ok) {
        throw new Error('Error al obtener detalles de la clase')
      }
      
      const result: ApiResponse<ClassWithDetails> = await response.json()
      
      if (!result.success) {
        throw new Error(result.error || 'Error al obtener detalles de la clase')
      }
      
      const classDetails = result.data!
      setCurrentClass(classDetails)
      
      return classDetails
    } catch (error) {
      console.error('Error al obtener detalles de clase:', error)
      toast.error('Error al cargar los detalles de la clase')
      return null
    }
  }, [])

  return {
    // Datos
    classes,
    currentClass,
    isLoading,
    isError,
    error: queryError?.message || null,

    // Funciones CRUD
    createClass,
    updateClass,
    deleteClass,
    joinClass,
    
    // Funciones de gestión
    getClassDetails,
    refreshClasses,
    
    // Estados de loading específicos
    isCreating,
    isUpdating,
    isDeleting,
    isJoining
  }
}

// Hook específico para obtener una clase individual
export function useClass(classId: string | null) {
  return useQuery({
    queryKey: ['class', classId],
    queryFn: async (): Promise<ClassWithDetails | null> => {
      if (!classId) return null
      
      const response = await fetch(`/api/classes/${classId}`)
      
      if (!response.ok) {
        throw new Error('Error al obtener clase')
      }
      
      const result: ApiResponse<ClassWithDetails> = await response.json()
      
      if (!result.success) {
        throw new Error(result.error || 'Error al obtener clase')
      }
      
      return result.data || null
    },
    enabled: !!classId,
    staleTime: 2 * 60 * 1000 // 2 minutos
  })
}