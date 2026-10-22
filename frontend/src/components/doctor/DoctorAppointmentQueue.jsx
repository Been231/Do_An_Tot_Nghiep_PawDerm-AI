import React, { useState, useEffect } from 'react';
import {
  CalendarCheck, Clock, MapPin, Phone, Stethoscope, AlertCircle, CheckCircle2,
  Send, RefreshCw, User, ChevronRight, X, Sparkles, CreditCard
} from 'lucide-react';
import { appointmentService } from '../../services/appointmentService';

export default function DoctorAppointmentQueue({ currentUser }) {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showPreDiagModal, setShowPreDiagModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');

  // Form State khám sơ bộ
  const [preDiagnosis, setPreDiagnosis] = useState('Nhiễm nấm da sợi khoáng (Ringworm / Dermatophytosis)');
  const [severityLevel, setSeverityLevel] = useState('Trung bình - Cần đến viện soi vi nấm');
  const [doctorAdvice, setDoctorAdvice] = useState('');
  const [savingPreDiag, setSavingPreDiag] = useState(false);

  const PRE_DIAGNOSIS_OPTIONS = [
    'Nhiễm nấm da sợi khoáng (Ringworm / Dermatophytosis)',
    'Bệnh ghẻ Demodex (Demodectic Mange)',
    'Viêm da dị ứng & Bội nhiễm vi khuẩn tụ cầu (Pyoderma)',
    'Nhiễm nấm men Malassezia vùng tai & kẽ chân',
    'Viêm nang lông do ký sinh trùng ve rận'
  ];

  const SEVERITY_OPTIONS = [
    'Nhẹ - Có thể tự chăm sóc theo dõi tại nhà',
    'Trung bình - Cần đến viện soi vi nấm & cạo da',
    'Nguy hiểm - Cần đưa bé đến viện ngay (Cấp cứu)'
  ];

  useEffect(() => {
    loadDoctorAppointments();
  }, []);

  const loadDoctorAppointments = async () => {
    setLoading(true);
    try {
      const data = await appointmentService.getDoctorAppointments();
      setAppointments(data || []);
    } catch (e) {
      console.warn('Lỗi tải danh sách lịch khám:', e);
    } finally {
      setLoading(false);
    }
  };

  const filteredAppointments = appointments.filter((apt) => {
    if (statusFilter === 'all') return true;
    if (statusFilter === 'paid') return apt.payment_status === 'paid';
    return apt.status === statusFilter;
  });

  const handleOpenPreDiagModal = (apt) => {
    setSelectedAppointment(apt);
    setPreDiagnosis(apt.doctor_pre_diagnosis || PRE_DIAGNOSIS_OPTIONS[0]);
    setSeverityLevel(apt.severity_level || SEVERITY_OPTIONS[1]);
    setDoctorAdvice(apt.doctor_advice || 'Không tắm xà phòng hoặc bôi thuốc lạ trong 24h trước khi đến viện để bác sĩ cạo da soi nấm chuẩn xác. Đeo loa chống liếm tránh làm loét sâu hơn.');
    setShowPreDiagModal(true);
  };

  const handleSavePreDiagnosis = async (e) => {
    e.preventDefault();
    if (!selectedAppointment) return;

    setSavingPreDiag(true);
    try {
      await appointmentService.submitPreDiagnosis(selectedAppointment.id, {
        doctor_id: currentUser?.id || 'doc-001',
        doctor_name: currentUser?.full_name || 'BS. CKII Nguyễn Thị Mai Hương',
        doctor_pre_diagnosis: preDiagnosis,
        severity_level: severityLevel,
        doctor_advice: doctorAdvice,
        status: 'confirmed'
      });

      alert(`✅ Đã lưu kết quả khám sơ bộ và gửi dự đoán bệnh cho chủ nuôi bé "${selectedAppointment.pet_name}" thành công!`);
      setShowPreDiagModal(false);
      loadDoctorAppointments();
    } catch (err) {
      alert('Lỗi: ' + (err.message || 'Không thể lưu kết quả'));
    } finally {
      setSavingPreDiag(false);
    }
  };

  const handleCompleteAppointment = async (aptId) => {
    if (!window.confirm('Xác nhận bé đã đến khám và hoàn tất ca khám tại viện?')) return;
    try {
      await appointmentService.updateStatus(aptId, 'completed');
      alert('✅ Đã cập nhật trạng thái ca khám: Hoàn tất!');
      loadDoctorAppointments();
    } catch (err) {
      alert('Lỗi: ' + err.message);
    }
  };

  return (
    <div className="doctor-appointment-queue-wrap animate-fadeIn">
      {/* HEADER QUẢN LÝ LỊCH HẸN BÁC SĨ */}
      <div className="flex-between flex-wrap gap-2 mb-3">
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: '800', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>📅</span> Danh Sách Khách Hàng Đặt Lịch Khám & Khám Sơ Bộ Tại Bệnh Viện
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0, marginTop: '2px' }}>
            Bác sĩ xem triệu chứng khách hàng gửi, thực hiện <strong>Khám sơ bộ & Đưa ra dự đoán bệnh</strong> để hỗ trợ khách hàng chuẩn bị trước khi đến viện.
          </p>
        </div>

        <button
          type="button"
          className="btn-filter-pill"
          onClick={loadDoctorAppointments}
          disabled={loading}
          style={{ fontSize: '13px', padding: '7px 14px' }}
        >
          <RefreshCw size={14} className={loading ? 'spin' : ''} />
          <span>Làm mới danh sách ({appointments.length})</span>
        </button>
      </div>

      {/* THANH LỌC TRẠNG THÁI CA HẸN */}
      <div className="doctor-filter-tabs-bar mb-3" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        <button
          type="button"
          className={`btn-filter-pill ${statusFilter === 'all' ? 'active' : ''}`}
          onClick={() => setStatusFilter('all')}
        >
          Tất cả ({appointments.length})
        </button>
        <button
          type="button"
          className={`btn-filter-pill ${statusFilter === 'pending' ? 'active' : ''}`}
          onClick={() => setStatusFilter('pending')}
        >
          ⏳ Chờ khám sơ bộ ({appointments.filter(a => a.status === 'pending').length})
        </button>
        <button
          type="button"
          className={`btn-filter-pill ${statusFilter === 'paid' ? 'active' : ''}`}
          onClick={() => setStatusFilter('paid')}
          style={{ color: statusFilter === 'paid' ? '#059669' : undefined, fontWeight: '700' }}
        >
          💳 Đã thanh toán ({appointments.filter(a => a.payment_status === 'paid').length})
        </button>
        <button
          type="button"
          className={`btn-filter-pill ${statusFilter === 'confirmed' ? 'active' : ''}`}
          onClick={() => setStatusFilter('confirmed')}
        >
          ✓ Đã có chẩn đoán sơ bộ ({appointments.filter(a => a.status === 'confirmed').length})
        </button>
        <button
          type="button"
          className={`btn-filter-pill ${statusFilter === 'completed' ? 'active' : ''}`}
          onClick={() => setStatusFilter('completed')}
        >
          🩺 Đã hoàn thành ({appointments.filter(a => a.status === 'completed').length})
        </button>
      </div>

      {/* DANH SÁCH THẺ LỊCH HẸN */}
      {loading ? (
        <div className="card text-center p-4">
          <div className="donut-spinner mx-auto mb-2" />
          <p style={{ color: 'var(--text-muted)', fontSize: '13.5px' }}>Đang tải lịch hẹn từ khách hàng...</p>
        </div>
      ) : filteredAppointments.length === 0 ? (
        <div className="card text-center p-4" style={{ borderRadius: 'var(--radius-lg)' }}>
          <div style={{ fontSize: '36px', marginBottom: '8px' }}>🐾🗓️</div>
          <h4 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '4px' }}>Không có lịch hẹn nào phù hợp</h4>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>
            Không tìm thấy ca khám nào thuộc trạng thái đang chọn.
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '18px' }}>
          {filteredAppointments.map((apt) => (
            <div
              key={apt.id}
              className="card doctor-apt-card animate-fadeIn"
              style={{
                borderRadius: 'var(--radius-lg)',
                padding: '20px',
                border: apt.status === 'confirmed' ? '1.5px solid var(--primary-teal)' : '1px solid var(--border-subtle)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                boxShadow: 'var(--shadow-sm)'
              }}
            >
              <div>
                <div className="flex-between mb-2 flex-wrap gap-2">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--primary-teal-dark)', background: 'var(--primary-teal-light)', padding: '2px 8px', borderRadius: '6px' }}>
                      #{apt.id}
                    </span>

                    {/* BADGE THANH TOÁN VIETQR */}
                    {apt.payment_status === 'paid' ? (
                      <span
                        style={{
                          padding: '2px 8px',
                          borderRadius: '6px',
                          fontSize: '11px',
                          fontWeight: '800',
                          background: '#ecfdf5',
                          color: '#059669',
                          border: '1px solid #a7f3d0',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '3px'
                        }}
                      >
                        <CreditCard size={11} />
                        <span>ĐÃ THANH TOÁN</span>
                      </span>
                    ) : apt.payment_status === 'expired' ? (
                      <span
                        style={{
                          padding: '2px 8px',
                          borderRadius: '6px',
                          fontSize: '11px',
                          fontWeight: '700',
                          background: '#fef2f2',
                          color: '#dc2626',
                          border: '1px solid #fecaca'
                        }}
                      >
                        HẾT HẠN QR
                      </span>
                    ) : (
                      <span
                        style={{
                          padding: '2px 8px',
                          borderRadius: '6px',
                          fontSize: '11px',
                          fontWeight: '600',
                          background: '#fffbeb',
                          color: '#d97706',
                          border: '1px solid #fde68a'
                        }}
                      >
                        CHỜ THANH TOÁN
                      </span>
                    )}
                  </div>

                  <span
                    style={{
                      padding: '3px 10px',
                      borderRadius: '999px',
                      fontSize: '11.5px',
                      fontWeight: '700',
                      background: apt.status === 'confirmed' ? 'var(--primary-teal-light)' : apt.status === 'completed' ? 'var(--success-light)' : 'var(--warning-light)',
                      color: apt.status === 'confirmed' ? 'var(--primary-teal-dark)' : apt.status === 'completed' ? 'var(--success)' : 'var(--warning)'
                    }}
                  >
                    {apt.status === 'confirmed' ? '🩺 Đã khám sơ bộ' : apt.status === 'completed' ? '✅ Đã hoàn thành' : '⏳ Chờ khám sơ bộ'}
                  </span>
                </div>

                {/* THÔNG TIN CHỦ NUÔI & BÉ CƯNG */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                  <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: 'var(--primary-orange-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>
                    🐶
                  </div>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '15.5px', fontWeight: '700', color: 'var(--text-main)' }}>
                      {apt.pet_name} <span style={{ fontSize: '12px', fontWeight: '500', color: 'var(--text-muted)' }}>({apt.pet_species})</span>
                    </h4>
                    <div style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>
                      Chủ nuôi: <strong>{apt.owner_name}</strong> · SĐT: <strong style={{ color: 'var(--primary-teal)' }}>{apt.phone}</strong>
                    </div>
                  </div>
                </div>

                <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--primary-orange-dark)', marginBottom: '8px' }}>
                  🎯 {apt.service_title}
                </div>

                <div style={{ background: 'var(--bg-subtle)', padding: '10px 12px', borderRadius: '8px', fontSize: '12.5px', marginBottom: '12px' }}>
                  <div>📅 Thời gian hẹn: <strong>{apt.appointment_date}</strong> (Khung giờ: <strong>{apt.appointment_time}</strong>)</div>
                  {apt.notes && (
                    <div style={{ marginTop: '4px', color: 'var(--text-body)' }}>
                      <strong>Triệu chứng khách mô tả:</strong> "{apt.notes}"
                    </div>
                  )}
                </div>

                {/* KẾT QUẢ KHÁM SƠ BỘ NẾU ĐÃ CÓ */}
                {apt.doctor_pre_diagnosis && (
                  <div style={{
                    background: 'linear-gradient(135deg, rgba(42, 157, 143, 0.08) 0%, rgba(14, 165, 233, 0.06) 100%)',
                    border: '1px solid var(--primary-teal-border)',
                    borderRadius: '8px',
                    padding: '10px 12px',
                    fontSize: '12.5px',
                    marginBottom: '12px'
                  }}>
                    <div style={{ color: 'var(--primary-teal-dark)', fontWeight: '700', marginBottom: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Stethoscope size={14} /> Dự đoán của Bác sĩ:
                    </div>
                    <div style={{ fontWeight: '600', color: 'var(--text-main)', marginBottom: '2px' }}>
                      {apt.doctor_pre_diagnosis}
                    </div>
                    <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
                      Mức độ: <strong>{apt.severity_level}</strong>
                    </div>
                  </div>
                )}
              </div>

              {/* CÁC NÚT HÀNH ĐỘNG */}
              <div style={{ display: 'flex', gap: '8px', marginTop: '14px', paddingTop: '12px', borderTop: '1px solid var(--border-subtle)' }}>
                <button
                  type="button"
                  className="btn-primary-gradient"
                  onClick={() => handleOpenPreDiagModal(apt)}
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    fontSize: '13px',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                >
                  <Stethoscope size={15} />
                  <span>{apt.doctor_pre_diagnosis ? 'Sửa Khám Sơ Bộ' : 'Khám Sơ Bộ & Dự Đoán'}</span>
                </button>

                {apt.status === 'confirmed' && (
                  <button
                    type="button"
                    className="btn-filter-pill"
                    onClick={() => handleCompleteAppointment(apt.id)}
                    title="Xác nhận khách đã đến khám xong tại viện"
                    style={{ fontSize: '12px', padding: '8px 10px' }}
                  >
                    <CheckCircle2 size={15} style={{ color: 'var(--success)' }} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL BÁC SĨ KHÁM SƠ BỘ & DỰ ĐOÁN BỆNH */}
      {showPreDiagModal && selectedAppointment && (
        <div className="pf-overlay" onClick={() => setShowPreDiagModal(false)}>
          <div className="pf-modal-clean" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '620px' }}>
            <div className="flex-between mb-3">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Stethoscope size={20} style={{ color: 'var(--primary-teal)' }} />
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800' }}>
                  Khám Sơ Bộ & Dự Đoán Bệnh Cho Khách Hàng
                </h3>
              </div>
              <button
                type="button"
                className="pf-close"
                onClick={() => setShowPreDiagModal(false)}
              >
                ✕
              </button>
            </div>

            <p style={{ fontSize: '13.5px', color: 'var(--text-muted)', marginBottom: '12px' }}>
              Bệnh nhân: <strong>{selectedAppointment.pet_name}</strong> ({selectedAppointment.pet_species}) · Chủ nuôi: <strong>{selectedAppointment.owner_name}</strong> ({selectedAppointment.phone})
            </p>

            {/* THÔNG TIN THANH TOÁN ONLINE CỦA CA KHÁM */}
            <div
              style={{
                background: selectedAppointment.payment_status === 'paid' ? '#ecfdf5' : '#fffbeb',
                border: `1px solid ${selectedAppointment.payment_status === 'paid' ? '#a7f3d0' : '#fde68a'}`,
                borderRadius: '10px',
                padding: '10px 14px',
                fontSize: '13px',
                marginBottom: '16px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '8px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CreditCard size={15} style={{ color: selectedAppointment.payment_status === 'paid' ? '#059669' : '#d97706' }} />
                <span>
                  Thanh toán: <strong style={{ color: selectedAppointment.payment_status === 'paid' ? '#059669' : '#d97706' }}>
                    {selectedAppointment.payment_status === 'paid' ? 'ĐÃ THANH TOÁN ONLINE (VIETQR)' : 'Chờ khách hàng thanh toán'}
                  </strong>
                </span>
              </div>
              <strong style={{ fontSize: '14px', color: selectedAppointment.payment_status === 'paid' ? '#059669' : '#d97706' }}>
                {(selectedAppointment.payment_amount || 200000).toLocaleString('vi-VN')} VNĐ
              </strong>
            </div>

            <form onSubmit={handleSavePreDiagnosis}>
              {/* DỰ ĐOÁN BỆNH SƠ BỘ */}
              <div className="mb-3">
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', marginBottom: '6px' }}>
                  Bác sĩ dự đoán bệnh lâm sàng sơ bộ *
                </label>
                <select
                  className="clean-input-pill mb-2"
                  value={preDiagnosis}
                  onChange={(e) => setPreDiagnosis(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)' }}
                >
                  {PRE_DIAGNOSIS_OPTIONS.map((opt, i) => (
                    <option key={i} value={opt}>{opt}</option>
                  ))}
                  <option value="custom">+ Nhập bệnh lý khác...</option>
                </select>

                {preDiagnosis === 'custom' && (
                  <input
                    type="text"
                    className="clean-input-pill"
                    placeholder="Nhập tên bệnh dự đoán..."
                    onChange={(e) => setPreDiagnosis(e.target.value)}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)' }}
                    required
                  />
                )}
              </div>

              {/* ĐÁNH GIÁ MỨC ĐỘ NGUY HIỂM */}
              <div className="mb-3">
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', marginBottom: '6px' }}>
                  Đánh giá mức độ ưu tiên lâm sàng *
                </label>
                <select
                  className="clean-input-pill"
                  value={severityLevel}
                  onChange={(e) => setSeverityLevel(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)' }}
                >
                  {SEVERITY_OPTIONS.map((sev, i) => (
                    <option key={i} value={sev}>{sev}</option>
                  ))}
                </select>
              </div>

              {/* LỜI DẶN DÒ HƯỚNG DẪN TRƯỚC KHI ĐẾN KHÁM */}
              <div className="mb-4">
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', marginBottom: '6px' }}>
                  Lời dặn dò & Hướng dẫn khách hàng chuẩn bị trước khi đến viện *
                </label>
                <textarea
                  rows={4}
                  className="clean-input-pill"
                  placeholder="Ví dụ: Không tắm xà phòng hoặc bôi thuốc mỡ có màu trong 24h trước khi đến viện; đeo loa chống liếm tránh làm loét sâu..."
                  value={doctorAdvice}
                  onChange={(e) => setDoctorAdvice(e.target.value)}
                  style={{ width: '100%', padding: '12px 14px', borderRadius: 'var(--radius-md)', resize: 'vertical' }}
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  className="btn-filter-pill"
                  onClick={() => setShowPreDiagModal(false)}
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="btn-primary-gradient"
                  disabled={savingPreDiag}
                  style={{ padding: '10px 20px', fontWeight: '700' }}
                >
                  <Send size={15} />
                  <span>{savingPreDiag ? 'Đang lưu...' : 'Lưu & Gửi Dự Đoán Cho Khách Hàng'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
