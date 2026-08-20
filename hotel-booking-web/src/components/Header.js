import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { useAuth } from "../context/AuthContext";

function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [moMenu, setMoMenu] = useState(false);
  const dongMenu = () => setMoMenu(false);
  const dangXuat = async () => {
    await logout();
    dongMenu();
    await Swal.fire({
      icon: "success",
      title: "Đăng xuất thành công",
      confirmButtonText: "Tiếp tục",
    });
    // navigate("/");
  };
  const chuCaiDau = user?.ho_ten?.trim().charAt(0).toUpperCase();

  return (
    <>
      <div className="topbar py-2 text-white">
        <div className="container d-flex justify-content-between gap-2 flex-wrap">
          <span>
            Liên hệ đặt phòng: <a href="tel:0123456789">0123 456 789</a>
          </span>
          <span>Chào mừng bạn đến với Hotel Booking</span>
        </div>
      </div>
      <header className="site-header sticky-top">
        <nav className="header-shell container">
          <Link className="navbar-brand hotel-brand" to="/" onClick={dongMenu}>
            <img
              className="brand-logo"
              src="/hotel-template/logo.jpg"
              alt="Hotel Booking"
            />
            <span>
              <strong>Hotel Booking</strong>
              <small>Stay in style</small>
            </span>
          </Link>
          <button
            className={`menu-toggle ${moMenu ? "is-open" : ""}`}
            type="button"
            aria-label="Mở menu"
            aria-expanded={moMenu}
            onClick={() => setMoMenu(!moMenu)}
          >
            <i />
            <i />
            <i />
          </button>
          <div className={`header-menu ${moMenu ? "is-open" : ""}`}>
            <div className="header-nav">
              <NavLink end to="/" onClick={dongMenu}>
                Trang chủ
              </NavLink>
              <NavLink to="/phong" onClick={dongMenu}>
                Phòng
              </NavLink>
              {user && (
                <NavLink to="/dat-phong-cua-toi" onClick={dongMenu}>
                  Đặt phòng của tôi
                </NavLink>
              )}
              {user?.vai_tro === "admin" && (
                <NavLink to="/admin" onClick={dongMenu}>
                  Quản trị
                </NavLink>
              )}
            </div>
            <div className="header-auth">
              {user ? (
                <>
                  <div className="user-chip">
                    <span className="user-avatar">{chuCaiDau}</span>
                    <span className="user-name">{user.ho_ten}</span>
                  </div>
                  <button className="logout-button" onClick={dangXuat}>
                    Đăng xuất
                  </button>
                </>
              ) : (
                <>
                  <NavLink
                    className="login-link"
                    to="/dang-nhap"
                    onClick={dongMenu}
                  >
                    Đăng nhập
                  </NavLink>
                  <NavLink
                    className="signup-link"
                    to="/dang-ky"
                    onClick={dongMenu}
                  >
                    Đăng ký
                  </NavLink>
                </>
              )}
            </div>
          </div>
        </nav>
      </header>
    </>
  );
}

export default Header;
