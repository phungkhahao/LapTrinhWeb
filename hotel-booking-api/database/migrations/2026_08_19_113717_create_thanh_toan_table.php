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
        Schema::create('thanh_toan', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('dat_phong_id');
            $table->decimal('so_tien', 12, 2);
            $table->string('phuong_thuc_thanh_toan')->nullable();
            $table->string('trang_thai_thanh_toan')->default('chua_thanh_toan');
            $table->string('ma_giao_dich')->nullable();
            $table->timestamp('thoi_gian_thanh_toan')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('thanh_toan');
    }
};
