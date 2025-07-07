// src/app/api/characters/types/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { getCharacterTypes } from '@/lib/utils/db-helpers'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 401 }
      )
    }

    // Obtener todos los tipos de personajes disponibles
    const characterTypes = await getCharacterTypes()

    // Formatear la respuesta con información adicional
    const formattedTypes = characterTypes.map(type => ({
      id: type.id,
      name: type.name,
      description: type.description,
      baseHealth: type.baseHealth,
      baseLight: type.baseLight,
      specialAbility: type.specialAbility,
      imageUrl: type.imageUrl,
      // Información adicional para la UI
      stats: {
        health: type.baseHealth,
        light: type.baseLight,
        // Calcular stats relativos para comparación
        healthRating: type.baseHealth === 150 ? 'Alto' : type.baseHealth === 120 ? 'Medio' : 'Bajo',
        lightRating: type.baseLight === 150 ? 'Alto' : type.baseLight === 120 ? 'Medio' : 'Bajo'
      },
      // Descripción del estilo de juego
      playStyle: getPlayStyleDescription(type.name),
      // Ventajas del tipo de personaje
      advantages: getTypeAdvantages(type.name)
    }))

    return NextResponse.json({
      success: true,
      data: formattedTypes,
      message: 'Tipos de personajes obtenidos exitosamente'
    })

  } catch (error) {
    console.error('Error al obtener tipos de personajes:', error)
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// Función helper para obtener descripción del estilo de juego
function getPlayStyleDescription(typeName: string): string {
  switch (typeName.toLowerCase()) {
    case 'hunter':
      return 'Ágil y preciso. Ideal para ataques rápidos y movilidad superior.'
    case 'titan':
      return 'Tanque resistente. Perfecto para liderar y proteger al equipo.'
    case 'warlock':
      return 'Maestro de la Luz. Excelente para habilidades mágicas y support.'
    default:
      return 'Estilo de juego único y versátil.'
  }
}

// Función helper para obtener ventajas del tipo
function getTypeAdvantages(typeName: string): string[] {
  switch (typeName.toLowerCase()) {
    case 'hunter':
      return [
        'Mayor movilidad en combate',
        'Regeneración de Light más rápida',
        'Habilidades de precisión mejoradas'
      ]
    case 'titan':
      return [
        'Mayor resistencia al daño',
        'Habilidades de protección grupal',
        'Capacidad de liderazgo aumentada'
      ]
    case 'warlock':
      return [
        'Poder mágico superior',
        'Habilidades de sanación',
        'Buff grupal de experiencia'
      ]
    default:
      return ['Habilidades balanceadas', 'Versatilidad en combate']
  }
}