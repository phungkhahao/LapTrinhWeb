<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DichVu extends Model
{
    protected $table = 'dich_vu';

    protected $fillable = [
        'ten_dich_vu',
        'mo_ta',
        'gia',
        'trang_thai',
    ];

    protected function casts(): array
    {
        return [
            'gia' => 'decimal:2',
        ];
    }
}
