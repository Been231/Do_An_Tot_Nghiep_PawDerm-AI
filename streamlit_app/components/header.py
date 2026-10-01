"""
Component Header: Hiển thị thanh điều hướng, banner hệ thống và thẻ thống kê Dashboard
"""

from typing import Dict, Any
import streamlit as st
import config
from auth.auth_manager import AuthManager
from services.history_service import HistoryService


class HeaderComponent:
    """Quản lý các phần tử đầu trang và thẻ thống kê Dashboard."""

    @staticmethod
    def render_top_bar(user_info: Dict[str, Any]) -> None:
        """Thanh thông tin tài khoản khách hàng và nút đăng xuất trên cùng."""
        col_nav1, col_nav2 = st.columns([3, 1])
        with col_nav1:
            st.markdown(
                f"👋 Chào mừng, **{user_info.get('full_name', 'Khách hàng')}** "
                f"<span style='color: #64748b; font-size: 13px;'>(SĐT: {user_info.get('phone', 'N/A')} • {user_info.get('email', '')})</span>",
                unsafe_allow_html=True
            )
        with col_nav2:
            if st.button("🚪 Đăng xuất", key="btn_logout_top", use_container_width=True):
                AuthManager.logout()

    @staticmethod
    def render_banner() -> None:
        """Banner chính của hệ thống với phong cách MedTech sang trọng."""
        st.markdown(
            f"""
            <div class="main-banner">
                <div style="display: flex; align-items: center; justify-content: space-between;">
                    <div>
                        <span style="background: rgba(255,255,255,0.2); padding: 4px 12px; border-radius: 9999px; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Hệ thống Y tế Thú cưng 4.0</span>
                        <h1 style="margin: 8px 0 4px 0; font-size: 26px; font-weight: 800; color: #ffffff !important;">{config.APP_ICON} {config.APP_NAME}</h1>
                        <p style="margin: 0; font-size: 14px; color: #e0f2fe !important;">{config.APP_TAGLINE}</p>
                    </div>
                </div>
            </div>
            """,
            unsafe_allow_html=True
        )

    @staticmethod
    def render_dashboard_metrics() -> None:
        """Hiển thị 4 thẻ thống kê nhanh trên trang Tổng quan (Dashboard)."""
        metrics = HistoryService.get_dashboard_metrics()

        col1, col2, col3, col4 = st.columns(4)

        with col1:
            st.markdown(
                f"""
                <div class="stat-card">
                    <div class="stat-icon" style="background: #e0f2fe; color: #0284c7;">🐾</div>
                    <div>
                        <div class="stat-val">{metrics['total_pets']}</div>
                        <div class="stat-lbl">Thú cưng đã đăng ký</div>
                    </div>
                </div>
                """,
                unsafe_allow_html=True
            )

        with col2:
            st.markdown(
                f"""
                <div class="stat-card">
                    <div class="stat-icon" style="background: #f0fdf4; color: #16a34a;">🔬</div>
                    <div>
                        <div class="stat-val">{metrics['total_diagnoses']}</div>
                        <div class="stat-lbl">Lần chẩn đoán AI</div>
                    </div>
                </div>
                """,
                unsafe_allow_html=True
            )

        with col3:
            st.markdown(
                f"""
                <div class="stat-card">
                    <div class="stat-icon" style="background: #fef3c7; color: #d97706;">🩹</div>
                    <div>
                        <div class="stat-val">{metrics['active_treatments']}</div>
                        <div class="stat-lbl">Đang theo dõi điều trị</div>
                    </div>
                </div>
                """,
                unsafe_allow_html=True
            )

        with col4:
            st.markdown(
                f"""
                <div class="stat-card">
                    <div class="stat-icon" style="background: #fdf4ff; color: #a855f7;">💖</div>
                    <div>
                        <div class="stat-val">{metrics['healthy_pets']}</div>
                        <div class="stat-lbl">Khỏe mạnh bình thường</div>
                    </div>
                </div>
                """,
                unsafe_allow_html=True
            )
        st.write("")

