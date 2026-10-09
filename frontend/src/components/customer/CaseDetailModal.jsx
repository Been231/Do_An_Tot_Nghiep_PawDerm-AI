import React, { useEffect } from 'react';
import { X, Calendar, Stethoscope, Activity, ClipboardList, PawPrint, Sparkles } from 'lucide-react';
import '../../styles/profileHistory.css';

const fmtDateTime = (iso) =>
  iso
    ? new Date(iso).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' })
    : 'Gần đây';

const parseList = (val) => {
  if (!val) return [];
  if (Array.isArray(val)) return val;
  try {
    const parsed = JSON.parse(val);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export function ReviewBadge({ rec }) {
  if (rec.review_status === 'agreed') return <span className="badge-verified">✓ Bác sĩ đồng ý</span>;
  if (rec.review_status === 'corrected') return <span className="badge-corrected">✏️ BS sửa: {rec.doctor_corrected_disease}</span>;
  return <span className="badge-pending">⏳ Chờ duyệt</span>;
}

/**
 * Modal xem lại đầy đủ một ca bệnh đã chẩn đoán:
 * ảnh tổn thương, kết quả AI, phân bố xác suất, ghi chú tiến triển, nhận định bác sĩ.
 */
export default function CaseDetailModal({ record, onClose }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose?.();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  if (!record) return null;
  const probs = parseList(record.probabilities);
  const symptoms = parseList(record.symptoms);
  const confidence = Number(record.confidence || 0);
  const petName = record.pets?.name || record.pet_name || 'Bé cưng';
  const species = record.pets?.species || record.species || 'Chó/Mèo';

  return (
    <div className="pf-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="cd-modal" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="pf-close" onClick={onClose} aria-label="Đóng">
          <X size={18} />
        </button>

        <div className="cd-grid">
          {/* CỘT TRÁI: ẢNH */}
          <div className="cd-image-col">
            {record.image_url ? (
              <img src={record.image_url} alt="Ảnh vùng da tổn thương" className="cd-image" />
            ) : (
              <div className="cd-image placeholder">🐾</div>
            )}
            <div className="cd-pet-chip">
              <PawPrint size={14} /> <strong>{petName}</strong> · {species}
            </div>
            <div className="cd-date-row">
              <Calendar size={14} /> {fmtDateTime(record.created_at)}
            </div>
            {record.day_number ? <div className="cd-day-pill">Mốc theo dõi: Ngày {record.day_number}</div> : null}
          </div>

          {/* CỘT PHẢI: THÔNG TIN */}
          <div className="cd-info-col">
            <span className="cd-kicker"><Sparkles size={13} /> Kết quả chẩn đoán AI</span>
            <h2 className="cd-title">{record.disease_name_vi || 'Chưa xác định'}</h2>
            {record.disease_name_en && <div className="cd-subtitle">{record.disease_name_en}</div>}

            <div className="cd-badges">
              <ReviewBadge rec={record} />
              {record.severity && <span className={`cd-severity ${record.severity_badge || ''}`}>Mức độ: {record.severity}</span>}
            </div>

            <div className="cd-confidence">
              <div className="flex-between">
                <span>Độ tin cậy AI</span>
                <strong>{confidence.toFixed(1)}%</strong>
              </div>
              <div className="cd-bar"><span style={{ width: `${Math.min(confidence, 100)}%` }} /></div>
            </div>

            {probs.length > 1 && (
              <div className="cd-section">
                <h4><Activity size={14} /> Phân bố xác suất các bệnh</h4>
                {probs.slice(0, 4).map((p, i) => (
                  <div key={i} className="cd-prob-row">
                    <span className="cd-prob-label">{p.label}</span>
                    <div className="cd-bar small"><span style={{ width: `${p.percent}%`, background: p.color || undefined }} /></div>
                    <span className="cd-prob-val">{Number(p.percent).toFixed(1)}%</span>
                  </div>
                ))}
              </div>
            )}

            {symptoms.length > 0 && (
              <div className="cd-section">
                <h4><ClipboardList size={14} /> Triệu chứng ghi nhận</h4>
                <div className="cd-tags">
                  {symptoms.map((s) => <span key={s} className="cd-tag">{s}</span>)}
                </div>
              </div>
            )}

            {(record.progression_notes || record.clinical_notes) && (
              <div className="cd-section">
                <h4><ClipboardList size={14} /> Ghi chú</h4>
                {record.progression_notes && <p className="cd-note"><strong>Theo dõi của chủ nuôi:</strong> {record.progression_notes}</p>}
                {record.clinical_notes && <p className="cd-note"><strong>Gợi ý lâm sàng:</strong> {record.clinical_notes}</p>}
              </div>
            )}

            <div className="cd-section cd-doctor">
              <h4><Stethoscope size={14} /> Nhận định của Bác sĩ</h4>
              {record.review_status === 'agreed' || record.review_status === 'corrected' ? (
                <>
                  <p className="cd-note">
                    <strong>{record.doctor_name || 'Bác sĩ thú y'}:</strong>{' '}
                    {record.doctor_notes || 'Bác sĩ đã xác nhận kết quả, không có ghi chú thêm.'}
                  </p>
                  {record.review_status === 'corrected' && (
                    <p className="cd-note corrected">Chẩn đoán được đính chính thành: <strong>{record.doctor_corrected_disease}</strong></p>
                  )}
                </>
              ) : (
                <p className="cd-note muted">Ca bệnh đang chờ Bác sĩ thú y thẩm định. Bạn sẽ nhận được thông báo khi có kết quả.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
