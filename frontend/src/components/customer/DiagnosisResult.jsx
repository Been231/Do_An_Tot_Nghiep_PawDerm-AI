import React from 'react';
import { CalendarCheck } from 'lucide-react';
import ExportPdfButton from '../common/ExportPdfButton';

export default function DiagnosisResult({ diagnosisResult, pet, owner, imageUrl, onBookAppointment, onOpenGuide }) {
  if (!diagnosisResult) {
    return (
      <div className="card diag-result-clean-card animate-fadeIn" style={{ minHeight: '380px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', padding: '40px 24px' }}>
        <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--primary-orange-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '30px', marginBottom: '16px' }}>
          🐾
        </div>
        <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-main)', marginBottom: '8px' }}>
          Sẵn sàng chẩn đoán AI
        </h3>
        <p style={{ fontSize: '14px', color: 'var(--text-muted)', maxWidth: '320px', lineHeight: '1.5', margin: 0 }}>
          Vui lòng tải ảnh lên hoặc chụp trực tiếp bằng camera ở khung bên trái, chọn các triệu chứng quan sát được và nhấn <strong>"Bắt đầu chẩn đoán AI"</strong> để xem kết quả phân tích.
        </p>
      </div>
    );
  }

  const result = diagnosisResult;

  // TRƯỜNG HỢP ĐẶC BIỆT: ẢNH KHÔNG PHẢI THÚ CƯNG (HOA QUẢ, ĐỒ VẬT, NGƯỜI, BỀ MẶT PHẲNG)
  if (result.disease_key === 'unrecognized_image' || result.is_valid_image === false) {
    return (
      <div className="card diag-result-clean-card animate-fadeIn" style={{ border: '1.5px solid #f59e0b', background: '#fffbeb', borderRadius: 'var(--radius-lg, 16px)', padding: '24px' }}>
        <div className="card-header-clean" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #fef3c7', paddingBottom: '12px' }}>
          <h3 className="card-title-plain" style={{ color: '#b45309', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '16px', fontWeight: '800', margin: 0 }}>
            <span>⚠️</span> Cảnh Báo Tính Hợp Lệ Của Ảnh
          </h3>
          <span style={{ fontSize: '12px', background: '#fef3c7', color: '#b45309', padding: '4px 10px', borderRadius: '20px', fontWeight: '700' }}>
            AI Gatekeeper Guardrail
          </span>
        </div>

        <div className="result-main-disease-row" style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '32px', height: '32px', minWidth: '32px', borderRadius: '50%', background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d97706', fontWeight: '900', fontSize: '18px' }}>
            !
          </div>
          <h2 className="result-disease-name" style={{ color: '#92400e', fontSize: '18px', fontWeight: '800', margin: 0 }}>
            {result.disease_name_vi || 'Ảnh không hợp lệ / Không nhận diện được thú cưng'}
          </h2>
        </div>

        <div style={{ background: '#ffffff', border: '1px solid #fde68a', borderRadius: '12px', padding: '16px', marginTop: '16px' }}>
          <p style={{ margin: '0 0 10px 0', fontSize: '13.5px', lineHeight: '1.6', color: '#78350f', whiteSpace: 'pre-line' }}>
            {result.description || result.cause}
          </p>
          <div style={{ fontSize: '12.5px', color: '#b45309', fontWeight: '600' }}>
            {result.warning}
          </div>
        </div>

        {/* HƯỚNG DẪN CHỤP LẠI ẢNH CHUẨN Y TẾ */}
        <div className="result-text-sections mt-4">
          <div className="text-section-item">
            <strong className="text-section-title" style={{ color: '#92400e', fontSize: '14px', display: 'block', marginBottom: '8px' }}>
              📸 Hướng dẫn chụp ảnh vùng da cho bé cưng chuẩn y tế:
            </strong>
            <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13px', color: '#4b5563', lineHeight: '1.6' }}>
              {(result.home_first_aid && result.home_first_aid.length > 0 ? result.home_first_aid : [
                'Đưa camera lại gần vùng da bị tổn thương của bé cún/mèo (khoảng cách 15 - 20cm).',
                'Vén nhẹ lớp lông xung quanh để lộ rõ bề mặt da bị ửng đỏ, rụng lông hoặc đóng vảy.',
                'Chọn nơi đủ ánh sáng tự nhiên hoặc bật đèn flash để ảnh có độ nét cao nhất.',
                'Nhấn nút bên dưới để xem khung căn góc chụp chuẩn y tế.'
              ]).map((tip, idx) => (
                <li key={idx} style={{ marginBottom: '6px' }}>{tip}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* NÚT MỞ MODAL HƯỚNG DẪN CĂN GÓC */}
        {onOpenGuide && (
          <div className="mt-4 pt-3" style={{ borderTop: '1px dashed #fde68a' }}>
            <button
              type="button"
              className="btn-terracotta-full"
              style={{
                background: 'linear-gradient(135deg, #d97706, #b45309)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '12px 18px',
                fontSize: '14px',
                fontWeight: '700',
                color: '#fff',
                border: 'none',
                borderRadius: '10px',
                cursor: 'pointer',
                width: '100%',
                boxShadow: '0 4px 12px rgba(217, 119, 6, 0.25)'
              }}
              onClick={onOpenGuide}
            >
              <span>📸 Mở Khung Hướng Dẫn Căn Góc Chụp Chuẩn Y Tế</span>
            </button>
          </div>
        )}
      </div>
    );
  }


  const confidenceVal = Number(result.confidence) || 86.5;
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (confidenceVal / 100) * circumference;

  // Xử lý xác suất hiển thị 4 cột chuẩn: Bệnh nấm da, Bệnh ghẻ da, Ve ghẻ, Khỏe mạnh
  const probs = result.probabilities && result.probabilities.length >= 4 ? result.probabilities : [
    { label: 'Bệnh nấm da', percent: 86.5, color: '#C86438' },
    { label: 'Bệnh ghẻ da', percent: 10.2, color: '#D4A373' },
    { label: 'Ve ghẻ', percent: 2.5, color: '#94A3B8' },
    { label: 'Khỏe mạnh', percent: 0.8, color: '#10B981' }
  ];

  return (
    <div className="card diag-result-clean-card animate-fadeIn">
      {/* TIÊU ĐỀ THẺ: KẾT QUẢ CHẨN ĐOÁN (KHÔNG ICON) */}
      <div className="card-header-clean result-header-with-action">
        <h3 className="card-title-plain">Kết quả chẩn đoán</h3>
        <ExportPdfButton
          id="btn-export-pdf-result"
          record={result}
          pet={pet}
          owner={owner}
          imageUrl={imageUrl}
          compact
        />
      </div>

      {/* DÒNG TÊN BỆNH KÈM DẤU TICK XANH LÁ */}
      <div className="result-main-disease-row">
        <div className="green-check-icon">✓</div>
        <h2 className="result-disease-name">{result.disease_name_vi}</h2>
      </div>

      {/* KHỐI ĐỘ TIN CẬY & BIỂU ĐỒ CỘT DỌC (4 CỘT) */}
      <div className="result-metrics-grid">
        {/* Cột trái: AI Confidence Donut Gauge */}
        <div className="metrics-confidence-col">
          <span className="metrics-sub-title">AI Confidence</span>
          <div className="donut-gauge-wrapper">
            <svg className="donut-gauge-svg" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r={radius} className="donut-track" />
              <circle
                cx="50"
                cy="50"
                r={radius}
                className="donut-fill"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
              />
            </svg>
            <span className="donut-center-text">{confidenceVal}%</span>
          </div>
          <span className="donut-bottom-caption">{confidenceVal}% tin cậy</span>
        </div>

        {/* Cột phải: Huy hiệu Bác sĩ xác nhận & Biểu đồ cột dọc */}
        <div className="metrics-bars-col">
          {result?.review_status === 'agreed' ? (
            <div className="doctor-verified-badge-pill agreed" title="Bác sĩ thú y đã đồng thuận với kết quả AI">
              <span>🛡️ Đã được Bác sĩ xác nhận ✍️</span>
            </div>
          ) : result?.review_status === 'corrected' ? (
            <div className="doctor-verified-badge-pill corrected" title="Bác sĩ đã đính chính lại chẩn đoán">
              <span>🩺 Bác sĩ đính chính: {result.doctor_corrected_disease || 'Xem kết quả mới'}</span>
            </div>
          ) : (
            <div className="doctor-verified-badge-pill pending" title="Ca bệnh đang chờ bác sĩ chuyên khoa thẩm định">
              <span>⏳ Đang chờ Bác sĩ thẩm định lâm sàng</span>
            </div>
          )}

          <span className="metrics-sub-title mt-3">Xác xuất các loại bệnh</span>
          <div className="v-barchart-container">
            {probs.slice(0, 4).map((item, idx) => {
              const barHeight = Math.max(item.percent * 0.85, 3);
              return (
                <div key={idx} className="v-bar-col">
                  <span className="v-bar-percent">{item.percent}%</span>
                  <div className="v-bar-track">
                    <div
                      className={`v-bar-fill ${idx === 0 ? 'primary' : idx === 1 ? 'secondary' : idx === 2 ? 'tertiary' : 'healthy'}`}
                      style={{ height: `${barHeight}px` }}
                    ></div>
                  </div>
                  <span className="v-bar-label">{item.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* MÔ TẢ, LƯU Ý, MẸO SƠ CỨU (KHÔNG ICON, CHỮ ĐẦM ẤM DỄ CHỊU) */}
      <div className="result-text-sections mt-4">
        <div className="text-section-item">
          <strong className="text-section-title">Mô tả</strong>
          <p className="text-section-desc">
            {result.description || result.cause || 'Tổn thương da khô, rụng lông hình tròn, ngứa ngáy dữ dội.'}
          </p>
        </div>

        <div className="text-section-item mt-3">
          <strong className="text-section-title">Lưu ý</strong>
          <p className="text-section-desc">
            {result.warning || (result.emergency_signs && result.emergency_signs[0]) || 'Tham khảo ý kiến Bác sĩ thú y để có phác đồ điều trị cụ thể.'}
          </p>
        </div>

        <div className="text-section-item mt-3">
          <strong className="text-section-title">Mẹo sơ cứu tại nhà</strong>
          <p className="text-section-desc">
            {result.first_aid || (result.home_first_aid && result.home_first_aid.join('. ')) || 'Sơ cứu: Vệ sinh vùng tổn thương bằng dung dịch sát khuẩn. Tránh để Milo gãi hoặc liếm vùng bị bệnh. Cách ly Milo khỏi vật nuôi khác.'}
          </p>
        </div>
      </div>

      {/* NÚT TẮT ĐẶT LỊCH KHÁM BỆNH VIỆN CHO BÉ */}
      {onBookAppointment && (
        <div className="result-booking-action mt-4 pt-3" style={{ borderTop: '1px dashed var(--border-subtle)' }}>
          <button
            type="button"
            id="btn-shortcut-book-apt"
            className="btn-terracotta-full"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '12px 20px',
              fontSize: '14px',
              fontWeight: '700',
              background: 'linear-gradient(135deg, #ea580c, #c2410c)',
              boxShadow: '0 4px 14px rgba(234, 88, 12, 0.25)'
            }}
            onClick={() => onBookAppointment({
              pet,
              diseaseName: result.disease_name_vi,
              notes: `Chẩn đoán AI phát hiện nguy cơ: ${result.disease_name_vi} (Độ tin cậy: ${confidenceVal}%). Cần bác sĩ kiểm tra và soi da trực tiếp.`
            })}
          >
            <CalendarCheck size={18} />
            <span>Đặt Lịch Khám Tại Bệnh Viện PawDerm Cho Bé Ngay</span>
          </button>
        </div>
      )}
    </div>
  );
}
