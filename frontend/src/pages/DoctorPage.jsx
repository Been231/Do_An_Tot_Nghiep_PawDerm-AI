import React, { useState, useEffect } from 'react';
import { ShieldAlert } from 'lucide-react';
import { doctorService } from '../services/doctorService';
import { authService } from '../services/authService';

import DoctorHeader from '../components/doctor/DoctorHeader';
import DoctorReviewQueue from '../components/doctor/DoctorReviewQueue';
import DoctorCaseDetail, { COMMON_DISEASES_OPTIONS } from '../components/doctor/DoctorCaseDetail';
import DoctorProfileModal from '../components/doctor/DoctorProfileModal';

export default function DoctorPage({ currentUser, onProfileUpdated }) {
  const [queue, setQueue] = useState([]);
  const [stats, setStats] = useState({ total_reviewed: 0, agreed_count: 0, corrected_count: 0, agreement_rate: 100 });
  const [loading, setLoading] = useState(false);
  const [selectedCase, setSelectedCase] = useState(null);

  // Form sửa lại kết quả (Re-labeling)
  const [isEditing, setIsEditing] = useState(false);
  const [correctedDisease, setCorrectedDisease] = useState(COMMON_DISEASES_OPTIONS[0]);
  const [doctorNotes, setDoctorNotes] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  // Form cập nhật hồ sơ bác sĩ
  const [showProfileEdit, setShowProfileEdit] = useState(false);
  const [clinicName, setClinicName] = useState(currentUser?.clinic_name || 'Bệnh viện Thú Y PawCare TP.HCM');
  const [specialty, setSpecialty] = useState(currentUser?.specialty || 'Chuyên khoa Da liễu & Ký sinh trùng thú nhỏ');
  const [updatingProfile, setUpdatingProfile] = useState(false);

  useEffect(() => {
    loadQueue();
    loadStats();
  }, []);

  const loadQueue = async () => {
    setLoading(true);
    try {
      const data = await doctorService.getDoctorQueue();
      setQueue(data || []);
      if (data && data.length > 0 && !selectedCase) {
        setSelectedCase(data[0]);
      }
    } catch (e) {
      console.warn('Lỗi tải hàng đợi bác sĩ:', e);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const s = await doctorService.getDoctorStats(currentUser?.id);
      setStats(s);
    } catch (e) {
      console.warn(e);
    }
  };

  const handleAgreeWithAI = async () => {
    if (!selectedCase) return;
    setSubmittingReview(true);
    try {
      await doctorService.submitDoctorReview({
        record_id: selectedCase.id,
        doctor_id: currentUser?.id,
        doctor_name: currentUser?.full_name || 'BS. Thú Y',
        review_status: 'agreed',
        corrected_disease: '',
        notes: 'Bác sĩ đã kiểm tra ảnh và đồng ý với nhận định của mô hình AI.'
      });
      alert('✅ Đã xác nhận đồng ý với chẩn đoán của AI!');
      selectedCase.review_status = 'agreed';
      selectedCase.doctor_notes = 'Đã xác nhận chính xác.';
      loadStats();
      loadQueue();
    } catch (e) {
      alert('Lỗi: ' + e.message);
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleSaveCorrection = async (e) => {
    e.preventDefault();
    if (!selectedCase) return;
    setSubmittingReview(true);
    try {
      await doctorService.submitDoctorReview({
        record_id: selectedCase.id,
        doctor_id: currentUser?.id,
        doctor_name: currentUser?.full_name || 'BS. Thú Y',
        review_status: 'corrected',
        corrected_disease: correctedDisease,
        notes: doctorNotes
      });
      alert(`✏️ Đã dán nhãn lại thành công: "${correctedDisease}". Dữ liệu này đã được lưu để phục vụ Retrain AI sau này!`);
      selectedCase.review_status = 'corrected';
      selectedCase.doctor_corrected_disease = correctedDisease;
      selectedCase.doctor_notes = doctorNotes;
      setIsEditing(false);
      setDoctorNotes('');
      loadStats();
      loadQueue();
    } catch (e) {
      alert('Lỗi: ' + e.message);
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleUpdateDoctorProfile = async (e) => {
    e.preventDefault();
    setUpdatingProfile(true);
    try {
      await authService.updateProfile(currentUser?.id, {
        clinic_name: clinicName,
        specialty: specialty
      });
      alert('Cập nhật hồ sơ chuyên môn Bác sĩ thành công!');
      setShowProfileEdit(false);
      if (onProfileUpdated) {
        onProfileUpdated({ ...currentUser, clinic_name: clinicName, specialty });
      }
    } catch (e) {
      alert('Lỗi cập nhật: ' + e.message);
    } finally {
      setUpdatingProfile(false);
    }
  };

  return (
    <div className="portal-container doctor-portal">
      {/* BANNER THÔNG TIN BÁC SĨ CHUYÊN GIA */}
      <DoctorHeader
        currentUser={currentUser}
        clinicName={clinicName}
        specialty={specialty}
        stats={stats}
        onOpenProfileEdit={() => setShowProfileEdit(true)}
      />

      {/* THÔNG BÁO BẢO MẬT DỮ LIỆU */}
      <div className="privacy-banner-strip mb-4">
        <ShieldAlert size={18} className="text-warning mr-2" />
        <span>
          <strong>BẢO MẬT Y TẾ THÚ Y:</strong> Toàn bộ thông tin cá nhân của khách hàng (họ tên, SĐT, địa chỉ) 
          đã được hệ thống tự động mã hóa & ẩn danh nhằm tuân thủ quy tắc riêng tư. Bác sĩ chỉ xem đặc điểm lâm sàng của ca bệnh.
        </span>
      </div>

      {/* KHUNG THẨM ĐỊNH CA BỆNH */}
      <div className="doctor-review-layout">
        {/* CỘT TRÁI: HÀNG ĐỢI CA BỆNH */}
        <DoctorReviewQueue
          queue={queue}
          loading={loading}
          selectedCase={selectedCase}
          onSelectCase={(item) => {
            setSelectedCase(item);
            setIsEditing(false);
          }}
          onRefresh={loadQueue}
        />

        {/* CỘT PHẢI: CHI TIẾT CA BỆNH & FORM THẨM ĐỊNH (RE-LABELING) */}
        <DoctorCaseDetail
          selectedCase={selectedCase}
          currentUser={currentUser}
          isEditing={isEditing}
          setIsEditing={setIsEditing}
          correctedDisease={correctedDisease}
          setCorrectedDisease={setCorrectedDisease}
          doctorNotes={doctorNotes}
          setDoctorNotes={setDoctorNotes}
          submittingReview={submittingReview}
          handleAgreeWithAI={handleAgreeWithAI}
          handleSaveCorrection={handleSaveCorrection}
        />
      </div>

      {/* MODAL CẬP NHẬT HỒ SƠ BÁC SĨ */}
      <DoctorProfileModal
        show={showProfileEdit}
        onClose={() => setShowProfileEdit(false)}
        onSubmit={handleUpdateDoctorProfile}
        clinicName={clinicName}
        setClinicName={setClinicName}
        specialty={specialty}
        setSpecialty={setSpecialty}
        updatingProfile={updatingProfile}
      />
    </div>
  );
}
