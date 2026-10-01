import React, { useState, useEffect } from 'react';
import AuthPage from './pages/AuthPage';
import CustomerPage from './pages/CustomerPage';
import DoctorPage from './pages/DoctorPage';
import AdminPage from './pages/AdminPage';
import { Bell, LogOut, ChevronDown } from 'lucide-react';
import './App.css';

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [showUserMenu, setShowUserMenu] = useState(false);

  // Khôi phục session từ localStorage
  useEffect(() => {
    const saved = localStorage.getItem('pawderm_user');
    if (saved) {
      try {
        setCurrentUser(JSON.parse(saved));
      } catch (e) {
        console.error('Lỗi đọc session:', e);
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('pawderm_user');
    setCurrentUser(null);
  };

  // Đổi vai trò nhanh (phục vụ Demo & Báo cáo Đồ án tốt nghiệp)
  const handleQuickSwitchRole = (newRole) => {
    if (!currentUser) return;
    let updated = { ...currentUser, role: newRole };
    if (newRole === 'doctor') {
      updated.full_name = 'BS. CKII Nguyễn Thị Mai Hương';
      updated.clinic_name = 'Bệnh viện Thú Y PawCare TP. Hồ Chí Minh';
      updated.specialty = 'Chuyên khoa Da liễu & Ký sinh trùng thú nhỏ';
    } else if (newRole === 'admin') {
      updated.full_name = 'Quản trị viên Hệ thống PawDerm';
    } else {
      updated.full_name = 'Nguyễn Văn Khách (Chủ nuôi)';
    }
    setCurrentUser(updated);
    localStorage.setItem('pawderm_user', JSON.stringify(updated));
  };

  if (!currentUser) {
    return <AuthPage onLoginSuccess={setCurrentUser} />;
  }

  const role = currentUser.role || 'customer';

  return (
    <div className="pawderm-app-root">
      {/* HEADER ĐIỀU HÀNH CHÍNH THEO MẪU MỚI */}
      <header className="app-main-header">
        <div className="header-left">
          <div className="logo-brand-pill">
            <span className="logo-paw-icon">🐾</span>
            <h1 className="brand-logo-text">PawDerm <span>AI</span></h1>
          </div>
        </div>

        {/* BỘ CHUYỂN VAI TRÒ NHANH TRUNG TÂM */}
        <div className="header-center role-quick-switcher">
          <button 
            type="button"
            className={`switcher-pill ${role === 'customer' ? 'active customer' : ''}`}
            onClick={() => handleQuickSwitchRole('customer')}
          >
            Chủ nuôi
          </button>
          <button 
            type="button"
            className={`switcher-pill ${role === 'doctor' ? 'active doctor' : ''}`}
            onClick={() => handleQuickSwitchRole('doctor')}
          >
            Bác sĩ thú y
          </button>
          <button 
            type="button"
            className={`switcher-pill ${role === 'admin' ? 'active admin' : ''}`}
            onClick={() => handleQuickSwitchRole('admin')}
          >
            Quản trị viên
          </button>
        </div>

        {/* THÔNG TIN TÀI KHOẢN & CHUÔNG THÔNG BÁO CHUẨN THEO ẢNH MẪU */}
        <div className="header-right">
          <div className="user-dropdown-container">
            <div 
              className="user-profile-badge-clean"
              onClick={() => setShowUserMenu(!showUserMenu)}
              title="Nhấn để mở menu tài khoản"
            >
              <span className="user-avatar-circle">
                {role === 'admin' ? '⚙️' : role === 'doctor' ? '🩺' : '🐶'}
              </span>
              <span className="user-name-clean">{currentUser.full_name || currentUser.username}</span>
              <ChevronDown size={14} className="chevron-down-sm" />
            </div>

            {showUserMenu && (
              <div className="user-dropdown-menu animate-fadeIn">
                <div className="dropdown-user-info">
                  <strong>{currentUser.full_name || currentUser.username}</strong>
                  <span>{role === 'admin' ? 'Quản trị viên' : role === 'doctor' ? 'Bác sĩ thú y' : 'Chủ nuôi'}</span>
                </div>
                <hr className="dropdown-divider" />
                <button className="dropdown-item-btn text-danger" onClick={handleLogout}>
                  <LogOut size={14} />
                  <span>Đăng xuất</span>
                </button>
              </div>
            )}
          </div>

          {/* Chuông thông báo có chấm tròn màu cam/đỏ như hình mẫu */}
          <button 
            type="button" 
            className="btn-notification-bell" 
            title="Thông báo mới từ hệ thống"
            onClick={() => alert('Thông báo: Bác sĩ thú y đã thẩm định xong ca bệnh nấm da của bé cưng!')}
          >
            <Bell size={19} />
            <span className="notification-dot"></span>
          </button>
        </div>
      </header>

      {/* NỘI DUNG TƯƠNG ỨNG TỪNG PHÂN HỆ VAI TRÒ */}
      <main className="app-main-content">
        {role === 'customer' && (
          <CustomerPage currentUser={currentUser} />
        )}

        {role === 'doctor' && (
          <DoctorPage currentUser={currentUser} onProfileUpdated={setCurrentUser} />
        )}

        {role === 'admin' && (
          <AdminPage currentUser={currentUser} />
        )}
      </main>

      {/* FOOTER BẢN QUYỀN ĐỒ ÁN */}
      <footer className="app-main-footer">
        <div className="footer-content">
          <span>🐾 PawDerm AI &bull; Hệ Thống Chẩn Đoán Da Liễu Thú Cưng & Active Learning &bull; <em>Vì sức khỏe chó mèo</em></span>
        </div>
      </footer>
    </div>
  );
}
