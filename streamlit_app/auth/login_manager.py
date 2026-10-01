"""
Module Quản lý Đăng nhập và Phiên làm việc (Login Manager)
Chịu trách nhiệm: Xác thực tài khoản, lưu trữ phiên (session), đăng xuất, form đăng nhập và khung chuyển cảnh gợi ý đăng ký.
"""

import time
from typing import Optional, Dict, Any
import streamlit as st
from backend.app.database.supabase_client import get_client


class LoginManager:
    """Quản lý xác thực đăng nhập và phiên làm việc của người dùng qua Supabase."""

    @staticmethod
    def init_session_state() -> None:
        """Khởi tạo session state xác thực nếu chưa tồn tại."""
        if "logged_in_user" not in st.session_state:
            st.session_state.logged_in_user = None
        if "auth_mode" not in st.session_state:
            st.session_state.auth_mode = "signin"

    @staticmethod
    def get_current_user() -> Optional[Dict[str, Any]]:
        """Lấy thông tin tài khoản hiện tại đang đăng nhập."""
        return st.session_state.get("logged_in_user")

    @staticmethod
    def logout() -> None:
        """Thực hiện đăng xuất khỏi hệ thống."""
        st.session_state.logged_in_user = None
        st.rerun()

    @staticmethod
    def authenticate(username: str, password: str) -> Optional[Dict[str, Any]]:
        """
        Xác thực tài khoản với bảng `users` trong cơ sở dữ liệu Supabase.
        Trả về dictionary thông tin người dùng nếu hợp lệ, ngược lại trả về None.
        """
        try:
            db = get_client()
            resp = db.table("users") \
                     .select("*") \
                     .eq("username", username) \
                     .eq("password", password) \
                     .limit(1) \
                     .execute()

            if resp.data and len(resp.data) > 0:
                user_data = resp.data[0]
                return {
                    "supabase_id": user_data["id"],
                    "username": user_data["username"],
                    "full_name": user_data.get("full_name", "Khách hàng"),
                    "phone": user_data.get("phone", ""),
                    "email": user_data.get("email", f"{username}@pawderm.vn"),
                    "address": user_data.get("address", "TP. Hồ Chí Minh")
                }
        except Exception as e:
            st.error(f"Lỗi kết nối cơ sở dữ liệu khi xác thực: {e}")
        return None

    # ──────────────────────────────────────────────────────────────────────────
    # FORM ĐĂNG NHẬP (Hiển thị bên trái khi ở trạng thái signin)
    # ──────────────────────────────────────────────────────────────────────────
    @classmethod
    def render_login_section(cls) -> None:
        """Khung chứa form Đăng nhập với hiệu ứng mượt mà."""
        st.markdown(
            """
            <div class="auth-form-card auth-form-slide-left">
                <div style="text-align: center; margin-bottom: 22px;">
                    <span style="font-size: 32px;">🔑</span>
                    <h2 style="margin: 6px 0 2px 0; color: #ea580c; font-weight: 800; font-size: 26px;">Đăng Nhập</h2>
                    <p style="margin: 0; font-size: 13px; color: #78716c;">Nhập tài khoản chủ nuôi để tiếp tục theo dõi bé cưng</p>
            </div>
            """,
            unsafe_allow_html=True
        )
        cls.render_login_form()

    # Alias tương thích ngược
    render_login_card = render_login_section

    @classmethod
    def render_login_form(cls) -> None:
        """Form giao diện đăng nhập tài khoản."""
        with st.form("login_form"):
            username = st.text_input("👤 Tên đăng nhập:", value="khachhang", placeholder="Nhập tên đăng nhập...", key="login_username_input")
            password = st.text_input("🔒 Mật khẩu:", value="123", type="password", placeholder="Nhập mật khẩu...", key="login_password_input")

            btn_login = st.form_submit_button("Đăng nhập", type="primary", use_container_width=True)

            if btn_login:
                if not username or not password:
                    st.warning("⚠️ Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu!")
                    return

                user_info = cls.authenticate(username, password)
                if user_info:
                    st.session_state.logged_in_user = user_info
                    st.success(f"🎉 Đăng nhập thành công! Chào mừng {user_info['full_name']}!")
                    time.sleep(0.3)
                    st.rerun()
                else:
                    st.error("❌ Tên đăng nhập hoặc mật khẩu không chính xác!")

    # ──────────────────────────────────────────────────────────────────────────
    # OVERLAY GỢI Ý ĐĂNG KÝ (Hiển thị bên phải khi ở trạng thái signin)
    # ──────────────────────────────────────────────────────────────────────────
    @classmethod
    def render_signup_prompt(cls) -> None:
        """Khung Overlay cong bên phải chào mừng và dẫn người dùng tới form Đăng ký."""
        st.markdown(
            """
            <div class="auth-overlay-card overlay-right auth-panel-slide-right">
                <div style="font-size: 42px; margin-bottom: 12px;">🐶🐾🐱</div>
                <h2 style="margin: 0 0 10px 0; font-weight: 800; font-size: 26px; color: #ffffff !important;">Chưa có tài khoản?</h2>
                <p style="margin: 0 0 24px 0; font-size: 14px; line-height: 1.6; color: #e6fffa !important; opacity: 0.95; max-width: 320px;">
                    Đăng ký tài khoản mới để lưu trữ bệnh án, theo dõi tiến trình hồi phục và nhận phác đồ y tế cho thú cưng của bạn!
                </p>
                <div style="font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #ccfbf1; font-weight: 700; margin-bottom: 8px;">
                    Bấm nút bên dưới để chuyển sang đăng ký:
                </div>
            </div>
            """,
            unsafe_allow_html=True
        )
        if st.button("📝 ĐĂNG KÝ TÀI KHOẢN MỚI", key="btn_switch_to_signup", use_container_width=True):
            st.session_state.auth_mode = "signup"
            st.rerun()

    # ──────────────────────────────────────────────────────────────────────────
    # CẬP NHẬT HỒ SƠ CHỦ NUÔI
    # ──────────────────────────────────────────────────────────────────────────
    @staticmethod
    def render_profile_editor() -> None:
        """Hiển thị và cho phép chỉnh sửa hồ sơ cá nhân chủ nuôi — lưu vào Supabase."""
        current_user = st.session_state.get("logged_in_user")
        if not current_user:
            return

        st.markdown("### 👤 Thông tin Hồ sơ Chủ nuôi")

        with st.form("profile_form"):
            col1, col2 = st.columns(2)
            with col1:
                name = st.text_input("Họ và tên chủ nuôi:", value=current_user.get("full_name", ""))
                phone = st.text_input("Số điện thoại:", value=current_user.get("phone", ""))
            with col2:
                email = st.text_input("Email liên hệ:", value=current_user.get("email", ""))
                address = st.text_input("Địa chỉ cư trú:", value=current_user.get("address", ""))

            btn_update = st.form_submit_button("💾 Lưu thay đổi hồ sơ", type="primary")
            if btn_update:
                try:
                    db = get_client()
                    user_id = current_user.get("supabase_id")
                    db.table("users").update({
                        "full_name": name,
                        "phone": phone,
                        "email": email,
                        "address": address
                    }).eq("id", user_id).execute()

                    current_user.update({
                        "full_name": name,
                        "phone": phone,
                        "email": email,
                        "address": address
                    })
                    st.session_state.logged_in_user = current_user

                    st.success("✅ Cập nhật hồ sơ cá nhân thành công!")
                    time.sleep(0.3)
                    st.rerun()
                except Exception as e:
                    st.error(f"Lỗi khi cập nhật hồ sơ: {e}")


