import { Link } from 'react-router-dom';

function Footer() {
  return (
    <footer className="site-footer" id="lien-he">
      <div className="container footer-main">
        <div className="row g-4 align-items-start footer-grid">
          <div className="col-lg-6 footer-brand">
            <div className="footer-brand-row">
              <img className="footer-logo" src="/hotel-template/logo.jpg" alt="Hotel Booking" />
              <h2>Hotel Booking</h2>
            </div>
            <p className="footer-description">
              Không gian nghỉ dưỡng tinh tế, nơi mỗi hành trình đều trở thành một kỷ niệm đáng nhớ.
            </p>
          </div>

          <div className="col-sm-6 col-lg-3 footer-links">
            <h3>Khám phá</h3>
            <Link to="/">Trang chủ</Link>
            <Link to="/phong">Phòng</Link>
          </div>

          <div className="col-sm-6 col-lg-3 footer-links">
            <h3>Tài khoản</h3>
            <Link to="/dang-nhap">Đăng nhập</Link>
            <Link to="/dang-ky">Đăng ký</Link>
          </div>
        </div>
      </div>
      <div className="container">
        <div className="footer-bottom">© 2026 Hotel Booking. Bản quyền được bảo lưu.</div>
      </div>
    </footer>
  );
}

export default Footer;
