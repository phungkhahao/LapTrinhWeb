import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Footer from "../components/Footer";
import Header from "../components/Header";
import { getDatPhongCuaToi } from "../api/hotel_booking_api";
import { useAuth } from "../context/AuthContext";
import { formatDate } from "../utils/format";
import ReactSelect from "../components/ReactSelect";

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

function DatPhongCuaToi() {
  const { isAuthenticated, loadingAuth } = useAuth();
  const navigate = useNavigate();
  const [danhSachDatPhong, setDanhSachDatPhong] = useState([]);
  const [dangTai, setDangTai] = useState(true);
  const [loi, setLoi] = useState(null);
  const [phanLoai, setPhanLoai] = useState("");

  const taiDanhSachDatPhong = useCallback(async () => {
    try {
      setDangTai(true);
      setLoi(null);
      const response = await getDatPhongCuaToi({ phan_loai_luu_tru: phanLoai || undefined });
      if (!response.success) throw new Error(response.message);
      setDanhSachDatPhong(response.data);
    } catch (error) {
      console.error(error);
      setLoi("Không thể tải danh sách đặt phòng. Vui lòng thử lại.");
    } finally {
      setDangTai(false);
    }
  }, [phanLoai]);

  useEffect(() => {
    if (!loadingAuth && !isAuthenticated)
      navigate("/dang-nhap", { replace: true });
  }, [isAuthenticated, loadingAuth, navigate]);

  useEffect(() => {
    if (isAuthenticated) taiDanhSachDatPhong();
  }, [isAuthenticated, taiDanhSachDatPhong]);

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

  return (
    <>
      <Header />
      <main className="rooms-section min-vh-100 py-5">
        <div className="container my-bookings-container">
          <header className="my-bookings-head">
            <p className="section-kicker">LỊCH SỬ LƯU TRÚ</p>
            <h1>Đặt phòng của tôi</h1>
            <p>Theo dõi các đặt phòng và thông tin lưu trú của bạn.</p>
          </header>
          <div className="my-bookings-filter">
            <label htmlFor="booking-status">Lọc theo trạng thái</label>
            <ReactSelect inputId="booking-status" value={phanLoai} onChange={setPhanLoai} isClearable placeholder="Tất cả đặt phòng" options={[{ value: "sap_toi", label: "Sắp tới" }, { value: "dang_luu_tru", label: "Đang lưu trú" }, { value: "da_hoan_thanh", label: "Đã hoàn thành" }, { value: "da_huy", label: "Đã hủy" }]} />
          </div>

          {dangTai && (
            <div className="my-booking-skeletons">
              {[1, 2].map((item) => (
                <div className="my-booking-skeleton" key={item}>
                  <i />
                  <div>
                    <b />
                    <span />
                    <span />
                  </div>
                </div>
              ))}
            </div>
          )}
          {loi && (
            <div className="state-card">
              <strong>Không thể tải danh sách đặt phòng</strong>
              <p>{loi}</p>
              <button
                type="button"
                className="btn btn-brand"
                onClick={taiDanhSachDatPhong}
              >
                Thử lại
              </button>
            </div>
          )}
          {!dangTai && !loi && danhSachDatPhong.length === 0 && (
            <div className="state-card my-bookings-empty">
              <strong>Bạn chưa có đặt phòng nào.</strong>
              <p>
                Hãy khám phá không gian phù hợp cho kỳ nghỉ sắp tới của bạn.
              </p>
              <Link className="btn btn-brand" to="/phong">
                Khám phá phòng
              </Link>
            </div>
          )}
          {!dangTai && !loi && danhSachDatPhong.length > 0 && (
            <section
              className="my-bookings-list"
              aria-label="Danh sách đặt phòng"
            >
              {danhSachDatPhong.map((datPhong) => {
                const anhMacDinh = `/hotel-template/${((datPhong.id - 1) % 8) + 1}.jpg`;
                return (
                  <article className="my-booking-card" key={datPhong.id}>
                    <img
                      className="my-booking-image"
                      src={datPhong.hinh_anh || anhMacDinh}
                      alt={datPhong.ten_phong}
                    />
                    <div className="my-booking-content">
                      <div className="my-booking-title">
                        <div>
                          <span className="booking-code-label">
                            MÃ ĐẶT PHÒNG
                          </span>
                          <h2>{datPhong.ma_dat_phong}</h2>
                        </div>
                        <span className="status-badge status-pending">
                          {nhanTrangThaiDatPhong(datPhong.trang_thai)}
                        </span>
                      </div>
                      <h3>
                        {datPhong.ten_phong}{" "}
                        <span>• Phòng {datPhong.so_phong}</span>
                      </h3>
                      <div className="my-booking-meta">
                        <div>
                          <span>Nhận phòng</span>
                          <strong>
                            {formatDate(datPhong.ngay_nhan_phong)}
                          </strong>
                        </div>
                        <div>
                          <span>Trả phòng</span>
                          <strong>{formatDate(datPhong.ngay_tra_phong)}</strong>
                        </div>
                        <div>
                          <span>Số khách</span>
                          <strong>{datPhong.so_luong_khach} người</strong>
                        </div>
                      </div>
                      <Link
                        className="my-booking-detail-link"
                        to={`/dat-phong-cua-toi/${datPhong.id}`}
                      >
                        Xem chi tiết <span>→</span>
                      </Link>
                    </div>
                    <aside className="my-booking-payment">
                      <span>TỔNG TIỀN</span>
                      <strong>
                        {dinhDangTien.format(datPhong.tong_tien)} VNĐ
                      </strong>
                      <p>Thanh toán tại khách sạn</p>
                      <span className="status-badge status-unpaid">
                        {nhanTrangThaiThanhToan(datPhong.trang_thai_thanh_toan)}
                      </span>
                    </aside>
                  </article>
                );
              })}
            </section>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}

export default DatPhongCuaToi;
