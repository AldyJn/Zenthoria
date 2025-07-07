// src/components/ui/QRCodeDisplay.tsx
'use client'

import { useEffect, useRef, useState } from 'react'
import QRCode from 'qrcode'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils/cn'

interface QRCodeDisplayProps {
  value: string
  size?: number
  margin?: number
  color?: {
    dark?: string
    light?: string
  }
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H'
  className?: string
  showValue?: boolean
  downloadable?: boolean
}

export function QRCodeDisplay({
  value,
  size = 200,
  margin = 4,
  color = {
    dark: '#000000',
    light: '#FFFFFF'
  },
  errorCorrectionLevel = 'M',
  className,
  showValue = false,
  downloadable = false
}: QRCodeDisplayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const generateQR = async () => {
      if (!canvasRef.current || !value) return

      setIsLoading(true)
      setError(null)

      try {
        await QRCode.toCanvas(canvasRef.current, value, {
          width: size,
          margin,
          color,
          errorCorrectionLevel
        })
      } catch (err) {
        console.error('Error generando QR:', err)
        setError('Error al generar código QR')
      } finally {
        setIsLoading(false)
      }
    }

    generateQR()
  }, [value, size, margin, color, errorCorrectionLevel])

  const downloadQR = () => {
    if (!canvasRef.current) return

    const link = document.createElement('a')
    link.download = `qr-code-${value}.png`
    link.href = canvasRef.current.toDataURL()
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  if (error) {
    return (
      <div className={cn(
        "flex flex-col items-center justify-center p-6 bg-red-500/10 border border-red-500/20 rounded-lg",
        className
      )}>
        <div className="text-red-400 text-sm text-center">
          {error}
        </div>
      </div>
    )
  }

  return (
    <div className={cn("flex flex-col items-center space-y-4", className)}>
      <div className="relative">
        {/* Loading spinner */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/10 rounded-lg">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="w-8 h-8 border-2 border-solar-500 border-t-transparent rounded-full"
            />
          </div>
        )}

        {/* QR Canvas */}
        <motion.canvas
          ref={canvasRef}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: isLoading ? 0 : 1, scale: isLoading ? 0.8 : 1 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-lg shadow-lg"
          style={{ width: size, height: size }}
        />
      </div>

      {/* Value display */}
      {showValue && !isLoading && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center"
        >
          <p className="text-gray-300 text-sm font-mono break-all max-w-xs">
            {value}
          </p>
        </motion.div>
      )}

      {/* Download button */}
      {downloadable && !isLoading && (
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          onClick={downloadQR}
          className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg transition-colors text-white text-sm"
        >
          Descargar QR
        </motion.button>
      )}
    </div>
  )
}

// Componente especializado para códigos de clase
interface ClassCodeQRProps {
  classCode: string
  className?: string
  size?: number
}

export function ClassCodeQR({ classCode, className, size = 200 }: ClassCodeQRProps) {
  const joinUrl = `${window.location.origin}/join/${classCode}`

  return (
    <div className={cn("text-center", className)}>
      <QRCodeDisplay
        value={joinUrl}
        size={size}
        showValue={false}
        downloadable={true}
        color={{
          dark: '#000000',
          light: '#FFFFFF'
        }}
        className="mx-auto"
      />
      
      <div className="mt-4 space-y-2">
        <p className="text-white font-semibold">Código de Clase</p>
        <p className="text-2xl font-bold text-solar-400 tracking-wider">
          {classCode}
        </p>
        <p className="text-gray-400 text-sm">
          Escanea el QR o usa el código para unirte
        </p>
      </div>
    </div>
  )
}

// Componente para mostrar QR en modal
interface QRModalProps {
  isOpen: boolean
  onClose: () => void
  value: string
  title?: string
  description?: string
}

export function QRModal({ isOpen, onClose, value, title, description }: QRModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl border border-white/20 shadow-2xl max-w-md w-full p-6"
      >
        {/* Header */}
        <div className="text-center mb-6">
          {title && (
            <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
          )}
          {description && (
            <p className="text-gray-400 text-sm">{description}</p>
          )}
        </div>

        {/* QR Code */}
        <div className="flex justify-center mb-6">
          <QRCodeDisplay
            value={value}
            size={250}
            downloadable={true}
            showValue={true}
          />
        </div>

        {/* Footer */}
        <div className="text-center">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gradient-to-r from-solar-500 to-orange-600 text-white rounded-lg hover:from-solar-600 hover:to-orange-700 transition-all duration-200"
          >
            Cerrar
          </button>
        </div>
      </motion.div>
    </div>
  )
}