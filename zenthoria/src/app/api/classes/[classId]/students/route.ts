// src/app/api/classes/[classId]/students/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { prisma } from '@/lib/prisma'

interface RouteParams {
  params: { classId: string }
}

// GET - Obtener estudiantes de una clase (solo profesores)
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.teacherId) {
      return NextResponse.json(
        { success: false, error: 'Solo los profesores pueden ver la lista de estudiantes' },
        { status: 401 }
      )
    }

    const { classId } = params

    // Verificar que la clase pertenece al profesor
    const classDetails = await prisma.class.findUnique({
      where: { id: classId },
      select: { teacherId: true }
    })

    if (!classDetails || classDetails.teacherId !== session.user.teacherId) {
      return NextResponse.json(
        { success: false, error: 'No tienes permisos para ver los estudiantes de esta clase' },
        { status: 403 }
      )
    }

    // Obtener todos los estudiantes inscritos en la clase
    const enrollments = await prisma.classEnrollment.findMany({
      where: {
        classId: classId,
        isActive: true
      },
      include: {
        student: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true
              }
            },
            characters: {
              where: {
                classId: classId
              },
              include: {
                characterType: true
              }
            }
          }
        }
      },
      orderBy: {
        enrolledAt: 'asc'
      }
    })

    // Transformar los datos para el frontend
    const students = enrollments.map(enrollment => {
      const student = enrollment.student
      const character = student.characters[0] // Un estudiante tiene un personaje por clase

      return {
        id: student.id,
        userId: student.user.id,
        firstName: student.user.firstName,
        lastName: student.user.lastName,
        email: student.user.email,
        enrolledAt: enrollment.enrolledAt,
        hasCharacter: !!character,
        character: character ? {
          id: character.id,
          characterName: character.characterName,
          level: character.level,
          experience: character.experiencePoints,
          currentHealth: character.currentHealth,
          maxHealth: character.maxHealth,
          characterType: {
            id: character.characterType.id,
            name: character.characterType.name,
            imageUrl: character.characterType.imageUrl
          },
          createdAt: character.createdAt
        } : null
      }
    })

    return NextResponse.json({
      success: true,
      data: students,
      message: 'Estudiantes obtenidos exitosamente',
      meta: {
        total: students.length,
        hasCharacters: students.filter(s => s.hasCharacter).length
      }
    })

  } catch (error) {
    console.error('Error al obtener estudiantes de la clase:', error)
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}