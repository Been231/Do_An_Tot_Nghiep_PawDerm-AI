import React, { useState, useEffect, useMemo } from 'react';
import {
  CalendarCheck, Clock, MapPin, Phone, Stethoscope, AlertCircle, CheckCircle2,
  Send, RefreshCw, User, ChevronRight, X, Sparkles, CreditCard, Play, Eye,
  Maximize2, ArrowRight, ShieldCheck, Tag, FileText, Check, ChevronDown
} from 'lucide-react';
import { appointmentService } from '../../services/appointmentService';

// Danh sách các bệnh da liễu phổ biến để Bác sĩ chọn nhanh
const CLINICAL_DISEASE_OPTIONS = [
  'Nhiễm nấm da sợi khoáng (Ringworm / Dermatophytosis)',
  'Bệnh ghẻ Demodex (Demodectic Mange / Ve bao lông)',
  'Viêm da mủ & Dị ứng cơ địa (Pyoderma & Allergic Dermatitis)',
  'Nhiễm nấm men Malassezia vùng tai & kẽ móng chân',
  'Viêm nang lông do vi khuẩn & ve rận',
  'Ghẻ ngứa Sarcoptes (Sarcoptic Mange)',
  'Viêm da tiếp xúc môi trường & dị ứng thức ăn',
  'Bệnh da liễu khác (Cần cạo da xét nghiệm tại viện)'
];

const SEVERITY_LEVELS = [
  'Nhẹ - Có thể tự theo dõi & chăm sóc tại nhà',
  'Trung bình - Cần đến viện soi vi nấm & cạo biểu bì',
  'Nguy hiểm - Cần đưa bé đến viện cấp cứu ngay'
];

const COMMON_TESTS = [
  'Soi tươi vi nấm dưới kính hiển vi 40x - 100x',
  'Cạo biểu bì sâu tìm ve bao lông Demodex',
  'Soi đèn Wood (UV Wood’s lamp) phát hiện nấm sợi',
  'Nhuộm Gram kiểm tra vi khuẩn tụ cầu (Staphylococcus)',
  'Test nhanh dị nguyên & kháng sinh đồ'
];

export default function DoctorAppointmentQueue({ currentUser }) {
  const [appointments, setAppointments] = useState([]);
  const [queueSummary, setQueueSummary] = useState(null);
  const [loading, setLoading] = useState(false);

  // Bộ lọc
  const [selectedDate, setSelectedDate] = useState(() => {
    const now = new Date();
    return now.toISOString().slice(0, 10);
  });
  const [dateFilterMode, setDateFilterMode] = useState('today'); // 'today' | 'tomorrow' | 'all' | 'custom'
  const [selectedSlot, setSelectedSlot] = useState('all'); // 'all' | '08:00 - 09:30' ...
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'pending' | 'in_progress' | 'paid' | 'confirmed' | 'completed'

  // Modal Khám sơ bộ & Hội chẩn
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showExamModal, setShowExamModal] = useState(false);
  const [examTab, setExamTab] = useState('agree'); // 'agree' | 'custom'
  const [clinicalDiagnosis, setClinicalDiagnosis] = useState('');
  const [severityLevel, setSeverityLevel] = useState(SEVERITY_LEVELS[1]);
  const [selectedTests, setSelectedTests] = useState([COMMON_TESTS[0]]);
  const [doctorAdvice, setDoctorAdvice] = useState('');
  const [doctorPrescription, setDoctorPrescription] = useState('');
  const [savingExam, setSavingExam] = useState(false);

  // Modal Phóng to ảnh tổn thương
  const [zoomedImage, setZoomedImage] = useState(null);

  // Danh sách 4 khung giờ chuẩn của viện
  const TIME_SLOTS = [
    '08:00 - 09:30',
    '09:30 - 11:00',
    '14:00 - 15:30',
    '15:30 - 17:00'
  ];

  // Tính ngày hôm nay & ngày mai
  const todayStr = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const tomorrowStr = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().slice(0, 10);
  }, []);

  useEffect(() => {
    loadAppointments();
  }, [selectedDate, dateFilterMode, selectedSlot, statusFilter]);

  const loadAppointments = async () => {
    setLoading(true);
    try {
      const filters = {};
      if (dateFilterMode === 'today') {
        filters.date = todayStr;
      } else if (dateFilterMode === 'tomorrow') {
        filters.date = tomorrowStr;
      } else if (dateFilterMode === 'custom' && selectedDate) {
        filters.date = selectedDate;
      }
      if (selectedSlot !== 'all') {
        filters.time_slot = selectedSlot;
      }
      if (statusFilter !== 'all') {
        filters.status = statusFilter;
      }

      const res = await appointmentService.getDoctorAppointments(filters);
      setAppointments(res.appointments || []);
      setQueueSummary(res.summary || null);
    } catch (e) {
      console.warn('Lỗi tải danh sách lịch khám:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleDateModeChange = (mode) => {
    setDateFilterMode(mode);
    if (mode === 'today') {
      setSelectedDate(todayStr);
    } else if (mode === 'tomorrow') {
      setSelectedDate(tomorrowStr);
    }
  };

  // Bác sĩ bấm gọi ca tiếp theo vào phòng khám
  const handleCallNextPatient = async () => {
    // Tìm ca đang chờ (pending) có STT nhỏ nhất
    const pendingList = appointments.filter(a => a.status === 'pending');
    if (pendingList.length === 0) {
      alert('Hiện không còn bệnh nhân nào đang chờ trong danh sách ca trực này!');
      return;
    }
    const nextPatient = pendingList[0];
    await handleCallPatient(nextPatient.id, nextPatient.pet_name, nextPatient.queue_code);
  };

  // Bác sĩ bấm gọi một ca cụ thể vào phòng khám
  const handleCallPatient = async (aptId, petName, queueCode) => {
    try {
      await appointmentService.callPatient(aptId);
      alert(`📢 ĐÃ GỌI VÀO PHÒNG KHÁM: [${queueCode || 'STT'}] Bé "${petName}". Trạng thái chuyển sang: Đang khám!`);
      loadAppointments();
    } catch (e) {
      alert('Lỗi: ' + e.message);
    }
  };

  // Bác sĩ mở Modal Khám sơ bộ & Hội chẩn
  const handleOpenExamModal = (apt) => {
    setSelectedAppointment(apt);
    // Nếu có kết quả AI chẩn đoán đính kèm
    if (apt.ai_disease_name) {
      setClinicalDiagnosis(apt.doctor_pre_diagnosis || apt.ai_disease_name);
      setExamTab(apt.doctor_pre_diagnosis && apt.doctor_pre_diagnosis !== apt.ai_disease_name ? 'custom' : 'agree');
    } else {
      setClinicalDiagnosis(apt.doctor_pre_diagnosis || CLINICAL_DISEASE_OPTIONS[0]);
      setExamTab('custom');
    }
    setSeverityLevel(apt.severity_level || SEVERITY_LEVELS[1]);
    setSelectedTests(apt.clinical_tests && apt.clinical_tests.length > 0 ? apt.clinical_tests : [COMMON_TESTS[0]]);
    setDoctorAdvice(apt.doctor_advice || 'Không tắm xà phòng hoặc bôi thuốc lạ trong 24h trước khi đến viện để soi vi nấm chuẩn xác. Đeo loa chống liếm liên tục tránh làm loét sâu hơn.');
    setDoctorPrescription(apt.doctor_prescription_notes || '');
    setShowExamModal(true);
  };

  // Bác sĩ lưu kết quả khám & hội chẩn
  const handleSaveExam = async (e) => {
    e.preventDefault();
    if (!selectedAppointment) return;

    setSavingExam(true);
    try {
      const reviewStatus = examTab === 'agree' ? 'agreed' : 'corrected';
      await appointmentService.submitPreDiagnosis(selectedAppointment.id, {
        doctor_id: currentUser?.id || 'doc-001',
        doctor_name: currentUser?.full_name || 'BS. CKII Nguyễn Thị Mai Hương',
        doctor_pre_diagnosis: clinicalDiagnosis,
        severity_level: severityLevel,
        clinical_tests: selectedTests,
        doctor_advice: doctorAdvice,
        doctor_prescription_notes: doctorPrescription,
        review_status: reviewStatus,
        status: 'confirmed'
      });

      alert(`✅ Đã lưu kết quả khám sơ bộ & gửi hướng dẫn cho chủ nuôi bé "${selectedAppointment.pet_name}" thành công!`);
      setShowExamModal(false);
      loadAppointments();
    } catch (err) {
      alert('Lỗi: ' + (err.message || 'Không thể lưu kết quả'));
    } finally {
      setSavingExam(false);
    }
  };

  // Bác sĩ hoàn tất ca khám
  const handleCompleteAppointment = async (aptId, petName) => {
    if (!window.confirm(`Xác nhận bé "${petName}" đã hoàn tất ca khám và điều trị tại bệnh viện?`)) return;
    try {
      await appointmentService.updateStatus(aptId, 'completed');
      alert(`✅ Đã hoàn tất ca khám cho bé "${petName}"!`);
      loadAppointments();
    } catch (err) {
      alert('Lỗi: ' + err.message);
    }
  };

  const toggleTest = (test) => {
    setSelectedTests(prev =>
      prev.includes(test) ? prev.filter(t => t !== test) : [...prev, test]
    );
  };

  return (
    <div className="doctor-appointment-queue-wrap">
      {/* 1. HEADER CHÍNH & NÚT LÀM MỚI */}
      <div className="flex-between flex-wrap gap-3 mb-3">
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: '800', margin: 0, display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-main)' }}>
            <span>🏥</span> Hàng đợi khám bệnh viện theo số thứ tự (STT)
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0, marginTop: '3px' }}>
            Hệ thống bốc số tự động: Sắp xếp theo <strong>thứ tự ai tới trước - ai tới sau</strong>, tích hợp <strong>ảnh & kết quả chẩn đoán AI</strong> để bác sĩ hội chẩn nhanh.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            type="button"
            className="btn-filter-pill"
            onClick={loadAppointments}
            disabled={loading}
            style={{ fontSize: '13px', padding: '8px 14px', background: 'var(--card-bg)' }}
          >
            <RefreshCw size={14} className={loading ? 'spin' : ''} />
            <span>Làm mới danh sách ({appointments.length})</span>
          </button>

          <button
            type="button"
            className="btn-primary-gradient"
            onClick={handleCallNextPatient}
            style={{
              padding: '8px 16px',
              fontSize: '13.5px',
              fontWeight: '700',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 3px 10px rgba(42, 157, 143, 0.3)'
            }}
          >
            <Play size={15} />
            <span>Gọi số tiếp theo</span>
          </button>
        </div>
      </div>

      {/* 2. LIVE QUEUE CALLING BANNER (MÀN HÌNH BỐC SỐ BỆNH VIỆN THỜI GIAN THỰC) */}
      <div
        className="live-queue-banner mb-4"
        style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
          borderRadius: '14px',
          padding: '16px 20px',
          color: '#ffffff',
          boxShadow: '0 6px 20px rgba(15, 23, 42, 0.25)',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '16px',
          alignItems: 'center'
        }}
      >
        {/* CA ĐANG KHÁM HIỆN TẠI */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', borderRight: '1px solid rgba(255,255,255,0.12)', paddingRight: '16px' }}>
          <div
            style={{
              width: '52px',
              height: '52px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #ea580c, #f97316)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '24px',
              boxShadow: '0 0 15px rgba(249, 115, 22, 0.5)'
            }}
          >
            🩺
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: '11px', fontWeight: '800', letterSpacing: '1px', color: '#fb923c', textTransform: 'uppercase' }}>
              ● ĐANG TRONG PHÒNG KHÁM
            </div>
            {queueSummary?.current_calling ? (
              <div>
                <span style={{ fontSize: '18px', fontWeight: '900', color: '#ffffff' }}>
                  {queueSummary.current_calling.queue_code}
                </span>
                <span style={{ fontSize: '14px', fontWeight: '700', marginLeft: '8px', color: '#e2e8f0' }}>
                  {queueSummary.current_calling.pet_name}
                </span>
                <div style={{ fontSize: '12px', color: '#94a3b8' }}>
                  Chủ nuôi: {queueSummary.current_calling.owner_name} ({queueSummary.current_calling.appointment_time})
                </div>
              </div>
            ) : (
              <div style={{ fontSize: '13.5px', color: '#94a3b8', fontStyle: 'italic', marginTop: '2px' }}>
                Phòng khám đang trống, sẵn sàng tiếp nhận
              </div>
            )}
          </div>
        </div>

        {/* BỆNH NHÂN TIẾP THEO */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div
            style={{
              width: '52px',
              height: '52px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #0284c7, #38bdf8)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '24px'
            }}
          >
            ⏳
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: '11px', fontWeight: '800', letterSpacing: '1px', color: '#7dd3fc', textTransform: 'uppercase' }}>
              TIẾP THEO (CHUẨN BỊ VÀO)
            </div>
            {queueSummary?.next_in_line ? (
              <div>
                <span style={{ fontSize: '18px', fontWeight: '900', color: '#ffffff' }}>
                  {queueSummary.next_in_line.queue_code}
                </span>
                <span style={{ fontSize: '14px', fontWeight: '700', marginLeft: '8px', color: '#e2e8f0' }}>
                  {queueSummary.next_in_line.pet_name}
                </span>
                <div style={{ fontSize: '12px', color: '#94a3b8' }}>
                  Chủ nuôi: {queueSummary.next_in_line.owner_name} ({queueSummary.next_in_line.appointment_time})
                </div>
              </div>
            ) : (
              <div style={{ fontSize: '13.5px', color: '#94a3b8', fontStyle: 'italic', marginTop: '2px' }}>
                Không có bệnh nhân chờ trong ca trực này
              </div>
            )}
          </div>
        </div>

        {/* THỐNG KÊ NHANH 4 CHỈ SỐ */}
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
          <div style={{ textAlign: 'center', background: 'rgba(255,255,255,0.06)', padding: '6px 14px', borderRadius: '10px' }}>
            <div style={{ fontSize: '18px', fontWeight: '900', color: '#38bdf8' }}>{queueSummary?.total_booked ?? appointments.length}</div>
            <div style={{ fontSize: '10.5px', color: '#94a3b8' }}>Tổng ca đặt</div>
          </div>
          <div style={{ textAlign: 'center', background: 'rgba(255,255,255,0.06)', padding: '6px 14px', borderRadius: '10px' }}>
            <div style={{ fontSize: '18px', fontWeight: '900', color: '#4ade80' }}>{queueSummary?.paid_count ?? appointments.filter(a => a.payment_status === 'paid').length}</div>
            <div style={{ fontSize: '10.5px', color: '#94a3b8' }}>Đã thanh toán</div>
          </div>
          <div style={{ textAlign: 'center', background: 'rgba(255,255,255,0.06)', padding: '6px 14px', borderRadius: '10px' }}>
            <div style={{ fontSize: '18px', fontWeight: '900', color: '#facc15' }}>{queueSummary?.waiting_count ?? appointments.filter(a => a.status === 'pending').length}</div>
            <div style={{ fontSize: '10.5px', color: '#94a3b8' }}>Đang chờ</div>
          </div>
          <div style={{ textAlign: 'center', background: 'rgba(255,255,255,0.06)', padding: '6px 14px', borderRadius: '10px' }}>
            <div style={{ fontSize: '18px', fontWeight: '900', color: '#a78bfa' }}>{queueSummary?.completed_count ?? appointments.filter(a => a.status === 'completed' || a.status === 'confirmed').length}</div>
            <div style={{ fontSize: '10.5px', color: '#94a3b8' }}>Đã hoàn tất</div>
          </div>
        </div>
      </div>

      {/* 3. THANH CÔNG CỤ LỌC NGÀY & KHUNG GIỜ TRỰC */}
      <div className="card p-3 mb-4" style={{ borderRadius: 'var(--radius-lg)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* HÀNG 1: CHỌN NGÀY TRỰC */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-main)', minWidth: '90px' }}>
              📅 Ngày khám:
            </span>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button
                type="button"
                className={`btn-filter-pill ${dateFilterMode === 'today' ? 'active' : ''}`}
                onClick={() => handleDateModeChange('today')}
              >
                Hôm nay ({todayStr})
              </button>
              <button
                type="button"
                className={`btn-filter-pill ${dateFilterMode === 'tomorrow' ? 'active' : ''}`}
                onClick={() => handleDateModeChange('tomorrow')}
              >
                Ngày mai ({tomorrowStr})
              </button>
              <button
                type="button"
                className={`btn-filter-pill ${dateFilterMode === 'all' ? 'active' : ''}`}
                onClick={() => handleDateModeChange('all')}
              >
                Tất cả các ngày
              </button>
              <button
                type="button"
                className={`btn-filter-pill ${dateFilterMode === 'custom' ? 'active' : ''}`}
                onClick={() => handleDateModeChange('custom')}
              >
                Chọn ngày khác
              </button>
            </div>

            {dateFilterMode === 'custom' && (
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-subtle)',
                  fontSize: '13px',
                  background: 'var(--input-bg)',
                  color: 'var(--text-main)'
                }}
              />
            )}
          </div>

          {/* HÀNG 2: CHỌN KHUNG GIỜ KHÁM (CA SÁNG / CHIỀU) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', paddingTop: '8px', borderTop: '1px dashed var(--border-subtle)' }}>
            <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-main)', minWidth: '90px' }}>
              ⏰ Khung giờ:
            </span>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button
                type="button"
                className={`btn-filter-pill ${selectedSlot === 'all' ? 'active' : ''}`}
                onClick={() => setSelectedSlot('all')}
              >
                Tất cả khung giờ
              </button>
              {TIME_SLOTS.map((slot, i) => (
                <button
                  key={i}
                  type="button"
                  className={`btn-filter-pill ${selectedSlot === slot ? 'active' : ''}`}
                  onClick={() => setSelectedSlot(slot)}
                >
                  {slot}
                </button>
              ))}
            </div>
          </div>

          {/* HÀNG 3: LỌC THEO TRẠNG THÁI CA */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', paddingTop: '8px', borderTop: '1px dashed var(--border-subtle)' }}>
            <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-main)', minWidth: '90px' }}>
              🔍 Trạng thái:
            </span>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
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
                ⏳ Đang chờ ({appointments.filter(a => a.status === 'pending').length})
              </button>
              <button
                type="button"
                className={`btn-filter-pill ${statusFilter === 'in_progress' ? 'active' : ''}`}
                onClick={() => setStatusFilter('in_progress')}
                style={{ color: statusFilter === 'in_progress' ? '#ea580c' : undefined, fontWeight: '700' }}
              >
                🩺 Đang trong phòng khám ({appointments.filter(a => a.status === 'in_progress').length})
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
                ✓ Đã có chẩn đoán ({appointments.filter(a => a.status === 'confirmed').length})
              </button>
              <button
                type="button"
                className={`btn-filter-pill ${statusFilter === 'completed' ? 'active' : ''}`}
                onClick={() => setStatusFilter('completed')}
              >
                ✅ Hoàn tất ({appointments.filter(a => a.status === 'completed').length})
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 4. DANH SÁCH BỆNH NHÂN THEO THỨ TỰ BỐC SỐ (AI TỚI TRƯỚC LÊN TRƯỚC) */}
      {loading ? (
        <div className="card text-center p-5">
          <div className="donut-spinner mx-auto mb-3" />
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Đang tải hàng đợi bệnh nhân...</p>
        </div>
      ) : appointments.length === 0 ? (
        <div className="card text-center p-5" style={{ borderRadius: 'var(--radius-lg)' }}>
          <div style={{ fontSize: '42px', marginBottom: '10px' }}>🐾🗓️</div>
          <h4 style={{ fontSize: '16px', fontWeight: '800', marginBottom: '6px' }}>
            Không có ca khám nào trong ca trực này
          </h4>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>
            Hãy chọn mốc ngày khác hoặc khung giờ khác để theo dõi hàng đợi bệnh nhân.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {appointments.map((apt, index) => {
            const isCurrentCalling = apt.status === 'in_progress';
            const isPaid = apt.payment_status === 'paid';
            const hasAI = Boolean(apt.ai_disease_name || apt.ai_image_url);

            return (
              <div
                key={apt.id || index}
                className={`card doctor-patient-row-card animate-fadeIn ${isCurrentCalling ? 'calling-active' : ''}`}
                style={{
                  borderRadius: '14px',
                  padding: '18px 22px',
                  border: isCurrentCalling
                    ? '2px solid #ea580c'
                    : apt.status === 'confirmed'
                    ? '1.5px solid var(--primary-teal)'
                    : '1px solid var(--border-subtle)',
                  background: isCurrentCalling
                    ? 'linear-gradient(135deg, rgba(234, 88, 12, 0.04) 0%, rgba(255, 255, 255, 0.95) 100%)'
                    : 'var(--card-bg)',
                  boxShadow: isCurrentCalling ? '0 6px 20px rgba(234, 88, 12, 0.15)' : 'var(--shadow-sm)',
                  position: 'relative',
                  transition: 'all 0.2s ease'
                }}
              >
                {/* DÒNG 1: HUY HIỆU STT BỐC SỐ + KHUNG GIỜ + TRẠNG THÁI THANH TOÁN */}
                <div className="flex-between flex-wrap gap-2 mb-3 pb-2" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                    {/* HUY HIỆU SỐ THỨ TỰ BỐC SỐ CỰC TO VÀ RÕ RÀNG */}
                    <div
                      style={{
                        padding: '6px 14px',
                        borderRadius: '10px',
                        fontSize: '15px',
                        fontWeight: '900',
                        background: isCurrentCalling
                          ? 'linear-gradient(135deg, #ea580c, #f97316)'
                          : apt.status === 'confirmed' || apt.status === 'completed'
                          ? '#ecfdf5'
                          : '#eff6ff',
                        color: isCurrentCalling ? '#ffffff' : apt.status === 'confirmed' || apt.status === 'completed' ? '#059669' : '#1d4ed8',
                        border: isCurrentCalling ? 'none' : apt.status === 'confirmed' || apt.status === 'completed' ? '1.5px solid #a7f3d0' : '1.5px solid #bfdbfe',
                        boxShadow: isCurrentCalling ? '0 3px 10px rgba(234, 88, 12, 0.4)' : 'none',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <span>🎟️</span>
                      <span>{apt.queue_code || `STT-${String(apt.queue_number || index + 1).padStart(2, '0')}`}</span>
                    </div>

                    <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                      Mã phiếu: <strong>#{apt.id}</strong>
                    </span>

                    <span style={{ fontSize: '12.5px', background: 'var(--bg-subtle)', padding: '4px 10px', borderRadius: '6px' }}>
                      📅 <strong>{apt.appointment_date}</strong> (Khung: <strong>{apt.appointment_time}</strong>)
                    </span>

                    {/* BADGE THỨ TỰ ĐẾN / TỚI TRƯỚC TỚI SAU */}
                    <span
                      style={{
                        fontSize: '11.5px',
                        padding: '3px 8px',
                        borderRadius: '6px',
                        background: '#f1f5f9',
                        color: '#475569',
                        fontWeight: '600'
                      }}
                    >
                      Bốc số lúc: {apt.created_at ? new Date(apt.created_at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : '08:00'}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    {/* BADGE THANH TOÁN VIETQR */}
                    {isPaid ? (
                      <span
                        style={{
                          padding: '4px 10px',
                          borderRadius: '8px',
                          fontSize: '11.5px',
                          fontWeight: '800',
                          background: '#ecfdf5',
                          color: '#059669',
                          border: '1px solid #a7f3d0',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        <CreditCard size={12} />
                        <span>ĐÃ THANH TOÁN ({(apt.payment_amount || 200000).toLocaleString('vi-VN')}đ)</span>
                      </span>
                    ) : apt.payment_status === 'expired' ? (
                      <span
                        style={{
                          padding: '4px 10px',
                          borderRadius: '8px',
                          fontSize: '11.5px',
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
                          padding: '4px 10px',
                          borderRadius: '8px',
                          fontSize: '11.5px',
                          fontWeight: '700',
                          background: '#fffbeb',
                          color: '#d97706',
                          border: '1px solid #fde68a'
                        }}
                      >
                        CHỜ THANH TOÁN
                      </span>
                    )}

                    {/* TRẠNG THÁI KHÁM */}
                    <span
                      style={{
                        padding: '4px 12px',
                        borderRadius: '999px',
                        fontSize: '12px',
                        fontWeight: '800',
                        background: isCurrentCalling
                          ? '#ea580c'
                          : apt.status === 'confirmed'
                          ? 'var(--primary-teal-light)'
                          : apt.status === 'completed'
                          ? 'var(--success-light)'
                          : '#f1f5f9',
                        color: isCurrentCalling
                          ? '#ffffff'
                          : apt.status === 'confirmed'
                          ? 'var(--primary-teal-dark)'
                          : apt.status === 'completed'
                          ? 'var(--success)'
                          : '#64748b'
                      }}
                    >
                      {isCurrentCalling
                        ? '🩺 ĐANG TRONG PHÒNG KHÁM'
                        : apt.status === 'confirmed'
                        ? '✓ Đã có chẩn đoán'
                        : apt.status === 'completed'
                        ? '✅ Đã hoàn tất'
                        : '⏳ Chờ đến lượt'}
                    </span>
                  </div>
                </div>

                {/* DÒNG 2: BỐ CỤC 3 KHỐI: THÔNG TIN THÚ CƯNG - DỮ LIỆU CHẨN ĐOÁN AI - KẾT LUẬN BÁC SĨ */}
                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.6fr 1.2fr', gap: '18px', alignItems: 'start' }}>
                  {/* CỘT 1: THÚ CƯNG & CHỦ NUÔI */}
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                      <div
                        style={{
                          width: '46px',
                          height: '46px',
                          borderRadius: '12px',
                          background: 'linear-gradient(135deg, #fed7aa, #ffedd5)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '22px'
                        }}
                      >
                        {apt.pet_species?.includes('Mèo') ? '🐱' : '🐶'}
                      </div>
                      <div>
                        <h4 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: 'var(--text-main)' }}>
                          {apt.pet_name}
                        </h4>
                        <div style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>
                          Loài: <strong>{apt.pet_species}</strong>
                        </div>
                      </div>
                    </div>

                    <div style={{ fontSize: '12.5px', color: 'var(--text-body)', lineHeight: '1.6' }}>
                      <div>Chủ nuôi: <strong>{apt.owner_name}</strong></div>
                      <div>
                        SĐT: <a href={`tel:${apt.phone}`} style={{ color: 'var(--primary-teal)', fontWeight: '700', textDecoration: 'none' }}>{apt.phone}</a>
                      </div>
                      <div style={{ marginTop: '4px', color: 'var(--primary-orange-dark)', fontWeight: '700' }}>
                        🎯 {apt.service_title}
                      </div>
                    </div>

                    {apt.notes && (
                      <div style={{ marginTop: '8px', padding: '8px 10px', background: 'var(--bg-subtle)', borderRadius: '8px', fontSize: '12px', color: 'var(--text-muted)' }}>
                        <strong>Mô tả của khách:</strong> "{apt.notes}"
                      </div>
                    )}
                  </div>

                  {/* CỘT 2: KHỐI KẾT QUẢ CHẨN ĐOÁN AI ĐÍNH KÈM (TRỌNG TÂM) */}
                  <div
                    style={{
                      background: hasAI ? 'linear-gradient(135deg, rgba(2, 132, 199, 0.05) 0%, rgba(234, 88, 12, 0.04) 100%)' : 'var(--bg-subtle)',
                      border: hasAI ? '1.5px solid rgba(2, 132, 199, 0.25)' : '1px solid var(--border-subtle)',
                      borderRadius: '12px',
                      padding: '12px 14px'
                    }}
                  >
                    <div className="flex-between mb-2">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: '800', color: hasAI ? '#0284c7' : 'var(--text-muted)' }}>
                        <Sparkles size={14} />
                        <span>KẾT QUẢ CHẨN ĐOÁN AI ĐÍNH KÈM</span>
                      </div>
                      {hasAI && (
                        <span
                          style={{
                            fontSize: '11px',
                            fontWeight: '800',
                            padding: '2px 8px',
                            borderRadius: '6px',
                            background: '#e0f2fe',
                            color: '#0369a1'
                          }}
                        >
                          {apt.ai_confidence}% Tin cậy
                        </span>
                      )}
                    </div>

                    {hasAI ? (
                      <div style={{ display: 'flex', gap: '12px', alignItems: 'start' }}>
                        {/* ẢNH TỔN THƯƠNG DA LIỄU CHỤP TỪ AI */}
                        {apt.ai_image_url ? (
                          <div
                            style={{ position: 'relative', cursor: 'pointer', flexShrink: 0 }}
                            onClick={() => setZoomedImage(apt.ai_image_url)}
                            title="Bấm để phóng to xem chi tiết bờ viền nấm/ghẻ"
                          >
                            <img
                              src={apt.ai_image_url}
                              alt="Ảnh tổn thương da"
                              style={{
                                width: '74px',
                                height: '74px',
                                borderRadius: '10px',
                                objectFit: 'cover',
                                border: '2px solid #bae6fd',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
                              }}
                            />
                            <div
                              style={{
                                position: 'absolute',
                                bottom: '3px',
                                right: '3px',
                                background: 'rgba(0,0,0,0.6)',
                                color: '#fff',
                                borderRadius: '4px',
                                padding: '2px 4px',
                                fontSize: '10px',
                                display: 'flex',
                                alignItems: 'center'
                              }}
                            >
                              <Maximize2 size={10} />
                            </div>
                          </div>
                        ) : (
                          <div
                            style={{
                              width: '74px',
                              height: '74px',
                              borderRadius: '10px',
                              background: '#e2e8f0',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '11px',
                              color: '#64748b',
                              textAlign: 'center',
                              padding: '4px',
                              flexShrink: 0
                            }}
                          >
                            Không có ảnh
                          </div>
                        )}

                        <div style={{ minWidth: 0, flex: 1 }}>
                          <div style={{ fontSize: '14px', fontWeight: '800', color: 'var(--text-main)', marginBottom: '4px' }}>
                            {apt.ai_disease_name}
                          </div>
                          <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginBottom: '6px' }}>
                            Mức độ AI cảnh báo: <strong>{apt.ai_severity || 'Trung bình'}</strong>
                          </div>

                          {/* THANH XÁC SUẤT NẾU CÓ */}
                          {apt.ai_probabilities && apt.ai_probabilities.length > 0 && (
                            <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                              {apt.ai_probabilities.slice(0, 2).map((p, pIdx) => (
                                <span
                                  key={pIdx}
                                  style={{
                                    fontSize: '10.5px',
                                    padding: '2px 6px',
                                    borderRadius: '4px',
                                    background: 'rgba(2, 132, 199, 0.1)',
                                    color: '#0284c7',
                                    fontWeight: '600'
                                  }}
                                >
                                  {p.label}: {p.percent}%
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div style={{ fontSize: '12.5px', color: 'var(--text-muted)', fontStyle: 'italic', padding: '6px 0' }}>
                        Khách hàng đặt lịch trực tiếp tại viện (Chưa quét qua tính năng chẩn đoán AI).
                      </div>
                    )}
                  </div>

                  {/* CỘT 3: KẾT QUẢ KHÁM & PHÁC ĐỒ CỦA BÁC SĨ (NẾU ĐÃ KHÁM) */}
                  <div
                    style={{
                      background: apt.doctor_pre_diagnosis ? 'linear-gradient(135deg, rgba(42, 157, 143, 0.08) 0%, rgba(14, 165, 233, 0.06) 100%)' : 'var(--bg-subtle)',
                      border: apt.doctor_pre_diagnosis ? '1px solid var(--primary-teal-border)' : '1px solid var(--border-subtle)',
                      borderRadius: '12px',
                      padding: '12px 14px'
                    }}
                  >
                    <div style={{ fontSize: '12px', fontWeight: '800', color: 'var(--primary-teal-dark)', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '6px' }}>
                      <Stethoscope size={14} />
                      <span>KẾT LUẬN CỦA BÁC SĨ</span>
                    </div>

                    {apt.doctor_pre_diagnosis ? (
                      <div style={{ fontSize: '12.5px' }}>
                        <div style={{ fontWeight: '800', color: 'var(--text-main)', marginBottom: '3px' }}>
                          {apt.doctor_pre_diagnosis}
                        </div>
                        <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginBottom: '4px' }}>
                          Độ ưu tiên: <strong>{apt.severity_level}</strong>
                        </div>
                        {apt.clinical_tests && apt.clinical_tests.length > 0 && (
                          <div style={{ fontSize: '11px', color: 'var(--primary-teal)', fontWeight: '600', marginBottom: '4px' }}>
                            🔬 {apt.clinical_tests.length} xét nghiệm chỉ định
                          </div>
                        )}
                        <div style={{ fontSize: '11.5px', color: 'var(--text-body)', marginTop: '4px', fontStyle: 'italic' }}>
                          "{apt.doctor_advice}"
                        </div>
                      </div>
                    ) : (
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontStyle: 'italic', padding: '10px 0' }}>
                        Bác sĩ chưa tiếp nhận khám. Vui lòng bấm "Khám & Hội chẩn sau AI" để đưa ra kết luận.
                      </div>
                    )}
                  </div>
                </div>

                {/* DÒNG 3: CÁC NÚT THAO TÁC CỦA BÁC SĨ */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '10px', marginTop: '14px', paddingTop: '12px', borderTop: '1px solid var(--border-subtle)' }}>
                  {/* NÚT GỌI VÀO PHÒNG KHÁM */}
                  {apt.status === 'pending' && (
                    <button
                      type="button"
                      className="btn-filter-pill"
                      onClick={() => handleCallPatient(apt.id, apt.pet_name, apt.queue_code)}
                      style={{
                        padding: '8px 14px',
                        fontSize: '13px',
                        fontWeight: '700',
                        color: '#ea580c',
                        background: '#fff7ed',
                        border: '1.5px solid #fed7aa',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <Play size={14} />
                      <span>Mời vào phòng khám</span>
                    </button>
                  )}

                  {/* NÚT KHÁM SƠ BỘ & HỘI CHẨN AI */}
                  <button
                    type="button"
                    className="btn-primary-gradient"
                    onClick={() => handleOpenExamModal(apt)}
                    style={{
                      padding: '8px 16px',
                      fontSize: '13px',
                      fontWeight: '700',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      background: isCurrentCalling ? 'linear-gradient(135deg, #ea580c, #c2410c)' : undefined
                    }}
                  >
                    <Stethoscope size={15} />
                    <span>{apt.doctor_pre_diagnosis ? 'Sửa chẩn đoán & Hội chẩn AI' : 'Khám & Hội chẩn sau AI'}</span>
                  </button>

                  {/* NÚT HOÀN TẤT CA KHÁM */}
                  {apt.status !== 'completed' && (
                    <button
                      type="button"
                      className="btn-filter-pill"
                      onClick={() => handleCompleteAppointment(apt.id, apt.pet_name)}
                      title="Xác nhận hoàn tất ca khám cho bệnh nhân"
                      style={{
                        padding: '8px 14px',
                        fontSize: '13px',
                        fontWeight: '700',
                        color: '#059669',
                        background: '#ecfdf5',
                        border: '1.5px solid #a7f3d0',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <CheckCircle2 size={15} />
                      <span>Hoàn tất ca khám</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 5. MODAL KHÁM SƠ BỘ & HỘI CHẨN ĐỐI CHIẾU KẾT QUẢ AI */}
      {showExamModal && selectedAppointment && (
        <div
          className="pf-overlay"
          onClick={() => setShowExamModal(false)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9998,
            background: 'rgba(15, 23, 42, 0.68)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
        >
          <div
            className="pf-modal-clean"
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: '920px',
              width: '94%',
              background: '#ffffff',
              padding: '24px 28px',
              borderRadius: '20px',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 25px 65px rgba(15, 23, 42, 0.4)',
              border: '1px solid #e2e8f0'
            }}
          >
            {/* MODAL HEADER */}
            <div className="flex-between pb-3 mb-3" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'var(--primary-teal-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Stethoscope size={20} style={{ color: 'var(--primary-teal)' }} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800' }}>
                    Hội Chẩn Lâm Sàng & Khám Bệnh Viện ({selectedAppointment.queue_code || 'STT'})
                  </h3>
                  <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                    Bệnh nhân: <strong>{selectedAppointment.pet_name}</strong> ({selectedAppointment.pet_species}) · Chủ nuôi: <strong>{selectedAppointment.owner_name}</strong> ({selectedAppointment.phone})
                  </div>
                </div>
              </div>
              <button
                type="button"
                className="pf-close"
                onClick={() => setShowExamModal(false)}
                style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                ✕
              </button>
            </div>

            {/* BỐ CỤC 2 CỘT: CỘT TRÁI DỮ LIỆU AI - CỘT PHẢI KẾT LUẬN BÁC SĨ */}
            <form onSubmit={handleSaveExam}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.3fr', gap: '20px', alignItems: 'start', marginBottom: '18px' }}>
                {/* CỘT TRÁI: DỮ LIỆU & ẢNH QUÉT CỦA MÔ HÌNH AI */}
                <div style={{ background: 'var(--bg-subtle)', borderRadius: '14px', padding: '16px', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '12px', fontWeight: '800', color: '#0284c7', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
                    <Sparkles size={15} />
                    <span>DỮ LIỆU AI QUÉT BAN ĐẦU</span>
                  </div>

                  {/* ẢNH TỔN THƯƠNG DA */}
                  {selectedAppointment.ai_image_url ? (
                    <div style={{ marginBottom: '12px', position: 'relative' }}>
                      <img
                        src={selectedAppointment.ai_image_url}
                        alt="Ảnh tổn thương da"
                        style={{
                          width: '100%',
                          height: '190px',
                          borderRadius: '10px',
                          objectFit: 'cover',
                          border: '2px solid #bae6fd'
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setZoomedImage(selectedAppointment.ai_image_url)}
                        style={{
                          position: 'absolute',
                          bottom: '8px',
                          right: '8px',
                          background: 'rgba(0,0,0,0.7)',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '6px',
                          padding: '4px 8px',
                          fontSize: '11px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        <Maximize2 size={12} />
                        <span>Phóng to xem</span>
                      </button>
                    </div>
                  ) : (
                    <div style={{ height: '120px', borderRadius: '10px', background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', fontSize: '13px', marginBottom: '12px' }}>
                      Chưa có ảnh quét từ AI
                    </div>
                  )}

                  {/* THÔNG TIN AI DỰ ĐOÁN */}
                  <div style={{ background: '#ffffff', borderRadius: '10px', padding: '12px', border: '1px solid var(--border-subtle)' }}>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Mô hình AI dự đoán:</div>
                    <div style={{ fontSize: '15px', fontWeight: '800', color: 'var(--primary-teal-dark)', marginTop: '2px' }}>
                      {selectedAppointment.ai_disease_name || 'Chưa qua quét AI'}
                    </div>
                    {selectedAppointment.ai_confidence > 0 && (
                      <div style={{ fontSize: '12px', color: '#0369a1', fontWeight: '700', marginTop: '2px' }}>
                        Độ tin cậy: {selectedAppointment.ai_confidence}%
                      </div>
                    )}

                    {selectedAppointment.notes && (
                      <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px dashed var(--border-subtle)', fontSize: '12px', color: 'var(--text-muted)' }}>
                        <strong>Mô tả lâm sàng của chủ:</strong> "{selectedAppointment.notes}"
                      </div>
                    )}
                  </div>
                </div>

                {/* CỘT PHẢI: QUYẾT ĐỊNH CHUYÊN MÔN CỦA BÁC SĨ */}
                <div>
                  {/* TAB CHỌN NHANH: ĐỒNG Ý AI HAY CHỈNH SỬA */}
                  {selectedAppointment.ai_disease_name && (
                    <div className="sub-nav-tabs mb-3" style={{ background: 'var(--bg-subtle)' }}>
                      <button
                        type="button"
                        className={`sub-tab-btn ${examTab === 'agree' ? 'active' : ''}`}
                        onClick={() => {
                          setExamTab('agree');
                          setClinicalDiagnosis(selectedAppointment.ai_disease_name);
                        }}
                        style={{ fontSize: '12.5px', padding: '8px 12px' }}
                      >
                        <Check size={14} />
                        <span>Đồng thuận với kết quả AI</span>
                      </button>
                      <button
                        type="button"
                        className={`sub-tab-btn ${examTab === 'custom' ? 'active' : ''}`}
                        onClick={() => setExamTab('custom')}
                        style={{ fontSize: '12.5px', padding: '8px 12px' }}
                      >
                        <span>✏️ Chẩn đoán y khoa khác</span>
                      </button>
                    </div>
                  )}

                  {/* CHỌN BỆNH CHẨN ĐOÁN LÂM SÀNG */}
                  <div className="mb-3">
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', marginBottom: '6px' }}>
                      Bác sĩ kết luận chẩn đoán lâm sàng *
                    </label>
                    <select
                      className="clean-input-pill mb-2"
                      value={clinicalDiagnosis}
                      onChange={(e) => setClinicalDiagnosis(e.target.value)}
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '10px' }}
                    >
                      {CLINICAL_DISEASE_OPTIONS.map((opt, i) => (
                        <option key={i} value={opt}>{opt}</option>
                      ))}
                      <option value="custom_other">+ Nhập bệnh lý khác...</option>
                    </select>

                    {clinicalDiagnosis === 'custom_other' && (
                      <input
                        type="text"
                        className="clean-input-pill"
                        placeholder="Nhập tên bệnh chẩn đoán..."
                        onChange={(e) => setClinicalDiagnosis(e.target.value)}
                        style={{ width: '100%', padding: '10px 14px', borderRadius: '10px' }}
                        required
                      />
                    )}
                  </div>

                  {/* MỨC ĐỘ ƯU TIÊN / NGUY HIỂM */}
                  <div className="mb-3">
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', marginBottom: '6px' }}>
                      Đánh giá mức độ ưu tiên lâm sàng *
                    </label>
                    <select
                      className="clean-input-pill"
                      value={severityLevel}
                      onChange={(e) => setSeverityLevel(e.target.value)}
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '10px' }}
                    >
                      {SEVERITY_LEVELS.map((sev, i) => (
                        <option key={i} value={sev}>{sev}</option>
                      ))}
                    </select>
                  </div>

                  {/* CHỈ ĐỊNH XÉT NGHIỆM TẠI VIỆN */}
                  <div className="mb-3">
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', marginBottom: '6px' }}>
                      Chỉ định xét nghiệm cận lâm sàng tại phòng khám:
                    </label>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {COMMON_TESTS.map((t, idx) => (
                        <label
                          key={idx}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            fontSize: '12.5px',
                            cursor: 'pointer',
                            padding: '6px 10px',
                            borderRadius: '8px',
                            background: selectedTests.includes(t) ? 'var(--primary-teal-light)' : 'var(--bg-subtle)'
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={selectedTests.includes(t)}
                            onChange={() => toggleTest(t)}
                          />
                          <span>{t}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* LỜI DẶN DÒ Y TẾ CHO CHỦ NUÔI */}
                  <div className="mb-4">
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', marginBottom: '6px' }}>
                      Lời dặn dò y tế & Hướng dẫn chuẩn bị trước khi đến viện *
                    </label>
                    <textarea
                      rows={3}
                      className="clean-input-pill"
                      placeholder="Dặn dò chủ nuôi về cách ly, kiêng cữ xà phòng tắm, đeo loa bảo vệ..."
                      value={doctorAdvice}
                      onChange={(e) => setDoctorAdvice(e.target.value)}
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', resize: 'vertical' }}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* FOOTER NÚT BẤM */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', paddingTop: '12px', borderTop: '1px solid var(--border-subtle)' }}>
                <button
                  type="button"
                  className="btn-filter-pill"
                  onClick={() => setShowExamModal(false)}
                  style={{ padding: '10px 18px' }}
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="btn-primary-gradient"
                  disabled={savingExam}
                  style={{ padding: '10px 24px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <Send size={15} />
                  <span>{savingExam ? 'Đang lưu...' : 'Lưu Kết Luận & Đồng Bộ Kết Quả Cho Khách'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. MODAL PHÓNG TO ẢNH TỔN THƯƠNG DA ĐỂ BÁC SĨ SOI RÕ BỆNH TÍCH */}
      {zoomedImage && (
        <div
          className="pf-overlay"
          onClick={() => setZoomedImage(null)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            background: 'rgba(15, 23, 42, 0.88)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px'
          }}
        >
          <div style={{ position: 'relative', maxWidth: '85vw', maxHeight: '85vh' }} onClick={(e) => e.stopPropagation()}>
            <img
              src={zoomedImage}
              alt="Ảnh bệnh tích phóng to"
              style={{ maxWidth: '100%', maxHeight: '85vh', borderRadius: '12px', objectFit: 'contain', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}
            />
            <button
              type="button"
              onClick={() => setZoomedImage(null)}
              style={{
                position: 'absolute',
                top: '-14px',
                right: '-14px',
                background: '#ea580c',
                color: '#ffffff',
                border: 'none',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 10px rgba(0,0,0,0.3)',
                fontSize: '16px',
                fontWeight: '800'
              }}
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
