// src/app/api/characters/[characterId]/powers/[powerId]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { prisma } from '@/lib/prisma'
import { ApiResponse } from '@/types'

// DELETE - Desequipar poder específico
export async function DELETE(
  req: NextRequest,
  { params }: { params: { characterId: string; powerId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'No autorizado'
      }, { status: 401 })
    }

    const { characterId, powerId } = params

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

    // Verificar que el poder está equipado
    const studentPower = await prisma.studentPower.findUnique({
      where: {
        studentCharacterId_powerId: {
          studentCharacterId: characterId,
          powerId: powerId
        }
      },
      include: {
        power: true
      }
    })

    if (!studentPower) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Poder no encontrado o no equipado'
      }, { status: 404 })
    }

    // Desequipar el poder
    await prisma.studentPower.update({
      where: {
        studentCharacterId_powerId: {
          studentCharacterId: characterId,
          powerId: powerId
        }
      },
      data: {
        isEquipped: false,
        slotPosition: -1
      }
    })

    return NextResponse.json<ApiResponse>({
      success: true,
      data: {
        message: `Poder "${studentPower.power.name}" desequipado exitosamente`
      }
    })

  } catch (error) {
    console.error('Error desequipando poder:', error)
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Error interno del servidor'
    }, { status: 500 })
  }
}

// PUT - Actualizar configuración del poder
export async function PUT(
  req: NextRequest,
  { params }: { params: { characterId: string; powerId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'No autorizado'
      }, { status: 401 })
    }

    const { characterId, powerId } = params
    const body = await req.json()
    const { slotPosition, isEquipped } = body

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

    // Verificar que el poder existe para este personaje
    const studentPower = await prisma.studentPower.findUnique({
      where: {
        studentCharacterId_powerId: {
          studentCharacterId: characterId,
          powerId: powerId
        }
      },
      include: {
        power: true
      }
    })

    if (!studentPower) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Poder no encontrado'
      }, { status: 404 })
    }

    // Preparar datos de actualización
    const updateData: any = {}
    
    if (slotPosition !== undefined) {
      if (slotPosition < -1 || slotPosition > 3) {
        return NextResponse.json<ApiResponse>({
          success: false,
          error: 'slotPosition debe estar entre -1 y 3'
        }, { status: 400 })
      }
      updateData.slotPosition = slotPosition
    }

    if (isEquipped !== undefined) {
      updateData.isEquipped = isEquipped
      
      // Si se está equipando, verificar límite de slots
      if (isEquipped && slotPosition !== undefined && slotPosition >= 0) {
        const equippedCount = await prisma.studentPower.count({
          where: {
            studentCharacterId: characterId,
            isEquipped: true,
            NOT: {
              powerId: powerId
            }
          }
        })

        if (equippedCount >= 4) {
          return NextResponse.json<ApiResponse>({
            success: false,
            error: 'Ya tienes 4 poderes equipados. Desequipa uno primero.'
          }, { status: 400 })
        }

        // Verificar que el slot no esté ocupado
        const slotOccupied = await prisma.studentPower.findFirst({
          where: {
            studentCharacterId: characterId,
            slotPosition: slotPosition,
            isEquipped: true,
            NOT: {
              powerId: powerId
            }
          }
        })

        if (slotOccupied) {
          return NextResponse.json<ApiResponse>({
            success: false,
            error: `El slot ${slotPosition} ya está ocupado`
          }, { status: 400 })
        }
      }
    }

    // Actualizar el poder
    const updatedPower = await prisma.studentPower.update({
      where: {
        studentCharacterId_powerId: {
          studentCharacterId: characterId,
          powerId: powerId
        }
      },
      data: updateData,
      include: {
        power: true
      }
    })

    return NextResponse.json<ApiResponse>({
      success: true,
      data: {
        message: 'Configuración del poder actualizada',
        studentPower: updatedPower
      }
    })

  } catch (error) {
    console.error('Error actualizando configuración del poder:', error)
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Error interno del servidor'
    }, { status: 500 })
  }
}

// GET - Obtener información detallada del poder específico
export async function GET(
  req: NextRequest,
  { params }: { params: { characterId: string; powerId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'No autorizado'
      }, { status: 401 })
    }

    const { characterId, powerId } = params

    // Verificar que el personaje existe y pertenece al usuario
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

    // Obtener información del poder
    const studentPower = await prisma.studentPower.findUnique({
      where: {
        studentCharacterId_powerId: {
          studentCharacterId: characterId,
          powerId: powerId
        }
      },
      include: {
        power: {
          include: {
            characterType: true
          }
        }
      }
    })

    if (!studentPower) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Poder no encontrado para este personaje'
      }, { status: 404 })
    }

    // Calcular información de cooldown
    const now = new Date()
    const lastUsed = new Date(character.updatedAt) // Simplificado
    const cooldownMs = studentPower.power.cooldownMinutes * 60 * 1000
    const timeSinceLastUse = now.getTime() - lastUsed.getTime()
    const remainingCooldown = Math.max(0, cooldownMs - timeSinceLastUse)

    const powerDetails = {
      ...studentPower,
      cooldownRemaining: remainingCooldown,
      isOnCooldown: remainingCooldown > 0,
      canUse: character.currentLight >= studentPower.power.lightCost && remainingCooldown === 0,
      usageStats: {
        timesUsed: 0, // Esto vendría de una tabla de estadísticas
        lastUsed: lastUsed,
        totalDamageDealt: 0, // Estadísticas de uso
        averageEffectiveness: 0
      }
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      data: {
        power: powerDetails,
        character: {
          id: character.id,
          characterName: character.characterName,
          level: character.level,
          currentLight: character.currentLight,
          maxLight: character.maxLight
        }
      }
    })

  } catch (error) {
    console.error('Error obteniendo detalles del poder:', error)
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Error interno del servidor'
    }, { status: 500 })
  }
}