<?php

// app/Http/Controllers/UploadController.php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Intervention\Image\Facades\Image;
use Illuminate\Support\Str;

class UploadController extends Controller
{
    /**
     * Subir avatar de usuario
     */
    public function uploadAvatar(Request $request)
    {
        $request->validate([
            'avatar' => 'required|image|mimes:jpeg,png,jpg,gif|max:2048', // 2MB máximo
        ]);

        $user = auth()->user();
        
        try {
            // Eliminar avatar anterior si existe
            if ($user->avatar && Storage::disk('public')->exists($user->avatar)) {
                Storage::disk('public')->delete($user->avatar);
            }

            // Procesar y guardar nueva imagen
            $file = $request->file('avatar');
            $filename = 'avatars/' . $user->id . '_' . time() . '.' . $file->getClientOriginalExtension();
            
            // Redimensionar imagen (300x300px)
            $image = Image::make($file)->fit(300, 300);
            
            // Guardar en storage/app/public/avatars/
            Storage::disk('public')->put($filename, $image->encode());
            
            // Actualizar usuario
            $user->update(['avatar' => $filename]);

            return response()->json([
                'success' => true,
                'message' => 'Avatar actualizado exitosamente',
                'avatar_url' => Storage::url($filename),
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al subir el avatar: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Subir imagen personalizada de personaje
     */
    public function uploadPersonajeImagen(Request $request, $personajeId)
    {
        $request->validate([
            'imagen' => 'required|image|mimes:jpeg,png,jpg,gif|max:1024', // 1MB máximo
        ]);

        $personaje = \App\Models\Personaje::findOrFail($personajeId);
        
        // Verificar permisos
        abort_unless(
            auth()->user()->esEstudiante() && 
            $personaje->id_estudiante === auth()->user()->estudiante->id,
            403
        );

        try {
            // Eliminar imagen anterior si existe
            if ($personaje->imagen_personalizada && Storage::disk('public')->exists($personaje->imagen_personalizada)) {
                Storage::disk('public')->delete($personaje->imagen_personalizada);
            }

            // Procesar y guardar nueva imagen
            $file = $request->file('imagen');
            $filename = 'personajes/' . $personaje->id . '_' . time() . '.' . $file->getClientOriginalExtension();
            
            // Redimensionar imagen (200x200px)
            $image = Image::make($file)->fit(200, 200);
            
            // Guardar en storage/app/public/personajes/
            Storage::disk('public')->put($filename, $image->encode());
            
            // Actualizar personaje
            $personaje->update(['imagen_personalizada' => $filename]);

            return response()->json([
                'success' => true,
                'message' => 'Imagen de personaje actualizada exitosamente',
                'imagen_url' => Storage::url($filename),
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al subir la imagen: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Eliminar avatar de usuario
     */
    public function deleteAvatar()
    {
        $user = auth()->user();
        
        if ($user->avatar && Storage::disk('public')->exists($user->avatar)) {
            Storage::disk('public')->delete($user->avatar);
            $user->update(['avatar' => null]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Avatar eliminado exitosamente',
        ]);
    }

    /**
     * Eliminar imagen personalizada de personaje
     */
    public function deletePersonajeImagen($personajeId)
    {
        $personaje = \App\Models\Personaje::findOrFail($personajeId);
        
        // Verificar permisos
        abort_unless(
            auth()->user()->esEstudiante() && 
            $personaje->id_estudiante === auth()->user()->estudiante->id,
            403
        );

        if ($personaje->imagen_personalizada && Storage::disk('public')->exists($personaje->imagen_personalizada)) {
            Storage::disk('public')->delete($personaje->imagen_personalizada);
            $personaje->update(['imagen_personalizada' => null]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Imagen de personaje eliminada exitosamente',
        ]);
    }
}


