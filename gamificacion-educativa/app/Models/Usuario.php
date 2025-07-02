<?php
// app/Models/Usuario.php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class Usuario extends Authenticatable
{
    use HasFactory, Notifiable;

    protected $table = 'usuario';

    protected $fillable = [
        'nombre',
        'correo',
        'contraseña_hash',
        'salt',
        'id_tipo_usuario',
        'id_estado',
        'ultimo_acceso',
        'eliminado',
        'avatar',
    ];

    protected $hidden = [
        'contraseña_hash',
        'salt',
    ];

    protected $casts = [
        'eliminado' => 'boolean',
        'ultimo_acceso' => 'datetime',
    ];

    /**
     * Override para usar contraseña_hash en lugar de password
     */
    public function getAuthPassword()
    {
        return $this->contraseña_hash;
    }

    /**
     * Override para usar correo en lugar de email
     */
    public function getEmailForPasswordReset()
    {
        return $this->correo;
    }

    /**
     * Verificar si el usuario es docente
     */
    public function esDocente()
    {
        return $this->tipoUsuario && $this->tipoUsuario->nombre === 'docente';
    }

    /**
     * Verificar si el usuario es estudiante
     */
    public function esEstudiante()
    {
        return $this->tipoUsuario && $this->tipoUsuario->nombre === 'estudiante';
    }

    /**
     * Verificar si la cuenta está activa
     */
    public function estaActivo()
    {
        return $this->estadoUsuario && 
               $this->estadoUsuario->nombre === 'activo' && 
               !$this->eliminado;
    }

    /**
     * Relación con tipo de usuario
     */
    public function tipoUsuario()
    {
        return $this->belongsTo(TipoUsuario::class, 'id_tipo_usuario');
    }

    /**
     * Relación con estado de usuario
     */
    public function estadoUsuario()
    {
        return $this->belongsTo(EstadoUsuario::class, 'id_estado');
    }

    /**
     * Relación con docente
     */
    public function docente()
    {
        return $this->hasOne(Docente::class, 'id_usuario');
    }

    /**
     * Relación con estudiante
     */
    public function estudiante()
    {
        return $this->hasOne(Estudiante::class, 'id_usuario');
    }

    /**
     * Obtener URL del avatar
     */
    public function getAvatarUrlAttribute()
    {
        if ($this->avatar) {
            return asset('storage/avatars/' . $this->avatar);
        }
        
        return asset('images/default-avatar.png');
    }

    /**
     * Scope para usuarios activos
     */
    public function scopeActivos($query)
    {
        return $query->whereHas('estadoUsuario', function($q) {
            $q->where('nombre', 'activo');
        })->where('eliminado', false);
    }

    /**
     * Scope para docentes
     */
    public function scopeDocentes($query)
    {
        return $query->whereHas('tipoUsuario', function($q) {
            $q->where('nombre', 'docente');
        });
    }

    /**
     * Scope para estudiantes
     */
    public function scopeEstudiantes($query)
    {
        return $query->whereHas('tipoUsuario', function($q) {
            $q->where('nombre', 'estudiante');
        });
    }
}