// scripts/create-test-users.ts
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

// Funciones para generar códigos únicos
const generateTeacherCode = (): string => {
  return `TCH${Math.random().toString(36).substr(2, 6).toUpperCase()}`
}

const generateStudentCode = (): string => {
  return `STU${Math.random().toString(36).substr(2, 6).toUpperCase()}`
}

async function createTestUsers() {
  try {
    console.log('🚀 Creando usuarios de prueba...')

    // 1. Crear profesor de prueba
    const teacherPassword = await bcrypt.hash('password123', 12)
    
    const teacher = await prisma.user.create({
      data: {
        email: 'jperez@example.com',
        passwordHash: teacherPassword,
        role: 'teacher',
        firstName: 'Juan',
        lastName: 'Perez',
        teacher: {
          create: {
            teacherCode: generateTeacherCode(),
            department: 'Matemáticas',
            bio: 'Profesor de matemáticas con 10 años de experiencia'
          }
        }
      },
      include: {
        teacher: true
      }
    })

    console.log('✅ Profesor creado:', {
      email: teacher.email,
      name: `${teacher.firstName} ${teacher.lastName}`,
      teacherCode: teacher.teacher?.teacherCode
    })

    // 2. Crear estudiantes de prueba
    const students = [
      {
        email: 'maria.garcia@example.com',
        firstName: 'Maria',
        lastName: 'Garcia'
      },
      {
        email: 'pedro.lopez@example.com', 
        firstName: 'Pedro',
        lastName: 'Lopez'
      },
      {
        email: 'ana.martinez@example.com',
        firstName: 'Ana', 
        lastName: 'Martinez'
      }
    ]

    const studentPassword = await bcrypt.hash('student123', 12)

    for (const studentData of students) {
      const student = await prisma.user.create({
        data: {
          email: studentData.email,
          passwordHash: studentPassword,
          role: 'student',
          firstName: studentData.firstName,
          lastName: studentData.lastName,
          student: {
            create: {
              studentCode: generateStudentCode()
            }
          }
        },
        include: {
          student: true
        }
      })

      console.log('✅ Estudiante creado:', {
        email: student.email,
        name: `${student.firstName} ${student.lastName}`,
        studentCode: student.student?.studentCode
      })
    }

    // 3. Crear tipos de personajes básicos
    const characterTypes = [
      {
        name: 'Titan',
        description: 'Guardianes resistentes con gran poder defensivo',
        baseHealth: 100,
        baseLight: 80,
        specialAbility: 'Barrera Protectora'
      },
      {
        name: 'Hunter',
        description: 'Guardianes ágiles especializados en precisión',
        baseHealth: 80,
        baseLight: 100,
        specialAbility: 'Capa de Invisibilidad'
      },
      {
        name: 'Warlock',
        description: 'Guardianes místicos que dominan las artes arcanas',
        baseHealth: 90,
        baseLight: 110,
        specialAbility: 'Rift Curativo'
      }
    ]

    for (const typeData of characterTypes) {
      const characterType = await prisma.characterType.create({
        data: typeData
      })

      console.log('✅ Tipo de personaje creado:', characterType.name)
    }

    console.log('\n🎉 ¡Usuarios de prueba creados exitosamente!')
    console.log('\n📋 Credenciales de acceso:')
    console.log('👨‍🏫 PROFESOR:')
    console.log('   Email: jperez@example.com')
    console.log('   Contraseña: password123')
    console.log('\n👨‍🎓 ESTUDIANTES:')
    console.log('   Email: maria.garcia@example.com')
    console.log('   Email: pedro.lopez@example.com') 
    console.log('   Email: ana.martinez@example.com')
    console.log('   Contraseña para todos: student123')

  } catch (error) {
    console.error('❌ Error creando usuarios:', error)
    
    if (error instanceof Error && error.message.includes('Unique constraint')) {
      console.log('💡 Los usuarios ya existen. Intentando con otros emails...')
      
      // Verificar si el usuario existe
      const existingUser = await prisma.user.findUnique({
        where: { email: 'jperez@example.com' }
      })
      
      if (existingUser) {
        console.log('✅ El usuario jperez@example.com ya existe en la base de datos')
        console.log('🔐 Verifica que la contraseña sea: password123')
      }
    }
  } finally {
    await prisma.$disconnect()
  }
}

createTestUsers()