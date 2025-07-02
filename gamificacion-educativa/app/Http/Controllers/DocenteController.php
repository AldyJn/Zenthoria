<?php

// app/Http/Controllers/DocenteController.php
namespace App\Http\Controllers;

use App\Models\Docente;
use App\Models\Usuario;
use App\Models\Clase;
use App\Models\Actividad;
use App\Models\RegistroComportamiento;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Hash;
use Carbon\Carbon;

class DocenteController extends Controller
{
    public function index()
    {
        // Solo docentes pueden ver lista de otros docentes
        abort_unless(auth()->user()->esDocente(), 403);

        $docentes = Docente::with(['usuario'])
            ->whereHas('usuario', function($q) {
                $q->where('eliminado', false);
            })
            ->withCount(['clases' => function($q) {
                $q->where('activo', true);
            }])
            ->latest()
            ->paginate(20);

        // Agregar estadísticas básicas a cada docente
        $docentes->getCollection()->transform(function ($docente) {
            $docente->total_estudiantes = $docente->totalEstudiantes();
            $docente->clases_este_año = $docente->clases()
                ->where('año_academico', date('Y'))
                ->count();
            return $docente;
        });

        return Inertia::render('Docentes/Index', [
            'docentes' => $docentes,
        ]);
    }

    public function show($id)
    {
        $docente = Docente::with(['usuario', 'clases.estudiantes.usuario'])
            ->findOrFail($id);

        // Verificar permisos: el mismo docente o admin
        $puedeVer = auth()->user()->esDocente() && 
                   (auth()->user()->docente->id === $docente->id || auth()->user()->esAdmin());
        
        abort_unless($puedeVer, 403);

        // Estadísticas completas del docente
        $estadisticas = [
            'total_clases' => $docente->clases()->count(),
            'clases_activas' => $docente->clasesActivas()->count(),
            'total_estudiantes' => $docente->totalEstudiantes(),
            'estudiantes_activos' => $docente->clases()
                ->join('clase_estudiante', 'clase.id', '=', 'clase_estudiante.id_clase')
                ->where('clase_estudiante.activo', true)
                ->distinct('clase_estudiante.id_estudiante')
                ->count('clase_estudiante.id_estudiante'),
            'actividades_creadas' => Actividad::whereIn('id_clase', 
                $docente->clases()->pluck('id'))->count(),
            'actividades_este_mes' => Actividad::whereIn('id_clase', 
                $docente->clases()->pluck('id'))
                ->whereMonth('created_at', now()->month)
                ->count(),
            'comportamientos_registrados' => RegistroComportamiento::whereIn('id_clase', 
                $docente->clases()->pluck('id'))->count(),
            'promedio_estudiantes_por_clase' => $docente->clases()
                ->withCount('estudiantes')
                ->avg('estudiantes_count') ?? 0,
        ];

        // Clases con más detalle
        $clasesDetalladas = $docente->clases()
            ->withCount(['estudiantes', 'actividades', 'registrosComportamiento'])
            ->with(['estudiantes' => function($q) {
                $q->with('usuario')->limit(5);
            }])
            ->latest()
            ->get();

        // Actividad reciente
        $actividadReciente = [
            'actividades_recientes' => Actividad::whereIn('id_clase', $docente->clases()->pluck('id'))
                ->with(['clase', 'tipoActividad'])
                ->latest()
                ->limit(5)
                ->get(),
            'comportamientos_recientes' => RegistroComportamiento::whereIn('id_clase', $docente->clases()->pluck('id'))
                ->with(['estudiante.usuario', 'clase', 'tipoComportamiento'])
                ->latest()
                ->limit(5)
                ->get(),
        ];

        return Inertia::render('Docentes/Show', [
            'docente' => $docente,
            'estadisticas' => $estadisticas,
            'clases' => $clasesDetalladas,
            'actividad_reciente' => $actividadReciente,
            'es_perfil_propio' => auth()->user()->docente->id === $docente->id,
        ]);
    }

    public function perfil()
    {
        // Perfil del docente autenticado
        $docente = auth()->user()->docente;
        return $this->show($docente->id);
    }

    public function edit($id)
    {
        $docente = Docente::with('usuario')->findOrFail($id);
        
        // Solo el mismo docente puede editarse
        abort_unless(auth()->user()->docente->id === $docente->id, 403);

        return Inertia::render('Docentes/Edit', [
            'docente' => $docente,
        ]);
    }

    public function update(Request $request, $id)
    {
        $docente = Docente::with('usuario')->findOrFail($id);
        
        abort_unless(auth()->user()->docente->id === $docente->id, 403);

        $request->validate([
            'nombre' => 'required|string|max:100',
            'correo' => 'required|email|unique:usuario,correo,' . $docente->usuario->id,
            'especialidad' => 'required|string|max:100',
        ]);

        $docente->usuario->update([
            'nombre' => $request->nombre,
            'correo' => $request->correo,
        ]);

        $docente->update([
            'especialidad' => $request->especialidad,
        ]);

        return redirect()->route('docentes.show', $docente->id)
            ->with('success', 'Perfil actualizado exitosamente.');
    }

    public function misClases()
    {
        $docente = auth()->user()->docente;
        
        $clases = $docente->clases()
            ->withCount(['estudiantes', 'actividades', 'registrosComportamiento'])
            ->with(['estudiantes' => function($q) {
                $q->with('usuario')->limit(3);
            }])
            ->latest()
            ->paginate(12);

        // Estadísticas generales de las clases
        $estadisticasClases = [
            'total_clases' => $docente->clases()->count(),
            'clases_activas' => $docente->clasesActivas()->count(),
            'clases_este_año' => $docente->clases()
                ->where('año_academico', date('Y'))
                ->count(),
            'promedio_estudiantes' => $docente->clases()
                ->withCount('estudiantes')
                ->avg('estudiantes_count') ?? 0,
        ];

        return Inertia::render('Docentes/MisClases', [
            'clases' => $clases,
            'estadisticas_clases' => $estadisticasClases,
        ]);
    }

    public function misEstudiantes()
    {
        $docente = auth()->user()->docente;
        
        // Obtener todos los estudiantes únicos de las clases del docente
        $estudiantes = collect();
        
        foreach ($docente->clases as $clase) {
            foreach ($clase->estudiantesActivos as $estudiante) {
                if (!$estudiantes->contains('id', $estudiante->id)) {
                    $estudiante->clase_actual = $clase->nombre;
                    $estudiante->personaje = $estudiante->personajeEnClase($clase->id);
                    $estudiantes->push($estudiante);
                }
            }
        }

        // Estadísticas de estudiantes
        $estadisticasEstudiantes = [
            'total_estudiantes' => $estudiantes->count(),
            'nivel_promedio' => $estudiantes->avg(function($e) {
                return $e->personaje ? $e->personaje->nivel : 1;
            }),
            'experiencia_total' => $estudiantes->sum(function($e) {
                return $e->personaje ? $e->personaje->experiencia : 0;
            }),
        ];

        return Inertia::render('Docentes/MisEstudiantes', [
            'estudiantes' => $estudiantes->values(),
            'estadisticas_estudiantes' => $estadisticasEstudiantes,
        ]);
    }

    public function estadisticas()
    {
        $docente = auth()->user()->docente;
        
        $estadisticas = [
            'resumen_general' => [
                'total_clases' => $docente->clases()->count(),
                'clases_activas' => $docente->clasesActivas()->count(),
                'total_estudiantes' => $docente->totalEstudiantes(),
                'actividades_creadas' => Actividad::whereIn('id_clase', 
                    $docente->clases()->pluck('id'))->count(),
                'comportamientos_registrados' => RegistroComportamiento::whereIn('id_clase', 
                    $docente->clases()->pluck('id'))->count(),
            ],
            'tendencias_mensuales' => $this->getTendenciasMensuales($docente),
            'clases_mas_activas' => $docente->clases()
                ->withCount(['actividades', 'registrosComportamiento', 'estudiantes'])
                ->orderBy('actividades_count', 'desc')
                ->limit(5)
                ->get(),
            'distribucion_por_grado' => $this->getDistribucionPorGrado($docente),
        ];

        return Inertia::render('Docentes/Estadisticas', [
            'estadisticas' => $estadisticas,
        ]);
    }

    private function getTendenciasMensuales($docente)
    {
        $tendencias = collect();
        
        for ($i = 5; $i >= 0; $i--) {
            $fecha = now()->subMonths($i);
            $inicioMes = $fecha->copy()->startOfMonth();
            $finMes = $fecha->copy()->endOfMonth();
            
            $tendencias->push([
                'mes' => $fecha->format('M Y'),
                'actividades_creadas' => Actividad::whereIn('id_clase', $docente->clases()->pluck('id'))
                    ->whereBetween('created_at', [$inicioMes, $finMes])
                    ->count(),
                'comportamientos_registrados' => RegistroComportamiento::whereIn('id_clase', $docente->clases()->pluck('id'))
                    ->whereBetween('created_at', [$inicioMes, $finMes])
                    ->count(),
                'clases_creadas' => $docente->clases()
                    ->whereBetween('created_at', [$inicioMes, $finMes])
                    ->count(),
            ]);
        }
        
        return $tendencias;
    }

    private function getDistribucionPorGrado($docente)
    {
        return $docente->clases()
            ->selectRaw('grado, COUNT(*) as cantidad, COUNT(DISTINCT clase_estudiante.id_estudiante) as estudiantes')
            ->leftJoin('clase_estudiante', 'clase.id', '=', 'clase_estudiante.id_clase')
            ->where('clase_estudiante.activo', true)
            ->groupBy('grado')
            ->get();
    }

    public function exportarDatos(Request $request)
    {
        $docente = auth()->user()->docente;
        $tipo = $request->get('tipo', 'resumen');

        switch ($tipo) {
            case 'resumen':
                return $this->exportarResumen($docente);
            case 'estudiantes':
                return $this->exportarEstudiantes($docente);
            case 'actividades':
                return $this->exportarActividades($docente);
            default:
                return back()->withErrors(['error' => 'Tipo de exportación no válido.']);
        }
    }

    private function exportarResumen($docente)
    {
        $datos = [
            'Docente' => $docente->usuario->nombre,
            'Especialidad' => $docente->especialidad,
            'Total Clases' => $docente->clases()->count(),
            'Clases Activas' => $docente->clasesActivas()->count(),
            'Total Estudiantes' => $docente->totalEstudiantes(),
            'Actividades Creadas' => Actividad::whereIn('id_clase', $docente->clases()->pluck('id'))->count(),
            'Comportamientos Registrados' => RegistroComportamiento::whereIn('id_clase', $docente->clases()->pluck('id'))->count(),
        ];

        $csv = "Métrica,Valor\n";
        foreach ($datos as $metrica => $valor) {
            $csv .= "{$metrica},{$valor}\n";
        }

        return response($csv)
            ->header('Content-Type', 'text/csv')
            ->header('Content-Disposition', 'attachment; filename="resumen-docente.csv"');
    }

    private function exportarEstudiantes($docente)
    {
        $estudiantes = collect();
        
        foreach ($docente->clases as $clase) {
            foreach ($clase->estudiantesActivos as $estudiante) {
                $personaje = $estudiante->personajeEnClase($clase->id);
                $estudiantes->push([
                    'clase' => $clase->nombre,
                    'estudiante' => $estudiante->usuario->nombre,
                    'codigo' => $estudiante->codigo_estudiante,
                    'grado' => $estudiante->grado,
                    'seccion' => $estudiante->seccion,
                    'nivel' => $personaje ? $personaje->nivel : 1,
                    'experiencia' => $personaje ? $personaje->experiencia : 0,
                ]);
            }
        }

        $csv = "Clase,Estudiante,Código,Grado,Sección,Nivel,Experiencia\n";
        foreach ($estudiantes as $est) {
            $csv .= "{$est['clase']},{$est['estudiante']},{$est['codigo']},{$est['grado']},{$est['seccion']},{$est['nivel']},{$est['experiencia']}\n";
        }

        return response($csv)
            ->header('Content-Type', 'text/csv')
            ->header('Content-Disposition', 'attachment; filename="mis-estudiantes.csv"');
    }

    private function exportarActividades($docente)
    {
        $actividades = Actividad::whereIn('id_clase', $docente->clases()->pluck('id'))
            ->with(['clase', 'tipoActividad'])
            ->withCount('entregas')
            ->get();

        $csv = "Clase,Actividad,Tipo,Fecha Entrega,Experiencia,Monedas,Entregas,Activa\n";
        foreach ($actividades as $actividad) {
            $csv .= "{$actividad->clase->nombre},{$actividad->titulo},{$actividad->tipoActividad->nombre},{$actividad->fecha_entrega},{$actividad->puntos_experiencia},{$actividad->puntos_moneda},{$actividad->entregas_count},{$actividad->activa}\n";
        }

        return response($csv)
            ->header('Content-Type', 'text/csv')
            ->header('Content-Disposition', 'attachment; filename="mis-actividades.csv"');
    }
}