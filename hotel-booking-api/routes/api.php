<?php

use App\Http\Controllers\Api\DichVuController;
use App\Http\Controllers\Api\DatPhongController;
use App\Http\Controllers\Api\DatPhongCuaToiController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\AdminDashboardController;
use App\Http\Controllers\Api\AdminPhongController;
use App\Http\Controllers\Api\AdminLoaiPhongController;
use App\Http\Controllers\Api\AdminDatPhongController;
use App\Http\Controllers\Api\LoaiPhongController;
use App\Http\Controllers\Api\PhongController;
use Illuminate\Support\Facades\Route;

Route::get('/loai-phong', [LoaiPhongController::class, 'index']);
Route::get('/phong', [PhongController::class, 'index']);
Route::get('/phong/tim-kiem', [PhongController::class, 'timKiem']);
Route::get('/phong/{id}', [PhongController::class, 'show']);
Route::get('/dich-vu', [DichVuController::class, 'index']);
Route::post('/dat-phong', [DatPhongController::class, 'store']);
Route::post('/auth/dang-ky', [AuthController::class, 'dangKy']);
Route::post('/auth/dang-nhap', [AuthController::class, 'dangNhap']);
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/auth/thong-tin', [AuthController::class, 'thongTin']);
    Route::post('/auth/dang-xuat', [AuthController::class, 'dangXuat']);
    Route::get('/dat-phong-cua-toi', [DatPhongCuaToiController::class, 'index']);
    Route::get('/dat-phong-cua-toi/{id}', [DatPhongCuaToiController::class, 'show'])->whereNumber('id');
    Route::put('/dat-phong-cua-toi/{id}/huy', [DatPhongCuaToiController::class, 'huy'])->whereNumber('id');
});

Route::middleware(['auth:sanctum', 'admin'])->group(function () {
    Route::get('/admin/dashboard', [AdminDashboardController::class, 'index']);
    Route::get('/admin/phong', [AdminPhongController::class, 'index']);
    Route::post('/admin/phong', [AdminPhongController::class, 'store']);
    Route::get('/admin/phong/{id}', [AdminPhongController::class, 'show'])->whereNumber('id');
    Route::put('/admin/phong/{id}', [AdminPhongController::class, 'update'])->whereNumber('id');
    Route::put('/admin/phong/{id}/ngung-hoat-dong', [AdminPhongController::class, 'ngungHoatDong'])->whereNumber('id');
    Route::put('/admin/phong/{id}/kich-hoat', [AdminPhongController::class, 'kichHoat'])->whereNumber('id');
    Route::get('/admin/loai-phong', [AdminLoaiPhongController::class, 'index']);
    Route::post('/admin/loai-phong', [AdminLoaiPhongController::class, 'store']);
    Route::get('/admin/loai-phong/{id}', [AdminLoaiPhongController::class, 'show'])->whereNumber('id');
    Route::put('/admin/loai-phong/{id}', [AdminLoaiPhongController::class, 'update'])->whereNumber('id');
    Route::put('/admin/loai-phong/{id}/ngung-hoat-dong', [AdminLoaiPhongController::class, 'ngungHoatDong'])->whereNumber('id');
    Route::put('/admin/loai-phong/{id}/kich-hoat', [AdminLoaiPhongController::class, 'kichHoat'])->whereNumber('id');
    Route::get('/admin/dat-phong', [AdminDatPhongController::class, 'index']);
    Route::get('/admin/dat-phong/{id}', [AdminDatPhongController::class, 'show'])->whereNumber('id');
    Route::put('/admin/dat-phong/{id}/xac-nhan', [AdminDatPhongController::class, 'xacNhan'])->whereNumber('id');
    Route::put('/admin/dat-phong/{id}/huy', [AdminDatPhongController::class, 'huy'])->whereNumber('id');
    Route::put('/admin/dat-phong/{id}/xac-nhan-thanh-toan', [AdminDatPhongController::class, 'xacNhanThanhToan'])->whereNumber('id');
});
