// src/components/student/StudentSidebar.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  HomeIcon,
  AcademicCapIcon,
  UserIcon,
  ChartBarIcon,
  CogIcon,
  PowerIcon,
  StarIcon,
  TrophyIcon,
  SparklesIcon,
  Bars3Icon,
  XMarkIcon,
  BoltIcon
} from '@heroicons/react/24/outline'
import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/lib/utils/cn'
import { toast } from 'react-hot-toast'

interface SidebarItemProps {
  icon: React.ComponentType<{ className?: string }>
  label: string
  href?: string
  onClick?: () => void
  active?: boolean
  disabled?: boolean
  badge?: string | number
  collapsed?: boolean
}

function SidebarItem({ 
  icon: Icon, 
  label, 
  href, 
  onClick, 
  active, 
  disabled,
  badge,
  collapsed 
}: SidebarItemProps) {
  const router = useRouter()

  const handleClick = () => {
    if (disabled) return
    if (onClick) {
      onClick()
    } else if (href) {
      router.push(href)
    }
  }

  return (
    <motion.button
      onClick={handleClick}
      disabled={disabled}
      className={cn(
        "w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 text-left relative group",
        active 
          ? "bg-arc-500/20 text-arc-300 border border-arc-500/30" 
          : "text-gray-300 hover:bg-white/10 hover:text-white",
        disabled && "opacity-50 cursor-not-allowed",
        collapsed && "justify-center"
      )}
      whileHover={!disabled ? { scale: 1.02 } : undefined}
      whileTap={!disabled ? { scale: 0.98 } : undefined}
      title={collapsed ? label : undefined}
    >
      <Icon className="w-5 h-5 flex-shrink-0" />
      {!collapsed && (
        <>
          <span className="font-medium">{label}</span>
          {badge && (
            <span className="ml-auto bg-arc-500 text-white text-xs px-2 py-1 rounded-full">
              {badge}
            </span>
          )}
        </>
      )}
      
      {/* Tooltip para modo colapsado */}
      {collapsed && (
        <div className="absolute left-full ml-2 px-2 py-1 bg-slate-800 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
          {label}
        </div>
      )}
    </motion.button>
  )
}

interface StudentSidebarProps {
  className?: string
}

export function StudentSidebar({ className }: StudentSidebarProps) {
  const { user, logout } = useAuth()
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  // Detectar si es móvil
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
      if (window.innerWidth < 768) {
        setIsCollapsed(true)
      }
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const handleLogout = async () => {
    await logout()
  }

  const handleShareProgress = async () => {
    try {
      const progressUrl = `${window.location.origin}/student/dashboard`
      await navigator.clipboard.writeText(progressUrl)
      toast.success('Enlace de progreso copiado')
    } catch (error) {
      toast.error('Error al copiar enlace')
    }
  }

  const sidebarItems = [
    {
      icon: HomeIcon,
      label: 'Dashboard',
      href: '/student/dashboard',
      active: pathname === '/student/dashboard'
    },
    {
      icon: AcademicCapIcon,
      label: 'Mis Clases',
      href: '/student/classes',
      active: pathname.includes('/student/classes') && !pathname.includes('/create')
    },
    {
      icon: UserIcon,
      label: 'Mis Personajes',
      href: '/student/characters',
      active: pathname.includes('/student/characters')
    },
    {
      icon: TrophyIcon,
      label: 'Logros',
      href: '/student/achievements',
      active: pathname.includes('/student/achievements')
    },
    {
      icon: ChartBarIcon,
      label: 'Mi Progreso',
      href: '/student/progress',
      active: pathname.includes('/student/progress')
    },
    {
      icon: CogIcon,
      label: 'Configuración',
      href: '/student/settings',
      active: pathname.includes('/student/settings')
    }
  ]

  return (
    <motion.aside
      initial={{ width: isCollapsed ? 80 : 280 }}
      animate={{ width: isCollapsed ? 80 : 280 }}
      className={cn(
        "fixed left-0 top-0 h-full bg-gradient-to-b from-slate-900/95 to-void-800/95 backdrop-blur-sm border-r border-white/20 z-40 flex flex-col",
        className
      )}
    >
      {/* Header */}
      <div className="p-4 border-b border-white/20">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center space-x-3"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-arc-500 to-void-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">Z</span>
              </div>
              <div>
                <h2 className="text-white font-bold text-lg">Zenthoria</h2>
                <p className="text-gray-400 text-xs">Guardián</p>
              </div>
            </motion.div>
          )}
          
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            {isCollapsed ? (
              <Bars3Icon className="w-5 h-5 text-gray-400" />
            ) : (
              <XMarkIcon className="w-5 h-5 text-gray-400" />
            )}
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {sidebarItems.map((item, index) => (
          <SidebarItem
            key={index}
            icon={item.icon}
            label={item.label}
            href={item.href}
            active={item.active}
            collapsed={isCollapsed}
          />
        ))}

        {/* Acciones Rápidas */}
        {!isCollapsed && (
          <div className="pt-4 mt-4 border-t border-white/20">
            <p className="text-gray-400 text-xs font-medium mb-2 px-4">ACCIONES RÁPIDAS</p>
            
            <SidebarItem
              icon={SparklesIcon}
              label="Unirse a Clase"
              onClick={() => toast('Modal de unirse a clase - Próximamente', { icon: '🚧' })}
              collapsed={isCollapsed}
            />
            
            <SidebarItem
              icon={BoltIcon}
              label="Entrenar"
              onClick={() => toast('Modo entrenamiento - Próximamente', { icon: '🚧' })}
              collapsed={isCollapsed}
            />
            
            <SidebarItem
              icon={StarIcon}
              label="Compartir Progreso"
              onClick={handleShareProgress}
              collapsed={isCollapsed}
            />
          </div>
        )}
      </nav>

      {/* User Menu */}
      <div className="p-4 border-t border-white/20">
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className={cn(
              "w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-white/10 transition-colors",
              isCollapsed && "justify-center"
            )}
          >
            <div className="w-8 h-8 bg-gradient-to-br from-arc-500 to-void-600 rounded-full flex items-center justify-center">
              <UserIcon className="w-4 h-4 text-white" />
            </div>
            {!isCollapsed && (
              <>
                <div className="flex-1 text-left">
                  <p className="text-white font-medium text-sm">{user?.name}</p>
                  <p className="text-gray-400 text-xs">Guardián</p>
                </div>
                <motion.div
                  animate={{ rotate: showUserMenu ? 180 : 0 }}
                  className="text-gray-400"
                >
                  ▼
                </motion.div>
              </>
            )}
          </button>

          {/* User Dropdown */}
          <AnimatePresence>
            {showUserMenu && !isCollapsed && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute bottom-full left-0 right-0 mb-2 bg-slate-800 rounded-lg border border-white/20 shadow-xl overflow-hidden"
              >
                <button
                  onClick={() => toast('Mi perfil - Próximamente', { icon: '🚧' })}
                  className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-white/10 transition-colors text-left"
                >
                  <UserIcon className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-300">Mi Perfil</span>
                </button>
                
                <button
                  onClick={() => toast('Configuración - Próximamente', { icon: '🚧' })}
                  className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-white/10 transition-colors text-left"
                >
                  <CogIcon className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-300">Configuración</span>
                </button>
                
                <div className="border-t border-white/20">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-red-500/10 transition-colors text-left text-red-400"
                  >
                    <PowerIcon className="w-4 h-4" />
                    <span>Cerrar Sesión</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.aside>
  )
}