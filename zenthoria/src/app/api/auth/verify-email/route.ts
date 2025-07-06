import { NextRequest, NextResponse } from 'next/server'
import { emailVerificationSchema } from '@/lib/validations/auth'
import { getUserByEmail } from '@/lib/utils/db-helpers'
import { detectUserRole, getEmailDisplayInfo } from '@/lib/auth/validation'
import { ApiResponse } from '@/types'

export async function POST(request: NextRequest) {
  try {
    // Parsear JSON del body
    const body = await request.json()
    console.log('🔍 Verificando disponibilidad del email:', body.email)

    // Validar formato del email
    const validationResult = emailVerificationSchema.safeParse(body)
    
    if (!validationResult.success) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Email inválido',
        message: validationResult.error.errors.map(err => err.message).join(', ')
      }, { status: 400 })
    }

    const { email } = validationResult.data

    // Verificar si el email ya está registrado
    const existingUser = await getUserByEmail(email)
    
    if (existingUser) {
      console.log('❌ Email ya registrado:', email)
      
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Email no disponible',
        message: 'Este email ya está registrado. Intente iniciar sesión.'
      }, { status: 409 })
    }

    // Obtener información del email para respuesta
    const emailInfo = getEmailDisplayInfo(email)
    
    if (!emailInfo.isValid) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Formato de email inválido',
        message: 'Use el formato: inicial+apellido@example.com (profesores) o nombre.apellido@example.com (estudiantes)'
      }, { status: 400 })
    }

    console.log('✅ Email disponible para:', emailInfo.role)

    // Email disponible - devolver información del rol detectado
    return NextResponse.json<ApiResponse>({
      success: true,
      message: 'Email disponible',
      data: {
        email,
        isAvailable: true,
        detectedRole: emailInfo.role,
        displayName: emailInfo.displayName,
        roleLabel: emailInfo.role === 'teacher' ? 'Profesor' : 'Estudiante'
      }
    }, { status: 200 })

  } catch (error) {
    console.error('❌ Error verificando email:', error)

    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Error interno del servidor',
      message: 'No se pudo verificar el email. Intente nuevamente.'
    }, { status: 500 })
  }
}

// Método GET para verificar email via query params (alternativo)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')

    if (!email) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Email requerido',
        message: 'Debe proporcionar un email para verificar'
      }, { status: 400 })
    }

    // Reusar la lógica del POST
    return await POST(new NextRequest(request.url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    }))

  } catch (error) {
    console.error('❌ Error en GET verify-email:', error)
    
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Error interno del servidor',
      message: 'No se pudo verificar el email'
    }, { status: 500 })
  }
}