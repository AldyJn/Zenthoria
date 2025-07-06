import { z } from 'zod'
import { UserRole } from '@prisma/client'
import { detectUserRole, validatePasswordStrength, isEmailAllowed } from '@/lib/auth/validation'

// Schema para login
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'El email es requerido')
    .email('Formato de email inválido')
    .toLowerCase()
    .refine(
      (email) => email.endsWith('@example.com'),
      'El email debe terminar en @example.com'
    )
    .refine(
      (email) => detectUserRole(email) !== null,
      'Formato de email inválido. Use: inicial+apellido@example.com (profesores) o nombre.apellido@example.com (estudiantes)'
    )
    .refine(
      (email) => isEmailAllowed(email),
      'Este email no está permitido'
    ),

  password: z
    .string()
    .min(1, 'La contraseña es requerida')
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
})

// Schema para registro básico
export const registerSchema = z.object({
  email: z
    .string()
    .min(1, 'El email es requerido')
    .email('Formato de email inválido')
    .toLowerCase()
    .refine(
      (email) => email.endsWith('@example.com'),
      'El email debe terminar en @example.com'
    )
    .refine(
      (email) => detectUserRole(email) !== null,
      'Formato de email inválido. Use: inicial+apellido@example.com (profesores) o nombre.apellido@example.com (estudiantes)'
    )
    .refine(
      (email) => isEmailAllowed(email),
      'Este email no está permitido'
    ),

  password: z
    .string()
    .min(1, 'La contraseña es requerida')
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .max(100, 'La contraseña es demasiado larga')
    .refine(
      (password) => validatePasswordStrength(password).isValid,
      (password) => ({
        message: validatePasswordStrength(password).errors[0] || 'Contraseña no válida'
      })
    ),

  confirmPassword: z
    .string()
    .min(1, 'Confirme su contraseña'),

  // Campos que se auto-completan pero pueden ser editados por el usuario
  firstName: z
    .string()
    .min(1, 'El nombre es requerido')
    .max(50, 'El nombre es demasiado largo')
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'El nombre solo puede contener letras'),

  lastName: z
    .string()
    .min(1, 'El apellido es requerido')
    .max(50, 'El apellido es demasiado largo')
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'El apellido solo puede contener letras'),

  // Campo opcional para profesores
  department: z
    .string()
    .max(100, 'El departamento es demasiado largo')
    .optional(),

  // Campo opcional para profesores  
  bio: z
    .string()
    .max(500, 'La biografía es demasiado larga')
    .optional(),

  // Aceptar términos
  acceptTerms: z
    .boolean()
    .refine(val => val === true, 'Debe aceptar los términos y condiciones')

}).refine((data) => data.password === data.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword']
})

// Schema para verificación de email
export const emailVerificationSchema = z.object({
  email: z
    .string()
    .min(1, 'El email es requerido')
    .email('Formato de email inválido')
    .toLowerCase()
    .refine(
      (email) => email.endsWith('@example.com'),
      'El email debe terminar en @example.com'
    )
})

// Schema para cambio de contraseña
export const changePasswordSchema = z.object({
  currentPassword: z
    .string()
    .min(1, 'La contraseña actual es requerida'),

  newPassword: z
    .string()
    .min(8, 'La nueva contraseña debe tener al menos 8 caracteres')
    .max(100, 'La contraseña es demasiado larga')
    .refine(
      (password) => validatePasswordStrength(password).isValid,
      (password) => ({
        message: validatePasswordStrength(password).errors[0] || 'Contraseña no válida'
      })
    ),

  confirmNewPassword: z
    .string()
    .min(1, 'Confirme la nueva contraseña')

}).refine((data) => data.newPassword === data.confirmNewPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmNewPassword']
}).refine((data) => data.currentPassword !== data.newPassword, {
  message: 'La nueva contraseña debe ser diferente a la actual',
  path: ['newPassword']
})

// Tipos TypeScript derivados de los schemas
export type LoginFormData = z.infer<typeof loginSchema>
export type RegisterFormData = z.infer<typeof registerSchema>
export type EmailVerificationData = z.infer<typeof emailVerificationSchema>
export type ChangePasswordData = z.infer<typeof changePasswordSchema>

// Función helper para validar datos de registro y extraer información automática
export function validateAndProcessRegistration(data: RegisterFormData) {
  // Validar schema básico
  const validatedData = registerSchema.parse(data)
  
  // Detectar rol automáticamente
  const role = detectUserRole(validatedData.email)
  
  if (!role) {
    throw new Error('No se pudo determinar el rol del usuario')
  }

  // Preparar datos para crear usuario
  return {
    email: validatedData.email,
    password: validatedData.password,
    role,
    firstName: validatedData.firstName,
    lastName: validatedData.lastName,
    department: role === 'teacher' ? validatedData.department : undefined,
    bio: role === 'teacher' ? validatedData.bio : undefined
  }
}

// Mensajes de error personalizados en español
export const authErrorMessages = {
  invalidCredentials: 'Email o contraseña incorrectos',
  userNotFound: 'Usuario no encontrado',
  userExists: 'Ya existe un usuario con este email',
  invalidEmailFormat: 'Formato de email inválido',
  weakPassword: 'La contraseña no cumple con los requisitos de seguridad',
  passwordMismatch: 'Las contraseñas no coinciden',
  userInactive: 'Su cuenta está desactivada. Contacte al administrador',
  sessionExpired: 'Su sesión ha expirado. Inicie sesión nuevamente',
  unauthorized: 'No tiene permisos para realizar esta acción',
  serverError: 'Error del servidor. Intente nuevamente',
  networkError: 'Error de conexión. Verifique su internet',
  tooManyAttempts: 'Demasiados intentos. Intente nuevamente en unos minutos'
} as const

// Función para obtener mensaje de error amigable
export function getAuthErrorMessage(error: string): string {
  return authErrorMessages[error as keyof typeof authErrorMessages] || authErrorMessages.serverError
}