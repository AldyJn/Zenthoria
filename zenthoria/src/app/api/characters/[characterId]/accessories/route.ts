// src/app/api/characters/[characterId]/accessories/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { prisma } from '@/lib/prisma'
import { ApiResponse, AccessoryType } from '@/types'

// GET - Obtener accesorios equipados del personaje
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

    // Obtener accesorios equipados organizados por slot
    const equippedAccessories = await prisma.studentAccessory.findMany({
      where: {
        studentCharacterId: characterId,
        isEquipped: true
      },
      include: {
        accessory: true
      }
    })

    // Obtener inventario de accesorios (no equipados)
    const inventoryAccessories = await prisma.studentAccessory.findMany({
      where: {
        studentCharacterId: characterId,
        isEquipped: false
      },
      include: {
        accessory: true
      },
      orderBy: [
        { accessory: { rarity: 'desc' } },
        { acquiredAt: 'desc' }
      ]
    })

    // Organizar por slots
    const accessorySlots = {
      helmet: equippedAccessories.find(a => a.slotType === 'helmet'),
      armor: equippedAccessories.find(a => a.slotType === 'armor'),
      weapon: equippedAccessories.find(a => a.slotType === 'weapon'),
      shader: equippedAccessories.find(a => a.slotType === 'shader'),
      emblem: equippedAccessories.find(a => a.slotType === 'emblem'),
      ghost: equippedAccessories.find(a => a.slotType === 'ghost')
    }

    // Calcular bonificaciones totales
    const totalStatBonuses = equippedAccessories.reduce((total, studentAccessory) => {
      const bonuses = studentAccessory.accessory.statBonuses as any || {}
      return {
        discipline: (total.discipline || 0) + (bonuses.discipline || 0),
        intellect: (total.intellect || 0) + (bonuses.intellect || 0),
        strength: (total.strength || 0) + (bonuses.strength || 0),
        charisma: (total.charisma || 0) + (bonuses.charisma || 0)
      }
    }, { discipline: 0, intellect: 0, strength: 0, charisma: 0 })

    return NextResponse.json<ApiResponse>({
      success: true,
      data: {
        character: {
          id: character.id,
          characterName: character.characterName,
          level: character.level,
          characterType: character.characterType
        },
        equippedAccessories: accessorySlots,
        inventory: inventoryAccessories,
        totalStatBonuses,
        slots: Object.keys(accessorySlots).map(slotType => ({
          type: slotType,
          equipped: !!accessorySlots[slotType as keyof typeof accessorySlots],
          accessory: accessorySlots[slotType as keyof typeof accessorySlots]
        }))
      }
    })

  } catch (error) {
    console.error('Error obteniendo accesorios del personaje:', error)
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Error interno del servidor'
    }, { status: 500 })
  }
}

// POST - Equipar accesorio en slot
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
    const { accessoryId, slotType } = body

    if (!accessoryId || !slotType) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'accessoryId y slotType son requeridos'
      }, { status: 400 })
    }

    // Verificar que es un tipo de slot válido
    const validSlotTypes = ['helmet', 'armor', 'weapon', 'shader', 'emblem', 'ghost']
    if (!validSlotTypes.includes(slotType)) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Tipo de slot inválido'
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

    // Verificar que el accesorio existe y pertenece al personaje
    const studentAccessory = await prisma.studentAccessory.findUnique({
      where: {
        studentCharacterId_accessoryId: {
          studentCharacterId: characterId,
          accessoryId: accessoryId
        }
      },
      include: {
        accessory: true
      }
    })

    if (!studentAccessory) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Accesorio no encontrado en tu inventario'
      }, { status: 404 })
    }

    // Verificar que el tipo de accesorio coincide con el slot
    if (studentAccessory.accessory.accessoryType !== slotType) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: `Este accesorio no se puede equipar en el slot ${slotType}`
      }, { status: 400 })
    }

    // Verificar requisitos de nivel
    if (character.level < studentAccessory.accessory.levelRequired) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: `Nivel ${studentAccessory.accessory.levelRequired} requerido para este accesorio`
      }, { status: 400 })
    }

    await prisma.$transaction(async (tx) => {
      // Desequipar accesorio existente en el slot si lo hay
      const existingAccessoryInSlot = await tx.studentAccessory.findFirst({
        where: {
          studentCharacterId: characterId,
          slotType: slotType as AccessoryType,
          isEquipped: true
        }
      })

      if (existingAccessoryInSlot) {
        await tx.studentAccessory.update({
          where: {
            studentCharacterId_accessoryId: {
              studentCharacterId: characterId,
              accessoryId: existingAccessoryInSlot.accessoryId
            }
          },
          data: {
            isEquipped: false
          }
        })
      }

      // Equipar el nuevo accesorio
      await tx.studentAccessory.update({
        where: {
          studentCharacterId_accessoryId: {
            studentCharacterId: characterId,
            accessoryId: accessoryId
          }
        },
        data: {
          isEquipped: true,
          slotType: slotType as AccessoryType
        }
      })

      // Aplicar bonificaciones de stats si las hay
      const statBonuses = studentAccessory.accessory.statBonuses as any || {}
      if (Object.keys(statBonuses).length > 0) {
        await tx.studentCharacter.update({
          where: { id: characterId },
          data: {
            discipline: { increment: statBonuses.discipline || 0 },
            intellect: { increment: statBonuses.intellect || 0 },
            strength: { increment: statBonuses.strength || 0 },
            charisma: { increment: statBonuses.charisma || 0 }
          }
        })
      }
    })

    return NextResponse.json<ApiResponse>({
      success: true,
      data: {
        message: 'Accesorio equipado exitosamente',
        accessory: studentAccessory.accessory,
        slot: slotType
      }
    })

  } catch (error) {
    console.error('Error equipando accesorio:', error)
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Error interno del servidor'
    }, { status: 500 })
  }
}

// PUT - Cambiar configuración de accesorios
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
    const { accessoryUpdates } = body // Array de { accessoryId, isEquipped, slotType }

    if (!Array.isArray(accessoryUpdates)) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'accessoryUpdates debe ser un array'
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

    // Procesar actualizaciones en transacción
    await prisma.$transaction(async (tx) => {
      for (const update of accessoryUpdates) {
        const { accessoryId, isEquipped, slotType } = update

        const updateData: any = {}
        if (isEquipped !== undefined) updateData.isEquipped = isEquipped
        if (slotType !== undefined) updateData.slotType = slotType

        await tx.studentAccessory.update({
          where: {
            studentCharacterId_accessoryId: {
              studentCharacterId: characterId,
              accessoryId: accessoryId
            }
          },
          data: updateData
        })
      }
    })

    return NextResponse.json<ApiResponse>({
      success: true,
      data: {
        message: 'Configuración de accesorios actualizada'
      }
    })

  } catch (error) {
    console.error('Error actualizando accesorios:', error)
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Error interno del servidor'
    }, { status: 500 })
  }
}