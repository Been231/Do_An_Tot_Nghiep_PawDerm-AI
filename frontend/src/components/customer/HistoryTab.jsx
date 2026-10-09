import React, { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Eye, Search } from 'lucide-react';
import CaseDetailModal, { ReviewBadge } from './CaseDetailModal';
import '../../styles/profileHistory.css';

const PAGE_SIZE_OPTIONS = [5, 10, 20];

/** Tạo dãy số trang gọn: 1 … 4 5 6 … 12 */
function buildPageList(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages = new Set([1, total, current - 1, current, current + 1]);
  const sorted = [...pages].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);
  const out = [];
  sorted.forEach((p, i) => {
    if (i > 0 && p - sorted[i - 1] > 1) out.push('…');
    out.push(p);
  });
  return out;
}

export default function HistoryTab({ historyRecords, loadHistory }) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [keyword, setKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedRecord, setSelectedRecord] = useState(null);

  const filtered = useMemo(() => {
    const kw = keyword.trim().toLowerCase();
    return historyRecords.filter((r) => {
      const status = r.review_status === 'agreed' || r.review_status === 'corrected' ? r.review_status : 'pending';
      if (statusFilter !== 'all' && status !== statusFilter) return false;
      if (!kw) return true;
      const hay = `${r.pets?.name || r.pet_name || ''} ${r.disease_name_vi || ''} ${r.disease_name_en || ''}`.toLowerCase();
      return hay.includes(kw);
    });
  }, [historyRecords, keyword, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));

  // Về trang 1 khi đổi bộ lọc; giữ trang hợp lệ khi dữ liệu thay đổi
  useEffect(() => setPage(1), [keyword, statusFilter, pageSize]);
  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const start = (page - 1) * pageSize;
  const pageRecords = filtered.slice(start, start + pageSize);

  return (
    <div className="history-section card">
      <div className="card-header flex-between">
        <div>
          <h2>📜 Lịch Sử Chẩn Đoán &amp; Ca Bệnh Trước Đó</h2>
          <p className="card-subtitle">Bấm vào một ca bệnh để xem lại ảnh, kết quả AI và nhận định của Bác sĩ</p>
        </div>
        <button className="btn-outline-action" onClick={loadHistory}>Làm mới</button>
      </div>

      {/* THANH CÔNG CỤ: TÌM KIẾM + LỌC */}
      <div className="hs-toolbar">
        <div className="hs-search">
          <Search size={16} />
          <input
            id="history-search"
            type="text"
            placeholder="Tìm theo tên bé hoặc tên bệnh..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />
        </div>
        <select id="history-status-filter" className="custom-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="all">Tất cả trạng thái</option>
          <option value="pending">⏳ Chờ duyệt</option>
          <option value="agreed">✓ Bác sĩ đồng ý</option>
          <option value="corrected">✏️ Bác sĩ đã sửa</option>
        </select>
      </div>

      <div className="history-table-wrapper mt-3">
        <table className="custom-table hs-table">
          <thead>
            <tr>
              <th>Ảnh Tổn Thương</th>
              <th>Bé Thú Cưng</th>
              <th>Chẩn Đoán Của AI</th>
              <th>Độ Tin Cậy</th>
              <th>Thẩm Định Bác Sĩ</th>
              <th>Thời Gian</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {pageRecords.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center py-4">
                  {historyRecords.length === 0 ? 'Chưa có lịch sử chẩn đoán nào.' : 'Không tìm thấy ca bệnh phù hợp với bộ lọc.'}
                </td>
              </tr>
            ) : (
              pageRecords.map((rec, i) => (
                <tr
                  key={rec.id || i}
                  className="hs-row"
                  onClick={() => setSelectedRecord(rec)}
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && setSelectedRecord(rec)}
                  title="Bấm để xem chi tiết ca bệnh"
                >
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
                    <span className="badge-confidence">{Number(rec.confidence || 0).toFixed(1)}%</span>
                  </td>
                  <td><ReviewBadge rec={rec} /></td>
                  <td className="text-muted small">
                    {rec.created_at ? new Date(rec.created_at).toLocaleDateString('vi-VN') : 'Gần đây'}
                  </td>
                  <td>
                    <span className="hs-view-btn"><Eye size={14} /> Xem</span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* PHÂN TRANG */}
      {filtered.length > 0 && (
        <div className="hs-pagination">
          <div className="hs-page-info">
            Hiển thị <strong>{start + 1}–{Math.min(start + pageSize, filtered.length)}</strong> / {filtered.length} ca bệnh
            <select className="hs-page-size" value={pageSize} onChange={(e) => setPageSize(Number(e.target.value))} aria-label="Số dòng mỗi trang">
              {PAGE_SIZE_OPTIONS.map((n) => <option key={n} value={n}>{n} / trang</option>)}
            </select>
          </div>
          <div className="hs-pages">
            <button type="button" className="hs-page-btn" disabled={page === 1} onClick={() => setPage(page - 1)} aria-label="Trang trước">
              <ChevronLeft size={16} />
            </button>
            {buildPageList(page, totalPages).map((p, i) =>
              p === '…' ? (
                <span key={`gap-${i}`} className="hs-page-gap">…</span>
              ) : (
                <button key={p} type="button" className={`hs-page-btn ${p === page ? 'active' : ''}`} onClick={() => setPage(p)}>
                  {p}
                </button>
              )
            )}
            <button type="button" className="hs-page-btn" disabled={page === totalPages} onClick={() => setPage(page + 1)} aria-label="Trang sau">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {selectedRecord && <CaseDetailModal record={selectedRecord} onClose={() => setSelectedRecord(null)} />}
    </div>
  );
}
