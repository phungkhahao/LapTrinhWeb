<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use OpenApi\Attributes as OA;

class DatPhongCuaToiController extends Controller
{
    #[OA\Get(
        path: '/api/dat-phong-cua-toi',
        summary: 'Lấy danh sách đặt phòng của tôi',
        description: 'Chỉ trả về các đặt phòng thuộc người dùng đang được xác thực bởi Bearer token Sanctum.',
        tags: ['Đặt phòng'],
        security: [['sanctum' => []]],
        responses: [
            new OA\Response(
                response: 200,
                description: 'Lấy danh sách đặt phòng thành công',
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: 'success', type: 'boolean', example: true),
                        new OA\Property(property: 'message', type: 'string', example: 'Lấy danh sách đặt phòng của bạn thành công'),
                        new OA\Property(property: 'data', type: 'array', items: new OA\Items(type: 'object', properties: [
                            new OA\Property(property: 'id', type: 'integer', example: 1),
                            new OA\Property(property: 'ma_dat_phong', type: 'string', example: 'DP202608190001'),
                            new OA\Property(property: 'ten_phong', type: 'string', example: 'Deluxe 201'),
                            new OA\Property(property: 'hinh_anh', type: 'string', nullable: true),
                            new OA\Property(property: 'ngay_nhan_phong', type: 'string', format: 'date'),
                            new OA\Property(property: 'ngay_tra_phong', type: 'string', format: 'date'),
                            new OA\Property(property: 'so_luong_khach', type: 'integer', example: 2),
                            new OA\Property(property: 'tong_tien', type: 'number', example: 1600000),
                            new OA\Property(property: 'trang_thai', type: 'string', example: 'cho_xac_nhan'),
                            new OA\Property(property: 'phuong_thuc_thanh_toan', type: 'string', example: 'tai_khach_san'),
                            new OA\Property(property: 'trang_thai_thanh_toan', type: 'string', example: 'chua_thanh_toan'),
                            new OA\Property(property: 'created_at', type: 'string', format: 'date-time'),
                        ])),
                    ],
                ),
            ),
            new OA\Response(response: 401, description: 'Chưa xác thực'),
        ],
    )]
    public function index(Request $request): JsonResponse
    {
        $datPhong = DB::table('dat_phong as dp')
            ->join('phong as p', 'p.id', '=', 'dp.phong_id')
            ->leftJoin('thanh_toan as tt', 'tt.dat_phong_id', '=', 'dp.id')
            ->where('dp.nguoi_dung_id', $request->user()->id)
            ->orderByDesc('dp.created_at')
            ->select([
                'dp.id',
                'dp.ma_dat_phong',
                'p.ten_phong',
                'p.so_phong',
                'p.hinh_anh',
                'dp.ngay_nhan_phong',
                'dp.ngay_tra_phong',
                'dp.so_luong_khach',
                'dp.tong_tien',
                'dp.trang_thai',
                'tt.phuong_thuc_thanh_toan',
                'tt.trang_thai_thanh_toan',
                'dp.created_at',
            ])
            ->get();

        return response()->json([
            'success' => true,
            'message' => 'Lấy danh sách đặt phòng của bạn thành công',
            'data' => $datPhong,
        ], options: JSON_UNESCAPED_UNICODE);
    }

    #[OA\Get(
        path: '/api/dat-phong-cua-toi/{id}',
        summary: 'Lấy chi tiết đặt phòng của tôi',
        description: 'Chỉ trả về đặt phòng có ID thuộc người dùng đang được xác thực bởi Bearer token Sanctum.',
        tags: ['Đặt phòng'],
        security: [['sanctum' => []]],
        parameters: [new OA\Parameter(name: 'id', in: 'path', required: true, schema: new OA\Schema(type: 'integer'), example: 1)],
        responses: [
            new OA\Response(
                response: 200,
                description: 'Lấy chi tiết đặt phòng thành công',
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: 'success', type: 'boolean', example: true),
                        new OA\Property(property: 'message', type: 'string', example: 'Lấy chi tiết đặt phòng thành công'),
                        new OA\Property(property: 'data', type: 'object', properties: [
                            new OA\Property(property: 'id', type: 'integer', example: 1),
                            new OA\Property(property: 'ma_dat_phong', type: 'string', example: 'DP202608190001'),
                            new OA\Property(property: 'ten_phong', type: 'string', example: 'Deluxe 201'),
                            new OA\Property(property: 'hinh_anh', type: 'string', nullable: true),
                            new OA\Property(property: 'ten_khach_hang', type: 'string', example: 'Nguyễn Văn A'),
                            new OA\Property(property: 'ngay_nhan_phong', type: 'string', format: 'date'),
                            new OA\Property(property: 'ngay_tra_phong', type: 'string', format: 'date'),
                            new OA\Property(property: 'so_dem', type: 'integer', example: 2),
                            new OA\Property(property: 'tong_tien', type: 'number', example: 1600000),
                            new OA\Property(property: 'ghi_chu', type: 'string', nullable: true),
                            new OA\Property(property: 'trang_thai', type: 'string', example: 'cho_xac_nhan'),
                            new OA\Property(property: 'phuong_thuc_thanh_toan', type: 'string', example: 'tai_khach_san'),
                            new OA\Property(property: 'trang_thai_thanh_toan', type: 'string', example: 'chua_thanh_toan'),
                            new OA\Property(property: 'created_at', type: 'string', format: 'date-time'),
                        ]),
                    ],
                ),
            ),
            new OA\Response(response: 401, description: 'Chưa xác thực'),
            new OA\Response(response: 404, description: 'Không tìm thấy đặt phòng'),
        ],
    )]
    public function show(Request $request, int $id): JsonResponse
    {
        $datPhong = DB::table('dat_phong as dp')
            ->join('phong as p', 'p.id', '=', 'dp.phong_id')
            ->leftJoin('thanh_toan as tt', 'tt.dat_phong_id', '=', 'dp.id')
            ->where('dp.id', $id)
            ->where('dp.nguoi_dung_id', $request->user()->id)
            ->select([
                'dp.id',
                'dp.ma_dat_phong',
                'p.ten_phong',
                'p.so_phong',
                'p.hinh_anh',
                'p.gia_phong',
                'dp.ten_khach_hang',
                'dp.email_khach_hang',
                'dp.so_dien_thoai',
                'dp.ngay_nhan_phong',
                'dp.ngay_tra_phong',
                DB::raw('DATEDIFF(dp.ngay_tra_phong, dp.ngay_nhan_phong) as so_dem'),
                'dp.so_luong_khach',
                'dp.tong_tien',
                'dp.ghi_chu',
                'dp.trang_thai',
                'tt.phuong_thuc_thanh_toan',
                'tt.trang_thai_thanh_toan',
                'tt.so_tien as so_tien_thanh_toan',
                'dp.created_at',
            ])
            ->first();

        if ($datPhong === null) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy đặt phòng.',
                'data' => null,
            ], 404, options: JSON_UNESCAPED_UNICODE);
        }

        return response()->json([
            'success' => true,
            'message' => 'Lấy chi tiết đặt phòng thành công',
            'data' => $datPhong,
        ], options: JSON_UNESCAPED_UNICODE);
    }

    #[OA\Put(
        path: '/api/dat-phong-cua-toi/{id}/huy',
        summary: 'Hủy đặt phòng của tôi',
        description: 'Chỉ cho phép hủy đặt phòng thuộc người dùng đang xác thực và còn ở trạng thái chờ xác nhận.',
        tags: ['Đặt phòng'],
        security: [['sanctum' => []]],
        parameters: [new OA\Parameter(name: 'id', in: 'path', required: true, schema: new OA\Schema(type: 'integer'), example: 1)],
        responses: [
            new OA\Response(response: 200, description: 'Hủy đặt phòng thành công', content: new OA\JsonContent(properties: [
                new OA\Property(property: 'success', type: 'boolean', example: true),
                new OA\Property(property: 'message', type: 'string', example: 'Hủy đặt phòng thành công.'),
                new OA\Property(property: 'data', type: 'object', properties: [
                    new OA\Property(property: 'id', type: 'integer', example: 1),
                    new OA\Property(property: 'trang_thai', type: 'string', example: 'da_huy'),
                ]),
            ])),
            new OA\Response(response: 401, description: 'Chưa xác thực'),
            new OA\Response(response: 404, description: 'Không tìm thấy đặt phòng'),
            new OA\Response(response: 422, description: 'Đặt phòng không thể hủy'),
        ],
    )]
    public function huy(Request $request, int $id): JsonResponse
    {
        $ketQua = DB::transaction(function () use ($request, $id): array {
            $datPhong = DB::table('dat_phong')
                ->where('id', $id)
                ->where('nguoi_dung_id', $request->user()->id)
                ->lockForUpdate()
                ->first(['id', 'trang_thai']);

            if ($datPhong === null) {
                return ['loai' => 'khong_tim_thay'];
            }

            if ($datPhong->trang_thai === 'da_huy') {
                return ['loai' => 'da_huy'];
            }

            // Convention hiện có: booking mới là cho_xac_nhan, booking hủy là da_huy.
            if ($datPhong->trang_thai !== 'cho_xac_nhan') {
                return ['loai' => 'khong_the_huy'];
            }

            DB::table('dat_phong')
                ->where('id', $datPhong->id)
                ->update(['trang_thai' => 'da_huy', 'updated_at' => now()]);

            return [
                'loai' => 'thanh_cong',
                'data' => [
                    'id' => $datPhong->id,
                    'trang_thai' => 'da_huy',
                ]
            ];
        });

        return match ($ketQua['loai']) {
            'khong_tim_thay' => response()->json(['success' => false, 'message' => 'Không tìm thấy đặt phòng.', 'data' => null], 404, options: JSON_UNESCAPED_UNICODE),
            'da_huy' => response()->json(['success' => false, 'message' => 'Đặt phòng này đã được hủy.', 'data' => null], 422, options: JSON_UNESCAPED_UNICODE),
            'khong_the_huy' => response()->json(['success' => false, 'message' => 'Đặt phòng hiện không thể hủy.', 'data' => null], 422, options: JSON_UNESCAPED_UNICODE),
            default => response()->json(['success' => true, 'message' => 'Hủy đặt phòng thành công.', 'data' => $ketQua['data']], options: JSON_UNESCAPED_UNICODE),
        };
    }
}
