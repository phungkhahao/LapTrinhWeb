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
        Schema::create('dat_phong', function (Blueprint $table) {
            $table->id();
            $table->string('ma_dat_phong')->unique();
            $table->unsignedBigInteger('nguoi_dung_id');
            $table->unsignedBigInteger('phong_id');
            $table->string('ten_khach_hang');
            $table->string('email_khach_hang');
            $table->string('so_dien_thoai');
            $table->date('ngay_nhan_phong');
            $table->date('ngay_tra_phong');
            $table->integer('so_luong_khach');
            $table->decimal('tong_tien', 12, 2);
            $table->string('trang_thai')->default('cho_xac_nhan');
            $table->text('ghi_chu')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('dat_phong');
    }
};
