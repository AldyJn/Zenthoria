<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Facades\Storage;

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
        'avatar', // Agregado para manejar avatares
        'ultimo_acceso',
        'eliminado'
    ];

    protected $hidden = [
        'contraseña_hash',
        'salt',
        'remember_token',
    ];

    protected $casts = [
        'ultimo_acceso' => 'datetime',
        'eliminado' => 'boolean',
        'email_verified_at' => 'datetime',
    ];

    protected $appends = [
        'avatar_url', // Para que siempre esté disponible el accessor
    ];

    // Relaciones
    public function tipoUsuario()
    {
        return $this->belongsTo(TipoUsuario::class, 'id_tipo_usuario');
    }

    public function estado()
    {
        return $this->belongsTo(EstadoUsuario::class, 'id_estado');
    }

    public function estudiante()
    {
        return $this->hasOne(Estudiante::class, 'id_usuario');
    }

    public function docente()
    {
        return $this->hasOne(Docente::class, 'id_usuario');
    }

    // Accessors
    public function getAvatarUrlAttribute()
    {
        if ($this->avatar) {
            return Storage::url($this->avatar);
        }
        return asset('images/default-avatar.png');
    }

    // Métodos auxiliares
    public function esEstudiante()
    {
        // Usar relación con tipoUsuario para mayor consistencia
        return $this->tipoUsuario && $this->tipoUsuario->nombre === 'estudiante';
    }

    public function esDocente()
    {
        // Usar relación con tipoUsuario para mayor consistencia
        return $this->tipoUsuario && $this->tipoUsuario->nombre === 'docente';
    }

    public function estaActivo()
    {
        return $this->id_estado === 1 && !$this->eliminado;
    }

    // Sobrescribir métodos de autenticación de Laravel
    public function getAuthPassword()
    {
        return $this->contraseña_hash;
    }

    public function getEmailForPasswordReset()
    {
        return $this->correo;
    }

    // Método alternativo usando IDs (más eficiente para consultas)
    public function esEstudiantePorId()
    {
        return $this->id_tipo_usuario === 1;
    }

    public function esDocentePorId()
    {
        return $this->id_tipo_usuario === 2;
    }

    // Scopes útiles
    public function scopeActivos($query)
    {
        return $query->where('id_estado', 1)
                    ->where('eliminado', false);
    }

    public function scopeDocentes($query)
    {
        return $query->where('id_tipo_usuario', 2);
    }

    public function scopeEstudiantes($query)
    {
        return $query->where('id_tipo_usuario', 1);
    }
}