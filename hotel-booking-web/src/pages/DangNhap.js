import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { postDangNhap } from "../api/hotel_booking_api";
import { useAuth } from "../context/AuthContext";
import "../styles/auth.css";

export default function DangNhap() {
  const [form, setForm] = useState({ email: "", mat_khau: "" });
  const [errors, setErrors] = useState({});
  const [hienMatKhau, setHienMatKhau] = useState(false);
  const [dangGui, setDangGui] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();
  const submit = async (event) => {
    event.preventDefault();
    const loi = {};
    if (!form.email) loi.email = "Vui lòng nhập email.";
    if (!form.mat_khau) loi.mat_khau = "Vui lòng nhập mật khẩu.";
    if (Object.keys(loi).length) return setErrors(loi);
    try {
      setDangGui(true);
      const response = await postDangNhap(form);
      login(response.data.token, response.data.nguoi_dung);
      await Swal.fire({
        icon: "success",
        title: "Đăng nhập thành công",
        confirmButtonText: "Tiếp tục",
      });
      navigate("/");
    } catch (error) {
      await Swal.fire({
        icon: "error",
        title: "Đăng nhập thất bại",
        text:
          error.response?.data?.message ||
          "Không thể đăng nhập. Vui lòng thử lại.",
        confirmButtonText: "Thử lại",
      });
    } finally {
      setDangGui(false);
    }
  };
  return (
    <main className="auth-page">
      <section className="auth-visual auth-login-visual">
        <div className="auth-overlay">
          <Link className="auth-brand" to="/">
            Hotel Booking
          </Link>
          <div className="auth-visual-copy">
            <p>CHÀO MỪNG BẠN TRỞ LẠI</p>
            <h1>
              Trải nghiệm kỳ nghỉ
              <br />
              theo cách của bạn
            </h1>
            <span>
              Không gian nghỉ dưỡng tiện nghi, sang trọng và những trải nghiệm
              đáng nhớ đang chờ bạn.
            </span>
            <small>Đặt phòng nhanh chóng • An toàn • Tiện lợi</small>
          </div>
        </div>
      </section>
      <section className="auth-form-panel">
        <div className="auth-form-wrap">
          <Link className="back-home" to="/">
            ← Về trang chủ
          </Link>
          <p className="auth-eyebrow">CHÀO MỪNG TRỞ LẠI</p>
          <h2>Đăng nhập</h2>
          <p className="auth-subtitle">
            Đăng nhập để tiếp tục hành trình của bạn.
          </p>
          <form onSubmit={submit} noValidate>
            <label>Địa chỉ email</label>
            <input
              className={`form-control ${errors.email ? "is-invalid" : ""}`}
              type="email"
              value={form.email}
              onChange={(e) => {
                setForm({ ...form, email: e.target.value });
                setErrors({ ...errors, email: "" });
              }}
            />
            {errors.email && (
              <div className="invalid-feedback">{errors.email}</div>
            )}
            <label className="mt-3">Mật khẩu</label>
            <div className="password-field">
              <input
                className={`form-control ${errors.mat_khau ? "is-invalid" : ""}`}
                type={hienMatKhau ? "text" : "password"}
                value={form.mat_khau}
                onChange={(e) => {
                  setForm({ ...form, mat_khau: e.target.value });
                  setErrors({ ...errors, mat_khau: "" });
                }}
              />
              <button
                type="button"
                onClick={() => setHienMatKhau(!hienMatKhau)}
              >
                {hienMatKhau ? "Ẩn" : "Hiện"}
              </button>
            </div>
            {errors.mat_khau && (
              <div className="invalid-feedback d-block">{errors.mat_khau}</div>
            )}
            <button className="btn btn-brand auth-submit" disabled={dangGui}>
              {dangGui && (
                <span className="spinner-border spinner-border-sm me-2" />
              )}{" "}
              {dangGui ? "Đang đăng nhập..." : "Đăng nhập"}
            </button>
          </form>
          <div className="auth-divider">
            <span>Hoặc</span>
          </div>
          <p className="auth-switch">
            Chưa có tài khoản? <Link to="/dang-ky">Đăng ký ngay</Link>
          </p>
        </div>
      </section>
    </main>
  );
}
