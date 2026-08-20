<?php

namespace Database\Seeders;

use App\Models\LoaiPhong;
use Illuminate\Database\Seeder;

class LoaiPhongSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $loaiPhongs = [
            ['id' => 1, 'ten_loai' => 'Phòng Tiêu Chuẩn', 'mo_ta' => 'Phòng tiêu chuẩn tiện nghi, phù hợp cho 2 người.', 'gia_co_ban' => 500000, 'so_nguoi_toi_da' => 2, 'trang_thai' => 'hoat_dong'],
            ['id' => 2, 'ten_loai' => 'Phòng Cao Cấp', 'mo_ta' => 'Phòng cao cấp với không gian rộng rãi và đầy đủ tiện nghi.', 'gia_co_ban' => 800000, 'so_nguoi_toi_da' => 2, 'trang_thai' => 'hoat_dong'],
            ['id' => 3, 'ten_loai' => 'Phòng Gia Đình', 'mo_ta' => 'Phòng rộng rãi dành cho gia đình, sức chứa tối đa 4 người.', 'gia_co_ban' => 1200000, 'so_nguoi_toi_da' => 4, 'trang_thai' => 'hoat_dong'],
        ];

        foreach ($loaiPhongs as $loaiPhong) {
            LoaiPhong::updateOrCreate(['id' => $loaiPhong['id']], $loaiPhong);
        }
    }
}
