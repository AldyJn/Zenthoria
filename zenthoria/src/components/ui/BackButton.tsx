// src/components/ui/BackButton.tsx
'use client'

import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'
import { cn } from '@/lib/utils/cn'

interface BackButtonProps {
  href?: string
  label?: string
  variant?: 'default' | 'minimal' | 'floating'
  className?: string
  onClick?: () => void
}

export function BackButton({ 
  href, 
  label = 'Volver', 
  variant = 'default',
  className,
  onClick 
}: BackButtonProps) {
  const router = useRouter()

  const handleClick = () => {
    if (onClick) {
      onClick()
    } else if (href) {
      router.push(href)
    } else {
      router.back()
    }
  }

  const variants = {
    default: "flex items-center space-x-2 px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg transition-all duration-200 text-gray-300 hover:text-white backdrop-blur-sm",
    minimal: "flex items-center space-x-2 text-gray-400 hover:text-white transition-colors duration-200",
    floating: "fixed top-4 left-4 z-50 flex items-center space-x-2 px-4 py-2 bg-slate-900/80 hover:bg-slate-800/80 border border-white/20 rounded-lg transition-all duration-200 text-gray-300 hover:text-white backdrop-blur-sm shadow-lg"
  }

  return (
    <motion.button
      onClick={handleClick}
      className={cn(variants[variant], className)}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      <ArrowLeftIcon className="w-4 h-4" />
      <span className="font-medium">{label}</span>
    </motion.button>
  )
}

// Componente especializado para las vistas de clases
interface ClassBackButtonProps {
  classId?: string
  className?: string
}

export function ClassBackButton({ classId, className }: ClassBackButtonProps) {
  return (
    <BackButton
      href="/teacher/dashboard"
      label="Volver al Dashboard"
      variant="default"
      className={className}
    />
  )
}

// Hook personalizado para navegación de clases
export function useClassNavigation() {
  const router = useRouter()

  const goToClass = (classId: string) => {
    router.push(`/teacher/classes/${classId}`)
  }

  const goToDashboard = () => {
    router.push('/teacher/dashboard')
  }

  const goToClassEdit = (classId: string) => {
    router.push(`/teacher/classes/${classId}/edit`)
  }

  const goBack = () => {
    router.back()
  }

  return {
    goToClass,
    goToDashboard,
    goToClassEdit,
    goBack
  }
}