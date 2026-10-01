"""
Component ResultView: Kết quả chẩn đoán AI gọn nhẹ — thông tin chi tiết hiện qua popover/expander
"""

from typing import Dict, Any, Optional
import streamlit as st
from services.history_service import HistoryService
from services.clinic_service import ClinicService


class ResultViewComponent:
    """Hiển thị kết quả chẩn đoán AI súc tích, thông tin chi tiết bấm mới mở."""

    @classmethod
    def render_full_results(cls, result: Dict[str, Any], pet_data: Dict[str, Any]) -> None:
        pet_name = pet_data.get("name", "Bé cưng")
        pet_id = pet_data.get("pet_id", "new_pet")

        st.success("✅ Phân tích AI hoàn tất!")

        # 1. Thẻ tóm tắt chính — gọn, nổi bật
        cls._render_summary_card(result)

        # 2. Hàng nút bấm để xem thêm chi tiết — KHÔNG hiện sẵn, bấm mới mở
        cls._render_detail_popovers(result)

        # 3. Nút lưu lịch sử
        cls._render_save_section(result, pet_id, pet_name, pet_data)

        st.write("---")

        # 4. Dịch vụ phòng khám
        cls._render_clinic_services(result, pet_name)

        st.caption(
            "⚠️ **Lưu ý y khoa:** Kết quả AI mang tính chất hỗ trợ sơ bộ. Vui lòng đưa thú cưng đến cơ sở thú y uy tín để được xét nghiệm và điều trị chính xác."
        )

    @staticmethod
    def _render_summary_card(result: Dict[str, Any]) -> None:
        """Thẻ tóm tắt kết quả chẩn đoán súc tích, nổi bật."""
        badge = result.get("severity_badge", "badge-warning")
        severity = result.get("severity_level", "Trung bình")
        probabilities = result.get("probabilities", [])
        top_confidence = probabilities[0]["percent"] if probabilities else result.get("confidence", 85.0)

        # Cảnh báo lây sang người
        if result.get("is_zoonotic"):
            st.warning("🦠 **Cảnh báo:** Bệnh có nguy cơ **lây sang người** — đặc biệt trẻ em. Cần cách ly bé tạm thời và đeo găng tay khi chăm sóc!")

        st.markdown(
            f"""
            <div style="background:#ffffff; border-radius:18px; border:2px solid #fed7aa; padding:22px 26px;
                        box-shadow:0 6px 20px rgba(249,115,22,0.1); margin-bottom:16px;">
                <div style="display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:12px;">
                    <div>
                        <div style="font-size:12px; font-weight:700; color:#9a3412; text-transform:uppercase; letter-spacing:0.5px; margin-bottom:6px;">
                            🔬 Kết quả Chẩn đoán AI
                        </div>
                        <div style="font-size:22px; font-weight:800; color:#1c1917; margin-bottom:4px;">
                            {result.get('disease_name_vi')}
                        </div>
                        <div style="font-size:13px; color:#78716c; font-style:italic;">{result.get('disease_name_en')}</div>
                    </div>
                    <div style="text-align:right;">
                        <span class="badge {badge}" style="font-size:13px; padding:6px 14px;">{severity}</span>
                        <div style="margin-top:8px; font-size:13px; color:#57534e;">
                            Độ tin cậy: <strong style="color:#ea580c; font-size:18px;">{top_confidence}%</strong>
                        </div>
                    </div>
                </div>
            </div>
            """,
            unsafe_allow_html=True
        )

        # Thanh xác suất đa lớp
        for prob in result.get("probabilities", []):
            st.progress(prob["percent"] / 100.0, text=f"**{prob['label']}** — {prob['percent']}%")

    @staticmethod
    def _render_detail_popovers(result: Dict[str, Any]) -> None:
        """Hàng nút icon — bấm vào mới mở chi tiết (thay vì hiện sẵn hàng đống chữ)."""
        st.markdown("##### 📋 Xem chi tiết (bấm vào từng mục):")
        c1, c2, c3 = st.columns(3)

        with c1:
            with st.popover("🧪 Nguyên nhân & Triệu chứng", use_container_width=True):
                st.markdown("#### 🧪 Nguyên nhân gây bệnh")
                st.write(result.get("cause", "Đang cập nhật..."))
                st.markdown("#### 🩺 Triệu chứng lâm sàng điển hình")
                for s in result.get("clinical_symptoms", []):
                    st.markdown(f"- {s}")

        with c2:
            with st.popover("🩹 Hướng dẫn Sơ cứu tại nhà", use_container_width=True):
                st.markdown("#### 🩹 Sơ cứu Y khoa tại nhà")
                for item in result.get("home_first_aid", []):
                    st.markdown(f"✅ {item}")

        with c3:
            with st.popover("🚨 Khi nào cần đi viện gấp?", use_container_width=True):
                st.markdown("#### 🚨 Dấu hiệu nguy cấp — Đi viện ngay!")
                for item in result.get("emergency_signs", []):
                    st.error(item)

    @staticmethod
    def _render_save_section(result: Dict[str, Any], pet_id: str, pet_name: str, pet_data: Optional[Dict[str, Any]] = None) -> None:
        """Nút lưu kết quả vào lịch sử bệnh án — gọn nhẹ."""
        col_note, col_btn = st.columns([3, 1])
        with col_note:
            st.caption(f"💾 Lưu ca khám này vào hồ sơ bệnh án của **{pet_name}** để theo dõi tiến triển qua các ngày.")
        with col_btn:
            if st.button("💾 Lưu vào Lịch sử", type="primary", use_container_width=True):
                saved = HistoryService.save_diagnosis_record(
                    pet_id=pet_id,
                    pet_name=pet_name,
                    diagnosis_result=result,
                    pet_data=pet_data
                )
                if saved:
                    st.toast(f"🎉 Đã lưu vào lịch sử bệnh án của **{pet_name}**!", icon="✅")

    @staticmethod
    def _render_clinic_services(result: Dict[str, Any], pet_name: str) -> None:
        """Gợi ý dịch vụ phòng khám — thẻ gọn, đặt lịch qua toast."""
        st.subheader("🏥 Dịch vụ Phòng khám Đề xuất")
        recommendations = result.get("clinic_recommendations", [])
        if not recommendations:
            return

        cols = st.columns(len(recommendations))
        for idx, item in enumerate(recommendations):
            with cols[idx]:
                with st.container(border=True):
                    st.markdown(f"**{item.get('icon', '🩺')} {item.get('title', 'Dịch vụ')}**")
                    st.caption(item.get("desc", ""))
                    btn_key = f"svc_{item.get('btn_key', idx)}"
                    if st.button(item.get("action_label", "Xem"), key=btn_key, use_container_width=True):
                        if "prescription_info" in item:
                            st.toast(f"💊 {item['prescription_info']}", icon="📋")
                        else:
                            ClinicService.book_appointment(pet_name, item.get("title", "Dịch vụ"))
                            st.toast(f"📅 Đã đặt lịch **{item.get('title')}** cho {pet_name}!", icon="✅")

