/**
 * PawDerm AI - Dịch vụ Quản trị Hệ thống (Admin Service)
 * Quản lý người dùng, từ điển bệnh học, dataset active learning & dashboard
 */
import { API_BASE_URL } from './apiConfig';

export const adminService = {
  /**
   * Lấy danh sách người dùng (khách hàng, bác sĩ)
   */
  async getAdminUsers() {
    const res = await fetch(`${API_BASE_URL}/admin/users`);
    if (!res.ok) throw new Error('Không thể tải danh sách người dùng');
    const data = await res.json();
    return data.users || [];
  },

  /**
   * Khóa/mở khóa hoặc phê duyệt trạng thái tài khoản
   */
  async setUserStatus(userId, status) {
    const res = await fetch(`${API_BASE_URL}/admin/users/${userId}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    return await res.json();
  },

  /**
   * Lấy toàn bộ từ điển bệnh học ngoài da
   */
  async getDiseaseDictionary() {
    const res = await fetch(`${API_BASE_URL}/admin/diseases`);
    if (!res.ok) throw new Error('Không thể tải từ điển bệnh');
    const data = await res.json();
    return data.diseases || [];
  },

  /**
   * Thêm hoặc sửa một bệnh trong từ điển (CRUD)
   */
  async saveDisease(disease) {
    const res = await fetch(`${API_BASE_URL}/admin/diseases`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(disease)
    });
    return await res.json();
  },

  /**
   * Xóa một bệnh khỏi từ điển bệnh học
   */
  async deleteDisease(key) {
    const res = await fetch(`${API_BASE_URL}/admin/diseases/${key}`, {
      method: 'DELETE'
    });
    return await res.json();
  },

  /**
   * Quản lý tập dữ liệu hình ảnh người dùng (chỉ lọc ca bác sĩ sửa nếu onlyCorrected = true)
   */
  async getAdminDataset(onlyCorrected = false) {
    const res = await fetch(`${API_BASE_URL}/admin/dataset?only_corrected=${onlyCorrected}`);
    if (!res.ok) throw new Error('Không thể tải tập dữ liệu');
    const data = await res.json();
    return data.dataset || [];
  },

  /**
   * Xuất tập dữ liệu Retrain kèm nhãn chuẩn Bác sĩ thành file JSON Manifest
   */
  async exportDataset() {
    const res = await fetch(`${API_BASE_URL}/admin/dataset/export`);
    if (!res.ok) throw new Error('Lỗi xuất tập dữ liệu');
    return await res.json();
  },

  /**
   * Lấy số liệu thống kê tổng thể cho Dashboard Admin
   */
  async getDashboardMetrics() {
    const res = await fetch(`${API_BASE_URL}/admin/dashboard`);
    if (!res.ok) throw new Error('Lỗi tải số liệu thống kê');
    const data = await res.json();
    return data.metrics;
  },

  /**
   * Lấy trạng thái quy trình Active Learning & Auto-Retrain
   */
  async getRetrainStatus() {
    const res = await fetch(`${API_BASE_URL}/admin/retrain/status`);
    if (!res.ok) throw new Error('Không thể lấy trạng thái retrain');
    const data = await res.json();
    return data.status;
  },

  /**
   * Kích hoạt tiến trình Active Learning Huấn luyện lại mô hình
   */
  async triggerRetrain(triggeredBy = 'Admin Quản trị viên') {
    const res = await fetch(`${API_BASE_URL}/admin/retrain/trigger`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ triggered_by: triggeredBy })
    });
    return await res.json();
  },

  /**
   * Lấy lịch sử các phiên bản mô hình đã Retrain
   */
  async getRetrainHistory() {
    const res = await fetch(`${API_BASE_URL}/admin/retrain/history`);
    if (!res.ok) throw new Error('Không thể lấy lịch sử retrain');
    const data = await res.json();
    return data.history || [];
  }
};
