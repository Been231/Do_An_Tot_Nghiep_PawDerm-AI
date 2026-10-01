import React from 'react';

export default function DiseaseModal({
  show,
  onClose,
  onSubmit,
  editingDisease,
  diseaseForm,
  setDiseaseForm
}) {
  if (!show) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal-box card large animate-scaleUp">
        <div className="flex-between mb-3">
          <h3>{editingDisease ? '✏️ Chỉnh Sửa Bệnh Học' : '➕ Thêm Bệnh Mới Vào Từ Điển'}</h3>
          <button className="btn-close" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={onSubmit}>
          <div className="form-row-3 mb-3">
            <div className="form-group">
              <label className="input-label">Mã bệnh key (*):</label>
              <input 
                type="text" 
                className="custom-input" 
                placeholder="ví dụ: ringworm, mange..."
                value={diseaseForm.disease_key}
                onChange={(e) => setDiseaseForm({ ...diseaseForm, disease_key: e.target.value })}
                disabled={!!editingDisease}
                required 
              />
            </div>
            <div className="form-group">
              <label className="input-label">Tên tiếng Việt (*):</label>
              <input 
                type="text" 
                className="custom-input" 
                placeholder="Ví dụ: Nhiễm nấm da..."
                value={diseaseForm.name_vi}
                onChange={(e) => setDiseaseForm({ ...diseaseForm, name_vi: e.target.value })}
                required 
              />
            </div>
            <div className="form-group">
              <label className="input-label">Tên khoa học / tiếng Anh:</label>
              <input 
                type="text" 
                className="custom-input" 
                placeholder="Ringworm (Dermatophytosis)"
                value={diseaseForm.name_en}
                onChange={(e) => setDiseaseForm({ ...diseaseForm, name_en: e.target.value })} 
              />
            </div>
          </div>

          <div className="form-group mb-3">
            <label className="input-label">Nguyên nhân bệnh học vi sinh (*):</label>
            <textarea 
              className="custom-textarea" 
              rows="2"
              placeholder="Chủng nấm hoặc ký sinh trùng gây bệnh..."
              value={diseaseForm.cause}
              onChange={(e) => setDiseaseForm({ ...diseaseForm, cause: e.target.value })}
              required
            ></textarea>
          </div>

          <div className="form-group mb-3">
            <label className="input-label">Triệu chứng lâm sàng (Mỗi dòng một triệu chứng):</label>
            <textarea 
              className="custom-textarea" 
              rows="3"
              placeholder="Rụng lông hình tròn&#10;Bong vảy gàu trắng&#10;Ngứa ngáy dữ dội..."
              value={diseaseForm.clinical_symptoms_text}
              onChange={(e) => setDiseaseForm({ ...diseaseForm, clinical_symptoms_text: e.target.value })}
            ></textarea>
          </div>

          <div className="form-row-2 mb-3">
            <div className="form-group">
              <label className="input-label">Mức độ nguy hiểm:</label>
              <select 
                className="custom-select"
                value={diseaseForm.severity_level}
                onChange={(e) => setDiseaseForm({ ...diseaseForm, severity_level: e.target.value })}
              >
                <option value="Thấp">Thấp</option>
                <option value="Trung bình">Trung bình</option>
                <option value="Nguy hiểm">Nguy hiểm - Cần can thiệp y tế</option>
              </select>
            </div>

            <div className="form-group">
              <label className="input-label">Khả năng lây sang người:</label>
              <label className="checkbox-label mt-2">
                <input 
                  type="checkbox" 
                  checked={diseaseForm.is_zoonotic}
                  onChange={(e) => setDiseaseForm({ ...diseaseForm, is_zoonotic: e.target.checked })}
                />
                <span>Có nguy cơ lây truyền sang người (Zoonotic)</span>
              </label>
            </div>
          </div>

          {diseaseForm.is_zoonotic && (
            <div className="form-group mb-3">
              <label className="input-label">Lời cảnh báo lây người:</label>
              <input 
                type="text" 
                className="custom-input" 
                placeholder="Bệnh lây sang người qua tiếp xúc trực tiếp bào tử nấm..."
                value={diseaseForm.zoonotic_warning}
                onChange={(e) => setDiseaseForm({ ...diseaseForm, zoonotic_warning: e.target.value })}
              />
            </div>
          )}

          <div className="form-group mb-3">
            <label className="input-label">Khuyến nghị sơ cứu tại nhà (Mỗi dòng một bước):</label>
            <textarea 
              className="custom-textarea" 
              rows="3"
              placeholder="Đeo loa chống liếm&#10;Vệ sinh bằng nước muối sinh lý&#10;Mang găng tay..."
              value={diseaseForm.home_first_aid_text}
              onChange={(e) => setDiseaseForm({ ...diseaseForm, home_first_aid_text: e.target.value })}
            ></textarea>
          </div>

          <div className="form-group mb-4">
            <label className="input-label">Dấu hiệu nguy cấp cần đi bác sĩ ngay (Mỗi dòng một dấu hiệu):</label>
            <textarea 
              className="custom-textarea" 
              rows="2"
              placeholder="Lở loét diện tích trên 30% cơ thể&#10;Sốt cao li bì bỏ ăn..."
              value={diseaseForm.emergency_signs_text}
              onChange={(e) => setDiseaseForm({ ...diseaseForm, emergency_signs_text: e.target.value })}
            ></textarea>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-outline-action" onClick={onClose}>Hủy</button>
            <button type="submit" className="btn-primary-gradient">Lưu Từ Điển Bệnh Học</button>
          </div>
        </form>
      </div>
    </div>
  );
}
