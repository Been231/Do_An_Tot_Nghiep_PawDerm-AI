import React from 'react';
import { Activity, Stethoscope } from 'lucide-react';
import ProgressionChart from './ProgressionChart';
import '../../styles/profileHistory.css';

export default function ProgressionTab({
  pets,
  selectedProgressionPet,
  setSelectedProgressionPet,
  progressionRecords,
  onGoToDiagnose
}) {
  return (
    <div className="progression-section">
      <div className="card mb-4">
        <div className="flex-between">
          <div>
            <h2>📈 Theo Dõi Tiến Triển Bệnh Qua Từng Ngày</h2>
            <p className="card-subtitle">
              So sánh ảnh chụp và độ hồi phục của vùng da tổn thương qua các mốc thời gian (Ngày 1 ➔ Ngày 3 ➔ Ngày 7 ➔ Ngày 14)
            </p>
          </div>

          <div className="pet-filter-dropdown">
            <label className="mr-2">Chọn bé:</label>
            <select 
              className="custom-select"
              value={selectedProgressionPet}
              onChange={(e) => setSelectedProgressionPet(e.target.value)}
            >
              <option value="all">Tất cả các bé</option>
              {pets.map(p => (
                <option key={p.id} value={p.id}>{p.avatar} {p.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {progressionRecords.length === 0 ? (
        <div className="card text-center py-5">
          <Activity size={48} className="text-muted mb-2" />
          <h3>Chưa có dữ liệu theo dõi tiến triển</h3>
          <p className="text-muted">Hãy chụp ảnh chẩn đoán bé ở Ngày 1, Ngày 3, Ngày 7... để theo dõi mức độ thuyên giảm bệnh.</p>
          <button className="btn-primary-gradient mt-3" onClick={onGoToDiagnose}>
            Chụp ảnh chẩn đoán ngay
          </button>
        </div>
      ) : (
        <>
        {/* BIỂU ĐỒ ĐƯỜNG ĐỘ TIN CẬY AI THEO MỐC NGÀY */}
        <ProgressionChart records={progressionRecords} />

        <div className="progression-timeline">
          {progressionRecords.map((item, idx) => (
            <div key={item.id || idx} className="progression-card card">
              <div className="timeline-badge-day">
                <span>Mốc</span>
                <strong>Ngày {item.day_number || (idx === 0 ? '7' : '1')}</strong>
              </div>

              <div className="progression-card-content">
                <div className="progression-img-wrapper">
                  {item.image_url ? (
                    <img src={item.image_url} alt="Tiến triển bệnh" className="progression-thumb" />
                  ) : (
                    <div className="placeholder-thumb">🐾 Ảnh hồ sơ</div>
                  )}
                </div>

                <div className="progression-details">
                  <div className="flex-between">
                    <h4 className="progression-disease-name">
                      {item.disease_name_vi || 'Nhiễm nấm da'}
                    </h4>
                    <span className="text-date">
                      {item.created_at ? new Date(item.created_at).toLocaleDateString('vi-VN') : 'Gần đây'}
                    </span>
                  </div>

                  <div className="progression-stat-chips mb-2">
                    <span className="stat-chip">Độ tin cậy AI: {item.confidence || 85}%</span>
                    <span className={`badge-status ${item.review_status === 'agreed' ? 'badge-success' : 'badge-warning'}`}>
                      {item.review_status === 'agreed' ? '✓ Bác sĩ đã xác nhận' : '⏳ Chờ Bác sĩ duyệt'}
                    </span>
                  </div>

                  <p className="progression-notes-text">
                    <strong>Ghi chú theo dõi: </strong>
                    {item.progression_notes || 'Vùng da khô se miệng, lông xung quanh bắt đầu mọc lại tơ mịn.'}
                  </p>

                  {item.doctor_notes && (
                    <div className="doctor-comment-box">
                      <Stethoscope size={14} className="text-teal" />
                      <span><strong>Nhận định của Bác sĩ ({item.doctor_name || 'Bác sĩ thú y'}):</strong> {item.doctor_notes}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
        </>
      )}
    </div>
  );
}
