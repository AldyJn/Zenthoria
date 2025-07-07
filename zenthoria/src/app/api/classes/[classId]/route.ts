// src/app/api/classes/[classId]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { prisma } from '@/lib/db'
import { z } from 'zod'

const updateClassSchema = z.object({
  name: z.string().min(1, 'El nombre de la clase es requerido').max(100, 'El nombre es demasiado largo').optional(),
  description: z.string().max(500, 'La descripción es demasiado larga').optional(),
  startDate: z.string().refine((date) => !isNaN(Date.parse(date)), 'Fecha de inicio inválida').optional(),
  endDate: z.string().refine((date) => !isNaN(Date.parse(date)), 'Fecha de fin inválida').optional(),
  maxStudents: z.number().min(1, 'Mínimo 1 estudiante').max(100, 'Máximo 100 estudiantes').optional()
})

interface RouteParams {
  params: {
    classId: string
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

    // Obtener detalles de la clase
    const classDetails = await prisma.class.findUnique({
      where: { 
        id: classId,
        isActive: true
      },
      include: {
        teacher: {
          include: {
            user: true
          }
        },
        enrollments: {
          where: { isActive: true },
          include: {
            student: {
              include: {
                user: true,
                characters: {
                  where: { classId },
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
        },
        _count: {
          select: {
            enrollments: true,
            characters: true
          }
        }
      }
    })

    if (!classDetails) {
      return NextResponse.json(
        { success: false, error: 'Clase no encontrada' },
        { status: 404 }
      )
    }

    // Verificar permisos (profesor propietario o estudiante inscrito)
    const isTeacher = session.user.teacherId === classDetails.teacherId
    const isEnrolledStudent = session.user.studentId && 
      classDetails.enrollments.some(enrollment => enrollment.studentId === session.user.studentId)

    if (!isTeacher && !isEnrolledStudent) {
      return NextResponse.json(
        { success: false, error: 'No tienes permisos para ver esta clase' },
        { status: 403 }
      )
    }

    return NextResponse.json({
      success: true,
      data: classDetails,
      message: 'Detalles de clase obtenidos exitosamente'
    })

  } catch (error) {
    console.error('Error al obtener detalles de clase:', error)
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.teacherId) {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 401 }
      )
    }

    const classId = params.classId
    const body = await request.json()

    // Validar datos de entrada
    const validationResult = updateClassSchema.safeParse(body)
    
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

    // Verificar que el profesor es propietario de la clase
    const existingClass = await prisma.class.findFirst({
      where: {
        id: classId,
        teacherId: session.user.teacherId,
        isActive: true
      }
    })

    if (!existingClass) {
      return NextResponse.json(
        { success: false, error: 'Clase no encontrada o no tienes permisos' },
        { status: 404 }
      )
    }

    const updateData = validationResult.data

    // Validar fechas si se proporcionan ambas
    if (updateData.startDate && updateData.endDate) {
      const start = new Date(updateData.startDate)
      const end = new Date(updateData.endDate)
      
      if (start >= end) {
        return NextResponse.json(
          { success: false, error: 'La fecha de inicio debe ser anterior a la fecha de fin' },
          { status: 400 }
        )
      }
    }

    // Actualizar la clase
    const updatedClass = await prisma.class.update({
      where: { id: classId },
      data: {
        ...updateData,
        ...(updateData.startDate && { startDate: new Date(updateData.startDate) }),
        ...(updateData.endDate && { endDate: new Date(updateData.endDate) }),
        updatedAt: new Date()
      },
      include: {
        teacher: {
          include: {
            user: true
          }
        },
        _count: {
          select: {
            enrollments: true,
            characters: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: updatedClass,
      message: 'Clase actualizada exitosamente'
    })

  } catch (error) {
    console.error('Error al actualizar clase:', error)
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.teacherId) {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 401 }
      )
    }

    const classId = params.classId

    // Verificar que el profesor es propietario de la clase
    const existingClass = await prisma.class.findFirst({
      where: {
        id: classId,
        teacherId: session.user.teacherId,
        isActive: true
      }
    })

    if (!existingClass) {
      return NextResponse.json(
        { success: false, error: 'Clase no encontrada o no tienes permisos' },
        { status: 404 }
      )
    }

    // Soft delete - marcar como inactiva
    await prisma.class.update({
      where: { id: classId },
      data: {
        isActive: false,
        updatedAt: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Clase eliminada exitosamente'
    })

  } catch (error) {
    console.error('Error al eliminar clase:', error)
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}