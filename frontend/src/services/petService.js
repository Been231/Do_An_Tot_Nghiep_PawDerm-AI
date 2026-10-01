/**
 * PawDerm AI - Dịch vụ Quản lý Hồ sơ Thú cưng (Pet Service)
 */
import { API_BASE_URL, supabase } from './apiConfig';

export const petService = {
  /**
   * Lấy danh sách thú cưng của khách hàng
   */
  async getPets(userId) {
    try {
      const res = await fetch(`${API_BASE_URL}/pets?user_id=${userId}`);
      if (res.ok) {
        const data = await res.json();
        return data.pets || [];
      }
    } catch (err) {
      console.warn('Pets API offline, fallback:', err);
    }

    const { data } = await supabase
      .from('pets')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    return data || [];
  },

  /**
   * Tạo hồ sơ thú cưng mới
   */
  async createPet(userId, pet) {
    try {
      const res = await fetch(`${API_BASE_URL}/pets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, pet })
      });
      if (res.ok) return await res.json();
    } catch (err) {
      console.warn('Create pet API offline, fallback:', err);
    }

    const { data, error } = await supabase
      .from('pets')
      .insert([{ ...pet, user_id: userId }])
      .select();
    if (error) throw error;
    return { success: true, pet: data[0] };
  },

  /**
   * Xóa hồ sơ thú cưng
   */
  async deletePet(petId) {
    try {
      const res = await fetch(`${API_BASE_URL}/pets/${petId}`, { method: 'DELETE' });
      if (res.ok) return await res.json();
    } catch (err) {
      console.warn(err);
    }
    await supabase.from('pets').delete().eq('id', petId);
    return { success: true };
  }
};
