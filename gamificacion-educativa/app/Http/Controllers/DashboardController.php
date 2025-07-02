<?php
// app/Http/Controllers/DashboardController.php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Clase;
use App\Models\Actividad;
use App\Models\Personaje;

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

    private function dashboardDocente($user)
    {
        $docente = $user->docente;
        
        // Estadísticas básicas
        $clases = $docente->clases()->with(['estudiantes'])->get();
        $totalEstudiantes = $clases->sum(function($clase) {
            return $clase->estudiantes->count();
        });

        // Actividades recientes
        $actividadesRecientes = collect(); // Por ahora vacío
        if ($clases->isNotEmpty()) {
            $actividadesRecientes = Actividad::whereIn('id_clase', $clases->pluck('id'))
                ->orderBy('created_at', 'desc')
                ->limit(5)
                ->get();
        }

        return view('dashboard.docente', [
            'estadisticas' => [
                'total_clases' => $clases->count(),
                'total_estudiantes' => $totalEstudiantes,
                'actividades_pendientes' => $actividadesRecientes->where('activa', true)->count(),
                'comportamientos_hoy' => 0, // Por implementar
            ],
            'clases' => $clases->map(function($clase) {
                return [
                    'id' => $clase->id,
                    'nombre' => $clase->nombre,
                    'descripcion' => $clase->descripcion,
                    'codigo_invitacion' => $clase->codigo_invitacion,
                    'activa' => $clase->activa,
                    'estudiantes_count' => $clase->estudiantes->count(),
                ];
            }),
            'actividades_recientes' => $actividadesRecientes,
        ]);
    }

    private function dashboardEstudiante($user)
    {
        $estudiante = $user->estudiante;
        
        // Clases del estudiante
        $clases = $estudiante->clases()->where('estudiante_clase.activo', true)->get();
        
        // Personajes del estudiante
        $personajes = collect(); // Por ahora vacío
        if ($estudiante) {
            $personajes = Personaje::where('id_estudiante', $estudiante->id)
                ->with('clase')
                ->get();
        }

        return view('dashboard.estudiante', [
            'estadisticas' => [
                'total_clases' => $clases->count(),
                'total_personajes' => $personajes->count(),
                'nivel_promedio' => $personajes->avg('nivel') ?? 0,
                'experiencia_total' => $personajes->sum('experiencia'),
            ],
            'clases' => $clases->map(function($clase) {
                return [
                    'id' => $clase->id,
                    'nombre' => $clase->nombre,
                    'descripcion' => $clase->descripcion,
                    'docente' => $clase->docente->usuario->nombre ?? 'N/A',
                ];
            }),
            'personajes' => $personajes->map(function($personaje) {
                return [
                    'id' => $personaje->id,
                    'nombre' => $personaje->nombre,
                    'clase_rpg' => $personaje->clase_rpg,
                    'nivel' => $personaje->nivel,
                    'experiencia' => $personaje->experiencia,
                    'clase_nombre' => $personaje->clase->nombre ?? 'N/A',
                ];
            }),
            'actividades_pendientes' => collect(), // Por implementar
        ]);
    }

    public function stats()
    {
        $user = auth()->user();
        
        if ($user->esDocente()) {
            $docente = $user->docente;
            return response()->json([
                'total_clases' => $docente->clases()->count(),
                'total_estudiantes' => 0, // Por implementar
            ]);
        } else {
            $estudiante = $user->estudiante;
            return response()->json([
                'total_clases' => $estudiante->clases()->where('estudiante_clase.activo', true)->count(),
                'experiencia_total' => 0, // Por implementar
            ]);
        }
    }
}