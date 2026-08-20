import { useCallback, useEffect, useState } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import { getAdminDashboard } from "../../api/hotel_booking_api";
import { useAuth } from "../../context/AuthContext";

const dinhDangTien = new Intl.NumberFormat("vi-VN");

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
        ["Đặt phòng", duLieu.tong_so_dat_phong, "Tất cả lịch sử"],
        ["Chờ xác nhận", duLieu.so_dat_phong_cho_xac_nhan, "Cần xử lý"],
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
                <span>DOANH THU DỰ KIẾN</span>
                <strong>
                  {dinhDangTien.format(duLieu.doanh_thu_du_kien)} VNĐ
                </strong>
                <p>Tổng tiền từ các booking chưa hủy.</p>
              </div>
              <b>₫</b>
            </article>
          </>
        )}
      </main>
    </AdminLayout>
  );
}

export default AdminDashboard;
