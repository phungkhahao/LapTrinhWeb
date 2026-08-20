import { Link } from 'react-router-dom';

const dinhDangTien = new Intl.NumberFormat('vi-VN');

function RoomCard({ phong, thongTinTimKiem }) {
  const anhMacDinh = `/hotel-template/${((phong.id - 1) % 8) + 1}.jpg`;
  const truyVanTimKiem = thongTinTimKiem ? `?${new URLSearchParams(thongTinTimKiem).toString()}` : '';

  return (
    <div className="col-lg-4 col-md-6 col-12 mb-4">
      <article className="room-card h-100">
        <img src={phong.hinh_anh || anhMacDinh} alt={phong.ten_phong} />
        <div className="room-card-body p-4">
          <div className="d-flex justify-content-between align-items-start gap-2">
            <div>
              <p className="room-number mb-1">Phòng {phong.so_phong}</p>
              <h3>{phong.ten_phong}</h3>
            </div>
            {phong.trang_thai === 'trong' ? (
              <span className="badge bg-success">Trống</span>
            ) : (
              <span className="badge bg-secondary">{phong.trang_thai}</span>
            )}
          </div>
          <p className="room-price">{dinhDangTien.format(phong.gia_phong)} VNĐ <small>/ đêm</small></p>
          <p className="mb-3">Tối đa: {phong.so_nguoi_toi_da} người</p>
          <Link className="btn btn-outline-brand" to={`/phong/${phong.id}${truyVanTimKiem}`}>Xem chi tiết</Link>
        </div>
      </article>
    </div>
  );
}

export default RoomCard;
