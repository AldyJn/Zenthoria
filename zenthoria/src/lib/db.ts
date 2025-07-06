import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    errorFormat: 'pretty',
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// Función para conectar a la base de datos
export async function connectToDatabase() {
  try {
    await prisma.$connect()
    console.log('✅ Conexión exitosa a la base de datos PostgreSQL')
    return true
  } catch (error) {
    console.error('❌ Error al conectar a la base de datos:', error)
    return false
  }
}

// Función para desconectar de la base de datos
export async function disconnectFromDatabase() {
  try {
    await prisma.$disconnect()
    console.log('✅ Desconexión exitosa de la base de datos')
    return true
  } catch (error) {
    console.error('❌ Error al desconectar de la base de datos:', error)
    return false
  }
}

// Función para verificar el estado de la conexión
export async function checkDatabaseConnection() {
  try {
    await prisma.$queryRaw`SELECT 1`
    return { status: 'connected', message: 'Base de datos conectada correctamente' }
  } catch (error) {
    return { 
      status: 'disconnected', 
      message: 'Error de conexión a la base de datos',
      error: error instanceof Error ? error.message : 'Error desconocido'
    }
  }
}

// Función para obtener estadísticas de la base de datos
export async function getDatabaseStats() {
  try {
    const [
      usersCount,
      teachersCount,
      studentsCount,
      classesCount,
      charactersCount,
      powersCount,
      accessoriesCount
    ] = await Promise.all([
      prisma.user.count(),
      prisma.teacher.count(),
      prisma.student.count(),
      prisma.class.count(),
      prisma.studentCharacter.count(),
      prisma.power.count(),
      prisma.accessory.count()
    ])

    return {
      usuarios: usersCount,
      profesores: teachersCount,
      estudiantes: studentsCount,
      clases: classesCount,
      personajes: charactersCount,
      poderes: powersCount,
      accesorios: accessoriesCount
    }
  } catch (error) {
    console.error('Error al obtener estadísticas de la base de datos:', error)
    throw new Error('No se pudieron obtener las estadísticas de la base de datos')
  }
}

export default prisma