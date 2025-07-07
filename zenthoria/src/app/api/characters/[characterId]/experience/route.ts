// src/app/api/characters/[characterId]/experience/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { prisma } from '@/lib/prisma'
import { ApiResponse } from '@/types'

// Fórmula de experiencia requerida por nivel
const getExperienceForLevel = (level: number): number => {
  return Math.floor(100 * Math.pow(1.5, level - 1))
}

// Calcular nivel basado en experiencia total
const calculateLevel = (totalExperience: number): number => {
  let level = 1
  let experienceNeeded = 0
  
  while (experienceNeeded <= totalExperience) {
    experienceNeeded += getExperienceForLevel(level)
    if (experienceNeeded <= totalExperience) {
      level++
    }
  }
  
  return level
}

// POST - Otorgar experiencia por actividad
export async function POST(
  req: NextRequest,
  { params }: { params: { characterId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'No autorizado'
      }, { status: 401 })
    }

    const { characterId } = params
    const body = await req.json()
    const { amount, reason, activityType = 'general' } = body

    if (!amount || amount <= 0) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Cantidad de experiencia debe ser mayor a 0'
      }, { status: 400 })
    }

    if (amount > 1000) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Cantidad máxima de experiencia por actividad: 1000'
      }, { status: 400 })
    }

    // Verificar que el personaje existe
    const character = await prisma.studentCharacter.findUnique({
      where: { id: characterId },
      include: {
        student: {
          include: {
            user: true
          }
        },
        class: {
          include: {
            teacher: {
              include: {
                user: true
              }
            }
          }
        }
      }
    })

    if (!character) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Personaje no encontrado'
      }, { status: 404 })
    }

    // Verificar permisos (solo el profesor de la clase puede otorgar XP)
    const isTeacher = character.class.teacher.user.id === session.user.id
    const isOwner = character.student.user.id === session.user.id && activityType === 'self_study'

    if (!isTeacher && !isOwner) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Solo el profesor de la clase puede otorgar experiencia'
      }, { status: 403 })
    }

    const currentLevel = character.level
    const currentExperience = character.experiencePoints
    const newExperience = currentExperience + amount
    const newLevel = calculateLevel(newExperience)
    
    // Calcular si hubo level up
    const leveledUp = newLevel > currentLevel
    const levelsGained = newLevel - currentLevel

    // Calcular recompensas por level up
    let lightBonus = 0
    let statBonuses = { discipline: 0, intellect: 0, strength: 0, charisma: 0 }
    
    if (leveledUp) {
      // +10 luz por cada nivel ganado
      lightBonus = levelsGained * 10
      
      // Bonus de stats cada 5 niveles
      for (let i = currentLevel + 1; i <= newLevel; i++) {
        if (i % 5 === 0) {
          statBonuses.discipline += 1
          statBonuses.intellect += 1
          statBonuses.strength += 1
          statBonuses.charisma += 1
        }
      }
    }

    // Actualizar personaje en transacción
    const updatedCharacter = await prisma.$transaction(async (tx) => {
      // Actualizar experiencia y nivel
      const updated = await tx.studentCharacter.update({
        where: { id: characterId },
        data: {
          experiencePoints: newExperience,
          level: newLevel,
          maxLight: character.maxLight + lightBonus,
          currentLight: Math.min(character.currentLight + lightBonus, character.maxLight + lightBonus),
          discipline: character.discipline + statBonuses.discipline,
          intellect: character.intellect + statBonuses.intellect,
          strength: character.strength + statBonuses.strength,
          charisma: character.charisma + statBonuses.charisma
        },
        include: {
          student: {
            include: {
              user: true
            }
          },
          characterType: true
        }
      })

      // Registrar la actividad de experiencia (opcional - para historial)
      // Esto requeriría una tabla adicional de logs de experiencia
      
      return updated
    })

    return NextResponse.json<ApiResponse>({
      success: true,
      data: {
        character: updatedCharacter,
        experienceGained: amount,
        reason: reason || 'Actividad completada',
        levelUp: leveledUp ? {
          previousLevel: currentLevel,
          newLevel: newLevel,
          levelsGained: levelsGained,
          rewards: {
            lightBonus: lightBonus,
            statBonuses: statBonuses
          }
        } : null,
        progression: {
          currentExperience: newExperience,
          experienceForNextLevel: getExperienceForLevel(newLevel + 1),
          progressToNextLevel: newExperience - (newExperience - getExperienceForLevel(newLevel)),
          percentageToNextLevel: Math.floor(
            ((newExperience - (newExperience - getExperienceForLevel(newLevel))) / getExperienceForLevel(newLevel + 1)) * 100
          )
        }
      }
    })

  } catch (error) {
    console.error('Error otorgando experiencia:', error)
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Error interno del servidor'
    }, { status: 500 })
  }
}

// GET - Obtener historial de experiencia ganada
export async function GET(
  req: NextRequest,
  { params }: { params: { characterId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'No autorizado'
      }, { status: 401 })
    }

    const { characterId } = params
    const { searchParams } = new URL(req.url)
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Verificar que el personaje existe y pertenece al usuario
    const character = await prisma.studentCharacter.findUnique({
      where: { id: characterId },
      include: {
        student: {
          include: {
            user: true
          }
        },
        class: {
          include: {
            teacher: {
              include: {
                user: true
              }
            }
          }
        }
      }
    })

    if (!character) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Personaje no encontrado'
      }, { status: 404 })
    }

    // Verificar permisos
    const isOwner = character.student.user.id === session.user.id
    const isTeacher = character.class.teacher.user.id === session.user.id

    if (!isOwner && !isTeacher) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Sin permisos para ver este personaje'
      }, { status: 403 })
    }

    // Obtener historial de selecciones aleatorias (que otorgan experiencia)
    const experienceHistory = await prisma.randomSelection.findMany({
      where: {
        studentCharacterId: characterId,
        experienceAwarded: {
          gt: 0
        }
      },
      include: {
        teacher: {
          include: {
            user: true
          }
        }
      },
      orderBy: {
        selectedAt: 'desc'
      },
      take: limit,
      skip: offset
    })

    // Calcular estadísticas de experiencia
    const totalExperienceFromSelections = experienceHistory.reduce(
      (sum, selection) => sum + selection.experienceAwarded, 
      0
    )

    const experienceByType = experienceHistory.reduce((acc, selection) => {
      const type = selection.selectionType
      acc[type] = (acc[type] || 0) + selection.experienceAwarded
      return acc
    }, {} as Record<string, number>)

    // Calcular progresión actual
    const currentExperience = character.experiencePoints
    const currentLevel = character.level
    const experienceForCurrentLevel = getExperienceForLevel(currentLevel)
    const experienceForNextLevel = getExperienceForLevel(currentLevel + 1)
    const progressInCurrentLevel = currentExperience - (currentExperience - experienceForCurrentLevel)
    const percentageToNextLevel = Math.floor((progressInCurrentLevel / experienceForNextLevel) * 100)

    return NextResponse.json<ApiResponse>({
      success: true,
      data: {
        character: {
          id: character.id,
          characterName: character.characterName,
          level: character.level,
          experiencePoints: character.experiencePoints
        },
        progression: {
          currentLevel: currentLevel,
          currentExperience: currentExperience,
          experienceForNextLevel: experienceForNextLevel,
          progressToNextLevel: progressInCurrentLevel,
          percentageToNextLevel: percentageToNextLevel,
          experienceNeededForNextLevel: experienceForNextLevel - progressInCurrentLevel
        },
        history: experienceHistory.map(selection => ({
          id: selection.id,
          experienceGained: selection.experienceAwarded,
          reason: `Selección: ${selection.selectionType}`,
          activityType: selection.selectionType,
          awardedBy: `${selection.teacher.user.firstName} ${selection.teacher.user.lastName}`,
          timestamp: selection.selectedAt,
          additionalRewards: {
            lightAwarded: selection.lightAwarded
          }
        })),
        statistics: {
          totalExperienceFromSelections,
          experienceByType,
          averageExperiencePerActivity: experienceHistory.length > 0 
            ? Math.round(totalExperienceFromSelections / experienceHistory.length)
            : 0,
          totalActivities: experienceHistory.length,
          lastActivityDate: experienceHistory[0]?.selectedAt || null
        }
      }
    })

  } catch (error) {
    console.error('Error obteniendo historial de experiencia:', error)
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Error interno del servidor'
    }, { status: 500 })
  }
}