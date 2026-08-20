import { Link, useLocation } from "react-router-dom";
import Footer from "../components/Footer";
import Header from "../components/Header";
import { formatDate } from "../utils/format";

const dinhDangTien = new Intl.NumberFormat("vi-VN");

function DatPhongThanhCong() {
  const { state: datPhong } = useLocation();

  return (
    <>
      <Header />
      <main className="rooms-section py-5 min-vh-100">
        <div className="container">
          {!datPhong ? (
            <div className="booking-success text-center">
              <h1>Không có thông tin đặt phòng</h1>
              <p>Vui lòng thực hiện đặt phòng để xem thông tin xác nhận.</p>
              <Link className="btn btn-brand" to="/">
                Về trang chủ
              </Link>
            </div>
          ) : (
            <section className="booking-success booking-confirmation">
              <header className="confirmation-hero">
                <div className="success-check" aria-hidden="true">
                  ✓
                </div>
                <p className="section-kicker">XÁC NHẬN ĐẶT PHÒNG</p>
                <h1>Đặt phòng thành công!</h1>
                <p>Cảm ơn bạn đã lựa chọn Hotel Booking.</p>
              </header>

              <div className="booking-code-ticket">
                <span>MÃ ĐẶT PHÒNG</span>
                <strong>{datPhong.ma_dat_phong}</strong>
              </div>

              <section
                className="confirmation-details"
                aria-label="Thông tin đặt phòng"
              >
                <h2>Thông tin lưu trú</h2>
                <dl className="confirmation-detail-grid">
                  <div>
                    <dt>Phòng</dt>
                    <dd>
                      {datPhong.ten_phong} <span>• {datPhong.so_phong}</span>
                    </dd>
                  </div>
                  <div>
                    <dt>Số khách</dt>
                    <dd>{datPhong.so_luong_khach} người</dd>
                  </div>
                  <div>
                    <dt>Ngày nhận</dt>
                    <dd>{formatDate(datPhong.ngay_nhan_phong)}</dd>
                  </div>
                  <div>
                    <dt>Ngày trả</dt>
                    <dd>{formatDate(datPhong.ngay_tra_phong)}</dd>
                  </div>
                  <div>
                    <dt>Số đêm</dt>
                    <dd>{datPhong.so_dem} đêm</dd>
                  </div>
                  <div>
                    <dt>Giá phòng / đêm</dt>
                    <dd>{dinhDangTien.format(datPhong.gia_phong)} VNĐ</dd>
                  </div>
                </dl>
              </section>

              <div className="confirmation-total">
                <span>TỔNG TIỀN</span>
                <strong>{dinhDangTien.format(datPhong.tong_tien)} VNĐ</strong>
              </div>

              <section
                className="confirmation-statuses"
                aria-label="Trạng thái đặt phòng và thanh toán"
              >
                <div>
                  <span>Trạng thái đặt phòng</span>
                  <strong className="status-badge status-pending">
                    {datPhong.trang_thai_hien_thi || "Chờ xác nhận"}
                  </strong>
                </div>
                <div>
                  <span>Trạng thái thanh toán</span>
                  <strong className="status-badge status-unpaid">
                    {datPhong.thanh_toan?.trang_thai_hien_thi ||
                      "Chưa thanh toán"}
                  </strong>
                </div>
                <div>
                  <span>Phương thức</span>
                  <strong>
                    {datPhong.thanh_toan?.phuong_thuc_hien_thi ||
                      "Thanh toán tại khách sạn"}
                  </strong>
                </div>
              </section>

              <div className="confirmation-actions">
                <Link className="btn btn-brand" to="/">
                  Về trang chủ
                </Link>
                <Link className="btn btn-outline-brand" to="/phong">
                  Xem phòng khác
                </Link>
              </div>
            </section>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}

export default DatPhongThanhCong;
