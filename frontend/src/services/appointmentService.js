/**
 * PawDerm AI - Dịch vụ Đặt Lịch Khám Bệnh & Khám Sơ Bộ Bác Sĩ
 */
import { API_BASE_URL } from './apiConfig';

export const appointmentService = {
  /**
   * Khách hàng lấy danh sách lịch hẹn của mình
   */
  async getMyAppointments(userId) {
    const url = userId 
      ? `${API_BASE_URL}/appointments/my?user_id=${encodeURIComponent(userId)}`
      : `${API_BASE_URL}/appointments/my`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Không thể tải danh sách lịch hẹn');
    const data = await res.json();
    return data.appointments || [];
  },

  /**
   * Bác sĩ lấy toàn bộ lịch hẹn để khám sơ bộ
   */
  async getDoctorAppointments() {
    const res = await fetch(`${API_BASE_URL}/appointments/doctor`);
    if (!res.ok) throw new Error('Không thể tải danh sách lịch hẹn bác sĩ');
    const data = await res.json();
    return data.appointments || [];
  },

  /**
   * Kiểm tra tình trạng chỗ trống 4 khung giờ khám theo ngày
   */
  async getSlotAvailability(date) {
    const url = date 
      ? `${API_BASE_URL}/appointments/slot-availability?date=${encodeURIComponent(date)}`
      : `${API_BASE_URL}/appointments/slot-availability`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Không thể kiểm tra tình trạng chỗ trống khung giờ');
    return await res.json();
  },

  /**
   * Khách hàng tạo lịch hẹn mới tại Bệnh viện PawDerm
   */
  async createAppointment(appointmentData) {
    const res = await fetch(`${API_BASE_URL}/appointments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(appointmentData)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Lỗi khi đặt lịch khám');
    }
    return await res.json();
  },

  /**
   * Bác sĩ thực hiện khám sơ bộ & dự đoán bệnh
   */
  async submitPreDiagnosis(appointmentId, preDiagData) {
    const res = await fetch(`${API_BASE_URL}/appointments/${appointmentId}/pre-diagnose`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(preDiagData)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Lỗi khi lưu kết quả khám sơ bộ');
    }
    return await res.json();
  },

  /**
   * Cập nhật trạng thái lịch hẹn (confirmed | completed | cancelled)
   */
  async updateStatus(appointmentId, status) {
    const res = await fetch(`${API_BASE_URL}/appointments/${appointmentId}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Lỗi khi cập nhật trạng thái');
    }
    return await res.json();
  }
};
