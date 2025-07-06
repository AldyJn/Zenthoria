// src/app/auth/login/page.tsx
import { Metadata } from 'next'
import { AuthLayout } from '@/components/auth/AuthLayout'
import { LoginForm } from '@/components/auth/LoginForm'

export const metadata: Metadata = {
  title: 'Iniciar Sesión - Zenthoria',
  description: 'Accede a tu cuenta de Zenthoria para continuar tu aventura educativa',
}

export default function LoginPage() {
  return (
    <AuthLayout
      title="Bienvenido de vuelta, Guardián"
      subtitle="Inicia sesión para continuar tu aventura"
    >
      <LoginForm />
    </AuthLayout>
  )
}
