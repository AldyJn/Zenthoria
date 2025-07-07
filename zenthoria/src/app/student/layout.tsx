// src/app/student/layout.tsx
'use client'

import { StudentSidebar } from '@/components/student/StudentSidebar'

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="student-layout flex min-h-screen bg-gradient-to-br from-arc-900 via-slate-900 to-void-800">
      {/* Sidebar de navegación */}
      <StudentSidebar />
      
      {/* Contenido principal con offset para el sidebar */}
      <main className="flex-1 transition-all duration-300" style={{ marginLeft: '280px' }}>
        <div className="min-h-screen">
          {children}
        </div>
      </main>

      {/* Responsive: Overlay para móvil cuando sidebar esté abierto */}
      <style jsx global>{`
        @media (max-width: 768px) {
          .student-layout main {
            margin-left: 80px;
          }
        }
        
        /* Ajuste para sidebar colapsado */
        .student-layout.sidebar-collapsed main {
          margin-left: 80px;
        }
      `}</style>
    </div>
  )
}