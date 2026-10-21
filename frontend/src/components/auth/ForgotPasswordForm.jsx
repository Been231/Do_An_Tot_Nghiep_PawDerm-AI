import React, { useState, useEffect } from 'react';
import { Mail, KeyRound, Lock, Eye, EyeOff, AlertCircle, CheckCircle, ArrowLeft, ShieldCheck, AlertTriangle } from 'lucide-react';
import { authService } from '../../services/authService';

const GMAIL_REGEX = /^[a-z0-9][a-z0-9.]{5,29}(\+[a-z0-9._-]+)?@gmail\.com$/;

export default function ForgotPasswordForm({ onSwitchToLogin, onResetSuccess }) {
  const [email, setEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // OTP State
  const [otpSent, setOtpSent] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [resendIn, setResendIn] = useState(0);
  const [verificationToken, setVerificationToken] = useState('');
  const [emailMessage, setEmailMessage] = useState({ type: '', text: '' });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const normalizedEmail = email.trim().toLowerCase();
  const emailVerified = Boolean(verificationToken);

  // Đếm ngược thời gian gửi lại OTP
  useEffect(() => {
    if (resendIn <= 0) return undefined;
    const t = setTimeout(() => setResendIn((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [resendIn]);

  // Tiêu chuẩn độ mạnh mật khẩu
  const hasMinLength = newPassword.length >= 6;
  const hasUppercase = /[A-Z]/.test(newPassword);
  const hasNumber = /[0-9]/.test(newPassword);
  const hasSpecial = /[^A-Za-z0-9]/.test(newPassword);

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    if (verificationToken || otpSent) {
      setVerificationToken('');
      setOtpSent(false);
      setOtpCode('');
      setResendIn(0);
    }
    setEmailMessage({ type: '', text: '' });
    setError('');
  };

  const handleSendOtp = async () => {
    setError('');
    if (!GMAIL_REGEX.test(normalizedEmail)) {
      setEmailMessage({ type: 'error', text: 'Vui lòng nhập đúng định dạng Gmail (ví dụ: tenban@gmail.com)' });
      return;
    }
    setSendingOtp(true);
    try {
      const res = await authService.sendForgotPasswordOtp(normalizedEmail);
      setOtpSent(true);
      setOtpCode('');
      setResendIn(res.resend_after || 60);
      setEmailMessage({
        type: 'info',
        text: res.dev_mode
          ? 'Chế độ DEV: Máy chủ chưa cấu hình gửi mail, mã OTP được in ở console Backend.'
          : res.message || 'Đã gửi mã xác thực 6 số tới Gmail của bạn.'
      });
    } catch (err) {
      setEmailMessage({ type: 'error', text: err.message || 'Lỗi gửi mã xác thực!' });
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
      setEmailMessage({ type: 'success', text: 'Gmail đã xác thực thành công! Vui lòng đặt mật khẩu mới.' });
    } catch (err) {
      setEmailMessage({ type: 'error', text: err.message || 'Mã xác thực không chính xác hoặc đã hết hạn!' });
    } finally {
      setVerifyingOtp(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!emailVerified) {
      setError('Vui lòng xác thực mã OTP trước khi đặt mật khẩu mới!');
      return;
    }

    if (!hasMinLength) {
      setError('Mật khẩu mới phải có ít nhất 6 ký tự!');
      return;
    }

    if (!hasUppercase) {
      setError('Mật khẩu mới cần ít nhất 1 chữ in hoa (A-Z)!');
      return;
    }

    if (!hasNumber) {
      setError('Mật khẩu mới cần ít nhất 1 chữ số (0-9)!');
      return;
    }

    if (!hasSpecial) {
      setError('Mật khẩu mới cần ít nhất 1 ký tự đặc biệt (!@#$%^&*...)!');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp với mật khẩu mới!');
      return;
    }

    setLoading(true);
    try {
      const res = await authService.resetPassword({
        email: normalizedEmail,
        verification_token: verificationToken,
        new_password: newPassword
      });

      if (res.success) {
        setSuccess('🎉 Đặt lại mật khẩu thành công! Đang chuyển bạn về màn hình đăng nhập...');
        setTimeout(() => {
          if (onResetSuccess) {
            onResetSuccess(res.username || normalizedEmail);
          } else if (onSwitchToLogin) {
            onSwitchToLogin();
          }
        }, 1200);
      }
    } catch (err) {
      setError(err.message || 'Lỗi khi đặt lại mật khẩu, vui lòng thử lại!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-form-card-inner animate-fadeIn">
      {/* NÚT QUAY LẠI ĐĂNG NHẬP */}
      <div className="forgot-nav-top">
        <button
          type="button"
          className="btn-back-clean"
          onClick={onSwitchToLogin}
          title="Quay lại đăng nhập"
        >
          <ArrowLeft size={16} />
          <span>Quay lại Đăng nhập</span>
        </button>
      </div>

      <div className="forgot-header-text">
        <h2 className="forgot-title">Khôi Phục Mật Khẩu</h2>
        <p className="forgot-desc">
          Nhập địa chỉ Gmail tài khoản của bạn để nhận mã xác thực OTP và thiết lập lại mật khẩu.
        </p>
      </div>

      {error && (
        <div className="auth-alert-message error">
          <AlertCircle size={16} style={{ flexShrink: 0 }} />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="auth-alert-message success">
          <CheckCircle size={16} style={{ flexShrink: 0 }} />
          <span>{success}</span>
        </div>
      )}

      <form onSubmit={handleResetPassword}>
        {/* KHUNG XÁC THỰC GMAIL BẰNG MÃ OTP */}
        <div className={`gmail-verify-box ${emailVerified ? 'verified' : ''} mb-3`}>
          <div className="gmail-verify-row">
            <div className={`input-wrapper-pill gmail-input-wrap ${emailVerified ? 'is-verified' : ''}`}>
              <Mail size={18} className="input-icon-left" />
              <input
                type="email"
                id="forgot-gmail"
                className="clean-input-pill"
                placeholder="Gmail tài khoản của bạn *"
                value={email}
                onChange={handleEmailChange}
                autoComplete="email"
                disabled={emailVerified}
                required
              />
              {emailVerified && <ShieldCheck size={18} className="gmail-verified-icon" />}
            </div>
            {!emailVerified && (
              <button
                type="button"
                id="btn-forgot-send-otp"
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
                  id="forgot-otp"
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
                  autoFocus
                />
              </div>
              <button
                type="button"
                id="btn-forgot-verify-otp"
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
              {emailMessage.type === 'success' ? (
                <ShieldCheck size={15} />
              ) : emailMessage.type === 'error' ? (
                <AlertTriangle size={15} />
              ) : (
                <Mail size={15} />
              )}
              <span>{emailMessage.text}</span>
            </div>
          )}
        </div>

        {/* BƯỚC 2: ĐẶT MẬT KHẨU MỚI (CHỈ MỞ KHI ĐÃ XÁC THỰC OTP) */}
        {emailVerified && (
          <div className="reset-pwd-fields animate-fadeIn">
            {/* INPUT MẬT KHẨU MỚI */}
            <div className="input-wrapper-pill mb-2">
              <Lock size={18} className="input-icon-left" />
              <input
                type={showPassword ? 'text' : 'password'}
                className="clean-input-pill"
                placeholder="Mật khẩu mới *"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="input-toggle-eye"
                onClick={() => setShowPassword(!showPassword)}
                title={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {/* CHECKLIST YÊU CẦU BẢO MẬT */}
            <div className="password-checklist-box mb-3">
              <span className="checklist-title">Tiêu chuẩn mật khẩu an toàn:</span>
              <div className="checklist-grid">
                <span className={`pwd-check-item ${hasMinLength ? 'passed' : ''}`}>
                  <span className="check-bullet">{hasMinLength ? '✓' : '○'}</span> Tối thiểu 6 ký tự
                </span>
                <span className={`pwd-check-item ${hasUppercase ? 'passed' : ''}`}>
                  <span className="check-bullet">{hasUppercase ? '✓' : '○'}</span> 1 chữ in hoa (A-Z)
                </span>
                <span className={`pwd-check-item ${hasNumber ? 'passed' : ''}`}>
                  <span className="check-bullet">{hasNumber ? '✓' : '○'}</span> 1 chữ số (0-9)
                </span>
                <span className={`pwd-check-item ${hasSpecial ? 'passed' : ''}`}>
                  <span className="check-bullet">{hasSpecial ? '✓' : '○'}</span> 1 ký tự đặc biệt (!@#$)
                </span>
              </div>
            </div>

            {/* INPUT XÁC NHẬN MẬT KHẨU MỚI */}
            <div className="input-wrapper-pill mb-3">
              <Lock size={18} className="input-icon-left" />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                className="clean-input-pill"
                placeholder="Xác nhận mật khẩu mới *"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="input-toggle-eye"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                title={showConfirmPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {/* NÚT HOÀN TẤT */}
            <button
              type="submit"
              className="btn-primary-pill mt-2"
              disabled={loading || !newPassword || !confirmPassword}
            >
              {loading ? 'ĐANG CẬP NHẬT...' : 'ĐẶT LẠI MẬT KHẨU'}
            </button>
          </div>
        )}
      </form>
    </div>
  );
}
