import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { getUserByEmail } from '@/lib/utils/db-helpers'
import { UserRole } from '@prisma/client'
import bcrypt from 'bcryptjs'

// Declaramos el tipo extendido de user para NextAuth
declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      name: string
      role: UserRole
      teacherId?: string | null
      studentId?: string | null
    }
  }

  interface User {
    id: string
    email: string
    name: string
    role: UserRole
    teacherId?: string | null
    studentId?: string | null
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    email: string
    name: string
    role: UserRole
    teacherId?: string | null
    studentId?: string | null
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: 'credentials',
      name: 'credentials',
      credentials: {
        email: { 
          label: 'Email', 
          type: 'email',
          placeholder: 'tu.email@example.com'
        },
        password: { 
          label: 'Contraseña', 
          type: 'password' 
        }
      },
      async authorize(credentials) {
        try {
          // Validar que se proporcionaron credenciales
          if (!credentials?.email || !credentials?.password) {
            console.log('❌ Credenciales faltantes')
            return null
          }

          console.log('🔍 Buscando usuario con email:', credentials.email)

          // Buscar usuario usando el helper existente
          const user = await getUserByEmail(credentials.email)
          
          if (!user) {
            console.log('❌ Usuario no encontrado')
            return null
          }

          // Verificar contraseña usando bcrypt
          const isValidPassword = await bcrypt.compare(
            credentials.password, 
            user.passwordHash
          )

          if (!isValidPassword) {
            console.log('❌ Contraseña incorrecta')
            return null
          }

          // Verificar que el usuario esté activo
          if (!user.isActive) {
            console.log('❌ Usuario inactivo')
            return null
          }

          console.log('✅ Usuario autenticado exitosamente:', user.role)

          // Preparar datos del usuario para la sesión
          const sessionUser = {
            id: user.id,
            email: user.email,
            name: `${user.firstName} ${user.lastName}`,
            role: user.role,
            teacherId: user.teacher?.id || null,
            studentId: user.student?.id || null
          }

          return sessionUser

        } catch (error) {
          console.error('❌ Error en autenticación:', error)
          return null
        }
      }
    })
  ],

  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 horas
  },

  jwt: {
    maxAge: 24 * 60 * 60, // 24 horas
  },

  callbacks: {
    async jwt({ token, user }) {
      // Cuando el usuario se autentica por primera vez
      if (user) {
        token.id = user.id
        token.email = user.email
        token.name = user.name
        token.role = user.role
        token.teacherId = user.teacherId
        token.studentId = user.studentId
      }
      return token
    },

    async session({ session, token }) {
      // Enviar propiedades al cliente
      if (token) {
        session.user.id = token.id
        session.user.email = token.email
        session.user.name = token.name
        session.user.role = token.role
        session.user.teacherId = token.teacherId
        session.user.studentId = token.studentId
      }
      return session
    },

    async redirect({ url, baseUrl }) {
      // Permitir URLs relativas y del mismo dominio
      if (url.startsWith('/')) return `${baseUrl}${url}`
      if (new URL(url).origin === baseUrl) return url
      return baseUrl
    }
  },

  pages: {
    signIn: '/auth/login',
    error: '/auth/error'
  },

  events: {
    async signIn({ user, account, profile }) {
      console.log('🎉 Usuario inició sesión:', user.email, user.role)
    },
    async signOut({ session, token }) {
      console.log('👋 Usuario cerró sesión')
    }
  },

  debug: process.env.NODE_ENV === 'development',
}