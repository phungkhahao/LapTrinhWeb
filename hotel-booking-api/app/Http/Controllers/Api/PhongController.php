<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\DatPhong;
use App\Models\Phong;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;
use OpenApi\Attributes as OA;

class PhongController extends Controller
{
    #[OA\Get(
        path: '/api/phong',
        summary: 'Lấy danh sách phòng',
        tags: ['Phòng'],
        parameters: [
            new OA\Parameter(name: 'trang_thai', in: 'query', description: 'Lọc chính xác theo trạng thái phòng', schema: new OA\Schema(type: 'string')),
            new OA\Parameter(name: 'loai_phong_id', in: 'query', description: 'Lọc chính xác theo ID loại phòng', schema: new OA\Schema(type: 'integer', minimum: 1)),
            new OA\Parameter(name: 'so_nguoi', in: 'query', description: 'Lọc phòng có số người tối đa lớn hơn hoặc bằng giá trị này', schema: new OA\Schema(type: 'integer', minimum: 1)),
        ],
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
            new OA\Response(
                response: 422,
                description: 'Tham số truy vấn không hợp lệ',
                content: new OA\JsonContent(
                    type: 'object',
                    properties: [
                        new OA\Property(property: 'success', type: 'boolean', example: false),
                        new OA\Property(property: 'message', type: 'string', example: 'Dữ liệu không hợp lệ'),
                        new OA\Property(property: 'data', type: 'null', example: null),
                    ],
                ),
            ),
        ],
    )]
    public function index(Request $request): JsonResponse
    {
        $validator = Validator::make($request->query(), [
            'trang_thai' => ['nullable', 'string'],
            'loai_phong_id' => ['nullable', 'integer', 'min:1'],
            'so_nguoi' => ['nullable', 'integer', 'min:1'],
        ], [
            'trang_thai.string' => 'Trạng thái phải là chuỗi ký tự.',
            'loai_phong_id.integer' => 'Loại phòng không hợp lệ.',
            'loai_phong_id.min' => 'Loại phòng không hợp lệ.',
            'so_nguoi.integer' => 'Số lượng khách phải là số nguyên.',
            'so_nguoi.min' => 'Số lượng khách phải ít nhất là 1.',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Dữ liệu không hợp lệ',
                'data' => null,
                'errors' => $validator->errors(),
            ], 422, options: JSON_UNESCAPED_UNICODE);
        }

        $phongs = Phong::query()
            ->select([
                'id',
                'so_phong',
                'loai_phong_id',
                'ten_phong',
                'gia_phong',
                'so_nguoi_toi_da',
                'mo_ta',
                'hinh_anh',
                'trang_thai',
            ])
            ->where('trang_thai', 'trong')
            ->when($request->filled('trang_thai'), fn($query) => $query->where('trang_thai', $request->query('trang_thai')))
            ->when($request->filled('loai_phong_id'), fn($query) => $query->where('loai_phong_id', $request->integer('loai_phong_id')))
            ->when($request->filled('so_nguoi'), fn($query) => $query->where('so_nguoi_toi_da', '>=', $request->integer('so_nguoi')))
            ->get()
            ->map(fn(Phong $phong) => $this->dinhDangHinhAnh($phong));

        return response()->json([
            'success' => true,
            'message' => 'Lấy dữ liệu thành công',
            'data' => $phongs,
        ], options: JSON_UNESCAPED_UNICODE);
    }

    #[OA\Get(
        path: '/api/phong/tim-kiem',
        summary: 'Tìm phòng trống',
        description: 'Tìm danh sách phòng còn trống theo ngày nhận phòng, ngày trả phòng, số lượng khách và loại phòng.',
        tags: ['Phòng'],
        parameters: [
            new OA\Parameter(name: 'ngay_nhan_phong', in: 'query', required: true, description: 'Ngày nhận phòng', schema: new OA\Schema(type: 'string', format: 'date'), example: '2026-08-25'),
            new OA\Parameter(name: 'ngay_tra_phong', in: 'query', required: true, description: 'Ngày trả phòng', schema: new OA\Schema(type: 'string', format: 'date'), example: '2026-08-27'),
            new OA\Parameter(name: 'so_luong_khach', in: 'query', required: true, description: 'Số lượng khách', schema: new OA\Schema(type: 'integer', minimum: 1), example: 2),
            new OA\Parameter(name: 'loai_phong_id', in: 'query', required: false, description: 'ID loại phòng', schema: new OA\Schema(type: 'integer', minimum: 1), example: 1),
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: 'Tìm phòng thành công',
                content: new OA\JsonContent(
                    type: 'object',
                    properties: [
                        new OA\Property(property: 'success', type: 'boolean', example: true),
                        new OA\Property(property: 'message', type: 'string', example: 'Tìm phòng thành công'),
                        new OA\Property(property: 'data', type: 'array', items: new OA\Items(type: 'object')),
                    ],
                ),
            ),
            new OA\Response(
                response: 422,
                description: 'Dữ liệu không hợp lệ',
                content: new OA\JsonContent(
                    type: 'object',
                    properties: [
                        new OA\Property(property: 'success', type: 'boolean', example: false),
                        new OA\Property(property: 'message', type: 'string', example: 'Dữ liệu không hợp lệ'),
                        new OA\Property(property: 'errors', type: 'object'),
                    ],
                ),
            ),
        ],
    )]
    public function timKiem(Request $request): JsonResponse
    {
        $validator = Validator::make($request->query(), [
            'ngay_nhan_phong' => ['required', 'date'],
            'ngay_tra_phong' => ['required', 'date', 'after:ngay_nhan_phong'],
            'so_luong_khach' => ['required', 'integer', 'min:1'],
            'loai_phong_id' => ['nullable', 'integer', 'min:1', 'exists:loai_phong,id'],
        ], [
            'ngay_nhan_phong.required' => 'Ngày nhận phòng là bắt buộc.',
            'ngay_nhan_phong.date' => 'Ngày nhận phòng không hợp lệ.',
            'ngay_tra_phong.required' => 'Ngày trả phòng là bắt buộc.',
            'ngay_tra_phong.date' => 'Ngày trả phòng không hợp lệ.',
            'ngay_tra_phong.after' => 'Ngày trả phòng phải sau ngày nhận phòng.',
            'so_luong_khach.required' => 'Số lượng khách là bắt buộc.',
            'so_luong_khach.integer' => 'Số lượng khách phải là số nguyên.',
            'so_luong_khach.min' => 'Số lượng khách phải ít nhất là 1.',
            'loai_phong_id.integer' => 'Loại phòng không hợp lệ.',
            'loai_phong_id.min' => 'Loại phòng không hợp lệ.',
            'loai_phong_id.exists' => 'Loại phòng không hợp lệ.',
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
            $phongDaDuocDat = DatPhong::query()
                ->where('trang_thai', '!=', 'da_huy')
                ->where('ngay_nhan_phong', '<', $duLieu['ngay_tra_phong'])
                ->where('ngay_tra_phong', '>', $duLieu['ngay_nhan_phong'])
                ->pluck('phong_id');

            $phongs = Phong::query()
                ->select([
                    'id',
                    'so_phong',
                    'loai_phong_id',
                    'ten_phong',
                    'gia_phong',
                    'so_nguoi_toi_da',
                    'mo_ta',
                    'hinh_anh',
                    'trang_thai',
                ])
                ->where('trang_thai', 'trong')
                ->where('so_nguoi_toi_da', '>=', $duLieu['so_luong_khach'])
                ->when(isset($duLieu['loai_phong_id']), fn($query) => $query->where('loai_phong_id', $duLieu['loai_phong_id']))
                ->when($phongDaDuocDat->isNotEmpty(), fn($query) => $query->whereNotIn('id', $phongDaDuocDat))
                ->get()
                ->map(fn(Phong $phong) => $this->dinhDangHinhAnh($phong));

            return response()->json([
                'success' => true,
                'message' => $phongs->isEmpty() ? 'Không tìm thấy phòng trống phù hợp' : 'Tìm phòng thành công',
                'data' => $phongs,
            ], options: JSON_UNESCAPED_UNICODE);
        } catch (\Throwable) {
            return response()->json([
                'success' => false,
                'message' => 'Đã xảy ra lỗi. Vui lòng thử lại.',
                'data' => null,
            ], 500, options: JSON_UNESCAPED_UNICODE);
        }
    }

    #[OA\Get(
        path: '/api/phong/{id}',
        summary: 'Lấy thông tin chi tiết phòng',
        tags: ['Phòng'],
        parameters: [
            new OA\Parameter(name: 'id', in: 'path', required: true, description: 'ID phòng', schema: new OA\Schema(type: 'integer', minimum: 1), example: 1),
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: 'Lấy thông tin phòng thành công',
                content: new OA\JsonContent(
                    type: 'object',
                    properties: [
                        new OA\Property(property: 'success', type: 'boolean', example: true),
                        new OA\Property(property: 'message', type: 'string', example: 'Lấy thông tin phòng thành công'),
                        new OA\Property(property: 'data', type: 'object'),
                    ],
                ),
            ),
            new OA\Response(
                response: 404,
                description: 'Không tìm thấy phòng',
                content: new OA\JsonContent(
                    type: 'object',
                    properties: [
                        new OA\Property(property: 'success', type: 'boolean', example: false),
                        new OA\Property(property: 'message', type: 'string', example: 'Không tìm thấy phòng'),
                        new OA\Property(property: 'data', type: 'null', example: null),
                    ],
                ),
            ),
        ],
    )]
    public function show(int $id): JsonResponse
    {
        $phong = Phong::query()
            ->select([
                'id',
                'so_phong',
                'loai_phong_id',
                'ten_phong',
                'gia_phong',
                'so_nguoi_toi_da',
                'mo_ta',
                'hinh_anh',
                'trang_thai',
            ])
            ->find($id);

        if ($phong === null) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy phòng',
                'data' => null,
            ], 404, options: JSON_UNESCAPED_UNICODE);
        }

        return response()->json([
            'success' => true,
            'message' => 'Lấy thông tin phòng thành công',
            'data' => $this->dinhDangHinhAnh($phong),
        ], options: JSON_UNESCAPED_UNICODE);
    }

    private function dinhDangHinhAnh(Phong $phong): Phong
    {
        if ($phong->hinh_anh && str_starts_with($phong->hinh_anh, 'phong/')) {
            $phong->hinh_anh = Storage::disk('public')->url($phong->hinh_anh);
        }

        return $phong;
    }
}
