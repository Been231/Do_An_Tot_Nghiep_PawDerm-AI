"""
Module Điều Phối Xác Thực và Quản Lý Người Dùng (Auth Manager Orchestrator)
Điều phối hiển thị Cổng đăng nhập/đăng ký kiểu Trượt chuyển cảnh (Double Slider Form).
Giữ nguyên hệ màu ấm áp (cam ấm & xanh teal), tích hợp hiệu ứng chuyển cảnh mượt mà.
"""

from typing import Optional, Dict, Any
import streamlit as st
import config
from auth.login_manager import LoginManager
from auth.register_manager import RegisterManager


class AuthManager:
    """Bộ điều phối xác thực người dùng, phiên làm việc và hiệu ứng giao diện."""

    @staticmethod
    def init_session_state() -> None:
        """Khởi tạo session state xác thực nếu chưa tồn tại."""
        LoginManager.init_session_state()

    @staticmethod
    def get_current_user() -> Optional[Dict[str, Any]]:
        """Lấy thông tin tài khoản hiện tại đang đăng nhập."""
        return LoginManager.get_current_user()

    @staticmethod
    def logout() -> None:
        """Thực hiện đăng xuất khỏi hệ thống."""
        LoginManager.logout()

    @staticmethod
    def render_profile_editor() -> None:
        """Hiển thị và cho phép chỉnh sửa hồ sơ cá nhân chủ nuôi."""
        LoginManager.render_profile_editor()

    # ──────────────────────────────────────────────────────────────────────────
    # RENDER CỔNG XÁC THỰC: HIỆU ỨNG TRƯỢT CHUYỂN CẢNH (DOUBLE SLIDER FORM)
    # ──────────────────────────────────────────────────────────────────────────
    @classmethod
    def render_auth_view(cls) -> None:
        """
        Hiển thị giao diện Cổng đăng nhập & Đăng ký dạng Slider chuyển cảnh.
        Khi đang ở Đăng nhập, bấm Đăng ký sẽ chuyển hiệu ứng mượt mà sang bên trái.
        """
        cls.init_session_state()
        st.markdown(config.CUSTOM_WEB_CSS, unsafe_allow_html=True)

        # Tiêm CSS chuyên biệt cho hiệu ứng Sliding Overlay và bo cong hình học
        st.markdown(
            """
            <style>
            /* KHUNG CONTAINER CHÍNH CỦA BỘ XÁC THỰC */
            .auth-slider-wrapper {
                max-width: 950px;
                margin: 0 auto 30px auto;
            }

            /* CARD FORM TRẮNG SANG TRỌNG */
            .auth-form-card {
                background: #ffffff;
                border-radius: 24px;
                padding: 24px 28px 10px 28px;
                border: 1.5px solid #fed7aa;
                box-shadow: 0 12px 30px -8px rgba(249, 115, 22, 0.12);
            }

            /* OVERLAY PANEL BÊN PHẢI (Gợi ý Đăng ký - Vát cong bên trái theo hình mẫu) */
            .auth-overlay-card.overlay-right {
                background: linear-gradient(135deg, #0d9488 0%, #0f766e 60%, #115e59 100%);
                border-radius: 90px 24px 24px 70px;
                padding: 42px 32px;
                color: #ffffff;
                text-align: center;
                box-shadow: 0 16px 36px -8px rgba(13, 148, 136, 0.4);
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                min-height: 310px;
                margin-bottom: 14px;
            }

            /* OVERLAY PANEL BÊN TRÁI (Gợi ý Đăng nhập - Vát cong bên phải theo hình mẫu) */
            .auth-overlay-card.overlay-left {
                background: linear-gradient(135deg, #ea580c 0%, #f97316 60%, #fb923c 100%);
                border-radius: 24px 90px 70px 24px;
                padding: 42px 32px;
                color: #ffffff;
                text-align: center;
                box-shadow: 0 16px 36px -8px rgba(234, 88, 12, 0.35);
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                min-height: 310px;
                margin-bottom: 14px;
            }

            /* KEYFRAMES HIỆU ỨNG CHUYỂN CẢNH TRƯỢT MƯỢT MÀ */
            @keyframes slideInFromRight {
                0% {
                    opacity: 0;
                    transform: translateX(70px) scale(0.97);
                }
                100% {
                    opacity: 1;
                    transform: translateX(0) scale(1);
                }
            }

            @keyframes slideInFromLeft {
                0% {
                    opacity: 0;
                    transform: translateX(-70px) scale(0.97);
                }
                100% {
                    opacity: 1;
                    transform: translateX(0) scale(1);
                }
            }

            .auth-panel-slide-left {
                animation: slideInFromLeft 0.5s cubic-bezier(0.22, 1, 0.36, 1) forwards;
            }

            .auth-panel-slide-right {
                animation: slideInFromRight 0.5s cubic-bezier(0.22, 1, 0.36, 1) forwards;
            }

            .auth-form-slide-left {
                animation: slideInFromLeft 0.45s cubic-bezier(0.22, 1, 0.36, 1) forwards;
            }

            .auth-form-slide-right {
                animation: slideInFromRight 0.45s cubic-bezier(0.22, 1, 0.36, 1) forwards;
            }

            /* STYLE NÚT CHUYỂN TRẠNG THÁI SANG ĐĂNG KÝ (XANH TEAL PILL) */
            div.stButton:has(button[key="btn_switch_to_signup"]) button,
            button[key="btn_switch_to_signup"] {
                background: linear-gradient(135deg, #0d9488 0%, #0f766e 100%) !important;
                border: 2px solid #0d9488 !important;
                color: #ffffff !important;
                border-radius: 9999px !important;
                font-weight: 700 !important;
                font-size: 14px !important;
                letter-spacing: 0.5px !important;
                padding: 10px 24px !important;
                box-shadow: 0 6px 20px rgba(13, 148, 136, 0.3) !important;
                transition: all 0.3s ease !important;
            }
            div.stButton:has(button[key="btn_switch_to_signup"]) button:hover,
            button[key="btn_switch_to_signup"]:hover {
                background: #0f766e !important;
                transform: translateY(-2px) !important;
                box-shadow: 0 10px 25px rgba(13, 148, 136, 0.45) !important;
            }

            /* STYLE NÚT QUAY LẠI ĐĂNG NHẬP (CAM ẤM PILL) */
            div.stButton:has(button[key="btn_switch_to_signin"]) button,
            button[key="btn_switch_to_signin"] {
                background: linear-gradient(135deg, #ea580c 0%, #f97316 100%) !important;
                border: 2px solid #ea580c !important;
                color: #ffffff !important;
                border-radius: 9999px !important;
                font-weight: 700 !important;
                font-size: 14px !important;
                letter-spacing: 0.5px !important;
                padding: 10px 24px !important;
                box-shadow: 0 6px 20px rgba(234, 88, 12, 0.3) !important;
                transition: all 0.3s ease !important;
            }
            div.stButton:has(button[key="btn_switch_to_signin"]) button:hover,
            button[key="btn_switch_to_signin"]:hover {
                background: #c2410c !important;
                transform: translateY(-2px) !important;
                box-shadow: 0 10px 25px rgba(234, 88, 12, 0.45) !important;
            }
            </style>
            """,
            unsafe_allow_html=True
        )

        # 1. Banner nhận diện thương hiệu PawDerm AI
        st.markdown(
            f"""
            <div style="background: linear-gradient(135deg, #f97316 0%, #fb923c 50%, #0d9488 100%); 
                        padding: 26px 32px; border-radius: 22px; color: white; text-align: center; margin-bottom: 22px;
                        box-shadow: 0 12px 30px -6px rgba(249, 115, 22, 0.35);">
                <div style="font-size: 42px; margin-bottom: 4px;">🐶🐾🐱</div>
                <h1 style="margin: 0; font-size: 26px; font-weight: 800; color: #ffffff !important;">{config.APP_NAME}</h1>
                <p style="margin: 6px 0 0 0; font-size: 14px; color: #ffffff !important; font-weight: 600; opacity: 0.95;">
                    Hệ Thống Trí Tuệ Nhân Tạo Hỗ Trợ Chẩn Đoán Bệnh Da Liễu & Y Tế Thú Cưng
                </p>
            </div>
            """,
            unsafe_allow_html=True
        )

        # 2. Điều phối giao diện theo trạng thái auth_mode (signin | signup)
        auth_mode = st.session_state.get("auth_mode", "signin")

        st.markdown('<div class="auth-slider-wrapper">', unsafe_allow_html=True)

        if auth_mode == "signin":
            # TRẠNG THÁI 1: FORM ĐĂNG NHẬP BÊN TRÁI | OVERLAY GỢI Ý ĐĂNG KÝ BÊN PHẢI
            col_form, col_overlay = st.columns([1.05, 0.95], gap="large")
            with col_form:
                LoginManager.render_login_section()
            with col_overlay:
                LoginManager.render_signup_prompt()

        else:
            # TRẠNG THÁI 2: CHUYỂN HIỆU ỨNG OVERLAY QUA BÊN TRÁI | FORM ĐĂNG KÝ BÊN PHẢI
            col_overlay, col_form = st.columns([0.95, 1.05], gap="large")
            with col_overlay:
                RegisterManager.render_signin_prompt()
            with col_form:
                RegisterManager.render_register_section()

        st.markdown('</div>', unsafe_allow_html=True)
