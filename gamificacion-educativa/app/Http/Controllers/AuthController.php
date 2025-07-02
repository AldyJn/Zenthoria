<?php
// app/Http/Controllers/AuthController.php
namespace App\Http\Controllers;

use App\Models\Usuario;
use App\Models\TipoUsuario;
use App\Models\EstadoUsuario;
use App\Models\Docente;
use App\Models\Estudiante;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rules;
use Illuminate\Support\Str;

class AuthController extends Controller
{
    /**
     * Mostrar formulario de login
     */
    public function showLogin()
    {
        return view('auth.login', [
            'canResetPassword' => true,
            'status' => session('status'),
        ]);
    }

    /**
     * Mostrar formulario de registro
     */
    public function showRegister()
    {
        $tiposUsuario = TipoUsuario::whereIn('nombre', ['docente', 'estudiante'])
            ->select('id', 'nombre', 'descripcion')
            ->get();

        return view('auth.register', [
            'tiposUsuario' => $tiposUsuario,
        ]);
    }

    /**
     * Procesar login - CON ESTRUCTURA CORRECTA
     */
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
        ], [
            'email.required' => 'El correo electrónico es obligatorio.',
            'email.email' => 'Debe ser una dirección de correo válida.',
            'password.required' => 'La contraseña es obligatoria.',
        ]);

        // Buscar usuario por correo
        $usuario = Usuario::with(['tipoUsuario', 'estadoUsuario'])->where('correo', $request->email)->first();

        if (!$usuario) {
            return back()->withErrors([
                'email' => 'No existe una cuenta con este correo electrónico.',
            ])->withInput($request->only('email'));
        }

        // Verificar contraseña (compatible con salt y sin salt)
        $passwordValida = $this->verificarPassword($request->password, $usuario);

        if (!$passwordValida) {
            return back()->withErrors([
                'password' => 'La contraseña es incorrecta.',
            ])->withInput($request->only('email'));
        }

        // Verificar que la cuenta esté activa (usando id_estado)
        $estadoActivo = EstadoUsuario::where('nombre', 'activo')->first();
        if (!$estadoActivo || $usuario->id_estado !== $estadoActivo->id || $usuario->eliminado) {
            return back()->withErrors([
                'general' => 'Tu cuenta está desactivada. Contacta al administrador.',
            ])->withInput($request->only('email'));
        }

        // Login del usuario
        Auth::loginUsingId($usuario->id, $request->boolean('remember'));

        $request->session()->regenerate();

        // Actualizar último acceso
        $usuario->update([
            'ultimo_acceso' => now(),
        ]);

        return redirect()->intended(route('dashboard'));
    }

    /**
     * Verificar contraseña con o sin salt
     */
    private function verificarPassword($password, $usuario)
    {
        // Si el usuario tiene salt, usar salt
        if (!empty($usuario->salt)) {
            $passwordWithSalt = $password . $usuario->salt;
            return Hash::check($passwordWithSalt, $usuario->contraseña_hash);
        }
        
        // Si no tiene salt, verificar directamente
        return Hash::check($password, $usuario->contraseña_hash);
    }

    /**
     * Procesar registro
     */
    public function register(Request $request)
    {
        $request->validate([
            'nombre' => 'required|string|max:100',
            'email' => 'required|string|email|max:100|unique:usuario,correo',
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
            'tipo_usuario' => 'required|exists:tipo_usuario,id',
        ], [
            'nombre.required' => 'El nombre es obligatorio.',
            'email.required' => 'El correo electrónico es obligatorio.',
            'email.unique' => 'Ya existe una cuenta con este correo electrónico.',
            'password.required' => 'La contraseña es obligatoria.',
            'password.confirmed' => 'Las contraseñas no coinciden.',
            'tipo_usuario.required' => 'Debe seleccionar un tipo de usuario.',
        ]);

        try {
            DB::beginTransaction();

            // Obtener estado activo
            $estadoActivo = EstadoUsuario::firstOrCreate(
                ['nombre' => 'activo'],
                ['descripcion' => 'Usuario activo']
            );

            // Crear usuario con salt
            $salt = Str::random(128);
            $usuario = Usuario::create([
                'nombre' => $request->nombre,
                'correo' => $request->email,
                'contraseña_hash' => Hash::make($request->password . $salt),
                'salt' => $salt,
                'id_tipo_usuario' => $request->tipo_usuario,
                'id_estado' => $estadoActivo->id, // ← USAR id_estado
                'eliminado' => false,
                'ultimo_acceso' => now(),
            ]);

            // Crear perfil específico según tipo de usuario
            $tipoUsuario = TipoUsuario::find($request->tipo_usuario);
            
            if ($tipoUsuario->nombre === 'docente') {
                Docente::create([
                    'id_usuario' => $usuario->id,
                    'especialidad' => $request->especialidad ?? 'General',
                ]);
            } elseif ($tipoUsuario->nombre === 'estudiante') {
                Estudiante::create([
                    'id_usuario' => $usuario->id,
                    'codigo_estudiante' => 'EST' . str_pad($usuario->id, 6, '0', STR_PAD_LEFT),
                    'grado' => $request->grado ?? '1ro',
                    'seccion' => $request->seccion ?? 'A',
                ]);
            }

            DB::commit();

            // Login automático
            Auth::loginUsingId($usuario->id);

            return redirect(route('dashboard'))->with('success', 'Cuenta creada exitosamente. ¡Bienvenido!');

        } catch (\Exception $e) {
            DB::rollBack();
            
            return back()->withErrors([
                'general' => 'Error al crear la cuenta. Inténtalo de nuevo.',
            ])->withInput();
        }
    }

    /**
     * Logout
     */
    public function logout(Request $request)
    {
        Auth::logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/')->with('success', 'Sesión cerrada exitosamente.');
    }
}