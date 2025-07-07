// src/components/ui/ErrorBoundary.tsx - Nuevo componente para manejo de errores
'use client'

import React from 'react'
import { ExclamationTriangleIcon, ArrowPathIcon } from '@heroicons/react/24/outline'

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
}

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ComponentType<{ error?: Error; reset: () => void }>
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      const Fallback = this.props.fallback || DefaultErrorFallback
      return (
        <Fallback 
          error={this.state.error} 
          reset={() => this.setState({ hasError: false, error: undefined })}
        />
      )
    }

    return this.props.children
  }
}

// Componente de fallback por defecto
function DefaultErrorFallback({ error, reset }: { error?: Error; reset: () => void }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-arc-900 via-slate-900 to-void-800 flex items-center justify-center p-8">
      <div className="max-w-md mx-auto text-center">
        <ExclamationTriangleIcon className="w-16 h-16 text-red-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">Algo salió mal</h2>
        <p className="text-gray-400 mb-4">
          {error?.message || 'Ha ocurrido un error inesperado'}
        </p>
        <div className="space-y-3">
          <button
            onClick={reset}
            className="flex items-center gap-2 mx-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <ArrowPathIcon className="w-5 h-5" />
            Intentar nuevamente
          </button>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 text-gray-400 hover:text-white transition-colors"
          >
            Recargar página
          </button>
        </div>
      </div>
    </div>
  )
}

// Hook para manejo de errores en componentes funcionales
export function useErrorHandler() {
  const [error, setError] = React.useState<Error | null>(null)

  const resetError = React.useCallback(() => {
    setError(null)
  }, [])

  const handleError = React.useCallback((error: Error | string) => {
    const errorObj = typeof error === 'string' ? new Error(error) : error
    console.error('Error capturado:', errorObj)
    setError(errorObj)
  }, [])

  // Efecto para lanzar el error y que sea capturado por ErrorBoundary
  React.useEffect(() => {
    if (error) {
      throw error
    }
  }, [error])

  return { handleError, resetError, hasError: !!error }
}

// Componente específico para errores de autenticación
export function AuthErrorFallback({ reset }: { reset: () => void }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-arc-900 via-slate-900 to-void-800 flex items-center justify-center p-8">
      <div className="max-w-md mx-auto text-center">
        <ExclamationTriangleIcon className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">Sesión Expirada</h2>
        <p className="text-gray-400 mb-6">
          Tu sesión ha expirado. Por favor, inicia sesión nuevamente.
        </p>
        <div className="space-y-3">
          <button
            onClick={() => window.location.href = '/auth/login'}
            className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Ir a Iniciar Sesión
          </button>
          <button
            onClick={reset}
            className="px-6 py-2 text-gray-400 hover:text-white transition-colors"
          >
            Intentar nuevamente
          </button>
        </div>
      </div>
    </div>
  )
}

// Wrapper para componentes que pueden tener errores de autenticación
export function withAuthErrorBoundary<P extends object>(
  Component: React.ComponentType<P>
) {
  return function WithAuthErrorBoundary(props: P) {
    return (
      <ErrorBoundary fallback={AuthErrorFallback}>
        <Component {...props} />
      </ErrorBoundary>
    )
  }
}