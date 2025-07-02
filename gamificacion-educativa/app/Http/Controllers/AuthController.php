<?php
// app/Http/Controllers/AuthController.php
namespace App\Http\Controllers;

use App\Models\Usuario;
use App\Models\TipoUsuario;
use App\Models\Docente;
use App\Models\Estudiante;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rules;
use Inertia\Inertia;

class AuthController extends Controller
{
    /**
     * Mostrar formulario de login
     */
    public function showLogin()
    {
        return Inertia::render('Auth/Login');
    }

    /**
     * Procesar login
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
        $usuario = Usuario::where('correo', $request->email)->first();

        if (!$usuario) {
            return back()->withErrors([
                'email' => 'No existe una cuenta con este correo electrónico.',
            ])->withInput($request->only('email'));
        }

        // Verificar contraseña con salt
        $passwordWithSalt = $request->password . $usuario->salt;
        if (!Hash::check($passwordWithSalt, $usuario->contraseña_hash)) {
            return back()->withErrors([
                'password' => 'La contraseña es incorrecta.',
            ])->withInput($request->only('email'));
        }

        // Verificar que la cuenta esté activa
        if (!$usuario->activo) {
            return back()->withErrors([
                'general' => 'Tu cuenta está desactivada. Contacta al administrador.',
            ])->withInput($request->only('email'));
        }

        // Autenticar usuario
        Auth::login($usuario, $request->boolean('remember'));

        $request->session()->regenerate();

        // Actualizar última conexión
        $usuario->update([
            'fecha_ultimo_acceso' => now(),
        ]);

        return redirect()->intended(route('dashboard'));
    }

    /**
     * Mostrar formulario de registro
     */
    public function showRegister()
    {
        $tiposUsuario = TipoUsuario::whereIn('nombre', ['docente', 'estudiante'])
            ->select('id', 'nombre', 'descripcion')
            ->get();

        return Inertia::render('Auth/Register', [
            'tipos_usuario' => $tiposUsuario,
        ]);
    }

    /**
     * Procesar registro
     */
    public function register(Request $request)
    {
        $request->validate([
            'nombre' => 'required|string|max:100',
            'correo' => 'required|email|max:100|unique:usuario,correo',
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
            'tipo_usuario' => 'required|exists:tipo_usuario,id',
            'terminos' => 'required|accepted',
            // Campos específicos para docentes
            'especialidad' => 'required_if:tipo_usuario_nombre,docente|nullable|string|max:100',
            // Campos específicos para estudiantes
            'grado' => 'required_if:tipo_usuario_nombre,estudiante|nullable|string|max:50',
            'seccion' => 'nullable|string|max:10',
        ], [
            'nombre.required' => 'El nombre es obligatorio.',
            'correo.required' => 'El correo electrónico es obligatorio.',
            'correo.email' => 'Debe ser una dirección de correo válida.',
            'correo.unique' => 'Ya existe una cuenta con este correo electrónico.',
            'password.required' => 'La contraseña es obligatoria.',
            'password.confirmed' => 'Las contraseñas no coinciden.',
            'tipo_usuario.required' => 'Debe seleccionar un tipo de usuario.',
            'tipo_usuario.exists' => 'El tipo de usuario seleccionado no es válido.',
            'terminos.accepted' => 'Debe aceptar los términos y condiciones.',
            'especialidad.required_if' => 'La especialidad es obligatoria para docentes.',
            'grado.required_if' => 'El grado es obligatorio para estudiantes.',
        ]);

        try {
            DB::beginTransaction();

            // Obtener tipo de usuario
            $tipoUsuario = TipoUsuario::findOrFail($request->tipo_usuario);

            // Generar salt único
            $salt = bin2hex(random_bytes(64));

            // Crear usuario
            $usuario = Usuario::create([
                'nombre' => $request->nombre,
                'correo' => $request->correo,
                'contraseña_hash' => Hash::make($request->password . $salt),
                'salt' => $salt,
                'id_tipo_usuario' => $request->tipo_usuario,
                'activo' => true,
                'fecha_registro' => now(),
            ]);

            // Crear perfil específico según tipo de usuario
            if ($tipoUsuario->nombre === 'docente') {
                $this->crearPerfilDocente($usuario, $request);
            } elseif ($tipoUsuario->nombre === 'estudiante') {
                $this->crearPerfilEstudiante($usuario, $request);
            }

            DB::commit();

            // Autenticar automáticamente
            Auth::login($usuario);

            return redirect()->route('dashboard')->with('success', 
                'Cuenta creada exitosamente. ¡Bienvenido a Zenthoria!');

        } catch (\Exception $e) {
            DB::rollBack();
            
            return back()->withErrors([
                'general' => 'Error al crear la cuenta. Por favor, inténtalo de nuevo.',
            ])->withInput($request->except('password', 'password_confirmation'));
        }
    }

    /**
     * Crear perfil de docente
     */
    private function crearPerfilDocente(Usuario $usuario, Request $request)
    {
        // Generar código único de docente
        $codigoDocente = 'DOC' . str_pad($usuario->id, 6, '0', STR_PAD_LEFT);

        Docente::create([
            'id_usuario' => $usuario->id,
            'codigo_docente' => $codigoDocente,
            'especialidad' => $request->especialidad,
            'activo' => true,
            'fecha_ingreso' => now(),
        ]);
    }

    /**
     * Crear perfil de estudiante
     */
    private function crearPerfilEstudiante(Usuario $usuario, Request $request)
    {
        // Generar código único de estudiante
        $codigoEstudiante = 'EST' . str_pad($usuario->id, 6, '0', STR_PAD_LEFT);

        Estudiante::create([
            'id_usuario' => $usuario->id,
            'codigo_estudiante' => $codigoEstudiante,
            'grado' => $request->grado,
            'seccion' => $request->seccion,
            'activo' => true,
            'fecha_ingreso' => now(),
        ]);
    }

    /**
     * Cerrar sesión
     */
    public function logout(Request $request)
    {
        Auth::logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('home')->with('success', 'Sesión cerrada exitosamente.');
    }

    /**
     * Verificar disponibilidad de correo (AJAX)
     */
    public function checkEmail(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
        ]);

        $exists = Usuario::where('correo', $request->email)->exists();

        return response()->json([
            'available' => !$exists,
            'message' => $exists ? 'Este correo ya está registrado' : 'Correo disponible'
        ]);
    }

    /**
     * Enviar código de recuperación de contraseña
     */
    public function sendPasswordResetCode(Request $request)
    {
        $request->validate([
            'email' => 'required|email|exists:usuario,correo',
        ], [
            'email.required' => 'El correo electrónico es obligatorio.',
            'email.email' => 'Debe ser una dirección de correo válida.',
            'email.exists' => 'No existe una cuenta con este correo electrónico.',
        ]);

        $usuario = Usuario::where('correo', $request->email)->first();

        // Generar código de 6 dígitos
        $codigo = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);
        
        // Guardar código con expiración de 15 minutos
        $usuario->update([
            'codigo_recuperacion' => Hash::make($codigo),
            'codigo_recuperacion_expira' => now()->addMinutes(15),
        ]);

        // TODO: Aquí enviarías el email con el código
        // Por ahora, lo devolvemos en la respuesta para testing
        
        return back()->with('success', 
            "Código de recuperación enviado a {$request->email}. Código: {$codigo}");
    }

    /**
     * Restablecer contraseña con código
     */
    public function resetPasswordWithCode(Request $request)
    {
        $request->validate([
            'email' => 'required|email|exists:usuario,correo',
            'codigo' => 'required|string|size:6',
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ], [
            'email.required' => 'El correo electrónico es obligatorio.',
            'email.exists' => 'No existe una cuenta con este correo electrónico.',
            'codigo.required' => 'El código de recuperación es obligatorio.',
            'codigo.size' => 'El código debe tener 6 dígitos.',
            'password.required' => 'La nueva contraseña es obligatoria.',
            'password.confirmed' => 'Las contraseñas no coinciden.',
        ]);

        $usuario = Usuario::where('correo', $request->email)->first();

        // Verificar que el código no haya expirado
        if (!$usuario->codigo_recuperacion_expira || 
            $usuario->codigo_recuperacion_expira < now()) {
            return back()->withErrors([
                'codigo' => 'El código de recuperación ha expirado.',
            ]);
        }

        // Verificar código
        if (!Hash::check($request->codigo, $usuario->codigo_recuperacion)) {
            return back()->withErrors([
                'codigo' => 'El código de recuperación es incorrecto.',
            ]);
        }

        // Actualizar contraseña
        $newSalt = bin2hex(random_bytes(64));
        $usuario->update([
            'contraseña_hash' => Hash::make($request->password . $newSalt),
            'salt' => $newSalt,
            'codigo_recuperacion' => null,
            'codigo_recuperacion_expira' => null,
        ]);

        return redirect()->route('login')->with('success', 
            'Contraseña restablecida exitosamente. Ya puedes iniciar sesión.');
    }

    /**
     * Validar sesión activa (para APIs)
     */
    public function validateSession(Request $request)
    {
        $user = Auth::user();

        if (!$user) {
            return response()->json([
                'authenticated' => false,
                'message' => 'No hay sesión activa'
            ], 401);
        }

        return response()->json([
            'authenticated' => true,
            'user' => [
                'id' => $user->id,
                'nombre' => $user->nombre,
                'correo' => $user->correo,
                'tipo_usuario' => $user->tipoUsuario->nombre,
                'avatar_url' => $user->avatar_url,
            ]
        ]);
    }
}