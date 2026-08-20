<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AdminMiddleware
{
    public function handle(Request $request, Closure $next): Response|JsonResponse
    {
        if ($request->user() === null) {
            return response()->json([
                'success' => false,
                'message' => 'Chưa xác thực.',
            ], 401, options: JSON_UNESCAPED_UNICODE);
        }

        if ($request->user()->vai_tro !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Bạn không có quyền truy cập chức năng này.',
            ], 403, options: JSON_UNESCAPED_UNICODE);
        }

        return $next($request);
    }
}
