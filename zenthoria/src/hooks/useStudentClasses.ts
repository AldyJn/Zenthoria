// src/hooks/useStudentClasses.ts
import { useState, useEffect } from 'react'
import { useStudentInfo } from './useAuth'
import { toast } from 'react-hot-toast'

export function useStudentClasses() {
  const { studentId } = useStudentInfo()
  const [classes, setClasses] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchClasses = async () => {
    if (!studentId) return
    
    try {
      setIsLoading(true)
      const response = await fetch(`/api/students/${studentId}/classes`)
      
      if (!response.ok) {
        throw new Error('Error al cargar clases')
      }
      
      const result = await response.json()
      setClasses(result.data || [])
    } catch (err) {
    if (err instanceof Error) {
        setError(err.message);
    } else {
        setError(String(err));   // por si fuera string, objeto, etc.
    }
    toast.error('Error al cargar tus clases');
    } finally {
  setIsLoading(false);  }

  const joinClass = async (classCode: string) => {
try {
  const response = await fetch('/api/classes/join', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ classCode })
  })
  
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Error al unirse a la clase')
  }
  
  const result = await response.json()
  toast.success(result.message)
  await fetchClasses() 
  return result
} catch (err) {
  if (err instanceof Error) {
    toast.error(err.message)
  } else {
    toast.error('Error desconocido')
  }
  throw err
}
  }

  const leaveClass = async (classId: string) => {
    try {
      const response = await fetch(`/api/classes/${classId}/leave`, {
        method: 'POST'
      })
      
      if (!response.ok) {
        throw new Error('Error al salir de la clase')
      }
      
      toast.success('Has salido de la clase')
      await fetchClasses()
        } catch (err) {
        // 1) Type‑guard seguro
        if (err instanceof Error) {
            toast.error(err.message);
        } else {
            toast.error('Error desconocido');
        }

        // 2) Vuelve a propagar el error
        throw err;  }

  useEffect(() => {
    fetchClasses()
  }, [studentId])

  return {
    classes,
    isLoading,
    error,
    joinClass,
    leaveClass,
    refresh: fetchClasses
  }
}}}