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
        Schema::create('dich_vu', function (Blueprint $table) {
            $table->id();
            $table->string('ten_dich_vu');
            $table->text('mo_ta')->nullable();
            $table->decimal('gia', 12, 2);
            $table->string('trang_thai')->default('hoat_dong');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('dich_vu');
    }
};
