<?php

namespace Database\Seeders;

use App\Models\DichVu;
use Illuminate\Database\Seeder;

class DichVuSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $dichVus = [
            ['id' => 1, 'ten_dich_vu' => 'Ăn sáng', 'mo_ta' => 'Bữa sáng phục vụ tại nhà hàng của khách sạn.', 'gia' => 100000, 'trang_thai' => 'hoat_dong'],
            ['id' => 2, 'ten_dich_vu' => 'Đưa đón sân bay', 'mo_ta' => 'Dịch vụ đưa đón khách giữa sân bay và khách sạn.', 'gia' => 300000, 'trang_thai' => 'hoat_dong'],
            ['id' => 3, 'ten_dich_vu' => 'Giặt ủi', 'mo_ta' => 'Dịch vụ giặt và ủi quần áo cho khách lưu trú.', 'gia' => 150000, 'trang_thai' => 'hoat_dong'],
            ['id' => 4, 'ten_dich_vu' => 'Thuê xe máy', 'mo_ta' => 'Dịch vụ thuê xe máy dành cho khách lưu trú.', 'gia' => 200000, 'trang_thai' => 'hoat_dong'],
        ];

        foreach ($dichVus as $dichVu) {
            DichVu::updateOrCreate(['id' => $dichVu['id']], $dichVu);
        }
    }
}
