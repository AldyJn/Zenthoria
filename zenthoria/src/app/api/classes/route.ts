// src/app/api/classes/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { createClass, getClassesByTeacher } from '@/lib/utils/db-helpers'
import { z } from 'zod'

const createClassSchema = z.object({
  name: z.string().min(1, 'El nombre de la clase es requerido').max(100, 'El nombre es demasiado largo'),
  description: z.string().max(500, 'La descripción es demasiado larga').optional(),
  startDate: z.string().refine((date) => !isNaN(Date.parse(date)), 'Fecha de inicio inválida'),
  endDate: z.string().refine((date) => !isNaN(Date.parse(date)), 'Fecha de fin inválida'),
  maxStudents: z.number().min(1, 'Mínimo 1 estudiante').max(100, 'Máximo 100 estudiantes').optional()
}).refine((data) => {
  const start = new Date(data.startDate)
  const end = new Date(data.endDate)
  return start < end
}, {
  message: 'La fecha de inicio debe ser anterior a la fecha de fin',
  path: ['endDate']
})

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.teacherId) {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 401 }
      )
    }

    const classes = await getClassesByTeacher(session.user.teacherId)

    return NextResponse.json({
      success: true,
      data: classes,
      message: 'Clases obtenidas exitosamente'
    })

  } catch (error) {
    console.error('Error al obtener clases:', error)
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.teacherId) {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 401 }
      )
    }

    const body = await request.json()
    
    // Validar datos de entrada
    const validationResult = createClassSchema.safeParse(body)
    
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

    const classData = {
      teacherId: session.user.teacherId,
      ...validationResult.data
    }

    // Crear la clase
    const newClass = await createClass(classData)

    return NextResponse.json({
      success: true,
      data: newClass,
      message: 'Clase creada exitosamente'
    }, { status: 201 })

  } catch (error) {
    console.error('Error al crear clase:', error)
    
    if (error instanceof Error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}