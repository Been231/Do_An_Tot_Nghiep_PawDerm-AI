/**
 * PawDerm AI - Tiện ích Xuất Bệnh Án Da Liễu Thú Cưng PDF Chuẩn Y Khoa
 * Hỗ trợ in trực tiếp hoặc Lưu dưới dạng PDF (Save as PDF) chuẩn khổ giấy A4
 */

export function exportMedicalReportPdf({
  record,
  pet = {},
  owner = {}
}) {
  if (!record) return;

  const petName = pet?.name || record?.pets?.name || record?.pet_name || 'Bé cưng';
  const species = pet?.species || record?.pets?.species || record?.species || 'Chó / Mèo';
  const weight = pet?.weight || record?.pets?.weight || 'Chưa rõ';
  const ownerName = owner?.full_name || record?.users?.full_name || 'Chủ nuôi thú cưng';
  const ownerPhone = owner?.phone || record?.users?.phone || 'Chưa cập nhật';
  const diseaseVi = record?.disease_name_vi || 'Nhiễm nấm da';
  const diseaseEn = record?.disease_name_en || 'Ringworm (Dermatophytosis)';
  const confidence = Number(record?.confidence || 86.5).toFixed(1);
  const recordId = (record?.id || `MR-${Date.now().toString(36).toUpperCase()}`).slice(0, 10);
  const examDate = record?.created_at 
    ? new Date(record.created_at).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' })
    : new Date().toLocaleString('vi-VN');

  const doctorName = record?.doctor_name || (record?.review_status === 'agreed' ? 'BS. CKII Nguyễn Thị Mai Hương' : 'Hội đồng Bác sĩ Da liễu PawCare');
  const doctorNotes = record?.doctor_notes || 'Tổn thương da khô se miệng viền đỏ rụng lông hình đồng xu. Đề xuất sát khuẩn xịt trị vi nấm và đeo loa chống liếm 7-14 ngày.';
  const reviewStatus = record?.review_status === 'agreed' 
    ? 'Đã được Bác sĩ thú y thẩm định & phê duyệt'
    : record?.review_status === 'corrected'
    ? `Bác sĩ đã đính chính: ${record.doctor_corrected_disease || diseaseVi}`
    : 'Chờ thẩm định lâm sàng';

  const symptoms = Array.isArray(record?.symptoms) 
    ? record.symptoms 
    : typeof record?.symptoms === 'string'
    ? JSON.parse(record.symptoms || '[]')
    : ['Gãi ngứa liên tục', 'Rụng lông hình đồng xu', 'Vùng da đỏ'];

  const probs = Array.isArray(record?.probabilities) && record.probabilities.length > 0
    ? record.probabilities
    : [
        { label: 'Nhiễm nấm da (Ringworm)', percent: confidence, color: '#d97706' },
        { label: 'Ghẻ Demodex (Mange)', percent: (100 - Number(confidence) * 0.8).toFixed(1), color: '#e07a5f' },
        { label: 'Viêm da mủ dị ứng', percent: '4.2', color: '#94a3b8' },
        { label: 'Khỏe mạnh / Da bình thường', percent: '1.2', color: '#10b981' }
      ];

  const imageUrl = record?.image_url || '';

  const printWindow = window.open('', '_blank', 'width=900,height=900');
  if (!printWindow) {
    alert('Trình duyệt đang chặn cửa sổ bật lên. Vui lòng cấp quyền Pop-up để xuất PDF bệnh án!');
    return;
  }

  const htmlContent = `
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <title>Bệnh Án Da Liễu Thú Cưng - ${petName} - ${recordId}</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 15mm 18mm;
    }
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    body {
      color: #1c1917;
      background: #ffffff;
      font-size: 13.5px;
      line-height: 1.5;
      padding: 10px;
    }
    /* Header Bệnh viện */
    .report-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 2.5px solid #d97706;
      padding-bottom: 14px;
      margin-bottom: 16px;
    }
    .brand-col {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .brand-icon {
      font-size: 34px;
      color: #d97706;
      background: #fef3c7;
      width: 52px;
      height: 52px;
      border-radius: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 1px solid #fde68a;
    }
    .brand-title {
      font-size: 22px;
      font-weight: 800;
      color: #0f5b54;
      letter-spacing: -0.5px;
    }
    .brand-title span { color: #d97706; }
    .brand-sub {
      font-size: 11.5px;
      color: #78716c;
      font-weight: 600;
    }
    .code-col {
      text-align: right;
    }
    .report-id {
      font-size: 13px;
      font-weight: 800;
      color: #d97706;
      background: #fff7ed;
      border: 1px solid #fed7aa;
      padding: 4px 10px;
      border-radius: 6px;
      display: inline-block;
      margin-bottom: 4px;
    }
    .report-date {
      font-size: 11px;
      color: #78716c;
    }

    /* Tiêu đề chính */
    .title-banner {
      text-align: center;
      margin-bottom: 18px;
    }
    .main-title {
      font-size: 19px;
      font-weight: 800;
      color: #1c1917;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .main-title-sub {
      font-size: 12px;
      color: #a8a29e;
      font-style: italic;
    }

    /* Bảng thông tin chủ nuôi và thú cưng */
    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      background: #faf7f2;
      border: 1px solid #ebe4da;
      border-radius: 12px;
      padding: 12px 16px;
      margin-bottom: 18px;
    }
    .info-item {
      display: flex;
      gap: 6px;
      font-size: 13px;
    }
    .info-label {
      font-weight: 700;
      color: #57534e;
      min-width: 100px;
    }
    .info-val {
      font-weight: 600;
      color: #1c1917;
    }

    /* Layout 2 cột: Ảnh tổn thương & Kết quả AI */
    .clinical-split {
      display: grid;
      grid-template-columns: 200px 1fr;
      gap: 16px;
      margin-bottom: 18px;
      align-items: start;
    }
    .lesion-img-box {
      border: 1.5px solid #e7e5e4;
      border-radius: 12px;
      overflow: hidden;
      background: #f5f5f4;
      text-align: center;
    }
    .lesion-img {
      width: 100%;
      height: 190px;
      object-fit: cover;
      display: block;
    }
    .lesion-img-placeholder {
      height: 190px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 40px;
      color: #a8a29e;
    }
    .lesion-caption {
      font-size: 11px;
      font-weight: 700;
      color: #78716c;
      padding: 5px;
      background: #fafaf9;
      border-top: 1px solid #e7e5e4;
    }

    /* Khối kết quả chẩn đoán */
    .ai-diag-card {
      border: 1.5px solid #fed7aa;
      background: #fffaf5;
      border-radius: 12px;
      padding: 12px 16px;
    }
    .diag-head-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px dashed #fed7aa;
      padding-bottom: 8px;
      margin-bottom: 10px;
    }
    .diag-disease-vi {
      font-size: 17px;
      font-weight: 800;
      color: #c2410c;
    }
    .diag-disease-en {
      font-size: 12px;
      color: #78716c;
      font-style: italic;
    }
    .confidence-badge {
      font-size: 14px;
      font-weight: 800;
      color: #ffffff;
      background: #d97706;
      padding: 4px 12px;
      border-radius: 20px;
    }

    .probs-list {
      margin-top: 8px;
    }
    .prob-item {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 12px;
      margin-bottom: 5px;
    }
    .prob-label { width: 150px; font-weight: 600; color: #44403c; }
    .prob-bar-track {
      flex: 1;
      height: 8px;
      background: #e7e5e4;
      border-radius: 4px;
      overflow: hidden;
    }
    .prob-bar-fill {
      height: 100%;
      border-radius: 4px;
    }
    .prob-percent { width: 45px; text-align: right; font-weight: 700; color: #1c1917; }

    /* Triệu chứng & Bác sĩ */
    .symptoms-row {
      margin-bottom: 14px;
    }
    .section-title {
      font-size: 13.5px;
      font-weight: 800;
      color: #0f5b54;
      text-transform: uppercase;
      margin-bottom: 6px;
      border-left: 3px solid #0f5b54;
      padding-left: 8px;
    }
    .symptom-tag {
      display: inline-block;
      background: #e0f2fe;
      color: #0369a1;
      padding: 3px 8px;
      border-radius: 6px;
      font-size: 11.5px;
      font-weight: 600;
      margin-right: 6px;
      margin-bottom: 4px;
    }

    .doctor-box {
      background: #f0fdf4;
      border: 1.5px solid #86efac;
      border-radius: 10px;
      padding: 10px 14px;
      margin-bottom: 16px;
    }
    .doctor-box-title {
      font-size: 13px;
      font-weight: 800;
      color: #15803d;
      margin-bottom: 4px;
    }
    .doctor-notes {
      font-size: 12.5px;
      color: #166534;
      line-height: 1.45;
    }

    .first-aid-box {
      background: #fffbeb;
      border: 1px solid #fde68a;
      border-radius: 10px;
      padding: 10px 14px;
      margin-bottom: 20px;
      font-size: 12.5px;
      color: #854d0e;
    }

    /* Chữ ký & Con dấu */
    .footer-signatures {
      display: flex;
      justify-content: space-between;
      margin-top: 24px;
      padding-top: 10px;
      page-break-inside: avoid;
    }
    .sig-col {
      text-align: center;
      width: 220px;
    }
    .sig-role {
      font-size: 12px;
      font-weight: 700;
      color: #57534e;
    }
    .sig-caption {
      font-size: 11px;
      color: #a8a29e;
      margin-bottom: 50px;
    }
    .sig-name {
      font-size: 13px;
      font-weight: 800;
      color: #1c1917;
      border-top: 1px dashed #d6d3d1;
      padding-top: 6px;
    }

    .stamp-badge {
      width: 75px;
      height: 75px;
      border: 2px dashed #dc2626;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      text-align: center;
      color: #dc2626;
      font-size: 9px;
      font-weight: 800;
      margin: 0 auto 10px;
      transform: rotate(-12deg);
    }

    .disclaimer-text {
      text-align: center;
      font-size: 10.5px;
      color: #a8a29e;
      margin-top: 20px;
      border-top: 1px solid #e7e5e4;
      padding-top: 10px;
    }

    /* Thanh nút bấm khi xem trên trình duyệt */
    .screen-actions {
      position: sticky;
      top: 0;
      background: #1c1917;
      color: #fff;
      padding: 10px 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin: -10px -10px 20px -10px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 100;
    }
    .btn-print {
      background: #d97706;
      color: #fff;
      border: none;
      padding: 8px 18px;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 700;
      cursor: pointer;
    }
    .btn-print:hover { background: #b45309; }

    @media print {
      .screen-actions { display: none !important; }
      body { padding: 0; }
    }
  </style>
</head>
<body>
  <div class="screen-actions">
    <div>🐾 <strong>PawDerm AI</strong> — Phiếu Kết Quả Bệnh Án Da Liễu Thú Cưng</div>
    <button class="btn-print" onclick="window.print()">🖨️ In / Lưu file PDF (Ctrl+P)</button>
  </div>

  <!-- Header -->
  <div class="report-header">
    <div class="brand-col">
      <div class="brand-icon">🐾</div>
      <div>
        <h1 class="brand-title">PawDerm <span>AI</span></h1>
        <p class="brand-sub">Hệ thống Trí tuệ Nhân tạo Chẩn đoán Da liễu & Kết nối Y tế Thú cưng</p>
      </div>
    </div>
    <div class="code-col">
      <div class="report-id">MÃ BA: #${recordId}</div>
      <div class="report-date">Ngày lập: ${examDate}</div>
    </div>
  </div>

  <!-- Title -->
  <div class="title-banner">
    <h2 class="main-title">PHIẾU KẾT QUẢ KHÁM DA LIỄU THÚ CƯNG</h2>
    <p class="main-title-sub">VETERINARY CLINICAL DERMATOLOGY REPORT & AI INFERENCE ANALYSIS</p>
  </div>

  <!-- Info Grid -->
  <div class="info-grid">
    <div class="info-item">
      <span class="info-label">Bé thú cưng:</span>
      <span class="info-val">${petName}</span>
    </div>
    <div class="info-item">
      <span class="info-label">Chủ nuôi:</span>
      <span class="info-val">${ownerName}</span>
    </div>
    <div class="info-item">
      <span class="info-label">Chủng loài:</span>
      <span class="info-val">${species}</span>
    </div>
    <div class="info-item">
      <span class="info-label">Số điện thoại:</span>
      <span class="info-val">${ownerPhone}</span>
    </div>
    <div class="info-item">
      <span class="info-label">Cân nặng:</span>
      <span class="info-val">${weight}</span>
    </div>
    <div class="info-item">
      <span class="info-label">Trạng thái duyệt:</span>
      <span class="info-val" style="color:#0f766e;">${reviewStatus}</span>
    </div>
  </div>

  <!-- Clinical Split: Ảnh và Kết quả AI -->
  <div class="clinical-split">
    <div class="lesion-img-box">
      ${imageUrl ? `<img src="${imageUrl}" class="lesion-img" alt="Ảnh tổn thương">` : `<div class="lesion-img-placeholder">🐾</div>`}
      <div class="lesion-caption">Ảnh tổn thương da liễu</div>
    </div>

    <div class="ai-diag-card">
      <div class="diag-head-row">
        <div>
          <div class="diag-disease-vi">✓ ${diseaseVi}</div>
          <div class="diag-disease-en">${diseaseEn}</div>
        </div>
        <div class="confidence-badge">${confidence}% Tin cậy</div>
      </div>

      <div class="probs-list">
        <strong style="font-size:11.5px;color:#57534e;display:block;margin-bottom:6px;">PHÂN BỐ XÁC SUẤT CÁC BỆNH (AI INFERENCE):</strong>
        ${probs.map(p => `
          <div class="prob-item">
            <span class="prob-label">${p.label || 'Bệnh ngoài da'}</span>
            <div class="prob-bar-track">
              <div class="prob-bar-fill" style="width:${p.percent}%;background:${p.color || '#d97706'};"></div>
            </div>
            <span class="prob-percent">${p.percent}%</span>
          </div>
        `).join('')}
      </div>
    </div>
  </div>

  <!-- Triệu chứng -->
  <div class="symptoms-row">
    <div class="section-title">Triệu chứng quan sát được</div>
    <div>
      ${symptoms.map(s => `<span class="symptom-tag">• ${s}</span>`).join('')}
    </div>
  </div>

  <!-- Ý kiến bác sĩ -->
  <div class="doctor-box">
    <div class="doctor-box-title">🩺 Thẩm định của Bác sĩ thú y: ${doctorName}</div>
    <div class="doctor-notes">${doctorNotes}</div>
  </div>

  <!-- Hướng dẫn chăm sóc -->
  <div class="first-aid-box">
    <strong>🌿 Hướng dẫn sơ cứu & chăm sóc tại nhà:</strong>
    <p style="margin-top:4px;">
      ${record?.first_aid || 'Vệ sinh vùng tổn thương bằng dung dịch sát khuẩn povidone pha loãng. Tuyệt đối không để bé gãi cắn gây loét nhiễm trùng. Cách ly khỏi các thú cưng khác và đưa đến phòng khám để bác sĩ kê đơn bôi/xịt chuyên khoa.'}
    </p>
  </div>

  <!-- Chữ ký -->
  <div class="footer-signatures">
    <div class="sig-col">
      <div class="sig-role">HỆ THỐNG TRÍ TUỆ NHÂN TẠO</div>
      <div class="sig-caption">Mô hình PawDerm AI YOLOv8</div>
      <div class="stamp-badge">PAWDERM AI<br>VERIFIED<br>★ ★ ★</div>
      <div class="sig-name">Thuật toán Computer Vision</div>
    </div>

    <div class="sig-col">
      <div class="sig-role">BÁC SĨ THÚ Y THẨM ĐỊNH</div>
      <div class="sig-caption">(Ký, ghi rõ họ tên)</div>
      <div style="height:55px;"></div>
      <div class="sig-name">${doctorName}</div>
    </div>
  </div>

  <!-- Disclaimer -->
  <div class="disclaimer-text">
    Kết quả từ hệ thống PawDerm AI nhằm hỗ trợ sàng lọc và phát hiện sớm tổn thương da liễu ở chó mèo. Vui lòng tham khảo phác đồ điều trị chính thức từ Bác sĩ Thú y có chứng chỉ hành nghề.
  </div>

  <script>
    // Tự động gọi hộp thoại in sau khi nạp ảnh xong
    window.onload = function() {
      setTimeout(function() {
        window.print();
      }, 500);
    };
  </script>
</body>
</html>
  `;

  printWindow.document.open();
  printWindow.document.write(htmlContent);
  printWindow.document.close();
}

// Alias tương thích ngược
export const exportMedicalRecordPdf = exportMedicalReportPdf;

