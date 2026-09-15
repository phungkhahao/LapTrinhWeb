<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use OpenApi\Attributes as OA;

class AdminNguoiDungController extends Controller
{
    #[OA\Get(path: '/api/admin/nguoi-dung', summary: 'Lấy danh sách người dùng quản trị', tags: ['Quản trị - Người dùng'], security: [['sanctum' => []]], parameters: [new OA\Parameter(name: 'tim_kiem', in: 'query', schema: new OA\Schema(type: 'string')), new OA\Parameter(name: 'page', in: 'query', schema: new OA\Schema(type: 'integer', minimum: 1))], responses: [new OA\Response(response: 200, description: 'Lấy danh sách người dùng thành công'), new OA\Response(response: 401, description: 'Chưa xác thực'), new OA\Response(response: 403, description: 'Không có quyền quản trị')])]
    public function index(Request $request): JsonResponse
    {
        $validator = Validator::make($request->query(), ['tim_kiem' => ['nullable', 'string', 'max:255'], 'page' => ['nullable', 'integer', 'min:1']], ['tim_kiem.string' => 'Từ khóa tìm kiếm không hợp lệ.', 'page.integer' => 'Trang không hợp lệ.']);
        if ($validator->fails()) return response()->json(['success' => false, 'message' => 'Dữ liệu không hợp lệ.', 'errors' => $validator->errors()], 422, options: JSON_UNESCAPED_UNICODE);
        $timKiem = trim((string) ($validator->validated()['tim_kiem'] ?? ''));
        $data = DB::table('nguoi_dung as nd')->select(['nd.id', 'nd.ho_ten', 'nd.email', 'nd.so_dien_thoai', 'nd.vai_tro', 'nd.trang_thai', 'nd.created_at'])
            ->selectRaw('(SELECT COUNT(*) FROM dat_phong dp WHERE dp.nguoi_dung_id = nd.id) as so_luong_dat_phong')
            ->when($timKiem !== '', fn ($query) => $query->where(fn ($q) => $q->where('nd.ho_ten', 'like', "%{$timKiem}%")->orWhere('nd.email', 'like', "%{$timKiem}%")->orWhere('nd.so_dien_thoai', 'like', "%{$timKiem}%")))
            ->orderByDesc('nd.created_at')->paginate(10);
        return response()->json(['success' => true, 'message' => 'Lấy danh sách người dùng thành công.', 'data' => $data->items(), 'pagination' => ['current_page' => $data->currentPage(), 'last_page' => $data->lastPage(), 'per_page' => $data->perPage(), 'total' => $data->total()]], options: JSON_UNESCAPED_UNICODE);
    }

    #[OA\Get(path: '/api/admin/nguoi-dung/{id}', summary: 'Lấy chi tiết người dùng', tags: ['Quản trị - Người dùng'], security: [['sanctum' => []]], parameters: [new OA\Parameter(name: 'id', in: 'path', required: true, schema: new OA\Schema(type: 'integer'))], responses: [new OA\Response(response: 200, description: 'Lấy chi tiết người dùng thành công'), new OA\Response(response: 404, description: 'Không tìm thấy người dùng')])]
    public function show(int $id): JsonResponse
    {
        $nguoiDung = DB::table('nguoi_dung as nd')->where('nd.id', $id)->select(['nd.id', 'nd.ho_ten', 'nd.email', 'nd.so_dien_thoai', 'nd.vai_tro', 'nd.trang_thai', 'nd.created_at'])->selectRaw('(SELECT COUNT(*) FROM dat_phong dp WHERE dp.nguoi_dung_id = nd.id) as so_luong_dat_phong')->first();
        return $nguoiDung ? response()->json(['success' => true, 'message' => 'Lấy chi tiết người dùng thành công.', 'data' => $nguoiDung], options: JSON_UNESCAPED_UNICODE) : $this->khongTimThay();
    }

    #[OA\Put(path: '/api/admin/nguoi-dung/{id}/trang-thai', summary: 'Khóa hoặc mở khóa người dùng', tags: ['Quản trị - Người dùng'], security: [['sanctum' => []]], requestBody: new OA\RequestBody(required: true, content: new OA\JsonContent(required: ['trang_thai'], properties: [new OA\Property(property: 'trang_thai', type: 'string', enum: ['hoat_dong', 'bi_khoa'])])), responses: [new OA\Response(response: 200, description: 'Cập nhật trạng thái thành công'), new OA\Response(response: 422, description: 'Dữ liệu không hợp lệ')])]
    public function capNhatTrangThai(Request $request, int $id): JsonResponse
    {
        $validator = Validator::make($request->only('trang_thai'), ['trang_thai' => ['required', 'in:hoat_dong,bi_khoa']], ['trang_thai.required' => 'Trạng thái là bắt buộc.', 'trang_thai.in' => 'Trạng thái không hợp lệ.']);
        if ($validator->fails()) return response()->json(['success' => false, 'message' => 'Dữ liệu không hợp lệ.', 'errors' => $validator->errors()], 422, options: JSON_UNESCAPED_UNICODE);
        $nguoiDung = DB::table('nguoi_dung')->where('id', $id)->first(['id', 'vai_tro', 'trang_thai']);
        if ($nguoiDung === null) return $this->khongTimThay();
        if ($nguoiDung->id === $request->user()->id) return response()->json(['success' => false, 'message' => 'Không thể thay đổi trạng thái tài khoản đang đăng nhập.', 'data' => null], 422, options: JSON_UNESCAPED_UNICODE);
        DB::table('nguoi_dung')->where('id', $id)->update(['trang_thai' => $validator->validated()['trang_thai'], 'updated_at' => now()]);
        return response()->json(['success' => true, 'message' => $validator->validated()['trang_thai'] === 'bi_khoa' ? 'Đã khóa tài khoản.' : 'Đã mở khóa tài khoản.', 'data' => $this->showData($id)], options: JSON_UNESCAPED_UNICODE);
    }

    private function showData(int $id): ?object { return DB::table('nguoi_dung')->where('id', $id)->select(['id', 'ho_ten', 'email', 'so_dien_thoai', 'vai_tro', 'trang_thai', 'created_at'])->first(); }
    private function khongTimThay(): JsonResponse { return response()->json(['success' => false, 'message' => 'Không tìm thấy người dùng.', 'data' => null], 404, options: JSON_UNESCAPED_UNICODE); }
}
