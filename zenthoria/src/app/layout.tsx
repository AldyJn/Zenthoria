import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { SessionProvider } from '@/components/providers/SessionProvider'
import { ToastProvider } from '@/components/ui/Toast'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    default: 'Zenthoria - Plataforma Educativa Gamificada',
    template: '%s | Zenthoria'
  },
  description: 'Plataforma de educación gamificada inspirada en Destiny 2. Crea personajes, únete a clases y vive una experiencia educativa única.',
  keywords: ['educación', 'gamificación', 'aprendizaje', 'estudiantes', 'profesores', 'destiny 2'],
  authors: [{ name: 'Zenthoria Team' }],
  viewport: 'width=device-width, initial-scale=1',
  robots: 'index, follow',
  openGraph: {
    title: 'Zenthoria - Plataforma Educativa Gamificada',
    description: 'Transforma la educación con una experiencia gamificada única',
    type: 'website',
    locale: 'es_ES',
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" className="h-full">
      <body className={`${inter.className} h-full antialiased`}>
        <SessionProvider>
          {children}
          <ToastProvider />
        </SessionProvider>
      </body>
    </html>
  )
}