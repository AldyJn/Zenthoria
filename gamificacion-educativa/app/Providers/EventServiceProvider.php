<?php
namespace App\Providers;

use Illuminate\Auth\Events\Registered;
use Illuminate\Auth\Listeners\SendEmailVerificationNotification;
use Illuminate\Foundation\Support\Providers\EventServiceProvider as ServiceProvider;
use Illuminate\Support\Facades\Event;

class EventServiceProvider extends ServiceProvider
{
    protected $listen = [
        Registered::class => [
            SendEmailVerificationNotification::class,
        ],
        \App\Events\ExperienciaGanada::class => [
            \App\Listeners\VerificarSubidaNivel::class,
            \App\Listeners\VerificarBadges::class,
        ],
        \App\Events\NivelSubido::class => [
            \App\Listeners\CrearNotificacionNivel::class,
            \App\Listeners\VerificarBadges::class,
        ],
        \App\Events\MisionCompletada::class => [
            \App\Listeners\VerificarBadges::class,
        ],
    ];

    public function boot()
    {
        //
    }

    public function shouldDiscoverEvents()
    {
        return false;
    }
}
