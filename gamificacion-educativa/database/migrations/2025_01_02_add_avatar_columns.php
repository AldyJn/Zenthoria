<?php

// database/migrations/2025_01_02_add_avatar_columns.php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        // Agregar columna avatar a la tabla usuario
        Schema::table('usuario', function (Blueprint $table) {
            $table->string('avatar')->nullable()->after('correo');
        });

        // Agregar columna imagen_personalizada a la tabla personaje
        Schema::table('personaje', function (Blueprint $table) {
            $table->string('imagen_personalizada')->nullable()->after('avatar_base');
        });
    }

    public function down()
    {
        Schema::table('usuario', function (Blueprint $table) {
            $table->dropColumn('avatar');
        });

        Schema::table('personaje', function (Blueprint $table) {
            $table->dropColumn('imagen_personalizada');
        });
    }
};