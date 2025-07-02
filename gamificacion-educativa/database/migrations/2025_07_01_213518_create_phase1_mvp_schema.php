<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        // Tablas de autenticación
        Schema::create('tipo_usuario', function (Blueprint $table) {
            $table->id();
            $table->string('nombre', 50)->unique();
            $table->text('descripcion')->nullable();
            $table->timestamps();
        });

        Schema::create('estado_usuario', function (Blueprint $table) {
            $table->id();
            $table->string('nombre', 20)->unique();
            $table->text('descripcion')->nullable();
            $table->timestamps();
        });

        Schema::create('usuario', function (Blueprint $table) {
            $table->id();
            $table->string('nombre', 100);
            $table->string('correo', 100)->unique();
            $table->string('contraseña_hash', 255);
            $table->string('salt', 128);
            $table->foreignId('id_tipo_usuario')->constrained('tipo_usuario');
            $table->foreignId('id_estado')->default(1)->constrained('estado_usuario');
            $table->timestamp('ultimo_acceso')->nullable();
            $table->boolean('eliminado')->default(false);
            $table->timestamps();
        });

        // Tablas de perfiles
        Schema::create('estudiante', function (Blueprint $table) {
            $table->id();
            $table->foreignId('id_usuario')->constrained('usuario')->cascadeOnDelete();
            $table->string('codigo_estudiante', 20)->unique();
            $table->string('grado', 50)->nullable();
            $table->string('seccion', 10)->nullable();
            $table->timestamps();
        });

        Schema::create('docente', function (Blueprint $table) {
            $table->id();
            $table->foreignId('id_usuario')->constrained('usuario')->cascadeOnDelete();
            $table->string('especialidad', 100)->nullable();
            $table->timestamps();
        });

        // Tablas de gestión de clases
        Schema::create('clase_rpg', function (Blueprint $table) {
            $table->id();
            $table->string('nombre', 50)->unique();
            $table->text('descripcion')->nullable();
            $table->string('imagen_url')->nullable();
            $table->timestamps();
        });

        // Tabla de niveles de experiencia (DEBE CREARSE ANTES DE PERSONAJE)
        Schema::create('nivel_experiencia', function (Blueprint $table) {
            $table->integer('nivel')->primary(); // Clave primaria no autoincremental
            $table->integer('experiencia_requerida');
            $table->json('bonificaciones')->nullable();
            $table->timestamps();
        });

        Schema::create('clase', function (Blueprint $table) {
            $table->id();
            $table->string('nombre', 100);
            $table->text('descripcion')->nullable();
            $table->foreignId('id_docente')->constrained('docente');
            $table->string('grado', 50)->nullable();
            $table->string('seccion', 10)->nullable();
            $table->integer('año_academico');
            $table->boolean('activo')->default(true);
            $table->string('codigo_invitacion', 10)->unique()->nullable();
            $table->string('qr_url')->nullable();
            $table->date('fecha_inicio')->nullable();
            $table->date('fecha_fin')->nullable();
            $table->timestamps();
        });

        Schema::create('clase_estudiante', function (Blueprint $table) {
            $table->id();
            $table->foreignId('id_clase')->constrained('clase');
            $table->foreignId('id_estudiante')->constrained('estudiante');
            $table->timestamp('fecha_ingreso')->useCurrent();
            $table->boolean('activo')->default(true);
            $table->timestamps();
        });

        // Tablas de dinámica de clase
        Schema::create('tipo_comportamiento', function (Blueprint $table) {
            $table->id();
            $table->string('nombre', 50)->unique();
            $table->text('descripcion')->nullable();
            $table->integer('valor_puntos')->default(0);
            $table->timestamps();
        });

        Schema::create('registro_comportamiento', function (Blueprint $table) {
            $table->id();
            $table->foreignId('id_estudiante')->constrained('estudiante');
            $table->foreignId('id_clase')->constrained('clase');
            $table->foreignId('id_tipo_comportamiento')->constrained('tipo_comportamiento');
            $table->text('descripcion')->nullable();
            $table->text('observacion')->nullable();
            $table->timestamp('fecha')->useCurrent();
            $table->timestamps();
        });

        Schema::create('asistencia', function (Blueprint $table) {
            $table->id();
            $table->foreignId('id_clase')->constrained('clase');
            $table->foreignId('id_estudiante')->constrained('estudiante');
            $table->foreignId('id_docente')->constrained('docente');
            $table->date('fecha');
            $table->boolean('presente')->default(true);
            $table->text('justificacion')->nullable();
            $table->timestamps();
            $table->unique(['id_clase', 'id_estudiante', 'fecha']);
        });

        // Tabla EstadoTarea
        Schema::create('estado_tarea', function (Blueprint $table) {
            $table->id();
            $table->string('nombre', 50)->unique();
            $table->text('descripcion')->nullable();
            $table->timestamps();
        });

        // Tablas de experiencia del estudiante
        Schema::create('personaje', function (Blueprint $table) {
            $table->id();
            $table->foreignId('id_estudiante')->constrained('estudiante');
            $table->foreignId('id_clase')->constrained('clase');
            $table->foreignId('id_clase_rpg')->constrained('clase_rpg');
            $table->string('nombre', 100)->nullable();
            $table->integer('nivel')->default(1);
            $table->integer('experiencia')->default(0);
            $table->string('avatar_base', 50)->default('guerrero');
            $table->timestamps();
            
            // Relación con niveles de experiencia
            $table->foreign('nivel')->references('nivel')->on('nivel_experiencia');
        });

        // Tablas de evaluación
        Schema::create('tipo_actividad', function (Blueprint $table) {
            $table->id();
            $table->string('nombre', 50)->unique();
            $table->text('descripcion')->nullable();
            $table->timestamps();
        });

        Schema::create('actividad', function (Blueprint $table) {
            $table->id();
            $table->foreignId('id_clase')->constrained('clase');
            $table->foreignId('id_tipo_actividad')->constrained('tipo_actividad');
            $table->string('titulo', 100);
            $table->text('descripcion')->nullable();
            $table->timestamp('fecha_inicio')->nullable();
            $table->timestamp('fecha_entrega')->nullable();
            $table->integer('puntos_experiencia')->default(0);
            $table->integer('puntos_moneda')->default(0);
            $table->boolean('activa')->default(true);
            $table->timestamps();
        });

        Schema::create('entrega_actividad', function (Blueprint $table) {
            $table->id();
            $table->foreignId('id_actividad')->constrained('actividad');
            $table->foreignId('id_estudiante')->constrained('estudiante');
            $table->string('archivo')->nullable();
            $table->timestamp('fecha_entrega')->useCurrent();
            $table->decimal('nota', 5, 2)->nullable();
            $table->text('comentario')->nullable();
            $table->timestamps();
        });

        // Tablas de reportes
        Schema::create('estadistica_clase', function (Blueprint $table) {
            $table->id();
            $table->foreignId('id_clase')->constrained('clase');
            $table->decimal('promedio_nivel', 5, 2)->nullable();
            $table->decimal('promedio_participacion', 5, 2)->nullable();
            $table->jsonb('distribucion_niveles')->nullable();
            $table->timestamps();
        });

        Schema::create('estadistica_personaje', function (Blueprint $table) {
            $table->id();
            $table->foreignId('id_personaje')->constrained('personaje');
            $table->integer('misiones_completadas')->default(0);
            $table->integer('actividades_completadas')->default(0);
            $table->timestamps();
        });
       // Tabla de sesiones de clase
        Schema::create('sesion_clase', function (Blueprint $table) {
            $table->id();
            $table->foreignId('id_clase')->constrained('clase');
            $table->timestamp('fecha_inicio');
            $table->timestamp('fecha_fin')->nullable();
            $table->boolean('activa')->default(true);
            $table->integer('duracion_planificada')->nullable(); // en minutos
            $table->text('notas_sesion')->nullable();
            $table->timestamps();
        });

        // Tabla de misiones
        Schema::create('mision', function (Blueprint $table) {
            $table->id();
            $table->foreignId('id_clase')->constrained('clase');
            $table->string('titulo', 100);
            $table->text('descripcion');
            $table->timestamp('fecha_inicio')->nullable();
            $table->timestamp('fecha_fin')->nullable();
            $table->integer('puntos_experiencia_bonus')->default(0);
            $table->integer('puntos_moneda_bonus')->default(0);
            $table->boolean('activa')->default(true);
            $table->integer('orden')->default(0);
            $table->timestamps();
        });

        // Agregar campo id_mision a actividades
        Schema::table('actividad', function (Blueprint $table) {
            $table->foreignId('id_mision')->nullable()->constrained('mision');
        });

        // Tabla de progreso de misiones
        Schema::create('progreso_mision', function (Blueprint $table) {
            $table->id();
            $table->foreignId('id_mision')->constrained('mision');
            $table->foreignId('id_estudiante')->constrained('estudiante');
            $table->integer('actividades_completadas')->default(0);
            $table->decimal('porcentaje_progreso', 5, 2)->default(0);
            $table->boolean('completada')->default(false);
            $table->timestamp('fecha_completada')->nullable();
            $table->boolean('experiencia_bonus_otorgada')->default(false);
            $table->boolean('moneda_bonus_otorgada')->default(false);
            $table->timestamps();
            
            $table->unique(['id_mision', 'id_estudiante']);
        });

        // Tabla de transacciones de monedas
        Schema::create('transaccion_moneda', function (Blueprint $table) {
            $table->id();
            $table->foreignId('id_estudiante')->constrained('estudiante');
            $table->foreignId('id_clase')->constrained('clase');
            $table->enum('tipo', ['ingreso', 'gasto']);
            $table->integer('cantidad');
            $table->string('descripcion');
            $table->string('referencia_tipo')->nullable(); // 'actividad', 'comportamiento', 'item_tienda', etc.
            $table->bigInteger('referencia_id')->nullable();
            $table->foreignId('otorgado_por')->nullable()->constrained('docente');
            $table->timestamps();
        });

        // Tabla de items de la tienda
        Schema::create('item_tienda', function (Blueprint $table) {
            $table->id();
            $table->foreignId('id_clase')->constrained('clase');
            $table->string('nombre', 100);
            $table->text('descripcion')->nullable();
            $table->integer('precio');
            $table->string('tipo', 50); // 'avatar', 'privilegio', 'item_virtual', etc.
            $table->string('imagen_url')->nullable();
            $table->boolean('disponible')->default(true);
            $table->boolean('cantidad_limitada')->default(false);
            $table->integer('cantidad_disponible')->nullable();
            $table->timestamps();
        });

        // Tabla de notificaciones
        Schema::create('notificacion', function (Blueprint $table) {
            $table->id();
            $table->foreignId('id_usuario')->constrained('usuario');
            $table->string('titulo', 100);
            $table->text('mensaje');
            $table->enum('tipo', ['info', 'success', 'warning', 'error'])->default('info');
            $table->boolean('leida')->default(false);
            $table->json('datos')->nullable();
            $table->string('accion_url')->nullable();
            $table->timestamps();
        });

        // Tabla de badges/logros
        Schema::create('badge', function (Blueprint $table) {
            $table->id();
            $table->string('nombre', 100);
            $table->text('descripcion');
            $table->string('imagen_url')->nullable();
            $table->string('tipo', 50); // 'nivel', 'actividades_completadas', 'asistencia_perfecta', etc.
            $table->json('criterio')->nullable(); // criterios específicos para obtener el badge
            $table->integer('valor_requerido'); // valor numérico requerido
            $table->boolean('activo')->default(true);
            $table->timestamps();
        });

        // Tabla de badges obtenidos por estudiantes
        Schema::create('estudiante_badge', function (Blueprint $table) {
            $table->id();
            $table->foreignId('id_estudiante')->constrained('estudiante');
            $table->foreignId('id_badge')->constrained('badge');
            $table->foreignId('id_clase')->constrained('clase');
            $table->timestamp('fecha_obtenido');
            $table->timestamps();
            
            $table->unique(['id_estudiante', 'id_badge', 'id_clase']);
        });

        // Agregar campo id_sesion a asistencia (opcional)
        Schema::table('asistencia', function (Blueprint $table) {
            $table->foreignId('id_sesion')->nullable()->constrained('sesion_clase');
        });

        // Tabla de configuración del sistema por clase
        Schema::create('configuracion_clase', function (Blueprint $table) {
            $table->id();
            $table->foreignId('id_clase')->constrained('clase');
            $table->string('clave', 100); // 'experiencia_por_participacion', 'monedas_por_actividad', etc.
            $table->text('valor'); // valor de la configuración
            $table->string('tipo', 20)->default('string'); // 'string', 'integer', 'boolean', 'json'
            $table->timestamps();
            
            $table->unique(['id_clase', 'clave']);
        });
    }
    public function down()
    {
        // Eliminar en orden inverso
        Schema::dropIfExists('estadistica_personaje');
        Schema::dropIfExists('estadistica_clase');
        Schema::dropIfExists('entrega_actividad');
        Schema::dropIfExists('actividad');
        Schema::dropIfExists('tipo_actividad');
        Schema::dropIfExists('personaje');
        Schema::dropIfExists('asistencia');
        Schema::dropIfExists('registro_comportamiento');
        Schema::dropIfExists('tipo_comportamiento');
        Schema::dropIfExists('estado_tarea');
        Schema::dropIfExists('clase_estudiante');
        Schema::dropIfExists('clase');
        Schema::dropIfExists('nivel_experiencia');
        Schema::dropIfExists('clase_rpg');
        Schema::dropIfExists('docente');
        Schema::dropIfExists('estudiante');
        Schema::dropIfExists('usuario');
        Schema::dropIfExists('estado_usuario');
        Schema::dropIfExists('tipo_usuario');
        Schema::dropIfExists('configuracion_clase');
        Schema::dropIfExists('estudiante_badge');
        Schema::dropIfExists('badge');
        Schema::dropIfExists('notificacion');
        Schema::dropIfExists('item_tienda');
        Schema::dropIfExists('transaccion_moneda');
        Schema::dropIfExists('progreso_mision');
        
        Schema::table('actividad', function (Blueprint $table) {
            $table->dropForeign(['id_mision']);
            $table->dropColumn('id_mision');
        });

        Schema::table('asistencia', function (Blueprint $table) {
            $table->dropForeign(['id_sesion']);
            $table->dropColumn('id_sesion');
        });

        Schema::dropIfExists('mision');
        Schema::dropIfExists('sesion_clase');
    }
};