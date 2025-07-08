// src/app/api/students/[studentId]/classes/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { prisma } from '@/lib/prisma'

interface RouteParams {
  params: { studentId: string }
}

// GET - Obtener las clases en las que está inscrito un estudiante
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 401 }
      )
    }

    const { studentId } = params

    // Verificar que el usuario es un estudiante y está viendo sus propias clases
    if (session.user.role !== 'student' || session.user.studentId !== studentId) {
      return NextResponse.json(
        { success: false, error: 'No tienes permisos para ver estas clases' },
        { status: 403 }
      )
    }

    // Obtener todas las inscripciones activas del estudiante
    const enrollments = await prisma.classEnrollment.findMany({
      where: {
        studentId: studentId,
        isActive: true
      },
      include: {
        class: {
          include: {
            teacher: {
              include: {
                user: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    email: true
                  }
                }
              }
            },
            _count: {
              select: {
                enrollments: true,
                characters: true
              }
            },
            // Incluir el personaje del estudiante en cada clase
            characters: {
              where: {
                studentId: studentId
              },
              include: {
                characterType: true
              }
            }
          }
        }
      },
      orderBy: {
        enrolledAt: 'desc'
      }
    })

    // Transformar los datos para incluir información útil
    const classes = enrollments.map(enrollment => {
      const classData = enrollment.class
      const myCharacter = classData.characters[0] || null

      return {
        ...classData,
        enrolledAt: enrollment.enrolledAt,
        hasCharacter: !!myCharacter,
        myCharacter: myCharacter ? {
          id: myCharacter.id,
          name: myCharacter.characterName,
          level: myCharacter.level,
          experience: myCharacter.experiencePoints,
          characterType: myCharacter.characterType
        } : null
      }
    })

    return NextResponse.json({
      success: true,
      data: classes,
      message: 'Clases obtenidas exitosamente'
    })

  } catch (error) {
    console.error('Error al obtener clases del estudiante:', error)
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}