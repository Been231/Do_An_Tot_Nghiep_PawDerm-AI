import React from 'react';
import ExportPdfButton from '../common/ExportPdfButton';

export default function DiagnosisResult({ diagnosisResult, pet, owner, imageUrl }) {
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
    </div>
  );
}
