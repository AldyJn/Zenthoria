// src/app/api/classes/[classId]/random-select/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { prisma } from '@/lib/db'
import { SelectionType, SelectionMethod } from '@prisma/client'
import { z } from 'zod'

const randomSelectSchema = z.object({
  selectionType: z.nativeEnum(SelectionType).default(SelectionType.random_student),
  selectionMethod: z.nativeEnum(SelectionMethod).default(SelectionMethod.wheel),
  experienceReward: z.number().min(0).max(100).default(10),
  lightReward: z.number().min(0).max(50).default(5)
})

interface RouteParams {
  params: {
    classId: string
  }
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.teacherId) {
      return NextResponse.json(
        { success: false, error: 'Solo los profesores pueden realizar selecciones aleatorias' },
        { status: 401 }
      )
    }

    const classId = params.classId
    const body = await request.json()

    // Validar datos de entrada
    const validationResult = randomSelectSchema.safeParse(body)
    
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

    const { selectionType, selectionMethod, experienceReward, lightReward } = validationResult.data

    // Verificar que el profesor es propietario de la clase
    const classData = await prisma.class.findFirst({
      where: {
        id: classId,
        teacherId: session.user.teacherId,
        isActive: true
      },
      include: {
        characters: {
          include: {
            student: {
              include: {
                user: true
              }
            },
            characterType: true
          }
        }
      }
    })

    if (!classData) {
      return NextResponse.json(
        { success: false, error: 'Clase no encontrada o no tienes permisos' },
        { status: 404 }
      )
    }

    if (classData.characters.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No hay estudiantes con personajes en esta clase' },
        { status: 400 }
      )
    }

    // Obtener selecciones recientes para evitar repetir
    const recentSelections = await prisma.randomSelection.findMany({
      where: {
        classId,
        selectedAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Últimas 24 horas
        }
      },
      orderBy: {
        selectedAt: 'desc'
      },
      take: 3,
      select: {
        studentCharacterId: true
      }
    })

    const recentlySelectedIds = recentSelections.map(s => s.studentCharacterId)

    // Filtrar estudiantes para evitar repetir consecutivamente
    const availableCharacters = classData.characters.filter(character => 
      !recentlySelectedIds.includes(character.id)
    )

    // Si todos fueron seleccionados recientemente, usar todos
    const charactersPool = availableCharacters.length > 0 ? availableCharacters : classData.characters

    // Algoritmo de selección inteligente con ponderación
    const selectedCharacter = selectRandomCharacterWeighted(charactersPool, recentSelections.length)

    // Crear registro de selección
    const randomSelection = await prisma.randomSelection.create({
      data: {
        classId,
        teacherId: session.user.teacherId,
        studentCharacterId: selectedCharacter.id,
        selectionType,
        selectionMethod,
        experienceAwarded: experienceReward,
        lightAwarded: lightReward,
        result: `${selectedCharacter.student.user.firstName} ${selectedCharacter.student.user.lastName} (${selectedCharacter.characterName})`
      },
      include: {
        studentCharacter: {
          include: {
            student: {
              include: {
                user: true
              }
            },
            characterType: true
          }
        }
      }
    })

    // Otorgar recompensas al personaje seleccionado
    await prisma.studentCharacter.update({
      where: { id: selectedCharacter.id },
      data: {
        experiencePoints: {
          increment: experienceReward
        },
        currentLight: {
          increment: lightReward
        },
        // Asegurar que no exceda el máximo
        ...(selectedCharacter.currentLight + lightReward > selectedCharacter.maxLight && {
          currentLight: selectedCharacter.maxLight
        })
      }
    })

    // Formatear respuesta
    const response = {
      selection: {
        id: randomSelection.id,
        student: {
          id: selectedCharacter.student.id,
          name: `${selectedCharacter.student.user.firstName} ${selectedCharacter.student.user.lastName}`,
          character: {
            id: selectedCharacter.id,
            name: selectedCharacter.characterName,
            type: selectedCharacter.characterType.name,
            level: selectedCharacter.level
          }
        },
        rewards: {
          experience: experienceReward,
          light: lightReward
        },
        method: selectionMethod,
        timestamp: randomSelection.selectedAt
      },
      classInfo: {
        totalStudents: classData.characters.length,
        availableForSelection: charactersPool.length,
        recentSelections: recentlySelectedIds.length
      }
    }

    return NextResponse.json({
      success: true,
      data: response,
      message: `¡${selectedCharacter.student.user.firstName} ha sido seleccionado!`
    })

  } catch (error) {
    console.error('Error en selección aleatoria:', error)
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 401 }
      )
    }

    const classId = params.classId
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '10')
    const page = parseInt(searchParams.get('page') || '1')

    // Verificar acceso a la clase
    const hasAccess = await verifyClassAccess(classId, session.user)
    
    if (!hasAccess) {
      return NextResponse.json(
        { success: false, error: 'No tienes acceso a esta clase' },
        { status: 403 }
      )
    }

    // Obtener historial de selecciones
    const selections = await prisma.randomSelection.findMany({
      where: { classId },
      include: {
        studentCharacter: {
          include: {
            student: {
              include: {
                user: true
              }
            },
            characterType: true
          }
        }
      },
      orderBy: {
        selectedAt: 'desc'
      },
      take: limit,
      skip: (page - 1) * limit
    })

    // Contar total para paginación
    const totalSelections = await prisma.randomSelection.count({
      where: { classId }
    })

    // Formatear respuesta
    const formattedSelections = selections.map(selection => ({
      id: selection.id,
      student: {
        name: `${selection.studentCharacter.student.user.firstName} ${selection.studentCharacter.student.user.lastName}`,
        character: {
          name: selection.studentCharacter.characterName,
          type: selection.studentCharacter.characterType.name
        }
      },
      selectionType: selection.selectionType,
      selectionMethod: selection.selectionMethod,
      rewards: {
        experience: selection.experienceAwarded,
        light: selection.lightAwarded
      },
      selectedAt: selection.selectedAt,
      resolvedAt: selection.resolvedAt
    }))

    return NextResponse.json({
      success: true,
      data: {
        selections: formattedSelections,
        pagination: {
          page,
          limit,
          total: totalSelections,
          totalPages: Math.ceil(totalSelections / limit)
        }
      },
      message: 'Historial de selecciones obtenido exitosamente'
    })

  } catch (error) {
    console.error('Error al obtener historial:', error)
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// Función helper para selección ponderada
function selectRandomCharacterWeighted(characters: any[], recentCount: number): any {
  // Asignar pesos basados en participación reciente
  const weighted = characters.map(character => ({
    character,
    weight: 1 + (recentCount > 0 ? 0.5 : 0) // Más peso si no ha participado recientemente
  }))

  // Calcular peso total
  const totalWeight = weighted.reduce((sum, item) => sum + item.weight, 0)
  
  // Selección aleatoria ponderada
  let random = Math.random() * totalWeight
  
  for (const item of weighted) {
    random -= item.weight
    if (random <= 0) {
      return item.character
    }
  }
  
  // Fallback
  return characters[Math.floor(Math.random() * characters.length)]
}

// Función helper para verificar acceso a la clase
async function verifyClassAccess(classId: string, user: any): Promise<boolean> {
  if (user.teacherId) {
    // Verificar si es el profesor de la clase
    const teacherClass = await prisma.class.findFirst({
      where: {
        id: classId,
        teacherId: user.teacherId
      }
    })
    return !!teacherClass
  }

  if (user.studentId) {
    // Verificar si es estudiante inscrito
    const enrollment = await prisma.classEnrollment.findFirst({
      where: {
        classId,
        studentId: user.studentId,
        isActive: true
      }
    })
    return !!enrollment
  }

  return false
}