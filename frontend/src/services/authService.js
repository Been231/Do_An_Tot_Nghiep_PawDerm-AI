/**
 * PawDerm AI - Dịch vụ Xác thực & Quản lý Tài khoản cá nhân
 *
 * Bảo mật:
 *  - Mật khẩu chỉ được gửi tới Backend (FastAPI) để so khớp bằng bcrypt.
 *  - KHÔNG truy vấn trực tiếp cột password trên Supabase từ trình duyệt.
 *  - Đăng ký bắt buộc xác thực Gmail thật bằng mã OTP.
 */
import { API_BASE_URL, supabase } from './apiConfig';

/** Gọi API JSON, ném lỗi với thông điệp tiếng Việt từ backend (detail). */
async function postJson(path, body) {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  let data = {};
  try {
    data = await res.json();
  } catch {
    /* response không phải JSON */
  }
  if (!res.ok) {
    const err = new Error(data.detail || 'Có lỗi xảy ra, vui lòng thử lại!');
    err.status = res.status;
    throw err;
  }
  return data;
}

const isNetworkError = (err) => err instanceof TypeError && !err.status;

// Tài khoản mẫu CHỈ dùng khi Backend hoàn toàn offline (phục vụ demo đồ án)
const OFFLINE_DEMO_USERS = {
  admin: {
    id: 'admin-uuid-001',
    username: 'admin',
    full_name: 'Quản trị viên Hệ thống PawDerm',
    role: 'admin',
    status: 'active'
  },
  bacsi: {
    id: 'bacsi-uuid-001',
    username: 'bacsi',
    full_name: 'BS. CKII Nguyễn Thị Mai Hương',
    role: 'doctor',
    status: 'active',
    specialty: 'Chuyên khoa Da liễu & Ký sinh trùng thú nhỏ',
    clinic_name: 'Bệnh viện Thú Y PawCare TP. Hồ Chí Minh'
  },
  khachhang: {
    id: '8cb7a542-d6aa-46ba-bca4-d4bcf84ec13c',
    username: 'khachhang',
    full_name: 'Nguyễn Văn Khách',
    role: 'customer',
    status: 'active'
  }
};

export const authService = {
  /**
   * Đăng nhập bằng Tên đăng nhập hoặc Gmail
   */
  async login(username, password) {
    try {
      return await postJson('/auth/login', { username, password });
    } catch (err) {
      if (!isNetworkError(err)) throw err;
      console.warn('Backend API offline, dùng tài khoản demo offline:', err.message);
    }

    if (password === '123' && OFFLINE_DEMO_USERS[username]) {
      return { success: true, user: OFFLINE_DEMO_USERS[username], offline: true };
    }
    throw new Error('Không kết nối được máy chủ. Vui lòng kiểm tra Backend đang chạy!');
  },

  /**
   * Bước 1 đăng ký: gửi mã OTP 6 số tới Gmail
   */
  async sendEmailOtp(email) {
    try {
      return await postJson('/auth/send-otp', { email });
    } catch (err) {
      if (isNetworkError(err)) throw new Error('Không kết nối được máy chủ để gửi mã xác thực!');
      throw err;
    }
  },

  /**
   * Bước 2 đăng ký: xác minh mã OTP -> nhận verification_token
   */
  async verifyEmailOtp(email, code) {
    try {
      return await postJson('/auth/verify-otp', { email, code });
    } catch (err) {
      if (isNetworkError(err)) throw new Error('Không kết nối được máy chủ để xác minh mã!');
      throw err;
    }
  },

  /**
   * Bước 3: Đăng ký tài khoản Chủ nuôi (bắt buộc có verification_token của Gmail)
   */
  async register(userData) {
    try {
      return await postJson('/auth/register', userData);
    } catch (err) {
      if (isNetworkError(err)) throw new Error('Không kết nối được máy chủ. Vui lòng thử lại sau!');
      throw err;
    }
  },

  /**
   * Cập nhật thông tin cá nhân hoặc phòng khám Bác sĩ
   */
  async updateProfile(userId, updates) {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, updates })
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn(e);
    }
    // Fallback: chỉ cập nhật các trường hồ sơ không nhạy cảm
    // eslint-disable-next-line no-unused-vars
    const { password, role, status, ...safeUpdates } = updates || {};
    await supabase.from('users').update(safeUpdates).eq('id', userId);
    return { success: true };
  },

  /**
   * Cập nhật hồ sơ cá nhân (họ tên, SĐT, địa chỉ) — trả về user mới nhất từ backend.
   * Ném lỗi tiếng Việt nếu dữ liệu không hợp lệ.
   */
  async updateMyProfile(userId, updates) {
    const res = await fetch(`${API_BASE_URL}/auth/profile`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId, updates })
    }).catch(() => {
      throw new Error('Không kết nối được máy chủ. Vui lòng thử lại sau!');
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.detail || 'Không cập nhật được hồ sơ!');
    return data;
  },

  /**
   * Đổi mật khẩu — bắt buộc nhập đúng mật khẩu hiện tại
   */
  async changePassword(userId, oldPassword, newPassword) {
    try {
      return await postJson('/auth/change-password', {
        user_id: userId,
        old_password: oldPassword,
        new_password: newPassword
      });
    } catch (err) {
      if (isNetworkError(err)) throw new Error('Không kết nối được máy chủ. Vui lòng thử lại sau!');
      throw err;
    }
  }
};
