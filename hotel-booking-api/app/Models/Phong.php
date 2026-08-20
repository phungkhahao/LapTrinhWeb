<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Phong extends Model
{
    protected $table = 'phong';

    protected $fillable = [
        'so_phong',
        'loai_phong_id',
        'ten_phong',
        'gia_phong',
        'so_nguoi_toi_da',
        'mo_ta',
        'hinh_anh',
        'trang_thai',
    ];

    protected function casts(): array
    {
        return [
            'gia_phong' => 'integer',
            'so_nguoi_toi_da' => 'integer',
            'loai_phong_id' => 'integer',
        ];
    }
}
