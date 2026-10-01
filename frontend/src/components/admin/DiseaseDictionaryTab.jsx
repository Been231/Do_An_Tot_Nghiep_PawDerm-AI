import React from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';

export default function DiseaseDictionaryTab({
  diseases,
  onOpenDiseaseModal,
  handleDeleteDisease
}) {
  return (
    <div className="card dictionary-mgmt-section">
      <div className="card-header flex-between">
        <div>
          <h2>📚 Quản Lý Từ Điển Bệnh Học Da Liễu Thú Cưng</h2>
          <p className="card-subtitle">
            Thêm, sửa, xóa thông tin chi tiết các bệnh da liễu hiển thị cho Khách hàng & danh mục cho Bác sĩ
          </p>
        </div>
        <button className="btn-primary-gradient" onClick={() => onOpenDiseaseModal()}>
          <Plus size={16} /> Thêm Bệnh Mới
        </button>
      </div>

      <div className="table-wrapper mt-3">
        <table className="custom-table">
          <thead>
            <tr>
              <th>Mã Bệnh (Key)</th>
              <th>Tên Bệnh (Việt / Anh)</th>
              <th>Nguyên Nhân Vi Sinh</th>
              <th>Mức Độ Nguy Hiểm</th>
              <th>Lây Sang Người?</th>
              <th>Thao Tác</th>
            </tr>
          </thead>
          <tbody>
            {diseases.map(d => (
              <tr key={d.disease_key}>
                <td>
                  <code className="code-key">{d.disease_key}</code>
                </td>
                <td>
                  <strong>{d.name_vi}</strong>
                  <div className="text-muted small">{d.name_en}</div>
                </td>
                <td className="desc-preview-col">
                  <span title={d.cause}>{d.cause?.slice(0, 75)}...</span>
                </td>
                <td>
                  <span className={`badge-status ${d.severity_level === 'Nguy hiểm' ? 'badge-danger' : 'badge-warning'}`}>
                    {d.severity_level}
                  </span>
                </td>
                <td>
                  {d.is_zoonotic ? (
                    <span className="badge-zoonotic">⚠️ Có lây người</span>
                  ) : (
                    <span className="text-muted small">Không lây</span>
                  )}
                </td>
                <td>
                  <div className="table-actions">
                    <button className="btn-icon-action" onClick={() => onOpenDiseaseModal(d)} title="Sửa">
                      <Edit2 size={15} />
                    </button>
                    <button className="btn-icon-action text-danger" onClick={() => handleDeleteDisease(d.disease_key)} title="Xóa">
                      <Trash2 size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
