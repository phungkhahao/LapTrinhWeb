<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\LoaiPhong;
use Illuminate\Http\JsonResponse;
use OpenApi\Attributes as OA;

class LoaiPhongController extends Controller
{
    #[OA\Get(
        path: '/api/loai-phong',
        summary: 'Lấy danh sách loại phòng đang hoạt động',
        tags: ['Loại phòng'],
        responses: [
            new OA\Response(
                response: 200,
                description: 'Lấy dữ liệu thành công',
                content: new OA\JsonContent(
                    type: 'object',
                    properties: [
                        new OA\Property(property: 'success', type: 'boolean', example: true),
                        new OA\Property(property: 'message', type: 'string', example: 'Lấy dữ liệu thành công'),
                        new OA\Property(property: 'data', type: 'array', items: new OA\Items(type: 'object')),
                    ],
                ),
            ),
        ],
    )]
    public function index(): JsonResponse
    {
        $loaiPhongs = LoaiPhong::query()
            ->where('trang_thai', 'hoat_dong')
            ->select([
                'id',
                'ten_loai',
                'mo_ta',
                'gia_co_ban',
                'so_nguoi_toi_da',
                'trang_thai',
            ])
            ->get();

        return response()->json([
            'success' => true,
            'message' => 'Lấy dữ liệu thành công',
            'data' => $loaiPhongs,
        ], options: JSON_UNESCAPED_UNICODE);
    }
}
