<?php 
namespace App\Http\Controllers;

use App\Models\Usuario;
use App\Models\Clase;
use App\Models\Estudiante;
use App\Models\Docente;
use App\Models\Actividad;
use App\Models\RegistroComportamiento;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;

class AdminController extends Controller
{
    public function __construct()
    {
        // Solo usuarios docentes pueden acceder a funciones administrativas
        $this->middleware('user.type:docente');
    }

    public function dashboard()
    {
        $estadisticas = [
            'total_usuarios' => Usuario::where('eliminado', false)->count(),
            'total_docentes' => Docente::count(),
            'total_estudiantes' => Estudiante::count(),
            'total_clases' => Clase::where('activo', true)->count(),
            'clases_activas_hoy' => Clase::where('activo', true)
                ->where('fecha_inicio', '<=', today())
                ->where(function($q) {
                    $q->whereNull('fecha_fin')
                      ->orWhere('fecha_fin', '>=', today());
                })
                ->count(),
            'actividades_pendientes' => Actividad::where('activa', true)
                ->where('fecha_entrega', '>', now())
                ->count(),
        ];

        // Estadísticas de la última semana
        $ultimaSemana = Carbon::now()->subWeek();
        $estadisticasSemana = [
            'nuevos_usuarios' => Usuario::where('created_at', '>=', $ultimaSemana)->count(),
            'nuevas_clases' => Clase::where('created_at', '>=', $ultimaSemana)->count(),
            'actividades_creadas' => Actividad::where('created_at', '>=', $ultimaSemana)->count(),
            'comportamientos_registrados' => RegistroComportamiento::where('created_at', '>=', $ultimaSemana)->count(),
        ];

        // Top clases más activas
        $clasesActivas = Clase::withCount(['actividades', 'registrosComportamiento'])
            ->where('activo', true)
            ->orderBy('actividades_count', 'desc')
            ->limit(5)
            ->get();

        return Inertia::render('Admin/Dashboard', [
            'estadisticas' => $estadisticas,
            'estadisticas_semana' => $estadisticasSemana,
            'clases_activas' => $clasesActivas,
        ]);
    }

    public function usuarios()
    {
        $usuarios = Usuario::with(['tipoUsuario', 'estado'])
            ->where('eliminado', false)
            ->latest()
            ->paginate(20);

        return Inertia::render('Admin/Usuarios', [
            'usuarios' => $usuarios,
        ]);
    }

    public function toggleUsuario($id)
    {
        $usuario = Usuario::findOrFail($id);
        
        // No permitir desactivar el propio usuario
        if ($usuario->id === auth()->id()) {
            return back()->withErrors(['error' => 'No puedes desactivar tu propia cuenta.']);
        }

        $nuevoEstado = $usuario->id_estado === 1 ? 2 : 1; // Toggle entre activo/inactivo
        $usuario->update(['id_estado' => $nuevoEstado]);

        $mensaje = $nuevoEstado === 1 ? 'Usuario activado' : 'Usuario desactivado';
        return back()->with('success', $mensaje);
    }

    public function reporteGeneral()
    {
        $fechaInicio = request('fecha_inicio', now()->startOfMonth());
        $fechaFin = request('fecha_fin', now());

        $reporte = [
            'periodo' => [
                'inicio' => $fechaInicio,
                'fin' => $fechaFin,
            ],
            'usuarios' => [
                'total' => Usuario::whereBetween('created_at', [$fechaInicio, $fechaFin])->count(),
                'docentes' => Usuario::where('id_tipo_usuario', 2)
                    ->whereBetween('created_at', [$fechaInicio, $fechaFin])
                    ->count(),
                'estudiantes' => Usuario::where('id_tipo_usuario', 1)
                    ->whereBetween('created_at', [$fechaInicio, $fechaFin])
                    ->count(),
            ],
            'actividad' => [
                'clases_creadas' => Clase::whereBetween('created_at', [$fechaInicio, $fechaFin])->count(),
                'actividades_creadas' => Actividad::whereBetween('created_at', [$fechaInicio, $fechaFin])->count(),
                'comportamientos_registrados' => RegistroComportamiento::whereBetween('created_at', [$fechaInicio, $fechaFin])->count(),
            ],
            'engagement' => [
                'promedio_actividades_por_clase' => Actividad::whereBetween('created_at', [$fechaInicio, $fechaFin])
                    ->count() / max(1, Clase::whereBetween('created_at', [$fechaInicio, $fechaFin])->count()),
                'promedio_estudiantes_por_clase' => $this->calcularPromedioEstudiantesPorClase($fechaInicio, $fechaFin),
            ]
        ];

        return Inertia::render('Admin/ReporteGeneral', [
            'reporte' => $reporte,
            'fecha_inicio' => $fechaInicio,
            'fecha_fin' => $fechaFin,
        ]);
    }

    private function calcularPromedioEstudiantesPorClase($fechaInicio, $fechaFin)
    {
        $clases = Clase::whereBetween('created_at', [$fechaInicio, $fechaFin])->count();
        if ($clases === 0) return 0;

        $totalEstudiantes = Clase::whereBetween('created_at', [$fechaInicio, $fechaFin])
            ->withCount('estudiantes')
            ->sum('estudiantes_count');

        return $totalEstudiantes / $clases;
    }

    public function exportarDatos(Request $request)
    {
        $tipo = $request->get('tipo', 'usuarios');
        
        switch ($tipo) {
            case 'usuarios':
                return $this->exportarUsuarios();
            case 'clases':
                return $this->exportarClases();
            case 'actividades':
                return $this->exportarActividades();
            default:
                return back()->withErrors(['error' => 'Tipo de exportación no válido.']);
        }
    }

    private function exportarUsuarios()
    {
        $usuarios = Usuario::with(['tipoUsuario', 'estado'])
            ->where('eliminado', false)
            ->get();

        $csv = "ID,Nombre,Correo,Tipo,Estado,Fecha Registro\n";
        
        foreach ($usuarios as $usuario) {
            $csv .= "{$usuario->id},{$usuario->nombre},{$usuario->correo},{$usuario->tipoUsuario->nombre},{$usuario->estado->nombre},{$usuario->created_at}\n";
        }

        return response($csv)
            ->header('Content-Type', 'text/csv')
            ->header('Content-Disposition', 'attachment; filename="usuarios.csv"');
    }

    private function exportarClases()
    {
        $clases = Clase::with(['docente.usuario'])
            ->withCount('estudiantes')
            ->get();

        $csv = "ID,Nombre,Docente,Estudiantes,Año Académico,Activa,Fecha Creación\n";
        
        foreach ($clases as $clase) {
            $csv .= "{$clase->id},{$clase->nombre},{$clase->docente->usuario->nombre},{$clase->estudiantes_count},{$clase->año_academico},{$clase->activo},{$clase->created_at}\n";
        }

        return response($csv)
            ->header('Content-Type', 'text/csv')
            ->header('Content-Disposition', 'attachment; filename="clases.csv"');
    }

    private function exportarActividades()
    {
        $actividades = Actividad::with(['clase', 'tipoActividad'])
            ->withCount('entregas')
            ->get();

        $csv = "ID,Título,Clase,Tipo,Entregas,Experiencia,Monedas,Activa,Fecha Creación\n";
        
        foreach ($actividades as $actividad) {
            $csv .= "{$actividad->id},{$actividad->titulo},{$actividad->clase->nombre},{$actividad->tipoActividad->nombre},{$actividad->entregas_count},{$actividad->puntos_experiencia},{$actividad->puntos_moneda},{$actividad->activa},{$actividad->created_at}\n";
        }

        return response($csv)
            ->header('Content-Type', 'text/csv')
            ->header('Content-Disposition', 'attachment; filename="actividades.csv"');
    }
}