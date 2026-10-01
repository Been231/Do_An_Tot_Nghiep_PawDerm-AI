import React, { useState, useRef } from 'react';
import DiagnosisResult from './DiagnosisResult';

export default function DiagnosisTab({
  pets = [],
  selectedPetId,
  setSelectedPetId,
  onOpenAddPetModal,
  selectedSymptoms = [],
  toggleSymptom,
  imagePreview,
  handleImageChange,
  diagError,
  analyzing,
  handleRunDiagnosis,
  diagnosisResult
}) {
  const fileInputRef = useRef(null);
  const [selectedSpecies, setSelectedSpecies] = useState('dog');

  const selectedPet = pets?.find(p => p.id === selectedPetId) || pets?.[0] || {
    name: 'Milo',
    species: 'Cún Cưng'
  };

  const SYMPTOMS_LIST = [
    'Không có',
    'Gãi ngứa',
    'Rụng lông',
    'Đốm tròn rụng lông',
    'Đỏ da',
    'Vảy gàu',
    'Da sần sùi',
    'Mụn mủ',
    'Chảy dịch',
    'Mùi hôi tanh',
    'Ve rận',
    'Liếm cắn liên tục'
  ];

  return (
    <div className="diagnose-two-column-layout">
      {/* CỘT TRÁI: 2 THẺ (CHỌN THÚ CƯNG & PHÂN TÍCH HÌNH ẢNH AI) */}
      <div className="diag-left-column">
        {/* THẺ 1: CHỌN THÚ CƯNG */}
        <div className="card pet-select-card">
          <div className="card-header-clean">
            <h3 className="card-title-plain">Chọn thú cưng</h3>
          </div>
          <div className="pet-select-clean-row">
            <div className="species-pills-group">
              <button
                type="button"
                className={`species-clean-pill ${selectedSpecies === 'dog' ? 'active' : ''}`}
                onClick={() => setSelectedSpecies('dog')}
              >
                🐶 Cún
              </button>
              <button
                type="button"
                className={`species-clean-pill ${selectedSpecies === 'cat' ? 'active' : ''}`}
                onClick={() => setSelectedSpecies('cat')}
              >
                🐱 Mèo
              </button>
            </div>

            {/* Thẻ thú cưng đang chọn */}
            <div 
              className="pet-current-pill" 
              onClick={onOpenAddPetModal}
              title="Nhấn để đổi hoặc thêm bé mới"
            >
              <div className="pet-avatar-circle-sm">
                {selectedPet.avatar || (selectedSpecies === 'cat' ? '🐱' : '🐶')}
              </div>
              <span className="pet-pill-title">
                {selectedPet.name} - {selectedPet.species || (selectedSpecies === 'cat' ? 'Mèo Cưng' : 'Cún Cưng')}
              </span>
            </div>
          </div>
        </div>

        {/* THẺ 2: PHÂN TÍCH HÌNH ẢNH AI */}
        <div className="card diag-image-card mt-3">
          <div className="card-header-clean">
            <h3 className="card-title-plain">Phân tích hình ảnh AI</h3>
          </div>

          {/* KHUNG NGẮM CAMERA VIEWPORT HUD */}
          <div 
            className="camera-viewfinder-clean"
            onClick={() => fileInputRef.current?.click()}
          >
            {imagePreview ? (
              <img src={imagePreview} alt="Tổn thương da" className="viewfinder-img" />
            ) : (
              <div className="viewfinder-demo-bg">
                <div className="sample-lesion-sim"></div>
              </div>
            )}

            {/* 4 Khung góc căn cự ly màu trắng [ ] */}
            <div className="vf-corner tl"></div>
            <div className="vf-corner tr"></div>
            <div className="vf-corner bl"></div>
            <div className="vf-corner br"></div>

            {/* Tâm lấy nét chữ thập trung tâm */}
            <div className="vf-center-focus">
              <div className="vf-crosshair">+</div>
            </div>

            {/* Lưới tọa độ chụp y khoa (Rule of thirds) */}
            <div className="vf-grid-h1"></div>
            <div className="vf-grid-h2"></div>
            <div className="vf-grid-v1"></div>
            <div className="vf-grid-v2"></div>

            {/* Nút chụp ảnh nổi góc dưới */}
            <button 
              type="button" 
              className="vf-capture-btn"
              onClick={(e) => {
                e.stopPropagation();
                fileInputRef.current?.click();
              }}
            >
              📷 Chụp ảnh
            </button>
          </div>

          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleImageChange} 
            accept="image/*" 
            style={{ display: 'none' }} 
          />

          {/* TRIỆU CHỨNG LÂM SÀNG */}
          <div className="symptoms-section mt-4">
            <label className="section-label-plain">Triệu chứng quan sát được (Chọn các biểu hiện của bé):</label>
            <div className="symptoms-clean-pills">
              {SYMPTOMS_LIST.map((sym) => {
                const isNone = sym === 'Không có';
                const isActive = selectedSymptoms.includes(sym);
                return (
                  <button
                    key={sym}
                    type="button"
                    className={`symptom-pill-clean ${isNone ? 'pill-none' : ''} ${isActive ? 'active' : ''}`}
                    onClick={() => toggleSymptom(sym)}
                  >
                    {isNone ? '🌿 Không có' : sym}
                  </button>
                );
              })}
            </div>
          </div>

          {diagError && (
            <div className="alert-error-banner mt-3">
              <span>{diagError}</span>
            </div>
          )}

          {/* NÚT BẮT ĐẦU CHẨN ĐOÁN AI */}
          <button 
            type="button"
            className={`btn-terracotta-full mt-4 ${analyzing ? 'loading' : ''}`}
            onClick={handleRunDiagnosis}
            disabled={analyzing}
          >
            {analyzing ? 'Mô hình AI đang quét & phân tích...' : 'Bắt đầu chẩn đoán AI'}
          </button>
        </div>
      </div>

      {/* CỘT PHẢI: KẾT QUẢ CHẨN ĐOÁN */}
      <div className="diag-right-column">
        <DiagnosisResult diagnosisResult={diagnosisResult} />
      </div>
    </div>
  );
}
