import React from 'react';
import { Camera, Upload, Sun, ZoomIn, Info, CheckCircle2 } from 'lucide-react';

export default function CameraGuide({ imagePreview, onFileSelect, fileInputRef }) {
  return (
    <div className="framing-guide-container mb-4">
      <div className="guide-banner-header">
        <div className="guide-title">
          <Camera size={16} className="text-teal" />
          <span>Khung Chuẩn Y Tế — Hướng Dẫn Căn Góc Chụp Rõ Nét & Đủ Sáng</span>
        </div>
        <span className="guide-badge">Chuẩn Y Khoa</span>
      </div>

      {/* KHUNG NGẮM CAMERA HUD CHUYÊN NGHIỆP */}
      <div 
        className={`camera-viewfinder-hud ${imagePreview ? 'has-image' : ''}`}
        onClick={() => fileInputRef.current?.click()}
      >
        <div className="hud-corner top-left"></div>
        <div className="hud-corner top-right"></div>
        <div className="hud-corner bottom-left"></div>
        <div className="hud-corner bottom-right"></div>
        <div className="hud-crosshair"></div>

        {imagePreview ? (
          <div className="hud-preview-wrapper">
            <img src={imagePreview} alt="Tổn thương da" className="hud-preview-img" />
            <div className="hud-overlay-tag">
              <span>✓ Đã căn đúng khung tiêu cự</span>
            </div>
          </div>
        ) : (
          <div className="hud-placeholder-content">
            <Upload size={38} className="hud-upload-icon animate-bounce" />
            <strong className="hud-upload-title">Nhấn để tải ảnh từ Thư viện hoặc Kéo thả vào đây</strong>
            <p className="hud-upload-desc">Hỗ trợ JPG, PNG, WEBP độ phân giải cao</p>
          </div>
        )}
      </div>

      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={onFileSelect} 
        accept="image/*" 
        style={{ display: 'none' }} 
      />

      {/* CHECKLIST CHUẨN CHỤP ẢNH DA LIỄU */}
      <div className="framing-checklist-grid">
        <div className="check-item">
          <Sun size={15} className="check-icon sun" />
          <div>
            <strong>Đủ ánh sáng tự nhiên</strong>
            <span>Bật đèn trắng hoặc ra nơi sáng, tránh đổ bóng che mờ tổn thương</span>
          </div>
        </div>
        <div className="check-item">
          <ZoomIn size={15} className="check-icon zoom" />
          <div>
            <strong>Cự ly 10 - 15 cm</strong>
            <span>Chụp trực diện 90°, giữ cự ly vừa phải để thấy rõ rìa đồng xu / vảy gàu</span>
          </div>
        </div>
        <div className="check-item">
          <Info size={15} className="check-icon info" />
          <div>
            <strong>Vạch nhẹ lông</strong>
            <span>Vạch lông sang 2 bên để lộ rõ lớp biểu bì đang viêm, rụng hoặc mụn mủ</span>
          </div>
        </div>
        <div className="check-item">
          <CheckCircle2 size={15} className="check-icon focus" />
          <div>
            <strong>Lấy nét rõ (Không rung)</strong>
            <span>Chạm màn hình lấy nét vào tâm nốt thương tổn trước khi bấm chụp</span>
          </div>
        </div>
      </div>
    </div>
  );
}
