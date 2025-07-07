// src/app/api/characters/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { createStudentCharacter } from '@/lib/utils/db-helpers'
import { prisma } from '@/lib/db'
import { z } from 'zod'

const createCharacterSchema = z.object({
  classId: z.string().uuid('ID de clase inválido'),
  characterTypeId: z.string().uuid('ID de tipo de personaje inválido'),
  characterName: z.string()
    .min(1, 'El nombre del personaje es requerido')
    .max(50, 'El nombre es demasiado largo')
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ0-9\s\-_]+$/, 'El nombre contiene caracteres no válidos'),
  avatarCustomization: z.record(z.any()).optional()
})

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.studentId) {
      return NextResponse.json(
        { success: false, error: 'Solo los estudiantes pueden ver personajes' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const classId = searchParams.get('classId')

    const whereClause: any = {
      studentId: session.user.studentId
    }

    // Si se especifica una clase, filtrar por ella
    if (classId) {
      whereClause.classId = classId
    }

    // Obtener personajes del estudiante
    const characters = await prisma.studentCharacter.findMany({
      where: whereClause,
      include: {
        class: {
          include: {
            teacher: {
              include: {
                user: true
              }
            }
          }
        },
        characterType: true,
        powers: {
          include: {
            power: true
          }
        },
        accessories: {
          include: {
            accessory: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Formatear la respuesta
    const formattedCharacters = characters.map(character => ({
      id: character.id,
      characterName: character.characterName,
      level: character.level,
      experiencePoints: character.experiencePoints,
      health: {
        current: character.currentHealth,
        max: character.maxHealth
      },
      light: {
        current: character.currentLight,
        max: character.maxLight
      },
      stats: {
        discipline: character.discipline,
        intellect: character.intellect,
        strength: character.strength,
        charisma: character.charisma
      },
      characterType: character.characterType,
      class: {
        id: character.class.id,
        name: character.class.name,
        teacher: `${character.class.teacher.user.firstName} ${character.class.teacher.user.lastName}`
      },
      avatarCustomization: character.avatarCustomization,
      createdAt: character.createdAt,
      // Calcular progreso al siguiente nivel
      nextLevelExperience: calculateNextLevelExperience(character.level),
      progressToNextLevel: calculateLevelProgress(character.experiencePoints, character.level)
    }))

    return NextResponse.json({
      success: true,
      data: formattedCharacters,
      message: 'Personajes obtenidos exitosamente'
    })

  } catch (error) {
    console.error('Error al obtener personajes:', error)
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.studentId) {
      return NextResponse.json(
        { success: false, error: 'Solo los estudiantes pueden crear personajes' },
        { status: 401 }
      )
    }

    const body = await request.json()
    
    // Validar datos de entrada
    const validationResult = createCharacterSchema.safeParse(body)
    
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Datos inválidos',
          details: validationResult.error.errors 
        },
        { status: 400 }
      )
    }

    const characterData = {
      studentId: session.user.studentId,
      ...validationResult.data
    }

    try {
      // Crear el personaje
      const newCharacter = await createStudentCharacter(characterData)

      return NextResponse.json({
        success: true,
        data: newCharacter,
        message: `Personaje "${newCharacter.characterName}" creado exitosamente`
      }, { status: 201 })

    } catch (createError) {
      console.error('Error al crear personaje:', createError)
      
      if (createError instanceof Error) {
        let statusCode = 400
        let errorMessage = createError.message

        if (errorMessage.includes('no está inscrito')) {
          statusCode = 403
          errorMessage = 'Debes estar inscrito en la clase para crear un personaje'
        } else if (errorMessage.includes('ya tienes un personaje')) {
          statusCode = 409
          errorMessage = 'Ya tienes un personaje creado en esta clase'
        } else if (errorMessage.includes('no válido')) {
          statusCode = 400
          errorMessage = 'Tipo de personaje no válido'
        }

        return NextResponse.json(
          { success: false, error: errorMessage },
          { status: statusCode }
        )
      }

      return NextResponse.json(
        { success: false, error: 'Error al crear el personaje' },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('Error en create character:', error)
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// Función helper para calcular experiencia requerida para el siguiente nivel
function calculateNextLevelExperience(currentLevel: number): number {
  // Fórmula: nivel * 100 + (nivel - 1) * 50
  const nextLevel = currentLevel + 1
  return nextLevel * 100 + (nextLevel - 1) * 50
}

// Función helper para calcular progreso al siguiente nivel
function calculateLevelProgress(currentExp: number, currentLevel: number): number {
  const currentLevelExp = currentLevel * 100 + (currentLevel - 1) * 50
  const nextLevelExp = calculateNextLevelExperience(currentLevel)
  const expInCurrentLevel = currentExp - currentLevelExp
  const expNeededForLevel = nextLevelExp - currentLevelExp
  
  return Math.max(0, Math.min(100, (expInCurrentLevel / expNeededForLevel) * 100))
}