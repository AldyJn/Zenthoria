// src/app/layout.tsx
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { SessionProvider } from '@/components/providers/SessionProvider'
import { ToastProvider } from '@/components/ui/Toast'
import { QueryProvider } from '@/components/providers/QueryProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    default: 'Zenthoria - Plataforma Educativa Gamificada',
    template: '%s | Zenthoria'
  },
  description: 'Plataforma de educación gamificada inspirada en Destiny 2. Crea personajes, únete a clases y vive una experiencia educativa única.',
  keywords: ['educación', 'gamificación', 'aprendizaje', 'estudiantes', 'profesores', 'destiny 2'],
  authors: [{ name: 'Zenthoria Team' }],
  metadataBase: new URL(process.env.NEXTAUTH_URL || 'http://localhost:3000'),
  robots: 'index, follow',
  openGraph: {
    title: 'Zenthoria - Plataforma Educativa Gamificada',
    description: 'Transforma la educación con una experiencia gamificada única',
    type: 'website',
    locale: 'es_ES',
  }
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" className="h-full">
      <body className={`${inter.className} h-full antialiased`}>
        <QueryProvider>
          <SessionProvider>
            {children}
            <ToastProvider />
          </SessionProvider>
        </QueryProvider>
      </body>
    </html>
  )
}