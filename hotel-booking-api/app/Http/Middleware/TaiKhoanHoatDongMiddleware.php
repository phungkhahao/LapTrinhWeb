<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class TaiKhoanHoatDongMiddleware
{
    public function handle(Request $request, Closure $next): Response|JsonResponse
    {
        if ($request->user() !== null && $request->user()->trang_thai !== 'hoat_dong') {
            return response()->json([
                'success' => false,
                'message' => 'Tài khoản hiện không thể truy cập chức năng này.',
            ], 403, options: JSON_UNESCAPED_UNICODE);
        }

        return $next($request);
    }
}
