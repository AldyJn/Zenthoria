#!/usr/bin/env tsx

import { getDatabaseStats } from '../src/lib/db'

async function main() {
  console.log('📊 Obteniendo estadísticas de la base de datos...\n')
  
  try {
    const stats = await getDatabaseStats()
    
    console.log('📈 ESTADÍSTICAS DE ZENTHORIA')
    console.log('=' .repeat(40))
    console.log(`👥 Usuarios:          ${stats.usuarios}`)
    console.log(`🎓 Profesores:        ${stats.profesores}`)
    console.log(`📚 Estudiantes:       ${stats.estudiantes}`)
    console.log(`🏫 Clases:            ${stats.clases}`)
    console.log(`🎮 Personajes:        ${stats.personajes}`)
    console.log(`⚡ Poderes:           ${stats.poderes}`)
    console.log(`🎯 Accesorios:        ${stats.accesorios}`)
    console.log('=' .repeat(40))
    console.log('\n✅ Estadísticas obtenidas correctamente!')
    
  } catch (error) {
    console.error('❌ Error al obtener estadísticas:', error)
    process.exit(1)
  }
}

main()