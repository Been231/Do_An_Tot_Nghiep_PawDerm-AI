/**
 * PawDerm AI - Dịch vụ Chẩn đoán AI & Theo dõi Diễn tiến Bệnh (Diagnosis Service)
 */
import { API_BASE_URL, supabase } from './apiConfig';

export const diagnosisService = {
  /**
   * Gửi ảnh và triệu chứng lâm sàng đến FastAPI Backend để AI suy luận
   */
  async runDiagnosis(formData) {
    const res = await fetch(`${API_BASE_URL}/diagnose`, {
      method: 'POST',
      body: formData
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Lỗi chẩn đoán AI' }));
      throw new Error(err.detail || 'Lỗi khi gửi ảnh phân tích AI!');
    }
    return await res.json();
  },

  /**
   * Lấy danh sách lịch sử chẩn đoán hoặc theo dõi tiến triển qua các mốc ngày
   */
  async getHistory(userId, petId = null) {
    try {
      let url = `${API_BASE_URL}/history?`;
      if (userId) url += `user_id=${userId}&`;
      if (petId) url += `pet_id=${petId}&`;
      const res = await fetch(url);
      if (res.ok) {
        const d = await res.json();
        return d.records || [];
      }
    } catch (err) {
      console.warn('History API offline, fallback:', err);
    }

    let query = supabase
      .from('diagnosis_records')
      .select('*, pets(name, species, breed, avatar)')
      .order('created_at', { ascending: false });

    if (userId) query = query.eq('user_id', userId);
    if (petId) query = query.eq('pet_id', petId);
    const { data } = await query;
    return data || [];
  }
};
