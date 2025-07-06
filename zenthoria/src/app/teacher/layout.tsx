export default function TeacherLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="teacher-layout">
      {/* Aquí se puede agregar navegación específica del profesor */}
      {children}
    </div>
  )
}