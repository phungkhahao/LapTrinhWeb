import { useEffect, useMemo, useState } from "react";
import {
  Link,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import Swal from "sweetalert2";
import Footer from "../components/Footer";
import Header from "../components/Header";
import { getChiTietPhong, getDanhSachDichVu, postDatPhong } from "../api/hotel_booking_api";

const dinhDangTien = new Intl.NumberFormat("vi-VN");
const ngayHienTai = new Date().toISOString().slice(0, 10);

function tinhSoDem(ngayNhanPhong, ngayTraPhong) {
  if (!ngayNhanPhong || !ngayTraPhong || ngayTraPhong <= ngayNhanPhong)
    return 0;
  return Math.round(
    (new Date(`${ngayTraPhong}T00:00:00`) -
      new Date(`${ngayNhanPhong}T00:00:00`)) /
      86400000,
  );
}

function DatPhong() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [phong, setPhong] = useState(null);
  const [dangTai, setDangTai] = useState(true);
  const [dangGui, setDangGui] = useState(false);
  const [loiTaiPhong, setLoiTaiPhong] = useState("");
  const [errors, setErrors] = useState({});
  const [dichVus, setDichVus] = useState([]);
  const [dichVuDaChon, setDichVuDaChon] = useState([]);
  const [form, setForm] = useState({
    ten_khach_hang: "",
    email_khach_hang: "",
    so_dien_thoai: "",
    ngay_nhan_phong: searchParams.get("ngay_nhan_phong") || "",
    ngay_tra_phong: searchParams.get("ngay_tra_phong") || "",
    so_luong_khach: searchParams.get("so_luong_khach") || 1,
    ghi_chu: "",
    phuong_thuc_thanh_toan: "tai_khach_san",
  });

  useEffect(() => {
    const taiPhong = async () => {
      try {
        const response = await getChiTietPhong(id);
        if (!response.success) throw new Error(response.message);
        setPhong(response.data);
      } catch (error) {
        if (error.response?.status === 404) {
          await Swal.fire({
            icon: "error",
            title: "Không tìm thấy phòng",
            text: "Phòng bạn chọn không tồn tại hoặc không còn khả dụng.",
            confirmButtonText: "Xem danh sách phòng",
          });
          navigate("/phong");
          return;
        }
        console.error(error);
        setLoiTaiPhong("Không thể tải thông tin phòng. Vui lòng thử lại.");
      } finally {
        setDangTai(false);
      }
    };

    taiPhong();
  }, [id, navigate]);
  useEffect(() => { getDanhSachDichVu().then((r) => setDichVus(r.data || [])).catch(() => setDichVus([])); }, []);

  const soDem = useMemo(
    () => tinhSoDem(form.ngay_nhan_phong, form.ngay_tra_phong),
    [form.ngay_nhan_phong, form.ngay_tra_phong],
  );
  const dichVuDaChonDayDu = useMemo(
    () => dichVus.filter((dichVu) => dichVuDaChon.includes(dichVu.id)),
    [dichVus, dichVuDaChon],
  );
  const tienPhongDuKien = phong ? soDem * Number(phong.gia_phong) : 0;
  const tienDichVu = dichVuDaChonDayDu.reduce(
    (tong, dichVu) => tong + Number(dichVu.gia),
    0,
  );
  const tongTienDuKien = tienPhongDuKien + tienDichVu;
  const anhMacDinh = phong
    ? `/hotel-template/${((phong.id - 1) % 8) + 1}.jpg`
    : "";

  const capNhatForm = (event) => {
    const { name, value } = event.target;
    setForm((giaTriCu) => ({ ...giaTriCu, [name]: value }));
    setErrors((loiCu) => ({ ...loiCu, [name]: "" }));
  };
  const toggleDichVu = (dichVuId) => {
    setDichVuDaChon((danhSachCu) =>
      danhSachCu.includes(dichVuId)
        ? danhSachCu.filter((idDaChon) => idDaChon !== dichVuId)
        : [...danhSachCu, dichVuId],
    );
  };

  const validate = () => {
    const loiMoi = {};
    if (!form.ten_khach_hang.trim())
      loiMoi.ten_khach_hang = "Vui lòng nhập họ và tên.";
    if (!form.email_khach_hang.trim())
      loiMoi.email_khach_hang = "Vui lòng nhập email.";
    else if (!/^\S+@\S+\.\S+$/.test(form.email_khach_hang))
      loiMoi.email_khach_hang = "Email không đúng định dạng.";
    if (!form.so_dien_thoai.trim())
      loiMoi.so_dien_thoai = "Vui lòng nhập số điện thoại.";
    if (!form.ngay_nhan_phong)
      loiMoi.ngay_nhan_phong = "Vui lòng chọn ngày nhận phòng.";
    if (!form.ngay_tra_phong)
      loiMoi.ngay_tra_phong = "Vui lòng chọn ngày trả phòng.";
    else if (
      form.ngay_nhan_phong &&
      form.ngay_tra_phong <= form.ngay_nhan_phong
    )
      loiMoi.ngay_tra_phong = "Ngày trả phòng phải sau ngày nhận phòng.";
    if (Number(form.so_luong_khach) < 1)
      loiMoi.so_luong_khach = "Số lượng khách phải ít nhất là 1.";
    if (phong && Number(form.so_luong_khach) > phong.so_nguoi_toi_da)
      loiMoi.so_luong_khach =
        "Số lượng khách vượt quá sức chứa tối đa của phòng.";
    if (!form.phuong_thuc_thanh_toan)
      loiMoi.phuong_thuc_thanh_toan = "Vui lòng chọn phương thức thanh toán.";
    setErrors(loiMoi);
    return Object.keys(loiMoi).length === 0;
  };

  const guiDatPhong = async (event) => {
    event.preventDefault();
    if (!phong || !validate()) return;

    try {
      setDangGui(true);
      const response = await postDatPhong({
        phong_id: phong.id,
        ten_khach_hang: form.ten_khach_hang.trim(),
        email_khach_hang: form.email_khach_hang.trim(),
        so_dien_thoai: form.so_dien_thoai.trim(),
        ngay_nhan_phong: form.ngay_nhan_phong,
        ngay_tra_phong: form.ngay_tra_phong,
        so_luong_khach: Number(form.so_luong_khach),
        ghi_chu: form.ghi_chu.trim() || null,
        phuong_thuc_thanh_toan: form.phuong_thuc_thanh_toan,
        dich_vu_ids: dichVuDaChon,
      });

      if (!response.success) throw new Error(response.message);
      await Swal.fire({
        icon: "success",
        title: "Đặt phòng thành công",
        html: `<div>Mã đặt phòng: <strong>${response.data.ma_dat_phong}</strong></div><div>Phương thức: <strong>${response.data.thanh_toan?.phuong_thuc_hien_thi || "Thanh toán tại khách sạn"}</strong></div><div>Trạng thái: <strong>${response.data.thanh_toan?.trang_thai_hien_thi || "Chưa thanh toán"}</strong></div>`,
        confirmButtonText: "Xem thông tin đặt phòng",
        allowOutsideClick: false,
        allowEscapeKey: false,
      });
      navigate("/dat-phong-thanh-cong", { state: response.data });
    } catch (error) {
      const phanHoi = error.response?.data;
      if (error.response?.status === 409) {
        await Swal.fire({
          icon: "warning",
          title: "Phòng không còn trống",
          text:
            phanHoi?.message ||
            "Phòng đã được đặt trong khoảng thời gian này. Vui lòng chọn phòng khác.",
          confirmButtonText: "Chọn lại thời gian",
        });
        // navigate("/");
      } else if (error.response?.status === 404) {
        await Swal.fire({
          icon: "error",
          title: "Không tìm thấy phòng",
          text: "Phòng bạn chọn không tồn tại hoặc không còn khả dụng.",
          confirmButtonText: "Xem danh sách phòng",
        });
        navigate("/phong");
      } else if (error.response?.status === 422 && phanHoi?.errors) {
        const loiApi = Object.fromEntries(
          Object.entries(phanHoi.errors).map(([field, messages]) => [
            field,
            messages[0],
          ]),
        );
        setErrors(loiApi);
      } else if (error.response?.status === 422) {
        await Swal.fire({
          icon: "warning",
          title: "Không thể đặt phòng",
          text: phanHoi?.message || "Không thể đặt phòng.",
          confirmButtonText: "Đồng ý",
        });
      } else {
        console.error(error);
        await Swal.fire({
          icon: "error",
          title: "Đã xảy ra lỗi",
          text: "Không thể đặt phòng. Vui lòng thử lại.",
          confirmButtonText: "Đồng ý",
        });
      }
    } finally {
      setDangGui(false);
    }
  };

  if (dangTai)
    return (
      <>
        <Header />
        <main className="rooms-section py-5 min-vh-100">
          <div className="text-center py-5">
            <div className="spinner-border text-brand" role="status" />
            <p className="mt-3">Đang tải thông tin phòng...</p>
          </div>
        </main>
        <Footer />
      </>
    );
  if (loiTaiPhong)
    return (
      <>
        <Header />
        <main className="rooms-section py-5 min-vh-100">
          <div className="container">
            <div className="alert alert-danger">{loiTaiPhong}</div>
            <Link className="btn btn-brand" to="/phong">
              Quay lại danh sách phòng
            </Link>
          </div>
        </main>
        <Footer />
      </>
    );
  if (!phong) return null;

  return (
    <>
      <Header />
      <main className="rooms-section py-5">
        <div className="container">
          <div className="booking-page-head">
            <p className="section-kicker">HOÀN TẤT ĐẶT PHÒNG</p>
            <h1>Xác nhận thông tin lưu trú</h1>
            <p>Vui lòng kiểm tra thông tin trước khi xác nhận đặt phòng.</p>
          </div>
          <div className="row g-4">
            <div className="col-lg-7 order-lg-1 order-2">
              <form
                className="booking-form-checkout"
                onSubmit={guiDatPhong}
                noValidate
              >
                <section className="booking-section">
                  <span className="booking-step">01</span>
                  <h2>Thông tin khách hàng</h2>
                  <div className="row g-3 mb-0">
                    <div className="col-12">
                      <label className="form-label" htmlFor="ten_khach_hang">
                        Họ và tên
                      </label>
                      <input
                        id="ten_khach_hang"
                        name="ten_khach_hang"
                        className={`form-control ${errors.ten_khach_hang ? "is-invalid" : ""}`}
                        value={form.ten_khach_hang}
                        onChange={capNhatForm}
                      />
                      {errors.ten_khach_hang && (
                        <div className="invalid-feedback">
                          {errors.ten_khach_hang}
                        </div>
                      )}
                    </div>
                    <div className="col-md-6">
                      <label className="form-label" htmlFor="email_khach_hang">
                        Email
                      </label>
                      <input
                        id="email_khach_hang"
                        name="email_khach_hang"
                        className={`form-control ${errors.email_khach_hang ? "is-invalid" : ""}`}
                        type="email"
                        value={form.email_khach_hang}
                        onChange={capNhatForm}
                      />
                      {errors.email_khach_hang && (
                        <div className="invalid-feedback">
                          {errors.email_khach_hang}
                        </div>
                      )}
                    </div>
                    <div className="col-md-6">
                      <label className="form-label" htmlFor="so_dien_thoai">
                        Số điện thoại
                      </label>
                      <input
                        id="so_dien_thoai"
                        name="so_dien_thoai"
                        className={`form-control ${errors.so_dien_thoai ? "is-invalid" : ""}`}
                        value={form.so_dien_thoai}
                        onChange={capNhatForm}
                      />
                      {errors.so_dien_thoai && (
                        <div className="invalid-feedback">
                          {errors.so_dien_thoai}
                        </div>
                      )}
                    </div>
                  </div>
                </section>
                <section className="booking-section">
                  <span className="booking-step">02</span>
                  <h2>Thông tin lưu trú</h2>
                  <div className="row g-3 mb-4">
                    <div className="col-md-6">
                      <label className="form-label" htmlFor="ngay_nhan_phong">
                        Ngày nhận phòng
                      </label>
                      <input
                        id="ngay_nhan_phong"
                        name="ngay_nhan_phong"
                        className={`form-control ${errors.ngay_nhan_phong ? "is-invalid" : ""}`}
                        type="date"
                        min={ngayHienTai}
                        value={form.ngay_nhan_phong}
                        onChange={capNhatForm}
                      />
                      {errors.ngay_nhan_phong && (
                        <div className="invalid-feedback">
                          {errors.ngay_nhan_phong}
                        </div>
                      )}
                    </div>
                    <div className="col-md-6">
                      <label className="form-label" htmlFor="ngay_tra_phong">
                        Ngày trả phòng
                      </label>
                      <input
                        id="ngay_tra_phong"
                        name="ngay_tra_phong"
                        className={`form-control ${errors.ngay_tra_phong ? "is-invalid" : ""}`}
                        type="date"
                        min={form.ngay_nhan_phong || ngayHienTai}
                        value={form.ngay_tra_phong}
                        onChange={capNhatForm}
                      />
                      {errors.ngay_tra_phong && (
                        <div className="invalid-feedback">
                          {errors.ngay_tra_phong}
                        </div>
                      )}
                    </div>
                    <div className="col-md-6">
                      <label className="form-label" htmlFor="so_luong_khach">
                        Số lượng khách
                      </label>
                      <input
                        id="so_luong_khach"
                        name="so_luong_khach"
                        className={`form-control ${errors.so_luong_khach ? "is-invalid" : ""}`}
                        type="number"
                        min="1"
                        max={phong.so_nguoi_toi_da}
                        value={form.so_luong_khach}
                        onChange={capNhatForm}
                      />
                      {errors.so_luong_khach && (
                        <div className="invalid-feedback">
                          {errors.so_luong_khach}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="mt-3">
                    <label className="form-label" htmlFor="ghi_chu">
                      Ghi chú
                    </label>
                    <textarea
                      id="ghi_chu"
                      name="ghi_chu"
                      className={`form-control ${errors.ghi_chu ? "is-invalid" : ""}`}
                      rows="3"
                      value={form.ghi_chu}
                      onChange={capNhatForm}
                    />
                    {errors.ghi_chu && (
                      <div className="invalid-feedback">{errors.ghi_chu}</div>
                    )}
                  </div>
                </section>
                <section className="booking-section">
                  <span className="booking-step">03</span><h2>Dịch vụ bổ sung</h2>
                  {dichVus.length === 0 ? <p>Hiện chưa có dịch vụ bổ sung.</p> : <div className="booking-service-options">{dichVus.map((dichVu) => {
                    const daChon = dichVuDaChon.includes(dichVu.id);
                    return <label className={`booking-service-option ${daChon ? "is-selected" : ""}`} key={dichVu.id}>
                      <input className="booking-service-checkbox" type="checkbox" checked={daChon} onChange={() => toggleDichVu(dichVu.id)} />
                      <span className="booking-service-checkmark" aria-hidden="true">✓</span>
                      <span className="booking-service-content"><strong>{dichVu.ten_dich_vu}</strong><small>{dichVu.mo_ta || "Dịch vụ tiện ích"}</small></span>
                      <b>{dinhDangTien.format(dichVu.gia)} VNĐ</b>
                    </label>;
                  })}</div>}
                </section>
                <section className="booking-section">
                  <span className="booking-step">04</span>
                  <h2>Phương thức thanh toán</h2>
                  <div
                    className={`payment-option mb-4 ${errors.phuong_thuc_thanh_toan ? "border border-danger" : ""}`}
                  >
                    <div className="form-check mb-1">
                      <input
                        className="form-check-input"
                        id="tai_khach_san"
                        name="phuong_thuc_thanh_toan"
                        type="radio"
                        value="tai_khach_san"
                        checked={
                          form.phuong_thuc_thanh_toan === "tai_khach_san"
                        }
                        onChange={capNhatForm}
                      />
                      <label
                        className="form-check-label fw-semibold"
                        htmlFor="tai_khach_san"
                      >
                        Thanh toán tại khách sạn
                      </label>
                    </div>
                    <p className="mb-0 text-secondary">
                      Bạn sẽ thanh toán trực tiếp khi nhận phòng tại khách sạn.
                    </p>
                    {errors.phuong_thuc_thanh_toan && (
                      <div className="text-danger small mt-2">
                        {errors.phuong_thuc_thanh_toan}
                      </div>
                    )}
                  </div>
                </section>
                <button
                  className="btn btn-brand booking-submit"
                  type="submit"
                  disabled={dangGui}
                >
                  {dangGui && (
                    <span
                      className="spinner-border spinner-border-sm me-2"
                      role="status"
                    />
                  )}{" "}
                  {dangGui ? "Đang xử lý..." : "Xác nhận đặt phòng"}
                </button>
              </form>
            </div>
            <div className="col-lg-5 order-lg-2 order-1">
              <aside className="booking-summary">
                <p className="section-kicker">TÓM TẮT ĐẶT PHÒNG</p>
                <img
                  className="booking-room-image"
                  src={phong.hinh_anh || anhMacDinh}
                  alt={phong.ten_phong}
                />
                <h2>{phong.ten_phong}</h2>
                <p>
                  Phòng {phong.so_phong} · {phong.so_nguoi_toi_da} khách
                </p>
                <div className="summary-line">
                  <span>Số đêm</span>
                  <b>{soDem} đêm</b>
                </div>
                <div className="summary-line">
                  <span>Giá / đêm</span>
                  <b>{dinhDangTien.format(phong.gia_phong)} VNĐ</b>
                </div>
                <div className="booking-summary-services">
                  <span>Dịch vụ bổ sung</span>
                  {dichVuDaChonDayDu.length === 0 ? <small>Chưa chọn dịch vụ</small> : dichVuDaChonDayDu.map((dichVu) => <div key={dichVu.id}><em>{dichVu.ten_dich_vu}</em><b>{dinhDangTien.format(dichVu.gia)} VNĐ</b></div>)}
                </div>
                <div className="summary-line">
                  <span>Tiền phòng</span>
                  <b>{dinhDangTien.format(tienPhongDuKien)} VNĐ</b>
                </div>
                <div className="summary-line">
                  <span>Tiền dịch vụ</span>
                  <b>{dinhDangTien.format(tienDichVu)} VNĐ</b>
                </div>
                <div className="summary-total">
                  <span>TỔNG THANH TOÁN</span>
                  <strong>{dinhDangTien.format(tongTienDuKien)} VNĐ</strong>
                </div>
              </aside>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

export default DatPhong;
