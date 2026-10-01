import React from 'react';
import { Sparkles, Stethoscope, Edit3, CheckCircle } from 'lucide-react';

export const COMMON_DISEASES_OPTIONS = [
  "Nhiễm nấm da (Ringworm)",
  "Bệnh ghẻ Demodex (Demodicosis)",
  "Viêm da mủ & Dị ứng (Pyoderma & Allergic Dermatitis)",
  "Nhiễm nấm men Malassezia",
  "Viêm da tiếp xúc môi trường",
  "Viêm nang lông do vi khuẩn",
  "Ghẻ Sarcoptes (Ghẻ ngứa)",
  "Bệnh da liễu khác (Cần cạo da xét nghiệm)"
];

export default function DoctorCaseDetail({
  selectedCase,
  currentUser,
  isEditing,
  setIsEditing,
  correctedDisease,
  setCorrectedDisease,
  doctorNotes,
  setDoctorNotes,
  submittingReview,
  handleAgreeWithAI,
  handleSaveCorrection
}) {
  if (!selectedCase) {
    return (
      <div className="card case-detail-card text-center py-5">
        <Stethoscope size={42} className="text-muted mb-2" />
        <h3>Chọn một ca bệnh ở danh sách bên trái để thẩm định y khoa</h3>
      </div>
    );
  }

  return (
    <div className="card case-detail-card">
      <div className="flex-between pb-3 border-bottom mb-3">
        <div>
          <span className="badge-anon-patient">Bệnh Nhân Ẩn Danh: {selectedCase.anonymous_code}</span>
          <h3 className="mt-1">
            Bệnh nhân: {selectedCase.patient_info?.species} ({selectedCase.patient_info?.breed})
          </h3>
          <span className="text-muted small">
            Độ tuổi: {selectedCase.patient_info?.age} &bull; Cân nặng: {selectedCase.patient_info?.weight || 'Bình thường'}
          </span>
        </div>

        <div className="text-right">
          <span className="text-date">
            Ngày tiếp nhận: {selectedCase.created_at ? new Date(selectedCase.created_at).toLocaleDateString('vi-VN') : 'Hôm nay'}
          </span>
        </div>
      </div>

      {/* ẢNH TỔN THƯƠNG DA LIỄU */}
      <div className="case-image-container mb-4">
        {selectedCase.image_url ? (
          <img src={selectedCase.image_url} alt="Vùng da tổn thương" className="case-large-img" />
        ) : (
          <div className="case-no-img">Không có ảnh</div>
        )}
        <div className="case-image-badge">
          <span>Ảnh chụp biểu bì độ phân giải cao</span>
        </div>
      </div>

      {/* DỰ ĐOÁN CỦA MÔ HÌNH AI */}
      <div className="ai-diagnosis-summary-box mb-4">
        <div className="flex-between mb-2">
          <div className="flex-center-gap">
            <Sparkles size={18} className="text-orange" />
            <strong>Kết Quả AI Dự Đoán Ban Đầu:</strong>
          </div>
          <span className="badge-confidence-large">
            {selectedCase.ai_diagnosis?.confidence}% Độ tin cậy
          </span>
        </div>

        <h3 className="text-primary mb-2">
          {selectedCase.ai_diagnosis?.disease_name_vi}
        </h3>

        <div className="prob-micro-list">
          {selectedCase.ai_diagnosis?.probabilities?.map((p, idx) => (
            <span key={idx} className="prob-micro-tag">
              {p.label}: <strong>{p.percent}%</strong>
            </span>
          ))}
        </div>
      </div>

      {/* NẾU ĐÃ THẨM ĐỊNH XONG */}
      {selectedCase.review_status !== 'pending' && !isEditing && (
        <div className={`verified-result-banner mb-4 ${selectedCase.review_status === 'agreed' ? 'agreed' : 'corrected'}`}>
          <div className="flex-between">
            <div>
              <strong>
                {selectedCase.review_status === 'agreed' 
                  ? '✓ Bác sĩ đã xác nhận ĐỒNG Ý với AI' 
                  : `✏️ Bác sĩ đã SỬA LẠI KẾT QUẢ thành: "${selectedCase.doctor_corrected_disease}"`}
              </strong>
              <p className="small mb-0 mt-1">
                Thẩm định bởi: {selectedCase.doctor_name || currentUser?.full_name} &bull; Ghi chú: {selectedCase.doctor_notes || 'Không có ghi chú thêm.'}
              </p>
            </div>
            <button className="btn-text-action" onClick={() => setIsEditing(true)}>
              <Edit3 size={14} /> Chỉnh sửa lại
            </button>
          </div>
        </div>
      )}

      {/* HÀNH ĐỘNG THẨM ĐỊNH Y KHOA: ĐỒNG Ý HOẶC SỬA LẠI KẾT QUẢ (RE-LABELING) */}
      {!isEditing ? (
        <div className="review-actions-bar">
          <button 
            className="btn-agree-ai" 
            onClick={handleAgreeWithAI}
            disabled={submittingReview}
          >
            <CheckCircle size={18} />
            <span>Đồng Ý Với AI (AI Dự Đoán Đúng)</span>
          </button>

          <button 
            className="btn-correct-ai" 
            onClick={() => {
              setIsEditing(true);
              setCorrectedDisease(COMMON_DISEASES_OPTIONS[1]);
            }}
            disabled={submittingReview}
          >
            <Edit3 size={18} />
            <span>Sửa Lại Kết Quả (Dán Nhãn Lại)</span>
          </button>
        </div>
      ) : (
        /* FORM DÁN NHÃN LẠI (RE-LABELING FORM CHO ACTIVE LEARNING) */
        <form onSubmit={handleSaveCorrection} className="relabel-form card animate-fadeIn">
          <div className="relabel-header">
            <h4>✏️ Dán Nhãn Lại Dữ Liệu Thực Tế (Doctor Re-labeling)</h4>
            <p className="card-subtitle">
              Mô hình AI dự đoán chưa chính xác. Vui lòng chọn bệnh đúng theo chuyên môn y khoa để đưa vào tập dữ liệu Huấn luyện lại (Retrain).
            </p>
          </div>

          <div className="form-group mb-3">
            <label className="input-label">Chẩn Đoán Bệnh Chính Xác Theo Nhận Định Của Bác Sĩ (*):</label>
            <select 
              className="custom-select"
              value={correctedDisease}
              onChange={(e) => setCorrectedDisease(e.target.value)}
              required
            >
              {COMMON_DISEASES_OPTIONS.map((opt, i) => (
                <option key={i} value={opt}>{opt}</option>
              ))}
            </select>
          </div>

          <div className="form-group mb-3">
            <label className="input-label">Ghi Chú Nhận Định Lâm Sàng & Phác Đồ Đề Xuất:</label>
            <textarea 
              className="custom-textarea" 
              rows="3"
              placeholder="Ví dụ: AI đoán nhầm Nấm do rìa tròn, nhưng bề mặt có vảy mủ nông và rỉ dịch vàng tanh, đây là Viêm da dị ứng bội nhiễm tụ cầu khuẩn..."
              value={doctorNotes}
              onChange={(e) => setDoctorNotes(e.target.value)}
              required
            ></textarea>
          </div>

          <div className="form-actions-row">
            <button type="button" className="btn-outline-action" onClick={() => setIsEditing(false)}>
              Hủy thao tác
            </button>
            <button type="submit" className="btn-primary-gradient" disabled={submittingReview}>
              {submittingReview ? 'Đang lưu nhãn...' : 'Lưu Nhãn Chuẩn & Cập Nhật Retrain Dataset'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
