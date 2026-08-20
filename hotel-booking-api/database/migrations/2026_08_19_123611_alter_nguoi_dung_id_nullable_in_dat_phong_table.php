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
        Schema::table('dat_phong', function (Blueprint $table) {
            $table->unsignedBigInteger('nguoi_dung_id')
                ->nullable()
                ->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Rollback sẽ không thực hiện được nếu còn booking khách vãng lai
        // có nguoi_dung_id = null. Migration này không tự xóa dữ liệu đó.
        Schema::table('dat_phong', function (Blueprint $table) {
            $table->unsignedBigInteger('nguoi_dung_id')
                ->nullable(false)
                ->change();
        });
    }
};
