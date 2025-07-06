import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const { pathname } = req.nextUrl

    console.log('🛡️ Middleware - Ruta:', pathname, 'Usuario:', token?.email, 'Rol:', token?.role)

    // Si hay token, verificar roles específicos
    if (token) {
      const userRole = token.role

      // Redirigir usuarios autenticados lejos de páginas de auth
      if (pathname.startsWith('/auth/') && pathname !== '/auth/logout') {
        console.log('🔄 Redirigiendo usuario autenticado al dashboard')
        
        const dashboardUrl = userRole === 'teacher' 
          ? '/teacher/dashboard' 
          : '/student/dashboard'
        
        return NextResponse.redirect(new URL(dashboardUrl, req.url))
      }

      // Verificar acceso a rutas de profesor
      if (pathname.startsWith('/teacher')) {
        if (userRole !== 'teacher') {
          console.log('❌ Acceso denegado - No es profesor')
          return NextResponse.redirect(new URL('/auth/login', req.url))
        }
        console.log('✅ Acceso permitido - Profesor')
      }

      // Verificar acceso a rutas de estudiante
      if (pathname.startsWith('/student')) {
        if (userRole !== 'student') {
          console.log('❌ Acceso denegado - No es estudiante')
          return NextResponse.redirect(new URL('/auth/login', req.url))
        }
        console.log('✅ Acceso permitido - Estudiante')
      }

      // Redirigir root a dashboard apropiado
      if (pathname === '/') {
        console.log('🔄 Redirigiendo desde root al dashboard')
        
        const dashboardUrl = userRole === 'teacher' 
          ? '/teacher/dashboard' 
          : '/student/dashboard'
        
        return NextResponse.redirect(new URL(dashboardUrl, req.url))
      }
    }

    // Continuar con la solicitud para rutas públicas
    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl

        // Permitir acceso a rutas públicas sin token
        const publicRoutes = ['/auth/login', '/auth/register', '/auth/error', '/api/auth']
        const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route))
        
        if (isPublicRoute) {
          return true
        }

        // Para rutas protegidas, requerir token
        const isProtectedRoute = pathname.startsWith('/teacher') || pathname.startsWith('/student')
        
        if (isProtectedRoute) {
          return !!token
        }

        // Para otras rutas (como /), permitir acceso
        return true
      },
    },
  }
)

// Configurar qué rutas debe procesar el middleware
export const config = {
  matcher: [
    /*
     * Coincidir con todas las rutas de solicitud excepto las que comienzan con:
     * - api/auth (rutas de autenticación de NextAuth)
     * - _next/static (archivos estáticos)
     * - _next/image (optimización de imágenes)
     * - favicon.ico (favicon)
     * - public (archivos públicos)
     */
    '/((?!api/auth|_next/static|_next/image|favicon.ico|public).*)',
  ],
}