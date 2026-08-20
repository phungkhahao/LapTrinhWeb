<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use OpenApi\Attributes as OA;

class AdminLoaiPhongController extends Controller
{
    #[OA\Get(path: '/api/admin/loai-phong', summary: 'Lấy danh sách loại phòng quản trị', tags: ['Quản trị - Loại phòng'], security: [['sanctum' => []]], parameters: [new OA\Parameter(name: 'tim_kiem', in: 'query', schema: new OA\Schema(type: 'string'))], responses: [new OA\Response(response: 200, description: 'Lấy danh sách loại phòng thành công'), new OA\Response(response: 401, description: 'Chưa xác thực'), new OA\Response(response: 403, description: 'Không có quyền quản trị')])]
    public function index(Request $request): JsonResponse
    {
        $validator = Validator::make($request->query(), ['tim_kiem' => ['nullable', 'string', 'max:255']], ['tim_kiem.string' => 'Từ khóa tìm kiếm không hợp lệ.', 'tim_kiem.max' => 'Từ khóa tìm kiếm không được vượt quá 255 ký tự.']);
        if ($validator->fails())
            return $this->loiValidation($validator->errors());
        $timKiem = trim((string) ($validator->validated()['tim_kiem'] ?? ''));
        $data = DB::table('loai_phong')->select($this->cot())->when($timKiem !== '', fn($query) => $query->where('ten_loai', 'like', "%{$timKiem}%"))->orderByDesc('created_at')->get()->map(fn($loai) => $this->dinhDang($loai));
        return response()->json(['success' => true, 'message' => 'Lấy danh sách loại phòng thành công.', 'data' => $data], options: JSON_UNESCAPED_UNICODE);
    }

    #[OA\Post(path: '/api/admin/loai-phong', summary: 'Thêm loại phòng', tags: ['Quản trị - Loại phòng'], security: [['sanctum' => []]], requestBody: new OA\RequestBody(required: true, content: new OA\JsonContent(required: ['ten_loai', 'gia_co_ban', 'so_nguoi_toi_da'], properties: [new OA\Property(property: 'ten_loai', type: 'string'), new OA\Property(property: 'mo_ta', type: 'string', nullable: true), new OA\Property(property: 'gia_co_ban', type: 'number'), new OA\Property(property: 'so_nguoi_toi_da', type: 'integer')])), responses: [new OA\Response(response: 201, description: 'Thêm loại phòng thành công'), new OA\Response(response: 422, description: 'Dữ liệu không hợp lệ')])]
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), $this->quyTac(), $this->thongDiep());
        if ($validator->fails())
            return $this->loiValidation($validator->errors());
        $id = DB::table('loai_phong')->insertGetId([...$validator->validated(), 'trang_thai' => 'hoat_dong', 'created_at' => now(), 'updated_at' => now()]);
        return response()->json(['success' => true, 'message' => 'Thêm loại phòng thành công.', 'data' => $this->lay($id)], 201, options: JSON_UNESCAPED_UNICODE);
    }

    #[OA\Get(path: '/api/admin/loai-phong/{id}', summary: 'Lấy chi tiết loại phòng quản trị', tags: ['Quản trị - Loại phòng'], security: [['sanctum' => []]], parameters: [new OA\Parameter(name: 'id', in: 'path', required: true, schema: new OA\Schema(type: 'integer'))], responses: [new OA\Response(response: 200, description: 'Lấy chi tiết loại phòng thành công'), new OA\Response(response: 404, description: 'Không tìm thấy loại phòng')])]
    public function show(int $id): JsonResponse
    {
        $data = $this->lay($id);
        return $data ? response()->json(['success' => true, 'message' => 'Lấy chi tiết loại phòng thành công.', 'data' => $data], options: JSON_UNESCAPED_UNICODE) : $this->khongTimThay();
    }

    #[OA\Put(path: '/api/admin/loai-phong/{id}', summary: 'Cập nhật loại phòng', tags: ['Quản trị - Loại phòng'], security: [['sanctum' => []]], parameters: [new OA\Parameter(name: 'id', in: 'path', required: true, schema: new OA\Schema(type: 'integer'))], requestBody: new OA\RequestBody(required: true, content: new OA\JsonContent(properties: [new OA\Property(property: 'ten_loai', type: 'string'), new OA\Property(property: 'mo_ta', type: 'string', nullable: true), new OA\Property(property: 'gia_co_ban', type: 'number'), new OA\Property(property: 'so_nguoi_toi_da', type: 'integer')])), responses: [new OA\Response(response: 200, description: 'Cập nhật loại phòng thành công'), new OA\Response(response: 404, description: 'Không tìm thấy loại phòng'), new OA\Response(response: 422, description: 'Dữ liệu không hợp lệ')])]
    public function update(Request $request, int $id): JsonResponse
    {
        if ($this->lay($id) === null)
            return $this->khongTimThay();
        $validator = Validator::make($request->all(), $this->quyTac($id, true), $this->thongDiep());
        if ($validator->fails())
            return $this->loiValidation($validator->errors());
        DB::table('loai_phong')->where('id', $id)->update([...$validator->validated(), 'updated_at' => now()]);
        return response()->json(['success' => true, 'message' => 'Cập nhật loại phòng thành công.', 'data' => $this->lay($id)], options: JSON_UNESCAPED_UNICODE);
    }

    #[OA\Put(path: '/api/admin/loai-phong/{id}/ngung-hoat-dong', summary: 'Ngừng sử dụng loại phòng', tags: ['Quản trị - Loại phòng'], security: [['sanctum' => []]], parameters: [new OA\Parameter(name: 'id', in: 'path', required: true, schema: new OA\Schema(type: 'integer'))], responses: [new OA\Response(response: 200, description: 'Đã ngừng sử dụng loại phòng'), new OA\Response(response: 404, description: 'Không tìm thấy loại phòng'), new OA\Response(response: 422, description: 'Loại phòng đã ngừng hoạt động')])]
    public function ngungHoatDong(int $id): JsonResponse
    {
        return $this->capNhatTrangThai($id, 'ngung_hoat_dong', 'Đã ngừng sử dụng loại phòng.', 'Loại phòng đã ngừng hoạt động.');
    }

    #[OA\Put(path: '/api/admin/loai-phong/{id}/kich-hoat', summary: 'Kích hoạt lại loại phòng', tags: ['Quản trị - Loại phòng'], security: [['sanctum' => []]], parameters: [new OA\Parameter(name: 'id', in: 'path', required: true, schema: new OA\Schema(type: 'integer'))], responses: [new OA\Response(response: 200, description: 'Đã kích hoạt lại loại phòng'), new OA\Response(response: 404, description: 'Không tìm thấy loại phòng'), new OA\Response(response: 422, description: 'Loại phòng đang hoạt động')])]
    public function kichHoat(int $id): JsonResponse
    {
        return $this->capNhatTrangThai($id, 'hoat_dong', 'Đã kích hoạt lại loại phòng.', 'Loại phòng đang hoạt động.');
    }

    private function capNhatTrangThai(int $id, string $moi, string $thanhCong, string $daDung): JsonResponse
    {
        $loai = $this->lay($id);
        if ($loai === null)
            return $this->khongTimThay();
        if ($loai->trang_thai === $moi)
            return response()->json(['success' => false, 'message' => $daDung, 'data' => null], 422, options: JSON_UNESCAPED_UNICODE);
        if ($moi === 'ngung_hoat_dong' && $this->coPhongCoDatPhongHieuLuc($id))
            return response()->json(['success' => false, 'message' => 'Không thể ngừng sử dụng loại phòng vì vẫn có phòng đang có khách hoặc có đặt phòng tương lai còn hiệu lực.', 'data' => null], 422, options: JSON_UNESCAPED_UNICODE);
        DB::table('loai_phong')->where('id', $id)->update(['trang_thai' => $moi, 'updated_at' => now()]);
        return response()->json(['success' => true, 'message' => $thanhCong, 'data' => $this->lay($id)], options: JSON_UNESCAPED_UNICODE);
    }
    private function coPhongCoDatPhongHieuLuc(int $loaiPhongId): bool
    {
        return DB::table('dat_phong as dp')->join('phong as p', 'p.id', '=', 'dp.phong_id')->where('p.loai_phong_id', $loaiPhongId)->where('dp.trang_thai', '!=', 'da_huy')->whereDate('dp.ngay_tra_phong', '>', today())->exists();
    }
    private function cot(): array
    {
        return ['id', 'ten_loai', 'mo_ta', 'gia_co_ban', 'so_nguoi_toi_da', 'trang_thai', 'created_at', 'updated_at'];
    }
    private function lay(int $id): ?object
    {
        $data = DB::table('loai_phong')->select($this->cot())->where('id', $id)->first();
        return $data ? $this->dinhDang($data) : null;
    }
    private function dinhDang(object $loai): object
    {
        $loai->gia_co_ban = (float) $loai->gia_co_ban;
        $loai->so_nguoi_toi_da = (int) $loai->so_nguoi_toi_da;
        return $loai;
    }
    private function quyTac(?int $id = null, bool $capNhat = false): array
    {
        $batBuoc = $capNhat ? 'sometimes' : 'required';
        return ['ten_loai' => [$batBuoc, 'string', 'max:255', Rule::unique('loai_phong', 'ten_loai')->ignore($id)], 'mo_ta' => [$capNhat ? 'sometimes' : 'nullable', 'nullable', 'string'], 'gia_co_ban' => [$batBuoc, 'numeric', 'min:0'], 'so_nguoi_toi_da' => [$batBuoc, 'integer', 'min:1']];
    }
    private function thongDiep(): array
    {
        return ['ten_loai.required' => 'Tên loại phòng là bắt buộc.', 'ten_loai.unique' => 'Tên loại phòng đã tồn tại.', 'gia_co_ban.required' => 'Giá cơ bản là bắt buộc.', 'gia_co_ban.numeric' => 'Giá cơ bản phải là số.', 'gia_co_ban.min' => 'Giá cơ bản không được nhỏ hơn 0.', 'so_nguoi_toi_da.required' => 'Số người tối đa là bắt buộc.', 'so_nguoi_toi_da.integer' => 'Số người tối đa phải là số nguyên.', 'so_nguoi_toi_da.min' => 'Số người tối đa phải ít nhất là 1.'];
    }
    private function loiValidation($errors): JsonResponse
    {
        return response()->json(['success' => false, 'message' => 'Dữ liệu không hợp lệ.', 'errors' => $errors], 422, options: JSON_UNESCAPED_UNICODE);
    }
    private function khongTimThay(): JsonResponse
    {
        return response()->json(['success' => false, 'message' => 'Không tìm thấy loại phòng.', 'data' => null], 404, options: JSON_UNESCAPED_UNICODE);
    }
}
