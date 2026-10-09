import React from 'react';
import { RefreshCw } from 'lucide-react';

export default function DoctorReviewQueue({
  queue,
  loading,
  selectedCase,
  onSelectCase,
  onRefresh
}) {
  return (
    <div className="card queue-list-card">
      <div className="flex-between mb-3">
        <h3>📋 Hàng Đợi Ca Bệnh ({queue.length})</h3>
        <button className="btn-icon-refresh" onClick={onRefresh} title="Làm mới hàng đợi">
          <RefreshCw size={15} />
        </button>
      </div>

      {loading ? (
        <div className="text-center py-4">Đang tải danh sách ca bệnh...</div>
      ) : queue.length === 0 ? (
        <div className="text-center py-4 text-muted">Hiện không có ca bệnh nào chờ duyệt.</div>
      ) : (
        <div className="queue-items-scroll">
          {queue.map(item => (
            <div 
              key={item.id}
              className={`queue-item-card ${selectedCase?.id === item.id ? 'active' : ''}`}
              onClick={() => onSelectCase(item)}
            >
              <div className="queue-item-thumb">
                {item.image_url ? (
                  <img src={item.image_url} alt="Bệnh án" />
                ) : (
                  <div className="thumb-dummy">🐾</div>
                )}
              </div>
              <div className="queue-item-info">
                <div className="flex-between">
                  <strong className="anon-code">{item.anonymous_code || 'CA-BENH'}</strong>
                  <span className={`badge-status small ${item.review_status === 'agreed' ? 'badge-success' : item.review_status === 'corrected' ? 'badge-warning' : 'badge-pending'}`}>
                    {item.review_status === 'agreed' ? 'Đã duyệt' : item.review_status === 'corrected' ? 'Đã sửa' : 'Chờ duyệt'}
                  </span>
                </div>
                <div className="pet-brief">
                  {item.patient_info?.species || 'Thú cưng'}{item.patient_info?.breed ? ` • ${item.patient_info.breed}` : ''}
                </div>
                <div className="ai-brief">
                  AI đoán: <strong>{item.ai_diagnosis?.disease_name_vi}</strong> ({item.ai_diagnosis?.confidence}%)
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
