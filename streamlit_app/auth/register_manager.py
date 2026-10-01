"""
Module Quản lý Đăng ký Tài khoản Mới (Register Manager)
Chịu trách nhiệm: Thu thập thông tin, kiểm tra tính hợp lệ dữ liệu, tạo tài khoản mới trong Supabase và khung gợi ý quay lại đăng nhập.
"""

from typing import Optional, Tuple
import streamlit as st
from backend.app.database.supabase_client import get_client


class RegisterManager:
    """Quản lý đăng ký tài khoản khách hàng mới vào cơ sở dữ liệu Supabase."""

    @staticmethod
    def check_username_exists(username: str) -> bool:
        """Kiểm tra tên đăng nhập đã có người đăng ký trước đó hay chưa."""
        try:
            db = get_client()
            check = db.table("users").select("id").eq("username", username).limit(1).execute()
            return bool(check.data and len(check.data) > 0)
        except Exception as e:
            st.error(f"Lỗi kiểm tra tên đăng nhập: {e}")
            return False

    @classmethod
    def register_user(
        cls,
        username: str,
        password: str,
        full_name: str,
        phone: str,
        email: Optional[str] = None,
        address: str = "Chưa cập nhật"
    ) -> Tuple[bool, str]:
        """
        Thực hiện tạo tài khoản mới trong cơ sở dữ liệu Supabase.
        Trả về tuple (thành_công: bool, thông_điệp: str).
        """
        if cls.check_username_exists(username):
            return False, "❌ Tên đăng nhập này đã tồn tại, vui lòng chọn tên khác!"

        try:
            db = get_client()
            db.table("users").insert({
                "username": username,
                "password": password,
                "full_name": full_name,
                "phone": phone,
                "email": email or f"{username}@pawderm.vn",
                "address": address
            }).execute()
            return True, "🎉 Đăng ký thành công! Hãy chuyển sang Đăng nhập để sử dụng tài khoản."
        except Exception as e:
            return False, f"Lỗi khi tạo tài khoản: {e}"

    # ──────────────────────────────────────────────────────────────────────────
    # OVERLAY GỢI Ý ĐĂNG NHẬP (Hiển thị bên trái khi ở trạng thái signup)
    # ──────────────────────────────────────────────────────────────────────────
    @classmethod
    def render_signin_prompt(cls) -> None:
        """Khung Overlay cong bên trái chào mừng trở lại và dẫn người dùng tới form Đăng nhập."""
        st.markdown(
            """
            <div class="auth-overlay-card overlay-left auth-panel-slide-left">
                <div style="font-size: 42px; margin-bottom: 12px;">👋🐶✨</div>
                <h2 style="margin: 0 0 10px 0; font-weight: 800; font-size: 26px; color: #ffffff !important;">Đã có tài khoản?</h2>
                <p style="margin: 0 0 24px 0; font-size: 14px; line-height: 1.6; color: #fff7ed !important; opacity: 0.95; max-width: 320px;">
                    Bạn đã từng đăng ký tài khoản trên hệ thống PawDerm AI? Hãy đăng nhập để tiếp tục theo dõi tiến triển sức khỏe bé cưng nhé!
                </p>
                <div style="font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #fed7aa; font-weight: 700; margin-bottom: 8px;">
                    Bấm nút bên dưới để quay lại đăng nhập:
                </div>
            </div>
            """,
            unsafe_allow_html=True
        )
        if st.button("🚀 QUAY LẠI ĐĂNG NHẬP", key="btn_switch_to_signin", use_container_width=True):
            st.session_state.auth_mode = "signin"
            st.rerun()

    # ──────────────────────────────────────────────────────────────────────────
    # FORM ĐĂNG KÝ (Hiển thị bên phải khi ở trạng thái signup)
    # ──────────────────────────────────────────────────────────────────────────
    @classmethod
    def render_register_section(cls) -> None:
        """Khung chứa form Đăng ký với hiệu ứng mượt mà."""
        st.markdown(
            """
            <div class="auth-form-card auth-form-slide-right">
                <div style="text-align: center; margin-bottom: 22px;">
                    <span style="font-size: 32px;">📝</span>
                    <h2 style="margin: 6px 0 2px 0; color: #0d9488; font-weight: 800; font-size: 26px;">Tạo Tài Khoản Mới</h2>
                    <p style="margin: 0; font-size: 13px; color: #78716c;">Điền thông tin chủ nuôi để lưu trữ hồ sơ bệnh án các bé</p>
                </div>
            </div>
            """,
            unsafe_allow_html=True
        )
        cls.render_register_form()

    # Alias tương thích ngược
    render_register_card = render_register_section

    @classmethod
    def render_register_form(cls) -> None:
        """Form giao diện đăng ký tài khoản mới."""
        with st.form("register_form"):
            reg_username = st.text_input("👤 Tên đăng nhập mới *", placeholder="VD: lanhuong, tung123...", key="reg_username_input")
            reg_password = st.text_input("🔒 Mật khẩu mới *", type="password", placeholder="Nhập mật khẩu...", key="reg_password_input")
            reg_name = st.text_input("🏷️ Họ và tên chủ nuôi *", placeholder="VD: Nguyễn Thị Lan Hương...", key="reg_name_input")
            reg_phone = st.text_input("📞 Số điện thoại liên hệ *", placeholder="VD: 0987654321...", key="reg_phone_input")
            reg_email = st.text_input("✉️ Email (tuỳ chọn):", placeholder="VD: lanhuong@gmail.com...", key="reg_email_input")

            btn_register = st.form_submit_button("Tạo tài khoản ngay ✨", type="secondary", use_container_width=True)

            if btn_register:
                if not reg_username or not reg_password or not reg_name or not reg_phone:
                    st.warning("⚠️ Vui lòng điền đầy đủ các mục có dấu (*)")
                    return

                success, message = cls.register_user(
                    username=reg_username,
                    password=reg_password,
                    full_name=reg_name,
                    phone=reg_phone,
                    email=reg_email
                )

                if success:
                    st.success(message)
                else:
                    st.error(message)


