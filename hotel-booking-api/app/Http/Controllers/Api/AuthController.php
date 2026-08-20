<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\NguoiDung;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use OpenApi\Attributes as OA;

class AuthController extends Controller
{
    #[OA\Post(path: '/api/auth/dang-ky', summary: 'Đăng ký tài khoản', description: 'Đăng ký tài khoản khách hàng mới và trả về Sanctum token khi đăng ký thành công.', tags: ['Xác thực'], responses: [new OA\Response(response: 201, description: 'Đăng ký tài khoản thành công'), new OA\Response(response: 422, description: 'Dữ liệu không hợp lệ')])]
    public function dangKy(Request $request): JsonResponse
    {
        $v = Validator::make($request->all(), ['ho_ten' => ['required', 'string'], 'email' => ['required', 'email', 'unique:nguoi_dung,email'], 'so_dien_thoai' => ['required', 'string'], 'mat_khau' => ['required', 'string', 'min:8'], 'xac_nhan_mat_khau' => ['required', 'same:mat_khau']], ['ho_ten.required' => 'Họ và tên là bắt buộc.', 'email.required' => 'Email là bắt buộc.', 'email.email' => 'Email không đúng định dạng.', 'email.unique' => 'Email đã được sử dụng.', 'so_dien_thoai.required' => 'Số điện thoại là bắt buộc.', 'mat_khau.required' => 'Mật khẩu là bắt buộc.', 'mat_khau.min' => 'Mật khẩu phải có ít nhất 8 ký tự.', 'xac_nhan_mat_khau.required' => 'Xác nhận mật khẩu là bắt buộc.', 'xac_nhan_mat_khau.same' => 'Xác nhận mật khẩu không khớp.']);
        if ($v->fails())
            return response()->json(['success' => false, 'message' => 'Dữ liệu không hợp lệ', 'errors' => $v->errors()], 422, options: JSON_UNESCAPED_UNICODE);
        $d = $v->validated();
        $u = NguoiDung::create(['ho_ten' => $d['ho_ten'], 'email' => $d['email'], 'so_dien_thoai' => $d['so_dien_thoai'], 'mat_khau' => Hash::make($d['mat_khau']), 'vai_tro' => 'khach_hang', 'trang_thai' => 'hoat_dong']);
        return response()->json(['success' => true, 'message' => 'Đăng ký tài khoản thành công', 'data' => ['token' => $u->createToken('hotel-booking-web')->plainTextToken, 'nguoi_dung' => $this->duLieuNguoiDung($u)]], 201, options: JSON_UNESCAPED_UNICODE);
    }
    #[OA\Post(path: '/api/auth/dang-nhap', summary: 'Đăng nhập', tags: ['Xác thực'], responses: [new OA\Response(response: 200, description: 'Đăng nhập thành công'), new OA\Response(response: 401, description: 'Email hoặc mật khẩu không chính xác.'), new OA\Response(response: 422, description: 'Dữ liệu không hợp lệ')])]
    public function dangNhap(Request $request): JsonResponse
    {
        $v = Validator::make($request->all(), ['email' => ['required', 'email'], 'mat_khau' => ['required']], ['email.required' => 'Email là bắt buộc.', 'email.email' => 'Email không đúng định dạng.', 'mat_khau.required' => 'Mật khẩu là bắt buộc.']);
        if ($v->fails())
            return response()->json(['success' => false, 'message' => 'Dữ liệu không hợp lệ', 'errors' => $v->errors()], 422, options: JSON_UNESCAPED_UNICODE);
        $u = NguoiDung::where('email', $request->input('email'))->first();
        if (!$u || !Hash::check($request->input('mat_khau'), $u->mat_khau))
            return response()->json(['success' => false, 'message' => 'Email hoặc mật khẩu không chính xác.', 'data' => null], 401, options: JSON_UNESCAPED_UNICODE);
        if ($u->trang_thai !== 'hoat_dong')
            return response()->json(['success' => false, 'message' => 'Tài khoản hiện không thể đăng nhập.', 'data' => null], 403, options: JSON_UNESCAPED_UNICODE);
        return response()->json(['success' => true, 'message' => 'Đăng nhập thành công', 'data' => ['token' => $u->createToken('hotel-booking-web')->plainTextToken, 'nguoi_dung' => $this->duLieuNguoiDung($u)]], options: JSON_UNESCAPED_UNICODE);
    }
    #[OA\Get(path: '/api/auth/thong-tin', summary: 'Lấy thông tin tài khoản', tags: ['Xác thực'], security: [['sanctum' => []]], responses: [new OA\Response(response: 200, description: 'Lấy thông tin tài khoản thành công'), new OA\Response(response: 401, description: 'Chưa xác thực')])]
    public function thongTin(Request $request): JsonResponse
    {
        return response()->json(['success' => true, 'message' => 'Lấy thông tin tài khoản thành công', 'data' => $this->duLieuNguoiDung($request->user())], options: JSON_UNESCAPED_UNICODE);
    }
    #[OA\Post(path: '/api/auth/dang-xuat', summary: 'Đăng xuất', tags: ['Xác thực'], security: [['sanctum' => []]], responses: [new OA\Response(response: 200, description: 'Đăng xuất thành công'), new OA\Response(response: 401, description: 'Chưa xác thực')])]
    public function dangXuat(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()?->delete();
        return response()->json(['success' => true, 'message' => 'Đăng xuất thành công'], options: JSON_UNESCAPED_UNICODE);
    }
    private function duLieuNguoiDung(NguoiDung $u): array
    {
        return $u->only(['id', 'ho_ten', 'email', 'so_dien_thoai', 'vai_tro']);
    }
}
