// src/components/teacher/ClassJoinLinkModal.tsx
'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  XMarkIcon,
  ClipboardDocumentIcon,
  QrCodeIcon,
  ShareIcon,
  LinkIcon,
  CheckIcon
} from '@heroicons/react/24/outline'
import { ClassWithDetails } from '@/types'
import { QRCodeDisplay } from '@/components/ui/QRCodeDisplay'
import { toast } from 'react-hot-toast'
import { cn } from '@/lib/utils/cn'

interface ClassJoinLinkModalProps {
  isOpen: boolean
  onClose: () => void
  classData: ClassWithDetails
}

export function ClassJoinLinkModal({ isOpen, onClose, classData }: ClassJoinLinkModalProps) {
  const [activeTab, setActiveTab] = useState<'link' | 'qr'>('link')
  const [copied, setCopied] = useState<string | null>(null)

  // Generar URLs de unión
  const joinUrl = `${window.location.origin}/join/${classData.classCode}`
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(
    `¡Únete a mi clase "${classData.name}"!\n\n` +
    `Código: ${classData.classCode}\n` +
    `Enlace: ${joinUrl}\n\n` +
    `O escanea el código QR para unirte directamente.`
  )}`
  const emailSubject = encodeURIComponent(`Invitación a clase: ${classData.name}`)
  const emailBody = encodeURIComponent(
    `Hola,\n\n` +
    `Te invito a unirte a mi clase "${classData.name}" en Zenthoria.\n\n` +
    `Puedes usar el siguiente código de clase: ${classData.classCode}\n` +
    `O hacer clic en este enlace directo: ${joinUrl}\n\n` +
    `¡Nos vemos en clase!\n`
  )

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(type)
      toast.success(`${type} copiado al portapapeles`)
      setTimeout(() => setCopied(null), 2000)
    } catch (error) {
      toast.error('Error al copiar')
    }
  }

  const shareOptions = [
    {
      name: 'WhatsApp',
      icon: '📱',
      color: 'from-green-500 to-green-600',
      onClick: () => window.open(whatsappUrl, '_blank')
    },
    {
      name: 'Email',
      icon: '📧',
      color: 'from-blue-500 to-blue-600',
      onClick: () => window.open(`mailto:?subject=${emailSubject}&body=${emailBody}`, '_blank')
    },
    {
      name: 'Telegram',
      icon: '✈️',
      color: 'from-cyan-500 to-cyan-600',
      onClick: () => window.open(`https://t.me/share/url?url=${encodeURIComponent(joinUrl)}&text=${encodeURIComponent(`Únete a mi clase: ${classData.name}`)}`, '_blank')
    }
  ]

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl border border-white/20 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
              
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-white/20">
                <div>
                  <h2 className="text-2xl font-bold text-white">Invitar Estudiantes</h2>
                  <p className="text-gray-400 mt-1">Comparte el enlace para que se unan a "{classData.name}"</p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <XMarkIcon className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              {/* Tabs */}
              <div className="flex items-center px-6 pt-4">
                <div className="flex items-center space-x-1 bg-white/10 rounded-lg p-1">
                  <button
                    onClick={() => setActiveTab('link')}
                    className={cn(
                      "px-4 py-2 rounded-md text-sm font-medium transition-colors",
                      activeTab === 'link' 
                        ? "bg-solar-500 text-white" 
                        : "text-gray-400 hover:text-white"
                    )}
                  >
                    <LinkIcon className="w-4 h-4 inline mr-2" />
                    Enlace
                  </button>
                  <button
                    onClick={() => setActiveTab('qr')}
                    className={cn(
                      "px-4 py-2 rounded-md text-sm font-medium transition-colors",
                      activeTab === 'qr' 
                        ? "bg-solar-500 text-white" 
                        : "text-gray-400 hover:text-white"
                    )}
                  >
                    <QrCodeIcon className="w-4 h-4 inline mr-2" />
                    Código QR
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                {activeTab === 'link' && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-6"
                  >
                    {/* Código de Clase */}
                    <div>
                      <label className="block text-gray-300 font-medium mb-2">
                        Código de Clase
                      </label>
                      <div className="flex items-center space-x-2">
                        <div className="flex-1 bg-white/10 border border-white/20 rounded-lg px-4 py-3">
                          <span className="text-white font-mono text-lg tracking-widest">
                            {classData.classCode}
                          </span>
                        </div>
                        <button
                          onClick={() => copyToClipboard(classData.classCode, 'Código')}
                          className="p-3 bg-solar-500 hover:bg-solar-600 text-white rounded-lg transition-colors"
                        >
                          {copied === 'Código' ? (
                            <CheckIcon className="w-5 h-5" />
                          ) : (
                            <ClipboardDocumentIcon className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Enlace Directo */}
                    <div>
                      <label className="block text-gray-300 font-medium mb-2">
                        Enlace Directo
                      </label>
                      <div className="flex items-center space-x-2">
                        <div className="flex-1 bg-white/10 border border-white/20 rounded-lg px-4 py-3">
                          <span className="text-white font-mono text-sm break-all">
                            {joinUrl}
                          </span>
                        </div>
                        <button
                          onClick={() => copyToClipboard(joinUrl, 'Enlace')}
                          className="p-3 bg-solar-500 hover:bg-solar-600 text-white rounded-lg transition-colors"
                        >
                          {copied === 'Enlace' ? (
                            <CheckIcon className="w-5 h-5" />
                          ) : (
                            <ClipboardDocumentIcon className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Opciones de Compartir */}
                    <div>
                      <label className="block text-gray-300 font-medium mb-3">
                        Compartir Directamente
                      </label>
                      <div className="grid grid-cols-3 gap-3">
                        {shareOptions.map((option, index) => (
                          <button
                            key={index}
                            onClick={option.onClick}
                            className={cn(
                              "flex flex-col items-center space-y-2 p-4 rounded-lg border border-white/20 hover:border-white/40 transition-all duration-200 group",
                              `bg-gradient-to-br ${option.color}/10 hover:${option.color}/20`
                            )}
                          >
                            <span className="text-2xl group-hover:scale-110 transition-transform">
                              {option.icon}
                            </span>
                            <span className="text-white text-sm font-medium">
                              {option.name}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeTab === 'qr' && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="text-center space-y-6"
                  >
                    <p className="text-gray-400">
                      Los estudiantes pueden escanear este código QR para unirse directamente
                    </p>
                    
                    <div className="flex justify-center">
                      <QRCodeDisplay
                        value={joinUrl}
                        size={250}
                        downloadable={true}
                        showValue={false}
                      />
                    </div>

                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                      <h4 className="text-blue-300 font-medium mb-2">Instrucciones para Estudiantes</h4>
                      <ol className="text-gray-300 text-sm space-y-1 text-left">
                        <li>1. Abre la cámara de tu teléfono</li>
                        <li>2. Apunta al código QR</li>
                        <li>3. Toca el enlace que aparece</li>
                        <li>4. Crea tu personaje y ¡únete a la clase!</li>
                      </ol>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between p-6 border-t border-white/20 bg-white/5">
                <div className="text-gray-400 text-sm">
                  <span className="inline-flex items-center space-x-1">
                    <span>👥</span>
                    <span>{classData._count?.enrollments || 0} estudiantes unidos</span>
                  </span>
                </div>
                <button
                  onClick={onClose}
                  className="px-6 py-2 bg-gradient-to-r from-solar-500 to-orange-600 text-white rounded-lg hover:from-solar-600 hover:to-orange-700 transition-all duration-200 font-medium"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}