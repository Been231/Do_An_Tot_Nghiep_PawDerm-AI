import React, { useEffect, useState } from 'react';
import { X, User, Phone, MapPin, Mail, Lock, KeyRound, Eye, EyeOff, CheckCircle, AlertCircle, Save, ShieldCheck } from 'lucide-react';
import { authService } from '../../services/authService';
import '../../styles/profileHistory.css';

const ROLE_LABEL = { admin: 'Quản trị viên', doctor: 'Bác sĩ thú y', customer: 'Chủ nuôi' };

/**
 * Modal Hồ sơ cá nhân gồm 2 tab:
 *  - Thông tin cá nhân: sửa họ tên, SĐT, địa chỉ
 *  - Đổi mật khẩu: nhập mật khẩu hiện tại -> mật khẩu mới -> xác nhận
 */
export default function ProfileModal({ currentUser, initialTab = 'info', onClose, onUpdated }) {
  const [tab, setTab] = useState(initialTab);

  // Thông tin cá nhân
  const [fullName, setFullName] = useState(currentUser?.full_name || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [address, setAddress] = useState(currentUser?.address || '');
  const [savingInfo, setSavingInfo] = useState(false);
  const [infoMsg, setInfoMsg] = useState({ type: '', text: '' });

  // Đổi mật khẩu
  const [oldPwd, setOldPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [savingPwd, setSavingPwd] = useState(false);
  const [pwdMsg, setPwdMsg] = useState({ type: '', text: '' });

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose?.();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const role = currentUser?.role || 'customer';
  const pwdStrength = (() => {
    let s = 0;
    if (newPwd.length >= 6) s++;
    if (newPwd.length >= 10) s++;
    if (/[A-Z]/.test(newPwd) && /[a-z]/.test(newPwd)) s++;
    if (/\d/.test(newPwd)) s++;
    if (/[^A-Za-z0-9]/.test(newPwd)) s++;
    return Math.min(s, 4);
  })();
  const strengthLabel = ['Rất yếu', 'Yếu', 'Trung bình', 'Mạnh', 'Rất mạnh'][pwdStrength];

  const handleSaveInfo = async (e) => {
    e.preventDefault();
    setInfoMsg({ type: '', text: '' });
    if (!fullName.trim()) {
      setInfoMsg({ type: 'error', text: 'Họ và tên không được để trống!' });
      return;
    }
    if (!/^0\d{9}$/.test(phone.trim())) {
      setInfoMsg({ type: 'error', text: 'Số điện thoại phải gồm đúng 10 chữ số và bắt đầu bằng số 0!' });
      return;
    }
    setSavingInfo(true);
    try {
      const res = await authService.updateMyProfile(currentUser.id, {
        full_name: fullName.trim(),
        phone: phone.trim(),
        address: address.trim()
      });
      const merged = { ...currentUser, ...(res.user || {}), full_name: fullName.trim(), phone: phone.trim(), address: address.trim() };
      onUpdated?.(merged);
      setInfoMsg({ type: 'success', text: 'Đã lưu thông tin hồ sơ cá nhân!' });
    } catch (err) {
      setInfoMsg({ type: 'error', text: err.message });
    } finally {
      setSavingInfo(false);
    }
  };

  const handleChangePwd = async (e) => {
    e.preventDefault();
    setPwdMsg({ type: '', text: '' });
    if (!oldPwd || !newPwd || !confirmPwd) {
      setPwdMsg({ type: 'error', text: 'Vui lòng nhập đầy đủ 3 ô mật khẩu!' });
      return;
    }
    if (newPwd.length < 6) {
      setPwdMsg({ type: 'error', text: 'Mật khẩu mới phải có ít nhất 6 ký tự!' });
      return;
    }
    if (newPwd !== confirmPwd) {
      setPwdMsg({ type: 'error', text: 'Mật khẩu xác nhận không khớp!' });
      return;
    }
    if (newPwd === oldPwd) {
      setPwdMsg({ type: 'error', text: 'Mật khẩu mới phải khác mật khẩu hiện tại!' });
      return;
    }
    setSavingPwd(true);
    try {
      await authService.changePassword(currentUser.id, oldPwd, newPwd);
      setPwdMsg({ type: 'success', text: 'Đổi mật khẩu thành công! Lần đăng nhập sau hãy dùng mật khẩu mới.' });
      setOldPwd('');
      setNewPwd('');
      setConfirmPwd('');
    } catch (err) {
      setPwdMsg({ type: 'error', text: err.message });
    } finally {
      setSavingPwd(false);
    }
  };

  const Msg = ({ msg }) =>
    msg.text ? (
      <div className={`pf-alert ${msg.type}`}>
        {msg.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
        <span>{msg.text}</span>
      </div>
    ) : null;

  return (
    <div className="pf-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="pf-modal" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="pf-close" onClick={onClose} aria-label="Đóng">
          <X size={18} />
        </button>

        {/* Đầu modal: avatar + tên + vai trò */}
        <div className="pf-head">
          <div className="pf-avatar">{role === 'admin' ? '⚙️' : role === 'doctor' ? '🩺' : '🐶'}</div>
          <div>
            <h2 className="pf-name">{currentUser?.full_name || currentUser?.username}</h2>
            <div className="pf-meta">
              <span className={`pf-role ${role}`}>{ROLE_LABEL[role] || 'Chủ nuôi'}</span>
              <span className="pf-username">@{currentUser?.username}</span>
            </div>
          </div>
        </div>

        <div className="pf-tabs">
          <button type="button" className={`pf-tab ${tab === 'info' ? 'active' : ''}`} onClick={() => setTab('info')}>
            <User size={15} /> Thông tin cá nhân
          </button>
          <button type="button" className={`pf-tab ${tab === 'password' ? 'active' : ''}`} onClick={() => setTab('password')}>
            <KeyRound size={15} /> Đổi mật khẩu
          </button>
        </div>

        {tab === 'info' ? (
          <form className="pf-body" onSubmit={handleSaveInfo}>
            <Msg msg={infoMsg} />

            <label className="pf-label">Gmail đăng nhập</label>
            <div className="pf-field disabled">
              <Mail size={16} />
              <input type="text" value={currentUser?.email || 'Chưa có'} disabled />
              <ShieldCheck size={16} className="pf-lock-icon" title="Không thể thay đổi" />
            </div>

            <label className="pf-label">Họ và tên *</label>
            <div className="pf-field">
              <User size={16} />
              <input id="profile-fullname" type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Nguyễn Văn A" />
            </div>

            <label className="pf-label">Số điện thoại *</label>
            <div className="pf-field">
              <Phone size={16} />
              <input
                id="profile-phone"
                type="tel"
                value={phone}
                maxLength={10}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                placeholder="0901234567"
              />
            </div>

            <label className="pf-label">Địa chỉ</label>
            <div className="pf-field">
              <MapPin size={16} />
              <input id="profile-address" type="text" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Số nhà, đường, quận, thành phố" />
            </div>

            <button id="btn-save-profile" type="submit" className="pf-btn-primary" disabled={savingInfo}>
              <Save size={16} /> {savingInfo ? 'Đang lưu...' : 'Lưu thay đổi'}
            </button>
          </form>
        ) : (
          <form className="pf-body" onSubmit={handleChangePwd}>
            <Msg msg={pwdMsg} />

            <label className="pf-label">Mật khẩu hiện tại *</label>
            <div className="pf-field">
              <Lock size={16} />
              <input id="pwd-old" type={showPwd ? 'text' : 'password'} value={oldPwd} onChange={(e) => setOldPwd(e.target.value)} autoComplete="current-password" />
              <button type="button" className="pf-eye" onClick={() => setShowPwd(!showPwd)} aria-label="Hiện/ẩn mật khẩu">
                {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            <label className="pf-label">Mật khẩu mới * (tối thiểu 6 ký tự)</label>
            <div className="pf-field">
              <KeyRound size={16} />
              <input id="pwd-new" type={showPwd ? 'text' : 'password'} value={newPwd} onChange={(e) => setNewPwd(e.target.value)} autoComplete="new-password" />
            </div>
            {newPwd && (
              <div className="pf-strength">
                <div className="pf-strength-bar">
                  {[0, 1, 2, 3].map((i) => (
                    <span key={i} className={i < pwdStrength ? `on s${pwdStrength}` : ''} />
                  ))}
                </div>
                <small>Độ mạnh: {strengthLabel}</small>
              </div>
            )}

            <label className="pf-label">Nhập lại mật khẩu mới *</label>
            <div className={`pf-field ${confirmPwd && confirmPwd !== newPwd ? 'invalid' : ''}`}>
              <KeyRound size={16} />
              <input id="pwd-confirm" type={showPwd ? 'text' : 'password'} value={confirmPwd} onChange={(e) => setConfirmPwd(e.target.value)} autoComplete="new-password" />
            </div>
            {confirmPwd && confirmPwd !== newPwd && <small className="pf-hint-error">Mật khẩu xác nhận chưa khớp</small>}

            <button id="btn-change-password" type="submit" className="pf-btn-primary" disabled={savingPwd}>
              <KeyRound size={16} /> {savingPwd ? 'Đang đổi...' : 'Đổi mật khẩu'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
