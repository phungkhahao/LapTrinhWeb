<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\DichVu;
use Illuminate\Http\JsonResponse;
use OpenApi\Attributes as OA;

class DichVuController extends Controller
{
    #[OA\Get(
        path: '/api/dich-vu',
        summary: 'Lấy danh sách dịch vụ đang hoạt động',
        tags: ['Dịch vụ'],
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
        $dichVus = DichVu::query()
            ->where('trang_thai', 'hoat_dong')
            ->select([
                'id',
                'ten_dich_vu',
                'mo_ta',
                'gia',
                'trang_thai',
            ])
            ->get();

        return response()->json([
            'success' => true,
            'message' => 'Lấy dữ liệu thành công',
            'data' => $dichVus,
        ], options: JSON_UNESCAPED_UNICODE);
    }
}
