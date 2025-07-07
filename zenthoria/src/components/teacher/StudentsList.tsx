// src/components/teacher/StudentsList.tsx
'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  MagnifyingGlassIcon, 
  FunnelIcon, 
  ViewColumnsIcon,
  UserGroupIcon,
  ChevronDownIcon,
  ArrowDownTrayIcon
} from '@heroicons/react/24/outline'
import { StudentCharacterWithDetails } from '@/types'
import { cn } from '@/lib/utils/cn'
import { StatBar } from '@/components/ui/StatBar'

interface StudentsListProps {
  students: StudentCharacterWithDetails[]
  onStudentSelect?: (student: StudentCharacterWithDetails) => void
  onBulkAction?: (action: string, studentIds: string[]) => void
  className?: string
}

type ViewMode = 'cards' | 'list' | 'compact'
type SortField = 'name' | 'level' | 'characterType' | 'experience' | 'lastActivity'
type SortOrder = 'asc' | 'desc'

interface FilterOptions {
  search: string
  characterType: string
  minLevel: number
  maxLevel: number
  activityStatus: 'all' | 'active' | 'inactive'
}

export function StudentsList({
  students,
  onStudentSelect,
  onBulkAction,
  className
}: StudentsListProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('cards')
  const [sortField, setSortField] = useState<SortField>('name')
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc')
  const [selectedStudents, setSelectedStudents] = useState<Set<string>>(new Set())
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState<FilterOptions>({
    search: '',
    characterType: 'all',
    minLevel: 1,
    maxLevel: 20,
    activityStatus: 'all'
  })

  // Obtener tipos de personajes únicos
  const characterTypes = useMemo(() => {
    const types = new Set(students.map(s => s.characterType.name))
    return Array.from(types)
  }, [students])

  // Filtrar y ordenar estudiantes
  const filteredAndSortedStudents = useMemo(() => {
    let filtered = students.filter(student => {
      // Filtro de búsqueda
      const searchTerm = filters.search.toLowerCase()
      const matchesSearch = !searchTerm || 
        student.student.user.firstName.toLowerCase().includes(searchTerm) ||
        student.student.user.lastName.toLowerCase().includes(searchTerm) ||
        student.characterName.toLowerCase().includes(searchTerm)

      // Filtro de tipo de personaje
      const matchesType = filters.characterType === 'all' || 
        student.characterType.name === filters.characterType

      // Filtro de nivel
      const matchesLevel = student.level >= filters.minLevel && 
        student.level <= filters.maxLevel

      return matchesSearch && matchesType && matchesLevel
    })

    // Ordenar
    filtered.sort((a, b) => {
      let valueA: any, valueB: any

      switch (sortField) {
        case 'name':
          valueA = `${a.student.user.firstName} ${a.student.user.lastName}`
          valueB = `${b.student.user.firstName} ${b.student.user.lastName}`
          break
        case 'level':
          valueA = a.level
          valueB = b.level
          break
        case 'characterType':
          valueA = a.characterType.name
          valueB = b.characterType.name
          break
        case 'experience':
          valueA = a.experiencePoints
          valueB = b.experiencePoints
          break
        case 'lastActivity':
          valueA = new Date(a.updatedAt).getTime()
          valueB = new Date(b.updatedAt).getTime()
          break
        default:
          return 0
      }

      if (valueA < valueB) return sortOrder === 'asc' ? -1 : 1
      if (valueA > valueB) return sortOrder === 'asc' ? 1 : -1
      return 0
    })

    return filtered
  }, [students, filters, sortField, sortOrder])

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortOrder('asc')
    }
  }

  const handleSelectAll = () => {
    if (selectedStudents.size === filteredAndSortedStudents.length) {
      setSelectedStudents(new Set())
    } else {
      setSelectedStudents(new Set(filteredAndSortedStudents.map(s => s.id)))
    }
  }

  const handleStudentSelect = (studentId: string) => {
    const newSelected = new Set(selectedStudents)
    if (newSelected.has(studentId)) {
      newSelected.delete(studentId)
    } else {
      newSelected.add(studentId)
    }
    setSelectedStudents(newSelected)
  }

  const exportToCSV = () => {
    const csvData = filteredAndSortedStudents.map(student => ({
      Nombre: `${student.student.user.firstName} ${student.student.user.lastName}`,
      Email: student.student.user.email,
      Personaje: student.characterName,
      Tipo: student.characterType.name,
      Nivel: student.level,
      Experiencia: student.experiencePoints,
      Salud: `${student.currentHealth}/${student.maxHealth}`,
      Luz: `${student.currentLight}/${student.maxLight}`,
      Disciplina: student.discipline,
      Intelecto: student.intellect,
      Fuerza: student.strength,
      Carisma: student.charisma
    }))

    const csv = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).join(','))
    ].join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `estudiantes_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
  }

  const getCharacterTypeIcon = (typeName: string) => {
    switch (typeName.toLowerCase()) {
      case 'hunter': return '🏹'
      case 'titan': return '🛡️'
      case 'warlock': return '🔮'
      default: return '⭐'
    }
  }

  const getCharacterTypeColor = (typeName: string) => {
    switch (typeName.toLowerCase()) {
      case 'hunter': return 'from-solar-500 to-orange-500'
      case 'titan': return 'from-arc-500 to-blue-500'
      case 'warlock': return 'from-void-500 to-purple-500'
      default: return 'from-gray-500 to-gray-600'
    }
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <UserGroupIcon className="w-8 h-8 text-blue-400" />
          <div>
            <h3 className="text-2xl font-bold text-white">
              Estudiantes ({filteredAndSortedStudents.length})
            </h3>
            <p className="text-gray-400">
              Gestiona y monitorea a tus Guardianes
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportToCSV}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
          >
            <ArrowDownTrayIcon className="w-4 h-4" />
            Exportar CSV
          </button>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col lg:flex-row gap-4 p-4 bg-white/5 rounded-xl border border-white/10">
        {/* Search */}
        <div className="flex-1">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar estudiantes..."
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
            />
          </div>
        </div>

        {/* View Mode */}
        <div className="flex bg-gray-700 rounded-lg p-1">
          {[
            { mode: 'cards', icon: '▦', label: 'Tarjetas' },
            { mode: 'list', icon: '☰', label: 'Lista' },
            { mode: 'compact', icon: '≡', label: 'Compacto' }
          ].map(({ mode, icon, label }) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode as ViewMode)}
              className={cn(
                'px-3 py-2 text-sm font-medium rounded transition-colors',
                viewMode === mode
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:text-white'
              )}
              title={label}
            >
              {icon}
            </button>
          ))}
        </div>

        {/* Filters Toggle */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-lg transition-colors',
            showFilters
              ? 'bg-blue-600 text-white'
              : 'bg-gray-700 text-gray-300 hover:text-white'
          )}
        >
          <FunnelIcon className="w-4 h-4" />
          Filtros
          <ChevronDownIcon className={cn(
            'w-4 h-4 transition-transform',
            showFilters && 'rotate-180'
          )} />
        </button>
      </div>

      {/* Advanced Filters */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="p-4 bg-white/5 rounded-xl border border-white/10"
          >
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Character Type Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Tipo de Personaje
                </label>
                <select
                  value={filters.characterType}
                  onChange={(e) => setFilters(prev => ({ ...prev, characterType: e.target.value }))}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                >
                  <option value="all">Todos los tipos</option>
                  {characterTypes.map(type => (
                    <option key={type} value={type} className="capitalize">
                      {getCharacterTypeIcon(type)} {type}
                    </option>
                  ))}
                </select>
              </div>

              {/* Level Range */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Nivel Mínimo
                </label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={filters.minLevel}
                  onChange={(e) => setFilters(prev => ({ ...prev, minLevel: parseInt(e.target.value) }))}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Nivel Máximo
                </label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={filters.maxLevel}
                  onChange={(e) => setFilters(prev => ({ ...prev, maxLevel: parseInt(e.target.value) }))}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                />
              </div>

              {/* Reset Filters */}
              <div className="flex items-end">
                <button
                  onClick={() => setFilters({
                    search: '',
                    characterType: 'all',
                    minLevel: 1,
                    maxLevel: 20,
                    activityStatus: 'all'
                  })}
                  className="w-full px-3 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition-colors"
                >
                  Limpiar Filtros
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bulk Actions */}
      <AnimatePresence>
        {selectedStudents.size > 0 && onBulkAction && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex items-center justify-between p-4 bg-blue-600/20 border border-blue-500/40 rounded-xl"
          >
            <span className="text-blue-300">
              {selectedStudents.size} estudiante(s) seleccionado(s)
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => onBulkAction('award_experience', Array.from(selectedStudents))}
                className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors"
              >
                🌟 Otorgar XP
              </button>
              <button
                onClick={() => onBulkAction('send_message', Array.from(selectedStudents))}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
              >
                📧 Enviar Mensaje
              </button>
              <button
                onClick={() => setSelectedStudents(new Set())}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
              >
                Cancelar
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sort Controls */}
      <div className="flex flex-wrap gap-2">
        {[
          { field: 'name', label: 'Nombre' },
          { field: 'level', label: 'Nivel' },
          { field: 'characterType', label: 'Tipo' },
          { field: 'experience', label: 'Experiencia' },
          { field: 'lastActivity', label: 'Última Actividad' }
        ].map(({ field, label }) => (
          <button
            key={field}
            onClick={() => handleSort(field as SortField)}
            className={cn(
              'px-3 py-1 text-sm rounded-lg transition-colors flex items-center gap-1',
              sortField === field
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:text-white'
            )}
          >
            {label}
            {sortField === field && (
              <span className="text-xs">
                {sortOrder === 'asc' ? '↑' : '↓'}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Students List */}
      {viewMode === 'cards' && <StudentsCards students={filteredAndSortedStudents} />}
      {viewMode === 'list' && <StudentsTable students={filteredAndSortedStudents} />}
      {viewMode === 'compact' && <StudentsCompact students={filteredAndSortedStudents} />}
    </div>
  )
}

// Componente para vista de tarjetas
function StudentsCards({ students }: { students: StudentCharacterWithDetails[] }) {
  const getCharacterTypeIcon = (typeName: string) => {
    switch (typeName.toLowerCase()) {
      case 'hunter': return '🏹'
      case 'titan': return '🛡️'
      case 'warlock': return '🔮'
      default: return '⭐'
    }
  }

  const getCharacterTypeColor = (typeName: string) => {
    switch (typeName.toLowerCase()) {
      case 'hunter': return 'from-solar-500 to-orange-500'
      case 'titan': return 'from-arc-500 to-blue-500'
      case 'warlock': return 'from-void-500 to-purple-500'
      default: return 'from-gray-500 to-gray-600'
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {students.map((student, index) => (
        <motion.div
          key={student.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="p-6 bg-white/5 rounded-xl border border-white/10 hover:border-white/20 transition-all duration-300 group"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={cn(
                'w-12 h-12 rounded-full flex items-center justify-center text-2xl',
                `bg-gradient-to-br ${getCharacterTypeColor(student.characterType.name)}`
              )}>
                {getCharacterTypeIcon(student.characterType.name)}
              </div>
              <div>
                <h4 className="font-semibold text-white">
                  {student.student.user.firstName} {student.student.user.lastName}
                </h4>
                <p className="text-sm text-gray-400">
                  {student.characterName}
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-blue-400">
                Nv. {student.level}
              </div>
              <div className="text-xs text-gray-500 capitalize">
                {student.characterType.name}
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="space-y-3">
            <StatBar
              label="Salud"
              current={student.currentHealth}
              max={student.maxHealth}
              type="health"
              size="sm"
              showValues={false}
            />
            <StatBar
              label="Luz"
              current={student.currentLight}
              max={student.maxLight}
              type="light"
              size="sm"
              showValues={false}
            />
            <StatBar
              label="Experiencia"
              current={student.experiencePoints}
              max={student.experiencePoints + 1000}
              type="experience"
              size="sm"
              showValues={false}
            />
          </div>

          {/* Character Stats */}
          <div className="grid grid-cols-2 gap-2 mt-4 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-400">🛡️ Disciplina:</span>
              <span className="text-green-400 font-medium">{student.discipline}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">🧠 Intelecto:</span>
              <span className="text-blue-400 font-medium">{student.intellect}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">💪 Fuerza:</span>
              <span className="text-orange-400 font-medium">{student.strength}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">⭐ Carisma:</span>
              <span className="text-purple-400 font-medium">{student.charisma}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-4 pt-4 border-t border-white/10 flex gap-2">
            <button className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors">
              Ver Perfil
            </button>
            <button className="px-3 py-2 bg-gray-600 hover:bg-gray-700 text-white text-sm rounded-lg transition-colors">
              📧
            </button>
            <button className="px-3 py-2 bg-yellow-600 hover:bg-yellow-700 text-white text-sm rounded-lg transition-colors">
              🌟
            </button>
          </div>
        </motion.div>
      ))}
    </div>
  )
}

// Componente para vista de tabla
function StudentsTable({ students }: { students: StudentCharacterWithDetails[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-white/10">
            <th className="text-left p-4 text-gray-300 font-medium">Estudiante</th>
            <th className="text-left p-4 text-gray-300 font-medium">Personaje</th>
            <th className="text-center p-4 text-gray-300 font-medium">Nivel</th>
            <th className="text-center p-4 text-gray-300 font-medium">Salud</th>
            <th className="text-center p-4 text-gray-300 font-medium">Luz</th>
            <th className="text-center p-4 text-gray-300 font-medium">Experiencia</th>
            <th className="text-right p-4 text-gray-300 font-medium">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {students.map((student, index) => (
            <motion.tr
              key={student.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="border-b border-white/5 hover:bg-white/5 transition-colors"
            >
              <td className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center text-lg">
                    {student.student.user.firstName.charAt(0)}
                  </div>
                  <div>
                    <div className="text-white font-medium">
                      {student.student.user.firstName} {student.student.user.lastName}
                    </div>
                    <div className="text-gray-400 text-sm">
                      {student.student.user.email}
                    </div>
                  </div>
                </div>
              </td>
              <td className="p-4">
                <div className="flex items-center gap-2">
                  <span className="text-lg">
                    {student.characterType.name === 'hunter' ? '🏹' : 
                     student.characterType.name === 'titan' ? '🛡️' : '🔮'}
                  </span>
                  <div>
                    <div className="text-white">{student.characterName}</div>
                    <div className="text-gray-400 text-sm capitalize">
                      {student.characterType.name}
                    </div>
                  </div>
                </div>
              </td>
              <td className="p-4 text-center">
                <span className="px-2 py-1 bg-blue-600 text-white rounded-lg text-sm font-medium">
                  {student.level}
                </span>
              </td>
              <td className="p-4 text-center">
                <div className="w-20 mx-auto">
                  <StatBar
                    label=""
                    current={student.currentHealth}
                    max={student.maxHealth}
                    type="health"
                    size="sm"
                    showValues={false}
                  />
                </div>
              </td>
              <td className="p-4 text-center">
                <div className="w-20 mx-auto">
                  <StatBar
                    label=""
                    current={student.currentLight}
                    max={student.maxLight}
                    type="light"
                    size="sm"
                    showValues={false}
                  />
                </div>
              </td>
              <td className="p-4 text-center">
                <span className="text-purple-400 font-medium">
                  {student.experiencePoints.toLocaleString()}
                </span>
              </td>
              <td className="p-4 text-right">
                <div className="flex gap-1 justify-end">
                  <button className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                    👁️
                  </button>
                  <button className="p-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors">
                    📧
                  </button>
                  <button className="p-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors">
                    🌟
                  </button>
                </div>
              </td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// Componente para vista compacta
function StudentsCompact({ students }: { students: StudentCharacterWithDetails[] }) {
  return (
    <div className="space-y-2">
      {students.map((student, index) => (
        <motion.div
          key={student.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.03 }}
          className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center text-sm">
              {student.student.user.firstName.charAt(0)}
            </div>
            <div>
              <span className="text-white font-medium">
                {student.student.user.firstName} {student.student.user.lastName}
              </span>
              <span className="text-gray-400 text-sm ml-2">
                ({student.characterName})
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <span className="text-lg">
              {student.characterType.name === 'hunter' ? '🏹' : 
               student.characterType.name === 'titan' ? '🛡️' : '🔮'}
            </span>
            <span className="px-2 py-1 bg-blue-600 text-white rounded text-xs">
              Nv. {student.level}
            </span>
            <span className="text-purple-400 text-sm min-w-[60px] text-right">
              {student.experiencePoints.toLocaleString()} XP
            </span>
            <div className="flex gap-1">
              <button className="p-1 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors text-xs">
                👁️
              </button>
              <button className="p-1 bg-yellow-600 hover:bg-yellow-700 text-white rounded transition-colors text-xs">
                🌟
              </button>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  )
}