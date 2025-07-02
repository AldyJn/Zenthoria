<?php 
namespace App\Http\Controllers;

use App\Models\ConfiguracionClase;
use App\Models\Clase;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ConfiguracionController extends Controller
{
    public function show($claseId)
    {
        $clase = Clase::findOrFail($claseId);
        $this->authorize('update', $clase);

        $configuraciones = ConfiguracionClase::where('id_clase', $claseId)->get();
        
        // Configuraciones por defecto
        $defaults = [
            'experiencia_por_participacion' => 10,
            'experiencia_por_respuesta_correcta' => 15,
            'monedas_por_actividad_completada' => 5,
            'penalizacion_llegada_tarde' => -5,
            'bonus_asistencia_perfecta_semanal' => 20,
            'multiplicador_experiencia_weekend' => 1.5,
            'limite_selecciones_aleatorias' => 3,
        ];

        $configuracionesArray = [];
        foreach ($defaults as $clave => $valorDefault) {
            $config = $configuraciones->where('clave', $clave)->first();
            $configuracionesArray[$clave] = $config ? $config->valor : $valorDefault;
        }

        return Inertia::render('Configuracion/Show', [
            'clase' => $clase,
            'configuraciones' => $configuracionesArray,
        ]);
    }

    public function update(Request $request, $claseId)
    {
        $clase = Clase::findOrFail($claseId);
        $this->authorize('update', $clase);

        $request->validate([
            'experiencia_por_participacion' => 'required|integer|min:1|max:50',
            'experiencia_por_respuesta_correcta' => 'required|integer|min:1|max:50',
            'monedas_por_actividad_completada' => 'required|integer|min:1|max:20',
            'penalizacion_llegada_tarde' => 'required|integer|min:-20|max:0',
            'bonus_asistencia_perfecta_semanal' => 'required|integer|min:0|max:100',
            'multiplicador_experiencia_weekend' => 'required|numeric|min:1|max:3',
            'limite_selecciones_aleatorias' => 'required|integer|min:1|max:10',
        ]);

        foreach ($request->validated() as $clave => $valor) {
            $tipo = is_numeric($valor) ? 'integer' : 'string';
            if (is_float($valor)) $tipo = 'float';
            
            ConfiguracionClase::establecer($claseId, $clave, $valor, $tipo);
        }

        return back()->with('success', 'Configuración actualizada exitosamente.');
    }
}