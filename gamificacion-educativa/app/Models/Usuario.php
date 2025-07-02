<?php
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

    // Métodos auxiliares
    public function esEstudiante()
    {
        return $this->id_tipo_usuario === 1;
    }

    public function esDocente()
    {
        return $this->id_tipo_usuario === 2;
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
    public function getAvatarUrlAttribute()
    {
        if ($this->avatar) {
            return Storage::url($this->avatar);
        }
        return asset('images/default-avatar.png');
    }

    public function esDocente()
    {
        return $this->tipoUsuario->nombre === 'docente';
    }

    public function esEstudiante()
    {
        return $this->tipoUsuario->nombre === 'estudiante';
    }
}
