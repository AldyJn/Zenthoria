export interface User {
  id: string
  email: string
  role: 'teacher' | 'student'
  firstName: string
  lastName: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface Teacher extends User {
  teacherCode: string
  department?: string
  bio?: string
  avatarUrl?: string
  classes: Class[]
}

export interface Student extends User {
  studentCode: string
  avatarUrl?: string
  characters: StudentCharacter[]
  enrollments: ClassEnrollment[]
}

export interface Class {
  id: string
  teacherId: string
  name: string
  description?: string
  classCode: string
  qrCodeData?: string
  startDate: Date
  endDate: Date
  isActive: boolean
  maxStudents: number
  enrollments: ClassEnrollment[]
  activities: ClassActivity[]
  teacher: Teacher
}

export interface ClassEnrollment {
  id: string
  studentId: string
  classId: string
  enrolledAt: Date
  isActive: boolean
  student: Student
  class: Class
}

export interface CharacterType {
  id: string
  name: string
  description: string
  baseHealth: number
  baseLight: number
  specialAbility: string
  imageUrl?: string
  isActive: boolean
}

export interface StudentCharacter {
  id: string
  studentId: string
  classId: string
  characterTypeId: string
  characterName: string
  level: number
  experiencePoints: number
  currentHealth: number
  maxHealth: number
  currentLight: number
  maxLight: number
  discipline: number
  intellect: number
  strength: number
  charisma: number
  avatarCustomization: Record<string, any>
  lastLightRegen: Date
  createdAt: Date
  updatedAt: Date
  student: Student
  class: Class
  characterType: CharacterType
  powers: StudentPower[]
  activities: StudentActivityParticipation[]
}

export interface Power {
  id: string
  name: string
  description: string
  powerType: 'grenade' | 'melee' | 'super' | 'class_ability'
  element: 'solar' | 'arc' | 'void' | 'stasis'
  characterTypeId?: string
  lightCost: number
  cooldownMinutes: number
  levelRequired: number
  effects: Record<string, any>
  imageUrl?: string
  isActive: boolean
}

export interface StudentPower {
  id: string
  studentCharacterId: string
  powerId: string
  slotPosition: number
  isEquipped: boolean
  unlockedAt: Date
  power: Power
  studentCharacter: StudentCharacter
}

export interface ClassActivity {
  id: string
  classId: string
  title: string
  description?: string
  activityType: string
  experienceReward: number
  lightReward: number
  healthReward: number
  healthPenalty: number
  lightPenalty: number
  dueDate?: Date
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  class: Class
  participations: StudentActivityParticipation[]
}

export interface StudentActivityParticipation {
  id: string
  studentCharacterId: string
  activityId: string
  score: number
  experienceGained: number
  lightGained: number
  healthGained: number
  healthLost: number
  lightLost: number
  disciplineGained: number
  intellectGained: number
  strengthGained: number
  charismaGained: number
  participationDate: Date
  notes?: string
  studentCharacter: StudentCharacter
  activity: ClassActivity
}

export interface RandomSelection {
  id: string
  classId: string
  teacherId: string
  studentCharacterId: string
  selectionType: string
  selectionMethod: string
  result?: string
  experienceAwarded: number
  lightAwarded: number
  selectedAt: Date
  resolvedAt?: Date
  class: Class
  teacher: Teacher
  studentCharacter: StudentCharacter
}

export interface DailyProgress {
  id: string
  studentCharacterId: string
  date: Date
  participations: number
  activitiesCompleted: number
  timesSelected: number
  experienceEarned: number
  lightEarned: number
  healthChanges: number
  consecutiveDays: number
  createdAt: Date
  studentCharacter: StudentCharacter
}

export interface Achievement {
  id: string
  name: string
  description: string
  iconUrl?: string
  requirements: Record<string, any>
  rewards: Record<string, any>
  isActive: boolean
  createdAt: Date
}

export interface StudentAchievement {
  id: string
  studentCharacterId: string
  achievementId: string
  unlockedAt: Date
  studentCharacter: StudentCharacter
  achievement: Achievement
}

// Tipos de utilidad para formularios y APIs
export interface CreateClassRequest {
  name: string
  description?: string
  startDate: string
  endDate: string
  maxStudents?: number
}

export interface CreateCharacterRequest {
  classId: string
  characterTypeId: string
  characterName: string
}

export interface JoinClassRequest {
  classCode: string
}

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// Estados de la aplicación
export interface AuthState {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
}

export interface ClassState {
  currentClass: Class | null
  classes: Class[]
  isLoading: boolean
}

export interface CharacterState {
  currentCharacter: StudentCharacter | null
  characters: StudentCharacter[]
  isLoading: boolean
}