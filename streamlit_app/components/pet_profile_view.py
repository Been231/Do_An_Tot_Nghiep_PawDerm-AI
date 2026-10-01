"""
Component PetProfileView: Quản lý hồ sơ cá nhân chủ nuôi và danh sách thú cưng
"""

from typing import Dict, Any
import streamlit as st
from services.history_service import HistoryService
from auth.auth_manager import AuthManager
import config


class PetProfileViewComponent:
    """Giao diện quản lý hồ sơ người dùng và các bé cưng."""

    @classmethod
    def render_pet_management_page(cls) -> None:
        st.markdown(
            """
            <div class="hero-banner" style="padding:22px 30px !important;">
                <h1 style="margin:0; font-size:22px; font-weight:800; color:#ffffff !important;">🐾 Hồ sơ Chủ nuôi & Thú cưng</h1>
                <p style="margin:6px 0 0 0; font-size:13px; color:#fff7ed !important;">Lưu trữ thông tin thể trạng, tiền sử bệnh và theo dõi sức khỏe từng bé</p>
            </div>
            """,
            unsafe_allow_html=True
        )

        tab_pets, tab_owner = st.tabs(["🐶 Thú cưng của tôi", "👤 Hồ sơ cá nhân"])

        with tab_pets:
            cls._render_pet_list_and_add()

        with tab_owner:
            AuthManager.render_profile_editor()

    @classmethod
    def _render_pet_list_and_add(cls) -> None:
        pets = HistoryService.get_all_pets()
        col_title, col_btn = st.columns([3, 1])
        with col_title:
            st.markdown(f"**{len(pets)} bé cưng đã đăng ký**")
        with col_btn:
            show_form = st.toggle("➕ Thêm bé mới", value=False)

        if show_form:
            cls._render_add_pet_form()

        cols = st.columns(2)
        for idx, pet in enumerate(pets):
            with cols[idx % 2]:
                cls._render_pet_card(pet)

    @staticmethod
    def _render_pet_card(pet: Dict[str, Any]) -> None:
        badge_class = pet.get("status_badge", "badge-info")
        with st.container(border=True):
            col_av, col_info = st.columns([1, 4])
            with col_av:
                st.markdown(f"<div style='font-size:38px; text-align:center; padding-top:6px;'>{pet.get('avatar','🐾')}</div>", unsafe_allow_html=True)
            with col_info:
                st.markdown(
                    f"**{pet.get('name')}** — {pet.get('species')} / {pet.get('breed')}  \n"
                    f"📅 {pet.get('age')} | ⚖️ {pet.get('weight')}",
                )
                st.markdown(
                    f"<span class='badge {badge_class}'>{pet.get('health_status')}</span>",
                    unsafe_allow_html=True
                )
            with st.expander("📝 Xem ghi chú tiền sử bệnh"):
                st.write(pet.get("notes", "Chưa có ghi chú."))

    @staticmethod
    def _render_add_pet_form() -> None:
        with st.form("add_new_pet_form"):
            col1, col2 = st.columns(2)
            with col1:
                name = st.text_input("Tên thú cưng *:", placeholder="VD: Bơ, Cún...")
                species = st.selectbox("Loài *:", config.PET_SPECIES_OPTIONS)
                breed = st.text_input("Giống loài:", placeholder="VD: Poodle...")
            with col2:
                age = st.text_input("Độ tuổi:", placeholder="VD: 1.5 tuổi...")
                weight = st.text_input("Cân nặng (kg):", placeholder="VD: 4.2...")
                notes = st.text_area("Tiền sử bệnh / Ghi chú:", placeholder="VD: Dị ứng xà phòng...", height=96)

            submitted = st.form_submit_button("✅ Tạo hồ sơ", type="primary", use_container_width=True)
            if submitted:
                if not name.strip():
                    st.error("Vui lòng nhập tên thú cưng!")
                else:
                    HistoryService.add_new_pet(name.strip(), species, breed.strip(), age.strip(), weight.strip(), notes.strip())
                    st.toast(f"🎉 Đã tạo hồ sơ cho bé **{name}**!", icon="🐾")
                    st.rerun()

