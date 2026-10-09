import React, { useEffect, useState } from 'react';
import { User, Lock, Phone, Heart, AlertCircle, CheckCircle, AlertTriangle, Mail, ShieldCheck, KeyRound } from 'lucide-react';
import { authService } from '../../services/authService';

const GMAIL_REGEX = /^[a-z0-9][a-z0-9.]{5,29}(\+[a-z0-9._-]+)?@gmail\.com$/;

export default function RegisterForm({ onRegisterSuccess, onSwitchToLogin }) {
  // Thông tin người dùng
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [phoneWarning, setPhoneWarning] = useState('');

  // Xác thực Gmail bằng mã OTP
  const [email, setEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [resendIn, setResendIn] = useState(0);
  const [verificationToken, setVerificationToken] = useState('');
  const [emailMessage, setEmailMessage] = useState({ type: '', text: '' });

  // Thông tin thú cưng (dành cho Chủ nuôi: chỉ tên và loài Chó/Mèo)
  const [petName, setPetName] = useState('');
  const [petSpecies, setPetSpecies] = useState('Chó 🐶');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const normalizedEmail = email.trim().toLowerCase();
  const emailVerified = Boolean(verificationToken);

  // Đếm ngược thời gian cho phép gửi lại mã
  useEffect(() => {
    if (resendIn <= 0) return undefined;
    const t = setTimeout(() => setResendIn((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [resendIn]);

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    // Đổi Gmail => phải xác thực lại
    if (verificationToken || otpSent) {
      setVerificationToken('');
      setOtpSent(false);
      setOtpCode('');
      setResendIn(0);
    }
    setEmailMessage({ type: '', text: '' });
  };

  const handleSendOtp = async () => {
    setError('');
    if (!GMAIL_REGEX.test(normalizedEmail)) {
      setEmailMessage({ type: 'error', text: 'Vui lòng nhập đúng địa chỉ Gmail (ví dụ: tenban@gmail.com)' });
      return;
    }
    setSendingOtp(true);
    try {
      const res = await authService.sendEmailOtp(normalizedEmail);
      setOtpSent(true);
      setOtpCode('');
      setResendIn(res.resend_after || 60);
      setEmailMessage({
        type: 'info',
        text: res.dev_mode
          ? 'Chế độ DEV: máy chủ chưa cấu hình gửi mail, mã OTP được in ở cửa sổ console Backend.'
          : res.message
      });
    } catch (err) {
      setEmailMessage({ type: 'error', text: err.message });
    } finally {
      setSendingOtp(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!/^\d{6}$/.test(otpCode)) {
      setEmailMessage({ type: 'error', text: 'Mã xác thực gồm đúng 6 chữ số!' });
      return;
    }
    setVerifyingOtp(true);
    try {
      const res = await authService.verifyEmailOtp(normalizedEmail, otpCode);
      setVerificationToken(res.verification_token);
      setOtpSent(false);
      setEmailMessage({ type: 'success', text: 'Gmail đã được xác thực là có thật và thuộc về bạn!' });
    } catch (err) {
      setEmailMessage({ type: 'error', text: err.message });
    } finally {
      setVerifyingOtp(false);
    }
  };

  const handlePhoneChange = (e) => {
    const val = e.target.value;

    if (val === '') {
      setPhone('');
      setPhoneWarning('');
      return;
    }

    // Chỉ cho phép nhập ký tự số
    if (/[^0-9]/.test(val)) {
      setPhoneWarning('Chỉ được nhập các chữ số (0-9)!');
      return;
    }

    // Kiểm tra bắt đầu từ số 0
    if (!val.startsWith('0')) {
      setPhoneWarning('Số điện thoại phải bắt đầu bằng số 0!');
      setPhone(val.slice(0, 15));
      return;
    }

    // Chặn không vượt quá 15 số
    if (val.length > 15) {
      const trimmed = val.slice(0, 15);
      setPhone(trimmed);
      setPhoneWarning('Số điện thoại tối đa 10 số');
      return;
    }

    // Khi gõ từ số thứ 11 đến 15 số -> thông báo cảnh báo tối đa 10 số
    if (val.length > 10) {
      setPhone(val);
      setPhoneWarning('Số điện thoại tối đa 10 số');
      return;
    }

    // Khi gõ bình thường từ 1 đến 10 số bắt đầu bằng 0 -> không hiện cảnh báo
    setPhoneWarning('');
    setPhone(val);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!username.trim() || !password || !fullName.trim() || !phone.trim() || !email.trim()) {
      setError('Vui lòng điền đầy đủ các thông tin có dấu (*)!');
      return;
    }

    if (!/^[A-Za-z0-9_.]{3,30}$/.test(username.trim())) {
      setError('Tên đăng nhập 3-30 ký tự, chỉ gồm chữ không dấu, số, dấu _ hoặc dấu chấm!');
      return;
    }

    if (password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự!');
      return;
    }

    // Kiểm tra định dạng số điện thoại
    if (!phone.startsWith('0')) {
      setError('Số điện thoại không hợp lệ! Phải bắt đầu bằng số 0.');
      return;
    }

    if (phone.length !== 10) {
      setError(`Số điện thoại phải có đúng 10 chữ số! (Hiện tại: ${phone.length} số)`);
      return;
    }

    if (!emailVerified) {
      setError('Vui lòng xác thực Gmail bằng mã OTP trước khi đăng ký!');
      return;
    }

    if (!petName.trim()) {
      setError('Vui lòng nhập tên bé cưng của bạn để tạo hồ sơ khám đầu tiên!');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        username: username.trim(),
        password,
        full_name: fullName.trim(),
        phone: phone.trim(),
        email: normalizedEmail,
        verification_token: verificationToken,
        role: 'customer', // Bác sĩ do Quản trị viên cấp, mặc định đăng ký là Chủ nuôi
        pet_name: petName.trim(),
        pet_species: petSpecies,
        pet_breed: '',
        pet_age: ''
      };

      const res = await authService.register(payload);
      if (res.success) {
        setSuccess(`🎉 Đăng ký thành công! Đã tạo hồ sơ cho bé "${petName.trim()}". Đang đưa bạn vào trang chủ...`);
        if (onRegisterSuccess) {
          onRegisterSuccess(username.trim(), password, res.user);
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
      {/* TABS CHUYỂN ĐỔI: ĐĂNG NHẬP | ĐĂNG KÝ */}
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
              placeholder="Họ và tên chủ nuôi *"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>
          <div className="phone-field-wrapper">
            <div className={`input-wrapper-pill ${phoneWarning ? 'has-warning' : ''}`}>
              <Phone size={18} className="input-icon-left" />
              <input
                type="tel"
                className="clean-input-pill"
                placeholder="Số điện thoại *"
                value={phone}
                onChange={handlePhoneChange}
                maxLength={15}
                required
              />
            </div>
            {phoneWarning && (
              <div className="phone-warning-box">
                <AlertTriangle size={15} />
                <span>{phoneWarning}</span>
              </div>
            )}
          </div>
        </div>

        {/* XÁC THỰC GMAIL BẰNG MÃ OTP */}
        <div className={`gmail-verify-box ${emailVerified ? 'verified' : ''}`}>
          <div className="gmail-verify-row">
            <div className={`input-wrapper-pill gmail-input-wrap ${emailVerified ? 'is-verified' : ''}`}>
              <Mail size={18} className="input-icon-left" />
              <input
                type="email"
                id="register-gmail"
                className="clean-input-pill"
                placeholder="Gmail của bạn * (tenban@gmail.com)"
                value={email}
                onChange={handleEmailChange}
                autoComplete="email"
                required
              />
              {emailVerified && <ShieldCheck size={18} className="gmail-verified-icon" />}
            </div>
            {!emailVerified && (
              <button
                type="button"
                id="btn-send-otp"
                className="btn-otp-action"
                onClick={handleSendOtp}
                disabled={sendingOtp || resendIn > 0 || !email.trim()}
              >
                {sendingOtp ? 'Đang gửi...' : resendIn > 0 ? `Gửi lại (${resendIn}s)` : otpSent ? 'Gửi lại mã' : 'Gửi mã'}
              </button>
            )}
          </div>

          {otpSent && !emailVerified && (
            <div className="gmail-verify-row animate-fadeIn">
              <div className="input-wrapper-pill">
                <KeyRound size={18} className="input-icon-left" />
                <input
                  type="text"
                  id="register-otp"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  className="clean-input-pill otp-code-input"
                  placeholder="Nhập mã 6 số"
                  value={otpCode}
                  maxLength={6}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleVerifyOtp();
                    }
                  }}
                />
              </div>
              <button
                type="button"
                id="btn-verify-otp"
                className="btn-otp-action verify"
                onClick={handleVerifyOtp}
                disabled={verifyingOtp || otpCode.length !== 6}
              >
                {verifyingOtp ? 'Đang kiểm tra...' : 'Xác nhận'}
              </button>
            </div>
          )}

          {emailMessage.text && (
            <div className={`gmail-verify-message ${emailMessage.type}`}>
              {emailMessage.type === 'success' ? <ShieldCheck size={15} /> :
                emailMessage.type === 'error' ? <AlertTriangle size={15} /> : <Mail size={15} />}
              <span>{emailMessage.text}</span>
            </div>
          )}
        </div>

        {/* THÔNG TIN BÉ CƯNG (TẠO HỒ SƠ ĐẦU TIÊN) */}
        <div className="pet-info-card-box animate-fadeIn">
          <div className="pet-info-box-header">
            <Heart size={16} className="text-orange" />
            <span>Thông tin bé cưng (Hồ sơ khám đầu tiên)</span>
          </div>

          <div className="form-split-row">
            <div className="input-wrapper-pill">
              <input
                type="text"
                className="clean-input-pill no-icon"
                placeholder="Tên bé cưng * (Lu Lu, Miu...)"
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
        </div>

        {/* NÚT ĐĂNG KÝ CHÍNH */}
        <button
          type="submit"
          id="btn-register-submit"
          className="btn-primary-pill mt-2"
          disabled={loading || !emailVerified}
          title={!emailVerified ? 'Hãy xác thực Gmail trước' : undefined}
        >
          {loading ? 'ĐANG TẠO TÀI KHOẢN...' : 'ĐĂNG KÝ TÀI KHOẢN'}
        </button>

        {/* DÃY ICON MẠNG XÃ HỘI GOOGLE, APPLE, FACEBOOK */}
        <div className="social-login-cluster">
          <button type="button" className="btn-social-circle" title="Google">
            <svg className="social-svg-icon" viewBox="0 0 24 24">
              <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.4 1 3.5 3.6 1.6 7.4l3.7 2.9C6.2 7.3 8.9 5 12 5z" />
              <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.7-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.9z" />
              <path fill="#FBBC05" d="M5.3 14.7c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.6 7.2C.6 9.2 0 11.5 0 14s.6 4.8 1.6 6.8l3.7-2.9z" />
              <path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3.1 0-5.8-2.3-6.7-5.3L1.6 16c1.9 3.8 5.8 7 10.4 7z" />
            </svg>
          </button>
          <button type="button" className="btn-social-circle" title="Apple ID">
            <svg className="social-svg-icon" viewBox="0 0 24 24" fill="#000000">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.62-.75 1.04-1.8 0.93-2.85-.9.04-1.99.6-2.63 1.35-.57.65-1.06 1.71-.93 2.73.99.08 2.01-.48 2.63-1.23z" />
            </svg>
          </button>
          <button type="button" className="btn-social-circle" title="Facebook">
            <svg className="social-svg-icon" viewBox="0 0 24 24" fill="#1877F2">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
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
