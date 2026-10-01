import React, { useState } from 'react';
import petMascot from '../assets/pet_companion.jpg';
import LoginForm from '../components/auth/LoginForm';
import RegisterForm from '../components/auth/RegisterForm';
import '../styles/authSlider.css';

export default function AuthPage({ onLoginSuccess }) {
  const [activeTab, setActiveTab] = useState('login'); // 'login' | 'register'

  return (
    <div className="auth-root-layout">
      {/* THẺ ĐĂNG NHẬP TRUNG TÂM CHIA ĐÔI THEO MẪU MOCKUP */}
      <div className="auth-split-card">
        
        {/* ============================================================
            CỘT TRÁI: HÌNH ẢNH CHÓ MÈO TO RÕ & LOGO/SLOGAN PHÍA DƯỚI
           ============================================================ */}
        <div className="auth-hero-column">
          {/* HÌNH ẢNH ĐÔI BẠN CÚN & MÈO LỚN TRUNG TÂM */}
          <div className="hero-mascot-showcase">
            <img 
              src={petMascot} 
              alt="Chó và Mèo - PawDerm AI" 
              className="hero-mascot-img"
            />
          </div>

          {/* TÊN THƯƠNG HIỆU VÀ DÒNG CHỮ CHĂM SÓC DA LIỄU PHÍA DƯỚI */}
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

        {/* ============================================================
            CỘT PHẢI: FORM ĐĂNG NHẬP / ĐĂNG KÝ
           ============================================================ */}
        <div className="auth-form-column">
          {activeTab === 'login' ? (
            <LoginForm 
              onLoginSuccess={onLoginSuccess} 
              onSwitchToRegister={() => setActiveTab('register')} 
            />
          ) : (
            <RegisterForm 
              onRegisterSuccess={() => setActiveTab('login')} 
              onSwitchToLogin={() => setActiveTab('login')} 
            />
          )}
        </div>

      </div>
    </div>
  );
}
