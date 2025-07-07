// src/app/api/accessories/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { prisma } from '@/lib/db'
import { AccessoryType, Rarity } from '@prisma/client'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const accessoryType = searchParams.get('type') as AccessoryType | null
    const rarity = searchParams.get('rarity') as Rarity | null
    const levelRequired = searchParams.get('levelRequired')
    const maxCost = searchParams.get('maxCost')

    // Construir filtros dinámicos
    const whereClause: any = {
      isActive: true
    }

    if (accessoryType && Object.values(AccessoryType).includes(accessoryType)) {
      whereClause.accessoryType = accessoryType
    }

    if (rarity && Object.values(Rarity).includes(rarity)) {
      whereClause.rarity = rarity
    }

    if (levelRequired) {
      const level = parseInt(levelRequired)
      if (!isNaN(level)) {
        whereClause.levelRequired = {
          lte: level
        }
      }
    }

    if (maxCost) {
      const cost = parseInt(maxCost)
      if (!isNaN(cost)) {
        whereClause.cost = {
          lte: cost
        }
      }
    }

    // Obtener accesorios con filtros aplicados
    const accessories = await prisma.accessory.findMany({
      where: whereClause,
      orderBy: [
        { rarity: 'asc' },
        { levelRequired: 'asc' },
        { name: 'asc' }
      ]
    })

    // Formatear la respuesta con información adicional
    const formattedAccessories = accessories.map(accessory => ({
      id: accessory.id,
      name: accessory.name,
      description: accessory.description,
      accessoryType: accessory.accessoryType,
      rarity: accessory.rarity,
      levelRequired: accessory.levelRequired,
      cost: accessory.cost,
      visualEffects: accessory.visualEffects,
      statBonuses: accessory.statBonuses,
      imageUrl: accessory.imageUrl,
      // Información adicional para la UI
      typeInfo: getAccessoryTypeInfo(accessory.accessoryType),
      rarityInfo: getRarityInfo(accessory.rarity),
      bonusesFormatted: formatStatBonuses(accessory.statBonuses)
    }))

    // Agrupar por tipo si no se especifica filtro
    const groupedByType = accessoryType ? formattedAccessories : {
      helmet: formattedAccessories.filter(a => a.accessoryType === AccessoryType.helmet),
      armor: formattedAccessories.filter(a => a.accessoryType === AccessoryType.armor),
      weapon: formattedAccessories.filter(a => a.accessoryType === AccessoryType.weapon),
      shader: formattedAccessories.filter(a => a.accessoryType === AccessoryType.shader),
      emblem: formattedAccessories.filter(a => a.accessoryType === AccessoryType.emblem),
      ghost: formattedAccessories.filter(a => a.accessoryType === AccessoryType.ghost)
    }

    return NextResponse.json({
      success: true,
      data: accessoryType ? formattedAccessories : groupedByType,
      meta: {
        total: formattedAccessories.length,
        filters: {
          accessoryType,
          rarity,
          levelRequired,
          maxCost
        },
        rarityDistribution: getRarityDistribution(formattedAccessories)
      },
      message: 'Accesorios obtenidos exitosamente'
    })

  } catch (error) {
    console.error('Error al obtener accesorios:', error)
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// Función helper para obtener información del tipo de accesorio
function getAccessoryTypeInfo(type: AccessoryType) {
  const typeData = {
    [AccessoryType.helmet]: {
      icon: '🪖',
      description: 'Protección para la cabeza',
      slot: 'head',
      primaryStats: ['discipline', 'intellect']
    },
    [AccessoryType.armor]: {
      icon: '🛡️',
      description: 'Armadura corporal',
      slot: 'body',
      primaryStats: ['strength', 'charisma']
    },
    [AccessoryType.weapon]: {
      icon: '⚔️',
      description: 'Arma principal',
      slot: 'weapon',
      primaryStats: ['strength', 'discipline']
    },
    [AccessoryType.shader]: {
      icon: '🎨',
      description: 'Modificador visual',
      slot: 'visual',
      primaryStats: ['charisma']
    },
    [AccessoryType.emblem]: {
      icon: '🏆',
      description: 'Insignia de logros',
      slot: 'cosmetic',
      primaryStats: ['charisma', 'intellect']
    },
    [AccessoryType.ghost]: {
      icon: '👻',
      description: 'Compañero espiritual',
      slot: 'companion',
      primaryStats: ['intellect', 'light_regen']
    }
  }

  return typeData[type] || {
    icon: '❓',
    description: 'Tipo de accesorio desconocido',
    slot: 'unknown',
    primaryStats: []
  }
}

// Función helper para obtener información de rareza
function getRarityInfo(rarity: Rarity) {
  const rarityData = {
    [Rarity.common]: {
      color: 'from-gray-400 to-gray-500',
      textColor: 'text-gray-500',
      borderColor: 'border-gray-400',
      description: 'Objeto común',
      dropChance: '60%'
    },
    [Rarity.uncommon]: {
      color: 'from-green-400 to-green-500',
      textColor: 'text-green-500',
      borderColor: 'border-green-400',
      description: 'Objeto poco común',
      dropChance: '25%'
    },
    [Rarity.rare]: {
      color: 'from-blue-400 to-blue-500',
      textColor: 'text-blue-500',
      borderColor: 'border-blue-400',
      description: 'Objeto raro',
      dropChance: '10%'
    },
    [Rarity.legendary]: {
      color: 'from-purple-400 to-purple-500',
      textColor: 'text-purple-500',
      borderColor: 'border-purple-400',
      description: 'Objeto legendario',
      dropChance: '4%'
    },
    [Rarity.exotic]: {
      color: 'from-yellow-400 to-orange-500',
      textColor: 'text-yellow-500',
      borderColor: 'border-yellow-400',
      description: 'Objeto exótico',
      dropChance: '1%'
    }
  }

  return rarityData[rarity] || {
    color: 'from-gray-400 to-gray-500',
    textColor: 'text-gray-500',
    borderColor: 'border-gray-400',
    description: 'Rareza desconocida',
    dropChance: '0%'
  }
}

// Función helper para formatear bonuses de stats
function formatStatBonuses(statBonuses: any): Array<{stat: string, bonus: number, description: string}> {
  if (!statBonuses || typeof statBonuses !== 'object') return []

  const statDescriptions = {
    discipline: 'Reduce cooldown de granadas',
    intellect: 'Reduce cooldown de super',
    strength: 'Reduce cooldown de melee',
    charisma: 'Mejora interacciones sociales',
    health: 'Aumenta puntos de vida',
    light: 'Aumenta puntos de luz',
    experience_bonus: 'Bonus de experiencia'
  }

  return Object.entries(statBonuses).map(([stat, bonus]) => ({
    stat,
    bonus: Number(bonus) || 0,
    description: statDescriptions[stat as keyof typeof statDescriptions] || `Mejora ${stat}`
  }))
}

// Función helper para obtener distribución de rarezas
function getRarityDistribution(accessories: any[]): Record<string, number> {
  const distribution: Record<string, number> = {}
  
  accessories.forEach(accessory => {
    const rarity = accessory.rarity
    distribution[rarity] = (distribution[rarity] || 0) + 1
  })

  return distribution
}