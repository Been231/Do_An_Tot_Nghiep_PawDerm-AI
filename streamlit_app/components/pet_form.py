"""
Component PetForm: Chọn thú cưng, hướng dẫn chụp ảnh gọn nhẹ và tiếp nhận ảnh tổn thương
"""

from typing import Dict, Any, Optional
import streamlit as st
import config
from services.history_service import HistoryService


class PetFormComponent:
    """Xử lý thu thập thông tin lâm sàng và hình ảnh kiểm tra vùng da tổn thương."""

    @staticmethod
    def render_pet_selection_or_input() -> Dict[str, Any]:
        """Cho phép chọn nhanh từ danh sách hoặc nhập thú cưng mới."""
        pets = HistoryService.get_all_pets()

        use_existing = st.radio(
            "Nguồn thông tin:",
            ["Chọn từ danh sách đã lưu", "Nhập thú cưng mới"],
            horizontal=True, label_visibility="collapsed"
        )

        if use_existing == "Chọn từ danh sách đã lưu" and pets:
            preselected_id = st.session_state.get("selected_pet_for_diagnosis")
            pet_map = {f"{p['avatar']} {p['name']} — {p['breed']}": p for p in pets}
            default_index = 0
            if preselected_id:
                for idx, p in enumerate(pets):
                    if p["id"] == preselected_id:
                        default_index = idx
                        break

            col1, col2 = st.columns([2, 3])
            with col1:
                selected_label = st.selectbox("Chọn bé cưng:", list(pet_map.keys()), index=default_index, label_visibility="collapsed")
            selected_pet = pet_map[selected_label]
            with col2:
                pet_symptoms = st.multiselect(
                    "Triệu chứng đang có:",
                    config.COMMON_SYMPTOMS,
                    default=[],
                    placeholder="Chọn triệu chứng..."
                )

            # Info pill gọn
            st.markdown(
                f"""<div style="background:#fff7ed; border:1.5px solid #fed7aa; border-radius:12px; padding:10px 16px; margin-top:4px; display:flex; gap:16px; font-size:13px; color:#7c3aed; flex-wrap:wrap;">
                    <span>🐾 <strong>{selected_pet['name']}</strong></span>
                    <span>📋 {selected_pet['species']}</span>
                    <span>🧬 {selected_pet['breed']}</span>
                    <span>⚖️ {selected_pet['weight']}</span>
                    <span>📅 {selected_pet['age']}</span>
                </div>""",
                unsafe_allow_html=True
            )

            return {
                "pet_id": selected_pet["id"],
                "name": selected_pet["name"],
                "species": selected_pet["species"],
                "breed": selected_pet["breed"],
                "age": selected_pet.get("age", "1 tuổi"),
                "weight": selected_pet.get("weight", "Chưa cân"),
                "symptoms": pet_symptoms
            }
        else:
            col1, col2 = st.columns(2)
            with col1:
                species = st.radio("Loài:", config.PET_SPECIES_OPTIONS, horizontal=True)
                name = st.text_input("Tên thú cưng *:", placeholder="VD: Milo, Miu...")
                age = st.text_input("Độ tuổi:", placeholder="VD: 1.5 tuổi...", value="1 tuổi")
            with col2:
                breed = st.text_input("Giống loài:", placeholder="VD: Poodle, Corgi...")
                weight = st.text_input("Cân nặng:", placeholder="VD: 4.5...", value="3.5")
                pet_symptoms = st.multiselect("Triệu chứng đang có:", config.COMMON_SYMPTOMS, placeholder="Chọn triệu chứng...")

            return {
                "pet_id": "new_pet",
                "name": name.strip() or "Bé cưng",
                "species": species,
                "breed": breed.strip() or "Chưa rõ",
                "age": age.strip() or "1 tuổi",
                "weight": f"{weight.strip()} kg" if weight.strip() else "Chưa cân",
                "symptoms": pet_symptoms
            }

    @staticmethod
    def render_photography_guide() -> None:
        """Hướng dẫn chụp ảnh dạng icon card gọn nhẹ — bấm vào để xem chi tiết."""
        st.caption("📸 **Hướng dẫn chụp ảnh đạt chuẩn AI** — Bấm vào từng mục để xem chi tiết:")

        c1, c2, c3, c4 = st.columns(4)

        with c1:
            with st.popover("📏 Cự ly chụp", use_container_width=True):
                st.markdown("#### 📏 Cự ly tối ưu")
                st.info("Giữ máy cách vùng da **10 – 15 cm**. Đặt vết tổn thương ở trung tâm khung hình.")

        with c2:
            with st.popover("💡 Ánh sáng", use_container_width=True):
                st.markdown("#### 💡 Ánh sáng tự nhiên")
                st.info("Chụp ở nơi có ánh sáng tự nhiên. Tránh bật flash vì flash gây lóa và sai lệch màu vảy da.")

        with c3:
            with st.popover("✂️ Vén lông", use_container_width=True):
                st.markdown("#### ✂️ Vén lông xung quanh")
                st.info("Nhẹ nhàng vén bớt lông phủ để lộ rõ bề mặt da và bờ viền tổn thương trước khi chụp.")

        with c4:
            with st.popover("🎯 Lấy nét", use_container_width=True):
                st.markdown("#### 🎯 Lấy nét chuẩn")
                st.info("Chạm màn hình điện thoại vào vết đỏ / mụn mủ để lấy nét trực tiếp. Giữ chắc tay khi bấm chụp.")

    @classmethod
    def render_image_input(cls) -> Optional[Any]:
        """Tiếp nhận hình ảnh tổn thương qua camera hoặc tải từ thiết bị."""
        cls.render_photography_guide()

        st.write("")
        upload_type = st.radio(
            "Phương thức:",
            ["📷 Chụp camera / webcam", "📁 Tải ảnh từ thiết bị"],
            horizontal=True, label_visibility="collapsed"
        )

        uploaded_file = None
        if upload_type == "📁 Tải ảnh từ thiết bị":
            uploaded_file = st.file_uploader(
                "Chọn ảnh:",
                type=config.ALLOWED_IMAGE_TYPES,
                label_visibility="collapsed"
            )
        else:
            uploaded_file = st.camera_input("Chụp ảnh:", label_visibility="collapsed")

        if uploaded_file is not None:
            col_img, col_info = st.columns([1, 1])
            with col_img:
                st.image(uploaded_file, caption="Ảnh đang chờ phân tích", width=320)
            with col_info:
                st.success("✅ Ảnh đã tải lên thành công! Nhấn **Phân tích AI** bên dưới để bắt đầu quét.")

        return uploaded_file

