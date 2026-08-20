import { useEffect, useState } from "react";
import Footer from "../components/Footer";
import Header from "../components/Header";
import RoomCard from "../components/RoomCard";
import { getDanhSachPhong } from "../api/hotel_booking_api";

function DanhSachPhong() {
  const [danhSachPhong, setDanhSachPhong] = useState([]);
  const [dangTai, setDangTai] = useState(true);
  const [loi, setLoi] = useState(null);

  const loadDanhSachPhong = async () => {
    try {
      setDangTai(true);
      setLoi(null);
      const response = await getDanhSachPhong({});
      if (!response.success) throw new Error(response.message);
      setDanhSachPhong(response.data);
    } catch (error) {
      console.error(error);
      setLoi("Không thể tải dữ liệu.");
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
      <main className="rooms-section py-5 min-vh-100">
        <div className="container">
          <div className="page-banner">
            <p className="section-kicker">PHÒNG & SUITE</p>
            <h1>Khám phá không gian nghỉ dưỡng</h1>
            <p>Chọn căn phòng phù hợp cho hành trình đáng nhớ của bạn.</p>
          </div>
          {dangTai && (
            <div className="row">
              {[1, 2, 3].map((i) => (
                <div className="col-lg-4" key={i}>
                  <div className="room-skeleton">
                    <i />
                    <b />
                    <span />
                    <span />
                  </div>
                </div>
              ))}
            </div>
          )}
          {loi && (
            <div className="state-card">
              <strong>Không thể tải danh sách phòng</strong>
              <p>{loi}</p>
              <button className="btn btn-brand" onClick={loadDanhSachPhong}>
                Thử lại
              </button>
            </div>
          )}
          {!dangTai && !loi && danhSachPhong.length === 0 && (
            <div className="state-card">
              <strong>Không tìm thấy phòng phù hợp</strong>
              <p>Hãy thử thay đổi ngày lưu trú hoặc số lượng khách.</p>
            </div>
          )}
          {!dangTai && !loi && danhSachPhong.length > 0 && (
            <div className="row">
              {danhSachPhong.map((phong) => (
                <RoomCard key={phong.id} phong={phong} />
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}

export default DanhSachPhong;
