<?php
// database/migrations/2025_07_01_213518_create_phase1_mvp_schema.php
// VERSIÓN COMPLETA Y CORREGIDA CON COLUMNAS DE AVATAR

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
            $table->string('avatar')->nullable(); // ✅ COLUMNA AVATAR AGREGADA
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
            $table->json('habilidades_especiales')->nullable();
            $table->json('stats_base')->nullable();
            $table->string('imagen_url')->nullable();
            $table->timestamps();
        });

        // Tabla de niveles de experiencia (DEBE CREARSE ANTES DE PERSONAJE)
        Schema::create('nivel_experiencia', function (Blueprint $table) {
            $table->integer('nivel')->primary(); // Clave primaria no autoincremental
            $table->integer('experiencia_requerida');
            $table->json('recompensas')->nullable();
            $table->string('titulo_desbloqueado')->nullable();
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

        Schema::create('inscripcion_clase', function (Blueprint $table) {
            $table->id();
            $table->foreignId('id_clase')->constrained('clase');
            $table->foreignId('id_estudiante')->constrained('estudiante');
            $table->timestamp('fecha_ingreso')->useCurrent();
            $table->boolean('activo')->default(true);
            $table->timestamps();
            
            $table->unique(['id_clase', 'id_estudiante']);
        });

        // Tablas de dinámica de clase
        Schema::create('tipo_comportamiento', function (Blueprint $table) {
            $table->id();
            $table->string('nombre', 50)->unique();
            $table->text('descripcion')->nullable();
            $table->integer('puntos')->default(0);
            $table->enum('tipo', ['positivo', 'negativo'])->default('positivo');
            $table->string('icono', 10)->nullable();
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
            $table->string('imagen_personalizada')->nullable(); // ✅ COLUMNA IMAGEN AGREGADA
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
            $table->text('descripcion_entrega')->nullable();
            $table->timestamp('fecha_entrega')->useCurrent();
            $table->decimal('nota', 5, 2)->nullable();
            $table->text('comentario_docente')->nullable();
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
            $table->string('tipo', 50); // 'academico', 'social', 'asistencia', 'especial'
            $table->json('criterios')->nullable(); // criterios específicos para obtener el badge
            $table->string('rareza', 20)->default('comun'); // 'comun', 'raro', 'epico', 'legendario'
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
            $table->boolean('permitir_personajes')->default(true);
            $table->boolean('permitir_tienda')->default(true);
            $table->boolean('permitir_misiones')->default(true);
            $table->boolean('sistema_puntos_activo')->default(true);
            $table->boolean('sistema_badges_activo')->default(true);
            $table->boolean('moneda_virtual_activa')->default(true);
            $table->json('configuracion_puntos')->nullable();
            $table->json('configuracion_economia')->nullable();
            $table->json('limites_sistema')->nullable();
            $table->timestamps();
        });

        // Tablas de reportes
        Schema::create('estadistica_clase', function (Blueprint $table) {
            $table->id();
            $table->foreignId('id_clase')->constrained('clase');
            $table->decimal('promedio_nivel', 5, 2)->nullable();
            $table->decimal('promedio_participacion', 5, 2)->nullable();
            $table->json('distribucion_niveles')->nullable();
            $table->timestamps();
        });

        Schema::create('estadistica_personaje', function (Blueprint $table) {
            $table->id();
            $table->foreignId('id_personaje')->constrained('personaje');
            $table->integer('misiones_completadas')->default(0);
            $table->integer('actividades_completadas')->default(0);
            $table->timestamps();
        });
    }

    public function down()
    {
        // Eliminar en orden inverso para respetar las llaves foráneas
        Schema::dropIfExists('estadistica_personaje');
        Schema::dropIfExists('estadistica_clase');
        Schema::dropIfExists('configuracion_clase');
        Schema::dropIfExists('estudiante_badge');
        Schema::dropIfExists('badge');
        Schema::dropIfExists('notificacion');
        Schema::dropIfExists('item_tienda');
        Schema::dropIfExists('transaccion_moneda');
        Schema::dropIfExists('progreso_mision');
        
        // Eliminar columna id_mision de actividad antes de eliminar mision
        Schema::table('actividad', function (Blueprint $table) {
            $table->dropForeign(['id_mision']);
            $table->dropColumn('id_mision');
        });
        
        Schema::dropIfExists('mision');
        
        // Eliminar columna id_sesion de asistencia antes de eliminar sesion_clase
        Schema::table('asistencia', function (Blueprint $table) {
            $table->dropForeign(['id_sesion']);
            $table->dropColumn('id_sesion');
        });
        
        Schema::dropIfExists('sesion_clase');
        Schema::dropIfExists('entrega_actividad');
        Schema::dropIfExists('actividad');
        Schema::dropIfExists('tipo_actividad');
        Schema::dropIfExists('personaje');
        Schema::dropIfExists('estado_tarea');
        Schema::dropIfExists('asistencia');
        Schema::dropIfExists('registro_comportamiento');
        Schema::dropIfExists('tipo_comportamiento');
        Schema::dropIfExists('inscripcion_clase');
        Schema::dropIfExists('clase');
        Schema::dropIfExists('nivel_experiencia');
        Schema::dropIfExists('clase_rpg');
        Schema::dropIfExists('docente');
        Schema::dropIfExists('estudiante');
        Schema::dropIfExists('usuario');
        Schema::dropIfExists('estado_usuario');
        Schema::dropIfExists('tipo_usuario');
    }
};