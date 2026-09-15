import { useCallback, useEffect, useState } from "react";
import Swal from "sweetalert2";
import {
  getAdminPhong,
  getDanhSachLoaiPhong,
  postAdminPhong,
  putAdminPhong,
  putKichHoatPhong,
  putNgungHoatDongPhong,
} from "../../api/hotel_booking_api";
import AdminLayout from "../../components/admin/AdminLayout";
import AdminIcon from "../../components/admin/AdminIcon";
import ReactSelect from "../../components/ReactSelect";
import AdminPagination from "../../components/admin/AdminPagination";
import "../../styles/admin-phong.css";

const macDinh = {
  so_phong: "",
  loai_phong_id: "",
  ten_phong: "",
  gia_phong: "",
  so_nguoi_toi_da: "",
  mo_ta: "",
};
const tien = new Intl.NumberFormat("vi-VN");
const anhMacDinh = (p) => `/hotel-template/${((p.id - 1) % 8) + 1}.jpg`;
const loiTuApi = (e) =>
  e.response?.data?.errors
    ? Object.values(e.response.data.errors).flat().join("\n")
    : e.response?.data?.message || e.message || "Vui lòng thử lại.";

function AdminPhong() {
  const [phong, setPhong] = useState([]);
  const [loaiPhong, setLoaiPhong] = useState([]);
  const [timKiem, setTimKiem] = useState("");
  const [dangTai, setDangTai] = useState(true);
  const [loi, setLoi] = useState("");
  const [hienForm, setHienForm] = useState(false);
  const [dangSua, setDangSua] = useState(null);
  const [form, setForm] = useState(macDinh);
  const [loiForm, setLoiForm] = useState({});
  const [tepAnh, setTepAnh] = useState(null);
  const [anhXemTruoc, setAnhXemTruoc] = useState("");
  const [dangLuu, setDangLuu] = useState(false);
  const [pagination, setPagination] = useState(null);

  const taiDanhSach = useCallback(async (page = 1) => {
    try {
      setDangTai(true);
      setLoi("");
      const r = await getAdminPhong({ tim_kiem: timKiem, page });
      if (!r.success) throw new Error(r.message);
      setPhong(r.data || []);
      setPagination(r.pagination || null);
    } catch (e) {
      setLoi(e.response?.data?.message || "Không thể tải danh sách phòng.");
    } finally {
      setDangTai(false);
    }
  }, [timKiem]);
  useEffect(() => {
    taiDanhSach(1);
  }, [taiDanhSach]);
  useEffect(() => {
    getDanhSachLoaiPhong()
      .then((r) => setLoaiPhong(r.data || []))
      .catch(() => setLoaiPhong([]));
  }, []);
  useEffect(
    () => () => {
      if (anhXemTruoc.startsWith("blob:")) URL.revokeObjectURL(anhXemTruoc);
    },
    [anhXemTruoc],
  );

  const dongForm = () => {
    setHienForm(false);
    setTepAnh(null);
    setAnhXemTruoc("");
    setLoiForm({});
  };
  const moThem = () => {
    setDangSua(null);
    setForm(macDinh);
    setTepAnh(null);
    setAnhXemTruoc("");
    setLoiForm({});
    setHienForm(true);
  };
  const moSua = (p) => {
    setDangSua(p);
    setForm({
      so_phong: p.so_phong || "",
      loai_phong_id: String(p.loai_phong_id || ""),
      ten_phong: p.ten_phong || "",
      gia_phong: String(p.gia_phong ?? ""),
      so_nguoi_toi_da: String(p.so_nguoi_toi_da ?? ""),
      mo_ta: p.mo_ta || "",
    });
    setTepAnh(null);
    setAnhXemTruoc(p.hinh_anh || "");
    setLoiForm({});
    setHienForm(true);
  };
  const capNhat = (e) => {
    const { name, value } = e.target;
    setForm((cu) => ({ ...cu, [name]: value }));
    setLoiForm((cu) => ({ ...cu, [name]: "" }));
  };
  const chonAnh = (e) => {
    const tep = e.target.files?.[0];
    if (!tep) return;
    let message = "";
    if (!["image/jpeg", "image/png", "image/webp"].includes(tep.type))
      message = "Ảnh phải có định dạng JPG, JPEG, PNG hoặc WEBP.";
    else if (tep.size > 2 * 1024 * 1024)
      message = "Ảnh không được vượt quá 2MB.";
    if (message) {
      e.target.value = "";
      setTepAnh(null);
      setLoiForm((cu) => ({ ...cu, hinh_anh: message }));
      return;
    }
    if (anhXemTruoc.startsWith("blob:")) URL.revokeObjectURL(anhXemTruoc);
    setTepAnh(tep);
    setAnhXemTruoc(URL.createObjectURL(tep));
    setLoiForm((cu) => ({ ...cu, hinh_anh: "" }));
  };
  const kiemTra = () => {
    const errors = {};
    if (!form.so_phong.trim()) errors.so_phong = "Số phòng là bắt buộc.";
    if (!form.loai_phong_id) errors.loai_phong_id = "Loại phòng là bắt buộc.";
    if (!form.gia_phong) errors.gia_phong = "Giá phòng là bắt buộc.";
    else if (!/^-?\d+$/.test(form.gia_phong))
      errors.gia_phong = "Giá phòng phải là số nguyên.";
    else if (Number(form.gia_phong) < 0)
      errors.gia_phong = "Giá phòng không được nhỏ hơn 0.";
    if (!form.so_nguoi_toi_da)
      errors.so_nguoi_toi_da = "Sức chứa tối đa là bắt buộc.";
    else if (!/^-?\d+$/.test(form.so_nguoi_toi_da))
      errors.so_nguoi_toi_da = "Sức chứa tối đa phải là số nguyên.";
    else if (Number(form.so_nguoi_toi_da) < 1)
      errors.so_nguoi_toi_da = "Sức chứa tối đa phải ít nhất là 1.";
    return errors;
  };
  const formData = () => {
    const data = new FormData();
    Object.entries(form).forEach(([k, v]) => data.append(k, v));
    if (tepAnh) data.append("hinh_anh", tepAnh);
    return data;
  };

  const luu = async (e) => {
    e.preventDefault();
    const errors = kiemTra();
    setLoiForm(errors);
    if (Object.keys(errors).length) return;
    try {
      setDangLuu(true);
      const r = dangSua
        ? await putAdminPhong(dangSua.id, formData())
        : await postAdminPhong(formData());
      if (!r.success) throw new Error(r.message);
      dongForm();
      await Swal.fire({
        icon: "success",
        title: dangSua
          ? "Cập nhật phòng thành công."
          : "Thêm phòng thành công.",
        confirmButtonText: "Đã hiểu",
      });
      await taiDanhSach();
    } catch (error) {
      const errorsApi = error.response?.data?.errors;
      if (errorsApi)
        setLoiForm(
          Object.fromEntries(
            Object.entries(errorsApi).map(([key, value]) => [key, value[0]]),
          ),
        );
      await Swal.fire({
        icon: "error",
        title: "Không thể lưu phòng",
        text: loiTuApi(error),
        confirmButtonText: "Đã hiểu",
      });
    } finally {
      setDangLuu(false);
    }
  };
  const doiTrangThai = async (p, kichHoat) => {
    const hanhDong = kichHoat ? "kích hoạt lại" : "ngừng sử dụng";
    const xacNhan = await Swal.fire({
      icon: "warning",
      title: kichHoat ? "Kích hoạt lại phòng?" : "Ngừng sử dụng phòng?",
      text: kichHoat
        ? `Phòng ${p.so_phong} sẽ có thể được đặt lại.`
        : `Phòng ${p.so_phong} sẽ không còn hiển thị cho khách và không thể đặt mới.`,
      showCancelButton: true,
      confirmButtonText: kichHoat ? "Kích hoạt lại" : "Ngừng sử dụng",
      cancelButtonText: "Không",
    });
    if (!xacNhan.isConfirmed) return;
    try {
      const r = kichHoat
        ? await putKichHoatPhong(p.id)
        : await putNgungHoatDongPhong(p.id);
      if (!r.success) throw new Error(r.message);
      await Swal.fire({
        icon: "success",
        title: `Đã ${hanhDong} phòng.`,
        confirmButtonText: "Đã hiểu",
      });
      await taiDanhSach();
    } catch (error) {
      await Swal.fire({
        icon: "error",
        title: `Không thể ${hanhDong} phòng`,
        text: loiTuApi(error),
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

  return (
    <AdminLayout title="Quản lý phòng" activeMenu="phong">
      <main className="admin-content">
        <div className="admin-intro admin-room-intro">
          <div>
            <p className="section-kicker">DANH SÁCH PHÒNG</p>
            <h2>Quản lý phòng</h2>
            <p>Thêm, cập nhật và kiểm soát trạng thái phòng trong khách sạn.</p>
          </div>
          <button type="button" onClick={moThem}>
            + Thêm phòng
          </button>
        </div>
        <div className="admin-room-toolbar">
          <input
            value={timKiem}
            onChange={(e) => setTimKiem(e.target.value)}
            placeholder="Tìm kiếm phòng..."
            aria-label="Tìm kiếm phòng"
          />
          <button type="button" onClick={taiDanhSach}>
            Tìm kiếm
          </button>
        </div>
        {dangTai && (
          <div className="admin-room-loading">Đang tải danh sách phòng...</div>
        )}
        {loi && (
          <div className="admin-error">
            <strong>Không thể tải danh sách phòng</strong>
            <p>{loi}</p>
            <button type="button" onClick={taiDanhSach}>
              Thử lại
            </button>
          </div>
        )}
        {!dangTai && !loi && (
          <div className="admin-table-wrap">
            <table className="admin-room-table admin-phong-table">
              <colgroup>
                <col style={{ width: "90px" }} />
                <col style={{ width: "95px" }} />
                <col style={{ width: "190px" }} />
                <col style={{ width: "170px" }} />
                <col style={{ width: "145px" }} />
                <col style={{ width: "115px" }} />
                <col style={{ width: "205px" }} />
                <col style={{ width: "120px" }} />
              </colgroup>
              <thead>
                <tr>
                  <th>Ảnh</th>
                  <th>Số phòng</th>
                  <th>Tên phòng</th>
                  <th>Loại phòng</th>
                  <th>Giá</th>
                  <th>Sức chứa</th>
                  <th>Trạng thái</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {phong.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="admin-table-empty">
                      Không tìm thấy phòng phù hợp.
                    </td>
                  </tr>
                ) : (
                  phong.map((p) => {
                    const ngung = p.trang_thai === "ngung_hoat_dong";
                    const coKhach = p.tinh_trang_luu_tru === "dang_co_khach";
                    return (
                      <tr key={p.id}>
                        <td>
                          <img
                            className="admin-room-image"
                            src={p.hinh_anh || anhMacDinh(p)}
                            alt={p.ten_phong || `Phòng ${p.so_phong}`}
                          />
                        </td>
                        <td>
                          <strong className="admin-cell-nowrap">
                            {p.so_phong}
                          </strong>
                        </td>
                        <td>
                          <span className="admin-cell-clamp">
                            {p.ten_phong || "Chưa đặt tên"}
                          </span>
                        </td>
                        <td>
                          <span className="admin-cell-clamp">
                            {p.ten_loai || "Chưa xác định"}
                          </span>
                        </td>
                        <td className="admin-money">
                          <span className="admin-cell-nowrap">
                            {tien.format(p.gia_phong)} VNĐ
                          </span>
                        </td>
                        <td>
                          <span className="admin-cell-nowrap">
                            {p.so_nguoi_toi_da} người
                          </span>
                        </td>
                        <td>
                          <div className="admin-room-status-group">
                            <span
                              className={
                                ngung
                                  ? "admin-room-status admin-room-status-inactive"
                                  : "admin-room-status"
                              }
                            >
                              {ngung ? "Ngừng hoạt động" : "Đang hoạt động"}
                            </span>
                            <span
                              className={
                                coKhach
                                  ? "admin-stay-status admin-stay-status-occupied"
                                  : "admin-stay-status admin-stay-status-vacant"
                              }
                            >
                              {coKhach ? "Đang có khách" : "Đang trống"}
                            </span>
                          </div>
                        </td>
                        <td>
                          <div className="admin-room-actions">
                            <button
                              type="button"
                              className="admin-icon-button icon-gold"
                              title="Sửa phòng"
                              aria-label="Sửa phòng"
                              onClick={() => moSua(p)}
                            >
                              <AdminIcon name="edit" />
                            </button>
                            <button
                              type="button"
                              className={
                                ngung
                                  ? "admin-icon-button icon-green"
                                  : "admin-icon-button icon-red"
                              }
                              title={
                                ngung
                                  ? "Kích hoạt lại phòng"
                                  : "Ngừng sử dụng phòng"
                              }
                              aria-label={
                                ngung
                                  ? "Kích hoạt lại phòng"
                                  : "Ngừng sử dụng phòng"
                              }
                              onClick={() => doiTrangThai(p, ngung)}
                            >
                              <AdminIcon name={ngung ? "play" : "pause"} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
        {!dangTai && !loi && <AdminPagination pagination={pagination} onPageChange={taiDanhSach} />}
      </main>
      {hienForm && (
        <div className="admin-modal-backdrop" role="presentation">
          <section
            className="admin-room-modal"
            role="dialog"
            aria-modal="true"
            aria-label={dangSua ? "Sửa phòng" : "Thêm phòng"}
          >
            <div className="admin-modal-head">
              <div>
                <p className="section-kicker">THÔNG TIN PHÒNG</p>
                <h2>{dangSua ? "Sửa phòng" : "Thêm phòng"}</h2>
              </div>
              <button type="button" onClick={dongForm} aria-label="Đóng">
                ×
              </button>
            </div>
            <form noValidate onSubmit={luu}>
              <div className="admin-form-grid">
                <label>
                  Số phòng *{input("so_phong")}
                  {phanLoi("so_phong")}
                </label>
                <label>
                  Loại phòng *
                  <ReactSelect
                    inputId="loai-phong"
                    value={form.loai_phong_id}
                    onChange={(value) => {
                      setForm((cu) => ({ ...cu, loai_phong_id: value }));
                      setLoiForm((cu) => ({ ...cu, loai_phong_id: "" }));
                    }}
                    placeholder="Chọn loại phòng"
                    isInvalid={Boolean(loiForm.loai_phong_id)}
                    options={loaiPhong.map((l) => ({
                      value: String(l.id),
                      label: l.ten_loai,
                    }))}
                  />
                  {phanLoi("loai_phong_id")}
                </label>
                <label>Tên phòng{input("ten_phong")}</label>
                <label>
                  Giá phòng *
                  {input("gia_phong", {
                    inputMode: "numeric",
                    placeholder: "Ví dụ: 500000",
                  })}
                  {phanLoi("gia_phong")}
                </label>
                <label>
                  Sức chứa tối đa *
                  {input("so_nguoi_toi_da", {
                    inputMode: "numeric",
                    placeholder: "Ví dụ: 2",
                  })}
                  {phanLoi("so_nguoi_toi_da")}
                </label>
                <div className="admin-form-full admin-image-field">
                  <span>Hình ảnh phòng</span>
                  <input
                    id="anh-phong"
                    className="admin-file-input"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={chonAnh}
                  />
                  {!anhXemTruoc ? (
                    <label className="admin-upload-box" htmlFor="anh-phong">
                      <b>⇧</b>
                      <strong>Chọn ảnh phòng</strong>
                      <small>PNG, JPG, WEBP • tối đa 2MB</small>
                    </label>
                  ) : (
                    <div className="admin-image-preview-wrap">
                      <img
                        className="admin-image-preview"
                        src={anhXemTruoc}
                        alt="Xem trước phòng"
                      />
                      <div>
                        <strong>{tepAnh?.name || "Ảnh hiện tại"}</strong>
                        <small>
                          {tepAnh
                            ? `${Math.ceil(tepAnh.size / 1024)} KB`
                            : "Chưa chọn ảnh mới, ảnh này sẽ được giữ nguyên."}
                        </small>
                        <label htmlFor="anh-phong">Chọn ảnh khác</label>
                      </div>
                    </div>
                  )}
                  {phanLoi("hinh_anh")}
                </div>
                <label className="admin-form-full">
                  Mô tả
                  <textarea
                    name="mo_ta"
                    rows="3"
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
                  {dangLuu ? "Đang lưu..." : "Lưu phòng"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </AdminLayout>
  );
}

export default AdminPhong;
