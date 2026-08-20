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
        Schema::create('loai_phong', function (Blueprint $table) {
            $table->id();
            $table->string('ten_loai');
            $table->text('mo_ta')->nullable();
            $table->decimal('gia_co_ban', 12, 2);
            $table->integer('so_nguoi_toi_da');
            $table->string('trang_thai')->default('hoat_dong');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('loai_phong');
    }
};
