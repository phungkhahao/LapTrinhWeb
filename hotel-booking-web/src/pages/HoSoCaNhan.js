import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { getHoSo, putDoiMatKhau, putHoSo } from '../api/hotel_booking_api';
import { useAuth } from '../context/AuthContext';
import '../styles/ho-so.css';

const loiTuApi = (error) => error.response?.data?.message || 'Đã xảy ra lỗi. Vui lòng thử lại.';

function HoSoCaNhan() {
  const { isAuthenticated, loadingAuth, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [dangTai, setDangTai] = useState(true);
  const [dangLuu, setDangLuu] = useState(false);
  const [hoSo, setHoSo] = useState({ ho_ten: '', email: '', so_dien_thoai: '' });
  const [matKhau, setMatKhau] = useState({ mat_khau_hien_tai: '', mat_khau_moi: '', xac_nhan_mat_khau_moi: '' });

  useEffect(() => { if (!loadingAuth && !isAuthenticated) navigate('/dang-nhap', { replace: true }); }, [isAuthenticated, loadingAuth, navigate]);
  useEffect(() => {
    if (!isAuthenticated) return;
    getHoSo().then((response) => { if (!response.success) throw new Error(response.message); setHoSo(response.data); }).catch((error) => Swal.fire({ icon: 'error', title: 'Không thể tải hồ sơ', text: loiTuApi(error) })).finally(() => setDangTai(false));
  }, [isAuthenticated]);

  const capNhatHoSo = async (event) => {
    event.preventDefault();
    try {
      setDangLuu(true);
      const response = await putHoSo({ ho_ten: hoSo.ho_ten, so_dien_thoai: hoSo.so_dien_thoai || null });
      if (!response.success) throw new Error(response.message);
      setHoSo(response.data);
      await refreshUser();
      await Swal.fire({ icon: 'success', title: 'Cập nhật hồ sơ thành công.' });
    } catch (error) { await Swal.fire({ icon: 'error', title: 'Không thể cập nhật hồ sơ', text: loiTuApi(error) }); } finally { setDangLuu(false); }
  };
  const doiMatKhau = async (event) => {
    event.preventDefault();
    try {
      setDangLuu(true);
      const response = await putDoiMatKhau(matKhau);
      if (!response.success) throw new Error(response.message);
      setMatKhau({ mat_khau_hien_tai: '', mat_khau_moi: '', xac_nhan_mat_khau_moi: '' });
      await Swal.fire({ icon: 'success', title: 'Đổi mật khẩu thành công.' });
    } catch (error) { await Swal.fire({ icon: 'error', title: 'Không thể đổi mật khẩu', text: loiTuApi(error) }); } finally { setDangLuu(false); }
  };

  return <><Header /><main className="profile-page"><div className="container profile-container"><header><p className="section-kicker">TÀI KHOẢN</p><h1>Hồ sơ cá nhân</h1><p>Quản lý thông tin tài khoản và mật khẩu của bạn.</p></header>{dangTai ? <div className="profile-loading">Đang tải hồ sơ...</div> : <div className="profile-grid"><form className="profile-card" onSubmit={capNhatHoSo}><h2>Thông tin cá nhân</h2><label>Họ và tên<input value={hoSo.ho_ten || ''} onChange={(e) => setHoSo({ ...hoSo, ho_ten: e.target.value })} required /></label><label>Email<input value={hoSo.email || ''} disabled /></label><label>Số điện thoại<input value={hoSo.so_dien_thoai || ''} onChange={(e) => setHoSo({ ...hoSo, so_dien_thoai: e.target.value })} /></label><button className="btn btn-brand" disabled={dangLuu}>Lưu thay đổi</button></form><form className="profile-card" onSubmit={doiMatKhau}><h2>Đổi mật khẩu</h2><label>Mật khẩu hiện tại<input type="password" value={matKhau.mat_khau_hien_tai} onChange={(e) => setMatKhau({ ...matKhau, mat_khau_hien_tai: e.target.value })} required /></label><label>Mật khẩu mới<input type="password" minLength="8" value={matKhau.mat_khau_moi} onChange={(e) => setMatKhau({ ...matKhau, mat_khau_moi: e.target.value })} required /></label><label>Xác nhận mật khẩu mới<input type="password" minLength="8" value={matKhau.xac_nhan_mat_khau_moi} onChange={(e) => setMatKhau({ ...matKhau, xac_nhan_mat_khau_moi: e.target.value })} required /></label><button className="btn btn-outline-brand" disabled={dangLuu}>Đổi mật khẩu</button></form></div>}</div></main><Footer /></>;
}

export default HoSoCaNhan;
