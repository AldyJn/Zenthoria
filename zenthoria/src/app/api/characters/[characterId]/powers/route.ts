// src/app/api/characters/[characterId]/powers/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { prisma } from '@/lib/prisma'
import { ApiResponse } from '@/types'

// GET - Obtener poderes equipados del personaje
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

    // Verificar que el personaje existe y pertenece al usuario
    const character = await prisma.studentCharacter.findUnique({
      where: { id: characterId },
      include: {
        student: {
          include: {
            user: true
          }
        },
        characterType: true
      }
    })

    if (!character) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Personaje no encontrado'
      }, { status: 404 })
    }

    // Verificar permisos (estudiante dueño o profesor de la clase)
    const isOwner = character.student.user.id === session.user.id
    let isTeacher = false

    if (!isOwner) {
      const classInfo = await prisma.class.findUnique({
        where: { id: character.classId },
        include: {
          teacher: {
            include: {
              user: true
            }
          }
        }
      })
      isTeacher = classInfo?.teacher.user.id === session.user.id
    }

    if (!isOwner && !isTeacher) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Sin permisos para ver este personaje'
      }, { status: 403 })
    }

    // Obtener poderes equipados con cooldowns
    const equippedPowers = await prisma.studentPower.findMany({
      where: {
        studentCharacterId: characterId,
        isEquipped: true
      },
      include: {
        power: {
          include: {
            characterType: true
          }
        }
      },
      orderBy: {
        slotPosition: 'asc'
      }
    })

    // Calcular cooldowns en tiempo real
    const powersWithCooldowns = equippedPowers.map(studentPower => {
      const now = new Date()
      const lastUsed = new Date(character.updatedAt) // Simplificado, en producción sería lastUsedAt
      const cooldownMs = studentPower.power.cooldownMinutes * 60 * 1000
      const timeSinceLastUse = now.getTime() - lastUsed.getTime()
      const remainingCooldown = Math.max(0, cooldownMs - timeSinceLastUse)

      return {
        ...studentPower,
        cooldownRemaining: remainingCooldown,
        isOnCooldown: remainingCooldown > 0,
        canUse: character.currentLight >= studentPower.power.lightCost && remainingCooldown === 0
      }
    })

    return NextResponse.json<ApiResponse>({
      success: true,
      data: {
        character: {
          id: character.id,
          characterName: character.characterName,
          level: character.level,
          currentLight: character.currentLight,
          maxLight: character.maxLight,
          characterType: character.characterType
        },
        equippedPowers: powersWithCooldowns,
        availableSlots: 4 - equippedPowers.length
      }
    })

  } catch (error) {
    console.error('Error obteniendo poderes del personaje:', error)
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Error interno del servidor'
    }, { status: 500 })
  }
}

// POST - Equipar poder en slot específico
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
    const { powerId, slotPosition } = body

    if (!powerId || slotPosition === undefined) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'powerId y slotPosition son requeridos'
      }, { status: 400 })
    }

    if (slotPosition < 0 || slotPosition > 3) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'slotPosition debe estar entre 0 y 3'
      }, { status: 400 })
    }

    // Verificar que el personaje pertenece al usuario
    const character = await prisma.studentCharacter.findUnique({
      where: { id: characterId },
      include: {
        student: {
          include: {
            user: true
          }
        },
        characterType: true
      }
    })

    if (!character || character.student.user.id !== session.user.id) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Personaje no encontrado o sin permisos'
      }, { status: 404 })
    }

    // Verificar que el poder existe y es compatible
    const power = await prisma.power.findUnique({
      where: { id: powerId }
    })

    if (!power) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Poder no encontrado'
      }, { status: 404 })
    }

    // Verificar requisitos
    if (character.level < power.levelRequired) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: `Nivel ${power.levelRequired} requerido para este poder`
      }, { status: 400 })
    }

    if (power.characterTypeId && power.characterTypeId !== character.characterTypeId) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Este poder no es compatible con tu tipo de personaje'
      }, { status: 400 })
    }

    // Verificar que no haya conflictos en el slot
    const existingPowerInSlot = await prisma.studentPower.findFirst({
      where: {
        studentCharacterId: characterId,
        slotPosition: slotPosition,
        isEquipped: true
      }
    })

    await prisma.$transaction(async (tx) => {
      // Desequipar poder existente en el slot si lo hay
      if (existingPowerInSlot) {
        await tx.studentPower.update({
          where: {
            studentCharacterId_powerId: {
              studentCharacterId: characterId,
              powerId: existingPowerInSlot.powerId
            }
          },
          data: {
            isEquipped: false,
            slotPosition: -1
          }
        })
      }

      // Desequipar el poder si ya estaba equipado en otro slot
      const existingPower = await tx.studentPower.findUnique({
        where: {
          studentCharacterId_powerId: {
            studentCharacterId: characterId,
            powerId: powerId
          }
        }
      })

      if (existingPower) {
        await tx.studentPower.update({
          where: {
            studentCharacterId_powerId: {
              studentCharacterId: characterId,
              powerId: powerId
            }
          },
          data: {
            isEquipped: true,
            slotPosition: slotPosition
          }
        })
      } else {
        // Crear nueva relación
        await tx.studentPower.create({
          data: {
            studentCharacterId: characterId,
            powerId: powerId,
            slotPosition: slotPosition,
            isEquipped: true
          }
        })
      }
    })

    return NextResponse.json<ApiResponse>({
      success: true,
      data: {
        message: 'Poder equipado exitosamente',
        slot: slotPosition,
        power: power
      }
    })

  } catch (error) {
    console.error('Error equipando poder:', error)
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Error interno del servidor'
    }, { status: 500 })
  }
}

// PUT - Reordenar poderes equipados
export async function PUT(
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
    const { powerOrder } = body // Array de { powerId, slotPosition }

    if (!Array.isArray(powerOrder)) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'powerOrder debe ser un array'
      }, { status: 400 })
    }

    // Verificar que el personaje pertenece al usuario
    const character = await prisma.studentCharacter.findUnique({
      where: { id: characterId },
      include: {
        student: {
          include: {
            user: true
          }
        }
      }
    })

    if (!character || character.student.user.id !== session.user.id) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Personaje no encontrado o sin permisos'
      }, { status: 404 })
    }

    // Actualizar posiciones en transacción
    await prisma.$transaction(async (tx) => {
      for (const { powerId, slotPosition } of powerOrder) {
        await tx.studentPower.update({
          where: {
            studentCharacterId_powerId: {
              studentCharacterId: characterId,
              powerId: powerId
            }
          },
          data: {
            slotPosition: slotPosition
          }
        })
      }
    })

    return NextResponse.json<ApiResponse>({
      success: true,
      data: {
        message: 'Poderes reordenados exitosamente'
      }
    })

  } catch (error) {
    console.error('Error reordenando poderes:', error)
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Error interno del servidor'
    }, { status: 500 })
  }
}