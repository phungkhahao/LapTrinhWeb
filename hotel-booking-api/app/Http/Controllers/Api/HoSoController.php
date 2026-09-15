<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\NguoiDung;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use OpenApi\Attributes as OA;

class HoSoController extends Controller
{
    #[OA\Get(path: '/api/ho-so', summary: 'Lấy hồ sơ cá nhân', tags: ['Tài khoản'], security: [['sanctum' => []]], responses: [new OA\Response(response: 200, description: 'Lấy hồ sơ thành công'), new OA\Response(response: 401, description: 'Chưa xác thực')])]
    public function show(Request $request): JsonResponse
    {
        return response()->json(['success' => true, 'message' => 'Lấy hồ sơ thành công.', 'data' => $this->duLieuNguoiDung($request->user())], options: JSON_UNESCAPED_UNICODE);
    }

    #[OA\Put(path: '/api/ho-so', summary: 'Cập nhật hồ sơ cá nhân', tags: ['Tài khoản'], security: [['sanctum' => []]], requestBody: new OA\RequestBody(required: true, content: new OA\JsonContent(required: ['ho_ten'], properties: [new OA\Property(property: 'ho_ten', type: 'string'), new OA\Property(property: 'so_dien_thoai', type: 'string', nullable: true)])), responses: [new OA\Response(response: 200, description: 'Cập nhật hồ sơ thành công'), new OA\Response(response: 422, description: 'Dữ liệu không hợp lệ')])]
    public function update(Request $request): JsonResponse
    {
        $validator = Validator::make($request->only(['ho_ten', 'so_dien_thoai']), [
            'ho_ten' => ['required', 'string', 'max:255'],
            'so_dien_thoai' => ['nullable', 'string', 'max:30'],
        ], [
            'ho_ten.required' => 'Họ và tên là bắt buộc.',
            'ho_ten.string' => 'Họ và tên không hợp lệ.',
            'ho_ten.max' => 'Họ và tên không được vượt quá 255 ký tự.',
            'so_dien_thoai.string' => 'Số điện thoại không hợp lệ.',
            'so_dien_thoai.max' => 'Số điện thoại không được vượt quá 30 ký tự.',
        ]);

        if ($validator->fails()) return $this->loiValidation($validator->errors());

        $request->user()->update($validator->validated());

        return response()->json(['success' => true, 'message' => 'Cập nhật hồ sơ thành công.', 'data' => $this->duLieuNguoiDung($request->user()->fresh())], options: JSON_UNESCAPED_UNICODE);
    }

    #[OA\Put(path: '/api/ho-so/doi-mat-khau', summary: 'Đổi mật khẩu', tags: ['Tài khoản'], security: [['sanctum' => []]], requestBody: new OA\RequestBody(required: true, content: new OA\JsonContent(required: ['mat_khau_hien_tai', 'mat_khau_moi', 'xac_nhan_mat_khau_moi'], properties: [new OA\Property(property: 'mat_khau_hien_tai', type: 'string', format: 'password'), new OA\Property(property: 'mat_khau_moi', type: 'string', format: 'password'), new OA\Property(property: 'xac_nhan_mat_khau_moi', type: 'string', format: 'password')])), responses: [new OA\Response(response: 200, description: 'Đổi mật khẩu thành công'), new OA\Response(response: 422, description: 'Dữ liệu không hợp lệ')])]
    public function doiMatKhau(Request $request): JsonResponse
    {
        $validator = Validator::make($request->only(['mat_khau_hien_tai', 'mat_khau_moi', 'xac_nhan_mat_khau_moi']), [
            'mat_khau_hien_tai' => ['required', 'string'],
            'mat_khau_moi' => ['required', 'string', 'min:8', 'different:mat_khau_hien_tai'],
            'xac_nhan_mat_khau_moi' => ['required', 'same:mat_khau_moi'],
        ], [
            'mat_khau_hien_tai.required' => 'Mật khẩu hiện tại là bắt buộc.',
            'mat_khau_moi.required' => 'Mật khẩu mới là bắt buộc.',
            'mat_khau_moi.min' => 'Mật khẩu mới phải có ít nhất 8 ký tự.',
            'mat_khau_moi.different' => 'Mật khẩu mới phải khác mật khẩu hiện tại.',
            'xac_nhan_mat_khau_moi.required' => 'Xác nhận mật khẩu mới là bắt buộc.',
            'xac_nhan_mat_khau_moi.same' => 'Xác nhận mật khẩu mới không khớp.',
        ]);

        if ($validator->fails()) return $this->loiValidation($validator->errors());
        if (!Hash::check($request->input('mat_khau_hien_tai'), $request->user()->mat_khau)) {
            return response()->json(['success' => false, 'message' => 'Mật khẩu hiện tại không chính xác.', 'errors' => ['mat_khau_hien_tai' => ['Mật khẩu hiện tại không chính xác.']]], 422, options: JSON_UNESCAPED_UNICODE);
        }

        $request->user()->update(['mat_khau' => Hash::make($request->input('mat_khau_moi'))]);

        return response()->json(['success' => true, 'message' => 'Đổi mật khẩu thành công.', 'data' => null], options: JSON_UNESCAPED_UNICODE);
    }

    private function duLieuNguoiDung(NguoiDung $nguoiDung): array
    {
        return $nguoiDung->only(['id', 'ho_ten', 'email', 'so_dien_thoai', 'vai_tro', 'trang_thai']);
    }

    private function loiValidation($errors): JsonResponse
    {
        return response()->json(['success' => false, 'message' => 'Dữ liệu không hợp lệ.', 'errors' => $errors], 422, options: JSON_UNESCAPED_UNICODE);
    }
}
