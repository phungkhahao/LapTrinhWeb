<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use OpenApi\Attributes as OA;

class AdminPhongController extends Controller
{
    #[OA\Get(path: '/api/admin/phong', summary: 'Lấy danh sách phòng quản trị', tags: ['Quản trị - Phòng'], security: [['sanctum' => []]], parameters: [new OA\Parameter(name: 'tim_kiem', in: 'query', schema: new OA\Schema(type: 'string'))], responses: [new OA\Response(response: 200, description: 'Lấy danh sách phòng thành công'), new OA\Response(response: 401, description: 'Chưa xác thực'), new OA\Response(response: 403, description: 'Không có quyền quản trị')])]
    public function index(Request $request): JsonResponse
    {
        $validator = Validator::make($request->query(), ['tim_kiem' => ['nullable', 'string', 'max:255']], ['tim_kiem.string' => 'Từ khóa tìm kiếm không hợp lệ.', 'tim_kiem.max' => 'Từ khóa tìm kiếm không được vượt quá 255 ký tự.']);
        if ($validator->fails())
            return $this->phanHoiLoiValidation($validator->errors());
        $timKiem = trim((string) ($validator->validated()['tim_kiem'] ?? ''));
        $phongs = DB::table('phong as p')->leftJoin('loai_phong as lp', 'lp.id', '=', 'p.loai_phong_id')->select($this->cotPhong())
            ->when($timKiem !== '', fn($query) => $query->where(fn($q) => $q->where('p.so_phong', 'like', "%{$timKiem}%")->orWhere('p.ten_phong', 'like', "%{$timKiem}%")))
            ->orderByDesc('p.created_at')->get()->map(fn($phong) => $this->dinhDangPhong($phong));
        return response()->json(['success' => true, 'message' => 'Lấy danh sách phòng thành công', 'data' => $phongs], options: JSON_UNESCAPED_UNICODE);
    }

    #[OA\Post(path: '/api/admin/phong', summary: 'Thêm phòng kèm ảnh', tags: ['Quản trị - Phòng'], security: [['sanctum' => []]], requestBody: new OA\RequestBody(required: true, content: new OA\MediaType(mediaType: 'multipart/form-data', schema: new OA\Schema(required: ['so_phong', 'loai_phong_id', 'gia_phong', 'so_nguoi_toi_da'], properties: [new OA\Property(property: 'so_phong', type: 'string'), new OA\Property(property: 'loai_phong_id', type: 'integer'), new OA\Property(property: 'ten_phong', type: 'string', nullable: true), new OA\Property(property: 'gia_phong', type: 'number'), new OA\Property(property: 'so_nguoi_toi_da', type: 'integer'), new OA\Property(property: 'mo_ta', type: 'string', nullable: true), new OA\Property(property: 'hinh_anh', type: 'string', format: 'binary', nullable: true)]))), responses: [new OA\Response(response: 201, description: 'Thêm phòng thành công'), new OA\Response(response: 422, description: 'Dữ liệu không hợp lệ')])]
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), $this->quyTacPhong(), $this->thongDiepValidation());
        if ($validator->fails())
            return $this->phanHoiLoiValidation($validator->errors());
        $duLieu = $validator->validated();
        $duLieu['hinh_anh'] = $request->hasFile('hinh_anh') ? $request->file('hinh_anh')->store('phong', 'public') : null;
        $id = DB::table('phong')->insertGetId([...$duLieu, 'trang_thai' => 'trong', 'created_at' => now(), 'updated_at' => now()]);
        return response()->json(['success' => true, 'message' => 'Thêm phòng thành công', 'data' => $this->layPhong($id)], 201, options: JSON_UNESCAPED_UNICODE);
    }

    #[OA\Get(path: '/api/admin/phong/{id}', summary: 'Lấy chi tiết phòng quản trị', tags: ['Quản trị - Phòng'], security: [['sanctum' => []]], parameters: [new OA\Parameter(name: 'id', in: 'path', required: true, schema: new OA\Schema(type: 'integer'))], responses: [new OA\Response(response: 200, description: 'Lấy chi tiết phòng thành công'), new OA\Response(response: 404, description: 'Không tìm thấy phòng')])]
    public function show(int $id): JsonResponse
    {
        $phong = $this->layPhong($id);
        return $phong ? response()->json(['success' => true, 'message' => 'Lấy chi tiết phòng thành công', 'data' => $phong], options: JSON_UNESCAPED_UNICODE) : $this->phanHoiKhongTimThay();
    }

    #[OA\Put(path: '/api/admin/phong/{id}', summary: 'Cập nhật phòng kèm ảnh', tags: ['Quản trị - Phòng'], security: [['sanctum' => []]], parameters: [new OA\Parameter(name: 'id', in: 'path', required: true, schema: new OA\Schema(type: 'integer'))], requestBody: new OA\RequestBody(required: true, content: new OA\MediaType(mediaType: 'multipart/form-data', schema: new OA\Schema(properties: [new OA\Property(property: 'so_phong', type: 'string'), new OA\Property(property: 'loai_phong_id', type: 'integer'), new OA\Property(property: 'ten_phong', type: 'string', nullable: true), new OA\Property(property: 'gia_phong', type: 'number'), new OA\Property(property: 'so_nguoi_toi_da', type: 'integer'), new OA\Property(property: 'mo_ta', type: 'string', nullable: true), new OA\Property(property: 'hinh_anh', type: 'string', format: 'binary', nullable: true)]))), responses: [new OA\Response(response: 200, description: 'Cập nhật phòng thành công'), new OA\Response(response: 404, description: 'Không tìm thấy phòng'), new OA\Response(response: 422, description: 'Dữ liệu không hợp lệ')])]
    public function update(Request $request, int $id): JsonResponse
    {
        $phongCu = $this->layPhong($id, false);
        if ($phongCu === null)
            return $this->phanHoiKhongTimThay();
        $validator = Validator::make($request->all(), $this->quyTacPhong($id, true), $this->thongDiepValidation());
        if ($validator->fails())
            return $this->phanHoiLoiValidation($validator->errors());
        $duLieu = $validator->validated();
        if ($request->hasFile('hinh_anh')) {
            $duLieu['hinh_anh'] = $request->file('hinh_anh')->store('phong', 'public');
            if (is_string($phongCu->hinh_anh) && str_starts_with($phongCu->hinh_anh, 'phong/'))
                Storage::disk('public')->delete($phongCu->hinh_anh);
        }
        DB::table('phong')->where('id', $id)->update([...$duLieu, 'updated_at' => now()]);
        return response()->json(['success' => true, 'message' => 'Cập nhật phòng thành công', 'data' => $this->layPhong($id)], options: JSON_UNESCAPED_UNICODE);
    }

    #[OA\Put(path: '/api/admin/phong/{id}/ngung-hoat-dong', summary: 'Ngừng sử dụng phòng', tags: ['Quản trị - Phòng'], security: [['sanctum' => []]], parameters: [new OA\Parameter(name: 'id', in: 'path', required: true, schema: new OA\Schema(type: 'integer'))], responses: [new OA\Response(response: 200, description: 'Đã ngừng sử dụng phòng'), new OA\Response(response: 404, description: 'Không tìm thấy phòng'), new OA\Response(response: 422, description: 'Phòng đã ngừng hoạt động')])]
    public function ngungHoatDong(int $id): JsonResponse
    {
        return $this->capNhatTrangThai($id, 'ngung_hoat_dong', 'Đã ngừng sử dụng phòng.', 'Phòng đã ngừng hoạt động.');
    }

    #[OA\Put(path: '/api/admin/phong/{id}/kich-hoat', summary: 'Kích hoạt lại phòng', tags: ['Quản trị - Phòng'], security: [['sanctum' => []]], parameters: [new OA\Parameter(name: 'id', in: 'path', required: true, schema: new OA\Schema(type: 'integer'))], responses: [new OA\Response(response: 200, description: 'Đã kích hoạt lại phòng'), new OA\Response(response: 404, description: 'Không tìm thấy phòng'), new OA\Response(response: 422, description: 'Phòng đang hoạt động')])]
    public function kichHoat(int $id): JsonResponse
    {
        return $this->capNhatTrangThai($id, 'trong', 'Đã kích hoạt lại phòng.', 'Phòng đang hoạt động.');
    }

    private function capNhatTrangThai(int $id, string $trangThaiMoi, string $thanhCong, string $daDung): JsonResponse
    {
        $phong = $this->layPhong($id, false);
        if ($phong === null)
            return $this->phanHoiKhongTimThay();
        if ($phong->trang_thai === $trangThaiMoi)
            return response()->json(['success' => false, 'message' => $daDung, 'data' => null], 422, options: JSON_UNESCAPED_UNICODE);
        if ($trangThaiMoi === 'ngung_hoat_dong' && $this->coDatPhongHieuLuc($id)) {
            return response()->json(['success' => false, 'message' => 'Không thể ngừng sử dụng phòng đang có khách hoặc có đặt phòng tương lai còn hiệu lực.', 'data' => null], 422, options: JSON_UNESCAPED_UNICODE);
        }
        DB::table('phong')->where('id', $id)->update(['trang_thai' => $trangThaiMoi, 'updated_at' => now()]);
        return response()->json(['success' => true, 'message' => $thanhCong, 'data' => $this->layPhong($id)], options: JSON_UNESCAPED_UNICODE);
    }

    private function coDatPhongHieuLuc(int $phongId): bool
    {
        return DB::table('dat_phong')
            ->where('phong_id', $phongId)
            ->where('trang_thai', '!=', 'da_huy')
            ->whereDate('ngay_tra_phong', '>', today())
            ->exists();
    }

    private function cotPhong(): array
    {
        return ['p.id', 'p.so_phong', 'p.loai_phong_id', 'lp.ten_loai', 'p.ten_phong', 'p.gia_phong', 'p.so_nguoi_toi_da', 'p.mo_ta', 'p.hinh_anh', 'p.trang_thai', 'p.created_at', 'p.updated_at', DB::raw("CASE WHEN EXISTS (SELECT 1 FROM dat_phong AS dp WHERE dp.phong_id = p.id AND dp.trang_thai != 'da_huy' AND dp.ngay_nhan_phong <= CURDATE() AND dp.ngay_tra_phong > CURDATE()) THEN 'dang_co_khach' ELSE 'dang_trong' END AS tinh_trang_luu_tru")];
    }
    private function layPhong(int $id, bool $dinhDang = true): ?object
    {
        $phong = DB::table('phong as p')->leftJoin('loai_phong as lp', 'lp.id', '=', 'p.loai_phong_id')->where('p.id', $id)->select($this->cotPhong())->first();
        return $phong && $dinhDang ? $this->dinhDangPhong($phong) : $phong;
    }
    private function dinhDangPhong(object $phong): object
    {
        $phong->gia_phong = (int) $phong->gia_phong;
        if ($phong->hinh_anh && str_starts_with($phong->hinh_anh, 'phong/'))
            $phong->hinh_anh = Storage::disk('public')->url($phong->hinh_anh);
        return $phong;
    }
    private function quyTacPhong(?int $id = null, bool $capNhat = false): array
    {
        $tienTo = $capNhat ? 'sometimes' : 'required';
        return ['so_phong' => [$tienTo, 'string', 'max:255', Rule::unique('phong', 'so_phong')->ignore($id)], 'loai_phong_id' => [$tienTo, 'integer', Rule::exists('loai_phong', 'id')], 'ten_phong' => [$capNhat ? 'sometimes' : 'nullable', 'nullable', 'string', 'max:255'], 'gia_phong' => [$tienTo, 'integer', 'min:0'], 'so_nguoi_toi_da' => [$tienTo, 'integer', 'min:1'], 'mo_ta' => [$capNhat ? 'sometimes' : 'nullable', 'nullable', 'string'], 'hinh_anh' => [$capNhat ? 'sometimes' : 'nullable', 'nullable', 'image', 'mimes:jpeg,jpg,png,webp', 'max:2048']];
    }
    private function thongDiepValidation(): array
    {
        return ['so_phong.required' => 'Số phòng là bắt buộc.', 'so_phong.unique' => 'Số phòng đã tồn tại.', 'loai_phong_id.required' => 'Loại phòng là bắt buộc.', 'loai_phong_id.exists' => 'Loại phòng không tồn tại.', 'gia_phong.required' => 'Giá phòng là bắt buộc.', 'gia_phong.integer' => 'Giá phòng phải là số nguyên.', 'gia_phong.min' => 'Giá phòng không được nhỏ hơn 0.', 'so_nguoi_toi_da.required' => 'Sức chứa tối đa là bắt buộc.', 'so_nguoi_toi_da.integer' => 'Sức chứa tối đa phải là số nguyên.', 'so_nguoi_toi_da.min' => 'Sức chứa tối đa phải ít nhất là 1.', 'hinh_anh.image' => 'Hình ảnh phải là tệp ảnh.', 'hinh_anh.mimes' => 'Hình ảnh chỉ hỗ trợ JPEG, JPG, PNG hoặc WEBP.', 'hinh_anh.max' => 'Hình ảnh không được vượt quá 2MB.'];
    }
    private function phanHoiLoiValidation($errors): JsonResponse
    {
        return response()->json(['success' => false, 'message' => 'Dữ liệu không hợp lệ', 'errors' => $errors], 422, options: JSON_UNESCAPED_UNICODE);
    }
    private function phanHoiKhongTimThay(): JsonResponse
    {
        return response()->json(['success' => false, 'message' => 'Không tìm thấy phòng.', 'data' => null], 404, options: JSON_UNESCAPED_UNICODE);
    }
}
