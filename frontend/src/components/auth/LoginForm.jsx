import React, { useState, useEffect } from 'react';
import { User, Lock, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';
import { authService } from '../../services/authService';

export default function LoginForm({ onLoginSuccess, onSwitchToRegister, onSwitchToForgot, initialUsername = '', registrationNotice = '' }) {
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
          <button 
            type="button"
            className="forgot-pwd-link-btn" 
            onClick={onSwitchToForgot}
          >
            Quên mật khẩu?
          </button>
        </div>

        {/* NÚT ĐĂNG NHẬP CHÍNH */}
        <button 
          type="submit" 
          className="btn-primary-pill" 
          disabled={loading}
        >
          {loading ? 'ĐANG XỬ LÝ...' : 'ĐĂNG NHẬP'}
        </button>

        {/* LIÊN KẾT CHUYỂN SANG ĐĂNG KÝ */}
        <div className="auth-switch-prompt mt-3">
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
