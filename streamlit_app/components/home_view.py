"""
Component HomeView: Trang chủ gọn nhẹ, thoáng sạch sau khi đăng nhập
"""

from typing import Dict, Any, Callable
import streamlit as st
import config
from services.history_service import HistoryService


class HomeViewComponent:
    """Giao diện Trang chủ chính của hệ thống PawDerm AI."""

    @classmethod
    def render_home_page(cls, current_user: Dict[str, Any], navigate_to: Callable[[str], None]) -> None:
        user_name = current_user.get("full_name", "Bạn").split()[0]  # Chỉ lấy tên ngắn

        # HERO BANNER
        st.markdown(
            f"""
            <div class="hero-banner">
                <span style="background:rgba(255,255,255,0.25); padding:4px 14px; border-radius:9999px; font-size:12px; font-weight:700; text-transform:uppercase;">
                    ✨ Chào mừng trở lại, {user_name}!
                </span>
                <h1 style="margin:12px 0 8px 0; font-size:30px; font-weight:800; line-height:1.2; color:#ffffff !important;">
                    Phát Hiện Sớm Bệnh Da Liễu<br>Thú Cưng Bằng AI 🐶🐱
                </h1>
                <p style="margin:0; font-size:14px; color:#fff7ed !important;">
                    Chụp ảnh vùng da bị ngứa, rụng lông — nhận kết quả chẩn đoán và hướng dẫn y khoa tức thì.
                </p>
            </div>
            """,
            unsafe_allow_html=True
        )

        # NÚT CTA
        col_cta1, col_cta2, col_sp = st.columns([1.4, 1.2, 3])
        with col_cta1:
            if st.button("🚀 Bắt đầu Khám bệnh", type="primary", use_container_width=True):
                navigate_to("🔬 Chẩn đoán AI (Khám bệnh)")
        with col_cta2:
            if st.button("🐾 Quản lý Thú cưng", use_container_width=True):
                navigate_to("🐾 Hồ sơ Thú cưng & Chủ nuôi")

        st.write("")

        # STAT CARDS
        cls._render_stats()

        st.write("---")

        # QUY TRÌNH 3 BƯỚC
        st.markdown("### 📋 Quy trình Khám Bệnh Nhanh")
        c1, c2, c3 = st.columns(3)
        steps = [
            ("1", "📷 Chụp ảnh", "Chụp ảnh hoặc tải ảnh vùng da bị tổn thương lên hệ thống."),
            ("2", "🔬 AI Phân tích", "Hệ thống quét và phân loại xác suất các bệnh da liễu phổ biến."),
            ("3", "💊 Nhận kết quả", "Xem phác đồ sơ cứu, cảnh báo nguy hiểm và đặt lịch phòng khám."),
        ]
        for col, (num, title, desc) in zip([c1, c2, c3], steps):
            with col:
                st.markdown(
                    f"""<div class="step-card">
                        <div class="step-number">{num}</div>
                        <h4 style="margin:0 0 6px 0; font-size:16px; font-weight:700; color:#1c1917;">{title}</h4>
                        <p style="margin:0; font-size:13px; color:#78716c; line-height:1.5;">{desc}</p>
                    </div>""",
                    unsafe_allow_html=True
                )

        st.write("")

        # DANH SÁCH BÉ CƯNG NHANH
        cls._render_pets_quick(navigate_to)

        st.write("---")

        # MẸO PHÒNG BỆNH (gọn, 2 popover)
        st.markdown("### 💡 Mẹo Chăm sóc & Phòng bệnh")
        col_t1, col_t2 = st.columns(2)
        with col_t1:
            with st.popover("🍄 Phòng ngừa Nấm da (Ringworm) mùa ẩm", use_container_width=True):
                st.info("Sấy khô lông sau khi tắm. Không để lông ẩm sát da. Khử trùng đệm ngủ và chuồng định kỳ bằng dung dịch sát khuẩn y tế.")
        with col_t2:
            with st.popover("🔍 Nhận biết Ghẻ Demodex sớm", use_container_width=True):
                st.info("Nếu thấy rụng lông quanh hốc mắt hoặc kẽ móng chân có mùi hôi tanh — dùng PawDerm AI kiểm tra ngay để tránh ghẻ lan toàn thân!")

    @staticmethod
    def _render_stats() -> None:
        metrics = HistoryService.get_dashboard_metrics()
        cols = st.columns(4)
        data = [
            ("🐾", "#fff7ed", "#ea580c", metrics["total_pets"], "Thú cưng"),
            ("🔬", "#f0fdf4", "#16a34a", metrics["total_diagnoses"], "Lượt khám AI"),
            ("🩹", "#fef3c7", "#d97706", metrics["active_treatments"], "Đang điều trị"),
            ("💖", "#fae8ff", "#c026d3", metrics["healthy_pets"], "Khỏe mạnh"),
        ]
        for col, (icon, bg, color, num, label) in zip(cols, data):
            with col:
                st.markdown(
                    f"""<div class="stat-card-bright">
                        <div class="stat-icon-wrap" style="background:{bg}; color:{color};">{icon}</div>
                        <div>
                            <div class="stat-num">{num}</div>
                            <div class="stat-text">{label}</div>
                        </div>
                    </div>""",
                    unsafe_allow_html=True
                )

    @classmethod
    def _render_pets_quick(cls, navigate_to: Callable[[str], None]) -> None:
        pets = HistoryService.get_all_pets()
        if not pets:
            return
        st.markdown("### 🐶 Bé Cưng Của Bạn")
        
        # Chia theo hàng tối đa 4 cột để giao diện luôn cân đối và không bị méo
        chunk_size = 4
        for i in range(0, len(pets), chunk_size):
            row_pets = pets[i:i + chunk_size]
            cols = st.columns(len(row_pets))
            for idx, pet in enumerate(row_pets):
                with cols[idx]:
                    with st.container(border=True):
                        st.markdown(
                            f"<div style='text-align:center; font-size:36px;'>{pet.get('avatar','🐾')}</div>"
                            f"<h4 style='text-align:center; margin:6px 0 2px; color:#1c1917;'>{pet.get('name')}</h4>"
                            f"<p style='text-align:center; font-size:12px; color:#78716c; margin:0 0 8px;'>{pet.get('species')} • {pet.get('breed')}</p>",
                            unsafe_allow_html=True
                        )
                        st.markdown(
                            f"<div style='text-align:center;'><span class='badge {pet.get('status_badge','badge-info')}'>{pet.get('health_status')}</span></div>",
                            unsafe_allow_html=True
                        )
                        st.write("")
                        if st.button(f"🔍 Khám cho {pet.get('name')}", key=f"home_diag_{pet['id']}", use_container_width=True):
                            st.session_state.selected_pet_for_diagnosis = pet["id"]
                            navigate_to("🔬 Chẩn đoán AI (Khám bệnh)")

