import React from 'react';

export default function HistoryTab({ historyRecords, loadHistory }) {
  return (
    <div className="history-section card">
      <div className="card-header flex-between">
        <div>
          <h2>📜 Lịch Sử Chẩn Đoán & Ca Bệnh Trước Đó</h2>
          <p className="card-subtitle">Xem lại toàn bộ kết quả quét AI và nhận định chuyên môn của Bác sĩ</p>
        </div>
        <button className="btn-outline-action" onClick={loadHistory}>Làm mới</button>
      </div>

      <div className="history-table-wrapper mt-3">
        <table className="custom-table">
          <thead>
            <tr>
              <th>Ảnh Tổn Thương</th>
              <th>Bé Thú Cưng</th>
              <th>Chẩn Đoán Của AI</th>
              <th>Độ Tin Cậy</th>
              <th>Thẩm Định Bác Sĩ</th>
              <th>Thời Gian</th>
            </tr>
          </thead>
          <tbody>
            {historyRecords.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center py-4">Chưa có lịch sử chẩn đoán nào.</td>
              </tr>
            ) : (
              historyRecords.map((rec, i) => (
                <tr key={rec.id || i}>
                  <td>
                    {rec.image_url ? (
                      <img src={rec.image_url} alt="Tổn thương" className="table-thumb" />
                    ) : (
                      <span className="table-thumb-placeholder">🐾</span>
                    )}
                  </td>
                  <td>
                    <strong>{rec.pets?.name || rec.pet_name || 'Bé cưng'}</strong>
                    <div className="text-muted small">{rec.pets?.species || rec.species || 'Chó/Mèo'}</div>
                  </td>
                  <td>
                    <strong className="text-primary">{rec.disease_name_vi}</strong>
                    <div className="text-muted small">{rec.disease_name_en}</div>
                  </td>
                  <td>
                    <span className="badge-confidence">{rec.confidence || 85}%</span>
                  </td>
                  <td>
                    {rec.review_status === 'agreed' ? (
                      <span className="badge-verified">✓ Bác sĩ đồng ý</span>
                    ) : rec.review_status === 'corrected' ? (
                      <span className="badge-corrected">✏️ BS sửa: {rec.doctor_corrected_disease}</span>
                    ) : (
                      <span className="badge-pending">⏳ Chờ duyệt</span>
                    )}
                  </td>
                  <td className="text-muted small">
                    {rec.created_at ? new Date(rec.created_at).toLocaleDateString('vi-VN') : 'Gần đây'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
