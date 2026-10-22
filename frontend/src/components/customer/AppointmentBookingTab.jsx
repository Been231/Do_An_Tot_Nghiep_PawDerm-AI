import React, { useState, useEffect } from 'react';
import {
  Calendar, Clock, MapPin, Phone, Stethoscope, Sparkles, CheckCircle2,
  AlertCircle, ChevronRight, User, Heart, ShieldCheck, Plus, CalendarCheck,
  Check, Info, Tag, FileText
} from 'lucide-react';
import { appointmentService } from '../../services/appointmentService';

// 4 mốc khung giờ khám bệnh viện chuẩn
const TIME_SLOTS = [
  '08:00 - 09:30',
  '09:30 - 11:00',
  '14:00 - 15:30',
  '15:30 - 17:00'
];

const MAX_SLOT_CAPACITY = 12;

// Địa chỉ và thông tin Bệnh viện thú y PawDerm
const HOSPITAL_INFO = {
  address: '1A Lê Thị Xuyến, quận Thanh Khuê, Đà Nẵng',
  phone: '0795477302',
  hours: '8h-17h (Tất cả các ngày trong tuần)'
};

// Gợi ý nhanh chi tiết bệnh để khách bấm thêm vào mô tả
const CLINICAL_DETAIL_TAGS = [
  'Vết đỏ & rụng lông ở tai/mặt',
  'Ngứa gãi dữ dội về đêm',
  'Da sần sùi / đóng vảy sừng',
  'Vảy gàu trắng ngứa ngáy',
  'Mụn mủ & lở loét chảy dịch',
  'Có mùi hôi tanh khó chịu',
  'Mới phát hiện 2-3 ngày',
  'Kéo dài hơn 1 tuần',
  'Bé liếm cắn liên tục',
  'Chưa từng dùng thuốc điều trị',
  'Đang dùng thuốc bôi ngoài da'
];

export default function AppointmentBookingTab({
  currentUser,
  pets = [],
  initialBookingData = null,
  recentDiagnosis = null,
  historyRecords = [],
  onOpenAddPetModal,
  onRequireAuth
}) {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState({ type: '', text: '' });

  // Ngày hôm nay (YYYY-MM-DD)
  const getTodayStr = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const todayStr = getTodayStr();

  // Form State: Khách tự điền, không điền mẫu
  const [selectedPetId, setSelectedPetId] = useState(pets.length > 0 ? pets[0].id : 'custom');
  const [customPetName, setCustomPetName] = useState('');
  const [customPetSpecies, setCustomPetSpecies] = useState('Chó 🐶');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [appointmentDate, setAppointmentDate] = useState(todayStr);
  const [appointmentTime, setAppointmentTime] = useState(TIME_SLOTS[0]);
  const [serviceTitle, setServiceTitle] = useState('Khám da liễu chuyên sâu & Soi tươi vi nấm');
  const [doctorName, setDoctorName] = useState('BS. CKII Nguyễn Thị Mai Hương');
  const [notes, setNotes] = useState('');

  // Tình trạng 4 khung giờ trong ngày (đã đặt / còn trống)
  const [slotAvailability, setSlotAvailability] = useState({});
  const [loadingSlots, setLoadingSlots] = useState(false);

  // Trạng thái đính kèm chẩn đoán AI
  const [attachAiDiagnosis, setAttachAiDiagnosis] = useState(false);
  const [selectedAiScan, setSelectedAiScan] = useState(null);

  const SERVICES = [
    { title: 'Khám da liễu chuyên sâu & Soi tươi vi nấm', price: '350.000đ', desc: 'Cạo vảy soi tươi dưới kính hiển vi, phát hiện nấm sợi & ký sinh trùng' },
    { title: 'Khám sơ bộ & Hội chẩn sau kết quả AI', price: '200.000đ', desc: 'Bác sĩ kiểm tra đối chiếu trực tiếp với kết quả quét AI YOLOv8' },
    { title: 'Cấp cứu viêm da lở loét & Dị ứng cấp', price: '300.000đ', desc: 'Xử lý sát khuẩn khẩn cấp, ngăn chặn bội nhiễm lan rộng' },
    { title: 'Tái khám & Đánh giá tiến độ hồi phục', price: '150.000đ', desc: 'Đo lường sự mọc lông lại và điều chỉnh đơn thuốc' }
  ];

  // 1. Tải danh sách lịch hẹn của khách hàng
  useEffect(() => {
    loadAppointments();
  }, [currentUser]);

  // 2. Tải số lượng người đặt của 4 khung giờ theo ngày đã chọn
  useEffect(() => {
    if (appointmentDate) {
      loadSlotAvailability(appointmentDate);
    }
  }, [appointmentDate]);

  // 3. Đồng bộ thú cưng khi danh sách pets thay đổi
  useEffect(() => {
    if (pets.length > 0 && selectedPetId === 'custom' && !customPetName) {
      setSelectedPetId(pets[0].id);
    }
  }, [pets]);

  // 4. Khởi tạo dữ liệu chẩn đoán AI có sẵn (từ scan vừa thực hiện hoặc chuyển tiếp)
  useEffect(() => {
    const activeScan = initialBookingData || recentDiagnosis || (historyRecords.length > 0 ? historyRecords[0] : null);
    if (activeScan) {
      setSelectedAiScan(activeScan);
      // Nếu đến từ nút bấm "Đặt lịch ngay" trong kết quả chẩn đoán thì tự động bật đính kèm
      if (initialBookingData) {
        setAttachAiDiagnosis(true);
        if (initialBookingData.pet?.id) {
          setSelectedPetId(initialBookingData.pet.id);
        } else if (initialBookingData.pet?.name) {
          setCustomPetName(initialBookingData.pet.name);
          setSelectedPetId('custom');
        }
        if (initialBookingData.notes) {
          setNotes(initialBookingData.notes);
        }
        setServiceTitle('Khám sơ bộ & Hội chẩn sau kết quả AI');
      }
    }
  }, [initialBookingData, recentDiagnosis, historyRecords]);

  const loadAppointments = async () => {
    if (!currentUser?.id) {
      setAppointments([]);
      return;
    }
    setLoading(true);
    try {
      const data = await appointmentService.getMyAppointments(currentUser.id);
      setAppointments(data || []);
    } catch (e) {
      console.warn('Lỗi tải danh sách lịch hẹn:', e);
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  const loadSlotAvailability = async (dateStr) => {
    setLoadingSlots(true);
    try {
      const res = await appointmentService.getSlotAvailability(dateStr);
      if (res?.slots) {
        setSlotAvailability(res.slots);

        // Nếu khung giờ đang chọn đã hết chỗ, tự chuyển sang khung giờ còn chỗ đầu tiên
        const currentSlotInfo = res.slots[appointmentTime];
        if (currentSlotInfo?.is_full) {
          const firstAvailable = TIME_SLOTS.find(slot => !res.slots[slot]?.is_full);
          if (firstAvailable) {
            setAppointmentTime(firstAvailable);
          }
        }
      }
    } catch (e) {
      console.warn('Lỗi kiểm tra khung giờ:', e);
    } finally {
      setLoadingSlots(false);
    }
  };

  // Xử lý bật/tắt đính kèm kết quả Chẩn đoán AI vào mô tả
  const handleToggleAiDiagnosis = (checked) => {
    setAttachAiDiagnosis(checked);
    if (checked && selectedAiScan) {
      const disease = selectedAiScan.disease_name_vi || selectedAiScan.diseaseName || selectedAiScan.disease_key || 'Nghi ngờ bệnh da liễu';
      const conf = selectedAiScan.confidence ? `${Math.round(selectedAiScan.confidence)}%` : '';
      const symList = Array.isArray(selectedAiScan.clinical_symptoms)
        ? selectedAiScan.clinical_symptoms.slice(0, 3).join(', ')
        : (selectedAiScan.symptoms ? selectedAiScan.symptoms.toString() : '');

      const aiSnippet = `[Kết quả Chẩn đoán AI: ${disease}${conf ? ` (${conf})` : ''}${symList ? ` - Dấu hiệu: ${symList}` : ''}]`;

      if (!notes.includes(aiSnippet)) {
        setNotes(prev => prev ? `${aiSnippet}\n${prev}` : aiSnippet);
      }
    }
  };

  // Bấm thêm chi tiết bệnh vào mô tả để bác sĩ chẩn đoán rõ hơn
  const handleAddClinicalDetail = (tag) => {
    setNotes(prev => {
      if (!prev) return tag;
      if (prev.includes(tag)) return prev; // tránh trùng lặp
      return `${prev} | ${tag}`;
    });
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    setFeedbackMsg({ type: '', text: '' });

    if (!currentUser) {
      onRequireAuth?.('login');
      return;
    }

    // 1. Kiểm tra ngày hẹn: Chỉ cho phép đặt ngày hiện tại và tương lai
    if (!appointmentDate || appointmentDate < todayStr) {
      setFeedbackMsg({
        type: 'error',
        text: `⚠️ Ngày hẹn khám không thể là ngày trong quá khứ! Vui lòng chọn từ ngày hôm nay (${todayStr}) trở đi.`
      });
      return;
    }

    // 2. Xác định tên và loài thú cưng (tự điền hoặc chọn từ hồ sơ)
    let petName = '';
    let petSpecies = 'Chó / Mèo';

    if (selectedPetId && selectedPetId !== 'custom') {
      const p = pets.find(item => item.id === selectedPetId);
      if (p) {
        petName = p.name;
        petSpecies = p.species || 'Chó / Mèo';
      }
    } else {
      petName = customPetName.trim();
      petSpecies = customPetSpecies;
    }

    if (!petName) {
      setFeedbackMsg({ type: 'error', text: 'Vui lòng nhập tên bé cưng của bạn cần đưa đi khám!' });
      return;
    }

    // 3. Kiểm tra số điện thoại
    const cleanedPhone = phone.trim();
    if (!cleanedPhone || cleanedPhone.length < 10) {
      setFeedbackMsg({ type: 'error', text: 'Vui lòng nhập số điện thoại hợp lệ (10 chữ số) để Bệnh viện và Bác sĩ liên hệ!' });
      return;
    }

    // 4. Kiểm tra giới hạn 12 người của khung giờ đã chọn
    const slotInfo = slotAvailability[appointmentTime];
    if (slotInfo && slotInfo.is_full) {
      setFeedbackMsg({
        type: 'error',
        text: `Khung giờ "${appointmentTime}" ngày ${appointmentDate} đã đủ 12 lượt đặt khám. Vui lòng chọn khung giờ khác!`
      });
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        user_id: currentUser?.id,
        owner_name: currentUser?.full_name || currentUser?.username || 'Khách hàng',
        phone: cleanedPhone,
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
        text: `🎉 Đặt lịch khám cho bé "${petName}" tại Bệnh viện Thú Y PawDerm (${HOSPITAL_INFO.address}) thành công! Khung giờ: ${appointmentTime} ngày ${appointmentDate}.`
      });

      // Reset form sau khi gửi
      setNotes('');
      if (selectedPetId === 'custom') {
        setCustomPetName('');
      }
      setAttachAiDiagnosis(false);

      // Tải lại danh sách lịch hẹn và cập nhật số chỗ trống
      loadAppointments();
      loadSlotAvailability(appointmentDate);
    } catch (err) {
      setFeedbackMsg({ type: 'error', text: err.message || 'Lỗi khi gửi yêu cầu đặt lịch hẹn!' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="appointment-portal-section animate-fadeIn">
      {/* 1. HERO BANNER: THÔNG TIN BỆNH VIỆN PAWDERM ĐÀ NẴNG */}
      <div
        className="card hospital-hero-banner mb-4"
        style={{
          background: 'linear-gradient(135deg, rgba(42, 157, 143, 0.12) 0%, rgba(217, 119, 6, 0.1) 100%)',
          border: '1px solid var(--primary-teal-border)',
          borderRadius: 'var(--radius-lg)',
          padding: '24px 22px'
        }}
      >
        <div className="flex-between flex-wrap gap-3">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span style={{ fontSize: '26px' }}>🏥</span>
              <h2 style={{ fontSize: '19px', fontWeight: '800', margin: 0, color: 'var(--text-main)' }}>
                Bệnh Viện Thú Y PawDerm — Trung Tâm Khám & Da Liễu Thú Cưng
              </h2>
            </div>
            <p style={{ fontSize: '13.5px', color: 'var(--text-body)', maxWidth: '640px', lineHeight: '1.6', margin: 0 }}>
              Đặt lịch khám trực tiếp để được <strong>Bác sĩ chuyên khoa khám lâm sàng, soi tươi vi nấm</strong> và tiếp nhận điều trị chuyên sâu sau khi quét bệnh qua AI.
            </p>
          </div>

          <div
            className="hospital-info-pills"
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
              fontSize: '13px',
              background: '#ffffff',
              padding: '12px 16px',
              borderRadius: '12px',
              border: '1px solid var(--border-subtle)',
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '7px', color: 'var(--primary-teal-dark)' }}>
              <MapPin size={16} style={{ color: 'var(--primary-teal)', flexShrink: 0 }} />
              <span><strong>{HOSPITAL_INFO.address}</strong></span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '7px', color: 'var(--primary-orange)' }}>
              <Phone size={16} style={{ flexShrink: 0 }} />
              <span>Hotline liên hệ / Đặt hẹn: <strong>{HOSPITAL_INFO.phone}</strong></span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '7px', color: 'var(--text-muted)' }}>
              <Clock size={16} style={{ flexShrink: 0 }} />
              <span>Giờ mở cửa: <strong>{HOSPITAL_INFO.hours}</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. BỐ CỤC 2 CỘT: FORM ĐẶT LỊCH (TRÁI) & LỊCH HẸN CỦA BẠN (PHẢI) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.15fr 1fr', gap: '24px', alignItems: 'start' }}>
        
        {/* CỘT TRÁI: FORM ĐĂNG KÝ (KHÁCH TỰ ĐIỀN) */}
        <div className="card booking-form-card" style={{ padding: '24px', borderRadius: 'var(--radius-lg)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px', paddingBottom: '12px', borderBottom: '1px solid var(--border-subtle)' }}>
            <CalendarCheck size={20} style={{ color: 'var(--primary-teal)' }} />
            <div>
              <h3 style={{ fontSize: '17px', fontWeight: '700', margin: 0 }}>Phiếu Đăng Ký Khám Tại Bệnh Viện</h3>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Vui lòng điền thông tin bên dưới để đặt khung giờ khám</span>
            </div>
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
            {/* THÔNG TIN BÉ CƯNG */}
            <div className="mb-3">
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px', color: 'var(--text-main)' }}>
                Bé cưng cần khám *
              </label>

              {pets.length > 0 ? (
                <div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <select
                      className="clean-input-pill"
                      value={selectedPetId}
                      onChange={(e) => setSelectedPetId(e.target.value)}
                      style={{ flex: 1, padding: '10px 14px', borderRadius: 'var(--radius-md)' }}
                    >
                      {pets.map((p) => (
                        <option key={p.id} value={p.id}>
                          🐾 {p.name} ({p.species || 'Thú cưng'})
                        </option>
                      ))}
                      <option value="custom">+ Tự nhập tên bé cưng khác...</option>
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

                  {selectedPetId === 'custom' && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '8px', marginTop: '8px' }}>
                      <input
                        type="text"
                        className="clean-input-pill"
                        placeholder="Nhập tên bé cưng..."
                        value={customPetName}
                        onChange={(e) => setCustomPetName(e.target.value)}
                        style={{ padding: '10px 14px', borderRadius: 'var(--radius-md)' }}
                        required
                      />
                      <select
                        className="clean-input-pill"
                        value={customPetSpecies}
                        onChange={(e) => setCustomPetSpecies(e.target.value)}
                        style={{ padding: '10px 12px', borderRadius: 'var(--radius-md)' }}
                      >
                        <option value="Chó 🐶">Chó 🐶</option>
                        <option value="Mèo 🐱">Mèo 🐱</option>
                        <option value="Thú cưng khác 🐾">Khác 🐾</option>
                      </select>
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '8px' }}>
                  <input
                    type="text"
                    className="clean-input-pill"
                    placeholder="Nhập tên bé cưng (ví dụ: Mochi, LuLu...)"
                    value={customPetName}
                    onChange={(e) => setCustomPetName(e.target.value)}
                    style={{ padding: '10px 14px', borderRadius: 'var(--radius-md)' }}
                    required
                  />
                  <select
                    className="clean-input-pill"
                    value={customPetSpecies}
                    onChange={(e) => setCustomPetSpecies(e.target.value)}
                    style={{ padding: '10px 12px', borderRadius: 'var(--radius-md)' }}
                  >
                    <option value="Chó 🐶">Chó 🐶</option>
                    <option value="Mèo 🐱">Mèo 🐱</option>
                    <option value="Thú cưng khác 🐾">Khác 🐾</option>
                  </select>
                </div>
              )}
            </div>

            {/* SỐ ĐIỆN THOẠI & NGÀY KHÁM (CHỈ ĐẶT HÔM NAY VÀ TƯƠNG LAI) */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px', color: 'var(--text-main)' }}>
                  Ngày hẹn khám (Từ hôm nay) *
                </label>
                <input
                  type="date"
                  min={todayStr}
                  className="clean-input-pill"
                  value={appointmentDate}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val && val < todayStr) {
                      setFeedbackMsg({
                        type: 'error',
                        text: `⚠️ Không thể chọn ngày trong quá khứ! Vui lòng chọn từ hôm nay (${todayStr}) trở đi.`
                      });
                      return;
                    }
                    setAppointmentDate(val);
                  }}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)' }}
                  required
                />
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px', display: 'block' }}>
                  Được chọn ngày hiện tại hoặc các ngày tới
                </span>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px', color: 'var(--text-main)' }}>
                  Số điện thoại người đưa khám *
                </label>
                <input
                  type="tel"
                  className="clean-input-pill"
                  placeholder="Nhập SĐT (10 số)..."
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)' }}
                  required
                />
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px', display: 'block' }}>
                  Để Bác sĩ gọi điện xác nhận & tư vấn
                </span>
              </div>
            </div>

            {/* 4 MỐC KHUNG GIỜ KHÁM & GIỚI HẠN 12 NGƯỜI */}
            <div className="mb-3">
              <div className="flex-between mb-2">
                <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-main)', margin: 0 }}>
                  Khung giờ khám bệnh viện (4 mốc chuẩn, tối đa 12 người/khung) *
                </label>
                {loadingSlots && (
                  <span style={{ fontSize: '11.5px', color: 'var(--primary-teal)' }}>
                    Đang kiểm tra chỗ trống...
                  </span>
                )}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                {TIME_SLOTS.map((slot) => {
                  const info = slotAvailability[slot];
                  const booked = info?.booked ?? 0;
                  const available = info?.available ?? MAX_SLOT_CAPACITY;
                  const isFull = info?.is_full ?? (booked >= MAX_SLOT_CAPACITY);
                  const isSelected = appointmentTime === slot;

                  return (
                    <button
                      key={slot}
                      type="button"
                      disabled={isFull}
                      onClick={() => setAppointmentTime(slot)}
                      style={{
                        padding: '10px 12px',
                        textAlign: 'left',
                        borderRadius: '10px',
                        border: isSelected ? '2px solid var(--primary-teal)' : '1px solid var(--border-subtle)',
                        background: isFull
                          ? '#f3f4f6'
                          : isSelected
                          ? 'var(--primary-teal-light)'
                          : 'var(--bg-subtle)',
                        color: isFull
                          ? '#9ca3af'
                          : isSelected
                          ? 'var(--primary-teal-dark)'
                          : 'var(--text-body)',
                        cursor: isFull ? 'not-allowed' : 'pointer',
                        opacity: isFull ? 0.65 : 1,
                        transition: 'all 0.15s ease',
                        position: 'relative'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <span style={{ fontWeight: '700', fontSize: '13.5px' }}>
                          ⏰ {slot}
                        </span>
                        {isSelected && !isFull && (
                          <span style={{ color: 'var(--primary-teal)', fontSize: '13px' }}>✓</span>
                        )}
                      </div>

                      <div style={{ fontSize: '11.5px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        {isFull ? (
                          <span style={{ color: '#dc2626', fontWeight: '700' }}>
                            ❌ Đã đủ {MAX_SLOT_CAPACITY}/{MAX_SLOT_CAPACITY} người (Kín chỗ)
                          </span>
                        ) : available <= 3 ? (
                          <span style={{ color: '#d97706', fontWeight: '600' }}>
                            ⚠️ Sắp kín: Còn {available}/{MAX_SLOT_CAPACITY} chỗ ({booked} đã đặt)
                          </span>
                        ) : (
                          <span style={{ color: 'var(--primary-teal-dark)', fontWeight: '500' }}>
                            ✅ Còn {available}/{MAX_SLOT_CAPACITY} chỗ ({booked} đã đặt)
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* DỊCH VỤ KHÁM & BÁC SĨ */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: '12px', marginBottom: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px', color: 'var(--text-main)' }}>
                  Dịch vụ khám da liễu *
                </label>
                <select
                  className="clean-input-pill"
                  value={serviceTitle}
                  onChange={(e) => setServiceTitle(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)' }}
                >
                  {SERVICES.map((s, idx) => (
                    <option key={idx} value={s.title}>
                      {s.title} ({s.price})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px', color: 'var(--text-main)' }}>
                  Bác sĩ chuyên khoa phụ trách *
                </label>
                <select
                  className="clean-input-pill"
                  value={doctorName}
                  onChange={(e) => setDoctorName(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)' }}
                >
                  <option value="BS. CKII Nguyễn Thị Mai Hương">🩺 BS. CKII Nguyễn Thị Mai Hương (Trưởng khoa)</option>
                  <option value="BS. ThS Lê Hoàng Nam">🩺 BS. ThS Lê Hoàng Nam (Chuyên gia Ký sinh trùng)</option>
                  <option value="Hội đồng Bác sĩ Da Liễu PawCare">🛡️ Hội đồng Bác sĩ Da Liễu Bệnh viện</option>
                </select>
              </div>
            </div>

            {/* 5. TÍCH HỢP CHẨN ĐOÁN AI & BẤM THÊM CHI TIẾT BỆNH */}
            <div
              className="ai-diagnosis-link-box mb-3"
              style={{
                background: 'linear-gradient(135deg, rgba(42, 157, 143, 0.08) 0%, rgba(217, 119, 6, 0.06) 100%)',
                border: '1.5px solid var(--primary-teal-border)',
                borderRadius: '12px',
                padding: '14px 16px'
              }}
            >
              <div className="flex-between flex-wrap gap-2 mb-2">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Sparkles size={16} style={{ color: 'var(--primary-teal)' }} />
                  <strong style={{ fontSize: '13.5px', color: 'var(--text-main)' }}>
                    Lấy mô tả từ kết quả Chẩn đoán AI
                  </strong>
                </div>

                {selectedAiScan && (
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '600', color: 'var(--primary-teal-dark)' }}>
                    <input
                      type="checkbox"
                      checked={attachAiDiagnosis}
                      onChange={(e) => handleToggleAiDiagnosis(e.target.checked)}
                      style={{ width: '16px', height: '16px', accentColor: 'var(--primary-teal)' }}
                    />
                    <span>Tích vào để lấy mô tả AI</span>
                  </label>
                )}
              </div>

              {selectedAiScan ? (
                <div style={{ fontSize: '12.5px', color: 'var(--text-body)', lineHeight: '1.5', background: '#ffffff', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                  <div>
                    🎯 Bệnh AI nhận diện:{' '}
                    <strong style={{ color: 'var(--primary-orange-dark)' }}>
                      {selectedAiScan.disease_name_vi || selectedAiScan.diseaseName || selectedAiScan.disease_key}
                    </strong>
                    {selectedAiScan.confidence && (
                      <span style={{ color: 'var(--text-muted)' }}> ({Math.round(selectedAiScan.confidence)}% tin cậy)</span>
                    )}
                  </div>
                  {selectedAiScan.clinical_symptoms && selectedAiScan.clinical_symptoms.length > 0 && (
                    <div style={{ color: 'var(--text-muted)', fontSize: '11.5px', marginTop: '2px' }}>
                      Triệu chứng quét được: {selectedAiScan.clinical_symptoms.slice(0, 3).join(', ')}
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  Chưa có lần quét AI nào gần đây. Bạn có thể tự điền hoặc bấm các gợi ý bên dưới để thêm chi tiết.
                </div>
              )}

              {/* BẤM THÊM CHI TIẾT BỆNH VÀO MÔ TẢ */}
              <div style={{ marginTop: '12px', paddingTop: '10px', borderTop: '1px dashed var(--border-subtle)' }}>
                <span style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '8px' }}>
                  👇 Bấm thêm để ghi thêm chi tiết của bệnh cho Bác sĩ chẩn đoán rõ hơn:
                </span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {CLINICAL_DETAIL_TAGS.map((tag, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleAddClinicalDetail(tag)}
                      className="btn-filter-pill"
                      style={{
                        fontSize: '11.5px',
                        padding: '4px 9px',
                        borderRadius: '20px',
                        background: notes.includes(tag) ? 'var(--primary-teal-light)' : '#ffffff',
                        color: notes.includes(tag) ? 'var(--primary-teal-dark)' : 'var(--text-body)',
                        border: notes.includes(tag) ? '1px solid var(--primary-teal)' : '1px solid var(--border-subtle)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <span>+</span> {tag}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Ô NHẬP MÔ TẢ & GHI CHÚ TỔNG HỢP */}
            <div className="mb-4">
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px', color: 'var(--text-main)' }}>
                Nội dung mô tả & Ghi chú gửi Bác sĩ khám sơ bộ
              </label>
              <textarea
                rows={3}
                className="clean-input-pill"
                placeholder="Mô tả thêm tình trạng bé cưng (vị trí tổn thương, thời gian phát hiện, thuốc đã dùng...)"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                style={{ width: '100%', padding: '12px 14px', borderRadius: 'var(--radius-md)', resize: 'vertical' }}
              />
            </div>

            <button
              type="submit"
              id="btn-confirm-booking"
              className="btn-primary-gradient"
              disabled={submitting || (slotAvailability[appointmentTime]?.is_full)}
              style={{
                width: '100%',
                padding: '13px 20px',
                fontSize: '15px',
                fontWeight: '700',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '8px',
                cursor: (slotAvailability[appointmentTime]?.is_full) ? 'not-allowed' : 'pointer'
              }}
            >
              <CalendarCheck size={18} />
              <span>{submitting ? 'Đang gửi yêu cầu đặt lịch...' : 'Xác Nhận Đặt Lịch Khám'}</span>
            </button>
          </form>
        </div>

        {/* CỘT PHẢI: LỊCH HẸN THỰC TẾ CỦA KHÁCH & KẾT QUẢ KHÁM SƠ BỘ TỪ BÁC SĨ */}
        <div className="appointments-list-column">
          <div className="flex-between mb-3">
            <h3 style={{ fontSize: '17px', fontWeight: '700', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>📋</span> Lịch Hẹn Khám Của Bạn ({appointments.length})
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
              <div style={{ fontSize: '38px', marginBottom: '8px' }}>🐾🗓️</div>
              <h4 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '4px' }}>Chưa có lịch hẹn nào</h4>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0, lineHeight: '1.5' }}>
                Bạn chưa đặt lịch hẹn khám nào. Hãy điền phiếu bên trái để đặt khám trực tiếp tại Bệnh viện Thú Y PawDerm ({HOSPITAL_INFO.address}).
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

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '12.5px', color: 'var(--text-muted)', marginBottom: '10px' }}>
                    <div>📅 Ngày khám: <strong style={{ color: 'var(--text-main)' }}>{apt.appointment_date}</strong></div>
                    <div>⏰ Khung giờ: <strong style={{ color: 'var(--text-main)' }}>{apt.appointment_time}</strong></div>
                    <div style={{ gridColumn: 'span 2' }}>
                      📍 Địa điểm: <span>{apt.hospital_address || HOSPITAL_INFO.address}</span>
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
                      <strong>Mô tả của bạn:</strong> {apt.notes}
                    </div>
                  )}

                  {/* KẾT QUẢ KHÁM SƠ BỘ CỦA BÁC SĨ (KHI BÁC SĨ ĐÃ TIẾP NHẬN) */}
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
                        <span>KẾT QUẢ KHÁM SƠ BỘ & DỰ ĐOÁN TỪ BÁC SĨ</span>
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
                      <span>Bác sĩ đang tiếp nhận phiếu hẹn và sẽ gửi kết quả khám sơ bộ cho bạn...</span>
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
