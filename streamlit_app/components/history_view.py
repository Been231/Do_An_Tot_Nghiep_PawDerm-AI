"""
Component HistoryView: Lịch sử chẩn đoán và tiến triển bệnh — gọn nhẹ, chi tiết dùng expander
"""

from typing import Dict, Any
import streamlit as st
from services.history_service import HistoryService


class HistoryViewComponent:
    """Giao diện lịch sử bệnh án theo dòng thời gian."""

    @classmethod
    def render_history_page(cls) -> None:
        st.markdown(
            """
            <div class="hero-banner" style="padding:22px 30px !important;">
                <h1 style="margin:0; font-size:22px; font-weight:800; color:#ffffff !important;">📈 Lịch sử Chẩn đoán & Tiến triển Bệnh</h1>
                <p style="margin:6px 0 0 0; font-size:13px; color:#fff7ed !important;">Ghi nhận và so sánh mức độ hồi phục qua từng ngày điều trị</p>
            </div>
            """,
            unsafe_allow_html=True
        )

        pets = HistoryService.get_all_pets()
        pet_options = {"🐾 Tất cả": None}
        for p in pets:
            pet_options[f"{p['avatar']} {p['name']}"] = p["id"]

        col_f, col_s = st.columns([1, 3])
        with col_f:
            selected_label = st.selectbox("Lọc theo bé:", list(pet_options.keys()), label_visibility="collapsed")
        selected_pet_id = pet_options[selected_label]

        records = HistoryService.get_diagnosis_history(selected_pet_id)

        if not records:
            st.info("Chưa có lịch sử chẩn đoán cho bé này.")
            return

        # Thanh tiến triển tổng thể
        latest = records[0]
        recovery = latest.get("recovery_score", 0)
        st.progress(recovery / 100.0, text=f"📊 Tiến triển hồi phục mới nhất của **{latest.get('pet_name')}**: **{recovery}%**")
        st.write("")

        # Timeline
        for record in records:
            cls._render_timeline_card(record)

    @staticmethod
    def _render_timeline_card(record: Dict[str, Any]) -> None:
        """Thẻ timeline gọn — bấm expander mới mở chi tiết."""
        badge_class = record.get("severity_badge", "badge-warning")
        with st.expander(
            f"📅 **{record.get('date')}** — {record.get('pet_name')} | {record.get('disease_name_vi')} ({record.get('confidence')}% tin cậy)",
            expanded=False
        ):
            col1, col2 = st.columns([3, 1])
            with col1:
                st.markdown(f"**{record.get('day_label')}**")
                st.markdown(f"📝 {record.get('clinical_notes')}")
                st.markdown(f"🩹 *Phác đồ:* {record.get('treatment_applied')}")
            with col2:
                st.markdown(
                    f"<div style='text-align:right;'><span class='badge {badge_class}'>{record.get('severity')}</span></div>",
                    unsafe_allow_html=True
                )
                recovery = record.get("recovery_score", 0)
                st.progress(recovery / 100, text=f"Hồi phục: {recovery}%")

            # Xác suất
            probs = record.get("probabilities", [])
            if probs:
                st.caption("Phân bổ xác suất tại thời điểm này:")
                for prob in probs:
                    st.progress(prob["percent"] / 100.0, text=f"{prob['label']}: {prob['percent']}%")

