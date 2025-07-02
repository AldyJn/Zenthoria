<?php

namespace App\Http\Controllers;

use App\Models\Personaje;
use App\Models\Clase;
use App\Models\ClaseRpg;
use App\Models\NivelExperiencia;
use App\Services\ExperienciaService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

class PersonajeController extends Controller
{
      use AuthorizesRequests;
    protected $experienciaService;

    public function __construct(ExperienciaService $experienciaService)
    {
        $this->experienciaService = $experienciaService;
    }

    /**
     * Mostrar detalles del personaje
     */
    public function show($id)
    {
        $personaje = Personaje::with([
            'estudiante.usuario',
            'clase.docente.usuario',
            'claseRpg',
            'estadisticas'
        ])->findOrFail($id);

        // Verificar acceso
        $user = auth()->user();
        if ($user->esEstudiante() && $personaje->id_estudiante !== $user->estudiante->id) {
            // Permitir ver otros personajes de la misma clase
            $misClases = $user->estudiante->clases->pluck('id');
            abort_unless($misClases->contains($personaje->id_clase), 403);
        }
        if ($user->esDocente() && $personaje->clase->id_docente !== $user->docente->id) {
            abort(403);
        }

        // Estadísticas del personaje
        $estadisticas = [
            'experiencia_actual' => $personaje->experiencia,
            'nivel_actual' => $personaje->nivel,
            'experiencia_siguiente_nivel' => $this->experienciaService->experienciaParaSiguienteNivel($personaje),
            'progreso_nivel' => $this->experienciaService->progresoNivelActual($personaje),
            'actividades_completadas' => $personaje->estadisticas->actividades_completadas ?? 0,
            'misiones_completadas' => $personaje->estadisticas->misiones_completadas ?? 0,
        ];

        // Badges obtenidos
        $badges = $personaje->estudiante->badgesEnClase($personaje->id_clase);

        // Historial de experiencia reciente
        $historialExperiencia = $this->obtenerHistorialExperiencia($personaje);

        return Inertia::render('Personajes/Show', [
            'personaje' => $personaje,
            'estadisticas' => $estadisticas,
            'badges' => $badges,
            'historial_experiencia' => $historialExperiencia,
            'puede_editar' => $user->esEstudiante() && 
                            $personaje->id_estudiante === $user->estudiante->id,
        ]);
    }

    /**
     * Mostrar formulario de edición del personaje
     */
    public function edit($id)
    {
        $personaje = Personaje::with(['estudiante.usuario', 'clase', 'claseRpg'])
            ->findOrFail($id);

        // Solo el dueño del personaje puede editarlo
        abort_unless(
            auth()->user()->esEstudiante() && 
            $personaje->id_estudiante === auth()->user()->estudiante->id,
            403
        );

        $clasesRpg = ClaseRpg::all();
        $avatarsDisponibles = $this->getAvatarsDisponibles();

        return Inertia::render('Personajes/Edit', [
            'personaje' => $personaje,
            'clases_rpg' => $clasesRpg,
            'avatars_disponibles' => $avatarsDisponibles,
        ]);
    }

    /**
     * Actualizar personaje
     */
    public function update(Request $request, $id)
    {
        $personaje = Personaje::findOrFail($id);

        abort_unless(
            auth()->user()->esEstudiante() && 
            $personaje->id_estudiante === auth()->user()->estudiante->id,
            403
        );

        $validated = $request->validate([
            'nombre' => 'nullable|string|max:100',
            'id_clase_rpg' => 'required|exists:clase_rpg,id',
            'avatar_base' => 'required|string|in:guerrero,mago,arquero,sanador,explorador',
        ]);

        $personaje->update($validated);

        return redirect()
            ->route('personajes.show', $personaje->id)
            ->with('success', 'Personaje actualizado exitosamente.');
    }

    /**
     * Ranking de personajes en una clase
     */
    public function ranking($claseId)
    {
        $clase = Clase::with('docente.usuario')->findOrFail($claseId);

        // Verificar acceso a la clase
        $this->authorize('view', $clase);

        $personajes = Personaje::where('id_clase', $claseId)
            ->with(['estudiante.usuario', 'claseRpg', 'estadisticas'])
            ->orderBy('experiencia', 'desc')
            ->orderBy('nivel', 'desc')
            ->get();

        // Agregar posición en el ranking
        $personajes = $personajes->map(function ($personaje, $index) {
            $personaje->posicion = $index + 1;
            return $personaje;
        });

        // Estadísticas generales del ranking
        $estadisticasRanking = [
            'total_personajes' => $personajes->count(),
            'nivel_promedio' => $personajes->avg('nivel'),
            'experiencia_promedio' => $personajes->avg('experiencia'),
            'nivel_maximo' => $personajes->max('nivel'),
            'experiencia_maxima' => $personajes->max('experiencia'),
        ];

        // Si es estudiante, destacar su posición
        $miPosicion = null;
        if (auth()->user()->esEstudiante()) {
            $miPersonaje = $personajes->where('id_estudiante', auth()->user()->estudiante->id)->first();
            $miPosicion = $miPersonaje ? $miPersonaje->posicion : null;
        }

        return Inertia::render('Personajes/Ranking', [
            'clase' => $clase,
            'personajes' => $personajes,
            'estadisticas_ranking' => $estadisticasRanking,
            'mi_posicion' => $miPosicion,
        ]);
    }

    /**
     * Cambiar avatar del personaje
     */
    public function cambiarAvatar(Request $request, $id)
    {
        $personaje = Personaje::findOrFail($id);

        abort_unless(
            auth()->user()->esEstudiante() && 
            $personaje->id_estudiante === auth()->user()->estudiante->id,
            403
        );

        $validated = $request->validate([
            'avatar_base' => 'required|string|in:guerrero,mago,arquero,sanador,explorador',
        ]);

        $personaje->update(['avatar_base' => $validated['avatar_base']]);

        return response()->json([
            'success' => true,
            'message' => 'Avatar actualizado exitosamente.',
            'nuevo_avatar' => $validated['avatar_base'],
        ]);
    }

    /**
     * Obtener estadísticas detalladas del personaje (API)
     */
    public function estadisticas($id)
    {
        $personaje = Personaje::with(['estudiante.usuario', 'clase', 'estadisticas'])
            ->findOrFail($id);

        // Verificar acceso
        $user = auth()->user();
        if ($user->esEstudiante() && $personaje->id_estudiante !== $user->estudiante->id) {
            $misClases = $user->estudiante->clases->pluck('id');
            abort_unless($misClases->contains($personaje->id_clase), 403);
        }
        if ($user->esDocente() && $personaje->clase->id_docente !== $user->docente->id) {
            abort(403);
        }

        $estadisticas = [
            // Información básica
            'nivel' => $personaje->nivel,
            'experiencia' => $personaje->experiencia,
            'experiencia_siguiente_nivel' => $this->experienciaService->experienciaParaSiguienteNivel($personaje),
            'progreso_nivel' => $this->experienciaService->progresoNivelActual($personaje),
            
            // Progreso académico
            'actividades_completadas' => $personaje->estadisticas->actividades_completadas ?? 0,
            'misiones_completadas' => $personaje->estadisticas->misiones_completadas ?? 0,
            
            // Comparación con la clase
            'posicion_experiencia' => $this->obtenerPosicionEnClase($personaje, 'experiencia'),
            'posicion_nivel' => $this->obtenerPosicionEnClase($personaje, 'nivel'),
            'percentil_clase' => $this->calcularPercentilClase($personaje),
            
            // Progreso temporal
            'experiencia_ultima_semana' => $this->calcularExperienciaUltimaSemana($personaje),
            'experiencia_ultimo_mes' => $this->calcularExperienciaUltimoMes($personaje),
        ];

        return response()->json($estadisticas);
    }

    /**
     * Obtener avatars disponibles
     */
    private function getAvatarsDisponibles(): array
    {
        return [
            'guerrero' => [
                'nombre' => 'Guerrero',
                'descripcion' => 'Valiente y resistente',
                'imagen' => '/images/avatars/guerrero.png',
                'color' => '#F44336',
            ],
            'mago' => [
                'nombre' => 'Mago',
                'descripcion' => 'Sabio y poderoso',
                'imagen' => '/images/avatars/mago.png',
                'color' => '#9C27B0',
            ],
            'arquero' => [
                'nombre' => 'Arquero',
                'descripcion' => 'Preciso y ágil',
                'imagen' => '/images/avatars/arquero.png',
                'color' => '#4CAF50',
            ],
            'sanador' => [
                'nombre' => 'Sanador',
                'descripcion' => 'Compasivo y sabio',
                'imagen' => '/images/avatars/sanador.png',
                'color' => '#2196F3',
            ],
            'explorador' => [
                'nombre' => 'Explorador',
                'descripcion' => 'Curioso y aventurero',
                'imagen' => '/images/avatars/explorador.png',
                'color' => '#FF9800',
            ],
        ];
    }

    /**
     * Obtener historial de experiencia reciente
     */
    private function obtenerHistorialExperiencia(Personaje $personaje): array
    {
        // Por ahora, retornamos datos de ejemplo
        // En una implementación completa, tendrías una tabla de historial de experiencia
        return [
            [
                'fecha' => now()->subDays(1),
                'experiencia' => 25,
                'descripcion' => 'Actividad completada: Tarea de Matemáticas',
                'tipo' => 'actividad',
            ],
            [
                'fecha' => now()->subDays(2),
                'experiencia' => 15,
                'descripcion' => 'Comportamiento positivo: Participación activa',
                'tipo' => 'comportamiento',
            ],
            [
                'fecha' => now()->subDays(3),
                'experiencia' => 50,
                'descripcion' => 'Misión completada: Proyecto de Ciencias',
                'tipo' => 'mision',
            ],
        ];
    }

    /**
     * Obtener posición del personaje en la clase
     */
    private function obtenerPosicionEnClase(Personaje $personaje, string $campo): int
    {
        return Personaje::where('id_clase', $personaje->id_clase)
            ->where($campo, '>', $personaje->$campo)
            ->count() + 1;
    }

    /**
     * Calcular percentil del personaje en la clase
     */
    private function calcularPercentilClase(Personaje $personaje): float
    {
        $totalPersonajes = Personaje::where('id_clase', $personaje->id_clase)->count();
        $posicion = $this->obtenerPosicionEnClase($personaje, 'experiencia');
        
        if ($totalPersonajes <= 1) {
            return 100.0;
        }
        
        return round((($totalPersonajes - $posicion + 1) / $totalPersonajes) * 100, 1);
    }

    /**
     * Calcular experiencia ganada en la última semana
     */
    private function calcularExperienciaUltimaSemana(Personaje $personaje): int
    {
        // Implementación simplificada
        // En una versión completa, consultarías el historial de experiencia
        return rand(50, 200);
    }

    /**
     * Calcular experiencia ganada en el último mes
     */
    private function calcularExperienciaUltimoMes(Personaje $personaje): int
    {
        // Implementación simplificada
        return rand(200, 800);
    }

    /**
     * Simulación de subida de nivel (para testing)
     */
    public function subirNivel(Request $request, $id)
    {
        // Solo en ambiente de desarrollo
        if (!app()->environment(['local', 'testing'])) {
            abort(404);
        }

        $personaje = Personaje::findOrFail($id);
        
        // Verificar acceso
        $user = auth()->user();
        if ($user->esEstudiante() && $personaje->id_estudiante !== $user->estudiante->id) {
            abort(403);
        }
        if ($user->esDocente() && $personaje->clase->id_docente !== $user->docente->id) {
            abort(403);
        }

        $experiencia = $request->input('experiencia', 100);
        $nivelAnterior = $personaje->nivel;
        
        $subioNivel = $this->experienciaService->otorgarExperiencia(
            $personaje,
            $experiencia,
            'Experiencia de prueba'
        );

        return response()->json([
            'success' => true,
            'experiencia_agregada' => $experiencia,
            'nivel_anterior' => $nivelAnterior,
            'nivel_actual' => $personaje->nivel,
            'subio_nivel' => $subioNivel,
            'experiencia_total' => $personaje->experiencia,
        ]);
    }
}