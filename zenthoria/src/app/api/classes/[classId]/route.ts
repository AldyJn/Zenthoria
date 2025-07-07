// src/app/api/classes/[classId]/route.ts 
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

interface RouteParams {
  params: { classId: string }
}

const updateClassSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  maxStudents: z.number().min(1).max(100).optional(),
  isActive: z.boolean().optional()
})

// GET - Obtener detalles de una clase específica
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
      where: { id: classId },
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
        enrollments: {
          where: { isActive: true },
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
                  where: { classId: classId },
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

    // Verificar permisos mejorado
    let hasAccess = false
    let userRole = 'viewer'

    if (session.user.role === 'teacher' && session.user.teacherId === classDetails.teacherId) {
      hasAccess = true
      userRole = 'teacher'
    } else if (session.user.role === 'student' && session.user.studentId) {
      // Verificar si el estudiante está inscrito en la clase
      const enrollment = classDetails.enrollments.find(
        enrollment => enrollment.studentId === session.user.studentId
      )
      if (enrollment) {
        hasAccess = true
        userRole = 'student'
      }
    }

    if (!hasAccess) {
      return NextResponse.json(
        { success: false, error: 'No tienes permisos para ver esta clase' },
        { status: 403 }
      )
    }

    // Preparar respuesta según el rol
    let responseData = {
      ...classDetails,
      userRole,
      canEdit: userRole === 'teacher',
      canManageStudents: userRole === 'teacher'
    }

    // Para estudiantes, filtrar información sensible si es necesario
    if (userRole === 'student') {
      // Los estudiantes pueden ver toda la información básica de la clase
      // pero tal vez no información administrativa específica
    }

    return NextResponse.json({
      success: true,
      data: responseData,
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

// PUT - Actualizar clase (solo profesores propietarios)
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.teacherId) {
      return NextResponse.json(
        { success: false, error: 'Solo los profesores pueden actualizar clases' },
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

    // Verificar que la clase existe y pertenece al profesor
    const existingClass = await prisma.class.findUnique({
      where: { id: classId }
    })

    if (!existingClass) {
      return NextResponse.json(
        { success: false, error: 'Clase no encontrada' },
        { status: 404 }
      )
    }

    if (existingClass.teacherId !== session.user.teacherId) {
      return NextResponse.json(
        { success: false, error: 'No tienes permisos para actualizar esta clase' },
        { status: 403 }
      )
    }

    const updateData = validationResult.data

    // Convertir fechas si están presentes
    const processedData: any = { ...updateData }
    if (updateData.startDate) {
      processedData.startDate = new Date(updateData.startDate)
    }
    if (updateData.endDate) {
      processedData.endDate = new Date(updateData.endDate)
    }

    // Actualizar la clase
    const updatedClass = await prisma.class.update({
      where: { id: classId },
      data: processedData,
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

// DELETE - Eliminar clase (solo profesores propietarios)
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.teacherId) {
      return NextResponse.json(
        { success: false, error: 'Solo los profesores pueden eliminar clases' },
        { status: 401 }
      )
    }

    const classId = params.classId

    // Verificar que la clase existe y pertenece al profesor
    const existingClass = await prisma.class.findUnique({
      where: { id: classId },
      include: {
        _count: {
          select: {
            enrollments: true,
            characters: true
          }
        }
      }
    })

    if (!existingClass) {
      return NextResponse.json(
        { success: false, error: 'Clase no encontrada' },
        { status: 404 }
      )
    }

    if (existingClass.teacherId !== session.user.teacherId) {
      return NextResponse.json(
        { success: false, error: 'No tienes permisos para eliminar esta clase' },
        { status: 403 }
      )
    }

    // Verificar si hay estudiantes inscritos
    if (existingClass._count.enrollments > 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'No se puede eliminar una clase con estudiantes inscritos. Primero desactívala.' 
        },
        { status: 409 }
      )
    }

    // Eliminar la clase (esto eliminará en cascada las inscripciones y personajes)
    await prisma.class.delete({
      where: { id: classId }
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