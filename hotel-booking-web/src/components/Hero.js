import { useEffect, useState } from "react";
import {
  getDanhSachLoaiPhong,
  getTimPhongTrong,
} from "../api/hotel_booking_api";
import ReactSelect from "./ReactSelect";

const ngayHienTai = new Date().toISOString().slice(0, 10);

function Hero({ onKetQuaTimKiem }) {
  const [ngayNhanPhong, setNgayNhanPhong] = useState("");
  const [ngayTraPhong, setNgayTraPhong] = useState("");
  const [soLuongKhach, setSoLuongKhach] = useState(1);
  const [loaiPhongId, setLoaiPhongId] = useState("");
  const [danhSachLoaiPhong, setDanhSachLoaiPhong] = useState([]);
  const [loi, setLoi] = useState("");
  const [dangTim, setDangTim] = useState(false);

  useEffect(() => {
    const taiLoaiPhong = async () => {
      try {
        const response = await getDanhSachLoaiPhong();
        if (!response.success) throw new Error(response.message);
        setDanhSachLoaiPhong(response.data);
      } catch (error) {
        console.error(error);
        setLoi("Không thể tải loại phòng. Vui lòng thử lại.");
      }
    };

    taiLoaiPhong();
  }, []);

  const guiForm = async (event) => {
    event.preventDefault();
    setLoi("");

    if (!ngayNhanPhong) return setLoi("Vui lòng chọn ngày nhận phòng.");
    if (!ngayTraPhong) return setLoi("Vui lòng chọn ngày trả phòng.");
    if (ngayTraPhong <= ngayNhanPhong)
      return setLoi("Ngày trả phòng phải sau ngày nhận phòng.");
    if (Number(soLuongKhach) < 1)
      return setLoi("Số lượng khách phải ít nhất là 1.");

    const duLieuTimKiem = {
      ngay_nhan_phong: ngayNhanPhong,
      ngay_tra_phong: ngayTraPhong,
      so_luong_khach: Number(soLuongKhach),
    };

    if (loaiPhongId) duLieuTimKiem.loai_phong_id = Number(loaiPhongId);

    try {
      setDangTim(true);
      const response = await getTimPhongTrong(duLieuTimKiem);
      if (!response.success) throw new Error(response.message);
      onKetQuaTimKiem({
        danhSachPhong: response.data,
        thongBao: response.message,
        duLieuTimKiem,
      });
    } catch (error) {
      console.error(error);
      const phanHoi = error.response?.data;
      const loiDauTien =
        phanHoi?.errors && Object.values(phanHoi.errors)[0]?.[0];
      setLoi(
        loiDauTien ||
          phanHoi?.message ||
          "Không thể tìm phòng. Vui lòng thử lại.",
      );
    } finally {
      setDangTim(false);
    }
  };

  return (
    <section className="hero-section" id="dau-trang">
      <div className="container hero-content">
        <div className="hero-copy">
          <p className="hero-eyebrow">TRẢI NGHIỆM NGHỈ DƯỠNG</p>
          <h1>
            Khám phá kỳ nghỉ
            <br />
            hoàn hảo dành cho bạn
          </h1>
          <p className="hero-description">
            Không gian nghỉ dưỡng tiện nghi, dịch vụ chu đáo và trải nghiệm đặt
            phòng nhanh chóng.
          </p>
          <a className="btn btn-brand hero-cta" href="#phong">
            Khám phá phòng
          </a>
        </div>
        <form className="availability-card booking-widget" onSubmit={guiForm}>
          <div className="row g-3 align-items-end">
            <div className="col-md-3">
              <label htmlFor="check-in" className="form-label">
                Ngày nhận phòng
              </label>
              <input
                id="check-in"
                className="form-control"
                type="date"
                min={ngayHienTai}
                value={ngayNhanPhong}
                onChange={(event) => setNgayNhanPhong(event.target.value)}
              />
            </div>
            <div className="col-md-3">
              <label htmlFor="check-out" className="form-label">
                Ngày trả phòng
              </label>
              <input
                id="check-out"
                className="form-control"
                type="date"
                min={ngayNhanPhong || ngayHienTai}
                value={ngayTraPhong}
                onChange={(event) => setNgayTraPhong(event.target.value)}
              />
            </div>
            <div className="col-md-2">
              <label htmlFor="guests" className="form-label">
                Số lượng khách
              </label>
              <input
                id="guests"
                className="form-control"
                type="number"
                min="1"
                value={soLuongKhach}
                onChange={(event) => setSoLuongKhach(event.target.value)}
              />
            </div>
            <div className="col-md-2">
              <label htmlFor="room-type" className="form-label">
                Loại phòng
              </label>
              <ReactSelect
                inputId="room-type"
                value={loaiPhongId}
                onChange={setLoaiPhongId}
                placeholder="Tất cả loại phòng"
                isClearable
                options={danhSachLoaiPhong.map((loaiPhong) => ({
                  value: String(loaiPhong.id),
                  label: loaiPhong.ten_loai,
                }))}
              />
            </div>
            <div className="col-md-2">
              <button
                className="btn btn-brand w-100"
                type="submit"
                disabled={dangTim}
              >
                {dangTim ? "Đang tìm phòng..." : "Tìm phòng"}
              </button>
            </div>
          </div>
          {loi && (
            <div className="alert alert-danger mt-3 mb-0" role="alert">
              {loi}
            </div>
          )}
        </form>
      </div>
    </section>
  );
}

export default Hero;
