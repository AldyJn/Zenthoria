#!/usr/bin/env tsx

import { checkDatabaseConnection } from '../src/lib/db'

async function main() {
  console.log('🔍 Verificando conexión a la base de datos...\n')
  
  try {
    const result = await checkDatabaseConnection()
    
    if (result.status === 'connected') {
      console.log('✅ Estado:', result.status)
      console.log('📝 Mensaje:', result.message)
      console.log('\n🎉 ¡Base de datos conectada correctamente!')
    } else {
      console.log('❌ Estado:', result.status)
      console.log('📝 Mensaje:', result.message)
      if (result.error) {
        console.log('🚨 Error:', result.error)
      }
      console.log('\n⚠️  Hay problemas con la conexión a la base de datos')
    }
  } catch (error) {
    console.error('❌ Error al verificar la conexión:', error)
    process.exit(1)
  }
}

main()