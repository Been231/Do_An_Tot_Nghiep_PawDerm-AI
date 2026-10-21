import React, { useState, useEffect } from 'react';
import { User, Lock, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';
import { authService } from '../../services/authService';

export default function LoginForm({ onLoginSuccess, onSwitchToRegister, initialUsername = '', registrationNotice = '' }) {
  const [username, setUsername] = useState(initialUsername || 'khachhang');
  const [password, setPassword] = useState(initialUsername ? '' : '123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState(registrationNotice || '');

  useEffect(() => {
    if (initialUsername) {
      setUsername(initialUsername);
      setPassword('');
    }
  }, [initialUsername]);

  useEffect(() => {
    if (registrationNotice) {
      setNotice(registrationNotice);
    }
  }, [registrationNotice]);

  // Đăng nhập nhanh 1 chạm cho Hội đồng chấm đồ án
  const handleQuickLogin = async (targetUsername) => {
    setUsername(targetUsername);
    setPassword('123');
    setLoading(true);
    setError('');
    setNotice('');
    try {
      const res = await authService.login(targetUsername, '123');
      if (res.user) {
        localStorage.setItem('pawderm_user', JSON.stringify(res.user));
        if (onLoginSuccess) onLoginSuccess(res.user);
      }
    } catch (err) {
      setError(err.message || 'Lỗi đăng nhập');
    } finally {
      setLoading(false);
    }
  };

  // Đăng nhập chuẩn form
  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    if (!username || !password) {
      setError('Vui lòng điền đầy đủ tên đăng nhập và mật khẩu!');
      return;
    }

    setLoading(true);
    try {
      const res = await authService.login(username, password);
      if (res.user) {
        localStorage.setItem('pawderm_user', JSON.stringify(res.user));
        if (onLoginSuccess) onLoginSuccess(res.user);
      }
    } catch (err) {
      setError(err.message || 'Tên đăng nhập hoặc mật khẩu không chính xác!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-form-card-inner animate-fadeIn">
      {/* TABS CHUYỂN ĐỔI CHUẨN MOCKUP: ĐĂNG NHẬP | ĐĂNG KÝ */}
      <div className="mockup-tabs-bar">
        <button type="button" className="mockup-tab-item active">
          Đăng nhập
        </button>
        <button type="button" className="mockup-tab-item" onClick={onSwitchToRegister}>
          Đăng ký
        </button>
      </div>

      {notice && (
        <div className="auth-alert-message success animate-fadeIn">
          <CheckCircle size={16} style={{ flexShrink: 0 }} />
          <span>{notice}</span>
        </div>
      )}

      {error && (
        <div className="auth-alert-message error">
          <AlertCircle size={16} style={{ flexShrink: 0 }} />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleLogin}>
        {/* INPUT TÊN NGƯỜI DÙNG HOẶC EMAIL */}
        <div className="input-wrapper-pill">
          <User size={19} className="input-icon-left" />
          <input
            type="text"
            className="clean-input-pill"
            placeholder="Tên đăng nhập hoặc Gmail"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>

        {/* INPUT MẬT KHẨU */}
        <div className="input-wrapper-pill">
          <Lock size={19} className="input-icon-left" />
          <input
            type={showPassword ? "text" : "password"}
            className="clean-input-pill"
            placeholder="Mật khẩu"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            type="button"
            className="input-toggle-eye"
            onClick={() => setShowPassword(!showPassword)}
            title={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        {/* GHI NHỚ TÔI & QUÊN MẬT KHẨU */}
        <div className="login-meta-row">
          <label className="remember-check-label">
            <input 
              type="checkbox" 
              checked={rememberMe} 
              onChange={(e) => setRememberMe(e.target.checked)} 
            />
            <span>Ghi nhớ tôi</span>
          </label>
          <span 
            className="forgot-pwd-link" 
            onClick={() => alert('Vui lòng liên hệ Quản trị viên để đặt lại mật khẩu! Mật khẩu mặc định demo: 123')}
          >
            Quên mật khẩu?
          </span>
        </div>

        {/* NÚT ĐĂNG NHẬP CHÍNH */}
        <button 
          type="submit" 
          className="btn-primary-pill" 
          disabled={loading}
        >
          {loading ? 'ĐANG XỬ LÝ...' : 'ĐĂNG NHẬP'}
        </button>

        {/* DÃY ICON MẠNG XÃ HỘI GOOGLE, APPLE, FACEBOOK (CHUẨN MOCKUP) */}
        <div className="social-login-cluster">
          <button 
            type="button" 
            className="btn-social-circle" 
            onClick={() => handleQuickLogin('khachhang')}
            title="Đăng nhập với Google"
          >
            <svg className="social-svg-icon" viewBox="0 0 24 24">
              <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.4 1 3.5 3.6 1.6 7.4l3.7 2.9C6.2 7.3 8.9 5 12 5z"/>
              <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.7-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.9z"/>
              <path fill="#FBBC05" d="M5.3 14.7c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.6 7.2C.6 9.2 0 11.5 0 14s.6 4.8 1.6 6.8l3.7-2.9z"/>
              <path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3.1 0-5.8-2.3-6.7-5.3L1.6 16c1.9 3.8 5.8 7 10.4 7z"/>
            </svg>
          </button>

          <button 
            type="button" 
            className="btn-social-circle" 
            onClick={() => handleQuickLogin('bacsi')}
            title="Đăng nhập với Apple ID"
          >
            <svg className="social-svg-icon" viewBox="0 0 24 24" fill="#000000">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.62-.75 1.04-1.8 0.93-2.85-.9.04-1.99.6-2.63 1.35-.57.65-1.06 1.71-.93 2.73.99.08 2.01-.48 2.63-1.23z"/>
            </svg>
          </button>

          <button 
            type="button" 
            className="btn-social-circle" 
            onClick={() => handleQuickLogin('admin')}
            title="Đăng nhập với Facebook"
          >
            <svg className="social-svg-icon" viewBox="0 0 24 24" fill="#1877F2">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
          </button>
        </div>

        {/* LIÊN KẾT CHUYỂN SANG ĐĂNG KÝ */}
        <div className="auth-switch-prompt">
          <span>Chưa có tài khoản? </span>
          <button 
            type="button" 
            className="auth-switch-btn" 
            onClick={onSwitchToRegister}
          >
            Đăng ký ngay
          </button>
        </div>

        {/* NÚT THỬ NGHIỆM NHANH CHO HỘI ĐỒNG (ADMIN, BÁC SĨ, CHỦ NUÔI) */}
        <div className="quick-roles-tray">
          <button 
            type="button" 
            className="btn-tray-pill admin" 
            onClick={() => handleQuickLogin('admin')}
            title="Đăng nhập tài khoản Quản trị viên"
          >
            Admin
          </button>
          <button 
            type="button" 
            className="btn-tray-pill doctor" 
            onClick={() => handleQuickLogin('bacsi')}
            title="Đăng nhập tài khoản Bác sĩ thú y"
          >
            Bác sĩ thú y
          </button>
          <button 
            type="button" 
            className="btn-tray-pill customer" 
            onClick={() => handleQuickLogin('khachhang')}
            title="Đăng nhập tài khoản Chủ nuôi thú cưng"
          >
            Chủ nuôi
          </button>
        </div>
      </form>
    </div>
  );
}
