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
        Schema::create('phong', function (Blueprint $table) {
            $table->id();
            $table->string('so_phong')->unique();
            $table->unsignedBigInteger('loai_phong_id');
            $table->string('ten_phong')->nullable();
            $table->decimal('gia_phong', 12, 2);
            $table->integer('so_nguoi_toi_da');
            $table->text('mo_ta')->nullable();
            $table->string('hinh_anh')->nullable();
            $table->string('trang_thai')->default('trong');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('phong');
    }
};
