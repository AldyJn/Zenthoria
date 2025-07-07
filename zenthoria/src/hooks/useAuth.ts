import { useSession, signIn, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useState, useCallback } from 'react'
import { toast } from '@/components/ui/Toast'
import { UserRole } from '@prisma/client'
import { LoginFormData, RegisterFormData } from '@/lib/validations/auth'
import { ApiResponse } from '@/types'

interface AuthUser {
  id: string
  email: string
  name: string
  role: UserRole
  teacherId?: string | null
  studentId?: string | null
}

interface UseAuthReturn {
  // Estado del usuario
  user: AuthUser | null
  isLoading: boolean
  isAuthenticated: boolean
  userType: 'teacher' | 'student' | null

  // Funciones de autenticación
  login: (data: LoginFormData) => Promise<boolean>
  register: (data: RegisterFormData) => Promise<boolean>
  logout: () => Promise<void>
  
  // Funciones de verificación
  verifyEmail: (email: string) => Promise<{
    isAvailable: boolean
    detectedRole: UserRole | null
    displayName: string
  } | null>

  // Estados de carga específicos
  isLoggingIn: boolean
  isRegistering: boolean
  isLoggingOut: boolean
}

export function useAuth(): UseAuthReturn {
  const { data: session, status } = useSession()
  const router = useRouter()
  
  // Estados de carga específicos
  const [isLoggingIn, setIsLoggingIn] = useState(false)
  const [isRegistering, setIsRegistering] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  // Estado derivado del usuario
  const user: AuthUser | null = session?.user || null
  const isLoading = status === 'loading'
  const isAuthenticated = !!session?.user
  const userType: 'teacher' | 'student' | null = user?.role || null

  /**
   * Función para iniciar sesión
   */
const login = useCallback(async (data: LoginFormData): Promise<boolean> => {
  if (isLoggingIn) return false

  setIsLoggingIn(true)
  
  try {
    console.log('🔑 Intentando iniciar sesión con:', data.email)

    const result = await signIn('credentials', {
      email: data.email,
      password: data.password,
      redirect: false
    })

    if (result?.error) {
      console.error('❌ Error en login:', result.error)
      toast.error('Email o contraseña incorrectos')
      return false
    }

    if (result?.ok) {
      console.log('✅ Login exitoso')
      toast.success('¡Bienvenido a Zenthoria!')
      
      // SOLUCIÓN: Esperar más tiempo y verificar sesión múltiples veces
      let attempts = 0
      const maxAttempts = 5
      
      while (attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 500))
        
        const response = await fetch('/api/auth/session')
        const sessionData = await response.json()
        
        if (sessionData?.user?.role && sessionData?.user?.studentId) {
          const dashboardUrl = sessionData.user.role === 'teacher' 
            ? '/teacher/dashboard' 
            : '/student/dashboard'
          
          console.log('🔄 Sesión verificada, redirigiendo a:', dashboardUrl)
          router.push(dashboardUrl)
          return true
        }
        
        attempts++
        console.log(`⏳ Esperando sesión... intento ${attempts}/${maxAttempts}`)
      }
      
      // Fallback: recargar página completa
      console.log('⚠️ Sesión no detectada, recargando página...')
      window.location.href = '/'
      return true
    }

    return false

  } catch (error) {
    console.error('❌ Error en login:', error)
    toast.error('Error al iniciar sesión. Intente nuevamente.')
    return false
  } finally {
    setIsLoggingIn(false)
  }
}, [isLoggingIn, router])  /**
   * Función para registrarse
   */
  const register = useCallback(async (data: RegisterFormData): Promise<boolean> => {
    if (isRegistering) return false

    setIsRegistering(true)

    try {
      console.log('📝 Intentando registrarse con:', data.email)

      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      const result: ApiResponse = await response.json()

      if (!response.ok || !result.success) {
        console.error('❌ Error en registro:', result.error)
        toast.error(result.message || 'Error al crear la cuenta')
        return false
      }

      console.log('✅ Registro exitoso')
      toast.success('¡Cuenta creada exitosamente! Ahora puede iniciar sesión.')
      
      // Redirigir al login después del registro exitoso
      router.push('/auth/login')
      return true

    } catch (error) {
      console.error('❌ Error en registro:', error)
      toast.error('Error al crear la cuenta. Intente nuevamente.')
      return false
    } finally {
      setIsRegistering(false)
    }
  }, [isRegistering, router])

  /**
   * Función para cerrar sesión
   */
  const logout = useCallback(async (): Promise<void> => {
    if (isLoggingOut) return

    setIsLoggingOut(true)

    try {
      console.log('👋 Cerrando sesión...')
      
      await signOut({ 
        redirect: false,
        callbackUrl: '/auth/login'
      })
      
      toast.success('Sesión cerrada exitosamente')
      router.push('/auth/login')

    } catch (error) {
      console.error('❌ Error cerrando sesión:', error)
      toast.error('Error al cerrar sesión')
    } finally {
      setIsLoggingOut(false)
    }
  }, [isLoggingOut, router])

  /**
   * Función para verificar disponibilidad de email
   */
  const verifyEmail = useCallback(async (email: string) => {
    try {
      const response = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      const result: ApiResponse = await response.json()

      if (!response.ok || !result.success) {
        return null
      }

      return {
        isAvailable: result.data.isAvailable,
        detectedRole: result.data.detectedRole,
        displayName: result.data.displayName
      }

    } catch (error) {
      console.error('❌ Error verificando email:', error)
      return null
    }
  }, [])

  return {
    // Estado del usuario
    user,
    isLoading,
    isAuthenticated,
    userType,

    // Funciones de autenticación
    login,
    register,
    logout,
    verifyEmail,

    // Estados de carga específicos
    isLoggingIn,
    isRegistering,
    isLoggingOut
  }
}

/**
 * Hook para verificar si el usuario tiene un rol específico
 */
export function useAuthRole(requiredRole: UserRole) {
  const { user, isLoading, isAuthenticated } = useAuth()
  
  return {
    hasRole: isAuthenticated && user?.role === requiredRole,
    isLoading,
    isAuthenticated
  }
}

/**
 * Hook para verificar si el usuario es profesor
 */
export function useIsTeacher() {
  return useAuthRole('teacher')
}

/**
 * Hook para verificar si el usuario es estudiante
 */
export function useIsStudent() {
  return useAuthRole('student')
}

/**
 * Hook para obtener información específica del profesor
 */
export function useTeacherInfo() {
  const { user, isAuthenticated } = useAuth()
  
  return {
    teacherId: user?.teacherId || null,
    isTeacher: isAuthenticated && user?.role === 'teacher',
    teacherName: user?.name || null
  }
}

/**
 * Hook para obtener información específica del estudiante
 */
export function useStudentInfo() {
  const { user, isAuthenticated } = useAuth()
  
  return {
    studentId: user?.studentId || null,
    isStudent: isAuthenticated && user?.role === 'student',
    studentName: user?.name || null
  }
}