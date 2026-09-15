import { useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { useAuth } from "../../context/AuthContext";
import "../../styles/admin.css";
import "../../styles/admin-logout.css";

function AdminLayout({ title, activeMenu, children }) {
  const { user, isAuthenticated, loadingAuth, logout } = useAuth();
  const navigate = useNavigate();
  const daThongBaoTuChoi = useRef(false);
  const laAdmin = user?.vai_tro === "admin";

  useEffect(() => {
    if (loadingAuth) return;
    if (!isAuthenticated) {
      navigate("/dang-nhap", { replace: true });
      return;
    }
    if (!laAdmin && !daThongBaoTuChoi.current) {
      daThongBaoTuChoi.current = true;
      Swal.fire({
        icon: "error",
        title: "Bạn không có quyền truy cập trang quản trị.",
        confirmButtonText: "Đã hiểu",
      }).then(() => navigate("/", { replace: true }));
    }
  }, [isAuthenticated, laAdmin, loadingAuth, navigate]);

  const dangXuat = async () => {
    await logout();
    await Swal.fire({
      icon: "success",
      title: "Đăng xuất thành công.",
      confirmButtonText: "Tiếp tục",
    });
    navigate("/dang-nhap", { replace: true });
  };

  if (loadingAuth || !isAuthenticated || !laAdmin)
    return (
      <main className="admin-loading">Đang kiểm tra quyền truy cập...</main>
    );

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <span>HB</span>
          <div>
            <strong>Hotel Booking</strong>
            <small>QUẢN TRỊ</small>
          </div>
        </div>
        <nav>
          <span className="admin-nav-label">MENU</span>
          <Link
            to="/admin"
            className={
              activeMenu === "dashboard"
                ? "admin-nav-active admin-nav-link"
                : "admin-nav-link"
            }
          >
            Dashboard
          </Link>
          <Link
            to="/admin/phong"
            className={
              activeMenu === "phong"
                ? "admin-nav-active admin-nav-link"
                : "admin-nav-link"
            }
          >
            Phòng
          </Link>
          <Link
            to="/admin/loai-phong"
            className={
              activeMenu === "loai-phong"
                ? "admin-nav-active admin-nav-link"
                : "admin-nav-link"
            }
          >
            Loại phòng
          </Link>
          <Link
            to="/admin/dat-phong"
            className={
              activeMenu === "dat-phong"
                ? "admin-nav-active admin-nav-link"
                : "admin-nav-link"
            }
          >
            Đặt phòng
          </Link>
          <Link
            to="/admin/dich-vu"
            className={
              activeMenu === "dich-vu"
                ? "admin-nav-active admin-nav-link"
                : "admin-nav-link"
            }
          >
            Dịch vụ
          </Link>
          <Link to="/admin/lien-he" className={activeMenu === "lien-he" ? "admin-nav-active admin-nav-link" : "admin-nav-link"}>
            Liên hệ
          </Link>
          <Link to="/admin/nguoi-dung" className={activeMenu === "nguoi-dung" ? "admin-nav-active admin-nav-link" : "admin-nav-link"}>Người dùng</Link>
        </nav>
        <p className="admin-sidebar-note">Bảng điều khiển quản trị khách sạn</p>
      </aside>
      <section className="admin-main">
        <header className="admin-topbar">
          <div>
            <p>QUẢN TRỊ HỆ THỐNG</p>
            <h1>{title}</h1>
          </div>
          <div className="admin-topbar-actions">
            <div className="admin-user">
              <span>{user.ho_ten?.trim().charAt(0).toUpperCase()}</span>
              <div>
                <strong>{user.ho_ten}</strong>
                <small>Quản trị viên</small>
              </div>
            </div>
            <button
              type="button"
              className="admin-logout-button"
              onClick={dangXuat}
            >
              Đăng xuất
            </button>
          </div>
        </header>
        {children}
      </section>
    </div>
  );
}

export default AdminLayout;
