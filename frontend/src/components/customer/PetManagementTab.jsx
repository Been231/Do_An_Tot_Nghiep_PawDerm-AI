import React from 'react';
import { Plus, Trash2, Camera } from 'lucide-react';

export default function PetManagementTab({
  pets,
  onOpenAddPetModal,
  handleDeletePet,
  onSelectPetToDiagnose
}) {
  return (
    <div className="pets-section">
      <div className="flex-between mb-4">
        <div>
          <h2>🐾 Danh Sách Hồ Sơ Thú Cưng Của Bạn</h2>
          <p className="card-subtitle">Quản lý giống loài, tuổi và tình trạng sức khỏe của từng bé</p>
        </div>
        <button className="btn-primary-gradient" onClick={onOpenAddPetModal}>
          <Plus size={16} /> Thêm Thú Cưng Mới
        </button>
      </div>

      <div className="pets-grid">
        {pets.map(p => (
          <div key={p.id} className="card pet-card">
            <div className="pet-card-top">
              <div className="pet-avatar-large">{p.avatar || (p.species?.includes('Mèo') ? '🐱' : '🐶')}</div>
              <div className="pet-main-info">
                <h3 className="pet-name">{p.name}</h3>
                <span className="pet-species-tag">{p.species} • {p.breed || 'Chưa rõ giống'}</span>
              </div>
              <button 
                className="btn-icon-delete" 
                onClick={() => handleDeletePet(p.id)} 
                title="Xóa bé này"
              >
                <Trash2 size={16} />
              </button>
            </div>

            <div className="pet-attributes-grid mt-3">
              <div className="attr-cell">
                <span className="attr-label">Tuổi</span>
                <strong className="attr-val">{p.age || '1 tuổi'}</strong>
              </div>
              <div className="attr-cell">
                <span className="attr-label">Cân nặng</span>
                <strong className="attr-val">{p.weight || 'Chưa cân'}</strong>
              </div>
              <div className="attr-cell">
                <span className="attr-label">Sức khỏe</span>
                <strong className="attr-val text-success">{p.health_status || 'Bình thường'}</strong>
              </div>
            </div>

            {p.notes && (
              <p className="pet-notes mt-2">
                <strong>Ghi chú:</strong> {p.notes}
              </p>
            )}

            <button 
              className="btn-outline-action mt-3 w-100"
              onClick={() => onSelectPetToDiagnose(p.id)}
            >
              <Camera size={14} /> Chụp ảnh khám cho bé
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
