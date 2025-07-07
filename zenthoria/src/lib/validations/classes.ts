// src/lib/validations/classes.ts
import { z } from 'zod'

// Schema para crear clase
export const createClassSchema = z.object({
  name: z
    .string()
    .min(1, 'El nombre de la clase es requerido')
    .max(100, 'El nombre es demasiado largo')
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ0-9\s\-_]+$/, 'El nombre contiene caracteres no válidos'),
  
  description: z
    .string()
    .max(500, 'La descripción es demasiado larga')
    .optional(),
  
  startDate: z
    .string()
    .refine((date) => !isNaN(Date.parse(date)), 'Fecha de inicio inválida')
    .refine((date) => {
      const startDate = new Date(date)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      return startDate >= today
    }, 'La fecha de inicio debe ser hoy o en el futuro'),
  
  endDate: z
    .string()
    .refine((date) => !isNaN(Date.parse(date)), 'Fecha de fin inválida'),
  
  maxStudents: z
    .number()
    .min(1, 'Debe permitir al menos 1 estudiante')
    .max(100, 'Máximo 100 estudiantes por clase')
    .optional()
    .default(30)
}).refine((data) => {
  const startDate = new Date(data.startDate)
  const endDate = new Date(data.endDate)
  return startDate < endDate
}, {
  message: 'La fecha de inicio debe ser anterior a la fecha de fin',
  path: ['endDate']
})

// Schema para actualizar clase
export const updateClassSchema = z.object({
  name: z
    .string()
    .min(1, 'El nombre de la clase es requerido')
    .max(100, 'El nombre es demasiado largo')
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ0-9\s\-_]+$/, 'El nombre contiene caracteres no válidos')
    .optional(),
  
  description: z
    .string()
    .max(500, 'La descripción es demasiado larga')
    .optional(),
  
  startDate: z
    .string()
    .refine((date) => !isNaN(Date.parse(date)), 'Fecha de inicio inválida')
    .optional(),
  
  endDate: z
    .string()
    .refine((date) => !isNaN(Date.parse(date)), 'Fecha de fin inválida')
    .optional(),
  
  maxStudents: z
    .number()
    .min(1, 'Debe permitir al menos 1 estudiante')
    .max(100, 'Máximo 100 estudiantes por clase')
    .optional()
}).refine((data) => {
  // Solo validar fechas si ambas están presentes
  if (data.startDate && data.endDate) {
    const startDate = new Date(data.startDate)
    const endDate = new Date(data.endDate)
    return startDate < endDate
  }
  return true
}, {
  message: 'La fecha de inicio debe ser anterior a la fecha de fin',
  path: ['endDate']
})

// Schema para unirse a clase
export const joinClassSchema = z.object({
  classCode: z
    .string()
    .length(6, 'El código debe tener exactamente 6 caracteres')
    .regex(/^[A-Z0-9]{6}$/, 'El código debe contener solo letras mayúsculas y números')
    .transform(code => code.toUpperCase())
})

// Schema para buscar clases (filtros)
export const classFiltersSchema = z.object({
  search: z.string().max(100).optional(),
  isActive: z.boolean().optional(),
  startDate: z.string().refine((date) => !isNaN(Date.parse(date)), 'Fecha inválida').optional(),
  endDate: z.string().refine((date) => !isNaN(Date.parse(date)), 'Fecha inválida').optional(),
  teacherId: z.string().uuid().optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(10)
})

// Tipos derivados de los schemas
export type CreateClassData = z.infer<typeof createClassSchema>
export type UpdateClassData = z.infer<typeof updateClassSchema>
export type JoinClassData = z.infer<typeof joinClassSchema>
export type ClassFilters = z.infer<typeof classFiltersSchema>

// Funciones de validación personalizadas
export function validateClassDates(startDate: string, endDate: string): boolean {
  const start = new Date(startDate)
  const end = new Date(endDate)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  return start >= today && start < end
}

export function validateClassCode(code: string): boolean {
  return /^[A-Z0-9]{6}$/.test(code)
}

export function validateClassCapacity(currentStudents: number, maxStudents: number): boolean {
  return currentStudents < maxStudents
}

// Mensajes de error personalizados
export const classErrorMessages = {
  required: 'Este campo es requerido',
  nameInvalid: 'El nombre contiene caracteres no válidos',
  nameTooLong: 'El nombre es demasiado largo (máximo 100 caracteres)',
  descriptionTooLong: 'La descripción es demasiado larga (máximo 500 caracteres)',
  dateInvalid: 'Formato de fecha inválido',
  datePast: 'La fecha debe ser en el futuro',
  endBeforeStart: 'La fecha de fin debe ser posterior a la fecha de inicio',
  capacityInvalid: 'La capacidad debe estar entre 1 y 100 estudiantes',
  codeInvalid: 'El código debe tener 6 caracteres (letras y números)',
  codeNotFound: 'Código de clase no encontrado',
  alreadyEnrolled: 'Ya estás inscrito en esta clase',
  classFull: 'La clase ha alcanzado su capacidad máxima',
  classInactive: 'Esta clase no está activa',
  unauthorized: 'No tienes permisos para realizar esta acción'
}