// src/components/student/NotificationCenter.tsx
'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BellIcon } from '@heroicons/react/24/outline'

export function NotificationCenter() {
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isOpen, setIsOpen] = useState(false)

  // Polling para nuevas notificaciones
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const response = await fetch('/api/notifications/unread')
        if (response.ok) {
          const data = await response.json()
          setNotifications(data.notifications)
          setUnreadCount(data.unreadCount)
        }
      } catch (error) {
        console.error('Error fetching notifications:', error)
      }
    }, 30000) // Cada 30 segundos

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-400 hover:text-white transition-colors"
      >
        <BellIcon className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute right-0 mt-2 w-80 bg-slate-800 rounded-lg shadow-xl border border-white/20"
          >
            {/* Contenido de notificaciones */}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}