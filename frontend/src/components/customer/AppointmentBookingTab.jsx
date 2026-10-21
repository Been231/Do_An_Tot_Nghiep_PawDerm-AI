import React, { useState, useEffect } from 'react';
import {
  Calendar, Clock, MapPin, Phone, Stethoscope, Sparkles, CheckCircle2,
  AlertCircle, ChevronRight, User, Heart, ShieldCheck, Plus, CalendarCheck
} from 'lucide-react';
import { appointmentService } from '../../services/appointmentService';

export default function AppointmentBookingTab({
  currentUser,
  pets = [],
  onOpenAddPetModal,
  onRequireAuth
}) {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState({ type: '', text: '' });

  // Form State
  const [selectedPetId, setSelectedPetId] = useState(pets[0]?.id || '');
  const [customPetName, setCustomPetName] = useState('');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [appointmentDate, setAppointmentDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });
  const [appointmentTime, setAppointmentTime] = useState('09:30 - 10:30');
  const [serviceTitle, setServiceTitle] = useState('Khám da liễu chuyên sâu & Soi tươi vi nấm');
  const [doctorName, setDoctorName] = useState('BS. CKII Nguyễn Thị Mai Hương');
  const [notes, setNotes] = useState('');

  const TIME_SLOTS = [
    '08:30 - 09:30',
    '09:30 - 10:30',
    '10:30 - 11:30',
    '14:00 - 15:00',
    '15:30 - 16:30',
    '17:00 - 18:00'
  ];

  const SERVICES = [
    { title: 'Khám da liễu chuyên sâu & Soi tươi vi nấm', price: '350.000đ', desc: 'Cạo vảy soi tươi dưới kính hiển vi, phát hiện nấm sợi & ký sinh trùng' },
    { title: 'Khám sơ bộ & Hội chẩn sau kết quả AI', price: '200.000đ', desc: 'Bác sĩ kiểm tra đối chiếu trực tiếp với kết quả quét AI YOLOv8' },
    { title: 'Cấp cứu viêm da lở loét & Dị ứng cấp', price: '300.000đ', desc: 'Xử lý sát khuẩn khẩn cấp, ngăn chặn bội nhiễm lan rộng' },
    { title: 'Tái khám & Đánh giá tiến độ hồi phục', price: '150.000đ', desc: 'Đo lường sự mọc lông lại và điều chỉnh đơn thuốc' }
  ];

  useEffect(() => {
    loadAppointments();
  }, [currentUser]);

  useEffect(() => {
    if (pets.length > 0 && !selectedPetId) {
      setSelectedPetId(pets[0].id);
    }
  }, [pets]);

  const loadAppointments = async () => {
    setLoading(true);
    try {
      const data = await appointmentService.getMyAppointments(currentUser?.id);
      setAppointments(data || []);
    } catch (e) {
      console.warn('Lỗi tải danh sách lịch hẹn:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    setFeedbackMsg({ type: '', text: '' });

    if (!currentUser) {
      onRequireAuth?.('login');
      return;
    }

    let petName = customPetName.trim();
    let petSpecies = 'Chó / Mèo';

    if (selectedPetId && selectedPetId !== 'custom') {
      const p = pets.find(item => item.id === selectedPetId);
      if (p) {
        petName = p.name;
        petSpecies = p.species || 'Chó / Mèo';
      }
    }

    if (!petName) {
      setFeedbackMsg({ type: 'error', text: 'Vui lòng chọn hoặc nhập tên bé cưng cần khám!' });
      return;
    }

    if (!phone || phone.length < 10) {
      setFeedbackMsg({ type: 'error', text: 'Vui lòng nhập số điện thoại hợp lệ (10 chữ số) để Bác sĩ liên hệ!' });
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        user_id: currentUser?.id,
        owner_name: currentUser?.full_name || currentUser?.username || 'Khách hàng',
        phone: phone.trim(),
        pet_id: selectedPetId !== 'custom' ? selectedPetId : '',
        pet_name: petName,
        pet_species: petSpecies,
        service_title: serviceTitle,
        appointment_date: appointmentDate,
        appointment_time: appointmentTime,
        doctor_name: doctorName,
        notes: notes.trim()
      };

      await appointmentService.createAppointment(payload);
      setFeedbackMsg({
        type: 'success',
        text: `🎉 Đặt lịch khám cho bé "${petName}" tại Bệnh viện PawDerm thành công! Bác sĩ sẽ sớm khám sơ bộ và liên hệ với bạn.`
      });
      setNotes('');
      loadAppointments();
    } catch (err) {
      setFeedbackMsg({ type: 'error', text: err.message || 'Lỗi khi gửi yêu cầu đặt lịch hẹn!' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="appointment-portal-section animate-fadeIn">
      {/* 1. BANNER BỆNH VIỆN THÚ Y PAWDERM */}
      <div className="card hospital-hero-banner mb-4" style={{
        background: 'linear-gradient(135deg, rgba(42, 157, 143, 0.12) 0%, rgba(217, 119, 6, 0.1) 100%)',
        border: '1px solid var(--primary-teal-border)',
        borderRadius: 'var(--radius-lg)',
        padding: '28px 24px'
      }}>
        <div className="flex-between flex-wrap gap-3">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span style={{ fontSize: '24px' }}>🏥</span>
              <h2 style={{ fontSize: '20px', fontWeight: '800', margin: 0, color: 'var(--text-main)' }}>
                Bệnh Viện Thú Y PawDerm — Trung Tâm Da Liễu Thú Cưng
              </h2>
            </div>
            <p style={{ fontSize: '14px', color: 'var(--text-body)', maxWidth: '680px', lineHeight: '1.6', margin: 0 }}>
              Đặt lịch khám trực tiếp tại bệnh viện để được <strong>Bác sĩ chuyên khoa khám sơ bộ, chẩn đoán bệnh lâm sàng</strong> và tiếp nhận điều trị chuyên sâu sau khi quét bệnh qua AI.
            </p>
          </div>

          <div className="hospital-info-pills" style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--primary-teal)' }}>
              <MapPin size={16} />
              <span><strong>123 Nguyễn Văn Cừ, Quận 5, TP.HCM</strong></span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--primary-orange)' }}>
              <Phone size={16} />
              <span>Hotline cấp cứu da liễu: <strong>0918 889 999</strong></span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)' }}>
              <Clock size={16} />
              <span>Giờ mở cửa: <strong>08:00 - 20:00</strong> (Tất cả các ngày trong tuần)</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. BỐ CỤC 2 CỘT: FORM ĐẶT LỊCH (TRÁI) & DANH SÁCH LỊCH HẸN & KHÁM SƠ BỘ (PHẢI) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.05fr 1fr', gap: '24px', alignItems: 'start' }}>
        
        {/* CỘT TRÁI: FORM ĐẶT LỊCH KHÁM */}
        <div className="card booking-form-card" style={{ padding: '24px', borderRadius: 'var(--radius-lg)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px', paddingBottom: '12px', borderBottom: '1px solid var(--border-subtle)' }}>
            <CalendarCheck size={20} style={{ color: 'var(--primary-teal)' }} />
            <h3 style={{ fontSize: '17px', fontWeight: '700', margin: 0 }}>Phiếu Đăng Ký Khám Tại Bệnh Viện</h3>
          </div>

          {feedbackMsg.text && (
            <div className={`auth-alert-message ${feedbackMsg.type} mb-3`} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 14px',
              borderRadius: '8px',
              fontSize: '13.5px',
              background: feedbackMsg.type === 'success' ? 'var(--success-light)' : 'var(--danger-light)',
              color: feedbackMsg.type === 'success' ? 'var(--success)' : 'var(--danger)',
              border: `1px solid ${feedbackMsg.type === 'success' ? 'var(--success-border)' : 'var(--danger-border)'}`
            }}>
              {feedbackMsg.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
              <span>{feedbackMsg.text}</span>
            </div>
          )}

          <form onSubmit={handleBookingSubmit}>
            {/* CHỌN BÉ CƯNG */}
            <div className="mb-3">
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px', color: 'var(--text-main)' }}>
                Bé cưng cần khám *
              </label>
              {pets.length > 0 ? (
                <div style={{ display: 'flex', gap: '8px' }}>
                  <select
                    className="clean-input-pill"
                    value={selectedPetId}
                    onChange={(e) => setSelectedPetId(e.target.value)}
                    style={{ flex: 1, padding: '10px 16px', borderRadius: 'var(--radius-md)' }}
                  >
                    {pets.map((p) => (
                      <option key={p.id} value={p.id}>
                        🐾 {p.name} ({p.species || 'Thú cưng'})
                      </option>
                    ))}
                    <option value="custom">+ Nhập bé cưng khác...</option>
                  </select>
                  <button
                    type="button"
                    className="btn-filter-pill"
                    onClick={onOpenAddPetModal}
                    title="Thêm bé cưng mới vào hồ sơ"
                    style={{ padding: '0 12px' }}
                  >
                    <Plus size={16} />
                  </button>
                </div>
              ) : (
                <input
                  type="text"
                  className="clean-input-pill"
                  placeholder="Ví dụ: Bé Mochi (Chó Poodle)"
                  value={customPetName}
                  onChange={(e) => setCustomPetName(e.target.value)}
                  style={{ width: '100%', padding: '10px 16px', borderRadius: 'var(--radius-md)' }}
                  required
                />
              )}

              {selectedPetId === 'custom' && pets.length > 0 && (
                <input
                  type="text"
                  className="clean-input-pill mt-2"
                  placeholder="Nhập tên bé cưng và loài..."
                  value={customPetName}
                  onChange={(e) => setCustomPetName(e.target.value)}
                  style={{ width: '100%', padding: '10px 16px', borderRadius: 'var(--radius-md)' }}
                  required
                />
              )}
            </div>

            {/* DỊCH VỤ KHÁM */}
            <div className="mb-3">
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px', color: 'var(--text-main)' }}>
                Dịch vụ khám da liễu *
              </label>
              <select
                className="clean-input-pill"
                value={serviceTitle}
                onChange={(e) => setServiceTitle(e.target.value)}
                style={{ width: '100%', padding: '10px 16px', borderRadius: 'var(--radius-md)' }}
              >
                {SERVICES.map((s, idx) => (
                  <option key={idx} value={s.title}>
                    {s.title} — {s.price}
                  </option>
                ))}
              </select>
            </div>

            {/* BÁC SĨ PHỤ TRÁCH */}
            <div className="mb-3">
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px', color: 'var(--text-main)' }}>
                Bác sĩ chuyên khoa phụ trách chẩn đoán *
              </label>
              <select
                className="clean-input-pill"
                value={doctorName}
                onChange={(e) => setDoctorName(e.target.value)}
                style={{ width: '100%', padding: '10px 16px', borderRadius: 'var(--radius-md)' }}
              >
                <option value="BS. CKII Nguyễn Thị Mai Hương">🩺 BS. CKII Nguyễn Thị Mai Hương (Trưởng khoa Da Liễu PawDerm)</option>
                <option value="BS. ThS Lê Hoàng Nam">🩺 BS. ThS Lê Hoàng Nam (Chuyên gia Ký sinh trùng & Dị ứng thú nhỏ)</option>
                <option value="Hội đồng Bác sĩ Da Liễu PawCare">🛡️ Hội đồng Bác sĩ Da Liễu Bệnh viện PawDerm</option>
              </select>
            </div>

            {/* NGÀY HẸN & KHUNG GIỜ */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px', color: 'var(--text-main)' }}>
                  Ngày hẹn khám *
                </label>
                <input
                  type="date"
                  className="clean-input-pill"
                  value={appointmentDate}
                  onChange={(e) => setAppointmentDate(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)' }}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px', color: 'var(--text-main)' }}>
                  Số điện thoại xác nhận *
                </label>
                <input
                  type="tel"
                  className="clean-input-pill"
                  placeholder="0901234567"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)' }}
                  required
                />
              </div>
            </div>

            {/* KHUNG GIỜ LỰA CHỌN */}
            <div className="mb-3">
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '8px', color: 'var(--text-main)' }}>
                Khung giờ đến khám tại bệnh viện *
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                {TIME_SLOTS.map((slot) => (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => setAppointmentTime(slot)}
                    style={{
                      padding: '8px 4px',
                      fontSize: '12.5px',
                      fontWeight: '600',
                      borderRadius: '8px',
                      border: appointmentTime === slot ? '2px solid var(--primary-teal)' : '1px solid var(--border-subtle)',
                      background: appointmentTime === slot ? 'var(--primary-teal-light)' : 'var(--bg-subtle)',
                      color: appointmentTime === slot ? 'var(--primary-teal-dark)' : 'var(--text-body)',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            </div>

            {/* TRIỆU CHỨNG & GHI CHÚ */}
            <div className="mb-4">
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px', color: 'var(--text-main)' }}>
                Mô tả triệu chứng & Ghi chú cho Bác sĩ khám sơ bộ
              </label>
              <textarea
                rows={3}
                className="clean-input-pill"
                placeholder="Ví dụ: Vùng da tai và bẹn của bé bị đỏ ửng, gãi ngứa nhiều về đêm, có vảy tròn giống nấm..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                style={{ width: '100%', padding: '12px 16px', borderRadius: 'var(--radius-md)', resize: 'vertical' }}
              />
            </div>

            <button
              type="submit"
              id="btn-confirm-booking"
              className="btn-primary-gradient"
              disabled={submitting}
              style={{
                width: '100%',
                padding: '13px 20px',
                fontSize: '15px',
                fontWeight: '700',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <CalendarCheck size={18} />
              <span>{submitting ? 'Đang gửi yêu cầu đặt lịch...' : 'Xác Nhận Đặt Lịch Khám'}</span>
            </button>
          </form>
        </div>

        {/* CỘT PHẢI: LỊCH HẸN CỦA TÔI & KHÁM SƠ BỘ TỪ BÁC SĨ */}
        <div className="appointments-list-column">
          <div className="flex-between mb-3">
            <h3 style={{ fontSize: '17px', fontWeight: '700', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>📋</span> Lịch Hẹn & Kết Quả Khám Sơ Bộ ({appointments.length})
            </h3>
            <button
              type="button"
              className="btn-filter-pill"
              onClick={loadAppointments}
              style={{ fontSize: '12.5px', padding: '6px 12px' }}
            >
              Làm mới
            </button>
          </div>

          {loading ? (
            <div className="card text-center p-4">
              <div className="donut-spinner mx-auto mb-2" />
              <p style={{ color: 'var(--text-muted)', fontSize: '13.5px' }}>Đang tải danh sách lịch khám...</p>
            </div>
          ) : appointments.length === 0 ? (
            <div className="card text-center p-4" style={{ borderRadius: 'var(--radius-lg)' }}>
              <div style={{ fontSize: '36px', marginBottom: '8px' }}>🐾🗓️</div>
              <h4 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '4px' }}>Chưa có lịch hẹn nào</h4>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>
                Bạn có thể điền phiếu đăng ký bên trái để đặt lịch khám và nhận kết quả khám sơ bộ từ Bác sĩ PawDerm.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {appointments.map((apt) => (
                <div
                  key={apt.id}
                  className="card appointment-item-card animate-fadeIn"
                  style={{
                    padding: '20px',
                    borderRadius: 'var(--radius-lg)',
                    border: apt.status === 'confirmed' ? '1.5px solid var(--primary-teal)' : '1px solid var(--border-subtle)',
                    boxShadow: 'var(--shadow-sm)'
                  }}
                >
                  {/* HEADER THẺ LỊCH HẸN */}
                  <div className="flex-between mb-2">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '18px' }}>🐶</span>
                      <strong>{apt.pet_name}</strong>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>({apt.pet_species})</span>
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
                      {apt.status === 'confirmed' ? '🩺 Đã khám sơ bộ & Tiếp nhận' : apt.status === 'completed' ? '✅ Đã hoàn thành' : '⏳ Chờ Bác sĩ tiếp nhận'}
                    </span>
                  </div>

                  <div style={{ fontSize: '13.5px', fontWeight: '600', color: 'var(--primary-orange-dark)', marginBottom: '6px' }}>
                    {apt.service_title}
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '12.5px', color: 'var(--text-muted)', marginBottom: '12px' }}>
                    <div>📅 Ngày khám: <strong style={{ color: 'var(--text-main)' }}>{apt.appointment_date}</strong></div>
                    <div>⏰ Giờ hẹn: <strong style={{ color: 'var(--text-main)' }}>{apt.appointment_time}</strong></div>
                    <div style={{ gridColumn: 'span 2' }}>
                      📍 Địa điểm: <span>{apt.hospital_address || 'Bệnh viện Thú Y PawDerm, 123 Nguyễn Văn Cừ, Q.5'}</span>
                    </div>
                  </div>

                  {apt.notes && (
                    <div style={{
                      background: 'var(--bg-subtle)',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      fontSize: '12.5px',
                      color: 'var(--text-body)',
                      marginBottom: '12px'
                    }}>
                      <strong>Ghi chú của bạn:</strong> {apt.notes}
                    </div>
                  )}

                  {/* KHỐI KẾT QUẢ KHÁM SƠ BỘ & DỰ ĐOÁN BỆNH CỦA BÁC SĨ (KHI BÁC SĨ ĐÃ KHÁM SƠ BỘ) */}
                  {apt.doctor_pre_diagnosis ? (
                    <div
                      className="doctor-pre-diagnosis-box animate-fadeIn"
                      style={{
                        background: 'linear-gradient(135deg, rgba(42, 157, 143, 0.12) 0%, rgba(14, 165, 233, 0.08) 100%)',
                        border: '1.5px solid var(--primary-teal-border)',
                        borderRadius: '12px',
                        padding: '14px 16px',
                        marginTop: '10px'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--primary-teal-dark)', fontWeight: '800', fontSize: '13px', marginBottom: '8px' }}>
                        <Stethoscope size={16} />
                        <span>KẾT QUẢ KHÁM SƠ BỘ & DỰ ĐOÁN TỪ BÁC SĨ PAWDERM</span>
                      </div>

                      <div style={{ marginBottom: '6px', fontSize: '13px' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Chuyên gia phụ trách:</span>{' '}
                        <strong>{apt.doctor_name || 'BS. CKII Nguyễn Thị Mai Hương'}</strong>
                      </div>

                      <div style={{ marginBottom: '6px', fontSize: '13px' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Dự đoán bệnh sơ bộ:</span>{' '}
                        <strong style={{ color: 'var(--primary-orange-dark)', fontSize: '14px' }}>
                          🎯 {apt.doctor_pre_diagnosis}
                        </strong>
                      </div>

                      <div style={{ marginBottom: '8px', fontSize: '12.5px' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Mức độ đánh giá:</span>{' '}
                        <span className="badge-pill" style={{
                          background: 'var(--warning-light)',
                          color: 'var(--warning)',
                          fontWeight: '700',
                          padding: '2px 8px',
                          borderRadius: '6px',
                          fontSize: '11.5px'
                        }}>
                          {apt.severity_level || 'Cần theo dõi'}
                        </span>
                      </div>

                      {apt.doctor_advice && (
                        <div style={{
                          background: '#ffffff',
                          border: '1px dashed var(--primary-teal-border)',
                          borderRadius: '8px',
                          padding: '8px 12px',
                          fontSize: '12.5px',
                          color: 'var(--text-body)',
                          lineHeight: '1.5'
                        }}>
                          <strong style={{ color: 'var(--primary-teal-dark)' }}>💡 Lời dặn trước khi đến viện:</strong>{' '}
                          {apt.doctor_advice}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div style={{
                      background: 'var(--bg-subtle)',
                      borderRadius: '8px',
                      padding: '10px 12px',
                      fontSize: '12px',
                      color: 'var(--text-muted)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      <Clock size={14} />
                      <span>Bác sĩ đang tiếp nhận hồ sơ và chuẩn bị gửi kết quả khám sơ bộ cho bạn...</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
