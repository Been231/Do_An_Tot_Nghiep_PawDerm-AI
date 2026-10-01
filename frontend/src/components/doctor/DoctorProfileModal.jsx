import React from 'react';

export default function DoctorProfileModal({
  show,
  onClose,
  onSubmit,
  clinicName,
  setClinicName,
  specialty,
  setSpecialty,
  updatingProfile
}) {
  if (!show) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal-box card animate-scaleUp">
        <div className="flex-between mb-3">
          <h3>🩺 Cập Nhật Thông Tin Phòng Khám & Chuyên Môn</h3>
          <button className="btn-close" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={onSubmit}>
          <div className="form-group mb-3">
            <label className="input-label">Phòng Khám / Bệnh Viện Thú Y Đang Công Tác (*):</label>
            <input 
              type="text" 
              className="custom-input" 
              value={clinicName} 
              onChange={(e) => setClinicName(e.target.value)}
              required 
            />
          </div>

          <div className="form-group mb-4">
            <label className="input-label">Lĩnh Vực Chuyên Môn / Chứng Chỉ Hành Nghề (*):</label>
            <input 
              type="text" 
              className="custom-input" 
              value={specialty} 
              onChange={(e) => setSpecialty(e.target.value)}
              required 
            />
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-outline-action" onClick={onClose}>Hủy</button>
            <button type="submit" className="btn-primary-gradient" disabled={updatingProfile}>
              {updatingProfile ? 'Đang lưu...' : 'Lưu Thay Đổi'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
