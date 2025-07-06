import { prisma } from '@/lib/db'
import { 
  CreateUserData, 
  CreateClassData, 
  CreateCharacterData,
  UserWithProfile,
  ClassWithDetails,
  StudentCharacterWithDetails 
} from '@/types'
import bcrypt from 'bcryptjs'

// FUNCIONES DE USUARIOS

/**
 * Obtiene un usuario por email incluyendo su perfil (teacher/student)
 */
export async function getUserByEmail(email: string): Promise<UserWithProfile | null> {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        teacher: true,
        student: true,
      },
    })
    return user
  } catch (error) {
    console.error('Error al obtener usuario pokaor email:', error)
    throw new Error('Error al buscar el usuario')
  }
}

/**
 * Obtiene un usuario por ID incluyendo su perfil
 */
export async function getUserById(id: string): Promise<UserWithProfile | null> {
  try {
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        teacher: true,
        student: true,
      },
    })
    return user
  } catch (error) {
    console.error('Error al obtener usuario por ID:', error)
    throw new Error('Error al buscar el usuario')
  }
}

/**
 * Crea un nuevo usuario con perfil de profesor o estudiante
 */
export async function createUser(userData: CreateUserData): Promise<UserWithProfile> {
  try {
    const hashedPassword = await bcrypt.hash(userData.password, 12)
    
    const user = await prisma.user.create({
      data: {
        email: userData.email,
        passwordHash: hashedPassword,
        role: userData.role,
        firstName: userData.firstName,
        lastName: userData.lastName,
        ...(userData.role === 'teacher' && {
          teacher: {
            create: {
              teacherCode: generateTeacherCode(),
              department: userData.department,
              bio: userData.bio,
            },
          },
        }),
        ...(userData.role === 'student' && {
          student: {
            create: {
              studentCode: generateStudentCode(),
            },
          },
        }),
      },
      include: {
        teacher: true,
        student: true,
      },
    })

    return user
  } catch (error) {
    console.error('Error al crear usuario:', error)
    throw new Error('Error al crear el usuario')
  }
}

/**
 * Verifica la contraseña de un usuario
 */
export async function verifyPassword(email: string, password: string): Promise<boolean> {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
      select: { passwordHash: true },
    })

    if (!user) return false

    return await bcrypt.compare(password, user.passwordHash)
  } catch (error) {
    console.error('Error al verificar contraseña:', error)
    return false
  }
}

// ============================================================================
// FUNCIONES DE CLASES
// ============================================================================

/**
 * Obtiene todas las clases de un profesor
 */
export async function getClassesByTeacher(teacherId: string): Promise<ClassWithDetails[]> {
  try {
    const classes = await prisma.class.findMany({
      where: { 
        teacherId,
        isActive: true 
      },
      include: {
        teacher: {
          include: {
            user: true,
          },
        },
        enrollments: {
          include: {
            student: {
              include: {
                user: true,
              },
            },
          },
        },
        characters: {
          include: {
            student: {
              include: {
                user: true,
              },
            },
            characterType: true,
          },
        },
        _count: {
          select: {
            enrollments: true,
            characters: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return classes
  } catch (error) {
    console.error('Error al obtener clases del profesor:', error)
    throw new Error('Error al obtener las clases')
  }
}

/**
 * Obtiene una clase por su código
 */
export async function getClassByCode(classCode: string): Promise<ClassWithDetails | null> {
  try {
    const classData = await prisma.class.findUnique({
      where: { 
        classCode,
        isActive: true 
      },
      include: {
        teacher: {
          include: {
            user: true,
          },
        },
        enrollments: {
          include: {
            student: {
              include: {
                user: true,
              },
            },
          },
        },
        _count: {
          select: {
            enrollments: true,
          },
        },
      },
    })

    return classData
  } catch (error) {
    console.error('Error al obtener clase por código:', error)
    throw new Error('Error al buscar la clase')
  }
}

/**
 * Crea una nueva clase
 */
export async function createClass(classData: CreateClassData): Promise<ClassWithDetails> {
  try {
    const classCode = generateClassCode()
    
    const newClass = await prisma.class.create({
      data: {
        teacherId: classData.teacherId,
        name: classData.name,
        description: classData.description,
        classCode,
        startDate: new Date(classData.startDate),
        endDate: new Date(classData.endDate),
        maxStudents: classData.maxStudents || 30,
      },
      include: {
        teacher: {
          include: {
            user: true,
          },
        },
        enrollments: {
          include: {
            student: {
              include: {
                user: true,
              },
            },
          },
        },
        _count: {
          select: {
            enrollments: true,
          },
        },
      },
    })

    return newClass
  } catch (error) {
    console.error('Error al crear clase:', error)
    throw new Error('Error al crear la clase')
  }
}

/**
 * Obtiene todos los estudiantes de una clase específica
 */
export async function getStudentsByClass(classId: string) {
  try {
    const enrollments = await prisma.classEnrollment.findMany({
      where: { 
        classId,
        isActive: true 
      },
      include: {
        student: {
          include: {
            user: true,
            characters: {
              where: { classId },
              include: {
                characterType: true,
              },
            },
          },
        },
      },
      orderBy: {
        enrolledAt: 'asc',
      },
    })

    return enrollments.map(enrollment => ({
      ...enrollment.student,
      enrolledAt: enrollment.enrolledAt,
      character: enrollment.student.characters[0] || null,
    }))
  } catch (error) {
    console.error('Error al obtener estudiantes de la clase:', error)
    throw new Error('Error al obtener los estudiantes')
  }
}

/**
 * Permite a un estudiante unirse a una clase usando el código
 */
export async function joinClassByCode(studentId: string, classCode: string) {
  try {
    // Verificar que la clase existe y está activa
    const classData = await getClassByCode(classCode)
    if (!classData) {
      throw new Error('Código de clase inválido o clase no encontrada')
    }

    // Verificar que el estudiante no esté ya inscrito
    const existingEnrollment = await prisma.classEnrollment.findUnique({
      where: {
        studentId_classId: {
          studentId,
          classId: classData.id,
        },
      },
    })

    if (existingEnrollment) {
      throw new Error('Ya estás inscrito en esta clase')
    }

    // Verificar límite de estudiantes
    if (classData._count.enrollments >= classData.maxStudents) {
      throw new Error('La clase ha alcanzado el límite máximo de estudiantes')
    }

    // Crear la inscripción
    const enrollment = await prisma.classEnrollment.create({
      data: {
        studentId,
        classId: classData.id,
      },
      include: {
        class: {
          include: {
            teacher: {
              include: {
                user: true,
              },
            },
          },
        },
      },
    })

    return enrollment
  } catch (error) {
    console.error('Error al unirse a la clase:', error)
    throw error
  }
}

// ============================================================================
// FUNCIONES DE PERSONAJES
// ============================================================================

/**
 * Obtiene todos los tipos de personajes disponibles
 */
export async function getCharacterTypes() {
  try {
    const characterTypes = await prisma.characterType.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    })
    return characterTypes
  } catch (error) {
    console.error('Error al obtener tipos de personajes:', error)
    throw new Error('Error al obtener los tipos de personajes')
  }
}

/**
 * Crea un personaje para un estudiante en una clase específica
 */
export async function createStudentCharacter(characterData: CreateCharacterData): Promise<StudentCharacterWithDetails> {
  try {
    // Verificar que el estudiante esté inscrito en la clase
    const enrollment = await prisma.classEnrollment.findUnique({
      where: {
        studentId_classId: {
          studentId: characterData.studentId,
          classId: characterData.classId,
        },
      },
    })

    if (!enrollment) {
      throw new Error('El estudiante no está inscrito en esta clase')
    }

    // Verificar que no tenga ya un personaje en esta clase
    const existingCharacter = await prisma.studentCharacter.findUnique({
      where: {
        studentId_classId: {
          studentId: characterData.studentId,
          classId: characterData.classId,
        },
      },
    })

    if (existingCharacter) {
      throw new Error('Ya tienes un personaje creado en esta clase')
    }

    // Obtener información del tipo de personaje
    const characterType = await prisma.characterType.findUnique({
      where: { id: characterData.characterTypeId },
    })

    if (!characterType) {
      throw new Error('Tipo de personaje no válido')
    }

    // Crear el personaje
    const character = await prisma.studentCharacter.create({
      data: {
        studentId: characterData.studentId,
        classId: characterData.classId,
        characterTypeId: characterData.characterTypeId,
        characterName: characterData.characterName,
        currentHealth: characterType.baseHealth,
        maxHealth: characterType.baseHealth,
        currentLight: characterType.baseLight,
        maxLight: characterType.baseLight,
        avatarCustomization: characterData.avatarCustomization || {},
      },
      include: {
        student: {
          include: {
            user: true,
          },
        },
        class: {
          include: {
            teacher: {
              include: {
                user: true,
              },
            },
          },
        },
        characterType: true,
        powers: {
          include: {
            power: true,
          },
        },
        accessories: {
          include: {
            accessory: true,
          },
        },
      },
    })

    return character
  } catch (error) {
    console.error('Error al crear personaje:', error)
    throw error
  }
}

/**
 * Obtiene el personaje de un estudiante en una clase específica
 */
export async function getStudentCharacter(studentId: string, classId: string): Promise<StudentCharacterWithDetails | null> {
  try {
    const character = await prisma.studentCharacter.findUnique({
      where: {
        studentId_classId: {
          studentId,
          classId,
        },
      },
      include: {
        student: {
          include: {
            user: true,
          },
        },
        class: true,
        characterType: true,
        powers: {
          include: {
            power: true,
          },
        },
        accessories: {
          include: {
            accessory: true,
          },
        },
      },
    })

    return character
  } catch (error) {
    console.error('Error al obtener personaje del estudiante:', error)
    throw new Error('Error al obtener el personaje')
  }
}

// FUNCIONES DE UTILIDAD

/**
 * Genera un código único para profesor
 */
function generateTeacherCode(): string {
  const prefix = 'T'
  const timestamp = Date.now().toString().slice(-6)
  const random = Math.random().toString(36).substring(2, 5).toUpperCase()
  return `${prefix}${timestamp}${random}`
}

/**
 * Genera un código único para estudiante
 */
function generateStudentCode(): string {
  const prefix = 'S'
  const timestamp = Date.now().toString().slice(-6)
  const random = Math.random().toString(36).substring(2, 5).toUpperCase()
  return `${prefix}${timestamp}${random}`
}

/**
 * Genera un código único para clase (6 caracteres)
 */
function generateClassCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = ''
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}