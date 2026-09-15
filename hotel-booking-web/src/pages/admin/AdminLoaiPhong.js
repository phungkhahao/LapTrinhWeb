import { useCallback, useEffect, useState } from "react";
import Swal from "sweetalert2";
import {
  getAdminLoaiPhong,
  postAdminLoaiPhong,
  putAdminLoaiPhong,
  putKichHoatLoaiPhong,
  putNgungHoatDongLoaiPhong,
} from "../../api/hotel_booking_api";
import AdminLayout from "../../components/admin/AdminLayout";
import AdminIcon from "../../components/admin/AdminIcon";
import AdminPagination from "../../components/admin/AdminPagination";
import "../../styles/admin-phong.css";

const macDinh = {
  ten_loai: "",
  mo_ta: "",
  gia_co_ban: "",
  so_nguoi_toi_da: "",
};
const tien = new Intl.NumberFormat("vi-VN");
const thongBaoLoi = (e) =>
  e.response?.data?.errors
    ? Object.values(e.response.data.errors).flat().join("\n")
    : e.response?.data?.message || e.message || "Vui lòng thử lại.";

function AdminLoaiPhong() {
  const [danhSach, setDanhSach] = useState([]);
  const [timKiem, setTimKiem] = useState("");
  const [dangTai, setDangTai] = useState(true);
  const [loi, setLoi] = useState("");
  const [hienForm, setHienForm] = useState(false);
  const [dangSua, setDangSua] = useState(null);
  const [form, setForm] = useState(macDinh);
  const [loiForm, setLoiForm] = useState({});
  const [dangLuu, setDangLuu] = useState(false);
  const [pagination, setPagination] = useState(null);
  const taiDanhSach = useCallback(async (page = 1) => {
    try {
      setDangTai(true);
      setLoi("");
      const r = await getAdminLoaiPhong({ tim_kiem: timKiem, page });
      if (!r.success) throw new Error(r.message);
      setDanhSach(r.data || []);
      setPagination(r.pagination || null);
    } catch (e) {
      setLoi(
        e.response?.data?.message || "Không thể tải danh sách loại phòng.",
      );
    } finally {
      setDangTai(false);
    }
  }, [timKiem]);
  useEffect(() => {
    taiDanhSach(1);
  }, [taiDanhSach]);
  const dongForm = () => {
    setHienForm(false);
    setLoiForm({});
  };
  const moThem = () => {
    setDangSua(null);
    setForm(macDinh);
    setLoiForm({});
    setHienForm(true);
  };
  const moSua = (item) => {
    setDangSua(item);
    setForm({
      ten_loai: item.ten_loai || "",
      mo_ta: item.mo_ta || "",
      gia_co_ban: String(item.gia_co_ban ?? ""),
      so_nguoi_toi_da: String(item.so_nguoi_toi_da ?? ""),
    });
    setLoiForm({});
    setHienForm(true);
  };
  const capNhat = (e) => {
    const { name, value } = e.target;
    setForm((cu) => ({ ...cu, [name]: value }));
    setLoiForm((cu) => ({ ...cu, [name]: "" }));
  };
  const kiemTra = () => {
    const errors = {};
    if (!form.ten_loai.trim()) errors.ten_loai = "Tên loại phòng là bắt buộc.";
    if (!form.gia_co_ban) errors.gia_co_ban = "Giá cơ bản là bắt buộc.";
    else if (!/^\d+(\.\d+)?$/.test(form.gia_co_ban))
      errors.gia_co_ban = "Giá cơ bản phải là số.";
    else if (Number(form.gia_co_ban) < 0)
      errors.gia_co_ban = "Giá cơ bản không được nhỏ hơn 0.";
    if (!form.so_nguoi_toi_da)
      errors.so_nguoi_toi_da = "Số người tối đa là bắt buộc.";
    else if (!/^\d+$/.test(form.so_nguoi_toi_da))
      errors.so_nguoi_toi_da = "Số người tối đa phải là số nguyên.";
    else if (Number(form.so_nguoi_toi_da) < 1)
      errors.so_nguoi_toi_da = "Số người tối đa phải ít nhất là 1.";
    return errors;
  };
  const luu = async (e) => {
    e.preventDefault();
    const errors = kiemTra();
    setLoiForm(errors);
    if (Object.keys(errors).length) return;
    try {
      setDangLuu(true);
      const r = dangSua
        ? await putAdminLoaiPhong(dangSua.id, form)
        : await postAdminLoaiPhong(form);
      if (!r.success) throw new Error(r.message);
      dongForm();
      await Swal.fire({
        icon: "success",
        title: dangSua
          ? "Cập nhật loại phòng thành công."
          : "Thêm loại phòng thành công.",
        confirmButtonText: "Đã hiểu",
      });
      await taiDanhSach();
    } catch (error) {
      const errorsApi = error.response?.data?.errors;
      if (errorsApi)
        setLoiForm(
          Object.fromEntries(
            Object.entries(errorsApi).map(([k, v]) => [k, v[0]]),
          ),
        );
      await Swal.fire({
        icon: "error",
        title: "Không thể lưu loại phòng",
        text: thongBaoLoi(error),
        confirmButtonText: "Đã hiểu",
      });
    } finally {
      setDangLuu(false);
    }
  };
  const doiTrangThai = async (item, kichHoat) => {
    const xacNhan = await Swal.fire({
      icon: "warning",
      title: kichHoat
        ? "Kích hoạt lại loại phòng?"
        : "Ngừng sử dụng loại phòng?",
      text: kichHoat
        ? `${item.ten_loai} sẽ hiển thị lại cho khách.`
        : `${item.ten_loai} sẽ không còn hiển thị trong danh sách công khai.`,
      showCancelButton: true,
      confirmButtonText: kichHoat ? "Kích hoạt lại" : "Ngừng sử dụng",
      cancelButtonText: "Không",
    });
    if (!xacNhan.isConfirmed) return;
    try {
      const r = kichHoat
        ? await putKichHoatLoaiPhong(item.id)
        : await putNgungHoatDongLoaiPhong(item.id);
      if (!r.success) throw new Error(r.message);
      await Swal.fire({
        icon: "success",
        title: kichHoat
          ? "Đã kích hoạt lại loại phòng."
          : "Đã ngừng sử dụng loại phòng.",
        confirmButtonText: "Đã hiểu",
      });
      await taiDanhSach();
    } catch (e) {
      await Swal.fire({
        icon: "error",
        title: "Không thể cập nhật trạng thái",
        text: thongBaoLoi(e),
        confirmButtonText: "Đã hiểu",
      });
    }
  };
  const input = (name, props = {}) => (
    <input
      name={name}
      value={form[name]}
      onChange={capNhat}
      className={loiForm[name] ? "is-invalid" : ""}
      {...props}
    />
  );
  const phanLoi = (name) =>
    loiForm[name] && <div className="invalid-feedback">{loiForm[name]}</div>;
  const phanTrangView = <AdminPagination pagination={pagination} onPageChange={taiDanhSach} />;
  return (
    <AdminLayout title="Quản lý loại phòng" activeMenu="loai-phong">
      <main className="admin-content">
        <div className="admin-intro admin-room-intro">
          <div>
            <p className="section-kicker">DANH SÁCH LOẠI PHÒNG</p>
            <h2>Quản lý loại phòng</h2>
            <p>Quản lý giá cơ bản, sức chứa và trạng thái sử dụng.</p>
          </div>
          <button type="button" onClick={moThem}>
            + Thêm loại phòng
          </button>
        </div>
        <div className="admin-room-toolbar">
          <input
            value={timKiem}
            onChange={(e) => setTimKiem(e.target.value)}
            placeholder="Tìm kiếm loại phòng..."
            aria-label="Tìm kiếm loại phòng"
          />
          <button type="button" onClick={taiDanhSach}>
            Tìm kiếm
          </button>
        </div>
        {dangTai && (
          <div className="admin-room-loading">
            Đang tải danh sách loại phòng...
          </div>
        )}
        {loi && (
          <div className="admin-error">
            <strong>Không thể tải danh sách loại phòng</strong>
            <p>{loi}</p>
            <button type="button" onClick={taiDanhSach}>
              Thử lại
            </button>
          </div>
        )}
        {!dangTai && !loi && (
          <div className="admin-table-wrap">
            <table className="admin-room-table admin-loai-phong-table">
              <thead>
                <tr>
                  <th style={{ width: "200px" }}>Tên loại</th>
                  <th style={{ width: "380px" }}>Mô tả</th>
                  <th style={{ width: "160px" }}>Giá cơ bản</th>
                  <th style={{ width: "120px" }}>Sức chứa</th>
                  <th style={{ width: "150px" }}>Trạng thái</th>
                  <th style={{ width: "190px" }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {danhSach.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="admin-table-empty">
                      Không tìm thấy loại phòng phù hợp.
                    </td>
                  </tr>
                ) : (
                  danhSach.map((item) => {
                    const ngung = item.trang_thai === "ngung_hoat_dong";
                    return (
                      <tr key={item.id}>
                        <td className="admin-room-name">
                          <strong>{item.ten_loai}</strong>
                        </td>
                        <td className="admin-description-cell">
                          {item.mo_ta || "—"}
                        </td>
                        <td className="admin-money">
                          {tien.format(item.gia_co_ban)} VNĐ
                        </td>
                        <td className="admin-nowrap">
                          {item.so_nguoi_toi_da} người
                        </td>
                        <td>
                          <span
                            className={
                              ngung
                                ? "admin-room-status admin-room-status-inactive"
                                : "admin-room-status"
                            }
                          >
                            {ngung ? "Ngừng hoạt động" : "Đang hoạt động"}
                          </span>
                        </td>
                        <td className="admin-room-actions">
                          <button
                            type="button"
                            className="admin-icon-button icon-gold"
                            title="Sửa loại phòng"
                            aria-label="Sửa loại phòng"
                            onClick={() => moSua(item)}
                          >
                            <AdminIcon name="edit" />
                          </button>
                          <button
                            type="button"
                            className={
                              ngung
                                ? "admin-icon-button icon-green ms-1"
                                : "admin-icon-button icon-red ms-2"
                            }
                            title={
                              ngung
                                ? "Kích hoạt lại loại phòng"
                                : "Ngừng sử dụng loại phòng"
                            }
                            aria-label={
                              ngung
                                ? "Kích hoạt lại loại phòng"
                                : "Ngừng sử dụng loại phòng"
                            }
                            onClick={() => doiTrangThai(item, ngung)}
                          >
                            <AdminIcon name={ngung ? "play" : "pause"} />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
        {!dangTai && !loi && phanTrangView}
      </main>
      {hienForm && (
        <div className="admin-modal-backdrop" role="presentation">
          <section
            className="admin-room-modal"
            role="dialog"
            aria-modal="true"
            aria-label={dangSua ? "Sửa loại phòng" : "Thêm loại phòng"}
          >
            <div className="admin-modal-head">
              <div>
                <p className="section-kicker">THÔNG TIN LOẠI PHÒNG</p>
                <h2>{dangSua ? "Sửa loại phòng" : "Thêm loại phòng"}</h2>
              </div>
              <button type="button" onClick={dongForm} aria-label="Đóng">
                ×
              </button>
            </div>
            <form noValidate onSubmit={luu}>
              <div className="admin-form-grid">
                <label>
                  Tên loại phòng *{input("ten_loai")}
                  {phanLoi("ten_loai")}
                </label>
                <label>
                  Giá cơ bản *
                  {input("gia_co_ban", {
                    inputMode: "decimal",
                    placeholder: "Ví dụ: 500000",
                  })}
                  {phanLoi("gia_co_ban")}
                </label>
                <label>
                  Số người tối đa *
                  {input("so_nguoi_toi_da", {
                    inputMode: "numeric",
                    placeholder: "Ví dụ: 2",
                  })}
                  {phanLoi("so_nguoi_toi_da")}
                </label>
                <label className="admin-form-full">
                  Mô tả
                  <textarea
                    name="mo_ta"
                    rows="4"
                    value={form.mo_ta}
                    onChange={capNhat}
                  />
                </label>
              </div>
              <div className="admin-modal-actions">
                <button type="button" onClick={dongForm}>
                  Hủy
                </button>
                <button type="submit" disabled={dangLuu}>
                  {dangLuu ? "Đang lưu..." : "Lưu loại phòng"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </AdminLayout>
  );
}

export default AdminLoaiPhong;
