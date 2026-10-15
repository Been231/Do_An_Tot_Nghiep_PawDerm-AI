import React, { useState } from 'react';
import { FileDown, Loader2 } from 'lucide-react';
import { exportMedicalRecordPdf } from '../../utils/exportMedicalPdf';
import '../../styles/features.css';

/** Nút "Xuất PDF bệnh án" dùng chung cho Kết quả chẩn đoán và Chi tiết ca bệnh. */
export default function ExportPdfButton({ record, pet, owner, imageUrl, id = 'btn-export-pdf', compact = false }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const handleExport = async () => {
    if (busy) return;
    setBusy(true);
    setError('');
    try {
      await exportMedicalRecordPdf({ record, pet, owner, imageUrl });
    } catch (e) {
      console.error('Lỗi xuất PDF:', e);
      setError('Không thể xuất PDF. Vui lòng thử lại.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="pdf-export-wrap">
      <button
        type="button"
        id={id}
        className={`btn-export-pdf ${compact ? 'compact' : ''}`}
        onClick={handleExport}
        disabled={busy || !record}
        title="Tải bệnh án dạng PDF (ảnh da, tên bệnh, độ tin cậy AI, ghi chú bác sĩ)"
      >
        {busy ? <Loader2 size={16} className="spin" /> : <FileDown size={16} />}
        <span>{busy ? 'Đang tạo PDF…' : 'Xuất PDF bệnh án'}</span>
      </button>
      {error && <span className="pdf-export-error">{error}</span>}
    </div>
  );
}
