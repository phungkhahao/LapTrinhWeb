import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { useAuth } from "../context/AuthContext";

function Header() {
  const { user, logout } = useAuth();
  const [moMenu, setMoMenu] = useState(false);
  const [moTaiKhoan, setMoTaiKhoan] = useState(false);
  const khuVucTaiKhoan = useRef(null);
  const navigate = useNavigate();
  const dongMenu = () => setMoMenu(false);
  const dongTatCaMenu = () => {
    setMoMenu(false);
    setMoTaiKhoan(false);
  };

  useEffect(() => {
    const xuLyClickBenNgoai = (event) => {
      if (khuVucTaiKhoan.current && !khuVucTaiKhoan.current.contains(event.target)) {
        setMoTaiKhoan(false);
      }
    };
    document.addEventListener("mousedown", xuLyClickBenNgoai);
    return () => document.removeEventListener("mousedown", xuLyClickBenNgoai);
  }, []);

  const dangXuat = async () => {
    await logout();
    dongTatCaMenu();
    await Swal.fire({
      icon: "success",
      title: "Đăng xuất thành công",
      confirmButtonText: "Tiếp tục",
    });
    navigate("/dang-nhap", { replace: true });
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
              <NavLink to="/lien-he" onClick={dongMenu}>
                Liên hệ
              </NavLink>
            </div>
            <div className="header-auth">
              {user ? (
                <div className="account-dropdown" ref={khuVucTaiKhoan}>
                  <button
                    className={`user-chip account-trigger ${moTaiKhoan ? "is-open" : ""}`}
                    type="button"
                    aria-haspopup="menu"
                    aria-expanded={moTaiKhoan}
                    onClick={() => setMoTaiKhoan((dangMo) => !dangMo)}
                  >
                    <span className="user-avatar">{chuCaiDau}</span>
                    <span className="user-name">{user.ho_ten}</span>
                    <svg
                      className="account-chevron"
                      aria-hidden="true"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <path d="m6 9 6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                  {moTaiKhoan && (
                    <div className="account-menu" role="menu">
                      <Link to="/ho-so" role="menuitem" onClick={dongTatCaMenu}>
                        Hồ sơ cá nhân
                      </Link>
                      <Link to="/dat-phong-cua-toi" role="menuitem" onClick={dongTatCaMenu}>
                        Đặt phòng của tôi
                      </Link>
                      {user.vai_tro === "admin" && (
                        <Link to="/admin" role="menuitem" onClick={dongTatCaMenu}>
                          Quản trị
                        </Link>
                      )}
                      <div className="account-menu-divider" />
                      <button type="button" role="menuitem" onClick={dangXuat}>
                        Đăng xuất
                      </button>
                    </div>
                  )}
                </div>
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
