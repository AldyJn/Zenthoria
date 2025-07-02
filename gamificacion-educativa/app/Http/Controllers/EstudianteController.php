<?php

// app/Http/Controllers/EstudianteController.php
namespace App\Http\Controllers;

use App\Models\Estudiante;
use App\Models\Usuario;
use App\Models\Personaje;
use App\Models\EntregaActividad;
use App\Models\RegistroComportamiento;
use App\Models\Asistencia;
use App\Models\TransaccionMoneda;
use App\Models\EstudianteBadge;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Hash;

class EstudianteController extends Controller
{
    public function index()
    {
        // Solo docentes pueden ver lista de estudiantes
        abort_unless(auth()->user()->esDocente(), 403);

        $estudiantes = Estudiante::with(['usuario'])
            ->whereHas('usuario', function($q) {
                $q->where('eliminado', false);
            })
            ->withCount(['clases' => function($q) {
                $q->wherePivot('activo', true);
            }])
            ->latest()
            ->paginate(20);

        // Agregar estadísticas básicas a cada estudiante
        $estudiantes->getCollection()->transform(function ($estudiante) {
            $estudiante->nivel_promedio = $estudiante->personajes()->avg('nivel') ?? 1;
            $estudiante->experiencia_total = $estudiante->personajes()->sum('experiencia');
            $estudiante->actividades_completadas = $estudiante->entregasActividad()
                ->whereNotNull('nota')
                ->count();
            return $estudiante;
        });

        return Inertia::render('Estudiantes/Index', [
            'estudiantes' => $estudiantes,
        ]);
    }

    public function show($id)
    {
        $estudiante = Estudiante::with(['usuario', 'clases.docente.usuario'])
            ->findOrFail($id);

        // Verificar permisos: el mismo estudiante, su docente, o admin
        $puedeVer = $this->puedeVerEstudiante($estudiante);
        abort_unless($puedeVer, 403);

        // Estadísticas generales del estudiante
        $estadisticas = [
            'total_clases' => $estudiante->clasesActivas()->count(),
            'nivel_promedio' => $estudiante->personajes()->avg('nivel') ?? 1,
            'nivel_maximo' => $estudiante->personajes()->max('nivel') ?? 1,
            'experiencia_total' => $estudiante->personajes()->sum('experiencia'),
            'actividades_completadas' => $estudiante->entregasActividad()
                ->whereNotNull('nota')
                ->count(),
            'actividades_pendientes' => $this->getActividadesPendientes($estudiante),
            'promedio_notas' => $estudiante->entregasActividad()
                ->whereNotNull('nota')
                ->avg('nota') ?? 0,
            'comportamientos_positivos' => $estudiante->registrosComportamiento()
                ->whereHas('tipoComportamiento', function($q) {
                    $q->where('valor_puntos', '>', 0);
                })
                ->count(),
            'asistencia_promedio' => $this->calcularAsistenciaPromedio($estudiante),
        ];

        // Personajes en todas las clases
        $personajes = $estudiante->personajes()
            ->with(['clase.docente.usuario', 'claseRpg', 'nivelInfo'])
            ->get();

        // Actividad reciente
        $actividadReciente = [
            'entregas_recientes' => $estudiante->entregasActividad()
                ->with(['actividad.clase', 'actividad.tipoActividad'])
                ->latest()
                ->limit(5)
                ->get(),
            'comportamientos_recientes' => $estudiante->registrosComportamiento()
                ->with(['clase', 'tipoComportamiento'])
                ->latest()
                ->limit(5)
                ->get(),
            'badges_recientes' => EstudianteBadge::where('id_estudiante', $estudiante->id)
                ->with(['badge', 'clase'])
                ->latest('fecha_obtenido')
                ->limit(5)
                ->get(),
        ];

        // Progreso por clase
        $progresoClases = $this->getProgresoClases($estudiante);

        return Inertia::render('Estudiantes/Show', [
            'estudiante' => $estudiante,
            'estadisticas' => $estadisticas,
            'personajes' => $personajes,
            'actividad_reciente' => $actividadReciente,
            'progreso_clases' => $progresoClases,
            'es_perfil_propio' => auth()->user()->esEstudiante() && auth()->user()->estudiante->id === $estudiante->id,
        ]);
    }

    public function perfil()
    {
        // Perfil del estudiante autenticado
        abort_unless(auth()->user()->esEstudiante(), 403);
        $estudiante = auth()->user()->estudiante;
        return $this->show($estudiante->id);
    }

    public function edit($id)
    {
        $estudiante = Estudiante::with('usuario')->findOrFail($id);
        
        // Solo el mismo estudiante puede editarse
        abort_unless(auth()->user()->esEstudiante() && auth()->user()->estudiante->id === $estudiante->id, 403);

        return Inertia::render('Estudiantes/Edit', [
            'estudiante' => $estudiante,
        ]);
    }

    public function update(Request $request, $id)
    {
        $estudiante = Estudiante::with('usuario')->findOrFail($id);
        
        abort_unless(auth()->user()->esEstudiante() && auth()->user()->estudiante->id === $estudiante->id, 403);

        $request->validate([
            'nombre' => 'required|string|max:100',
            'correo' => 'required|email|unique:usuario,correo,' . $estudiante->usuario->id,
            'codigo_estudiante' => 'required|string|max:20|unique:estudiante,codigo_estudiante,' . $estudiante->id,
            'grado' => 'nullable|string|max:50',
            'seccion' => 'nullable|string|max:10',
        ]);

        $estudiante->usuario->update([
            'nombre' => $request->nombre,
            'correo' => $request->correo,
        ]);

        $estudiante->update([
            'codigo_estudiante' => $request->codigo_estudiante,
            'grado' => $request->grado,
            'seccion' => $request->seccion,
        ]);

        return redirect()->route('estudiantes.show', $estudiante->id)
            ->with('success', 'Perfil actualizado exitosamente.');
    }

    public function misClases()
    {
        abort_unless(auth()->user()->esEstudiante(), 403);
        $estudiante = auth()->user()->estudiante;
        
        $clases = $estudiante->clasesActivas()
            ->with(['docente.usuario'])
            ->get();

        // Agregar información específica de cada clase
        $clasesDetalladas = $clases->map(function($clase) use ($estudiante) {
            $personaje = $estudiante->personajeEnClase($clase->id);
            $saldoMonedas = TransaccionMoneda::obtenerSaldo($estudiante->id, $clase->id);
            
            return [
                'clase' => $clase,
                'personaje' => $personaje,
                'saldo_monedas' => $saldoMonedas,
                'actividades_pendientes' => $clase->actividades()
                    ->where('activa', true)
                    ->where('fecha_entrega', '>', now())
                    ->whereDoesntHave('entregas', function($q) use ($estudiante) {
                        $q->where('id_estudiante', $estudiante->id);
                    })
                    ->count(),
                'promedio_notas' => $estudiante->entregasActividad()
                    ->whereHas('actividad', function($q) use ($clase) {
                        $q->where('id_clase', $clase->id);
                    })
                    ->whereNotNull('nota')
                    ->avg('nota') ?? 0,
                'asistencia_porcentaje' => Asistencia::porcentajeAsistencia($estudiante->id, $clase->id),
                'badges_obtenidos' => EstudianteBadge::where('id_estudiante', $estudiante->id)
                    ->where('id_clase', $clase->id)
                    ->count(),
            ];
        });

        return Inertia::render('Estudiantes/MisClases', [
            'clases_detalladas' => $clasesDetalladas,
            'estudiante' => $estudiante,
        ]);
    }

    public function misPersonajes()
    {
        abort_unless(auth()->user()->esEstudiante(), 403);
        $estudiante = auth()->user()->estudiante;
        
        $personajes = $estudiante->personajes()
            ->with(['clase.docente.usuario', 'claseRpg', 'nivelInfo', 'estadisticas'])
            ->get();

        // Estadísticas generales de personajes
        $estadisticasPersonajes = [
            'total_personajes' => $personajes->count(),
            'nivel_promedio' => $personajes->avg('nivel'),
            'nivel_maximo' => $personajes->max('nivel'),
            'experiencia_total' => $personajes->sum('experiencia'),
            'clase_favorita' => $personajes->sortByDesc('experiencia')->first()?->claseRpg->nombre,
        ];

        return Inertia::render('Estudiantes/MisPersonajes', [
            'personajes' => $personajes,
            'estadisticas_personajes' => $estadisticasPersonajes,
        ]);
    }

    public function misActividades()
    {
        abort_unless(auth()->user()->esEstudiante(), 403);
        $estudiante = auth()->user()->estudiante;
        
        $actividades = $estudiante->entregasActividad()
            ->with(['actividad.clase', 'actividad.tipoActividad'])
            ->latest()
            ->paginate(20);

        // Estadísticas de actividades
        $estadisticasActividades = [
            'total_entregas' => $estudiante->entregasActividad()->count(),
            'entregas_calificadas' => $estudiante->entregasActividad()->whereNotNull('nota')->count(),
            'promedio_general' => $estudiante->entregasActividad()->whereNotNull('nota')->avg('nota') ?? 0,
            'entregas_tardias' => $estudiante->entregasActividad()
                ->whereHas('actividad', function($q) {
                    $q->whereRaw('entrega_actividad.fecha_entrega > actividad.fecha_entrega');
                })
                ->count(),
            'actividades_pendientes' => $this->getActividadesPendientes($estudiante),
        ];

        return Inertia::render('Estudiantes/MisActividades', [
            'actividades' => $actividades,
            'estadisticas_actividades' => $estadisticasActividades,
        ]);
    }

    public function miComportamiento()
    {
        abort_unless(auth()->user()->esEstudiante(), 403);
        $estudiante = auth()->user()->estudiante;
        
        $comportamientos = $estudiante->registrosComportamiento()
            ->with(['clase', 'tipoComportamiento'])
            ->latest()
            ->paginate(20);

        // Estadísticas de comportamiento
        $estadisticasComportamiento = [
            'total_registros' => $estudiante->registrosComportamiento()->count(),
            'comportamientos_positivos' => $estudiante->registrosComportamiento()
                ->whereHas('tipoComportamiento', function($q) {
                    $q->where('valor_puntos', '>', 0);
                })
                ->count(),
            'comportamientos_negativos' => $estudiante->registrosComportamiento()
                ->whereHas('tipoComportamiento', function($q) {
                    $q->where('valor_puntos', '<', 0);
                })
                ->count(),
            'puntos_totales' => $estudiante->registrosComportamiento()
                ->join('tipo_comportamiento', 'registro_comportamiento.id_tipo_comportamiento', '=', 'tipo_comportamiento.id')
                ->sum('tipo_comportamiento.valor_puntos'),
            'tendencia_semanal' => $this->getTendenciaSemanal($estudiante),
        ];

        return Inertia::render('Estudiantes/MiComportamiento', [
            'comportamientos' => $comportamientos,
            'estadisticas_comportamiento' => $estadisticasComportamiento,
        ]);
    }

    public function misBadges()
    {
        abort_unless(auth()->user()->esEstudiante(), 403);
        $estudiante = auth()->user()->estudiante;
        
        $badges = EstudianteBadge::where('id_estudiante', $estudiante->id)
            ->with(['badge', 'clase'])
            ->latest('fecha_obtenido')
            ->get();

        // Agrupar por clase
        $badgesPorClase = $badges->groupBy('clase.nombre');

        // Estadísticas de badges
        $estadisticasBadges = [
            'total_badges' => $badges->count(),
            'badges_este_mes' => $badges->where('fecha_obtenido', '>=', now()->startOfMonth())->count(),
            'clase_con_mas_badges' => $badgesPorClase->map(function($badgesClase, $nombreClase) {
                return ['clase' => $nombreClase, 'cantidad' => $badgesClase->count()];
            })->sortByDesc('cantidad')->first(),
        ];

        return Inertia::render('Estudiantes/MisBadges', [
            'badges' => $badges,
            'badges_por_clase' => $badgesPorClase,
            'estadisticas_badges' => $estadisticasBadges,
        ]);
    }

    public function historialAcademico()
    {
        abort_unless(auth()->user()->esEstudiante(), 403);
        $estudiante = auth()->user()->estudiante;
        
        // Historial completo por año académico
        $historialPorAño = $estudiante->clases()
            ->with(['docente.usuario'])
            ->get()
            ->groupBy('año_academico')
            ->sortKeysDesc();

        $historialDetallado = $historialPorAño->map(function($clases, $año) use ($estudiante) {
            return [
                'año' => $año,
                'clases' => $clases->map(function($clase) use ($estudiante) {
                    $personaje = $estudiante->personajeEnClase($clase->id);
                    return [
                        'clase' => $clase,
                        'personaje' => $personaje,
                        'promedio_notas' => $estudiante->entregasActividad()
                            ->whereHas('actividad', function($q) use ($clase) {
                                $q->where('id_clase', $clase->id);
                            })
                            ->whereNotNull('nota')
                            ->avg('nota') ?? 0,
                        'asistencia' => Asistencia::porcentajeAsistencia($estudiante->id, $clase->id),
                        'actividades_completadas' => $estudiante->entregasActividad()
                            ->whereHas('actividad', function($q) use ($clase) {
                                $q->where('id_clase', $clase->id);
                            })
                            ->whereNotNull('nota')
                            ->count(),
                    ];
                }),
            ];
        });

        return Inertia::render('Estudiantes/HistorialAcademico', [
            'historial_detallado' => $historialDetallado,
            'estudiante' => $estudiante,
        ]);
    }

    // Métodos auxiliares privados
    private function puedeVerEstudiante($estudiante)
    {
        $user = auth()->user();
        
        // El mismo estudiante
        if ($user->esEstudiante() && $user->estudiante->id === $estudiante->id) {
            return true;
        }
        
        // Docente que tiene al estudiante en sus clases
        if ($user->esDocente()) {
            return $user->docente->clases()
                ->whereHas('estudiantes', function($q) use ($estudiante) {
                    $q->where('estudiante.id', $estudiante->id);
                })
                ->exists();
        }
        
        return false;
    }

    private function getActividadesPendientes($estudiante)
    {
        return $estudiante->clases()
            ->join('actividad', 'clase.id', '=', 'actividad.id_clase')
            ->leftJoin('entrega_actividad', function($join) use ($estudiante) {
                $join->on('actividad.id', '=', 'entrega_actividad.id_actividad')
                     ->where('entrega_actividad.id_estudiante', $estudiante->id);
            })
            ->whereNull('entrega_actividad.id')
            ->where('actividad.activa', true)
            ->where('actividad.fecha_entrega', '>', now())
            ->count();
    }

    private function calcularAsistenciaPromedio($estudiante)
    {
        $totalClases = $estudiante->asistencias()->count();
        if ($totalClases === 0) return 0;
        
        $presentes = $estudiante->asistencias()->where('presente', true)->count();
        return ($presentes / $totalClases) * 100;
    }

    private function getProgresoClases($estudiante)
    {
        return $estudiante->clasesActivas()->get()->map(function($clase) use ($estudiante) {
            $personaje = $estudiante->personajeEnClase($clase->id);
            $totalActividades = $clase->actividades()->count();
            $actividadesCompletadas = $estudiante->entregasActividad()
                ->whereHas('actividad', function($q) use ($clase) {
                    $q->where('id_clase', $clase->id);
                })
                ->whereNotNull('nota')
                ->count();
            
            return [
                'clase' => $clase,
                'personaje' => $personaje,
                'progreso_actividades' => $totalActividades > 0 ? ($actividadesCompletadas / $totalActividades) * 100 : 0,
                'actividades_completadas' => $actividadesCompletadas,
                'total_actividades' => $totalActividades,
                'asistencia' => Asistencia::porcentajeAsistencia($estudiante->id, $clase->id),
                'promedio_notas' => $estudiante->entregasActividad()
                    ->whereHas('actividad', function($q) use ($clase) {
                        $q->where('id_clase', $clase->id);
                    })
                    ->whereNotNull('nota')
                    ->avg('nota') ?? 0,
            ];
        });
    }

    private function getTendenciaSemanal($estudiante)
    {
        $tendencia = collect();
        
        for ($i = 3; $i >= 0; $i--) {
            $inicioSemana = now()->subWeeks($i)->startOfWeek();
            $finSemana = now()->subWeeks($i)->endOfWeek();
            
            $puntos = $estudiante->registrosComportamiento()
                ->whereBetween('fecha', [$inicioSemana, $finSemana])
                ->join('tipo_comportamiento', 'registro_comportamiento.id_tipo_comportamiento', '=', 'tipo_comportamiento.id')
                ->sum('tipo_comportamiento.valor_puntos');
            
            $tendencia->push([
                'semana' => $inicioSemana->format('d M'),
                'puntos' => $puntos,
            ]);
        }
        
        return $tendencia;
    }

    public function exportarDatos(Request $request)
    {
        abort_unless(auth()->user()->esEstudiante(), 403);
        $estudiante = auth()->user()->estudiante;
        $tipo = $request->get('tipo', 'resumen');

        switch ($tipo) {
            case 'resumen':
                return $this->exportarResumen($estudiante);
            case 'actividades':
                return $this->exportarActividades($estudiante);
            case 'comportamiento':
                return $this->exportarComportamiento($estudiante);
            default:
                return back()->withErrors(['error' => 'Tipo de exportación no válido.']);
        }
    }

    private function exportarResumen($estudiante)
    {
        $datos = [
            'Estudiante' => $estudiante->usuario->nombre,
            'Código' => $estudiante->codigo_estudiante,
            'Grado' => $estudiante->grado,
            'Sección' => $estudiante->seccion,
            'Total Clases' => $estudiante->clasesActivas()->count(),
            'Nivel Promedio' => $estudiante->personajes()->avg('nivel') ?? 1,
            'Experiencia Total' => $estudiante->personajes()->sum('experiencia'),
            'Actividades Completadas' => $estudiante->entregasActividad()->whereNotNull('nota')->count(),
            'Promedio General' => $estudiante->entregasActividad()->whereNotNull('nota')->avg('nota') ?? 0,
            'Badges Obtenidos' => EstudianteBadge::where('id_estudiante', $estudiante->id)->count(),
        ];

        $csv = "Métrica,Valor\n";
        foreach ($datos as $metrica => $valor) {
            $csv .= "{$metrica},{$valor}\n";
        }

        return response($csv)
            ->header('Content-Type', 'text/csv')
            ->header('Content-Disposition', 'attachment; filename="mi-resumen-academico.csv"');
    }

    private function exportarActividades($estudiante)
    {
        $actividades = $estudiante->entregasActividad()
            ->with(['actividad.clase', 'actividad.tipoActividad'])
            ->get();

        $csv = "Clase,Actividad,Tipo,Fecha Entrega,Nota,Comentario\n";
        foreach ($actividades as $entrega) {
            $csv .= "{$entrega->actividad->clase->nombre},{$entrega->actividad->titulo},{$entrega->actividad->tipoActividad->nombre},{$entrega->fecha_entrega},{$entrega->nota},{$entrega->comentario}\n";
        }

        return response($csv)
            ->header('Content-Type', 'text/csv')
            ->header('Content-Disposition', 'attachment; filename="mis-actividades.csv"');
    }

    private function exportarComportamiento($estudiante)
    {
        $comportamientos = $estudiante->registrosComportamiento()
            ->with(['clase', 'tipoComportamiento'])
            ->get();

        $csv = "Clase,Tipo Comportamiento,Puntos,Descripción,Fecha\n";
        foreach ($comportamientos as $registro) {
            $csv .= "{$registro->clase->nombre},{$registro->tipoComportamiento->nombre},{$registro->tipoComportamiento->valor_puntos},{$registro->descripcion},{$registro->fecha}\n";
        }

        return response($csv)
            ->header('Content-Type', 'text/csv')
            ->header('Content-Disposition', 'attachment; filename="mi-comportamiento.csv"');
    }
}