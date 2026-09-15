<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\NguoiDung;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use OpenApi\Attributes as OA;

class AdminQuanTriVienController extends Controller
{
    #[OA\Get(path: '/api/admin/quan-tri-vien', summary: 'Lấy danh sách quản trị viên', tags: ['Quản trị - Quản trị viên'], security: [['sanctum' => []]], responses: [new OA\Response(response: 200, description: 'Thành công'), new OA\Response(response: 401, description: 'Chưa xác thực'), new OA\Response(response: 403, description: 'Không có quyền')])]
    public function index(Request $request): JsonResponse
    {
        $v = Validator::make($request->query(), ['tim_kiem' => ['nullable', 'string', 'max:255'], 'page' => ['nullable', 'integer', 'min:1']]);
        if ($v->fails()) return $this->validationError($v->errors());
        $q = trim((string) ($v->validated()['tim_kiem'] ?? ''));
        $p = NguoiDung::query()->where('vai_tro', 'admin')->select(['id', 'ho_ten', 'email', 'so_dien_thoai', 'vai_tro', 'trang_thai', 'created_at'])->when($q !== '', fn ($query) => $query->where(fn ($x) => $x->where('ho_ten', 'like', "%{$q}%")->orWhere('email', 'like', "%{$q}%")->orWhere('so_dien_thoai', 'like', "%{$q}%")))->orderByDesc('created_at')->paginate(10);
        return response()->json(['success' => true, 'message' => 'Lấy danh sách quản trị viên thành công.', 'data' => $p->items(), 'pagination' => $this->pagination($p)], options: JSON_UNESCAPED_UNICODE);
    }

    #[OA\Post(path: '/api/admin/quan-tri-vien', summary: 'Thêm quản trị viên', tags: ['Quản trị - Quản trị viên'], security: [['sanctum' => []]], responses: [new OA\Response(response: 201, description: 'Thêm thành công'), new OA\Response(response: 422, description: 'Dữ liệu không hợp lệ')])]
    public function store(Request $request): JsonResponse
    {
        $v = Validator::make($request->only(['ho_ten', 'email', 'so_dien_thoai', 'mat_khau']), $this->rules(), $this->messages());
        if ($v->fails()) return $this->validationError($v->errors());
        $d = $v->validated(); $u = NguoiDung::create(['ho_ten' => $d['ho_ten'], 'email' => $d['email'], 'so_dien_thoai' => $d['so_dien_thoai'] ?? null, 'mat_khau' => Hash::make($d['mat_khau']), 'vai_tro' => 'admin', 'trang_thai' => 'hoat_dong']);
        return response()->json(['success' => true, 'message' => 'Thêm quản trị viên thành công.', 'data' => $this->data($u)], 201, options: JSON_UNESCAPED_UNICODE);
    }

    #[OA\Put(path: '/api/admin/quan-tri-vien/{id}', summary: 'Cập nhật quản trị viên', tags: ['Quản trị - Quản trị viên'], security: [['sanctum' => []]], responses: [new OA\Response(response: 200, description: 'Cập nhật thành công'), new OA\Response(response: 404, description: 'Không tìm thấy'), new OA\Response(response: 422, description: 'Dữ liệu không hợp lệ')])]
    public function update(Request $request, int $id): JsonResponse
    {
        $u = NguoiDung::query()->where('id', $id)->where('vai_tro', 'admin')->first();
        if (!$u) return response()->json(['success' => false, 'message' => 'Không tìm thấy quản trị viên.', 'data' => null], 404, options: JSON_UNESCAPED_UNICODE);
        $v = Validator::make($request->only(['ho_ten', 'email', 'so_dien_thoai', 'mat_khau']), $this->rules($id, true), $this->messages());
        if ($v->fails()) return $this->validationError($v->errors());
        $d = $v->validated(); if (empty($d['mat_khau'])) unset($d['mat_khau']); else $d['mat_khau'] = Hash::make($d['mat_khau']); $u->update($d);
        return response()->json(['success' => true, 'message' => 'Cập nhật quản trị viên thành công.', 'data' => $this->data($u->fresh())], options: JSON_UNESCAPED_UNICODE);
    }

    private function rules(?int $id = null, bool $update = false): array { return ['ho_ten' => [$update ? 'sometimes' : 'required', 'string', 'max:255'], 'email' => [$update ? 'sometimes' : 'required', 'email', 'max:255', Rule::unique('nguoi_dung', 'email')->ignore($id)], 'so_dien_thoai' => ['nullable', 'string', 'max:30'], 'mat_khau' => [$update ? 'nullable' : 'required', 'string', 'min:8']]; }
    private function messages(): array { return ['ho_ten.required' => 'Họ và tên là bắt buộc.', 'email.required' => 'Email là bắt buộc.', 'email.email' => 'Email không đúng định dạng.', 'email.unique' => 'Email đã được sử dụng.', 'mat_khau.required' => 'Mật khẩu là bắt buộc.', 'mat_khau.min' => 'Mật khẩu phải có ít nhất 8 ký tự.']; }
    private function data(NguoiDung $u): array { return $u->only(['id', 'ho_ten', 'email', 'so_dien_thoai', 'vai_tro', 'trang_thai', 'created_at']); }
    private function pagination($p): array { return ['current_page' => $p->currentPage(), 'last_page' => $p->lastPage(), 'per_page' => $p->perPage(), 'total' => $p->total()]; }
    private function validationError($errors): JsonResponse { return response()->json(['success' => false, 'message' => 'Dữ liệu không hợp lệ.', 'errors' => $errors], 422, options: JSON_UNESCAPED_UNICODE); }
}
