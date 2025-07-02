<?php

// app/Http/Controllers/BadgeController.php
namespace App\Http\Controllers;

use App\Models\Badge;
use App\Models\EstudianteBadge;
use App\Models\Clase;
use Illuminate\Http\Request;
use Inertia\Inertia;

class BadgeController extends Controller
{
    public function index()
    {
        abort_unless(auth()->user()->esDocente(), 403);

        $badges = Badge::latest()->get();

        return Inertia::render('Badges/Index', [
            'badges' => $badges,
        ]);
    }

    public function estudianteBadges($estudianteId, $claseId)
    {
        $clase = Clase::findOrFail($claseId);
        $this->authorize('view', $clase);

        $badges = EstudianteBadge::where('id_estudiante', $estudianteId)
            ->where('id_clase', $claseId)
            ->with('badge')
            ->latest('fecha_obtenido')
            ->get();

        return Inertia::render('Badges/EstudianteBadges', [
            'clase' => $clase,
            'badges' => $badges,
        ]);
    }

    public function verificarBadges($estudianteId, $claseId)
    {
        $badgesOtorgados = Badge::verificarBadges($estudianteId, $claseId);

        if (!empty($badgesOtorgados)) {
            // Crear notificaciones para cada badge obtenido
            foreach ($badgesOtorgados as $badge) {
                NotificacionController::crear(
                    auth()->id(),
                    '¡Nuevo logro desbloqueado!',
                    "Has obtenido el badge: {$badge->nombre}",
                    'success',
                    ['badge_id' => $badge->id]
                );
            }
        }

        return response()->json([
            'badges_otorgados' => $badgesOtorgados,
            'total' => count($badgesOtorgados)
        ]);
    }

    public function create()
    {
        abort_unless(auth()->user()->esDocente(), 403);

        return Inertia::render('Badges/Create');
    }

    public function store(Request $request)
    {
        abort_unless(auth()->user()->esDocente(), 403);

        $request->validate([
            'nombre' => 'required|string|max:100',
            'descripcion' => 'required|string|max:500',
            'tipo' => 'required|in:nivel,actividades_completadas,asistencia_perfecta,comportamiento_positivo',
            'valor_requerido' => 'required|integer|min:1',
            'imagen_url' => 'nullable|url',
        ]);

        Badge::create($request->validated());

        return redirect()->route('badges.index')
            ->with('success', 'Badge creado exitosamente.');
    }
}