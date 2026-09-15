import { useCallback, useEffect, useState } from "react";
import Swal from "sweetalert2";
import {
  getAdminDatPhong,
  getChiTietAdminDatPhong,
  putHuyAdminDatPhong,
  putXacNhanAdminDatPhong,
  putXacNhanThanhToanAdmin,
} from "../../api/hotel_booking_api";
import AdminLayout from "../../components/admin/AdminLayout";
import AdminIcon from "../../components/admin/AdminIcon";
import ReactSelect from "../../components/ReactSelect";
import AdminPagination from "../../components/admin/AdminPagination";
import { formatDate, formatDateTime } from "../../utils/format";
import "../../styles/admin-phong.css";

const tien = new Intl.NumberFormat("vi-VN");
const bookingText = {
  cho_xac_nhan: "Chờ xác nhận",
  da_xac_nhan: "Đã xác nhận",
  da_huy: "Đã hủy",
};
const paymentText = {
  chua_thanh_toan: "Chưa thanh toán",
  da_thanh_toan: "Đã thanh toán",
};
const loiTuApi = (e) =>
  e.response?.data?.message || e.message || "Vui lòng thử lại.";

function AdminDatPhong() {
  const [danhSach, setDanhSach] = useState([]);
  const [timKiem, setTimKiem] = useState("");
  const [trangThai, setTrangThai] = useState("");
  const [thanhToan, setThanhToan] = useState("");
  const [dangTai, setDangTai] = useState(true);
  const [loi, setLoi] = useState("");
  const [chiTiet, setChiTiet] = useState(null);
  const [dangTaiChiTiet, setDangTaiChiTiet] = useState(false);
  const [pagination, setPagination] = useState(null);
  const taiDanhSach = useCallback(async (page = 1) => {
    try {
      setDangTai(true);
      setLoi("");
      const r = await getAdminDatPhong({
        tim_kiem: timKiem,
        trang_thai: trangThai,
        trang_thai_thanh_toan: thanhToan,
        page,
      });
      if (!r.success) throw new Error(r.message);
      setDanhSach(r.data || []);
      setPagination(r.pagination || null);
    } catch (e) {
      setLoi(loiTuApi(e));
    } finally {
      setDangTai(false);
    }
  }, [timKiem, trangThai, thanhToan]);
  useEffect(() => {
    taiDanhSach(1);
  }, [taiDanhSach]);
  const xemChiTiet = async (id) => {
    try {
      setDangTaiChiTiet(true);
      setChiTiet({ dang_tai: true });
      const r = await getChiTietAdminDatPhong(id);
      if (!r.success) throw new Error(r.message);
      setChiTiet(r.data);
    } catch (e) {
      await Swal.fire({
        icon: "error",
        title: "Không thể tải chi tiết",
        text: loiTuApi(e),
        confirmButtonText: "Đã hiểu",
      });
      setChiTiet(null);
    } finally {
      setDangTaiChiTiet(false);
    }
  };
  const action = async (item, loai) => {
    const config = {
      xac_nhan: [
        "Xác nhận đặt phòng?",
        "Đặt phòng sẽ chuyển sang trạng thái đã xác nhận.",
        putXacNhanAdminDatPhong,
        "Xác nhận đặt phòng thành công.",
      ],
      huy: [
        "Hủy đặt phòng?",
        "Đặt phòng sẽ được chuyển sang trạng thái đã hủy.",
        putHuyAdminDatPhong,
        "Hủy đặt phòng thành công.",
      ],
      thanh_toan: [
        "Xác nhận đã thu tiền?",
        "Thanh toán tại khách sạn sẽ chuyển sang đã thanh toán.",
        putXacNhanThanhToanAdmin,
        "Xác nhận thanh toán thành công.",
      ],
    }[loai];
    const xacNhan = await Swal.fire({
      icon: "warning",
      title: config[0],
      text: config[1],
      showCancelButton: true,
      confirmButtonText: loai === "huy" ? "Xác nhận hủy" : "Xác nhận",
      cancelButtonText: "Không",
    });
    if (!xacNhan.isConfirmed) return;
    try {
      const r = await config[2](item.id);
      if (!r.success) throw new Error(r.message);
      await Swal.fire({
        icon: "success",
        title: config[3],
        confirmButtonText: "Đã hiểu",
      });
      await taiDanhSach();
      if (chiTiet?.id === item.id) setChiTiet(r.data);
    } catch (e) {
      await Swal.fire({
        icon: "error",
        title: "Không thể cập nhật",
        text: loiTuApi(e),
        confirmButtonText: "Đã hiểu",
      });
    }
  };
  const badgeBooking = (v) => (
    <span className={`admin-booking-badge status-${v}`}>
      {bookingText[v] || v}
    </span>
  );
  const badgePayment = (v) => (
    <span className={`admin-booking-badge payment-${v}`}>
      {paymentText[v] || v || "Chưa có"}
    </span>
  );
  const actions = (item) => (
    <div className="admin-booking-actions">
      <button
        type="button"
        className="admin-icon-button icon-navy"
        title="Xem chi tiết"
        aria-label="Xem chi tiết"
        onClick={() => xemChiTiet(item.id)}
      >
        <AdminIcon name="eye" />
      </button>
      {item.trang_thai === "cho_xac_nhan" && (
        <button
          type="button"
          className="admin-icon-button icon-green"
          title="Xác nhận đặt phòng"
          aria-label="Xác nhận đặt phòng"
          onClick={() => action(item, "xac_nhan")}
        >
          <AdminIcon name="check" />
        </button>
      )}
      {item.trang_thai !== "da_huy" && (
        <button
          type="button"
          className="admin-icon-button icon-red"
          title="Hủy đặt phòng"
          aria-label="Hủy đặt phòng"
          onClick={() => action(item, "huy")}
        >
          <AdminIcon name="close" />
        </button>
      )}
      {item.trang_thai !== "da_huy" &&
        item.phuong_thuc_thanh_toan === "tai_khach_san" &&
        item.trang_thai_thanh_toan === "chua_thanh_toan" && (
          <button
            type="button"
            className="admin-icon-button icon-gold"
            title="Xác nhận thanh toán"
            aria-label="Xác nhận thanh toán"
            onClick={() => action(item, "thanh_toan")}
          >
            <AdminIcon name="money" />
          </button>
        )}
    </div>
  );
  const phanTrangView = AdminPagination({ pagination, onPageChange: taiDanhSach });
  return (
    <AdminLayout title="Quản lý đặt phòng" activeMenu="dat-phong">
      <main className="admin-content">
        <div className="admin-intro admin-room-intro">
          <div>
            <p className="section-kicker">DANH SÁCH ĐẶT PHÒNG</p>
            <h2>Quản lý đặt phòng</h2>
            <p>Theo dõi, xác nhận booking và thanh toán tại khách sạn.</p>
          </div>
        </div>
        <div className="admin-booking-toolbar">
          <input
            value={timKiem}
            onChange={(e) => setTimKiem(e.target.value)}
            placeholder="Mã, tên khách, email, số điện thoại..."
          />
          <ReactSelect
            value={trangThai}
            onChange={setTrangThai}
            placeholder="Tất cả trạng thái booking"
            isClearable
            options={[
              { value: "cho_xac_nhan", label: "Chờ xác nhận" },
              { value: "da_xac_nhan", label: "Đã xác nhận" },
              { value: "da_huy", label: "Đã hủy" },
            ]}
          />
          <ReactSelect
            value={thanhToan}
            onChange={setThanhToan}
            placeholder="Tất cả thanh toán"
            isClearable
            options={[
              { value: "chua_thanh_toan", label: "Chưa thanh toán" },
              { value: "da_thanh_toan", label: "Đã thanh toán" },
            ]}
          />
          <button type="button" onClick={taiDanhSach}>
            Tìm kiếm
          </button>
        </div>
        {dangTai && (
          <div className="admin-room-loading">
            Đang tải danh sách đặt phòng...
          </div>
        )}
        {loi && (
          <div className="admin-error">
            <strong>Không thể tải danh sách đặt phòng</strong>
            <p>{loi}</p>
            <button type="button" onClick={taiDanhSach}>
              Thử lại
            </button>
          </div>
        )}
        {!dangTai && !loi && (
          <>
            <div className="admin-table-wrap admin-booking-table-wrap">
              <table className="admin-room-table admin-booking-table">
                <colgroup>
                  <col style={{ width: "240px" }} />
                  <col style={{ width: "240px" }} />
                  <col style={{ width: "180px" }} />
                  <col style={{ width: "155px" }} />
                  <col style={{ width: "145px" }} />
                  <col style={{ width: "150px" }} />
                  <col style={{ width: "150px" }} />
                  <col style={{ width: "190px" }} />
                </colgroup>
                <thead>
                  <tr>
                    <th>Mã</th>
                    <th>Khách hàng</th>
                    <th>Phòng</th>
                    <th>Nhận / Trả</th>
                    <th>Tổng tiền</th>
                    <th>Đặt phòng</th>
                    <th>Thanh toán</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {danhSach.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="admin-table-empty">
                        Chưa có đặt phòng phù hợp.
                      </td>
                    </tr>
                  ) : (
                    danhSach.map((item) => (
                      <tr key={item.id}>
                        <td
                          className="admin-booking-code"
                          title={item.ma_dat_phong}
                        >
                          <span className="admin-cell-clamp">
                            {item.ma_dat_phong}
                          </span>
                        </td>
                        <td className="admin-customer-cell">
                          <strong>{item.ten_khach_hang}</strong>
                          <small title={item.email_khach_hang}>
                            {item.email_khach_hang}
                          </small>
                          <small>{item.so_dien_thoai}</small>
                        </td>
                        <td>
                          <span className="admin-cell-clamp">
                            {item.ten_phong || `Phòng ${item.so_phong}`}
                          </span>
                        </td>
                        <td className="admin-date-cell">
                          {formatDate(item.ngay_nhan_phong)}
                          <br />
                          {formatDate(item.ngay_tra_phong)}
                        </td>
                        <td className="admin-money">
                          <span className="admin-cell-nowrap">
                            {tien.format(item.tong_tien)} VNĐ
                          </span>
                        </td>
                        <td>{badgeBooking(item.trang_thai)}</td>
                        <td>{badgePayment(item.trang_thai_thanh_toan)}</td>
                        <td>{actions(item)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <div className="admin-booking-cards">
              {danhSach.map((item) => (
                <article className="admin-booking-card" key={item.id}>
                  <div>
                    <strong title={item.ma_dat_phong}>
                      {item.ma_dat_phong}
                    </strong>
                    {badgeBooking(item.trang_thai)}
                  </div>
                  <h3>{item.ten_khach_hang}</h3>
                  <p>{item.ten_phong || `Phòng ${item.so_phong}`}</p>
                  <p>
                    {formatDate(item.ngay_nhan_phong)} →{" "}
                    {formatDate(item.ngay_tra_phong)}
                  </p>
                  <b>{tien.format(item.tong_tien)} VNĐ</b>
                  <div>{badgePayment(item.trang_thai_thanh_toan)}</div>
                  {actions(item)}
                </article>
              ))}
            </div>
          </>
        )}
        {!dangTai && !loi && phanTrangView}
      </main>
      {chiTiet && (
        <div className="admin-modal-backdrop">
          <section
            className="admin-room-modal admin-booking-modal"
            role="dialog"
            aria-modal="true"
          >
            <div className="admin-modal-head">
              <div>
                <p className="section-kicker">CHI TIẾT ĐẶT PHÒNG</p>
                <h2>
                  {chiTiet.dang_tai ? "Đang tải..." : chiTiet.ma_dat_phong}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setChiTiet(null)}
                aria-label="Đóng"
              >
                ×
              </button>
            </div>
            {dangTaiChiTiet || chiTiet.dang_tai ? (
              <div className="admin-room-loading">Đang tải chi tiết...</div>
            ) : (
              <div className="admin-booking-detail">
                <section>
                  <h3>Khách hàng</h3>
                  <p>
                    <b>{chiTiet.ten_khach_hang}</b>
                    <br />
                    {chiTiet.email_khach_hang}
                    <br />
                    {chiTiet.so_dien_thoai}
                  </p>
                </section>
                <section>
                  <h3>Phòng & lưu trú</h3>
                  <p>
                    <b>{chiTiet.ten_phong || `Phòng ${chiTiet.so_phong}`}</b>
                    <br />
                    {formatDate(chiTiet.ngay_nhan_phong)} →{" "}
                    {formatDate(chiTiet.ngay_tra_phong)}
                    <br />
                    {chiTiet.so_dem} đêm · {chiTiet.so_luong_khach} khách
                  </p>
                </section>
                <section className="admin-payment-card">
                  <h3>Thanh toán</h3>
                  <p>
                    Phương thức: <b>Thanh toán tại khách sạn</b>
                    <br />
                    {badgePayment(chiTiet.trang_thai_thanh_toan)}
                    <br />
                    {chiTiet.thoi_gian_thanh_toan
                      ? `Đã thu: ${formatDateTime(chiTiet.thoi_gian_thanh_toan)}`
                      : "Chưa thu tiền"}
                  </p>
                </section>
                <section className="admin-detail-full admin-booking-services">
                  <h3>Dịch vụ bổ sung</h3>
                  {(chiTiet.dich_vu || []).length === 0 ? (
                    <p>Không sử dụng dịch vụ bổ sung.</p>
                  ) : (
                    <div className="admin-service-lines">
                      {chiTiet.dich_vu.map((dichVu) => (
                        <div key={dichVu.dich_vu_id}>
                          <strong>{dichVu.ten_dich_vu || "Dịch vụ đã chọn"}</strong>
                          <span>{dichVu.so_luong} × {tien.format(dichVu.don_gia)} VNĐ</span>
                          <b>{tien.format(dichVu.thanh_tien)} VNĐ</b>
                        </div>
                      ))}
                    </div>
                  )}
                </section>
                <section>
                  <h3>Tổng thanh toán</h3>
                  <p className="admin-detail-breakdown">Tiền phòng <b>{tien.format(chiTiet.tien_phong ?? chiTiet.tong_tien)} VNĐ</b><br />Tiền dịch vụ <b>{tien.format(chiTiet.tien_dich_vu || 0)} VNĐ</b></p>
                  <strong className="admin-detail-money">
                    {tien.format(chiTiet.tong_tien)} VNĐ
                  </strong>
                  <p>{badgeBooking(chiTiet.trang_thai)}</p>
                </section>
                <section className="admin-detail-full">
                  <h3>Ghi chú</h3>
                  <p>{chiTiet.ghi_chu || "Không có ghi chú."}</p>
                </section>
              </div>
            )}
          </section>
        </div>
      )}
    </AdminLayout>
  );
}

export default AdminDatPhong;
