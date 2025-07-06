export default function StudentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="student-layout">
      {/* Aquí se puede agregar navegación específica del estudiante */}
      {children}
    </div>
  )
}