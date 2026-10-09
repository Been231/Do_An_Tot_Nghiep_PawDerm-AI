import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import petMascot from '../assets/pet_companion.jpg';
import LoginForm from '../components/auth/LoginForm';
import RegisterForm from '../components/auth/RegisterForm';
import '../styles/authSlider.css';

export default function AuthPage({ onLoginSuccess, initialTab = 'login', isModal = false, onClose }) {
  const [activeTab, setActiveTab] = useState(initialTab);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  // Hỗ trợ phím Escape đóng modal nhanh chóng
  useEffect(() => {
    if (!isModal || !onClose) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isModal, onClose]);

  const handleRegisterSuccess = (username, password, createdUser) => {
    // Nếu có user trả về từ đăng ký, tự động đăng nhập và đưa vào trang chủ ngay
    if (createdUser && onLoginSuccess) {
      setTimeout(() => {
        onLoginSuccess(createdUser);
      }, 700);
    } else {
      setActiveTab('login');
    }
  };

  const cardContent = (
    <div className="auth-split-card" onClick={(e) => e.stopPropagation()}>
      {/* Nút đóng modal nếu đang mở dạng popup */}
      {isModal && onClose && (
        <button
          type="button"
          className="auth-modal-close-btn"
          onClick={onClose}
          title="Đóng cửa sổ"
          aria-label="Đóng"
        >
          <X size={20} />
        </button>
      )}

      {/* CỘT TRÁI: HÌNH ẢNH CHÓ MÈO TO RÕ & LOGO/SLOGAN */}
      <div className="auth-hero-column">
        <div className="hero-mascot-showcase">
          <img 
            src={petMascot} 
            alt="Chó và Mèo - PawDerm AI" 
            className="hero-mascot-img"
          />
        </div>
        <div className="hero-brand-bottom">
          <div className="brand-logo-inline">
            <span className="brand-logo-icon">🐾</span>
            <h1 className="brand-name-text">PawDerm <span>AI</span></h1>
          </div>
          <p className="brand-slogan-text">
            Chăm sóc da liễu cho chó & mèo bằng công nghệ AI
          </p>
        </div>
      </div>

      {/* CỘT PHẢI: FORM ĐĂNG NHẬP / ĐĂNG KÝ */}
      <div className="auth-form-column">
        {activeTab === 'login' ? (
          <LoginForm 
            onLoginSuccess={onLoginSuccess} 
            onSwitchToRegister={() => setActiveTab('register')} 
          />
        ) : (
          <RegisterForm 
            onRegisterSuccess={handleRegisterSuccess} 
            onSwitchToLogin={() => setActiveTab('login')} 
          />
        )}
      </div>
    </div>
  );

  if (isModal) {
    return (
      <div className="auth-modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
        <div className="auth-modal-container">
          {cardContent}
        </div>
      </div>
    );
  }

  return (
    <div className="auth-root-layout">
      {cardContent}
    </div>
  );
}
