<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\DatPhong;
use App\Models\Phong;
use App\Models\ThanhToan;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use OpenApi\Attributes as OA;

class DatPhongController extends Controller
{
    #[OA\Post(
        path: '/api/dat-phong',
        summary: 'Đặt phòng',
        description: 'Tạo đơn đặt phòng mới cho khách vãng lai. Hệ thống kiểm tra lại tình trạng phòng và tự tính tổng tiền trước khi lưu.',
        tags: ['Đặt phòng'],
        requestBody: new OA\RequestBody(required: true, content: new OA\JsonContent(
            required: ['phong_id', 'ten_khach_hang', 'email_khach_hang', 'so_dien_thoai', 'ngay_nhan_phong', 'ngay_tra_phong', 'so_luong_khach', 'phuong_thuc_thanh_toan'],
            properties: [
                new OA\Property(property: 'phong_id', type: 'integer', example: 1),
                new OA\Property(property: 'ten_khach_hang', type: 'string', example: 'Nguyễn Văn A'),
                new OA\Property(property: 'email_khach_hang', type: 'string', format: 'email', example: 'nguyenvana@example.com'),
                new OA\Property(property: 'so_dien_thoai', type: 'string', example: '0912345678'),
                new OA\Property(property: 'ngay_nhan_phong', type: 'string', format: 'date', example: '2026-08-25'),
                new OA\Property(property: 'ngay_tra_phong', type: 'string', format: 'date', example: '2026-08-28'),
                new OA\Property(property: 'so_luong_khach', type: 'integer', example: 2),
                new OA\Property(property: 'ghi_chu', type: 'string', nullable: true, example: 'Nhận phòng muộn'),
                new OA\Property(property: 'phuong_thuc_thanh_toan', type: 'string', enum: ['tai_khach_san'], example: 'tai_khach_san', description: 'Phương thức thanh toán. Hiện tại hỗ trợ thanh toán tại khách sạn.'),
            ],
        )),
        responses: [
            new OA\Response(
                response: 201,
                description: 'Đặt phòng thành công, bao gồm thông tin thanh toán tại khách sạn',
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: 'success', type: 'boolean', example: true),
                        new OA\Property(property: 'message', type: 'string', example: 'Đặt phòng thành công'),
                        new OA\Property(property: 'data', type: 'object', properties: [
                            new OA\Property(property: 'id', type: 'integer', example: 1),
                            new OA\Property(property: 'ma_dat_phong', type: 'string', example: 'DP202608190001'),
                            new OA\Property(property: 'tong_tien', type: 'number', example: 2400000),
                            new OA\Property(property: 'thanh_toan', type: 'object', properties: [
                                new OA\Property(property: 'phuong_thuc', type: 'string', example: 'tai_khach_san'),
                                new OA\Property(property: 'phuong_thuc_hien_thi', type: 'string', example: 'Thanh toán tại khách sạn'),
                                new OA\Property(property: 'trang_thai', type: 'string', example: 'chua_thanh_toan'),
                                new OA\Property(property: 'trang_thai_hien_thi', type: 'string', example: 'Chưa thanh toán'),
                                new OA\Property(property: 'so_tien', type: 'number', example: 2400000),
                            ]),
                        ]),
                    ],
                ),
            ),
            new OA\Response(response: 404, description: 'Không tìm thấy phòng'),
            new OA\Response(response: 409, description: 'Phòng đã được đặt trong khoảng thời gian này'),
            new OA\Response(response: 422, description: 'Dữ liệu không hợp lệ'),
        ],
    )]
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'phong_id' => ['required', 'integer', 'min:1'],
            'ten_khach_hang' => ['required', 'string'],
            'email_khach_hang' => ['required', 'email'],
            'so_dien_thoai' => ['required', 'string'],
            'ngay_nhan_phong' => ['required', 'date', 'after_or_equal:today'],
            'ngay_tra_phong' => ['required', 'date', 'after:ngay_nhan_phong'],
            'so_luong_khach' => ['required', 'integer', 'min:1'],
            'ghi_chu' => ['nullable', 'string'],
            'phuong_thuc_thanh_toan' => ['required', 'in:tai_khach_san'],
        ], [
            'phong_id.required' => 'Phòng là bắt buộc.',
            'phong_id.integer' => 'Phòng không hợp lệ.',
            'phong_id.min' => 'Phòng không hợp lệ.',
            'ten_khach_hang.required' => 'Họ tên khách hàng là bắt buộc.',
            'ten_khach_hang.string' => 'Họ tên khách hàng không hợp lệ.',
            'email_khach_hang.required' => 'Email khách hàng là bắt buộc.',
            'email_khach_hang.email' => 'Email khách hàng không đúng định dạng.',
            'so_dien_thoai.required' => 'Số điện thoại là bắt buộc.',
            'so_dien_thoai.string' => 'Số điện thoại không hợp lệ.',
            'ngay_nhan_phong.required' => 'Ngày nhận phòng là bắt buộc.',
            'ngay_nhan_phong.date' => 'Ngày nhận phòng không hợp lệ.',
            'ngay_nhan_phong.after_or_equal' => 'Ngày nhận phòng không được trước ngày hiện tại.',
            'ngay_tra_phong.required' => 'Ngày trả phòng là bắt buộc.',
            'ngay_tra_phong.date' => 'Ngày trả phòng không hợp lệ.',
            'ngay_tra_phong.after' => 'Ngày trả phòng phải sau ngày nhận phòng.',
            'so_luong_khach.required' => 'Số lượng khách là bắt buộc.',
            'so_luong_khach.integer' => 'Số lượng khách phải là số nguyên.',
            'so_luong_khach.min' => 'Số lượng khách phải ít nhất là 1.',
            'ghi_chu.string' => 'Ghi chú không hợp lệ.',
            'phuong_thuc_thanh_toan.required' => 'Vui lòng chọn phương thức thanh toán.',
            'phuong_thuc_thanh_toan.in' => 'Phương thức thanh toán không hợp lệ.',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Dữ liệu không hợp lệ',
                'errors' => $validator->errors(),
            ], 422, options: JSON_UNESCAPED_UNICODE);
        }

        try {
            $duLieu = $validator->validated();
            $nguoiDungId = $request->user('sanctum')?->id;
            $ketQua = DB::transaction(function () use ($duLieu, $nguoiDungId) {
                $phong = Phong::query()->whereKey($duLieu['phong_id'])->lockForUpdate()->first();

                if ($phong === null)
                    return ['loai' => 'khong_tim_thay'];
                if ($duLieu['so_luong_khach'] > $phong->so_nguoi_toi_da)
                    return ['loai' => 'vuot_suc_chua'];
                if ($phong->trang_thai !== 'trong')
                    return ['loai' => 'phong_khong_the_dat'];

                $daTrungLich = DatPhong::query()
                    ->where('phong_id', $phong->id)
                    ->where('trang_thai', '!=', 'da_huy')
                    ->where('ngay_nhan_phong', '<', $duLieu['ngay_tra_phong'])
                    ->where('ngay_tra_phong', '>', $duLieu['ngay_nhan_phong'])
                    ->exists();

                if ($daTrungLich)
                    return ['loai' => 'trung_lich'];

                $soDem = Carbon::parse($duLieu['ngay_nhan_phong'])->diffInDays(Carbon::parse($duLieu['ngay_tra_phong']));
                $tongTien = $soDem * (float) $phong->gia_phong;
                $datPhong = DatPhong::query()->create([
                    'ma_dat_phong' => $this->taoMaDatPhong(),
                    'nguoi_dung_id' => $nguoiDungId,
                    'phong_id' => $phong->id,
                    'ten_khach_hang' => $duLieu['ten_khach_hang'],
                    'email_khach_hang' => $duLieu['email_khach_hang'],
                    'so_dien_thoai' => $duLieu['so_dien_thoai'],
                    'ngay_nhan_phong' => $duLieu['ngay_nhan_phong'],
                    'ngay_tra_phong' => $duLieu['ngay_tra_phong'],
                    'so_luong_khach' => $duLieu['so_luong_khach'],
                    'tong_tien' => $tongTien,
                    'trang_thai' => 'cho_xac_nhan',
                    'ghi_chu' => $duLieu['ghi_chu'] ?? null,
                ]);
                $thanhToan = ThanhToan::query()->create([
                    'dat_phong_id' => $datPhong->id,
                    'so_tien' => $datPhong->tong_tien,
                    'phuong_thuc_thanh_toan' => 'tai_khach_san',
                    'trang_thai_thanh_toan' => 'chua_thanh_toan',
                    'ma_giao_dich' => null,
                    'thoi_gian_thanh_toan' => null,
                ]);

                return [
                    'loai' => 'thanh_cong',
                    'data' => [
                        'id' => $datPhong->id,
                        'ma_dat_phong' => $datPhong->ma_dat_phong,
                        'phong_id' => $phong->id,
                        'ten_phong' => $phong->ten_phong,
                        'so_phong' => $phong->so_phong,
                        'ngay_nhan_phong' => $duLieu['ngay_nhan_phong'],
                        'ngay_tra_phong' => $duLieu['ngay_tra_phong'],
                        'so_dem' => $soDem,
                        'so_luong_khach' => $duLieu['so_luong_khach'],
                        'gia_phong' => (float) $phong->gia_phong,
                        'tong_tien' => $tongTien,
                        'trang_thai' => 'cho_xac_nhan',
                        'trang_thai_hien_thi' => 'Chờ xác nhận',
                        'thanh_toan' => [
                            'id' => $thanhToan->id,
                            'phuong_thuc' => $thanhToan->phuong_thuc_thanh_toan,
                            'phuong_thuc_hien_thi' => 'Thanh toán tại khách sạn',
                            'trang_thai' => $thanhToan->trang_thai_thanh_toan,
                            'trang_thai_hien_thi' => 'Chưa thanh toán',
                            'so_tien' => (float) $thanhToan->so_tien,
                        ],
                    ]
                ];
            });

            return match ($ketQua['loai']) {
                'khong_tim_thay' => response()->json(['success' => false, 'message' => 'Không tìm thấy phòng', 'data' => null], 404, options: JSON_UNESCAPED_UNICODE),
                'vuot_suc_chua' => response()->json(['success' => false, 'message' => 'Số lượng khách vượt quá sức chứa tối đa của phòng.', 'data' => null], 422, options: JSON_UNESCAPED_UNICODE),
                'phong_khong_the_dat' => response()->json(['success' => false, 'message' => 'Phòng hiện không thể đặt.', 'data' => null], 422, options: JSON_UNESCAPED_UNICODE),
                'trung_lich' => response()->json(['success' => false, 'message' => 'Phòng đã được đặt trong khoảng thời gian này. Vui lòng chọn phòng khác.', 'data' => null], 409, options: JSON_UNESCAPED_UNICODE),
                default => response()->json(['success' => true, 'message' => 'Đặt phòng thành công', 'data' => $ketQua['data']], 201, options: JSON_UNESCAPED_UNICODE),
            };
        } catch (\Throwable) {
            return response()->json(['success' => false, 'message' => 'Đã xảy ra lỗi. Vui lòng thử lại.', 'data' => null], 500, options: JSON_UNESCAPED_UNICODE);
        }
    }

    private function taoMaDatPhong(): string
    {
        do {
            $maDatPhong = 'DP' . now()->format('YmdHisv') . strtoupper(Str::random(4));
        } while (DatPhong::query()->where('ma_dat_phong', $maDatPhong)->exists());

        return $maDatPhong;
    }
}
