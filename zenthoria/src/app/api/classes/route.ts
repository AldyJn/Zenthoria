// src/app/api/classes/route.ts - Versión corregida para estudiantes
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { prisma } from '@/lib/prisma'
// import { Class } from '@prisma/client'
import { z } from 'zod'

const createClassSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  description: z.string().optional(),
  startDate: z.string(),
  endDate: z.string(),
  maxStudents: z.number().min(1).max(100)
})

// GET - Obtener clases según el rol del usuario
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
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''

    let classes: any[] = []

    if (session.user.role === 'teacher' && session.user.teacherId) {
      // PROFESORES: Ver sus propias clases
      classes = await prisma.class.findMany({
        where: {
          teacherId: session.user.teacherId,
          ...(search && {
            OR: [
              { name: { contains: search, mode: 'insensitive' } },
              { description: { contains: search, mode: 'insensitive' } }
            ]
          })
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
                  user: true
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
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit
      })
    } else if (session.user.role === 'student' && session.user.studentId) {
      // ESTUDIANTES: Ver clases en las que están inscritos
      const enrollments = await prisma.classEnrollment.findMany({
        where: {
          studentId: session.user.studentId,
          isActive: true
        },
        include: {
          class: {
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
                      user: true
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
          }
        },
        orderBy: { enrolledAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit
      })

      // Filtrar por búsqueda si existe
      classes = enrollments
        .map(enrollment => enrollment.class)
        .filter(cls => {
          if (!search) return true
          return cls.name.toLowerCase().includes(search.toLowerCase()) ||
                 cls.description?.toLowerCase().includes(search.toLowerCase())
        })
    }

    // Contar total para paginación
    let totalClasses = 0
    if (session.user.role === 'teacher' && session.user.teacherId) {
      totalClasses = await prisma.class.count({
        where: { 
          teacherId: session.user.teacherId,
          ...(search && {
            OR: [
              { name: { contains: search, mode: 'insensitive' } },
              { description: { contains: search, mode: 'insensitive' } }
            ]
          })
        }
      })
    } else if (session.user.role === 'student' && session.user.studentId) {
      totalClasses = await prisma.classEnrollment.count({
        where: {
          studentId: session.user.studentId,
          isActive: true
        }
      })
    }

    return NextResponse.json({
      success: true,
      data: {
        classes,
        pagination: {
          page,
          limit,
          total: totalClasses,
          totalPages: Math.ceil(totalClasses / limit)
        }
      },
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

// POST - Crear nueva clase (solo profesores)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.teacherId) {
      return NextResponse.json(
        { success: false, error: 'Solo los profesores pueden crear clases' },
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

    const { name, description, startDate, endDate, maxStudents } = validationResult.data

    // Generar código único para la clase
    const classCode = await generateUniqueClassCode()

    // Crear la clase
    const newClass = await prisma.class.create({
      data: {
        name,
        description,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        maxStudents,
        classCode,
        teacherId: session.user.teacherId
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
      data: newClass,
      message: 'Clase creada exitosamente'
    }, { status: 201 })

  } catch (error) {
    console.error('Error al crear clase:', error)
    
    if (error instanceof Error && error.message.includes('Unique constraint')) {
      return NextResponse.json(
        { success: false, error: 'Ya existe una clase con ese nombre' },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// Función auxiliar para generar código único
async function generateUniqueClassCode(): Promise<string> {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let code: string
  let isUnique = false

  do {
    code = ''
    for (let i = 0; i < 6; i++) {
      code += characters.charAt(Math.floor(Math.random() * characters.length))
    }

    const existingClass = await prisma.class.findUnique({
      where: { classCode: code }
    })

    isUnique = !existingClass
  } while (!isUnique)

  return code
}