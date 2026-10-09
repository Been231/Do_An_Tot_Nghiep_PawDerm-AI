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

  // Lọc danh sách thú cưng theo loài
  const filteredPets = pets.filter(p => {
    if (selectedSpecies === 'dog') return !p.species || p.species.includes('Chó') || p.species.includes('🐶');
    if (selectedSpecies === 'cat') return p.species?.includes('Mèo') || p.species?.includes('🐱');
    return true;
  });

  const selectedPet = pets?.find(p => p.id === selectedPetId) 
    || filteredPets[0] 
    || pets?.[0] 
    || { name: 'Bé cưng', species: selectedSpecies === 'cat' ? 'Mèo 🐱' : 'Chó 🐶' };

  const handleSelectSpecies = (species) => {
    setSelectedSpecies(species);
    // Tự động chuyển selectedPet sang bé đầu tiên của loài đó nếu có
    const match = pets.find(p => {
      if (species === 'dog') return !p.species || p.species.includes('Chó') || p.species.includes('🐶');
      if (species === 'cat') return p.species?.includes('Mèo') || p.species?.includes('🐱');
      return true;
    });
    if (match) setSelectedPetId(match.id);
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
            <h3 className="card-title-plain">Chọn thú cưng khám bệnh</h3>
          </div>
          <div className="pet-select-clean-row">
            <div className="species-pills-group">
              <button
                type="button"
                className={`species-clean-pill ${selectedSpecies === 'dog' ? 'active' : ''}`}
                onClick={() => handleSelectSpecies('dog')}
              >
                🐶 Cún ({pets.filter(p => !p.species || p.species.includes('Chó') || p.species.includes('🐶')).length})
              </button>
              <button
                type="button"
                className={`species-clean-pill ${selectedSpecies === 'cat' ? 'active' : ''}`}
                onClick={() => handleSelectSpecies('cat')}
              >
                🐱 Mèo ({pets.filter(p => p.species?.includes('Mèo') || p.species?.includes('🐱')).length})
              </button>
            </div>

            {/* Chọn bé cưng cụ thể trong danh sách */}
            {filteredPets.length > 0 ? (
              <div className="pet-selector-dropdown-wrap">
                <select
                  className="clean-select-pill pet-select-dropdown"
                  value={selectedPet?.id || ''}
                  onChange={(e) => setSelectedPetId(e.target.value)}
                  title="Chọn bé cưng"
                >
                  {filteredPets.map(p => (
                    <option key={p.id} value={p.id}>
                      🐾 {p.name} - {p.species || 'Chó cưng'} {p.weight ? `(${p.weight})` : ''}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <button 
                type="button"
                className="pet-current-pill empty" 
                onClick={onOpenAddPetModal}
                title="Thêm bé cưng thuộc loài này"
              >
                <span className="pet-pill-title">+ Thêm bé {selectedSpecies === 'cat' ? 'mèo' : 'cún'} mới</span>
              </button>
            )}
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
