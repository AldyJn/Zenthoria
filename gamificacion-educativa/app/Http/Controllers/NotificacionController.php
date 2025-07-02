<?php
namespace App\Http\Controllers;

use App\Models\Notificacion;
use Illuminate\Http\Request;
use Inertia\Inertia;

class NotificacionController extends Controller
{
    public function index()
    {
        $user = auth()->user();
        
        $notificaciones = Notificacion::where('id_usuario', $user->id)
            ->latest()
            ->paginate(20);

        $noLeidas = Notificacion::where('id_usuario', $user->id)
            ->where('leida', false)
            ->count();

        return Inertia::render('Notificaciones/Index', [
            'notificaciones' => $notificaciones,
            'no_leidas' => $noLeidas,
        ]);
    }

    public function marcarComoLeida($id)
    {
        $notificacion = Notificacion::where('id_usuario', auth()->id())
            ->findOrFail($id);

        $notificacion->update(['leida' => true]);

        return response()->json(['success' => true]);
    }

    public function marcarTodasComoLeidas()
    {
        Notificacion::where('id_usuario', auth()->id())
            ->where('leida', false)
            ->update(['leida' => true]);

        return back()->with('success', 'Todas las notificaciones marcadas como leídas.');
    }

    public function eliminar($id)
    {
        $notificacion = Notificacion::where('id_usuario', auth()->id())
            ->findOrFail($id);

        $notificacion->delete();

        return back()->with('success', 'Notificación eliminada.');
    }

    public static function crear($usuarioId, $titulo, $mensaje, $tipo = 'info', $datos = null)
    {
        return Notificacion::create([
            'id_usuario' => $usuarioId,
            'titulo' => $titulo,
            'mensaje' => $mensaje,
            'tipo' => $tipo,
            'datos' => $datos,
        ]);
    }
}