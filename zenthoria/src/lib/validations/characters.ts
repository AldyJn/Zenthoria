// src/lib/validations/characters.ts
import { z } from 'zod'

// Schema para crear personaje
export const createCharacterSchema = z.object({
  classId: z
    .string()
    .uuid('ID de clase inválido'),
  
  characterTypeId: z
    .string()
    .uuid('ID de tipo de personaje inválido'),
  
  characterName: z
    .string()
    .min(1, 'El nombre del personaje es requerido')
    .max(50, 'El nombre es demasiado largo')
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ0-9\s\-_'\.]+$/, 'El nombre contiene caracteres no válidos')
    .refine((name) => {
      // No permitir solo espacios
      return name.trim().length > 0
    }, 'El nombre no puede estar vacío')
    .refine((name) => {
      // No permitir nombres ofensivos (lista básica)
      const forbiddenWords = ['admin', 'moderador', 'profesor', 'teacher', 'test', 'null', 'undefined']
      return !forbiddenWords.some(word => name.toLowerCase().includes(word))
    }, 'Nombre no permitido'),
  
  avatarCustomization: z
    .record(z.any())
    .optional()
    .default({})
})

// Schema para actualizar personaje
export const updateCharacterSchema = z.object({
  characterName: z
    .string()
    .min(1, 'El nombre del personaje es requerido')
    .max(50, 'El nombre es demasiado largo')
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ0-9\s\-_'\.]+$/, 'El nombre contiene caracteres no válidos')
    .optional(),
  
  avatarCustomization: z
    .record(z.any())
    .optional()
})

// Schema para filtros de personajes
export const characterFiltersSchema = z.object({
  classId: z.string().uuid().optional(),
  characterTypeId: z.string().uuid().optional(),
  level: z.number().min(1).optional(),
  minLevel: z.number().min(1).optional(),
  maxLevel: z.number().min(1).optional(),
  search: z.string().max(100).optional(),
  sortBy: z.enum(['level', 'name', 'createdAt', 'experiencePoints']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(50).default(10)
})

// Schema para personalización del avatar
export const avatarCustomizationSchema = z.object({
  // Colores
  primaryColor: z
    .string()
    .regex(/^#[0-9A-F]{6}$/i, 'Color primario debe ser un código hexadecimal válido')
    .optional(),
  
  secondaryColor: z
    .string()
    .regex(/^#[0-9A-F]{6}$/i, 'Color secundario debe ser un código hexadecimal válido')
    .optional(),
  
  accentColor: z
    .string()
    .regex(/^#[0-9A-F]{6}$/i, 'Color de acento debe ser un código hexadecimal válido')
    .optional(),
  
  // Elementos visuales
  helmet: z.string().max(50).optional(),
  armor: z.string().max(50).optional(),
  cloak: z.string().max(50).optional(),
  emblem: z.string().max(50).optional(),
  
  // Efectos especiales
  aura: z.enum(['none', 'solar', 'arc', 'void', 'stasis']).default('none'),
  glowIntensity: z.number().min(0).max(100).default(50),
  
  // Pose y animación
  stance: z.enum(['default', 'heroic', 'casual', 'combat']).default('default'),
  expression: z.enum(['neutral', 'confident', 'serious', 'friendly']).default('neutral')
})

// Schema para stats del personaje
export const characterStatsSchema = z.object({
  discipline: z.number().min(0).max(100),
  intellect: z.number().min(0).max(100),
  strength: z.number().min(0).max(100),
  charisma: z.number().min(0).max(100)
}).refine((stats) => {
  // Verificar que la suma total no exceda un límite
  const total = stats.discipline + stats.intellect + stats.strength + stats.charisma
  return total <= 200
}, {
  message: 'La suma total de stats no puede exceder 200 puntos',
  path: ['total']
})

// Tipos derivados de los schemas
export type CreateCharacterData = z.infer<typeof createCharacterSchema>
export type UpdateCharacterData = z.infer<typeof updateCharacterSchema>
export type CharacterFilters = z.infer<typeof characterFiltersSchema>
export type AvatarCustomization = z.infer<typeof avatarCustomizationSchema>
export type CharacterStats = z.infer<typeof characterStatsSchema>

// Funciones de validación personalizadas
export function validateCharacterName(name: string): { isValid: boolean; error?: string } {
  if (!name || name.trim().length === 0) {
    return { isValid: false, error: 'El nombre es requerido' }
  }
  
  if (name.length > 50) {
    return { isValid: false, error: 'El nombre es demasiado largo' }
  }
  
  if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ0-9\s\-_'\.]+$/.test(name)) {
    return { isValid: false, error: 'El nombre contiene caracteres no válidos' }
  }
  
  // Lista de nombres prohibidos
  const forbiddenWords = [
    'admin', 'moderador', 'profesor', 'teacher', 'test', 'null', 'undefined',
    'bot', 'system', 'zenthoria', 'destiny', 'bungie'
  ]
  
  if (forbiddenWords.some(word => name.toLowerCase().includes(word))) {
    return { isValid: false, error: 'Nombre no permitido' }
  }
  
  return { isValid: true }
}

export function validateCharacterTypeForClass(characterTypeId: string, classId: string): boolean {
  // Aquí podrías implementar lógica específica si hay restricciones
  // por tipo de clase o configuración del profesor
  return true
}

export function calculateCharacterLevel(experiencePoints: number): number {
  // Fórmula: nivel = raíz cuadrada de (experiencia / 100) + 1
  return Math.floor(Math.sqrt(experiencePoints / 100)) + 1
}

export function calculateExperienceForLevel(level: number): number {
  // Fórmula inversa: experiencia = (nivel - 1)² * 100
  return Math.pow(level - 1, 2) * 100
}

export function validateStatDistribution(stats: CharacterStats): { isValid: boolean; errors: string[] } {
  const errors: string[] = []
  
  // Verificar rangos individuales
  Object.entries(stats).forEach(([stat, value]) => {
    if (value < 0) errors.push(`${stat} no puede ser negativo`)
    if (value > 100) errors.push(`${stat} no puede exceder 100`)
  })
  
  // Verificar suma total
  const total = Object.values(stats).reduce((sum, value) => sum + value, 0)
  if (total > 200) {
    errors.push('La suma total de stats no puede exceder 200 puntos')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

// Mensajes de error personalizados
export const characterErrorMessages = {
  required: 'Este campo es requerido',
  nameRequired: 'El nombre del personaje es requerido',
  nameInvalid: 'El nombre contiene caracteres no válidos',
  nameTooLong: 'El nombre es demasiado largo (máximo 50 caracteres)',
  nameForbidden: 'Este nombre no está permitido',
  classIdRequired: 'Debes seleccionar una clase',
  classIdInvalid: 'ID de clase inválido',
  typeIdRequired: 'Debes seleccionar un tipo de personaje',
  typeIdInvalid: 'ID de tipo de personaje inválido',
  alreadyHasCharacter: 'Ya tienes un personaje en esta clase',
  notEnrolled: 'No estás inscrito en esta clase',
  classInactive: 'La clase no está activa',
  typeNotAvailable: 'Este tipo de personaje no está disponible',
  statsInvalid: 'Distribución de stats inválida',
  statsTooHigh: 'La suma de stats excede el límite permitido',
  colorInvalid: 'Código de color inválido',
  unauthorized: 'No tienes permisos para realizar esta acción'
}

// Constantes de configuración
export const CHARACTER_CONSTANTS = {
  MAX_NAME_LENGTH: 50,
  MAX_TOTAL_STATS: 200,
  MAX_INDIVIDUAL_STAT: 100,
  MIN_INDIVIDUAL_STAT: 0,
  DEFAULT_HEALTH: {
    HUNTER: 100,
    TITAN: 150,
    WARLOCK: 120
  },
  DEFAULT_LIGHT: {
    HUNTER: 120,
    TITAN: 100,
    WARLOCK: 150
  }
} as const