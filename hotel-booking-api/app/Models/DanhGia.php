<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DanhGia extends Model
{
    protected $table = 'danh_gia';

    protected $fillable = [
        'nguoi_dung_id',
        'phong_id',
        'so_sao',
        'noi_dung',
        'trang_thai',
    ];

    protected function casts(): array
    {
        return [
            'nguoi_dung_id' => 'integer',
            'phong_id' => 'integer',
            'so_sao' => 'integer',
        ];
    }
}
