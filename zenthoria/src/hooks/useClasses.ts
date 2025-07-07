// src/hooks/useClasses.ts }
'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useCallback, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { toast } from '@/components/ui/Toast'
import { ApiResponse, Class, ClassWithDetails } from '@/types'
import { CreateClassData, JoinClassData } from '@/lib/validations/classes'

export function useClasses() {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const [currentClass, setCurrentClass] = useState<ClassWithDetails | null>(null)

  // Query para obtener clases según el rol del usuario
  const {
    data: classes = [],
    isLoading,
    error: queryError,
    refetch: refreshClasses
  } = useQuery({
    queryKey: ['classes', user?.id, user?.role],
    queryFn: async (): Promise<Class[]> => {
      if (!user) {
        throw new Error('Usuario no autenticado')
      }

      console.log('🔍 Cargando clases para usuario:', user.email, 'Rol:', user.role)

      const response = await fetch('/api/classes', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include' // Importante para incluir cookies de sesión
      })

      console.log('📡 Respuesta de API classes:', response.status, response.statusText)

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('No autorizado para ver clases')
        }
        if (response.status === 403) {
          throw new Error('Sin permisos para acceder a las clases')
        }
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }

      const result: ApiResponse<{ classes: Class[] }> = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'Error al obtener clases')
      }

      console.log('✅ Clases cargadas exitosamente:', result.data?.classes?.length || 0)
      return result.data?.classes || []
    },
    enabled: !!user,
    staleTime: 30 * 1000, // 30 segundos
    gcTime: 5 * 60 * 1000, // 5 minutos (antes cacheTime)
    retry: (failureCount, error) => {
      console.log(`❌ Error cargando clases (intento ${failureCount + 1}):`, error.message)
      
      // No reintentar en errores 401/403
      if (error.message.includes('401') || error.message.includes('403') || 
          error.message.includes('autorizado') || error.message.includes('permisos')) {
        return false
      }
      return failureCount < 2
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000)
  })

  const isError = !!queryError

  // Mutation para crear clase (solo profesores)
  const createClassMutation = useMutation({
    mutationFn: async (data: CreateClassData): Promise<Class> => {
      if (user?.role !== 'teacher') {
        throw new Error('Solo los profesores pueden crear clases')
      }

      console.log('📝 Creando clase:', data.name)

      const response = await fetch('/api/classes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
        credentials: 'include'
      })

      if (!response.ok) {
        const errorResult = await response.json().catch(() => ({}))
        throw new Error(errorResult.error || `Error ${response.status}`)
      }

      const result: ApiResponse<Class> = await response.json()
      
      if (!result.success) {
        throw new Error(result.error || 'Error al crear clase')
      }

      console.log('✅ Clase creada exitosamente:', result.data?.name)
      return result.data!
    },
    onSuccess: (newClass) => {
      queryClient.invalidateQueries({ queryKey: ['classes'] })
      toast.success(`Clase "${newClass.name}" creada exitosamente`)
    },
    onError: (error) => {
      console.error('❌ Error creando clase:', error)
      toast.error(error instanceof Error ? error.message : 'Error al crear clase')
    }
  })

  // Mutation para unirse a clase (solo estudiantes)
  const joinClassMutation = useMutation({
    mutationFn: async (data: JoinClassData): Promise<any> => {
      if (user?.role !== 'student') {
        throw new Error('Solo los estudiantes pueden unirse a clases')
      }

      console.log('🎯 Uniéndose a clase con código:', data.classCode)

      const response = await fetch('/api/classes/join', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
        credentials: 'include'
      })

      if (!response.ok) {
        const errorResult = await response.json().catch(() => ({}))
        throw new Error(errorResult.error || `Error ${response.status}`)
      }

      const result: ApiResponse = await response.json()
      
      if (!result.success) {
        throw new Error(result.error || 'Error al unirse a clase')
      }

      console.log('✅ Unido a clase exitosamente')
      return result.data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['classes'] })
      queryClient.invalidateQueries({ queryKey: ['characters'] })
      toast.success(`Te has unido exitosamente a la clase`)
    },
    onError: (error) => {
      console.error('❌ Error uniéndose a clase:', error)
      toast.error(error instanceof Error ? error.message : 'Error al unirse a clase')
    }
  })

  // Mutation para actualizar clase (solo profesores)
  const updateClassMutation = useMutation({
    mutationFn: async ({ classId, data }: { classId: string; data: Partial<CreateClassData> }): Promise<Class> => {
      if (user?.role !== 'teacher') {
        throw new Error('Solo los profesores pueden actualizar clases')
      }

      console.log('📝 Actualizando clase:', classId)

      const response = await fetch(`/api/classes/${classId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
        credentials: 'include'
      })

      if (!response.ok) {
        const errorResult = await response.json().catch(() => ({}))
        throw new Error(errorResult.error || `Error ${response.status}`)
      }

      const result: ApiResponse<Class> = await response.json()
      
      if (!result.success) {
        throw new Error(result.error || 'Error al actualizar clase')
      }

      console.log('✅ Clase actualizada exitosamente')
      return result.data!
    },
    onSuccess: (updatedClass) => {
      queryClient.invalidateQueries({ queryKey: ['classes'] })
      queryClient.invalidateQueries({ queryKey: ['class', updatedClass.id] })
      toast.success(`Clase "${updatedClass.name}" actualizada exitosamente`)
    },
    onError: (error) => {
      console.error('❌ Error actualizando clase:', error)
      toast.error(error instanceof Error ? error.message : 'Error al actualizar clase')
    }
  })

  // Mutation para eliminar clase (solo profesores)
  const deleteClassMutation = useMutation({
    mutationFn: async (classId: string): Promise<void> => {
      if (user?.role !== 'teacher') {
        throw new Error('Solo los profesores pueden eliminar clases')
      }

      console.log('🗑️ Eliminando clase:', classId)

      const response = await fetch(`/api/classes/${classId}`, {
        method: 'DELETE',
        credentials: 'include'
      })

      if (!response.ok) {
        const errorResult = await response.json().catch(() => ({}))
        throw new Error(errorResult.error || `Error ${response.status}`)
      }

      const result: ApiResponse = await response.json()
      
      if (!result.success) {
        throw new Error(result.error || 'Error al eliminar clase')
      }

      console.log('✅ Clase eliminada exitosamente')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classes'] })
      toast.success('Clase eliminada exitosamente')
    },
    onError: (error) => {
      console.error('❌ Error eliminando clase:', error)
      toast.error(error instanceof Error ? error.message : 'Error al eliminar clase')
    }
  })

  // Funciones wrappers
  const createClass = useCallback(async (data: CreateClassData): Promise<Class | null> => {
    try {
      return await createClassMutation.mutateAsync(data)
    } catch (error) {
      console.error('Error en createClass wrapper:', error)
      return null
    }
  }, [createClassMutation])

  const updateClass = useCallback(async (classId: string, data: Partial<CreateClassData>): Promise<Class | null> => {
    try {
      return await updateClassMutation.mutateAsync({ classId, data })
    } catch (error) {
      console.error('Error en updateClass wrapper:', error)
      return null
    }
  }, [updateClassMutation])

  const deleteClass = useCallback(async (classId: string): Promise<boolean> => {
    try {
      await deleteClassMutation.mutateAsync(classId)
      return true
    } catch (error) {
      console.error('Error en deleteClass wrapper:', error)
      return false
    }
  }, [deleteClassMutation])

  const joinClass = useCallback(async (data: JoinClassData): Promise<boolean> => {
    try {
      await joinClassMutation.mutateAsync(data)
      return true
    } catch (error) {
      console.error('Error en joinClass wrapper:', error)
      return false
    }
  }, [joinClassMutation])

  // Función para obtener detalles de una clase específica
  const getClassDetails = useCallback(async (classId: string): Promise<ClassWithDetails | null> => {
    try {
      console.log('🔍 Obteniendo detalles de clase:', classId)

      const response = await fetch(`/api/classes/${classId}`, {
        credentials: 'include'
      })

      if (!response.ok) {
        if (response.status === 403) {
          toast.error('No tienes permisos para ver esta clase')
        } else if (response.status === 404) {
          toast.error('Clase no encontrada')
        } else {
          toast.error('Error al cargar los detalles de la clase')
        }
        return null
      }

      const result: ApiResponse<ClassWithDetails> = await response.json()

      if (!result.success) {
        toast.error(result.error || 'Error al obtener detalles de clase')
        return null
      }

      const classDetails = result.data!
      setCurrentClass(classDetails)
      
      console.log('✅ Detalles de clase obtenidos exitosamente')
      return classDetails
    } catch (error) {
      console.error('❌ Error al obtener detalles de clase:', error)
      toast.error('Error al cargar los detalles de la clase')
      return null
    }
  }, [])

  // Función para refrescar datos con feedback
  const refreshWithFeedback = useCallback(async () => {
    console.log('🔄 Refrescando clases...')
    try {
      await refreshClasses()
      console.log('✅ Clases refrescadas exitosamente')
    } catch (error) {
      console.error('❌ Error refrescando clases:', error)
      toast.error('Error al actualizar las clases')
    }
  }, [refreshClasses])

  // Función para buscar clases por código (estudiantes)
  const searchClassByCode = useCallback(async (classCode: string): Promise<any> => {
    if (user?.role !== 'student') {
      throw new Error('Solo los estudiantes pueden buscar clases por código')
    }

    try {
      console.log('🔍 Buscando clase con código:', classCode)

      const response = await fetch(`/api/classes/join?classCode=${classCode}`, {
        credentials: 'include'
      })

      if (!response.ok) {
        throw new Error('Código de clase inválido o clase no encontrada')
      }

      const result: ApiResponse = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'Error al buscar clase')
      }

      console.log('✅ Clase encontrada')
      return result.data
    } catch (error) {
      console.error('❌ Error buscando clase:', error)
      throw error
    }
  }, [user?.role])

  return {
    // Datos principales
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
    refreshClasses: refreshWithFeedback,
    searchClassByCode,
    
    // Estados de loading específicos
    isCreating: createClassMutation.isPending,
    isUpdating: updateClassMutation.isPending,
    isDeleting: deleteClassMutation.isPending,
    isJoining: joinClassMutation.isPending,

    // Funcionalidades y permisos
    canCreateClasses: user?.role === 'teacher',
    canJoinClasses: user?.role === 'student',
    canManageClasses: user?.role === 'teacher',

    // Estadísticas útiles
    totalClasses: classes.length,
    activeClasses: classes.filter(cls => {
      const now = new Date()
      const startDate = new Date(cls.startDate)
      const endDate = new Date(cls.endDate)
      return startDate <= now && now <= endDate
    }),
    upcomingClasses: classes.filter(cls => {
      const now = new Date()
      const startDate = new Date(cls.startDate)
      return startDate > now
    }),
    pastClasses: classes.filter(cls => {
      const now = new Date()
      const endDate = new Date(cls.endDate)
      return endDate < now
    })
  }
}

// Hook específico para obtener una clase individual
export function useClass(classId: string | null) {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['class', classId, user?.id],
    queryFn: async (): Promise<ClassWithDetails | null> => {
      if (!classId) return null
      
      console.log('🔍 Cargando clase individual:', classId)

      const response = await fetch(`/api/classes/${classId}`, {
        credentials: 'include'
      })
      
      if (!response.ok) {
        if (response.status === 403) {
          throw new Error('No tienes permisos para ver esta clase')
        } else if (response.status === 404) {
          throw new Error('Clase no encontrada')
        }
        throw new Error('Error al obtener clase')
      }
      
      const result: ApiResponse<ClassWithDetails> = await response.json()
      
      if (!result.success) {
        throw new Error(result.error || 'Error al obtener clase')
      }
      
      console.log('✅ Clase individual cargada exitosamente')
      return result.data || null
    },
    enabled: !!classId && !!user,
    staleTime: 2 * 60 * 1000, // 2 minutos
    retry: (failureCount, error) => {
      // No reintentar en errores 403/404
      if (error.message.includes('permisos') || error.message.includes('no encontrada')) {
        return false
      }
      return failureCount < 2
    }
  })
}

// Hook para gestionar estudiantes de una clase (solo profesores)
export function useClassStudents(classId: string | null) {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['class-students', classId, user?.id],
    queryFn: async () => {
      if (!classId || user?.role !== 'teacher') {
        throw new Error('No autorizado')
      }

      console.log('👥 Cargando estudiantes de clase:', classId)

      const response = await fetch(`/api/classes/${classId}/students`, {
        credentials: 'include'
      })

      if (!response.ok) {
        throw new Error('Error al obtener estudiantes')
      }

      const result: ApiResponse = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'Error al obtener estudiantes')
      }

      console.log('✅ Estudiantes cargados exitosamente')
      return result.data || []
    },
    enabled: !!classId && user?.role === 'teacher',
    staleTime: 60 * 1000, // 1 minuto
  })
}

// Hook para obtener estadísticas de clase
export function useClassStats(classId: string | null) {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['class-stats', classId, user?.id],
    queryFn: async () => {
      if (!classId) {
        throw new Error('ID de clase requerido')
      }

      console.log('📊 Cargando estadísticas de clase:', classId)

      const response = await fetch(`/api/classes/${classId}/stats`, {
        credentials: 'include'
      })

      if (!response.ok) {
        throw new Error('Error al obtener estadísticas')
      }

      const result: ApiResponse = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'Error al obtener estadísticas')
      }

      console.log('✅ Estadísticas cargadas exitosamente')
      return result.data || {}
    },
    enabled: !!classId && !!user,
    staleTime: 5 * 60 * 1000, // 5 minutos
  })
}