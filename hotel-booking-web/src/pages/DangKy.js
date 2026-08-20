import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { postDangKy } from "../api/hotel_booking_api";
import { useAuth } from "../context/AuthContext";
import "../styles/auth.css";
export default function DangKy() {
  const [form, setForm] = useState({
      ho_ten: "",
      email: "",
      so_dien_thoai: "",
      mat_khau: "",
      xac_nhan_mat_khau: "",
    }),
    [errors, setErrors] = useState({}),
    [show, setShow] = useState({ mat_khau: false, xac_nhan_mat_khau: false }),
    [loading, setLoading] = useState(false);
  const nav = useNavigate(),
    { login } = useAuth();
  const submit = async (e) => {
    e.preventDefault();
    let x = {};
    Object.keys(form).forEach((k) => {
      if (!form[k]) x[k] = "Vui lòng nhập thông tin này.";
    });
    if (form.mat_khau && form.mat_khau.length < 8)
      x.mat_khau = "Mật khẩu phải có ít nhất 8 ký tự.";
    if (form.xac_nhan_mat_khau !== form.mat_khau)
      x.xac_nhan_mat_khau = "Xác nhận mật khẩu không khớp.";
    if (Object.keys(x).length) return setErrors(x);
    try {
      setLoading(true);
      const r = await postDangKy(form);
      login(r.data.token, r.data.nguoi_dung);
      await Swal.fire({
        icon: "success",
        title: "Đăng ký thành công",
        text: "Tài khoản của bạn đã được tạo.",
        confirmButtonText: "Bắt đầu",
      });
      nav("/");
    } catch (err) {
      setErrors(
        Object.fromEntries(
          Object.entries(err.response?.data?.errors || {}).map(([k, v]) => [
            k,
            v[0],
          ]),
        ),
      );
    } finally {
      setLoading(false);
    }
  };
  const input = (key, label, type = "text") => (
    <div className="auth-field" key={key}>
      <label>{label}</label>
      <div className={type === "password" ? "password-field" : ""}>
        <input
          className={`form-control ${errors[key] ? "is-invalid" : ""}`}
          type={type === "password" ? (show[key] ? "text" : "password") : type}
          value={form[key]}
          onChange={(e) => {
            setForm({ ...form, [key]: e.target.value });
            setErrors({ ...errors, [key]: "" });
          }}
        />
        {type === "password" && (
          <button
            type="button"
            onClick={() => setShow({ ...show, [key]: !show[key] })}
          >
            {show[key] ? "Ẩn" : "Hiện"}
          </button>
        )}
      </div>
      {errors[key] && (
        <div className="invalid-feedback d-block">{errors[key]}</div>
      )}
    </div>
  );
  return (
    <main className="auth-page auth-register-page">
      <section className="auth-form-panel">
        <div className="auth-form-wrap">
          <Link className="back-home" to="/">
            ← Về trang chủ
          </Link>
          <p className="auth-eyebrow">THAM GIA CÙNG CHÚNG TÔI</p>
          <h2>Tạo tài khoản</h2>
          <p className="auth-subtitle">Chỉ mất một phút để bắt đầu.</p>
          <form onSubmit={submit} noValidate>
            <div className="auth-grid">
              {input("ho_ten", "Họ và tên")}
              {input("so_dien_thoai", "Số điện thoại")}
            </div>
            {input("email", "Địa chỉ email", "email")}
            {input("mat_khau", "Mật khẩu", "password")}
            {input("xac_nhan_mat_khau", "Xác nhận mật khẩu", "password")}
            <button className="btn btn-brand auth-submit" disabled={loading}>
              {loading && (
                <span className="spinner-border spinner-border-sm me-2" />
              )}
              {loading ? "Đang tạo tài khoản..." : "Tạo tài khoản"}
            </button>
          </form>
          <p className="auth-switch">
            Đã có tài khoản? <Link to="/dang-nhap">Đăng nhập</Link>
          </p>
        </div>
      </section>
      <section className="auth-visual auth-register-visual">
        <div className="auth-overlay">
          <Link className="auth-brand" to="/">
            Hotel Booking
          </Link>
          <div className="auth-visual-copy">
            <p>HÀNH TRÌNH MỚI</p>
            <h1>
              Bắt đầu hành trình
              <br />
              của bạn
            </h1>
            <span>
              Tạo tài khoản để trải nghiệm việc đặt phòng nhanh chóng và thuận
              tiện hơn.
            </span>
          </div>
        </div>
      </section>
    </main>
  );
}
