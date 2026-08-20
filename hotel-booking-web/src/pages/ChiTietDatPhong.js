import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import Footer from "../components/Footer";
import Header from "../components/Header";
import {
  getChiTietDatPhongCuaToi,
  putHuyDatPhongCuaToi,
} from "../api/hotel_booking_api";
import { useAuth } from "../context/AuthContext";
import { formatDate, formatDateTime } from "../utils/format";
import "../styles/booking-cancel.css";

const dinhDangTien = new Intl.NumberFormat("vi-VN");
const nhanTrangThaiDatPhong = (trangThai) =>
  ({
    cho_xac_nhan: "Chờ xác nhận",
    da_xac_nhan: "Đã xác nhận",
    da_huy: "Đã hủy",
  })[trangThai] || trangThai;
const nhanTrangThaiThanhToan = (trangThai) =>
  ({ chua_thanh_toan: "Chưa thanh toán", da_thanh_toan: "Đã thanh toán" })[
    trangThai
  ] || trangThai;

function ChiTietDatPhong() {
  const { id } = useParams();
  const { isAuthenticated, loadingAuth } = useAuth();
  const navigate = useNavigate();
  const [datPhong, setDatPhong] = useState(null);
  const [dangTai, setDangTai] = useState(true);
  const [loi, setLoi] = useState(null);
  const [dangHuy, setDangHuy] = useState(false);

  const taiChiTiet = useCallback(async () => {
    try {
      setDangTai(true);
      setLoi(null);
      const response = await getChiTietDatPhongCuaToi(id);
      if (!response.success) throw new Error(response.message);
      setDatPhong(response.data);
    } catch (error) {
      console.error(error);
      setLoi(
        error.response?.data?.message ||
          "Không thể tải chi tiết đặt phòng. Vui lòng thử lại.",
      );
    } finally {
      setDangTai(false);
    }
  }, [id]);

  useEffect(() => {
    if (!loadingAuth && !isAuthenticated)
      navigate("/dang-nhap", { replace: true });
  }, [isAuthenticated, loadingAuth, navigate]);

  useEffect(() => {
    if (isAuthenticated) taiChiTiet();
  }, [isAuthenticated, taiChiTiet]);

  if (loadingAuth || !isAuthenticated) {
    return (
      <>
        <Header />
        <main className="rooms-section min-vh-100 py-5">
          <div className="text-center py-5">
            <div className="spinner-border text-brand" role="status" />
            <p className="mt-3">Đang kiểm tra tài khoản...</p>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (dangTai) {
    return (
      <>
        <Header />
        <main className="rooms-section min-vh-100 py-5">
          <div className="container">
            <div className="booking-detail-skeleton">
              <i />
              <b />
              <span />
              <span />
              <span />
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (loi || !datPhong) {
    return (
      <>
        <Header />
        <main className="rooms-section min-vh-100 py-5">
          <div className="container">
            <div className="state-card">
              <strong>Không thể tải chi tiết đặt phòng</strong>
              <p>{loi}</p>
              <Link className="btn btn-brand" to="/dat-phong-cua-toi">
                ← Quay lại đặt phòng của tôi
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const anhMacDinh = `/hotel-template/${((datPhong.id - 1) % 8) + 1}.jpg`;
  const coTheHuy = datPhong.trang_thai === "cho_xac_nhan";
  const huyDatPhong = async () => {
    const xacNhan = await Swal.fire({
      icon: "warning",
      title: "Bạn có chắc muốn hủy đặt phòng?",
      text: "Nếu tiếp tục, đặt phòng này sẽ được chuyển sang trạng thái đã hủy.",
      showCancelButton: true,
      confirmButtonText: "Xác nhận hủy",
      cancelButtonText: "Không",
      confirmButtonColor: "#a84c42",
      cancelButtonColor: "#102a43",
    });
    if (!xacNhan.isConfirmed) return;

    try {
      setDangHuy(true);
      const response = await putHuyDatPhongCuaToi(id);
      if (!response.success) throw new Error(response.message);
      await Swal.fire({
        icon: "success",
        title: "Hủy đặt phòng thành công.",
        confirmButtonText: "Đã hiểu",
      });
      await taiChiTiet();
    } catch (error) {
      await Swal.fire({
        icon: "error",
        title: "Không thể hủy đặt phòng",
        text:
          error.response?.data?.message || error.message || "Vui lòng thử lại.",
        confirmButtonText: "Đã hiểu",
      });
    } finally {
      setDangHuy(false);
    }
  };

  return (
    <>
      <Header />
      <main className="rooms-section min-vh-100 py-5">
        <div className="container">
          <div className="booking-detail-wrap">
            <Link className="booking-detail-back" to="/dat-phong-cua-toi">
              ← Quay lại đặt phòng của tôi
            </Link>
            <header className="booking-detail-head">
              <div>
                <p className="section-kicker">THÔNG TIN XÁC NHẬN</p>
                <h1>Chi tiết đặt phòng</h1>
              </div>
              <div className="booking-detail-code">
                <span>MÃ ĐẶT PHÒNG</span>
                <strong>{datPhong.ma_dat_phong}</strong>
              </div>
            </header>

            <section className="booking-detail-room-card">
              <img
                src={datPhong.hinh_anh || anhMacDinh}
                alt={datPhong.ten_phong}
              />
              <div>
                <p className="section-kicker">PHÒNG ĐÃ CHỌN</p>
                <h2>{datPhong.ten_phong}</h2>
                <p>Phòng {datPhong.so_phong}</p>
                <div className="booking-detail-price">
                  <span>Giá phòng / đêm</span>
                  <strong>{dinhDangTien.format(datPhong.gia_phong)} VNĐ</strong>
                </div>
              </div>
            </section>

            <div className="booking-detail-grid">
              <section className="booking-detail-card">
                <h2>Thông tin khách hàng</h2>
                <dl>
                  <div>
                    <dt>Họ và tên</dt>
                    <dd>{datPhong.ten_khach_hang}</dd>
                  </div>
                  <div>
                    <dt>Email</dt>
                    <dd>{datPhong.email_khach_hang}</dd>
                  </div>
                  <div>
                    <dt>Số điện thoại</dt>
                    <dd>{datPhong.so_dien_thoai}</dd>
                  </div>
                </dl>
              </section>
              <section className="booking-detail-card">
                <h2>Thông tin lưu trú</h2>
                <dl>
                  <div>
                    <dt>Ngày nhận phòng</dt>
                    <dd>{formatDate(datPhong.ngay_nhan_phong)}</dd>
                  </div>
                  <div>
                    <dt>Ngày trả phòng</dt>
                    <dd>{formatDate(datPhong.ngay_tra_phong)}</dd>
                  </div>
                  <div>
                    <dt>Số đêm</dt>
                    <dd>{datPhong.so_dem} đêm</dd>
                  </div>
                  <div>
                    <dt>Số khách</dt>
                    <dd>{datPhong.so_luong_khach} người</dd>
                  </div>
                </dl>
              </section>
              <section className="booking-detail-card booking-detail-payment-card">
                <h2>Thanh toán</h2>
                <dl>
                  <div>
                    <dt>Phương thức</dt>
                    <dd>
                      {datPhong.phuong_thuc_thanh_toan === "tai_khach_san"
                        ? "Thanh toán tại khách sạn"
                        : datPhong.phuong_thuc_thanh_toan || "Chưa cập nhật"}
                    </dd>
                  </div>
                  <div>
                    <dt>Trạng thái thanh toán</dt>
                    <dd>
                      <span className="status-badge status-unpaid">
                        {nhanTrangThaiThanhToan(datPhong.trang_thai_thanh_toan)}
                      </span>
                    </dd>
                  </div>
                  <div>
                    <dt>Trạng thái đặt phòng</dt>
                    <dd>
                      <span className="status-badge status-pending">
                        {nhanTrangThaiDatPhong(datPhong.trang_thai)}
                      </span>
                    </dd>
                  </div>
                  <div>
                    <dt>Thời gian tạo</dt>
                    <dd>{formatDateTime(datPhong.created_at)}</dd>
                  </div>
                </dl>
              </section>
              <section className="booking-detail-card booking-detail-note-card">
                <h2>Ghi chú</h2>
                <p>{datPhong.ghi_chu || "Không có ghi chú thêm."}</p>
              </section>
            </div>

            <section className="booking-detail-total">
              <span>TỔNG TIỀN</span>
              <strong>{dinhDangTien.format(datPhong.tong_tien)} VNĐ</strong>
            </section>
            {coTheHuy && (
              <div className="booking-cancel-action">
                <button
                  type="button"
                  className="btn-booking-cancel"
                  disabled={dangHuy}
                  onClick={huyDatPhong}
                >
                  {dangHuy ? "Đang hủy đặt phòng..." : "Hủy đặt phòng"}
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

export default ChiTietDatPhong;
