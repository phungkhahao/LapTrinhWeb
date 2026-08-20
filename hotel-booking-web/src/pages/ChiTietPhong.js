import { useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import Footer from "../components/Footer";
import Header from "../components/Header";
import { getChiTietPhong } from "../api/hotel_booking_api";

const dinhDangTien = new Intl.NumberFormat("vi-VN");

function ChiTietPhong() {
  const { id } = useParams();
  const location = useLocation();
  const [phong, setPhong] = useState(null);
  const [dangTai, setDangTai] = useState(true);
  const [loi, setLoi] = useState(null);

  useEffect(() => {
    const loadChiTietPhong = async () => {
      try {
        setDangTai(true);
        setLoi(null);
        const response = await getChiTietPhong(id);
        if (!response.success) throw new Error(response.message);
        setPhong(response.data);
      } catch (error) {
        if (error.response?.status === 404) {
          setLoi("Không tìm thấy phòng.");
        } else {
          console.error(error);
          setLoi("Không thể tải dữ liệu.");
        }
      } finally {
        setDangTai(false);
      }
    };

    loadChiTietPhong();
  }, [id]);

  const anhMacDinh = phong
    ? `/hotel-template/${((phong.id - 1) % 8) + 1}.jpg`
    : "";

  return (
    <>
      <Header />
      <main className="rooms-section py-5 min-vh-100">
        <div className="container">
          {dangTai && (
            <div className="text-center py-5">
              <div className="spinner-border text-brand" role="status" />
              <p className="mt-3">Đang tải dữ liệu...</p>
            </div>
          )}
          {loi && (
            <div className="detail-error text-center">
              <div className="alert alert-danger">{loi}</div>
              <Link className="btn btn-brand" to="/phong">
                Quay lại danh sách phòng
              </Link>
            </div>
          )}
          {!dangTai && !loi && phong && (
            <article className="room-detail room-detail-luxury">
              <div className="row g-0">
                <div className="col-lg-6">
                  <img
                    className="detail-image"
                    src={phong.hinh_anh || anhMacDinh}
                    alt={phong.ten_phong}
                  />
                </div>
                <div className="col-lg-6 room-detail-info p-4 p-lg-5">
                  <p className="section-kicker">
                    KHÔNG GIAN NGHỈ DƯỠNG · PHÒNG {phong.so_phong}
                  </p>
                  <h1>{phong.ten_phong}</h1>
                  <p className="room-price">
                    {dinhDangTien.format(phong.gia_phong)} VNĐ{" "}
                    <small>/ đêm</small>
                  </p>
                  <div className="detail-meta">
                    <span>
                      <small>SỨC CHỨA</small>
                      <strong>Tối đa {phong.so_nguoi_toi_da} người</strong>
                    </span>
                    <span>
                      <small>TRẠNG THÁI</small>
                      {phong.trang_thai === "trong" ? (
                        <b className="text-success">Sẵn sàng đón khách</b>
                      ) : (
                        <b>{phong.trang_thai}</b>
                      )}
                    </span>
                  </div>
                  <p>
                    {phong.mo_ta ||
                      "Không gian nghỉ dưỡng thoải mái với đầy đủ tiện nghi cơ bản."}
                  </p>
                  <div className="detail-actions">
                    <Link
                      className="btn detail-cta detail-cta-primary"
                      to={`/dat-phong/${phong.id}${location.search}`}
                    >
                      Đặt phòng ngay
                    </Link>
                    <Link
                      className="btn detail-cta detail-cta-secondary"
                      to="/phong"
                    >
                      Quay lại
                    </Link>
                  </div>
                </div>
              </div>
            </article>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}

export default ChiTietPhong;
