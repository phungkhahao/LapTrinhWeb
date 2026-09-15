import { useCallback, useEffect, useState } from "react";
import Swal from "sweetalert2";
import AdminLayout from "../../components/admin/AdminLayout";
import AdminIcon from "../../components/admin/AdminIcon";
import {
  getAdminNguoiDung,
  putTrangThaiAdminNguoiDung,
} from "../../api/hotel_booking_api";
import { formatDate } from "../../utils/format";
import "../../styles/admin-phong.css";

export default function AdminNguoiDung() {
  const [data, setData] = useState([]);
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const load = useCallback(
    async (nextPage = 1) => {
      try {
        setLoading(true);
        const r = await getAdminNguoiDung({ tim_kiem: q, page: nextPage });
        if (!r.success) throw new Error(r.message);
        setData(r.data || []);
        setMeta(r.pagination);
        setPage(nextPage);
      } catch (e) {
        await Swal.fire({
          icon: "error",
          title: "Không thể tải người dùng",
          text: e.response?.data?.message || e.message,
        });
      } finally {
        setLoading(false);
      }
    },
    [q],
  );
  useEffect(() => {
    load(1);
  }, [load]);
  const toggle = async (u) => {
    const status = u.trang_thai === "hoat_dong" ? "bi_khoa" : "hoat_dong";
    const ok = await Swal.fire({
      icon: "warning",
      title: status === "bi_khoa" ? "Khóa tài khoản?" : "Mở khóa tài khoản?",
      showCancelButton: true,
      confirmButtonText: "Xác nhận",
      cancelButtonText: "Không",
    });
    if (!ok.isConfirmed) return;
    try {
      const r = await putTrangThaiAdminNguoiDung(u.id, { trang_thai: status });
      if (!r.success) throw new Error(r.message);
      await Swal.fire({ icon: "success", title: r.message });
      load();
    } catch (e) {
      await Swal.fire({
        icon: "error",
        title: "Không thể cập nhật",
        text: e.response?.data?.message || e.message,
      });
    }
  };
  return (
    <AdminLayout title="Quản lý người dùng" activeMenu="nguoi-dung">
      <main className="admin-content">
        <div className="admin-intro admin-room-intro">
          <div>
            <p className="section-kicker">TÀI KHOẢN</p>
            <h2>Quản lý người dùng</h2>
            <p>
              Khóa hoặc mở khóa tài khoản, không xóa người dùng có lịch sử đặt
              phòng.
            </p>
          </div>
        </div>
        <div className="admin-room-toolbar">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Tìm tên, email, số điện thoại..."
          />
          <button onClick={() => load(1)}>Tìm kiếm</button>
        </div>
        {loading ? (
          <div className="admin-room-loading">Đang tải...</div>
        ) : (
          <>
            <div className="admin-table-wrap">
              <table className="admin-room-table">
                <thead>
                  <tr>
                    <th>Người dùng</th>
                    <th>Liên hệ</th>
                    <th>Vai trò</th>
                    <th>Booking</th>
                    <th>Ngày tạo</th>
                    <th>Trạng thái</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((u) => (
                    <tr key={u.id}>
                      <td>
                        <strong>{u.ho_ten}</strong>
                      </td>
                      <td>
                        {u.email}
                        <br />
                        <small>{u.so_dien_thoai || "—"}</small>
                      </td>
                      <td>
                        {u.vai_tro === "admin" ? "Quản trị viên" : "Khách hàng"}
                      </td>
                      <td>{u.so_luong_dat_phong}</td>
                      <td>{formatDate(u.created_at)}</td>
                      <td>
                        <span
                          className={
                            u.trang_thai === "hoat_dong"
                              ? "admin-room-status"
                              : "admin-room-status admin-room-status-inactive"
                          }
                        >
                          {u.trang_thai === "hoat_dong"
                            ? "Hoạt động"
                            : "Đã khóa"}
                        </span>
                      </td>
                      <td>
                        <div className="admin-room-actions">
                          <button
                            className={
                              u.trang_thai === "hoat_dong"
                                ? "admin-icon-button icon-red"
                                : "admin-icon-button icon-green"
                            }
                            title={
                              u.trang_thai === "hoat_dong"
                                ? "Khóa tài khoản"
                                : "Mở khóa tài khoản"
                            }
                            onClick={() => toggle(u)}
                          >
                            <AdminIcon
                              name={
                                u.trang_thai === "hoat_dong" ? "pause" : "play"
                              }
                            />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {meta?.last_page > 1 && (
              <div className="admin-pagination">
                <button disabled={page <= 1} onClick={() => load(page - 1)}>
                  ← Trước
                </button>
                <span>
                  Trang {meta.current_page}/{meta.last_page}
                </span>
                <button
                  disabled={page >= meta.last_page}
                  onClick={() => load(page + 1)}
                >
                  Sau →
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </AdminLayout>
  );
}
