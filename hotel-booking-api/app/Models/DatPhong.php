<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DatPhong extends Model
{
    protected $table = 'dat_phong';

    protected $fillable = [
        'ma_dat_phong',
        'nguoi_dung_id',
        'phong_id',
        'ten_khach_hang',
        'email_khach_hang',
        'so_dien_thoai',
        'ngay_nhan_phong',
        'ngay_tra_phong',
        'so_luong_khach',
        'tong_tien',
        'trang_thai',
        'ghi_chu',
    ];

    protected function casts(): array
    {
        return [
            'nguoi_dung_id' => 'integer',
            'phong_id' => 'integer',
            'ngay_nhan_phong' => 'date',
            'ngay_tra_phong' => 'date',
            'so_luong_khach' => 'integer',
            'tong_tien' => 'decimal:2',
        ];
    }
}
