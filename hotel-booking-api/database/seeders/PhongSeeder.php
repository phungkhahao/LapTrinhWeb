<?php

namespace Database\Seeders;

use App\Models\LoaiPhong;
use App\Models\Phong;
use Illuminate\Database\Seeder;

class PhongSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $loaiPhongIds = LoaiPhong::query()
            ->whereIn('ten_loai', ['Phòng Tiêu Chuẩn', 'Phòng Cao Cấp', 'Phòng Gia Đình'])
            ->pluck('id', 'ten_loai');

        $phongs = [
            ['so_phong' => '101', 'ten_loai' => 'Phòng Tiêu Chuẩn', 'ten_phong' => 'Phòng Tiêu Chuẩn 101', 'gia_phong' => 500000, 'so_nguoi_toi_da' => 2],
            ['so_phong' => '102', 'ten_loai' => 'Phòng Tiêu Chuẩn', 'ten_phong' => 'Phòng Tiêu Chuẩn 102', 'gia_phong' => 500000, 'so_nguoi_toi_da' => 2],
            ['so_phong' => '103', 'ten_loai' => 'Phòng Tiêu Chuẩn', 'ten_phong' => 'Phòng Tiêu Chuẩn 103', 'gia_phong' => 500000, 'so_nguoi_toi_da' => 2],
            ['so_phong' => '201', 'ten_loai' => 'Phòng Cao Cấp', 'ten_phong' => 'Phòng Cao Cấp 201', 'gia_phong' => 800000, 'so_nguoi_toi_da' => 2],
            ['so_phong' => '202', 'ten_loai' => 'Phòng Cao Cấp', 'ten_phong' => 'Phòng Cao Cấp 202', 'gia_phong' => 800000, 'so_nguoi_toi_da' => 2],
            ['so_phong' => '203', 'ten_loai' => 'Phòng Cao Cấp', 'ten_phong' => 'Phòng Cao Cấp 203', 'gia_phong' => 800000, 'so_nguoi_toi_da' => 2],
            ['so_phong' => '301', 'ten_loai' => 'Phòng Gia Đình', 'ten_phong' => 'Phòng Gia Đình 301', 'gia_phong' => 1200000, 'so_nguoi_toi_da' => 4],
            ['so_phong' => '302', 'ten_loai' => 'Phòng Gia Đình', 'ten_phong' => 'Phòng Gia Đình 302', 'gia_phong' => 1200000, 'so_nguoi_toi_da' => 4],
        ];

        foreach ($phongs as $phong) {
            $loaiPhongId = $loaiPhongIds->get($phong['ten_loai']);

            if ($loaiPhongId === null) {
                throw new \RuntimeException("Không tìm thấy loại phòng: {$phong['ten_loai']}");
            }

            Phong::updateOrCreate(
                ['so_phong' => $phong['so_phong']],
                [
                    'loai_phong_id' => $loaiPhongId,
                    'ten_phong' => $phong['ten_phong'],
                    'gia_phong' => $phong['gia_phong'],
                    'so_nguoi_toi_da' => $phong['so_nguoi_toi_da'],
                    'mo_ta' => "{$phong['ten_phong']} có đầy đủ tiện nghi cơ bản.",
                    'hinh_anh' => null,
                    'trang_thai' => 'trong',
                ],
            );
        }
    }
}
