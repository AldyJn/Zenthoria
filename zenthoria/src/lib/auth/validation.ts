import { UserRole } from '@prisma/client'

/**
 * Detecta automáticamente el rol del usuario basado en el formato del email
 * 
 * Reglas:
 * - Profesores: inicial + apellido@example.com (ej: jperez@example.com)
 * - Estudiantes: nombre.apellido@example.com (ej: pedro.suarez@example.com)
 */
export function detectUserRole(email: string): UserRole | null {
  // Validar que sea un email válido de @example.com
  if (!email.endsWith('@example.com')) {
    return null
  }

  // Extraer la parte local del email (antes del @)
  const localPart = email.split('@')[0]

  // Regex para profesor: una letra inicial seguida de apellido
  const teacherRegex = /^[a-z][a-z]+$/
  
  // Regex para estudiante: nombre.apellido
  const studentRegex = /^[a-z]+\.[a-z]+$/

  if (teacherRegex.test(localPart)) {
    return 'teacher'
  }
  
  if (studentRegex.test(localPart)) {
    return 'student'
  }

  return null
}

/**
 * Valida que el email tenga el formato correcto para profesor
 */
export function validateTeacherEmail(email: string): boolean {
  if (!email.endsWith('@example.com')) return false
  
  const localPart = email.split('@')[0]
  const teacherRegex = /^[a-z][a-z]+$/
  
  return teacherRegex.test(localPart)
}

/**
 * Valida que el email tenga el formato correcto para estudiante
 */
export function validateStudentEmail(email: string): boolean {
  if (!email.endsWith('@example.com')) return false
  
  const localPart = email.split('@')[0]
  const studentRegex = /^[a-z]+\.[a-z]+$/
  
  return studentRegex.test(localPart)
}

/**
 * Extrae automáticamente el nombre y apellido del email según el rol
 */
export function extractNameFromEmail(email: string, role: UserRole): { firstName: string; lastName: string } {
  const localPart = email.split('@')[0]

  if (role === 'teacher') {
    // Formato: jperez -> J. Perez
    const firstLetter = localPart.charAt(0).toUpperCase()
    const lastname = localPart.slice(1)
    const formattedLastname = lastname.charAt(0).toUpperCase() + lastname.slice(1).toLowerCase()
    
    return {
      firstName: firstLetter,
      lastName: formattedLastname
    }
  }

  if (role === 'student') {
    // Formato: pedro.suarez -> Pedro Suarez
    const [firstName, lastName] = localPart.split('.')
    
    return {
      firstName: firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase(),
      lastName: lastName.charAt(0).toUpperCase() + lastName.slice(1).toLowerCase()
    }
  }

  throw new Error('Rol no válido para extraer nombres')
}

/**
 * Valida la fuerza de la contraseña
 */
export function validatePasswordStrength(password: string): {
  isValid: boolean
  errors: string[]
} {
  const errors: string[] = []

  if (password.length < 8) {
    errors.push('La contraseña debe tener al menos 8 caracteres')
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('La contraseña debe contener al menos una letra mayúscula')
  }

  if (!/[a-z]/.test(password)) {
    errors.push('La contraseña debe contener al menos una letra minúscula')
  }

  if (!/[0-9]/.test(password)) {
    errors.push('La contraseña debe contener al menos un número')
  }

  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('La contraseña debe contener al menos un carácter especial')
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * Genera ejemplos de email válidos para mostrar al usuario
 */
export function getEmailExamples(): { teacher: string[]; student: string[] } {
  return {
    teacher: [
      'jperez@example.com',
      'mrodriguez@example.com', 
      'agarcia@example.com'
    ],
    student: [
      'pedro.suarez@example.com',
      'maria.gonzalez@example.com',
      'carlos.lopez@example.com'
    ]
  }
}

/**
 * Valida que el email no esté en la lista de emails prohibidos
 */
export function isEmailAllowed(email: string): boolean {
  const prohibitedEmails = [
    'admin@example.com',
    'test@example.com',
    'demo@example.com'
  ]
  
  return !prohibitedEmails.includes(email.toLowerCase())
}

/**
 * Extrae información de display del email para mostrar en la UI
 */
export function getEmailDisplayInfo(email: string): {
  role: UserRole | null
  displayName: string
  isValid: boolean
} {
  const role = detectUserRole(email)
  
  if (!role) {
    return {
      role: null,
      displayName: '',
      isValid: false
    }
  }

  const { firstName, lastName } = extractNameFromEmail(email, role)
  const displayName = `${firstName} ${lastName}`

  return {
    role,
    displayName,
    isValid: true
  }
}