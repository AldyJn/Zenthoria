<?php

// app/Http/Controllers/DashboardController.php
namespace App\Http\Controllers;

use App\Models\Actividad;
use App\Models\TransaccionMoneda;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        $user = auth()->user();
        
        if ($user->esDocente()) {
            return $this->dashboardProfesor($user);
        }
        
        if ($user->esEstudiante()) {
            return $this->dashboardEstudiante($user);
        }
        
        // Si no es ni docente ni estudiante, redirigir a perfil
        return redirect()->route('perfil.edit');
    }
    
    private function dashboardProfesor($user)
    {
        $docente = $user->docente;
        
        // Obtener clases del docente con conteo de estudiantes
        $clases = $docente->clases()
            ->with(['estudiantes'])
            ->withCount('estudiantes')
            ->latest()
            ->paginate(10);
            
        // Estadísticas del docente
        $estadisticas = [
            'clases_activas' => $docente->clasesActivas()->count(),
            'total_estudiantes' => $docente->totalEstudiantes(),
            'actividades_mes' => Actividad::whereIn('id_clase', 
                $docente->clases()->pluck('id'))
                ->whereMonth('created_at', now()->month)
                ->count(),
            'promedio_general' => $this->calcularPromedioGeneralDocente($docente),
        ];
        
        return Inertia::render('Dashboard/Profesor', [
            'clases' => $clases,
            'estadisticas' => $estadisticas,
        ]);
    }
    
    private function dashboardEstudiante($user)
    {
        $estudiante = $user->estudiante;
        
        // Obtener clases del estudiante con información adicional
        $clases = $estudiante->clasesActivas()
            ->with(['docente.usuario'])
            ->get()
            ->map(function($clase) use ($estudiante) {
                $personaje = $estudiante->personajeEnClase($clase->id);
                
                return [
                    'clase' => $clase,
                    'personaje' => $personaje ? [
                        'id' => $personaje->id,
                        'nombre' => $personaje->nombre,
                        'nivel' => $personaje->nivel,
                        'experiencia' => $personaje->experiencia,
                        'clase_rpg' => $personaje->claseRpg->nombre ?? 'Sin clase',
                        'experiencia_nivel_actual' => $personaje->experienciaEnNivelActual(),
                        'experiencia_para_nivel' => $personaje->experienciaParaSiguienteNivel(),
                        'experiencia_siguiente_nivel' => $personaje->experienciaParaSiguienteNivel(),
                    ] : null,
                    'saldo_monedas' => TransaccionMoneda::obtenerSaldo($estudiante->id, $clase->id),
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
                        ->avg('nota'),
                ];
            });
            
        // Actividades próximas a vencer (en los próximos 3 días)
        $actividades_proximas = Actividad::whereIn('id_clase', 
                $estudiante->clasesActivas()->pluck('id'))
            ->where('activa', true)
            ->where('fecha_entrega', '>', now())
            ->where('fecha_entrega', '<', now()->addDays(3))
            ->whereDoesntHave('entregas', function($q) use ($estudiante) {
                $q->where('id_estudiante', $estudiante->id);
            })
            ->with('clase')
            ->orderBy('fecha_entrega')
            ->limit(5)
            ->get();
        
        return Inertia::render('Dashboard/Estudiante', [
            'clases' => $clases,
            'actividades_proximas' => $actividades_proximas,
        ]);
    }
    
    private function calcularPromedioGeneralDocente($docente)
    {
        $todasLasNotas = collect();
        
        foreach ($docente->clases as $clase) {
            $notasClase = $clase->actividades()
                ->with('entregas')
                ->get()
                ->flatMap(function($actividad) {
                    return $actividad->entregas->where('nota', '!=', null)->pluck('nota');
                });
            
            $todasLasNotas = $todasLasNotas->merge($notasClase);
        }
        
        return $todasLasNotas->avg() ?? 0;
    }
}