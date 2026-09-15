import TrangChu from './pages/TrangChu';
import DanhSachPhong from './pages/DanhSachPhong';
import ChiTietPhong from './pages/ChiTietPhong';
import DatPhong from './pages/DatPhong';
import DatPhongThanhCong from './pages/DatPhongThanhCong';
import DatPhongCuaToi from './pages/DatPhongCuaToi';
import ChiTietDatPhong from './pages/ChiTietDatPhong';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminPhong from './pages/admin/AdminPhong';
import AdminLoaiPhong from './pages/admin/AdminLoaiPhong';
import AdminDatPhong from './pages/admin/AdminDatPhong';
import AdminNguoiDung from './pages/admin/AdminNguoiDung';
import AdminDichVu from './pages/admin/AdminDichVu';
import DangNhap from './pages/DangNhap';
import DangKy from './pages/DangKy';
import HoSoCaNhan from './pages/HoSoCaNhan';
import LienHe from './pages/LienHe';
import AdminLienHe from './pages/admin/AdminLienHe';
import AdminQuanTriVien from './pages/admin/AdminQuanTriVien';
import './App.css';
import './styles/ui-normalize.css';
import './styles/admin-table-fix.css';
import { Route, Routes } from 'react-router-dom';

function App() {
  return (
    <Routes>
      <Route path="/" element={<TrangChu />} />
      <Route path="/phong" element={<DanhSachPhong />} />
      <Route path="/phong/:id" element={<ChiTietPhong />} />
      <Route path="/dat-phong/:id" element={<DatPhong />} />
      <Route path="/dat-phong-thanh-cong" element={<DatPhongThanhCong />} />
      <Route path="/dat-phong-cua-toi" element={<DatPhongCuaToi />} />
      <Route path="/dat-phong-cua-toi/:id" element={<ChiTietDatPhong />} />
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/admin/phong" element={<AdminPhong />} />
      <Route path="/admin/loai-phong" element={<AdminLoaiPhong />} />
      <Route path="/admin/dat-phong" element={<AdminDatPhong />} />
      <Route path="/admin/nguoi-dung" element={<AdminNguoiDung />} />
      <Route path="/admin/dich-vu" element={<AdminDichVu />} />
      <Route path="/dang-nhap" element={<DangNhap />} />
      <Route path="/dang-ky" element={<DangKy />} />
      <Route path="/ho-so" element={<HoSoCaNhan />} />
      <Route path="/lien-he" element={<LienHe />} />
      <Route path="/admin/lien-he" element={<AdminLienHe />} />
      <Route path="/admin/quan-tri-vien" element={<AdminQuanTriVien />} />
    </Routes>
  );
}

export default App;
