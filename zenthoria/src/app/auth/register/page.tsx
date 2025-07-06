// src/app/auth/register/page.tsx
import { Metadata } from 'next'
import { AuthLayout } from '@/components/auth/AuthLayout'
import { RegisterForm } from '@/components/auth/RegisterForm'

export const metadata: Metadata = {
  title: 'Registro - Zenthoria',
  description: 'Crea tu cuenta en Zenthoria y comienza tu aventura educativa',
}

export default function RegisterPage() {
  return (
    <AuthLayout
      title="Únete a la aventura"
      subtitle="Crea tu cuenta para comenzar tu experiencia como Guardián"
    >
      <RegisterForm />
    </AuthLayout>
  )
}