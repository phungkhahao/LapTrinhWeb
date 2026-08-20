<?php

namespace Database\Seeders;

use App\Models\NguoiDung;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminSeeder extends Seeder
{
    public function run(): void
    {
        NguoiDung::updateOrCreate(
            ['email' => 'admin@hotel.com'],
            [
                'ho_ten' => 'Quản trị viên',
                'mat_khau' => Hash::make('Admin@123'),
                'so_dien_thoai' => null,
                'vai_tro' => 'admin',
                'trang_thai' => 'hoat_dong',
            ],
        );
    }
}
