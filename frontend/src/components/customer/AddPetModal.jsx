import React from 'react';

export default function AddPetModal({
  show,
  onClose,
  onSubmit,
  petName,
  setPetName,
  species,
  setSpecies,
  weight,
  setWeight,
  notes,
  setNotes
}) {
  if (!show) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal-box card animate-scaleUp">
        <div className="flex-between mb-3">
          <h3>🐾 Thêm Hồ Sơ Thú Cưng Mới</h3>
          <button className="btn-close" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={onSubmit}>
          <div className="form-group mb-3">
            <label className="input-label">Tên Thú Cưng (*):</label>
            <input 
              type="text" 
              className="custom-input" 
              placeholder="Ví dụ: Bé Miu Miu, Cún Lu Lu..." 
              value={petName} 
              onChange={(e) => setPetName(e.target.value)}
              required 
            />
          </div>

          <div className="form-row-2 mb-3">
            <div className="form-group">
              <label className="input-label">Loài (*):</label>
              <select 
                className="custom-select" 
                value={species} 
                onChange={(e) => setSpecies(e.target.value)}
              >
                <option value="Chó 🐶">Chó 🐶</option>
                <option value="Mèo 🐱">Mèo 🐱</option>
              </select>
            </div>
            <div className="form-group">
              <label className="input-label">Cân nặng:</label>
              <input 
                type="text" 
                className="custom-input" 
                placeholder="Ví dụ: 4.5 kg, 12 kg..." 
                value={weight} 
                onChange={(e) => setWeight(e.target.value)} 
              />
            </div>
          </div>

          <div className="form-group mb-4">
            <label className="input-label">Tiền sử dị ứng / Ghi chú:</label>
            <textarea 
              className="custom-textarea" 
              rows="3"
              placeholder="Ví dụ: Dị ứng thức ăn có thịt bò, đã tiêm ngừa dại..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            ></textarea>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-outline-action" onClick={onClose}>Hủy</button>
            <button type="submit" className="btn-primary-gradient">Lưu Hồ Sơ</button>
          </div>
        </form>
      </div>
    </div>
  );
}
