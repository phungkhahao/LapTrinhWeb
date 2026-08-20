<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ThanhToan extends Model
{
    protected $table = 'thanh_toan';

    protected $fillable = [
        'dat_phong_id',
        'so_tien',
        'phuong_thuc_thanh_toan',
        'trang_thai_thanh_toan',
        'ma_giao_dich',
        'thoi_gian_thanh_toan',
    ];

    protected function casts(): array
    {
        return [
            'dat_phong_id' => 'integer',
            'so_tien' => 'decimal:2',
            'thoi_gian_thanh_toan' => 'datetime',
        ];
    }
}
