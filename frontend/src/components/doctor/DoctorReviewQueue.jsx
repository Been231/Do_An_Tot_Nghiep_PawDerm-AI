import React, { useState, useMemo } from 'react';
import { RefreshCw, Search, CheckCircle2, Clock, AlertCircle, Edit3 } from 'lucide-react';

export default function DoctorReviewQueue({
  queue = [],
  loading = false,
  selectedCase,
  onSelectCase,
  onRefresh
}) {
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'pending' | 'reviewed' | 'agreed' | 'corrected'
  const [searchTerm, setSearchTerm] = useState('');

  // Đếm số lượng ca bệnh theo trạng thái thẩm định
  const pendingCount = useMemo(() => queue.filter(item => item.review_status === 'pending').length, [queue]);
  const agreedCount = useMemo(() => queue.filter(item => item.review_status === 'agreed').length, [queue]);
  const correctedCount = useMemo(() => queue.filter(item => item.review_status === 'corrected').length, [queue]);
  const reviewedCount = agreedCount + correctedCount;

  // Lọc danh sách theo trạng thái và từ khóa tìm kiếm
  const filteredQueue = useMemo(() => {
    return queue.filter(item => {
      // 1. Lọc theo trạng thái thẩm định
      if (statusFilter === 'pending' && item.review_status !== 'pending') return false;
      if (statusFilter === 'reviewed' && item.review_status === 'pending') return false;
      if (statusFilter === 'agreed' && item.review_status !== 'agreed') return false;
      if (statusFilter === 'corrected' && item.review_status !== 'corrected') return false;

      // 2. Lọc theo từ khóa tìm kiếm (mã ca, loài, giống, bệnh AI đoán, bệnh BS sửa)
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const code = (item.anonymous_code || '').toLowerCase();
        const species = (item.patient_info?.species || '').toLowerCase();
        const breed = (item.patient_info?.breed || '').toLowerCase();
        const diseaseAI = (item.ai_diagnosis?.disease_name_vi || '').toLowerCase();
        const diseaseCorrected = (item.doctor_corrected_disease || '').toLowerCase();
        return code.includes(term) || species.includes(term) || breed.includes(term) || diseaseAI.includes(term) || diseaseCorrected.includes(term);
      }
      return true;
    });
  }, [queue, statusFilter, searchTerm]);

  // Xử lý đổi bộ lọc và tự động chọn ca đầu tiên phù hợp
  const handleFilterChange = (newStatus) => {
    setStatusFilter(newStatus);
    const matched = queue.filter(item => {
      if (newStatus === 'pending') return item.review_status === 'pending';
      if (newStatus === 'reviewed') return item.review_status !== 'pending';
      if (newStatus === 'agreed') return item.review_status === 'agreed';
      if (newStatus === 'corrected') return item.review_status === 'corrected';
      return true;
    });
    if (matched.length > 0 && (!selectedCase || !matched.find(m => m.id === selectedCase.id))) {
      onSelectCase(matched[0]);
    }
  };

  return (
    <div className="card queue-list-card">
      {/* TIÊU ĐỀ & NÚT LÀM MỚI */}
      <div className="flex-between mb-2">
        <h3 style={{ fontSize: '15px', fontWeight: '700', margin: 0 }}>
          📋 Hàng Đợi Ca Bệnh ({queue.length})
        </h3>
        <button 
          className="btn-icon-refresh" 
          onClick={onRefresh} 
          title="Làm mới hàng đợi"
          disabled={loading}
        >
          <RefreshCw size={14} className={loading ? 'spin' : ''} />
        </button>
      </div>

      {/* THANH LỌC PHÂN LOẠI TRẠNG THÁI: CHỜ KHÁM / ĐÃ KHÁM */}
      <div className="doctor-filter-tabs-bar mb-2" style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
        <button
          type="button"
          className={`btn-filter-pill ${statusFilter === 'all' ? 'active' : ''}`}
          onClick={() => handleFilterChange('all')}
          style={{ fontSize: '11.5px', padding: '5px 10px' }}
        >
          Tất cả ({queue.length})
        </button>

        <button
          type="button"
          className={`btn-filter-pill ${statusFilter === 'pending' ? 'active' : ''}`}
          onClick={() => handleFilterChange('pending')}
          style={{ fontSize: '11.5px', padding: '5px 10px' }}
          title="Các ca mới nhận từ khách hàng, đang chờ Bác sĩ khám và thẩm định"
        >
          ⏳ Chờ khám ({pendingCount})
        </button>

        <button
          type="button"
          className={`btn-filter-pill ${statusFilter === 'reviewed' ? 'active' : ''}`}
          onClick={() => handleFilterChange('reviewed')}
          style={{ fontSize: '11.5px', padding: '5px 10px' }}
          title="Các ca Bác sĩ đã hoàn tất khám sơ bộ hoặc dán nhãn lại"
        >
          ✓ Đã khám ({reviewedCount})
        </button>

        <button
          type="button"
          className={`btn-filter-pill ${statusFilter === 'corrected' ? 'active' : ''}`}
          onClick={() => handleFilterChange('corrected')}
          style={{ fontSize: '11.5px', padding: '5px 10px' }}
          title="Các ca khó AI đoán nhầm và Bác sĩ đã đính chính phục vụ Retrain"
        >
          ✏️ Đã sửa ({correctedCount})
        </button>
      </div>

      {/* Ô TÌM KIẾM NHANH */}
      <div className="search-box-wrap mb-3" style={{ position: 'relative' }}>
        <input
          type="text"
          className="custom-input"
          placeholder="🔍 Tìm mã ca, loài thú cưng, tên bệnh..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ fontSize: '12px', padding: '6px 10px', borderRadius: '8px', width: '100%' }}
        />
      </div>

      {/* DANH SÁCH CA BỆNH */}
      {loading ? (
        <div className="text-center py-4" style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
          Đang tải danh sách ca bệnh...
        </div>
      ) : filteredQueue.length === 0 ? (
        <div className="text-center py-4 text-muted" style={{ fontSize: '13px', padding: '20px 10px' }}>
          {statusFilter === 'pending'
            ? '🎉 Tuyệt vời! Hiện không còn ca bệnh nào đang chờ khám.'
            : statusFilter === 'reviewed'
            ? 'Chưa có ca bệnh nào được khám hoặc thẩm định.'
            : statusFilter === 'corrected'
            ? 'Chưa có ca bệnh nào được đính chính nhãn.'
            : 'Không tìm thấy ca bệnh nào phù hợp với từ khóa.'}
        </div>
      ) : (
        <div className="queue-items-scroll">
          {filteredQueue.map(item => (
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
                    {item.review_status === 'agreed' 
                      ? '✓ Đã duyệt' 
                      : item.review_status === 'corrected' 
                      ? '✏️ Đã sửa' 
                      : '⏳ Chờ khám'}
                  </span>
                </div>
                <div className="pet-brief">
                  {item.patient_info?.species || 'Thú cưng'}{item.patient_info?.breed ? ` • ${item.patient_info.breed}` : ''}
                </div>
                <div className="ai-brief">
                  {item.review_status === 'corrected' ? (
                    <span style={{ color: '#d97706', fontSize: '11.5px' }}>
                      BS đính chính: <strong>{item.doctor_corrected_disease}</strong>
                    </span>
                  ) : (
                    <span>
                      AI đoán: <strong>{item.ai_diagnosis?.disease_name_vi}</strong> ({item.ai_diagnosis?.confidence}%)
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

