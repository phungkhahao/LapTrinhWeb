<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use OpenApi\Attributes as OA;

class AdminDashboardController extends Controller
{
    #[OA\Get(
        path: '/api/admin/dashboard',
        summary: 'Lấy số liệu dashboard quản trị',
        tags: ['Quản trị'],
        security: [['sanctum' => []]],
        responses: [
            new OA\Response(response: 200, description: 'Lấy số liệu dashboard thành công', content: new OA\JsonContent(properties: [
                new OA\Property(property: 'success', type: 'boolean', example: true),
                new OA\Property(property: 'message', type: 'string', example: 'Lấy số liệu dashboard thành công'),
                new OA\Property(property: 'data', type: 'object', properties: [
                    new OA\Property(property: 'tong_so_phong', type: 'integer', example: 8),
                    new OA\Property(property: 'so_phong_dang_trong', type: 'integer', example: 8),
                    new OA\Property(property: 'tong_so_dat_phong', type: 'integer', example: 5),
                    new OA\Property(property: 'so_dat_phong_cho_xac_nhan', type: 'integer', example: 3),
                    new OA\Property(property: 'so_dat_phong_da_huy', type: 'integer', example: 1),
                    new OA\Property(property: 'tong_so_khach_hang', type: 'integer', example: 12),
                    new OA\Property(property: 'doanh_thu_du_kien', type: 'number', example: 5400000),
                ]),
            ])),
            new OA\Response(response: 401, description: 'Chưa xác thực'),
            new OA\Response(response: 403, description: 'Không có quyền quản trị'),
        ],
    )]
    public function index(): JsonResponse
    {
        $duLieu = [
            'tong_so_phong' => DB::table('phong')->count(),
            'so_phong_dang_trong' => DB::table('phong')->where('trang_thai', 'trong')->count(),
            'tong_so_dat_phong' => DB::table('dat_phong')->count(),
            'so_dat_phong_cho_xac_nhan' => DB::table('dat_phong')->where('trang_thai', 'cho_xac_nhan')->count(),
            'so_dat_phong_da_huy' => DB::table('dat_phong')->where('trang_thai', 'da_huy')->count(),
            'tong_so_khach_hang' => DB::table('nguoi_dung')->where('vai_tro', 'khach_hang')->count(),
            'doanh_thu_du_kien' => (float) DB::table('dat_phong')->where('trang_thai', '!=', 'da_huy')->sum('tong_tien'),
        ];

        return response()->json([
            'success' => true,
            'message' => 'Lấy số liệu dashboard thành công',
            'data' => $duLieu,
        ], options: JSON_UNESCAPED_UNICODE);
    }
}
