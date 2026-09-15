import { useCallback, useEffect, useState } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import { getAdminDashboard } from "../../api/hotel_booking_api";
import { useAuth } from "../../context/AuthContext";
import { Link } from "react-router-dom";
import { formatDate } from "../../utils/format";

const dinhDangTien = new Intl.NumberFormat("vi-VN");
const trangThaiText = { cho_xac_nhan: "Chờ xác nhận", da_xac_nhan: "Đã xác nhận", da_huy: "Đã hủy" };

function AdminDashboard() {
  const { user } = useAuth();
  const [duLieu, setDuLieu] = useState(null);
  const [dangTai, setDangTai] = useState(true);
  const [loi, setLoi] = useState(null);
  const laAdmin = user?.vai_tro === "admin";
  const taiDashboard = useCallback(async () => {
    try {
      setDangTai(true);
      setLoi(null);
      const response = await getAdminDashboard();
      if (!response.success) throw new Error(response.message);
      setDuLieu(response.data);
    } catch (error) {
      setLoi(
        error.response?.data?.message || "Không thể tải số liệu dashboard.",
      );
    } finally {
      setDangTai(false);
    }
  }, []);
  useEffect(() => {
    if (laAdmin) taiDashboard();
  }, [laAdmin, taiDashboard]);
  const cards = duLieu
    ? [
        ["Tổng phòng", duLieu.tong_so_phong, "Phòng trong hệ thống"],
        ["Phòng trống", duLieu.so_phong_dang_trong, "Sẵn sàng phục vụ"],
        ["Đang có khách", duLieu.so_phong_dang_co_khach, "Đang lưu trú"],
        ["Đặt phòng", duLieu.tong_so_dat_phong, "Tất cả lịch sử"],
        ["Chờ xác nhận", duLieu.so_dat_phong_cho_xac_nhan, "Cần xử lý"],
        ["Đã xác nhận", duLieu.so_dat_phong_da_xac_nhan, "Đã xác nhận"],
        ["Đã hủy", duLieu.so_dat_phong_da_huy, "Booking đã hủy"],
        ["Khách hàng", duLieu.tong_so_khach_hang, "Tài khoản khách hàng"],
      ]
    : [];
  return (
    <AdminLayout title="Dashboard" activeMenu="dashboard">
      <main className="admin-content">
        <div className="admin-intro">
          <div>
            <p className="section-kicker">TỔNG QUAN</p>
            <h2>Chào mừng trở lại, {user?.ho_ten}.</h2>
            <p>Theo dõi nhanh tình hình hoạt động của Hotel Booking.</p>
          </div>
          <button type="button" onClick={taiDashboard}>
            Làm mới số liệu
          </button>
        </div>
        {dangTai && (
          <div className="admin-card-grid">
            {[1, 2, 3, 4, 5, 6, 7].map((item) => (
              <div className="admin-stat-skeleton" key={item}>
                <i />
                <span />
              </div>
            ))}
          </div>
        )}
        {loi && (
          <div className="admin-error">
            <strong>Không thể tải dashboard</strong>
            <p>{loi}</p>
            <button type="button" onClick={taiDashboard}>
              Thử lại
            </button>
          </div>
        )}
        {!dangTai && !loi && (
          <>
            <div className="admin-card-grid">
              {cards.map(([tieuDe, giaTri, moTa]) => (
                <article className="admin-stat-card" key={tieuDe}>
                  <span>{tieuDe}</span>
                  <strong>{giaTri}</strong>
                  <p>{moTa}</p>
                </article>
              ))}
            </div>
            <article className="admin-revenue-card">
              <div>
                <span>DOANH THU THỰC TẾ</span>
                <strong>
                  {dinhDangTien.format(duLieu.doanh_thu_thuc_te)} VNĐ
                </strong>
                <p>Chỉ tính các thanh toán đã xác nhận.</p>
              </div>
              <b>₫</b>
            </article>
            <section className="admin-recent-bookings">
              <header>
                <div><p className="section-kicker">CẬP NHẬT MỚI</p><h3>Booking gần đây</h3></div>
                <Link to="/admin/dat-phong">Xem tất cả <span>→</span></Link>
              </header>
              {(duLieu.dat_phong_gan_day || []).length === 0 ? <p className="admin-recent-empty">Chưa có đặt phòng gần đây.</p> : <>
                <div className="admin-recent-table-wrap"><table className="admin-recent-table"><thead><tr><th>Mã booking</th><th>Khách hàng</th><th>Phòng</th><th>Ngày nhận</th><th>Tổng tiền</th><th>Trạng thái</th><th>Chi tiết</th></tr></thead><tbody>{duLieu.dat_phong_gan_day.map((booking) => <tr key={booking.id}><td title={booking.ma_dat_phong}><span className="admin-recent-clamp">{booking.ma_dat_phong}</span></td><td title={booking.ten_khach_hang}><span className="admin-recent-clamp">{booking.ten_khach_hang}</span></td><td title={booking.ten_phong || `Phòng ${booking.so_phong}`}><span className="admin-recent-clamp">{booking.ten_phong || `Phòng ${booking.so_phong}`}</span></td><td>{formatDate(booking.ngay_nhan_phong)}</td><td className="admin-recent-money">{dinhDangTien.format(booking.tong_tien)} VNĐ</td><td><span className={`admin-booking-badge status-${booking.trang_thai}`}>{trangThaiText[booking.trang_thai] || booking.trang_thai}</span></td><td><Link className="admin-recent-view" to="/admin/dat-phong" aria-label={`Xem ${booking.ma_dat_phong}`} title="Xem trong quản lý đặt phòng">⌕</Link></td></tr>)}</tbody></table></div>
                <div className="admin-recent-cards">{duLieu.dat_phong_gan_day.map((booking) => <article key={booking.id}><div><span>Mã booking</span><strong title={booking.ma_dat_phong}>{booking.ma_dat_phong}</strong></div><div><span>Khách hàng</span><b>{booking.ten_khach_hang}</b></div><div><span>Phòng</span><b>{booking.ten_phong || `Phòng ${booking.so_phong}`}</b></div><div><span>Ngày nhận</span><b>{formatDate(booking.ngay_nhan_phong)}</b></div><div><span>Tổng tiền</span><b>{dinhDangTien.format(booking.tong_tien)} VNĐ</b></div><footer><span className={`admin-booking-badge status-${booking.trang_thai}`}>{trangThaiText[booking.trang_thai] || booking.trang_thai}</span><Link to="/admin/dat-phong">Xem chi tiết →</Link></footer></article>)}</div>
              </>}
            </section>
          </>
        )}
      </main>
    </AdminLayout>
  );
}

export default AdminDashboard;
