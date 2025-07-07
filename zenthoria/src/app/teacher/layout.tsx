// src/app/teacher/layout.tsx
'use client'

import { TeacherSidebar } from '@/components/teacher/TeacherSidebar'

export default function TeacherLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="teacher-layout flex min-h-screen bg-gradient-to-br from-solar-900 via-slate-900 to-solar-800">
      {/* Sidebar de navegación */}
      <TeacherSidebar />
      
      {/* Contenido principal con offset para el sidebar */}
      <main className="flex-1 transition-all duration-300" style={{ marginLeft: '280px' }}>
        <div className="min-h-screen">
          {children}
        </div>
      </main>

      {/* Responsive: Overlay para móvil cuando sidebar esté abierto */}
      <style jsx global>{`
        @media (max-width: 768px) {
          .teacher-layout main {
            margin-left: 80px;
          }
        }
        
        /* Ajuste para sidebar colapsado */
        .teacher-layout.sidebar-collapsed main {
          margin-left: 80px;
        }
      `}</style>
    </div>
  )
}