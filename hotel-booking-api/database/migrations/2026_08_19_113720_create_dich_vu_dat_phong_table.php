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
        Schema::create('dich_vu_dat_phong', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('dat_phong_id');
            $table->unsignedBigInteger('dich_vu_id');
            $table->integer('so_luong')->default(1);
            $table->decimal('don_gia', 12, 2);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('dich_vu_dat_phong');
    }
};
