import React, { useState } from 'react';
import { User, Lock, Phone, Building, Award, Heart, AlertCircle, CheckCircle } from 'lucide-react';
import { authService } from '../../services/authService';

export default function RegisterForm({ onRegisterSuccess, onSwitchToLogin }) {
  const [role, setRole] = useState('customer'); // 'customer' | 'doctor'
  
  // Thông tin người dùng
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');

  // Thông tin thú cưng (dành cho Chủ nuôi)
  const [petName, setPetName] = useState('');
  const [petSpecies, setPetSpecies] = useState('Chó 🐶');
  const [petBreed, setPetBreed] = useState('');
  const [petAge, setPetAge] = useState('1 tuổi');

  // Thông tin Bác sĩ
  const [clinicName, setClinicName] = useState('');
  const [specialty, setSpecialty] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!username || !password || !fullName || !phone) {
      setError('Vui lòng điền đầy đủ các thông tin có dấu (*)!');
      return;
    }

    if (role === 'customer' && !petName.trim()) {
      setError('Vui lòng nhập tên bé cưng (chó hoặc mèo) của bạn để tạo hồ sơ khám!');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        username,
        password,
        full_name: fullName,
        phone,
        email: `${username}@pawderm.vn`,
        role,
        pet_name: role === 'customer' ? petName : '',
        pet_species: role === 'customer' ? petSpecies : '',
        pet_breed: role === 'customer' ? (petBreed || 'Chưa rõ giống') : '',
        pet_age: role === 'customer' ? (petAge || '1 tuổi') : '',
        clinic_name: role === 'doctor' ? clinicName : '',
        specialty: role === 'doctor' ? specialty : ''
      };

      const res = await authService.register(payload);
      if (res.success) {
        setSuccess(
          role === 'doctor'
            ? '🎉 Đăng ký Bác sĩ thành công! Tài khoản đang chờ Quản trị viên duyệt.'
            : `🎉 Đăng ký thành công! Đã tạo hồ sơ cho bé "${petName}". Hãy chuyển sang Đăng nhập để trải nghiệm!`
        );
        if (onRegisterSuccess) {
          onRegisterSuccess(username, password);
        }
      }
    } catch (err) {
      setError(err.message || 'Lỗi khi tạo tài khoản, vui lòng thử lại!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-form-card-inner animate-fadeIn">
      {/* TABS CHUYỂN ĐỔI: ĐĂNG NHẬP | ĐĂNG KÝ (ĐANG ACTIVE ĐĂNG KÝ) */}
      <div className="mockup-tabs-bar">
        <button type="button" className="mockup-tab-item" onClick={onSwitchToLogin}>
          Đăng nhập
        </button>
        <button type="button" className="mockup-tab-item active">
          Đăng ký
        </button>
      </div>

      {error && (
        <div className="auth-alert-message error">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="auth-alert-message success">
          <CheckCircle size={16} />
          <span>{success}</span>
        </div>
      )}

      <form onSubmit={handleRegister}>
        {/* LỰA CHỌN VAI TRÒ ĐĂNG KÝ */}
        <div className="role-choice-container">
          <span className="role-choice-label">Bạn đăng ký với vai trò:</span>
          <div className="role-pills-row">
            <label className={`role-pill-option ${role === 'customer' ? 'active' : ''}`}>
              <input 
                type="radio" 
                name="roleOption" 
                checked={role === 'customer'} 
                onChange={() => setRole('customer')} 
              />
              <span>🐶 Chủ Nuôi Thú Cưng</span>
            </label>
            <label className={`role-pill-option ${role === 'doctor' ? 'active' : ''}`}>
              <input 
                type="radio" 
                name="roleOption" 
                checked={role === 'doctor'} 
                onChange={() => setRole('doctor')} 
              />
              <span>🩺 Bác Sĩ Thú Y</span>
            </label>
          </div>
        </div>

        {/* THÔNG TIN TÀI KHOẢN */}
        <div className="form-split-row">
          <div className="input-wrapper-pill">
            <User size={18} className="input-icon-left" />
            <input
              type="text"
              className="clean-input-pill"
              placeholder="Tên đăng nhập *"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="input-wrapper-pill">
            <Lock size={18} className="input-icon-left" />
            <input
              type="password"
              className="clean-input-pill"
              placeholder="Mật khẩu *"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="form-split-row">
          <div className="input-wrapper-pill">
            <User size={18} className="input-icon-left" />
            <input
              type="text"
              className="clean-input-pill"
              placeholder={role === 'doctor' ? "Họ tên Bác sĩ *" : "Họ và tên chủ nuôi *"}
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>
          <div className="input-wrapper-pill">
            <Phone size={18} className="input-icon-left" />
            <input
              type="tel"
              className="clean-input-pill"
              placeholder="Số điện thoại *"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
          </div>
        </div>

        {/* ============================================================
            KHU VỰC THÔNG TIN BÉ CƯNG (CHO CHỦ NUÔI: TÊN, LOÀI CHÓ/MÈO, GIỐNG, TUỔI)
           ============================================================ */}
        {role === 'customer' && (
          <div className="pet-info-card-box animate-fadeIn">
            <div className="pet-info-box-header">
              <Heart size={16} className="text-orange" />
              <span>Thông tin bé cưng của bạn (Hồ sơ khám bệnh đầu tiên)</span>
            </div>

            <div className="form-split-row">
              <div className="input-wrapper-pill">
                <input
                  type="text"
                  className="clean-input-pill no-icon"
                  placeholder="Tên thú cưng * (Lu Lu, Miu...)"
                  value={petName}
                  onChange={(e) => setPetName(e.target.value)}
                  required
                />
              </div>
              <div className="input-wrapper-pill">
                <select
                  className="clean-input-pill clean-select-pill no-icon"
                  value={petSpecies}
                  onChange={(e) => setPetSpecies(e.target.value)}
                >
                  <option value="Chó 🐶">Loài: Chó 🐶</option>
                  <option value="Mèo 🐱">Loài: Mèo 🐱</option>
                </select>
              </div>
            </div>

            <div className="form-split-row">
              <div className="input-wrapper-pill">
                <input
                  type="text"
                  className="clean-input-pill no-icon"
                  placeholder="Giống loài (Poodle, Mèo Anh...)"
                  value={petBreed}
                  onChange={(e) => setPetBreed(e.target.value)}
                />
              </div>
              <div className="input-wrapper-pill">
                <input
                  type="text"
                  className="clean-input-pill no-icon"
                  placeholder="Độ tuổi (1 tuổi, 6 tháng...)"
                  value={petAge}
                  onChange={(e) => setPetAge(e.target.value)}
                />
              </div>
            </div>
          </div>
        )}

        {/* THÔNG TIN BÁC SĨ THÚ Y */}
        {role === 'doctor' && (
          <div className="form-split-row animate-fadeIn">
            <div className="input-wrapper-pill">
              <Building size={18} className="input-icon-left" />
              <input
                type="text"
                className="clean-input-pill"
                placeholder="Phòng khám / Bệnh viện *"
                value={clinicName}
                onChange={(e) => setClinicName(e.target.value)}
                required
              />
            </div>
            <div className="input-wrapper-pill">
              <Award size={18} className="input-icon-left" />
              <input
                type="text"
                className="clean-input-pill"
                placeholder="Chuyên môn (Da liễu...)"
                value={specialty}
                onChange={(e) => setSpecialty(e.target.value)}
              />
            </div>
          </div>
        )}

        {/* NÚT ĐĂNG KÝ CHÍNH */}
        <button 
          type="submit" 
          className="btn-primary-pill mt-2" 
          disabled={loading}
        >
          {loading ? 'ĐANG TẠO TÀI KHOẢN...' : 'ĐĂNG KÝ NGAY'}
        </button>

        {/* DÃY ICON MẠNG XÃ HỘI GOOGLE, APPLE, FACEBOOK (CHUẨN MOCKUP) */}
        <div className="social-login-cluster">
          <button type="button" className="btn-social-circle" title="Google">
            <svg className="social-svg-icon" viewBox="0 0 24 24">
              <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.4 1 3.5 3.6 1.6 7.4l3.7 2.9C6.2 7.3 8.9 5 12 5z"/>
              <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.7-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.9z"/>
              <path fill="#FBBC05" d="M5.3 14.7c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.6 7.2C.6 9.2 0 11.5 0 14s.6 4.8 1.6 6.8l3.7-2.9z"/>
              <path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3.1 0-5.8-2.3-6.7-5.3L1.6 16c1.9 3.8 5.8 7 10.4 7z"/>
            </svg>
          </button>
          <button type="button" className="btn-social-circle" title="Apple ID">
            <svg className="social-svg-icon" viewBox="0 0 24 24" fill="#000000">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.62-.75 1.04-1.8 0.93-2.85-.9.04-1.99.6-2.63 1.35-.57.65-1.06 1.71-.93 2.73.99.08 2.01-.48 2.63-1.23z"/>
            </svg>
          </button>
          <button type="button" className="btn-social-circle" title="Facebook">
            <svg className="social-svg-icon" viewBox="0 0 24 24" fill="#1877F2">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
          </button>
        </div>

        {/* LIÊN KẾT CHUYỂN VỀ ĐĂNG NHẬP */}
        <div className="auth-switch-prompt">
          <span>Đã có tài khoản? </span>
          <button 
            type="button" 
            className="auth-switch-btn" 
            onClick={onSwitchToLogin}
          >
            Đăng nhập ngay
          </button>
        </div>
      </form>
    </div>
  );
}
