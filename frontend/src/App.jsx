import React, { useState, useEffect } from 'react';
import AuthPage from './pages/AuthPage';
import CustomerPage from './pages/CustomerPage';
import DoctorPage from './pages/DoctorPage';
import AdminPage from './pages/AdminPage';
import NotificationBell from './components/common/NotificationBell';
import ProfileModal from './components/common/ProfileModal';
import ThemeToggle from './components/common/ThemeToggle';
import { LogOut, ChevronDown, Eye, LogIn, UserPlus, UserCog, KeyRound } from 'lucide-react';
import './App.css';

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [authModal, setAuthModal] = useState({ open: false, initialTab: 'login' });
  const [profileModal, setProfileModal] = useState({ open: false, tab: 'info' });
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('pawderm_theme') || 'light';
  });

  // Áp dụng theme lên root <html>
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('pawderm_theme', theme);
  }, [theme]);

  const handleToggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

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
    setShowUserMenu(false);
  };

  // Admin xem trước giao diện các vai trò khác (chỉ đổi giao diện hiển thị, không đổi quyền thật)
  const handlePreviewRole = (newRole) => {
    if (!currentUser) return;
    const updated = { ...currentUser, view_role: newRole };
    setCurrentUser(updated);
    localStorage.setItem('pawderm_user', JSON.stringify(updated));
  };

  const handleLoginSuccess = (user) => {
    // eslint-disable-next-line no-unused-vars
    const { view_role, ...clean } = user || {};
    setCurrentUser(clean);
    localStorage.setItem('pawderm_user', JSON.stringify(clean));
    setAuthModal({ open: false, initialTab: 'login' });
  };

  const handleOpenAuth = (tab = 'login') => {
    setAuthModal({ open: true, initialTab: tab });
  };

  const handleOpenProfile = (tab = 'info') => {
    setShowUserMenu(false);
    setProfileModal({ open: true, tab });
  };

  // Cập nhật hồ sơ xong -> đồng bộ lại header và session (giữ view_role của admin nếu có)
  const handleProfileUpdated = (updatedUser) => {
    const merged = { ...currentUser, ...updatedUser };
    setCurrentUser(merged);
    localStorage.setItem('pawderm_user', JSON.stringify(merged));
  };

  const realRole = currentUser?.role || 'guest';
  const isAdmin = realRole === 'admin';
  // Nếu là admin và có chọn view_role thì áp dụng, còn lại giữ đúng role thật (hoặc mặc định customer cho guest)
  const activeRole = isAdmin && currentUser?.view_role ? currentUser.view_role : (currentUser ? realRole : 'customer');

  return (
    <div className="pawderm-app-root">
      {/* HEADER ĐIỀU HÀNH CHÍNH */}
      <header className="app-main-header">
        <div className="header-left">
          <div className="logo-brand-pill">
            <span className="logo-paw-icon">🐾</span>
            <h1 className="brand-logo-text">PawDerm <span>AI</span></h1>
          </div>
        </div>

        {/* BỘ XEM TRƯỚC GIAO DIỆN — CHỈ HIỆN VỚI QUẢN TRỊ VIÊN THỰC TẾ */}
        {isAdmin && (
          <div className="header-center role-quick-switcher" title="Quản trị viên xem trước giao diện các vai trò">
            <span className="switcher-preview-label"><Eye size={13} /> Xem với vai trò</span>
            <button
              type="button"
              id="preview-role-customer"
              className={`switcher-pill ${activeRole === 'customer' ? 'active customer' : ''}`}
              onClick={() => handlePreviewRole('customer')}
            >
              Chủ nuôi
            </button>
            <button
              type="button"
              id="preview-role-doctor"
              className={`switcher-pill ${activeRole === 'doctor' ? 'active doctor' : ''}`}
              onClick={() => handlePreviewRole('doctor')}
            >
              Bác sĩ thú y
            </button>
            <button
              type="button"
              id="preview-role-admin"
              className={`switcher-pill ${activeRole === 'admin' ? 'active admin' : ''}`}
              onClick={() => handlePreviewRole('admin')}
            >
              Quản trị viên
            </button>
          </div>
        )}

        {/* THÔNG TIN TÀI KHOẢN HOẶC NÚT ĐĂNG NHẬP / ĐĂNG KÝ */}
        <div className="header-right">
          {/* Nút chuyển đổi Dark/Light mode toàn hệ thống */}
          <ThemeToggle theme={theme} onToggle={handleToggleTheme} />

          {currentUser ? (
            <>
              <div className="user-dropdown-container">
                <div 
                  className="user-profile-badge-clean"
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  title="Nhấn để mở menu tài khoản"
                >
                  <span className="user-avatar-circle">
                    {realRole === 'admin' ? '⚙️' : realRole === 'doctor' ? '🩺' : '🐶'}
                  </span>
                  <span className="user-name-clean">{currentUser.full_name || currentUser.username}</span>
                  <ChevronDown size={14} className="chevron-down-sm" />
                </div>

                {showUserMenu && (
                  <div className="user-dropdown-menu animate-fadeIn">
                    <div className="dropdown-user-info">
                      <strong>{currentUser.full_name || currentUser.username}</strong>
                      <span>{realRole === 'admin' ? 'Quản trị viên' : realRole === 'doctor' ? 'Bác sĩ thú y' : 'Chủ nuôi'}</span>
                      {currentUser.email && !currentUser.email.endsWith('@pawderm.vn') && (
                        <span className="dropdown-user-email">{currentUser.email}</span>
                      )}
                    </div>
                    <hr className="dropdown-divider" />
                    <button id="menu-open-profile" className="dropdown-item-btn" onClick={() => handleOpenProfile('info')}>
                      <UserCog size={14} />
                      <span>Hồ sơ cá nhân</span>
                    </button>
                    <button id="menu-change-password" className="dropdown-item-btn" onClick={() => handleOpenProfile('password')}>
                      <KeyRound size={14} />
                      <span>Đổi mật khẩu</span>
                    </button>
                    <hr className="dropdown-divider" />
                    <button className="dropdown-item-btn text-danger" onClick={handleLogout}>
                      <LogOut size={14} />
                      <span>Đăng xuất</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Chuông thông báo thật (polling 30 giây) */}
              <NotificationBell userId={currentUser.id} role={realRole} />
            </>
          ) : (
            <div className="header-guest-auth-btns">
              <button
                type="button"
                id="btn-header-login"
                className="btn-header-login"
                onClick={() => handleOpenAuth('login')}
              >
                <LogIn size={15} />
                <span>Đăng nhập</span>
              </button>
              <button
                type="button"
                id="btn-header-register"
                className="btn-header-register"
                onClick={() => handleOpenAuth('register')}
              >
                <UserPlus size={15} />
                <span>Đăng ký</span>
              </button>
            </div>
          )}
        </div>
      </header>

      {/* NỘI DUNG TƯƠNG ỨNG TỪNG PHÂN HỆ VAI TRÒ */}
      <main className="app-main-content">
        {activeRole === 'customer' && (
          <CustomerPage currentUser={currentUser} onRequireAuth={handleOpenAuth} />
        )}

        {activeRole === 'doctor' && (
          <DoctorPage currentUser={currentUser} onProfileUpdated={setCurrentUser} />
        )}

        {activeRole === 'admin' && (
          <AdminPage currentUser={currentUser} />
        )}
      </main>

      {/* FOOTER BẢN QUYỀN ĐỒ ÁN */}
      <footer className="app-main-footer">
        <div className="footer-content">
          <span>🐾 PawDerm AI &bull; Hệ Thống Chẩn Đoán Da Liễu Thú Cưng & Active Learning &bull; <em>Vì sức khỏe chó mèo</em></span>
        </div>
      </footer>

      {/* MODAL ĐĂNG NHẬP / ĐĂNG KÝ (HIỆN DẠNG POPUP KHI BẤM NÚT) */}
      {authModal.open && (
        <AuthPage
          isModal={true}
          initialTab={authModal.initialTab}
          onClose={() => setAuthModal({ open: false, initialTab: 'login' })}
          onLoginSuccess={handleLoginSuccess}
        />
      )}

      {/* MODAL HỒ SƠ CÁ NHÂN / ĐỔI MẬT KHẨU */}
      {profileModal.open && currentUser && (
        <ProfileModal
          key={profileModal.tab}
          currentUser={currentUser}
          initialTab={profileModal.tab}
          onClose={() => setProfileModal({ open: false, tab: 'info' })}
          onUpdated={handleProfileUpdated}
        />
      )}
    </div>
  );
}
