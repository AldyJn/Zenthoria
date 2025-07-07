// src/app/api/classes/join/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { joinClassByCode } from '@/lib/utils/db-helpers'
import { z } from 'zod'

const joinClassSchema = z.object({
  classCode: z.string()
    .min(6, 'El código debe tener 6 caracteres')
    .max(6, 'El código debe tener 6 caracteres')
    .regex(/^[A-Z0-9]{6}$/, 'El código debe contener solo letras mayúsculas y números')
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.studentId) {
      return NextResponse.json(
        { success: false, error: 'Solo los estudiantes pueden unirse a clases' },
        { status: 401 }
      )
    }

    const body = await request.json()
    
    // Validar datos de entrada
    const validationResult = joinClassSchema.safeParse(body)
    
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Código de clase inválido',
          details: validationResult.error.errors 
        },
        { status: 400 }
      )
    }

    const { classCode } = validationResult.data

    try {
      // Intentar unirse a la clase
      const enrollment = await joinClassByCode(session.user.studentId, classCode)

      return NextResponse.json({
        success: true,
        data: {
          enrollment,
          class: enrollment.class,
          message: `Te has unido exitosamente a la clase "${enrollment.class.name}"`
        },
        message: 'Te has unido a la clase exitosamente'
      }, { status: 201 })

    } catch (joinError) {
      console.error('Error al unirse a la clase:', joinError)
      
      // Manejar errores específicos
      if (joinError instanceof Error) {
        let statusCode = 400
        let errorMessage = joinError.message

        if (errorMessage.includes('inválido') || errorMessage.includes('no encontrada')) {
          statusCode = 404
          errorMessage = 'Código de clase inválido o clase no encontrada'
        } else if (errorMessage.includes('ya estás inscrito')) {
          statusCode = 409
          errorMessage = 'Ya estás inscrito en esta clase'
        } else if (errorMessage.includes('límite máximo')) {
          statusCode = 409
          errorMessage = 'La clase ha alcanzado el límite máximo de estudiantes'
        }

        return NextResponse.json(
          { success: false, error: errorMessage },
          { status: statusCode }
        )
      }

      return NextResponse.json(
        { success: false, error: 'Error al unirse a la clase' },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('Error en join class:', error)
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// GET para verificar un código de clase (opcional)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.studentId) {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const classCode = searchParams.get('classCode')

    if (!classCode) {
      return NextResponse.json(
        { success: false, error: 'Código de clase requerido' },
        { status: 400 }
      )
    }

    // Validar formato del código
    const validationResult = joinClassSchema.safeParse({ classCode })
    
    if (!validationResult.success) {
      return NextResponse.json(
        { success: false, error: 'Formato de código inválido' },
        { status: 400 }
      )
    }

    // Buscar la clase sin unirse
    const { getClassByCode } = await import('@/lib/utils/db-helpers')
    
    try {
      const classData = await getClassByCode(classCode)
      
      if (!classData) {
        return NextResponse.json(
          { success: false, error: 'Código de clase inválido' },
          { status: 404 }
        )
      }

      // Verificar si ya está inscrito
      const isAlreadyEnrolled = classData.enrollments.some(
        enrollment => enrollment.studentId === session.user.studentId
      )

      return NextResponse.json({
        success: true,
        data: {
          id: classData.id,
          name: classData.name,
          description: classData.description,
          teacher: {
            name: `${classData.teacher.user.firstName} ${classData.teacher.user.lastName}`
          },
          enrollmentCount: classData._count.enrollments,
          maxStudents: classData.maxStudents,
          isAlreadyEnrolled,
          canJoin: !isAlreadyEnrolled && classData._count.enrollments < classData.maxStudents
        },
        message: 'Información de clase obtenida'
      })

    } catch (searchError) {
      return NextResponse.json(
        { success: false, error: 'Código de clase inválido' },
        { status: 404 }
      )
    }

  } catch (error) {
    console.error('Error al verificar código de clase:', error)
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}