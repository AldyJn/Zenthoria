import { NextRequest, NextResponse } from 'next/server'
import { registerSchema, validateAndProcessRegistration } from '@/lib/validations/auth'
import { createUser, getUserByEmail } from '@/lib/utils/db-helpers'
import { ApiResponse } from '@/types'
import { ZodError } from 'zod'

export async function POST(request: NextRequest) {
  try {
    // Parsear JSON del body
    const body = await request.json()
    console.log('📝 Solicitud de registro recibida para:', body.email)

    // Validar datos con Zod
    const validationResult = registerSchema.safeParse(body)
    
    if (!validationResult.success) {
      console.log('❌ Errores de validación:', validationResult.error.errors)
      
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Datos de registro inválidos',
        message: validationResult.error.errors.map(err => err.message).join(', ')
      }, { status: 400 })
    }

    // Procesar y extraer información automática
    const processedData = validateAndProcessRegistration(validationResult.data)
    console.log('✅ Datos procesados para rol:', processedData.role)

    // Verificar que el email no esté ya registrado
    const existingUser = await getUserByEmail(processedData.email)
    
    if (existingUser) {
      console.log('❌ Usuario ya existe:', processedData.email)
      
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'El email ya está registrado',
        message: 'Ya existe una cuenta con este email. Intente iniciar sesión o use otro email.'
      }, { status: 409 })
    }

    // Crear usuario usando el helper existente
    const newUser = await createUser(processedData)
    console.log('🎉 Usuario creado exitosamente:', newUser.email, newUser.role)

    // Respuesta exitosa (sin incluir datos sensibles)
    return NextResponse.json<ApiResponse>({
      success: true,
      message: 'Cuenta creada exitosamente',
      data: {
        id: newUser.id,
        email: newUser.email,
        role: newUser.role,
        name: `${newUser.firstName} ${newUser.lastName}`,
        teacherId: newUser.teacher?.id || null,
        studentId: newUser.student?.id || null
      }
    }, { status: 201 })

  } catch (error) {
    console.error('❌ Error en registro:', error)

    // Error de validación de Zod
    if (error instanceof ZodError) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Datos inválidos',
        message: error.errors.map(err => err.message).join(', ')
      }, { status: 400 })
    }

    // Error de base de datos o helper
    if (error instanceof Error) {
      // No exponer detalles del error en producción
      const isDevelopment = process.env.NODE_ENV === 'development'
      
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Error interno del servidor',
        message: isDevelopment ? error.message : 'No se pudo crear la cuenta. Intente nuevamente.'
      }, { status: 500 })
    }

    // Error genérico
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Error interno del servidor',
      message: 'No se pudo procesar la solicitud. Intente nuevamente.'
    }, { status: 500 })
  }
}

// Método OPTIONS para CORS (si es necesario)
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}