/**
 * PawDerm AI - Dịch vụ Thông báo (polling định kỳ)
 */
import { API_BASE_URL } from './apiConfig';

export const notificationService = {
  async getNotifications(userId, role = 'customer') {
    if (!userId) return [];
    try {
      const params = new URLSearchParams({ user_id: userId, role });
      const res = await fetch(`${API_BASE_URL}/notifications?${params}`);
      if (!res.ok) return [];
      const data = await res.json();
      return data.notifications || [];
    } catch {
      return [];
    }
  }
};
