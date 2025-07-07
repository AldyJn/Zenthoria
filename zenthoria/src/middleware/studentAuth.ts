// src/middleware/studentAuth.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'

export async function verifyStudent(request: NextRequest) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.studentId) {
    return NextResponse.json(
      { success: false, error: 'No autorizado - Se requiere rol de estudiante' },
      { status: 401 }
    )
  }
  
  return null // Continuar con la request
}