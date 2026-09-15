<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use OpenApi\Attributes as OA;

class LienHeController extends Controller
{
    #[OA\Post(path: '/api/lien-he', summary: 'Gửi liên hệ', tags: ['Liên hệ'], requestBody: new OA\RequestBody(required: true, content: new OA\JsonContent(required: ['ho_ten', 'email', 'tieu_de', 'noi_dung'], properties: [new OA\Property(property: 'ho_ten', type: 'string'), new OA\Property(property: 'email', type: 'string', format: 'email'), new OA\Property(property: 'so_dien_thoai', type: 'string', nullable: true), new OA\Property(property: 'tieu_de', type: 'string'), new OA\Property(property: 'noi_dung', type: 'string')])), responses: [new OA\Response(response: 201, description: 'Gửi liên hệ thành công'), new OA\Response(response: 422, description: 'Dữ liệu không hợp lệ')])]
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->only(['ho_ten', 'email', 'so_dien_thoai', 'tieu_de', 'noi_dung']), [
            'ho_ten' => ['required', 'string', 'max:255'], 'email' => ['required', 'email', 'max:255'],
            'so_dien_thoai' => ['nullable', 'string', 'max:30', 'regex:/^[0-9+().\-\s]+$/'],
            'tieu_de' => ['required', 'string', 'max:255'], 'noi_dung' => ['required', 'string', 'max:5000'],
        ], ['ho_ten.required' => 'Họ và tên là bắt buộc.', 'email.required' => 'Email là bắt buộc.', 'email.email' => 'Email không đúng định dạng.', 'so_dien_thoai.regex' => 'Số điện thoại không hợp lệ.', 'tieu_de.required' => 'Tiêu đề là bắt buộc.', 'noi_dung.required' => 'Nội dung là bắt buộc.', 'noi_dung.max' => 'Nội dung không được vượt quá 5000 ký tự.']);
        if ($validator->fails()) return response()->json(['success' => false, 'message' => 'Dữ liệu không hợp lệ.', 'errors' => $validator->errors()], 422, options: JSON_UNESCAPED_UNICODE);
        $id = DB::table('lien_he')->insertGetId([...$validator->validated(), 'trang_thai' => 'chua_xu_ly', 'created_at' => now(), 'updated_at' => now()]);
        return response()->json(['success' => true, 'message' => 'Gửi liên hệ thành công.', 'data' => DB::table('lien_he')->find($id)], 201, options: JSON_UNESCAPED_UNICODE);
    }
}
