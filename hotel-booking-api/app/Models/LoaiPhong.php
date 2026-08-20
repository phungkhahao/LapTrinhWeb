<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LoaiPhong extends Model
{
    protected $table = 'loai_phong';

    protected $fillable = [
        'ten_loai',
        'mo_ta',
        'gia_co_ban',
        'so_nguoi_toi_da',
        'trang_thai',
    ];

    protected function casts(): array
    {
        return [
            'gia_co_ban' => 'decimal:2',
            'so_nguoi_toi_da' => 'integer',
        ];
    }
}
