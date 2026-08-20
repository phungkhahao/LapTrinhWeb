import { useEffect, useState } from "react";
import Footer from "../components/Footer";
import Header from "../components/Header";
import Hero from "../components/Hero";
import RoomCard from "../components/RoomCard";
import { getDanhSachPhong } from "../api/hotel_booking_api";
import { Link } from "react-router-dom";

function TrangChu() {
  const [danhSachPhong, setDanhSachPhong] = useState([]);
  const [dangTai, setDangTai] = useState(true);
  const [loi, setLoi] = useState(null);
  const [ketQuaTimKiem, setKetQuaTimKiem] = useState(null);

  const loadDanhSachPhong = async () => {
    try {
      setDangTai(true);
      setLoi(null);
      const response = await getDanhSachPhong({});

      if (!response.success) {
        throw new Error(response.message);
      }

      setDanhSachPhong(response.data);
    } catch (error) {
      console.error(error);
      setLoi("Không thể tải danh sách phòng.");
    } finally {
      setDangTai(false);
    }
  };

  useEffect(() => {
    loadDanhSachPhong();
  }, []);

  return (
    <>
      <Header />
      <Hero onKetQuaTimKiem={setKetQuaTimKiem} />
      {ketQuaTimKiem && (
        <section className="rooms-section py-5" id="ket-qua-tim-kiem">
          <div className="container">
            <div className="text-center mb-4">
              <p className="section-kicker">PHÒNG TRỐNG</p>
              <h2>Kết quả tìm kiếm</h2>
            </div>
            {ketQuaTimKiem.danhSachPhong.length === 0 ? (
              <div className="alert alert-info mb-0">
                Không tìm thấy phòng trống phù hợp với thời gian và số lượng
                khách đã chọn.
              </div>
            ) : (
              <div className="row">
                {ketQuaTimKiem.danhSachPhong.map((phong) => (
                  <RoomCard
                    key={phong.id}
                    phong={phong}
                    thongTinTimKiem={ketQuaTimKiem.duLieuTimKiem}
                  />
                ))}
              </div>
            )}
          </div>
        </section>
      )}
      <section className="intro-section py-5" id="gioi-thieu">
        <div className="container text-center">
          <p className="section-kicker">VỀ CHÚNG TÔI</p>
          <h2>Một nơi nghỉ dưỡng ấm áp và tinh tế</h2>
          <p className="lead mx-auto">
            Tận hưởng không gian thoải mái, dịch vụ chu đáo và những trải nghiệm
            đáng nhớ trong từng kỳ nghỉ.
          </p>
        </div>
      </section>
      <section className="rooms-section py-5" id="phong">
        <div className="container">
          <div className="text-center mb-4">
            <p className="section-kicker">LƯU TRÚ</p>
            <h2>Phòng nổi bật</h2>
          </div>
          {dangTai && (
            <div className="py-5 text-center">
              <div className="spinner-border text-brand" role="status" />
              <p className="mt-3">Đang tải danh sách phòng...</p>
            </div>
          )}
          {loi && <div className="alert alert-danger">{loi}</div>}
          {!dangTai && !loi && danhSachPhong.length === 0 && (
            <div className="alert alert-info">Hiện chưa có phòng.</div>
          )}
          {!dangTai && !loi && danhSachPhong.length > 0 && (
            <div className="row">
              {danhSachPhong.slice(0, 3).map((phong) => (
                <RoomCard key={phong.id} phong={phong} />
              ))}
            </div>
          )}
          {!dangTai && !loi && danhSachPhong.length > 3 && (
            <div className="text-center">
              <Link className="btn btn-brand" to="/phong">
                Xem tất cả phòng
              </Link>
            </div>
          )}
        </div>
      </section>
      <section className="services-section py-5" id="dich-vu">
        <div className="container text-center">
          <p className="section-kicker">DỊCH VỤ</p>
          <h2>Tiện nghi cho kỳ nghỉ trọn vẹn</h2>
          <div className="row mt-4 g-4">
            <div className="col-md-4">
              <div className="service-item">
                <strong>Ẩm thực</strong>
                <span>Thực đơn đa dạng, phục vụ tận tâm.</span>
              </div>
            </div>
            <div className="col-md-4">
              <div className="service-item">
                <strong>Đưa đón</strong>
                <span>Di chuyển thuận tiện và an toàn.</span>
              </div>
            </div>
            <div className="col-md-4">
              <div className="service-item">
                <strong>Giặt ủi</strong>
                <span>Chăm sóc trang phục mỗi ngày.</span>
              </div>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
}

export default TrangChu;
