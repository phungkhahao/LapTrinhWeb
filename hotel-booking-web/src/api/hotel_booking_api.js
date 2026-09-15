import { getWithParams, post, put } from './api_helper';
import * as url from './url_helper';

export const getDanhSachLoaiPhong = (data = {}) =>
  getWithParams(url.GET_DANH_SACH_LOAI_PHONG, { params: data });

export const getDanhSachPhong = (data = {}) =>
  getWithParams(url.GET_DANH_SACH_PHONG, { params: data });

export const getTimPhongTrong = (data) =>
  getWithParams(url.GET_TIM_PHONG_TRONG, { params: data });

export const getChiTietPhong = (id) =>
  getWithParams(`${url.GET_CHI_TIET_PHONG}/${id}`);

export const getDanhSachDichVu = (data = {}) =>
  getWithParams(url.GET_DANH_SACH_DICH_VU, { params: data });

export const postDatPhong = (data) => post(url.POST_DAT_PHONG, data);
export const postDangKy = (data) => post(url.POST_DANG_KY, data);
export const postDangNhap = (data) => post(url.POST_DANG_NHAP, data);
export const getThongTinTaiKhoan = () => getWithParams(url.GET_THONG_TIN_TAI_KHOAN);
export const postDangXuat = () => post(url.POST_DANG_XUAT, {});
export const getHoSo = () => getWithParams(url.GET_HO_SO);
export const putHoSo = (data) => put(url.PUT_HO_SO, data);
export const putDoiMatKhau = (data) => put(url.PUT_DOI_MAT_KHAU, data);
export const getDatPhongCuaToi = (data = {}) => getWithParams(url.GET_DAT_PHONG_CUA_TOI, { params: data });
export const getChiTietDatPhongCuaToi = (id) => getWithParams(`${url.GET_CHI_TIET_DAT_PHONG_CUA_TOI}/${id}`);
export const putHuyDatPhongCuaToi = (id) => put(`${url.PUT_HUY_DAT_PHONG_CUA_TOI}/${id}/huy`, {});
export const getAdminDashboard = () => getWithParams(url.GET_ADMIN_DASHBOARD);
export const getAdminPhong = (data = {}) => getWithParams(url.GET_ADMIN_PHONG, { params: data });
export const postAdminPhong = (data) => post(url.GET_ADMIN_PHONG, data);
export const putAdminPhong = (id, data) => put(`${url.GET_ADMIN_PHONG}/${id}`, data);
export const putNgungHoatDongPhong = (id) => put(`${url.PUT_NGUNG_HOAT_DONG_PHONG}/${id}/ngung-hoat-dong`, {});
export const putKichHoatPhong = (id) => put(`${url.PUT_KICH_HOAT_PHONG}/${id}/kich-hoat`, {});
export const getAdminLoaiPhong = (data = {}) => getWithParams(url.GET_ADMIN_LOAI_PHONG, { params: data });
export const postAdminLoaiPhong = (data) => post(url.GET_ADMIN_LOAI_PHONG, data);
export const putAdminLoaiPhong = (id, data) => put(`${url.GET_ADMIN_LOAI_PHONG}/${id}`, data);
export const putNgungHoatDongLoaiPhong = (id) => put(`${url.PUT_NGUNG_HOAT_DONG_LOAI_PHONG}/${id}/ngung-hoat-dong`, {});
export const putKichHoatLoaiPhong = (id) => put(`${url.PUT_KICH_HOAT_LOAI_PHONG}/${id}/kich-hoat`, {});
export const getAdminDatPhong = (data = {}) => getWithParams(url.GET_ADMIN_DAT_PHONG, { params: data });
export const getChiTietAdminDatPhong = (id) => getWithParams(`${url.GET_ADMIN_DAT_PHONG}/${id}`);
export const putXacNhanAdminDatPhong = (id) => put(`${url.GET_ADMIN_DAT_PHONG}/${id}/xac-nhan`, {});
export const putHuyAdminDatPhong = (id) => put(`${url.GET_ADMIN_DAT_PHONG}/${id}/huy`, {});
export const putXacNhanThanhToanAdmin = (id) => put(`${url.GET_ADMIN_DAT_PHONG}/${id}/xac-nhan-thanh-toan`, {});
export const getAdminNguoiDung = (data = {}) => getWithParams(url.GET_ADMIN_NGUOI_DUNG, { params: data });
export const putTrangThaiAdminNguoiDung = (id, data) => put(`${url.GET_ADMIN_NGUOI_DUNG}/${id}/trang-thai`, data);
export const getAdminDichVu = (data = {}) => getWithParams(url.GET_ADMIN_DICH_VU, { params: data });
export const postAdminDichVu = (data) => post(url.GET_ADMIN_DICH_VU, data);
export const putAdminDichVu = (id, data) => put(`${url.GET_ADMIN_DICH_VU}/${id}`, data);
export const putNgungHoatDongDichVu = (id) => put(`${url.GET_ADMIN_DICH_VU}/${id}/ngung-hoat-dong`, {});
export const putKichHoatDichVu = (id) => put(`${url.GET_ADMIN_DICH_VU}/${id}/kich-hoat`, {});
export const postLienHe = (data) => post(url.POST_LIEN_HE, data);
export const getAdminLienHe = (data = {}) => getWithParams(url.GET_ADMIN_LIEN_HE, { params: data });
export const getChiTietAdminLienHe = (id) => getWithParams(`${url.GET_ADMIN_LIEN_HE}/${id}`);
export const putTrangThaiAdminLienHe = (id, data) => put(`${url.GET_ADMIN_LIEN_HE}/${id}/trang-thai`, data);
export const getAdminQuanTriVien = (data = {}) => getWithParams(url.GET_ADMIN_QUAN_TRI_VIEN, { params: data });
export const postAdminQuanTriVien = (data) => post(url.GET_ADMIN_QUAN_TRI_VIEN, data);
export const putAdminQuanTriVien = (id, data) => put(`${url.GET_ADMIN_QUAN_TRI_VIEN}/${id}`, data);
