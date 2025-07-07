// src/app/api/powers/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { prisma } from '@/lib/db'
import { Element, PowerType } from '@prisma/client'

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
    const element = searchParams.get('element') as Element | null
    const powerType = searchParams.get('type') as PowerType | null
    const characterTypeId = searchParams.get('characterTypeId')
    const levelRequired = searchParams.get('levelRequired')

    // Construir filtros dinámicos
    let whereClause: any = {
      isActive: true
    }

    if (element && Object.values(Element).includes(element)) {
      whereClause.element = element
    }

    if (powerType && Object.values(PowerType).includes(powerType)) {
      whereClause.powerType = powerType
    }

    if (characterTypeId) {
      whereClause.characterTypeId = characterTypeId
    }

    if (levelRequired) {
      const level = parseInt(levelRequired)
      if (!isNaN(level)) {
        whereClause.levelRequired = {
          lte: level
        }
      }
    }

    // Obtener poderes con filtros aplicados
    const powers = await prisma.power.findMany({
      where: whereClause,
      include: {
        characterType: true
      },
      orderBy: [
        { levelRequired: 'asc' },
        { name: 'asc' }
      ]
    })

    // Formatear la respuesta con información adicional
    const formattedPowers = powers.map(power => ({
      id: power.id,
      name: power.name,
      description: power.description,
      powerType: power.powerType,
      element: power.element,
      lightCost: power.lightCost,
      cooldownMinutes: power.cooldownMinutes,
      levelRequired: power.levelRequired,
      effects: power.effects,
      imageUrl: power.imageUrl,
      characterType: power.characterType ? {
        id: power.characterType.id,
        name: power.characterType.name
      } : null,
      // Información adicional para la UI
      elementInfo: getElementInfo(power.element),
      typeInfo: getPowerTypeInfo(power.powerType),
      rarity: calculatePowerRarity(power.levelRequired, power.lightCost),
      isUniversal: !power.characterTypeId // Si no tiene characterTypeId, es universal
    }))

    // Agrupar por elemento si no se especifica filtro
    const groupedByElement = element ? formattedPowers : {
      solar: formattedPowers.filter(p => p.element === Element.solar),
      arc: formattedPowers.filter(p => p.element === Element.arc),
      void: formattedPowers.filter(p => p.element === Element.void),
      stasis: formattedPowers.filter(p => p.element === Element.stasis)
    }

    return NextResponse.json({
      success: true,
      data: element ? formattedPowers : groupedByElement,
      meta: {
        total: formattedPowers.length,
        filters: {
          element,
          powerType,
          characterTypeId,
          levelRequired
        }
      },
      message: 'Poderes obtenidos exitosamente'
    })

  } catch (error) {
    console.error('Error al obtener poderes:', error)
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// Función helper para obtener información del elemento
function getElementInfo(element: Element) {
  const elementData = {
    [Element.solar]: {
      color: 'from-orange-500 to-red-600',
      description: 'Elemento del fuego y la luz solar',
      effects: ['Daño sobre tiempo', 'Regeneración', 'Explosiones']
    },
    [Element.arc]: {
      color: 'from-blue-500 to-cyan-600',
      description: 'Elemento eléctrico y de energía',
      effects: ['Cadenas eléctricas', 'Velocidad', 'Daño instantáneo']
    },
    [Element.void]: {
      color: 'from-purple-500 to-gray-600',
      description: 'Elemento de la oscuridad y vacío',
      effects: ['Debuffs', 'Control de multitudes', 'Absorción']
    },
    [Element.stasis]: {
      color: 'from-cyan-400 to-blue-500',
      description: 'Elemento del hielo y cristalización',
      effects: ['Congelamiento', 'Fragmentación', 'Control de área']
    }
  }

  return elementData[element] || {
    color: 'from-gray-500 to-gray-600',
    description: 'Elemento desconocido',
    effects: []
  }
}

// Función helper para obtener información del tipo de poder
function getPowerTypeInfo(type: PowerType) {
  const typeData = {
    [PowerType.grenade]: {
      icon: '💣',
      description: 'Proyectil explosivo lanzable',
      usage: 'Ataque de área'
    },
    [PowerType.melee]: {
      icon: '👊',
      description: 'Ataque cuerpo a cuerpo',
      usage: 'Combate cercano'
    },
    [PowerType.super]: {
      icon: '⚡',
      description: 'Habilidad definitiva más poderosa',
      usage: 'Momento crítico'
    },
    [PowerType.class_ability]: {
      icon: '🎯',
      description: 'Habilidad única de clase',
      usage: 'Soporte y utilidad'
    }
  }

  return typeData[type] || {
    icon: '❓',
    description: 'Tipo de poder desconocido',
    usage: 'Uso variado'
  }
}

// Función helper para calcular rareza del poder
function calculatePowerRarity(levelRequired: number, lightCost: number): string {
  const totalCost = levelRequired + (lightCost / 10)
  
  if (totalCost <= 5) return 'common'
  if (totalCost <= 10) return 'uncommon'
  if (totalCost <= 15) return 'rare'
  if (totalCost <= 20) return 'legendary'
  return 'exotic'
}