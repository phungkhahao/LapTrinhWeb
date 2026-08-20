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
import DangNhap from './pages/DangNhap';
import DangKy from './pages/DangKy';
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
      <Route path="/dang-nhap" element={<DangNhap />} />
      <Route path="/dang-ky" element={<DangKy />} />
    </Routes>
  );
}

export default App;
