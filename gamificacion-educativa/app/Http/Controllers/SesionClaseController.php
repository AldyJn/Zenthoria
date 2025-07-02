<?php

// app/Http/Controllers/SesionClaseController.php
namespace App\Http\Controllers;

use App\Models\Clase;
use App\Models\SesionClase;
use App\Models\Asistencia;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SesionClaseController extends Controller
{
    public function iniciar($claseId)
    {
        $clase = Clase::with(['estudiantes.usuario'])->findOrFail($claseId);
        $this->authorize('update', $clase);

        // Verificar si ya hay una sesión activa
        $sesionActiva = SesionClase::where('id_clase', $claseId)
            ->where('activa', true)
            ->first();

        if ($sesionActiva) {
            return back()->withErrors(['error' => 'Ya hay una sesión activa para esta clase.']);
        }

        $sesion = SesionClase::create([
            'id_clase' => $claseId,
            'fecha_inicio' => now(),
            'activa' => true,
        ]);

        return redirect()->route('sesiones.show', $sesion->id)
            ->with('success', 'Sesión de clase iniciada exitosamente.');
    }

    public function show($id)
    {
        $sesion = SesionClase::with(['clase.estudiantes.usuario'])->findOrFail($id);
        $this->authorize('update', $sesion->clase);

        $estudiantes = $sesion->clase->estudiantesActivos()->get();
        
        // Obtener asistencias ya marcadas
        $asistencias = Asistencia::where('id_clase', $sesion->id_clase)
            ->where('fecha', today())
            ->get()
            ->keyBy('id_estudiante');

        return Inertia::render('Sesiones/Show', [
            'sesion' => $sesion,
            'estudiantes' => $estudiantes,
            'asistencias' => $asistencias,
            'estudiante_seleccionado' => null,
        ]);
    }

    public function seleccionarEstudianteAleatorio($id)
    {
        $sesion = SesionClase::with(['clase.estudiantes.usuario'])->findOrFail($id);
        $this->authorize('update', $sesion->clase);

        $estudiantes = $sesion->clase->estudiantesActivos()->get();
        
        if ($estudiantes->isEmpty()) {
            return back()->withErrors(['error' => 'No hay estudiantes en esta clase.']);
        }

        $estudianteSeleccionado = $estudiantes->random();

        return back()->with([
            'estudiante_seleccionado' => $estudianteSeleccionado,
            'success' => "Estudiante seleccionado: {$estudianteSeleccionado->usuario->nombre}"
        ]);
    }

    public function pausar($id)
    {
        $sesion = SesionClase::findOrFail($id);
        $this->authorize('update', $sesion->clase);

        $sesion->update(['activa' => false]);

        return back()->with('success', 'Sesión pausada.');
    }

    public function reanudar($id)
    {
        $sesion = SesionClase::findOrFail($id);
        $this->authorize('update', $sesion->clase);

        $sesion->update(['activa' => true]);

        return back()->with('success', 'Sesión reanudada.');
    }

    public function terminar($id)
    {
        $sesion = SesionClase::findOrFail($id);
        $this->authorize('update', $sesion->clase);

        $sesion->update([
            'activa' => false,
            'fecha_fin' => now(),
        ]);

        return redirect()->route('clases.show', $sesion->id_clase)
            ->with('success', 'Sesión de clase terminada exitosamente.');
    }
}
