<?php
// app/Http/Controllers/DashboardController.php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\Clase;
use App\Models\Actividad;
use App\Models\Personaje;
use App\Models\RegistroComportamiento;
use App\Models\EntregaActividad;
use App\Models\EstudianteBadge;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        $user = auth()->user();
        
        if ($user->esDocente()) {
            return $this->dashboardDocente($user);
        } else {
            return $this->dashboardEstudiante($user);
        }
    }

    /**
     * Dashboard para docentes
     */
    private function dashboardDocente($user)
    {
        $docente = $user->docente;

        // Estadísticas generales
        $totalClases = $docente->clases()->count();
        $totalEstudiantes = DB::table('estudiante_clase')
            ->whereIn('id_clase', $docente->clases()->pluck('id'))
            ->where('activo', true)
            ->distinct('id_estudiante')
            ->count();
        
        $totalActividades = Actividad::whereIn('id_clase', $docente->clases()->pluck('id'))->count();
        
        $actividadesPendientes = Actividad::whereIn('id_clase', $docente->clases()->pluck('id'))
            ->where('fecha_limite', '>=', now())
            ->where('activa', true)
            ->count();

        // Clases recientes con estadísticas
        $clasesRecientes = $docente->clases()
            ->with(['estudiantes' => function($query) {
                $query->where('estudiante_clase.activo', true);
            }])
            ->withCount(['estudiantes as estudiantes_activos' => function($query) {
                $query->where('estudiante_clase.activo', true);
            }])
            ->orderBy('fecha_creacion', 'desc')
            ->limit(5)
            ->get()
            ->map(function($clase) {
                return [
                    'id' => $clase->id,
                    'nombre' => $clase->nombre,
                    'descripcion' => $clase->descripcion,
                    'codigo_acceso' => $clase->codigo_acceso,
                    'estudiantes_activos' => $clase->estudiantes_activos,
                    'fecha_creacion' => $clase->fecha_creacion->format('d/m/Y'),
                    'actividades_pendientes' => $clase->actividades()
                        ->where('fecha_limite', '>=', now())
                        ->where('activa', true)
                        ->count(),
                ];
            });

        // Actividades recientes
        $actividadesRecientes = Actividad::whereIn('id_clase', $docente->clases()->pluck('id'))
            ->with(['clase', 'tipoActividad'])
            ->withCount(['entregas as entregas_pendientes' => function($query) {
                $query->whereNull('nota');
            }])
            ->orderBy('fecha_creacion', 'desc')
            ->limit(8)
            ->get()
            ->map(function($actividad) {
                return [
                    'id' => $actividad->id,
                    'titulo' => $actividad->titulo,
                    'clase' => $actividad->clase->nombre,
                    'tipo' => $actividad->tipoActividad->nombre,
                    'fecha_limite' => $actividad->fecha_limite?->format('d/m/Y H:i'),
                    'entregas_pendientes' => $actividad->entregas_pendientes,
                    'puntos_experiencia' => $actividad->puntos_experiencia,
                ];
            });

        // Estadísticas de la semana
        $inicioSemana = now()->startOfWeek();
        $finSemana = now()->endOfWeek();

        $estadisticasSemana = [
            'nuevos_estudiantes' => DB::table('estudiante_clase')
                ->whereIn('id_clase', $docente->clases()->pluck('id'))
                ->whereBetween('fecha_union', [$inicioSemana, $finSemana])
                ->count(),
            
            'actividades_creadas' => Actividad::whereIn('id_clase', $docente->clases()->pluck('id'))
                ->whereBetween('fecha_creacion', [$inicioSemana, $finSemana])
                ->count(),
                
            'entregas_calificadas' => EntregaActividad::whereHas('actividad', function($query) use ($docente) {
                    $query->whereIn('id_clase', $docente->clases()->pluck('id'));
                })
                ->whereBetween('fecha_calificacion', [$inicioSemana, $finSemana])
                ->whereNotNull('nota')
                ->count(),
        ];

        // Top estudiantes por experiencia
        $topEstudiantes = DB::table('personaje')
            ->join('estudiante', 'personaje.id_estudiante', '=', 'estudiante.id')
            ->join('usuario', 'estudiante.id_usuario', '=', 'usuario.id')
            ->join('clase_rpg', 'personaje.id_clase_rpg', '=', 'clase_rpg.id')
            ->whereIn('personaje.id_clase', $docente->clases()->pluck('id'))
            ->select(
                'usuario.nombre as estudiante_nombre',
                'personaje.nombre as personaje_nombre',
                'personaje.nivel',
                'personaje.experiencia',
                'clase_rpg.nombre as clase_rpg_nombre',
                'clase_rpg.imagen_url as clase_rpg_imagen'
            )
            ->orderBy('personaje.experiencia', 'desc')
            ->limit(5)
            ->get();

        return Inertia::render('Dashboard/Docente', [
            'user' => $user,
            'estadisticas' => [
                'total_clases' => $totalClases,
                'total_estudiantes' => $totalEstudiantes,
                'total_actividades' => $totalActividades,
                'actividades_pendientes' => $actividadesPendientes,
            ],
            'clases_recientes' => $clasesRecientes,
            'actividades_recientes' => $actividadesRecientes,
            'estadisticas_semana' => $estadisticasSemana,
            'top_estudiantes' => $topEstudiantes,
        ]);
    }

    /**
     * Dashboard para estudiantes
     */
    private function dashboardEstudiante($user)
    {
        $estudiante = $user->estudiante;

        // Clases del estudiante
        $clases = $estudiante->clases()
            ->where('estudiante_clase.activo', true)
            ->with(['docente.usuario'])
            ->get();

        // Personajes del estudiante
        $personajes = Personaje::where('id_estudiante', $estudiante->id)
            ->with(['clase', 'claseRpg'])
            ->get()
            ->map(function($personaje) {
                return [
                    'id' => $personaje->id,
                    'nombre' => $personaje->nombre,
                    'nivel' => $personaje->nivel,
                    'experiencia' => $personaje->experiencia,
                    'clase_nombre' => $personaje->clase->nombre,
                    'clase_rpg' => [
                        'nombre' => $personaje->claseRpg->nombre,
                        'imagen_url' => $personaje->claseRpg->imagen_url,
                    ],
                    'exp_siguiente_nivel' => $this->calcularExpSiguienteNivel($personaje->nivel),
                    'porcentaje_nivel' => $this->calcularPorcentajeNivel($personaje->experiencia, $personaje->nivel),
                ];
            });

        // Actividades pendientes
        $actividadesPendientes = Actividad::whereIn('id_clase', $clases->pluck('id'))
            ->where('activa', true)
            ->where('fecha_limite', '>=', now())
            ->whereDoesntHave('entregas', function($query) use ($estudiante) {
                $query->where('id_estudiante', $estudiante->id);
            })
            ->with(['clase', 'tipoActividad'])
            ->orderBy('fecha_limite', 'asc')
            ->limit(8)
            ->get()
            ->map(function($actividad) {
                return [
                    'id' => $actividad->id,
                    'titulo' => $actividad->titulo,
                    'descripcion' => $actividad->descripcion,
                    'clase' => $actividad->clase->nombre,
                    'tipo' => $actividad->tipoActividad->nombre,
                    'fecha_limite' => $actividad->fecha_limite?->format('d/m/Y H:i'),
                    'puntos_experiencia' => $actividad->puntos_experiencia,
                    'dias_restantes' => $actividad->fecha_limite ? 
                        now()->diffInDays($actividad->fecha_limite, false) : null,
                ];
            });

        // Actividades recientes calificadas
        $actividadesCalificadas = EntregaActividad::where('id_estudiante', $estudiante->id)
            ->whereNotNull('nota')
            ->with(['actividad.clase', 'actividad.tipoActividad'])
            ->orderBy('fecha_calificacion', 'desc')
            ->limit(5)
            ->get()
            ->map(function($entrega) {
                return [
                    'actividad_titulo' => $entrega->actividad->titulo,
                    'clase' => $entrega->actividad->clase->nombre,
                    'tipo' => $entrega->actividad->tipoActividad->nombre,
                    'nota' => $entrega->nota,
                    'fecha_calificacion' => $entrega->fecha_calificacion->format('d/m/Y'),
                    'comentario' => $entrega->comentario,
                ];
            });

        // Estadísticas del estudiante
        $estadisticas = [
            'total_clases' => $clases->count(),
            'total_personajes' => $personajes->count(),
            'experiencia_total' => $personajes->sum('experiencia'),
            'nivel_promedio' => $personajes->avg('nivel'),
            'actividades_completadas' => EntregaActividad::where('id_estudiante', $estudiante->id)
                ->whereNotNull('nota')
                ->count(),
            'promedio_general' => EntregaActividad::where('id_estudiante', $estudiante->id)
                ->whereNotNull('nota')
                ->avg('nota'),
        ];

        // Badges obtenidos recientemente
        $badgesRecientes = EstudianteBadge::where('id_estudiante', $estudiante->id)
            ->with('badge')
            ->orderBy('fecha_obtencion', 'desc')
            ->limit(6)
            ->get()
            ->map(function($estudianteBadge) {
                return [
                    'nombre' => $estudianteBadge->badge->nombre,
                    'descripcion' => $estudianteBadge->badge->descripcion,
                    'imagen_url' => $estudianteBadge->badge->imagen_url,
                    'fecha_obtencion' => $estudianteBadge->fecha_obtencion->format('d/m/Y'),
                ];
            });

        // Registro de comportamiento reciente
        $comportamientoReciente = RegistroComportamiento::where('id_estudiante', $estudiante->id)
            ->with(['clase', 'tipoComportamiento'])
            ->orderBy('fecha', 'desc')
            ->limit(5)
            ->get()
            ->map(function($registro) {
                return [
                    'clase' => $registro->clase->nombre,
                    'tipo' => $registro->tipoComportamiento->nombre,
                    'descripcion' => $registro->descripcion,
                    'puntos' => $registro->tipoComportamiento->valor_puntos,
                    'fecha' => $registro->fecha->format('d/m/Y H:i'),
                    'es_positivo' => $registro->tipoComportamiento->valor_puntos > 0,
                ];
            });

        return Inertia::render('Dashboard/Estudiante', [
            'user' => $user,
            'clases' => $clases,
            'personajes' => $personajes,
            'actividades_pendientes' => $actividadesPendientes,
            'actividades_calificadas' => $actividadesCalificadas,
            'estadisticas' => $estadisticas,
            'badges_recientes' => $badgesRecientes,
            'comportamiento_reciente' => $comportamientoReciente,
        ]);
    }

    /**
     * Calcular experiencia necesaria para el siguiente nivel
     */
    private function calcularExpSiguienteNivel($nivel)
    {
        // Fórmula exponencial: (nivel * 100) + (nivel^2 * 50)
        return ($nivel * 100) + (pow($nivel, 2) * 50);
    }

    /**
     * Calcular porcentaje de progreso hacia el siguiente nivel
     */
    private function calcularPorcentajeNivel($experienciaActual, $nivelActual)
    {
        $expNivelActual = $this->calcularExpNivel($nivelActual);
        $expSiguienteNivel = $this->calcularExpNivel($nivelActual + 1);
        
        $expEnNivel = $experienciaActual - $expNivelActual;
        $expNecesaria = $expSiguienteNivel - $expNivelActual;
        
        return $expNecesaria > 0 ? min(100, ($expEnNivel / $expNecesaria) * 100) : 0;
    }

    /**
     * Calcular experiencia total necesaria para alcanzar un nivel
     */
    private function calcularExpNivel($nivel)
    {
        $exp = 0;
        for ($i = 1; $i < $nivel; $i++) {
            $exp += ($i * 100) + (pow($i, 2) * 50);
        }
        return $exp;
    }

    /**
     * API para obtener notificaciones del usuario
     */
    public function notificaciones()
    {
        $user = auth()->user();
        
        // Aquí implementarías la lógica de notificaciones
        // Por ahora devolvemos un array vacío
        $notificaciones = [];
        
        return response()->json([
            'notificaciones' => $notificaciones,
            'count' => count($notificaciones),
        ]);
    }

    /**
     * API para marcar notificación como leída
     */
    public function marcarNotificacionLeida($id)
    {
        // Implementar lógica para marcar notificación como leída
        return response()->json(['success' => true]);
    }
}