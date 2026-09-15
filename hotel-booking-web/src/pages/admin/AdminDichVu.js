import { useCallback, useEffect, useState } from "react";
import Swal from "sweetalert2";
import {
  getAdminDichVu,
  postAdminDichVu,
  putAdminDichVu,
  putKichHoatDichVu,
  putNgungHoatDongDichVu,
} from "../../api/hotel_booking_api";
import AdminIcon from "../../components/admin/AdminIcon";
import AdminLayout from "../../components/admin/AdminLayout";
import AdminPagination from "../../components/admin/AdminPagination";
import "../../styles/admin-phong.css";

const macDinh = { ten_dich_vu: "", mo_ta: "", gia: "" };
const tien = new Intl.NumberFormat("vi-VN");
const loiTuApi = (error) =>
  error.response?.data?.message || error.message || "Vui lòng thử lại.";

function AdminDichVu() {
  const [danhSach, setDanhSach] = useState([]);
  const [timKiem, setTimKiem] = useState("");
  const [dangTai, setDangTai] = useState(true);
  const [loi, setLoi] = useState("");
  const [pagination, setPagination] = useState(null);
  const [hienForm, setHienForm] = useState(false);
  const [dangSua, setDangSua] = useState(null);
  const [form, setForm] = useState(macDinh);
  const [loiForm, setLoiForm] = useState({});
  const [dangLuu, setDangLuu] = useState(false);

  const taiDanhSach = useCallback(async (page = 1) => {
    try {
      setDangTai(true);
      setLoi("");
      const response = await getAdminDichVu({ tim_kiem: timKiem, page });
      if (!response.success) throw new Error(response.message);
      setDanhSach(response.data || []);
      setPagination(response.pagination || null);
    } catch (error) {
      setLoi(loiTuApi(error));
    } finally {
      setDangTai(false);
    }
  }, [timKiem]);

  useEffect(() => { taiDanhSach(1); }, [taiDanhSach]);

  const dongForm = () => { setHienForm(false); setLoiForm({}); };
  const moThem = () => { setDangSua(null); setForm(macDinh); setLoiForm({}); setHienForm(true); };
  const moSua = (item) => {
    setDangSua(item);
    setForm({ ten_dich_vu: item.ten_dich_vu || "", mo_ta: item.mo_ta || "", gia: String(item.gia ?? "") });
    setLoiForm({});
    setHienForm(true);
  };
  const capNhat = ({ target: { name, value } }) => {
    setForm((cu) => ({ ...cu, [name]: value }));
    setLoiForm((cu) => ({ ...cu, [name]: "" }));
  };
  const kiemTra = () => {
    const errors = {};
    if (!form.ten_dich_vu.trim()) errors.ten_dich_vu = "Tên dịch vụ là bắt buộc.";
    if (form.gia === "") errors.gia = "Giá dịch vụ là bắt buộc.";
    else if (!/^\d+(\.\d+)?$/.test(form.gia)) errors.gia = "Giá dịch vụ phải là số hợp lệ.";
    else if (Number(form.gia) < 0) errors.gia = "Giá dịch vụ không được nhỏ hơn 0.";
    return errors;
  };
  const luu = async (event) => {
    event.preventDefault();
    const errors = kiemTra();
    setLoiForm(errors);
    if (Object.keys(errors).length) return;
    try {
      setDangLuu(true);
      const duLieu = { ...form, gia: Number(form.gia) };
      const response = dangSua ? await putAdminDichVu(dangSua.id, duLieu) : await postAdminDichVu(duLieu);
      if (!response.success) throw new Error(response.message);
      dongForm();
      await Swal.fire({ icon: "success", title: dangSua ? "Cập nhật dịch vụ thành công." : "Thêm dịch vụ thành công.", confirmButtonText: "Đã hiểu" });
      await taiDanhSach();
    } catch (error) {
      const errorsApi = error.response?.data?.errors;
      if (errorsApi) setLoiForm(Object.fromEntries(Object.entries(errorsApi).map(([key, value]) => [key, value[0]])));
      await Swal.fire({ icon: "error", title: "Không thể lưu dịch vụ", text: loiTuApi(error), confirmButtonText: "Đã hiểu" });
    } finally { setDangLuu(false); }
  };
  const doiTrangThai = async (item, kichHoat) => {
    const xacNhan = await Swal.fire({
      icon: "warning",
      title: kichHoat ? "Kích hoạt lại dịch vụ?" : "Ngừng hoạt động dịch vụ?",
      text: kichHoat ? `${item.ten_dich_vu} sẽ hiển thị lại cho khách.` : `${item.ten_dich_vu} sẽ không còn hiển thị cho khách đặt phòng.`,
      showCancelButton: true,
      confirmButtonText: kichHoat ? "Kích hoạt lại" : "Ngừng hoạt động",
      cancelButtonText: "Không",
    });
    if (!xacNhan.isConfirmed) return;
    try {
      const response = kichHoat ? await putKichHoatDichVu(item.id) : await putNgungHoatDongDichVu(item.id);
      if (!response.success) throw new Error(response.message);
      await Swal.fire({ icon: "success", title: response.message, confirmButtonText: "Đã hiểu" });
      await taiDanhSach();
    } catch (error) {
      await Swal.fire({ icon: "error", title: "Không thể cập nhật trạng thái", text: loiTuApi(error), confirmButtonText: "Đã hiểu" });
    }
  };
  const loiField = (name) => loiForm[name] && <div className="invalid-feedback">{loiForm[name]}</div>;

  return <AdminLayout title="Quản lý dịch vụ" activeMenu="dich-vu">
    <main className="admin-content">
      <div className="admin-intro admin-room-intro"><div><p className="section-kicker">DANH SÁCH DỊCH VỤ</p><h2>Quản lý dịch vụ</h2><p>Quản lý dịch vụ bổ sung và giá hiển thị khi khách đặt phòng.</p></div><button type="button" onClick={moThem}>+ Thêm dịch vụ</button></div>
      <div className="admin-room-toolbar"><input value={timKiem} onChange={(e) => setTimKiem(e.target.value)} placeholder="Tìm kiếm dịch vụ..." aria-label="Tìm kiếm dịch vụ" /><button type="button" onClick={() => taiDanhSach(1)}>Tìm kiếm</button></div>
      {dangTai && <div className="admin-room-loading">Đang tải danh sách dịch vụ...</div>}
      {loi && <div className="admin-error"><strong>Không thể tải danh sách dịch vụ</strong><p>{loi}</p><button type="button" onClick={() => taiDanhSach(1)}>Thử lại</button></div>}
      {!dangTai && !loi && <><div className="admin-table-wrap"><table className="admin-room-table admin-service-table"><colgroup><col style={{ width: "240px" }} /><col style={{ width: "460px" }} /><col style={{ width: "180px" }} /><col style={{ width: "180px" }} /><col style={{ width: "180px" }} /></colgroup><thead><tr><th>Tên dịch vụ</th><th>Mô tả</th><th>Giá</th><th>Trạng thái</th><th>Thao tác</th></tr></thead><tbody>{danhSach.length === 0 ? <tr><td colSpan="5" className="admin-table-empty">Không tìm thấy dịch vụ phù hợp.</td></tr> : danhSach.map((item) => { const ngung = item.trang_thai === "ngung_hoat_dong"; return <tr key={item.id}><td className="admin-room-name"><strong>{item.ten_dich_vu}</strong></td><td className="admin-description-cell">{item.mo_ta || "—"}</td><td className="admin-money"><span className="admin-cell-nowrap">{tien.format(item.gia)} VNĐ</span></td><td><span className={ngung ? "admin-room-status admin-room-status-inactive" : "admin-room-status"}>{ngung ? "Ngừng hoạt động" : "Đang hoạt động"}</span></td><td><div className="admin-room-actions"><button type="button" className="admin-icon-button icon-gold" title="Sửa dịch vụ" aria-label="Sửa dịch vụ" onClick={() => moSua(item)}><AdminIcon name="edit" /></button><button type="button" className={ngung ? "admin-icon-button icon-green" : "admin-icon-button icon-red"} title={ngung ? "Kích hoạt lại dịch vụ" : "Ngừng hoạt động dịch vụ"} aria-label={ngung ? "Kích hoạt lại dịch vụ" : "Ngừng hoạt động dịch vụ"} onClick={() => doiTrangThai(item, ngung)}><AdminIcon name={ngung ? "play" : "pause"} /></button></div></td></tr>; })}</tbody></table></div><AdminPagination pagination={pagination} onPageChange={taiDanhSach} /></>}
    </main>
    {hienForm && <div className="admin-modal-backdrop" role="presentation"><section className="admin-room-modal admin-service-modal" role="dialog" aria-modal="true"><div className="admin-modal-head"><div><p className="section-kicker">THÔNG TIN DỊCH VỤ</p><h2>{dangSua ? "Sửa dịch vụ" : "Thêm dịch vụ"}</h2></div><button type="button" onClick={dongForm} aria-label="Đóng">×</button></div><form noValidate onSubmit={luu}><div className="admin-form-grid"><label>Tên dịch vụ *<input name="ten_dich_vu" value={form.ten_dich_vu} onChange={capNhat} className={loiForm.ten_dich_vu ? "is-invalid" : ""} />{loiField("ten_dich_vu")}</label><label>Giá *<input name="gia" inputMode="numeric" value={form.gia} onChange={capNhat} className={loiForm.gia ? "is-invalid" : ""} placeholder="Ví dụ: 300000" />{loiField("gia")}</label><label className="admin-form-full">Mô tả<textarea name="mo_ta" rows="4" value={form.mo_ta} onChange={capNhat} className={loiForm.mo_ta ? "is-invalid" : ""} placeholder="Mô tả ngắn về dịch vụ" />{loiField("mo_ta")}</label></div><div className="admin-form-actions"><button type="button" onClick={dongForm}>Hủy</button><button type="submit" disabled={dangLuu}>{dangLuu ? "Đang lưu..." : "Lưu dịch vụ"}</button></div></form></section></div>}
  </AdminLayout>;
}

export default AdminDichVu;
