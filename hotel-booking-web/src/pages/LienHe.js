import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { postLienHe } from "../api/hotel_booking_api";
import Footer from "../components/Footer";
import Header from "../components/Header";
import { useAuth } from "../context/AuthContext";
import "../styles/lien-he.css";

const macDinh = { ho_ten: "", email: "", so_dien_thoai: "", tieu_de: "", noi_dung: "" };
export default function LienHe() {
  const { user } = useAuth(); const [form, setForm] = useState(macDinh); const [errors, setErrors] = useState({}); const [sending, setSending] = useState(false);
  useEffect(() => { if (user) setForm((cu) => ({ ...cu, ho_ten: cu.ho_ten || user.ho_ten || "", email: cu.email || user.email || "", so_dien_thoai: cu.so_dien_thoai || user.so_dien_thoai || "" })); }, [user]);
  const change = (e) => { const { name, value } = e.target; setForm((cu) => ({ ...cu, [name]: value })); setErrors((cu) => ({ ...cu, [name]: "" })); };
  const submit = async (e) => { e.preventDefault(); try { setSending(true); const r = await postLienHe(form); if (!r.success) throw new Error(r.message); await Swal.fire({ icon: "success", title: "Gửi liên hệ thành công", text: "Khách sạn đã nhận được nội dung của bạn.", confirmButtonText: "Đã hiểu" }); setForm((cu) => ({ ...cu, tieu_de: "", noi_dung: "" })); } catch (error) { const apiErrors = error.response?.data?.errors; if (apiErrors) setErrors(Object.fromEntries(Object.entries(apiErrors).map(([key, value]) => [key, value[0]]))); else await Swal.fire({ icon: "error", title: "Không thể gửi liên hệ", text: error.response?.data?.message || error.message, confirmButtonText: "Đã hiểu" }); } finally { setSending(false); } };
  const input = (name, label, props = {}) => <label>{label}<input name={name} value={form[name]} onChange={change} className={errors[name] ? "is-invalid" : ""} {...props} />{errors[name] && <small className="invalid-feedback">{errors[name]}</small>}</label>;
  return <><Header /><main className="contact-page"><div className="container"><header className="contact-head"><p className="section-kicker">HOTEL BOOKING</p><h1>Liên hệ với chúng tôi</h1><p>Gửi câu hỏi hoặc yêu cầu, đội ngũ khách sạn sẽ hỗ trợ bạn sớm nhất.</p></header><div className="contact-grid"><aside className="contact-info"><p className="section-kicker">THÔNG TIN LIÊN HỆ</p><h2>Chúng tôi luôn sẵn sàng hỗ trợ</h2><div><span>Điện thoại</span><a href="tel:0123456789">0123 456 789</a></div><div><span>Thời gian hỗ trợ</span><b>Hằng ngày, 08:00 – 22:00</b></div></aside><section className="contact-form-card"><h2>Gửi liên hệ</h2><form noValidate onSubmit={submit}>{input("ho_ten", "Họ và tên *")}{input("email", "Email *", { type: "email" })}{input("so_dien_thoai", "Số điện thoại", { inputMode: "tel" })}{input("tieu_de", "Tiêu đề *")}<label>Nội dung *<textarea name="noi_dung" rows="6" value={form.noi_dung} onChange={change} className={errors.noi_dung ? "is-invalid" : ""} />{errors.noi_dung && <small className="invalid-feedback">{errors.noi_dung}</small>}</label><button className="btn btn-brand" disabled={sending}>{sending ? "Đang gửi..." : "Gửi liên hệ"}</button></form></section></div></div></main><Footer /></>;
}
