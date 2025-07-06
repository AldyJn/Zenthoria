// ============================================================================
// IMPORTACIONES DE PRISMA
// ============================================================================
import { 
  User, 
  Teacher, 
  Student, 
  Class, 
  ClassEnrollment, 
  CharacterType, 
  StudentCharacter, 
  Power, 
  StudentPower, 
  Accessory, 
  StudentAccessory, 
  RandomSelection,
  UserRole,
  PowerType,
  Element,
  AccessoryType,
  Rarity,
  SelectionType,
  SelectionMethod
} from '@prisma/client'

// ============================================================================
// TIPOS BASE EXTENDIDOS DESDE PRISMA
// ============================================================================

// Tipos con relaciones incluidas
export type UserWithProfile = User & {
  teacher?: Teacher | null
  student?: Student | null
}

export type TeacherWithUser = Teacher & {
  user: User
}

export type StudentWithUser = Student & {
  user: User
}

export type ClassWithDetails = Class & {
  teacher: TeacherWithUser
  enrollments: (ClassEnrollment & {
    student: StudentWithUser
  })[]
  characters?: (StudentCharacter & {
    student: StudentWithUser
    characterType: CharacterType
  })[]
  _count: {
    enrollments: number
    characters?: number
  }
}

export type StudentCharacterWithDetails = StudentCharacter & {
  student: StudentWithUser
  class: Class
  characterType: CharacterType
  powers: (StudentPower & {
    power: Power
  })[]
  accessories: (StudentAccessory & {
    accessory: Accessory
  })[]
}

export type PowerWithDetails = Power & {
  characterType?: CharacterType | null
  students: (StudentPower & {
    studentCharacter: StudentCharacter
  })[]
}

export type AccessoryWithDetails = Accessory & {
  students: (StudentAccessory & {
    studentCharacter: StudentCharacter
  })[]
}

export type RandomSelectionWithDetails = RandomSelection & {
  class: Class
  teacher: TeacherWithUser
  studentCharacter: StudentCharacterWithDetails
}

// ============================================================================
// TIPOS PARA FORMULARIOS Y CREACIÓN
// ============================================================================

export interface CreateUserData {
  email: string
  password: string
  role: UserRole
  firstName: string
  lastName: string
  department?: string // Solo para profesores
  bio?: string // Solo para profesores
}

export interface CreateClassData {
  teacherId: string
  name: string
  description?: string
  startDate: string
  endDate: string
  maxStudents?: number
}

export interface CreateCharacterData {
  studentId: string
  classId: string
  characterTypeId: string
  characterName: string
  avatarCustomization?: Record<string, any>
}

export interface UpdateCharacterData {
  characterName?: string
  avatarCustomization?: Record<string, any>
}

export interface JoinClassRequest {
  classCode: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  password: string
  confirmPassword: string
  firstName: string
  lastName: string
  role: UserRole
  department?: string
  bio?: string
}

// ============================================================================
// TIPOS PARA RESPUESTAS DE API
// ============================================================================

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

export interface PaginatedResponse<T> {
  success: boolean
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface DatabaseStats {
  usuarios: number
  profesores: number
  estudiantes: number
  clases: number
  personajes: number
  poderes: number
  accesorios: number
}

export interface ConnectionStatus {
  status: 'connected' | 'disconnected'
  message: string
  error?: string
}

// ============================================================================
// TIPOS PARA ESTADOS DE LA APLICACIÓN
// ============================================================================

export interface AuthState {
  user: UserWithProfile | null
  isLoading: boolean
  isAuthenticated: boolean
}

export interface ClassState {
  currentClass: ClassWithDetails | null
  classes: ClassWithDetails[]
  isLoading: boolean
  error?: string
}

export interface CharacterState {
  currentCharacter: StudentCharacterWithDetails | null
  characters: StudentCharacterWithDetails[]
  characterTypes: CharacterType[]
  isLoading: boolean
  error?: string
}

export interface PowerState {
  availablePowers: PowerWithDetails[]
  equippedPowers: (StudentPower & { power: Power })[]
  isLoading: boolean
  error?: string
}

export interface AccessoryState {
  availableAccessories: AccessoryWithDetails[]
  equippedAccessories: (StudentAccessory & { accessory: Accessory })[]
  inventory: (StudentAccessory & { accessory: Accessory })[]
  isLoading: boolean
  error?: string
}

// ============================================================================
// TIPOS PARA GAMIFICACIÓN
// ============================================================================

export interface ExperienceGain {
  amount: number
  reason: string
  timestamp: Date
}

export interface LightUpdate {
  current: number
  max: number
  lastRegen: Date
}

export interface HealthUpdate {
  current: number
  max: number
}

export interface StatBonus {
  discipline?: number
  intellect?: number
  strength?: number
  charisma?: number
}

export interface PowerEffect {
  type: 'damage' | 'heal' | 'buff' | 'debuff' | 'utility'
  value?: number
  duration?: number
  target: 'self' | 'ally' | 'enemy' | 'area'
  description: string
}

export interface VisualEffect {
  color?: string
  glow?: boolean
  particles?: string
  animation?: string
}

// ============================================================================
// TIPOS PARA SELECCIONES ALEATORIAS
// ============================================================================

export interface RandomSelectionConfig {
  selectionType: SelectionType
  selectionMethod: SelectionMethod
  classId: string
  rewards?: {
    experience?: number
    light?: number
  }
}

export interface SelectionResult {
  selectedStudent: StudentCharacterWithDetails
  selectionData: RandomSelectionWithDetails
  timestamp: Date
}

// ============================================================================
// TIPOS PARA EVENTOS Y NOTIFICACIONES
// ============================================================================

export interface GameEvent {
  id: string
  type: 'level_up' | 'power_unlock' | 'accessory_found' | 'selection' | 'achievement'
  studentCharacterId: string
  data: Record<string, any>
  timestamp: Date
}

export interface Notification {
  id: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  timestamp: Date
  read: boolean
  actionUrl?: string
}

// ============================================================================
// TIPOS PARA CONFIGURACIÓN
// ============================================================================

export interface AppConfig {
  name: string
  version: string
  environment: 'development' | 'production' | 'test'
  features: {
    registration: boolean
    classCreation: boolean
    characterCustomization: boolean
    powerSystem: boolean
    accessorySystem: boolean
    randomSelections: boolean
  }
}

export interface ThemeConfig {
  primary: string
  secondary: string
  accent: string
  background: string
  surface: string
  error: string
  warning: string
  success: string
  info: string
}

// ============================================================================
// TIPOS PARA VALIDACIÓN
// ============================================================================

export interface ValidationError {
  field: string
  message: string
  code?: string
}

export interface FormErrors {
  [key: string]: string | string[]
}

// ============================================================================
// EXPORTACIÓN DE TIPOS DE PRISMA
// ============================================================================

// Re-exportar tipos de Prisma para uso directo
export type {
  User,
  Teacher,
  Student,
  Class,
  ClassEnrollment,
  CharacterType,
  StudentCharacter,
  Power,
  StudentPower,
  Accessory,
  StudentAccessory,
  RandomSelection,
} from '@prisma/client'

// Re-exportar enums de Prisma para uso directo
export {
  UserRole,
  PowerType,
  Element,
  AccessoryType,
  Rarity,
  SelectionType,
  SelectionMethod,
} from '@prisma/client'

// ============================================================================
// TIPOS DE UTILIDAD
// ============================================================================

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>
export type PartialExcept<T, K extends keyof T> = Partial<T> & Pick<T, K>

// Para uso en componentes que manejan loading states
export type AsyncData<T> = {
  data: T | null
  loading: boolean
  error: string | null
}

// Para paginación
export type PaginationParams = {
  page: number
  limit: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  search?: string
}

// Para filtros
export type ClassFilters = {
  isActive?: boolean
  teacherId?: string
  startDate?: Date
  endDate?: Date
}

export type StudentFilters = {
  classId?: string
  isActive?: boolean
  hasCharacter?: boolean
}

export type PowerFilters = {
  characterTypeId?: string
  powerType?: PowerType
  element?: Element
  levelRequired?: number
}

export type AccessoryFilters = {
  accessoryType?: AccessoryType
  rarity?: Rarity
  levelRequired?: number
}