<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('phong', function (Blueprint $table) {
            $table->unsignedBigInteger('gia_phong')->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('phong', function (Blueprint $table) {
            $table->decimal('gia_phong', 12, 2)->change();
        });
    }
};
