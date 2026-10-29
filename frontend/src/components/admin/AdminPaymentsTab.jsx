import React, { useState, useEffect } from 'react';
import {
  CreditCard, TrendingUp, CheckCircle2, Clock, AlertTriangle,
  RefreshCw, Search, ShieldCheck, Zap, ArrowUpRight, DollarSign,
  Calendar, Eye, FileText, Printer, X, Download
} from 'lucide-react';
import { appointmentService } from '../../services/appointmentService';

export default function AdminPaymentsTab() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'paid' | 'pending_payment' | 'expired'
  const [searchTerm, setSearchTerm] = useState('');
  const [actionLoading, setActionLoading] = useState(null);
  const [selectedReceipt, setSelectedReceipt] = useState(null);

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    setLoading(true);
    try {
      const res = await appointmentService.getAdminTransactions();
      setData(res);
    } catch (e) {
      console.warn('Lỗi tải giao dịch viện:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleSimulatePayment = async (aptId) => {
    setActionLoading(aptId);
    try {
      await appointmentService.simulatePayment(aptId);
      await loadTransactions();
      alert(`⚡ Đã xác nhận thanh toán thành công cho lịch hẹn #${aptId}!`);
    } catch (e) {
      alert('Lỗi: ' + e.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  const transactions = data?.transactions || [];

  const filteredTransactions = transactions.filter((tx) => {
    // 1. Lọc theo trạng thái
    if (statusFilter !== 'all' && tx.payment_status !== statusFilter) {
      return false;
    }
    // 2. Lọc theo từ khóa tìm kiếm
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase().trim();
      const matchId = tx.appointment_id?.toLowerCase().includes(q);
      const matchOwner = tx.owner_name?.toLowerCase().includes(q);
      const matchPhone = tx.phone?.toLowerCase().includes(q);
      const matchPet = tx.pet_name?.toLowerCase().includes(q);
      const matchMemo = tx.payment_memo?.toLowerCase().includes(q);
      return matchId || matchOwner || matchPhone || matchPet || matchMemo;
    }
    return true;
  });

  return (
    <div className="admin-payments-section animate-fadeIn">
      {/* 1. HEADER & THÔNG TIN CẤU HÌNH CỔNG VIETQR */}
      <div className="flex-between flex-wrap gap-3 mb-4">
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: '800', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CreditCard size={20} style={{ color: 'var(--primary-teal)' }} />
            <span>Quản Lý Dòng Tiền & Giao Dịch Thanh Toán VietQR</span>
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0, marginTop: '2px' }}>
            Admin xem lại toàn bộ lịch sử thanh toán, doanh thu viện, biên lai điện tử và kiểm soát trạng thái giao dịch theo thời gian thực.
          </p>
        </div>

        <button
          type="button"
          className="btn-filter-pill"
          onClick={loadTransactions}
          disabled={loading}
          style={{ fontSize: '13px', padding: '7px 14px' }}
        >
          <RefreshCw size={14} className={loading ? 'spin' : ''} />
          <span>Làm mới danh sách</span>
        </button>
      </div>

      {/* 2. THẺ TỔNG HỢP CHỈ SỐ DOANH THU & SỐ LƯỢNG */}
      <div className="dashboard-metric-grid mb-4">
        {/* DOANH THU THỰC NHẬN */}
        <div className="card metric-box" style={{ borderLeft: '4px solid #10b981' }}>
          <span className="metric-icon-bg" style={{ background: '#ecfdf5', color: '#10b981' }}>💰</span>
          <div className="metric-info">
            <span className="metric-title">Tổng Doanh Thu Đã Thu</span>
            <strong className="metric-number" style={{ color: '#059669', fontSize: '20px' }}>
              {(data?.total_revenue || 0).toLocaleString('vi-VN')} VNĐ
            </strong>
            <span className="metric-sub" style={{ color: '#059669', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <CheckCircle2 size={12} /> Đã vào tài khoản viện
            </span>
          </div>
        </div>

        {/* SỐ LƯỢT GIAO DỊCH THÀNH CÔNG */}
        <div className="card metric-box" style={{ borderLeft: '4px solid #0d9488' }}>
          <span className="metric-icon-bg bg-teal-soft">✅</span>
          <div className="metric-info">
            <span className="metric-title">Giao Dịch Đã Thanh Toán</span>
            <strong className="metric-number text-teal">{data?.paid_count || 0}</strong>
            <span className="metric-sub text-teal">Khách đã chuyển khoản</span>
          </div>
        </div>

        {/* ĐANG CHỜ THANH TOÁN (TRONG 10 PHÚT) */}
        <div className="card metric-box" style={{ borderLeft: '4px solid #f59e0b' }}>
          <span className="metric-icon-bg bg-warning-soft">⏳</span>
          <div className="metric-info">
            <span className="metric-title">Đang Chờ Quét QR</span>
            <strong className="metric-number text-warning">{data?.pending_count || 0}</strong>
            <span className="metric-sub">Hạn 10 phút / phiên</span>
          </div>
        </div>

        {/* HẾT HẠN PHIÊN QR */}
        <div className="card metric-box" style={{ borderLeft: '4px solid #ef4444' }}>
          <span className="metric-icon-bg" style={{ background: '#fef2f2', color: '#ef4444' }}>⚠️</span>
          <div className="metric-info">
            <span className="metric-title">Phiên QR Hết Hạn</span>
            <strong className="metric-number" style={{ color: '#dc2626' }}>{data?.expired_count || 0}</strong>
            <span className="metric-sub" style={{ color: '#dc2626' }}>Tự động giải phóng chỗ</span>
          </div>
        </div>
      </div>

      {/* 3. KHUNG THÔNG TIN TÀI KHOẢN VIỆN ĐANG NHẬN TIỀN */}
      <div
        className="card mb-4"
        style={{
          background: 'linear-gradient(135deg, rgba(42, 157, 143, 0.08) 0%, rgba(14, 165, 233, 0.06) 100%)',
          border: '1px solid var(--primary-teal-border)',
          borderRadius: 'var(--radius-lg)',
          padding: '16px 20px'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '10px',
                background: '#ffffff',
                border: '1px solid var(--border-subtle)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '20px'
              }}
            >
              🏦
            </div>
            <div>
              <div style={{ fontSize: '13.5px', fontWeight: '700', color: 'var(--text-main)' }}>
                Tài khoản thụ hưởng Bệnh viện: <strong>{data?.bank_info?.bank_id || 'MB'} (Ngân Hàng Quân Đội)</strong>
              </div>
              <div style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>
                Số tài khoản: <strong style={{ color: 'var(--primary-teal-dark)' }}>{data?.bank_info?.account_no || '0795477302'}</strong> · Chủ tài khoản: <strong>{data?.bank_info?.account_name || 'BENH VIEN THU Y PAWDERM'}</strong>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#059669', background: '#ecfdf5', padding: '6px 12px', borderRadius: '8px', border: '1px solid #a7f3d0' }}>
            <ShieldCheck size={15} />
            <span>Cổng VietQR Tự Động Đang Hoạt Động 24/7</span>
          </div>
        </div>
      </div>

      {/* 4. THANH TÌM KIẾM VÀ LỌC GIAO DỊCH */}
      <div className="flex-between flex-wrap gap-2 mb-3">
        {/* BỘ LỌC TRẠNG THÁI */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button
            type="button"
            className={`btn-filter-pill ${statusFilter === 'all' ? 'active' : ''}`}
            onClick={() => setStatusFilter('all')}
          >
            Tất cả ({transactions.length})
          </button>
          <button
            type="button"
            className={`btn-filter-pill ${statusFilter === 'paid' ? 'active' : ''}`}
            onClick={() => setStatusFilter('paid')}
            style={{ color: statusFilter === 'paid' ? '#059669' : undefined, fontWeight: '700' }}
          >
            ✅ Đã thanh toán ({transactions.filter(t => t.payment_status === 'paid').length})
          </button>
          <button
            type="button"
            className={`btn-filter-pill ${statusFilter === 'pending_payment' ? 'active' : ''}`}
            onClick={() => setStatusFilter('pending_payment')}
          >
            ⏳ Chờ thanh toán ({transactions.filter(t => t.payment_status === 'pending_payment').length})
          </button>
          <button
            type="button"
            className={`btn-filter-pill ${statusFilter === 'expired' ? 'active' : ''}`}
            onClick={() => setStatusFilter('expired')}
          >
            ⚠️ Hết hạn QR ({transactions.filter(t => t.payment_status === 'expired').length})
          </button>
        </div>

        {/* Ô TÌM KIẾM */}
        <div style={{ position: 'relative', minWidth: '260px' }}>
          <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            className="clean-input-pill"
            placeholder="Tìm theo mã APT, SĐT, tên..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: '100%', paddingLeft: '34px', fontSize: '13px' }}
          />
        </div>
      </div>

      {/* 5. BẢNG DANH SÁCH GIAO DỊCH */}
      <div className="card table-card" style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
        {loading ? (
          <div className="text-center p-4">
            <div className="donut-spinner mx-auto mb-2" />
            <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Đang tải danh sách giao dịch...</p>
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div className="text-center p-4">
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>💳🧾</div>
            <h4 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '4px' }}>Không có giao dịch nào</h4>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>
              Không tìm thấy giao dịch nào phù hợp với bộ lọc hiện tại.
            </p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="custom-table" style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ background: 'var(--bg-subtle)', borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '12px 14px' }}>Mã Lịch Hẹn</th>
                  <th style={{ padding: '12px 14px' }}>Khách Hàng & SĐT</th>
                  <th style={{ padding: '12px 14px' }}>Bé Cưng & Dịch Vụ</th>
                  <th style={{ padding: '12px 14px' }}>Lịch Hẹn</th>
                  <th style={{ padding: '12px 14px' }}>Số Tiền</th>
                  <th style={{ padding: '12px 14px' }}>Nội Dung Chuyển Khoản</th>
                  <th style={{ padding: '12px 14px' }}>Trạng Thái</th>
                  <th style={{ padding: '12px 14px', textAlign: 'center' }}>Hành Động</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map((tx) => (
                  <tr key={tx.appointment_id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '12px 14px' }}>
                      <strong style={{ color: 'var(--primary-teal-dark)' }}>#{tx.appointment_id}</strong>
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <div style={{ fontWeight: '600', color: 'var(--text-main)' }}>{tx.owner_name}</div>
                      <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>{tx.phone}</div>
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <div>🐾 <strong>{tx.pet_name}</strong></div>
                      <div style={{ fontSize: '12px', color: 'var(--primary-orange-dark)' }}>{tx.service_title}</div>
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <div>{tx.appointment_date}</div>
                      <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>{tx.appointment_time}</div>
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <strong style={{ fontSize: '14px', color: tx.payment_status === 'paid' ? '#059669' : 'var(--text-main)' }}>
                        {(tx.payment_amount || 200000).toLocaleString('vi-VN')} đ
                      </strong>
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <code style={{ background: 'var(--bg-subtle)', padding: '2px 6px', borderRadius: '4px', fontSize: '12px' }}>
                        {tx.payment_memo}
                      </code>
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      {tx.payment_status === 'paid' ? (
                        <span style={{ padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '800', background: '#ecfdf5', color: '#059669', border: '1px solid #a7f3d0', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                          <CheckCircle2 size={11} /> ĐÃ THANH TOÁN
                        </span>
                      ) : tx.payment_status === 'expired' ? (
                        <span style={{ padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '700', background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca' }}>
                          ⚠️ HẾT HẠN QR
                        </span>
                      ) : (
                        <span style={{ padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '600', background: '#fffbeb', color: '#d97706', border: '1px solid #fde68a' }}>
                          ⏳ CHỜ THANH TOÁN
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                        {/* NÚT XEM CHI TIẾT BIÊN LAI */}
                        <button
                          type="button"
                          onClick={() => setSelectedReceipt(tx)}
                          className="btn-filter-pill"
                          style={{
                            fontSize: '11.5px',
                            padding: '4px 8px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                          title="Xem chi tiết biên lai hóa đơn"
                        >
                          <Eye size={12} />
                          <span>Biên lai</span>
                        </button>

                        {/* NÚT DUYỆT DEMO NẾU CHƯA THANH TOÁN */}
                        {tx.payment_status !== 'paid' && (
                          <button
                            type="button"
                            onClick={() => handleSimulatePayment(tx.appointment_id)}
                            disabled={actionLoading === tx.appointment_id}
                            className="btn-filter-pill"
                            style={{
                              fontSize: '11.5px',
                              padding: '4px 8px',
                              background: 'var(--primary-orange-light)',
                              color: 'var(--primary-orange-dark)',
                              border: '1px solid var(--primary-orange)'
                            }}
                            title="Kích hoạt demo thanh toán ngay dành cho buổi bảo vệ đồ án"
                          >
                            <Zap size={11} className={actionLoading === tx.appointment_id ? 'spin' : ''} />
                            <span>{actionLoading === tx.appointment_id ? '...' : '⚡ Duyệt'}</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ===================== MODAL BIÊN LAI / HÓA ĐƠN ĐIỆN TỬ ===================== */}
      {selectedReceipt && (
        <div
          className="modal-overlay"
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '16px'
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedReceipt(null);
          }}
        >
          <div
            className="modal-content animate-scaleUp"
            style={{
              background: '#ffffff',
              borderRadius: '16px',
              width: '100%',
              maxWidth: '520px',
              padding: '28px 24px',
              position: 'relative',
              boxShadow: '0 20px 40px rgba(0,0,0,0.25)',
              border: '1px solid var(--border-subtle)'
            }}
          >
            {/* NÚT ĐÓNG */}
            <button
              onClick={() => setSelectedReceipt(null)}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: 'var(--bg-subtle)',
                border: 'none',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: 'var(--text-muted)'
              }}
            >
              <X size={16} />
            </button>

            {/* HEADER BIÊN LAI */}
            <div style={{ textAlign: 'center', borderBottom: '2px dashed var(--border-subtle)', paddingBottom: '16px', marginBottom: '16px' }}>
              <div style={{ fontSize: '28px', marginBottom: '4px' }}>🏥🐾</div>
              <h3 style={{ fontSize: '17px', fontWeight: '800', margin: 0, color: 'var(--text-main)' }}>
                BỆNH VIỆN THÚ Y PAWDERM
              </h3>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '4px 0 0' }}>
                1A Lê Thị Xuyến, quận Thanh Khuê, Đà Nẵng · Hotline: 0795477302
              </p>
              <div
                style={{
                  display: 'inline-block',
                  marginTop: '10px',
                  background: 'var(--primary-teal-light)',
                  color: 'var(--primary-teal-dark)',
                  padding: '3px 12px',
                  borderRadius: '999px',
                  fontSize: '12px',
                  fontWeight: '700'
                }}
              >
                PHIẾU THU TIỀN DỊCH VỤ KHÁM CHỮA BỆNH
              </div>
            </div>

            {/* THÔNG TIN CHI TIẾT */}
            <div style={{ fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '9px', marginBottom: '18px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Mã lịch hẹn:</span>
                <strong style={{ color: 'var(--primary-teal-dark)' }}>#{selectedReceipt.appointment_id}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Khách hàng:</span>
                <strong>{selectedReceipt.owner_name}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Số điện thoại:</span>
                <span>{selectedReceipt.phone}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Bệnh nhân thú cưng:</span>
                <strong>{selectedReceipt.pet_name}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Dịch vụ khám:</span>
                <strong style={{ color: 'var(--primary-orange-dark)', textAlign: 'right', maxWidth: '280px' }}>
                  {selectedReceipt.service_title}
                </strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Thời gian hẹn khám:</span>
                <span>{selectedReceipt.appointment_time} · {selectedReceipt.appointment_date}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Phương thức:</span>
                <span>{selectedReceipt.payment_method || 'VietQR Napas247 Online'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Nội dung chuyển khoản:</span>
                <code style={{ background: 'var(--bg-subtle)', padding: '2px 6px', borderRadius: '4px' }}>
                  {selectedReceipt.payment_memo}
                </code>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-subtle)', paddingTop: '8px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Thời gian thanh toán:</span>
                <span>{selectedReceipt.paid_at ? new Date(selectedReceipt.paid_at).toLocaleString('vi-VN') : 'Đang chờ thanh toán'}</span>
              </div>
            </div>

            {/* TỔNG TIỀN VÀ CON DẤU */}
            <div
              style={{
                background: selectedReceipt.payment_status === 'paid' ? '#ecfdf5' : '#fffbeb',
                border: `1.5px solid ${selectedReceipt.payment_status === 'paid' ? '#a7f3d0' : '#fde68a'}`,
                borderRadius: '12px',
                padding: '14px 16px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '18px'
              }}
            >
              <div>
                <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>TỔNG SỐ TIỀN THU:</div>
                <div style={{ fontSize: '20px', fontWeight: '800', color: selectedReceipt.payment_status === 'paid' ? '#059669' : '#d97706' }}>
                  {(selectedReceipt.payment_amount || 200000).toLocaleString('vi-VN')} VNĐ
                </div>
              </div>

              {/* DẤU MỘC ĐIỆN TỬ */}
              <div
                style={{
                  border: `2px solid ${selectedReceipt.payment_status === 'paid' ? '#059669' : '#d97706'}`,
                  color: selectedReceipt.payment_status === 'paid' ? '#059669' : '#d97706',
                  borderRadius: '8px',
                  padding: '4px 10px',
                  fontSize: '11px',
                  fontWeight: '800',
                  textAlign: 'center',
                  textTransform: 'uppercase',
                  transform: 'rotate(-4deg)'
                }}
              >
                {selectedReceipt.payment_status === 'paid' ? '✓ ĐÃ THU TIỀN' : '⏳ CHỜ THANH TOÁN'}
              </div>
            </div>

            {/* NÚT THAO TÁC BIÊN LAI */}
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button"
                onClick={handlePrintReceipt}
                className="btn-primary-gradient"
                style={{
                  flex: 1,
                  padding: '10px',
                  fontSize: '13.5px',
                  fontWeight: '700',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  cursor: 'pointer'
                }}
              >
                <Printer size={15} />
                <span>In Biên Lai</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedReceipt(null)}
                className="btn-filter-pill"
                style={{ padding: '10px 16px', fontSize: '13px' }}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
