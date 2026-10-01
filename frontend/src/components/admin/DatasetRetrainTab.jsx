import React from 'react';
import { Filter, Download } from 'lucide-react';

function strId(id) {
  if (!id) return 'ITEM';
  return String(id).slice(0, 6).toUpperCase();
}

export default function DatasetRetrainTab({
  dataset,
  onlyCorrected,
  setOnlyCorrected,
  loadDataset,
  handleExportDataset
}) {
  return (
    <div className="card dataset-mgmt-section">
      <div className="card-header flex-between">
        <div>
          <h2>🗂️ Quản Lý Tập Dữ Liệu AI (Dataset Management & Retraining)</h2>
          <p className="card-subtitle">
            Xem tổng hợp tất cả hình ảnh người dùng tải lên, lọc các ca Bác sĩ xác nhận SAI để xuất dữ liệu huấn luyện lại
          </p>
        </div>

        <div className="dataset-actions-group">
          <button 
            className={`btn-filter-pill ${onlyCorrected ? 'active' : ''}`}
            onClick={() => {
              const next = !onlyCorrected;
              setOnlyCorrected(next);
              loadDataset(next);
            }}
          >
            <Filter size={14} />
            <span>{onlyCorrected ? 'Đang lọc: Chỉ ca Bác sĩ SỬA LẠI' : 'Lọc ca Bác sĩ SỬA LẠI (Retrain Target)'}</span>
          </button>

          <button className="btn-primary-gradient" onClick={handleExportDataset}>
            <Download size={16} />
            <span>Xuất Dataset Huấn Luyện (JSON)</span>
          </button>
        </div>
      </div>

      <div className="dataset-gallery-grid mt-4">
        {dataset.map((item, idx) => (
          <div key={item.id || idx} className="card dataset-image-card">
            <div className="dataset-thumb-wrapper">
              {item.image_url ? (
                <img src={item.image_url} alt="Dataset sample" className="dataset-thumb-img" />
              ) : (
                <div className="thumb-dummy-large">🐾</div>
              )}
              <span className={`dataset-review-badge ${item.review_status === 'corrected' ? 'corrected' : item.review_status === 'agreed' ? 'agreed' : 'pending'}`}>
                {item.review_status === 'corrected' ? '✏️ Bác sĩ đã sửa' : item.review_status === 'agreed' ? '✓ Đã xác nhận' : 'Chưa thẩm định'}
              </span>
            </div>

            <div className="dataset-info-body">
              <div className="mb-1">
                <span className="text-muted small">AI đoán ban đầu:</span>
                <div><strong className="text-primary">{item.disease_name_vi}</strong> ({item.confidence}%)</div>
              </div>

              {item.review_status === 'corrected' && (
                <div className="correction-highlight mb-2">
                  <span className="text-warning small font-bold">🎯 Bác sĩ sửa lại (Ground Truth):</span>
                  <div className="font-bold text-success">{item.doctor_corrected_disease}</div>
                </div>
              )}

              {item.doctor_notes && (
                <p className="dataset-doc-note">
                  "{item.doctor_notes}"
                </p>
              )}

              <div className="text-date mt-2">
                Mã bản ghi: #{strId(item.id)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
