// src/app/auth/layout.tsx
import { ToastProvider } from '@/components/ui/Toast'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      {children}
      <ToastProvider />
    </>
  )
}