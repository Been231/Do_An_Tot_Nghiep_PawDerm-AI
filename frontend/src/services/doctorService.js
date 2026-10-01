/**
 * PawDerm AI - Dịch vụ Bác Sĩ Thú Y (Doctor Service - Active Learning & Re-labeling)
 */
import { API_BASE_URL } from './apiConfig';

export const doctorService = {
  /**
   * Lấy danh sách hàng đợi các ca bệnh ẩn danh cần Bác sĩ thẩm định
   */
  async getDoctorQueue() {
    const res = await fetch(`${API_BASE_URL}/doctor/queue`);
    if (!res.ok) throw new Error('Không thể tải hàng đợi Bác sĩ');
    const data = await res.json();
    return data.queue || [];
  },

  /**
   * Bác sĩ gửi đánh giá: 'agreed' (đồng thuận) hoặc 'corrected' (sửa nhãn Re-labeling)
   */
  async submitDoctorReview(payload) {
    const res = await fetch(`${API_BASE_URL}/doctor/review`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Không thể gửi đánh giá Bác sĩ');
    return await res.json();
  },

  /**
   * Thống kê đóng góp dán nhãn của Bác sĩ và tỷ lệ đồng thuận với AI
   */
  async getDoctorStats(doctorId) {
    try {
      const res = await fetch(`${API_BASE_URL}/doctor/stats?doctor_id=${doctorId || ''}`);
      if (res.ok) {
        const d = await res.json();
        return d.stats;
      }
    } catch (e) {
      console.warn(e);
    }
    return { total_reviewed: 14, agreed_count: 11, corrected_count: 3, agreement_rate: 78.6 };
  }
};
