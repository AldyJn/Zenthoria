<?php
// app/Http/Controllers/ClaseController.php
namespace App\Http\Controllers;

use App\Models\Clase;
use App\Models\Estudiante;
use App\Models\InscripcionClase;
use App\Models\ClaseRpg;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class ClaseController extends Controller
{
    public function index()
    {
        $user = Auth::user();
        
        if ($user->esDocente()) {
            // Mostrar clases del docente
            $clases = Clase::where('id_docente', $user->docente->id)
                ->withCount(['estudiantes', 'inscripciones'])
                ->orderBy('created_at', 'desc')
                ->get();
                
            return view('clases.index-docente', compact('clases'));
        } else {
            // Mostrar clases del estudiante
            $clases = $user->estudiante->clases()
                ->withPivot('fecha_ingreso', 'activo')
                ->orderBy('inscripcion_clase.created_at', 'desc')
                ->get();
                
            return view('clases.index-estudiante', compact('clases'));
        }
    }

    public function create()
    {
        // Solo docentes pueden crear clases
        abort_unless(Auth::user()->esDocente(), 403);
        
        $clasesRpg = ClaseRpg::where('activo', true)->get();
        
        return view('clases.create', compact('clasesRpg'));
    }

    public function store(Request $request)
    {
        abort_unless(Auth::user()->esDocente(), 403);
        
        $request->validate([
            'nombre' => 'required|string|max:100',
            'descripcion' => 'nullable|string|max:500',
            'grado' => 'required|string|max:10',
            'seccion' => 'required|string|max:10',
            'año_academico' => 'required|string|max:4',
            'fecha_inicio' => 'required|date',
            'fecha_fin' => 'required|date|after:fecha_inicio',
            'id_clase_rpg' => 'required|exists:clase_rpg,id'
        ]);

        try {
            DB::beginTransaction();
            
            $clase = Clase::create([
                'nombre' => $request->nombre,
                'descripcion' => $request->descripcion,
                'id_docente' => Auth::user()->docente->id,
                'grado' => $request->grado,
                'seccion' => $request->seccion,
                'año_academico' => $request->año_academico,
                'fecha_inicio' => $request->fecha_inicio,
                'fecha_fin' => $request->fecha_fin,
                'activo' => true
            ]);

            DB::commit();
            
            return redirect()->route('clases.show', $clase)
                ->with('success', 'Clase creada exitosamente. Código de invitación: ' . $clase->codigo_invitacion);
                
        } catch (\Exception $e) {
            DB::rollback();
            return back()->withErrors(['error' => 'Error al crear la clase: ' . $e->getMessage()]);
        }
    }

    public function show(Clase $clase)
    {
        $user = Auth::user();
        
        // Verificar acceso
        if ($user->esDocente()) {
            abort_unless($clase->id_docente === $user->docente->id, 403);
        } else {
            $inscripcion = InscripcionClase::where('id_clase', $clase->id)
                ->where('id_estudiante', $user->estudiante->id)
                ->where('activo', true)
                ->first();
            abort_unless($inscripcion, 403);
        }

        $clase->load(['estudiantes', 'docente.usuario', 'inscripciones' => function($query) {
            $query->where('activo', true)->with('estudiante.usuario');
        }]);

        if ($user->esDocente()) {
            return view('clases.show-docente', compact('clase'));
        } else {
            return view('clases.show-estudiante', compact('clase'));
        }
    }

    public function edit(Clase $clase)
    {
        abort_unless(Auth::user()->esDocente(), 403);
        abort_unless($clase->id_docente === Auth::user()->docente->id, 403);
        
        $clasesRpg = ClaseRpg::where('activo', true)->get();
        
        return view('clases.edit', compact('clase', 'clasesRpg'));
    }

    public function update(Request $request, Clase $clase)
    {
        abort_unless(Auth::user()->esDocente(), 403);
        abort_unless($clase->id_docente === Auth::user()->docente->id, 403);
        
        $request->validate([
            'nombre' => 'required|string|max:100',
            'descripcion' => 'nullable|string|max:500',
            'grado' => 'required|string|max:10',
            'seccion' => 'required|string|max:10',
            'año_academico' => 'required|string|max:4',
            'fecha_inicio' => 'required|date',
            'fecha_fin' => 'required|date|after:fecha_inicio',
            'activo' => 'boolean'
        ]);

        $clase->update($request->all());

        return redirect()->route('clases.show', $clase)
            ->with('success', 'Clase actualizada exitosamente.');
    }

    public function destroy(Clase $clase)
    {
        abort_unless(Auth::user()->esDocente(), 403);
        abort_unless($clase->id_docente === Auth::user()->docente->id, 403);
        
        try {
            DB::beginTransaction();
            
            // Desactivar en lugar de eliminar para mantener historial
            $clase->update(['activo' => false]);
            
            // Desactivar todas las inscripciones
            InscripcionClase::where('id_clase', $clase->id)
                ->update(['activo' => false]);
            
            DB::commit();
            
            return redirect()->route('clases.index')
                ->with('success', 'Clase desactivada exitosamente.');
                
        } catch (\Exception $e) {
            DB::rollback();
            return back()->withErrors(['error' => 'Error al desactivar la clase.']);
        }
    }

    // Método para que estudiantes se unan a clases
    public function showUnirse()
    {
        abort_unless(Auth::user()->esEstudiante(), 403);
        
        return view('clases.unirse');
    }

    public function unirse(Request $request)
    {
        abort_unless(Auth::user()->esEstudiante(), 403);
        
        $request->validate([
            'codigo_invitacion' => 'required|string|size:6'
        ]);

        $clase = Clase::where('codigo_invitacion', strtoupper($request->codigo_invitacion))
            ->where('activo', true)
            ->first();

        if (!$clase) {
            return back()->withErrors(['codigo_invitacion' => 'Código de invitación inválido o clase no activa.']);
        }

        $estudiante = Auth::user()->estudiante;
        
        // Verificar si ya está inscrito
        $inscripcionExistente = InscripcionClase::where('id_clase', $clase->id)
            ->where('id_estudiante', $estudiante->id)
            ->first();

        if ($inscripcionExistente) {
            if ($inscripcionExistente->activo) {
                return back()->withErrors(['codigo_invitacion' => 'Ya estás inscrito en esta clase.']);
            } else {
                // Reactivar inscripción
                $inscripcionExistente->update(['activo' => true]);
                return redirect()->route('clases.show', $clase)
                    ->with('success', 'Te has unido exitosamente a la clase: ' . $clase->nombre);
            }
        }

        try {
            DB::beginTransaction();
            
            // Crear nueva inscripción
            InscripcionClase::create([
                'id_clase' => $clase->id,
                'id_estudiante' => $estudiante->id,
                'fecha_ingreso' => now(),
                'activo' => true
            ]);
            
            DB::commit();
            
            return redirect()->route('clases.show', $clase)
                ->with('success', 'Te has unido exitosamente a la clase: ' . $clase->nombre);
                
        } catch (\Exception $e) {
            DB::rollback();
            return back()->withErrors(['error' => 'Error al unirse a la clase.']);
        }
    }

    // API para verificar código de invitación
    public function verificarCodigo(Request $request)
    {
        $request->validate([
            'codigo' => 'required|string|size:6'
        ]);

        $clase = Clase::where('codigo_invitacion', strtoupper($request->codigo))
            ->where('activo', true)
            ->select('id', 'nombre', 'descripcion', 'grado', 'seccion')
            ->first();

        if (!$clase) {
            return response()->json(['valido' => false]);
        }

        return response()->json([
            'valido' => true,
            'clase' => $clase
        ]);
    }

    // Método para agregar estudiantes (para docentes)
    public function agregarEstudiante(Request $request, Clase $clase)
    {
        abort_unless(Auth::user()->esDocente(), 403);
        abort_unless($clase->id_docente === Auth::user()->docente->id, 403);
        
        $request->validate([
            'id_estudiante' => 'required|exists:estudiante,id'
        ]);

        $estudianteId = $request->id_estudiante;
        
        // Verificar si ya está inscrito
        if (InscripcionClase::yaEstaInscrito($clase->id, $estudianteId)) {
            return back()->withErrors(['error' => 'El estudiante ya está inscrito en esta clase.']);
        }

        try {
            InscripcionClase::inscribir($clase->id, $estudianteId);
            
            return back()->with('success', 'Estudiante agregado exitosamente a la clase.');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Error al agregar el estudiante.']);
        }
    }

    // Método para remover estudiante (para docentes)
    public function removerEstudiante(Request $request, Clase $clase)
    {
        abort_unless(Auth::user()->esDocente(), 403);
        abort_unless($clase->id_docente === Auth::user()->docente->id, 403);
        
        $request->validate([
            'id_estudiante' => 'required|exists:estudiante,id'
        ]);

        $inscripcion = InscripcionClase::where('id_clase', $clase->id)
            ->where('id_estudiante', $request->id_estudiante)
            ->first();

        if (!$inscripcion) {
            return back()->withErrors(['error' => 'El estudiante no está inscrito en esta clase.']);
        }

        $inscripcion->desactivar();
        
        return back()->with('success', 'Estudiante removido de la clase.');
    }
}