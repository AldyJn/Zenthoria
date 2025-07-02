<?php
// app/Http/Controllers/PerfilController.php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Inertia\Inertia;

class PerfilController extends Controller
{
    public function edit()
    {
        $user = auth()->user();
        
        return Inertia::render('Perfil/Edit', [
            'user' => [
                'id' => $user->id,
                'nombre' => $user->nombre,
                'correo' => $user->correo,
                'es_docente' => $user->esDocente(),
                'perfil' => $user->esDocente() ? $user->docente : $user->estudiante,
            ],
        ]);
    }

    public function updateInformacion(Request $request)
    {
        $user = auth()->user();

        $request->validate([
            'nombre' => 'required|string|max:100',
            'correo' => 'required|email|max:100|unique:usuario,correo,' . $user->id,
        ]);

        $user->update([
            'nombre' => $request->nombre,
            'correo' => $request->correo,
        ]);

        // Actualizar perfil específico
        if ($user->esDocente()) {
            $request->validate([
                'especialidad' => 'nullable|string|max:100',
            ]);

            $user->docente->update([
                'especialidad' => $request->especialidad,
            ]);
        } else {
            $request->validate([
                'grado' => 'nullable|string|max:50',
                'seccion' => 'nullable|string|max:10',
            ]);

            $user->estudiante->update([
                'grado' => $request->grado,
                'seccion' => $request->seccion,
            ]);
        }

        return back()->with('success', 'Información actualizada exitosamente.');
    }

    public function updatePassword(Request $request)
    {
        $request->validate([
            'current_password' => 'required|string',
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ]);

        $user = auth()->user();

        // Verificar contraseña actual
        if (!Hash::check($request->current_password . $user->salt, $user->contraseña_hash)) {
            return back()->withErrors([
                'current_password' => 'La contraseña actual no es correcta.',
            ]);
        }

        // Actualizar contraseña
        $newSalt = bin2hex(random_bytes(64));
        $user->update([
            'contraseña_hash' => Hash::make($request->password . $newSalt),
            'salt' => $newSalt,
        ]);

        return back()->with('success', 'Contraseña actualizada exitosamente.');
    }

    public function destroy(Request $request)
    {
        $request->validate([
            'password' => 'required|string',
        ]);

        $user = auth()->user();

        if (!Hash::check($request->password . $user->salt, $user->contraseña_hash)) {
            return back()->withErrors([
                'password' => 'La contraseña no es correcta.',
            ]);
        }

        // Soft delete
        $user->update(['eliminado' => true]);
        
        auth()->logout();

        return redirect('/')->with('success', 'Cuenta eliminada exitosamente.');
    }
}