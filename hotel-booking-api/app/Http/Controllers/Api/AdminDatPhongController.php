<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use OpenApi\Attributes as OA;

class AdminDatPhongController extends Controller
{
    #[OA\Get(path: '/api/admin/dat-phong', summary: 'Lấy danh sách đặt phòng quản trị', tags: ['Quản trị - Đặt phòng'], security: [['sanctum' => []]], parameters: [new OA\Parameter(name: 'tim_kiem', in: 'query', schema: new OA\Schema(type: 'string')), new OA\Parameter(name: 'trang_thai', in: 'query', schema: new OA\Schema(type: 'string')), new OA\Parameter(name: 'trang_thai_thanh_toan', in: 'query', schema: new OA\Schema(type: 'string'))], responses: [new OA\Response(response: 200, description: 'Lấy danh sách đặt phòng thành công'), new OA\Response(response: 401, description: 'Chưa xác thực'), new OA\Response(response: 403, description: 'Không có quyền quản trị')])]
    public function index(Request $request): JsonResponse
    {
        $validator = Validator::make($request->query(), ['tim_kiem' => ['nullable', 'string', 'max:255'], 'trang_thai' => ['nullable', 'in:cho_xac_nhan,da_xac_nhan,da_huy'], 'trang_thai_thanh_toan' => ['nullable', 'in:chua_thanh_toan,da_thanh_toan']], ['trang_thai.in' => 'Trạng thái đặt phòng không hợp lệ.', 'trang_thai_thanh_toan.in' => 'Trạng thái thanh toán không hợp lệ.']);
        if ($validator->fails())
            return $this->loiValidation($validator->errors());
        $d = $validator->validated();
        $tuKhoa = trim((string) ($d['tim_kiem'] ?? ''));
        $data = $this->truyVan()->when($tuKhoa !== '', fn($q) => $q->where(fn($x) => $x->where('dp.ma_dat_phong', 'like', "%{$tuKhoa}%")->orWhere('dp.ten_khach_hang', 'like', "%{$tuKhoa}%")->orWhere('dp.email_khach_hang', 'like', "%{$tuKhoa}%")->orWhere('dp.so_dien_thoai', 'like', "%{$tuKhoa}%")))->when(isset($d['trang_thai']), fn($q) => $q->where('dp.trang_thai', $d['trang_thai']))->when(isset($d['trang_thai_thanh_toan']), fn($q) => $q->where('tt.trang_thai_thanh_toan', $d['trang_thai_thanh_toan']))->orderByDesc('dp.created_at')->get()->map(fn($row) => $this->dinhDang($row));
        return response()->json(['success' => true, 'message' => 'Lấy danh sách đặt phòng thành công.', 'data' => $data], options: JSON_UNESCAPED_UNICODE);
    }

    #[OA\Get(path: '/api/admin/dat-phong/{id}', summary: 'Lấy chi tiết đặt phòng quản trị', tags: ['Quản trị - Đặt phòng'], security: [['sanctum' => []]], parameters: [new OA\Parameter(name: 'id', in: 'path', required: true, schema: new OA\Schema(type: 'integer'))], responses: [new OA\Response(response: 200, description: 'Lấy chi tiết đặt phòng thành công'), new OA\Response(response: 404, description: 'Không tìm thấy đặt phòng')])]
    public function show(int $id): JsonResponse
    {
        $data = $this->lay($id);
        return $data ? response()->json(['success' => true, 'message' => 'Lấy chi tiết đặt phòng thành công.', 'data' => $data], options: JSON_UNESCAPED_UNICODE) : $this->khongTimThay();
    }

    #[OA\Put(path: '/api/admin/dat-phong/{id}/xac-nhan', summary: 'Xác nhận đặt phòng', tags: ['Quản trị - Đặt phòng'], security: [['sanctum' => []]], parameters: [new OA\Parameter(name: 'id', in: 'path', required: true, schema: new OA\Schema(type: 'integer'))], responses: [new OA\Response(response: 200, description: 'Xác nhận đặt phòng thành công'), new OA\Response(response: 404, description: 'Không tìm thấy đặt phòng'), new OA\Response(response: 422, description: 'Không thể xác nhận')])]
    public function xacNhan(int $id): JsonResponse
    {
        return $this->chuyenTrangThai($id, 'da_xac_nhan', 'Xác nhận đặt phòng thành công.', 'Đặt phòng này không thể xác nhận.', onlyPending: true);
    }

    #[OA\Put(path: '/api/admin/dat-phong/{id}/huy', summary: 'Hủy đặt phòng', tags: ['Quản trị - Đặt phòng'], security: [['sanctum' => []]], parameters: [new OA\Parameter(name: 'id', in: 'path', required: true, schema: new OA\Schema(type: 'integer'))], responses: [new OA\Response(response: 200, description: 'Hủy đặt phòng thành công'), new OA\Response(response: 404, description: 'Không tìm thấy đặt phòng'), new OA\Response(response: 422, description: 'Đặt phòng đã hủy')])]
    public function huy(int $id): JsonResponse
    {
        return $this->chuyenTrangThai($id, 'da_huy', 'Hủy đặt phòng thành công.', 'Đặt phòng này đã được hủy.');
    }

    #[OA\Put(path: '/api/admin/dat-phong/{id}/xac-nhan-thanh-toan', summary: 'Xác nhận thanh toán tại khách sạn', tags: ['Quản trị - Đặt phòng'], security: [['sanctum' => []]], parameters: [new OA\Parameter(name: 'id', in: 'path', required: true, schema: new OA\Schema(type: 'integer'))], responses: [new OA\Response(response: 200, description: 'Xác nhận thanh toán thành công'), new OA\Response(response: 404, description: 'Không tìm thấy đặt phòng'), new OA\Response(response: 422, description: 'Không thể xác nhận thanh toán')])]
    public function xacNhanThanhToan(int $id): JsonResponse
    {
        $kq = DB::transaction(function () use ($id) {
            $dp = DB::table('dat_phong')->where('id', $id)->lockForUpdate()->first(['id', 'trang_thai']);
            if (!$dp)
                return 'khong_tim_thay';
            if ($dp->trang_thai === 'da_huy')
                return 'da_huy';
            $tt = DB::table('thanh_toan')->where('dat_phong_id', $id)->lockForUpdate()->first(['id', 'phuong_thuc_thanh_toan', 'trang_thai_thanh_toan']);
            if (!$tt || $tt->phuong_thuc_thanh_toan !== 'tai_khach_san')
                return 'khong_hop_le';
            if ($tt->trang_thai_thanh_toan === 'da_thanh_toan')
                return 'da_thanh_toan';
            DB::table('thanh_toan')->where('id', $tt->id)->update(['trang_thai_thanh_toan' => 'da_thanh_toan', 'thoi_gian_thanh_toan' => now(), 'updated_at' => now()]);
            return 'thanh_cong'; });
        return match ($kq) { 'khong_tim_thay' => $this->khongTimThay(), 'da_huy' => $this->loiNghiepVu('Không thể xác nhận thanh toán cho đặt phòng đã hủy.'), 'da_thanh_toan' => $this->loiNghiepVu('Đặt phòng này đã được thanh toán.'), 'khong_hop_le' => $this->loiNghiepVu('Chỉ có thể xác nhận thanh toán tại khách sạn.'), default => response()->json(['success' => true, 'message' => 'Xác nhận thanh toán thành công.', 'data' => $this->lay($id)], options: JSON_UNESCAPED_UNICODE)};
    }

    private function chuyenTrangThai(int $id, string $moi, string $thanhCong, string $daDung, bool $onlyPending = false): JsonResponse
    {
        $kq = DB::transaction(function () use ($id, $moi, $onlyPending) {
            $dp = DB::table('dat_phong')->where('id', $id)->lockForUpdate()->first(['id', 'trang_thai']);
            if (!$dp)
                return 'khong_tim_thay';
            if ($dp->trang_thai === 'da_huy')
                return 'da_huy';
            if ($onlyPending && $dp->trang_thai !== 'cho_xac_nhan')
                return 'khong_the';
            DB::table('dat_phong')->where('id', $id)->update(['trang_thai' => $moi, 'updated_at' => now()]);
            return 'thanh_cong'; });
        return match ($kq) { 'khong_tim_thay' => $this->khongTimThay(), 'da_huy' => $this->loiNghiepVu($daDung), 'khong_the' => $this->loiNghiepVu($daDung), default => response()->json(['success' => true, 'message' => $thanhCong, 'data' => $this->lay($id)], options: JSON_UNESCAPED_UNICODE)};
    }

    private function truyVan()
    {
        return DB::table('dat_phong as dp')->leftJoin('phong as p', 'p.id', '=', 'dp.phong_id')->leftJoin('thanh_toan as tt', 'tt.dat_phong_id', '=', 'dp.id')->select(['dp.id', 'dp.ma_dat_phong', 'dp.nguoi_dung_id', 'dp.ten_khach_hang', 'dp.email_khach_hang', 'dp.so_dien_thoai', 'dp.ngay_nhan_phong', 'dp.ngay_tra_phong', DB::raw('DATEDIFF(dp.ngay_tra_phong, dp.ngay_nhan_phong) as so_dem'), 'dp.so_luong_khach', 'dp.tong_tien', 'dp.ghi_chu', 'dp.trang_thai', 'dp.created_at', 'p.id as phong_id', 'p.so_phong', 'p.ten_phong', 'p.hinh_anh', 'p.gia_phong', 'tt.id as thanh_toan_id', 'tt.phuong_thuc_thanh_toan', 'tt.trang_thai_thanh_toan', 'tt.so_tien as so_tien_thanh_toan', 'tt.ma_giao_dich', 'tt.thoi_gian_thanh_toan']);
    }
    private function lay(int $id): ?object
    {
        $row = $this->truyVan()->where('dp.id', $id)->first();
        return $row ? $this->dinhDang($row) : null;
    }
    private function dinhDang(object $row): object
    {
        $row->tong_tien = (float) $row->tong_tien;
        $row->gia_phong = (int) $row->gia_phong;
        $row->so_luong_khach = (int) $row->so_luong_khach;
        $row->so_dem = (int) $row->so_dem;
        if ($row->hinh_anh && str_starts_with($row->hinh_anh, 'phong/'))
            $row->hinh_anh = Storage::disk('public')->url($row->hinh_anh);
        return $row;
    }
    private function loiValidation($errors): JsonResponse
    {
        return response()->json(['success' => false, 'message' => 'Dữ liệu không hợp lệ.', 'errors' => $errors], 422, options: JSON_UNESCAPED_UNICODE);
    }
    private function loiNghiepVu(string $message): JsonResponse
    {
        return response()->json(['success' => false, 'message' => $message, 'data' => null], 422, options: JSON_UNESCAPED_UNICODE);
    }
    private function khongTimThay(): JsonResponse
    {
        return response()->json(['success' => false, 'message' => 'Không tìm thấy đặt phòng.', 'data' => null], 404, options: JSON_UNESCAPED_UNICODE);
    }
}
