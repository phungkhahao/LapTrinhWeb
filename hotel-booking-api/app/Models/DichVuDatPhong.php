<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DichVuDatPhong extends Model
{
    protected $table = 'dich_vu_dat_phong';

    protected $fillable = [
        'dat_phong_id',
        'dich_vu_id',
        'so_luong',
        'don_gia',
    ];

    protected function casts(): array
    {
        return [
            'dat_phong_id' => 'integer',
            'dich_vu_id' => 'integer',
            'so_luong' => 'integer',
            'don_gia' => 'decimal:2',
        ];
    }
}
