<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use OpenApi\Attributes as OA;

class AdminLienHeController extends Controller
{
    #[OA\Get(path: '/api/admin/lien-he', summary: 'Lấy danh sách liên hệ', tags: ['Quản trị - Liên hệ'], security: [['sanctum' => []]], parameters: [new OA\Parameter(name: 'tim_kiem', in: 'query', schema: new OA\Schema(type: 'string')), new OA\Parameter(name: 'trang_thai', in: 'query', schema: new OA\Schema(type: 'string', enum: ['chua_xu_ly', 'da_xu_ly'])), new OA\Parameter(name: 'page', in: 'query', schema: new OA\Schema(type: 'integer'))], responses: [new OA\Response(response: 200, description: 'Thành công'), new OA\Response(response: 401, description: 'Chưa xác thực'), new OA\Response(response: 403, description: 'Không có quyền quản trị')])]
    public function index(Request $request): JsonResponse
    {
        $validator = Validator::make($request->query(), ['tim_kiem' => ['nullable', 'string', 'max:255'], 'trang_thai' => ['nullable', 'in:chua_xu_ly,da_xu_ly'], 'page' => ['nullable', 'integer', 'min:1'], 'per_page' => ['nullable', 'integer', 'min:1', 'max:50']], ['trang_thai.in' => 'Trạng thái không hợp lệ.']);
        if ($validator->fails()) return $this->validationError($validator->errors());
        $data = $validator->validated(); $timKiem = trim((string) ($data['tim_kiem'] ?? ''));
        $paginator = DB::table('lien_he')->when($timKiem !== '', fn ($query) => $query->where(fn ($q) => $q->where('ho_ten', 'like', "%{$timKiem}%")->orWhere('email', 'like', "%{$timKiem}%")->orWhere('tieu_de', 'like', "%{$timKiem}%")))->when(isset($data['trang_thai']), fn ($query) => $query->where('trang_thai', $data['trang_thai']))->orderByDesc('created_at')->paginate($data['per_page'] ?? 10);
        return response()->json(['success' => true, 'message' => 'Lấy danh sách liên hệ thành công.', 'data' => $paginator->items(), 'pagination' => $this->pagination($paginator)], options: JSON_UNESCAPED_UNICODE);
    }

    #[OA\Get(path: '/api/admin/lien-he/{id}', summary: 'Lấy chi tiết liên hệ', tags: ['Quản trị - Liên hệ'], security: [['sanctum' => []]], parameters: [new OA\Parameter(name: 'id', in: 'path', required: true, schema: new OA\Schema(type: 'integer'))], responses: [new OA\Response(response: 200, description: 'Thành công'), new OA\Response(response: 404, description: 'Không tìm thấy liên hệ')])]
    public function show(int $id): JsonResponse
    { $item = DB::table('lien_he')->find($id); return $item ? response()->json(['success' => true, 'message' => 'Lấy chi tiết liên hệ thành công.', 'data' => $item], options: JSON_UNESCAPED_UNICODE) : $this->notFound(); }

    #[OA\Put(path: '/api/admin/lien-he/{id}/trang-thai', summary: 'Cập nhật trạng thái liên hệ', tags: ['Quản trị - Liên hệ'], security: [['sanctum' => []]], parameters: [new OA\Parameter(name: 'id', in: 'path', required: true, schema: new OA\Schema(type: 'integer'))], requestBody: new OA\RequestBody(required: true, content: new OA\JsonContent(required: ['trang_thai'], properties: [new OA\Property(property: 'trang_thai', type: 'string', enum: ['chua_xu_ly', 'da_xu_ly'])])), responses: [new OA\Response(response: 200, description: 'Thành công'), new OA\Response(response: 404, description: 'Không tìm thấy liên hệ'), new OA\Response(response: 422, description: 'Dữ liệu không hợp lệ')])]
    public function updateStatus(Request $request, int $id): JsonResponse
    {
        $validator = Validator::make($request->only('trang_thai'), ['trang_thai' => ['required', 'in:chua_xu_ly,da_xu_ly']], ['trang_thai.required' => 'Trạng thái là bắt buộc.', 'trang_thai.in' => 'Trạng thái không hợp lệ.']);
        if ($validator->fails()) return $this->validationError($validator->errors());
        if (!DB::table('lien_he')->where('id', $id)->exists()) return $this->notFound();
        DB::table('lien_he')->where('id', $id)->update(['trang_thai' => $validator->validated()['trang_thai'], 'updated_at' => now()]);
        return response()->json(['success' => true, 'message' => 'Cập nhật trạng thái liên hệ thành công.', 'data' => DB::table('lien_he')->find($id)], options: JSON_UNESCAPED_UNICODE);
    }

    private function pagination($paginator): array { return ['current_page' => $paginator->currentPage(), 'last_page' => $paginator->lastPage(), 'per_page' => $paginator->perPage(), 'total' => $paginator->total()]; }
    private function validationError($errors): JsonResponse { return response()->json(['success' => false, 'message' => 'Dữ liệu không hợp lệ.', 'errors' => $errors], 422, options: JSON_UNESCAPED_UNICODE); }
    private function notFound(): JsonResponse { return response()->json(['success' => false, 'message' => 'Không tìm thấy liên hệ.', 'data' => null], 404, options: JSON_UNESCAPED_UNICODE); }
}
