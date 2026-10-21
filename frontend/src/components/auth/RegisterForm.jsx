import React, { useEffect, useState } from 'react';
import { User, Lock, Phone, Heart, AlertCircle, CheckCircle, AlertTriangle, Mail, ShieldCheck, KeyRound, Eye, EyeOff } from 'lucide-react';
import { authService } from '../../services/authService';

const GMAIL_REGEX = /^[a-z0-9][a-z0-9.]{5,29}(\+[a-z0-9._-]+)?@gmail\.com$/;

export default function RegisterForm({ onRegisterSuccess, onSwitchToLogin }) {
  // Thông tin người dùng
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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

  // Tiêu chí bảo mật mật khẩu (Viết hoa, số, ký tự đặc biệt, độ dài)
  const hasMinLength = password.length >= 6;
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);
  const fulfilledCount = [hasMinLength, hasUppercase, hasNumber, hasSpecial].filter(Boolean).length;

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

    if (!hasUppercase) {
      setError('Mật khẩu cần có ít nhất 1 chữ in hoa (A-Z)!');
      return;
    }

    if (!hasNumber) {
      setError('Mật khẩu cần có ít nhất 1 chữ số (0-9)!');
      return;
    }

    if (!hasSpecial) {
      setError('Mật khẩu cần có ít nhất 1 ký tự đặc biệt (ví dụ: !@#$%^&*...)!');
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
        const savedUsername = username.trim();
        const savedPet = petName.trim();
        setSuccess(`🎉 Đăng ký thành công! Đã tạo tài khoản và hồ sơ cho bé "${savedPet}". Đang chuyển sang màn hình đăng nhập...`);
        setTimeout(() => {
          if (onRegisterSuccess) {
            onRegisterSuccess(savedUsername, savedPet);
          }
        }, 1200);
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
          <div className="password-field-wrapper">
            <div className="input-wrapper-pill">
              <Lock size={18} className="input-icon-left" />
              <input
                type={showPassword ? "text" : "password"}
                className="clean-input-pill"
                placeholder="Mật khẩu *"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="input-toggle-eye"
                onClick={() => setShowPassword(!showPassword)}
                title={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {/* HIỂN THỊ TIÊU CHÍ VIẾT HOA, SỐ, KÝ TỰ ĐẶC BIỆT KHI GHI VÀO Ô MẬT KHẨU */}
            {password.length > 0 && (
              <div className="password-checklist-box animate-fadeIn">
                <div className="password-strength-mini-bar">
                  <div className="pwd-bars">
                    {[1, 2, 3, 4].map((step) => (
                      <span
                        key={step}
                        className={`pwd-bar-item ${step <= fulfilledCount ? `level-${fulfilledCount}` : ''}`}
                      />
                    ))}
                  </div>
                  <span className={`pwd-strength-tag level-${fulfilledCount}`}>
                    {fulfilledCount <= 1 ? 'Rất yếu' : fulfilledCount === 2 ? 'Yếu' : fulfilledCount === 3 ? 'Khá' : 'Mạnh'}
                  </span>
                </div>
                <div className="password-checklist-grid">
                  <div className={`pwd-check-item ${hasUppercase ? 'passed' : ''}`}>
                    <span className="check-bullet">{hasUppercase ? '✓' : '○'}</span>
                    <span>Chữ viết hoa (A-Z)</span>
                  </div>
                  <div className={`pwd-check-item ${hasNumber ? 'passed' : ''}`}>
                    <span className="check-bullet">{hasNumber ? '✓' : '○'}</span>
                    <span>Chữ số (0-9)</span>
                  </div>
                  <div className={`pwd-check-item ${hasSpecial ? 'passed' : ''}`}>
                    <span className="check-bullet">{hasSpecial ? '✓' : '○'}</span>
                    <span>Ký tự đặc biệt (!@#$%...)</span>
                  </div>
                  <div className={`pwd-check-item ${hasMinLength ? 'passed' : ''}`}>
                    <span className="check-bullet">{hasMinLength ? '✓' : '○'}</span>
                    <span>Tối thiểu 6 ký tự</span>
                  </div>
                </div>
              </div>
            )}
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

        {/* LIÊN KẾT CHUYỂN VỀ ĐĂNG NHẬP */}
        <div className="auth-switch-prompt mt-3">
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
