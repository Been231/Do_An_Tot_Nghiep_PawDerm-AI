"""
Dịch vụ Quản lý & Đề xuất Dịch vụ Y tế Phòng khám (Clinic Service)
Phiên bản 2.0 — Tích hợp Supabase (bảng `appointments`).
"""

from typing import List, Dict, Any
import streamlit as st
from backend.app.database.supabase_client import get_client


class ClinicService:
    """Quản lý các hoạt động tương tác với phòng khám thú y đối tác."""

    @staticmethod
    def _get_current_user_id() -> str | None:
        """Lấy supabase user_id từ session_state."""
        user = st.session_state.get("logged_in_user")
        return user.get("supabase_id") if user else None

    @staticmethod
    def book_appointment(pet_name: str, service_title: str) -> bool:
        """Ghi nhận lịch hẹn khám vào bảng `appointments` trên Supabase."""
        user_id = ClinicService._get_current_user_id()
        if not user_id:
            st.error("Vui lòng đăng nhập để đặt lịch hẹn.")
            return False

        try:
            db = get_client()
            db.table("appointments").insert({
                "user_id": user_id,
                "pet_name": pet_name or "Bé cưng",
                "service_title": service_title,
                "status": "pending"
            }).execute()
            return True
        except Exception as e:
            st.error(f"Lỗi khi đặt lịch hẹn: {e}")
            return False

    @staticmethod
    def get_appointments() -> List[Dict[str, Any]]:
        """Lấy danh sách lịch hẹn của người dùng hiện tại từ Supabase."""
        user_id = ClinicService._get_current_user_id()
        if not user_id:
            return []
        try:
            db = get_client()
            resp = db.table("appointments") \
                     .select("*") \
                     .eq("user_id", user_id) \
                     .order("created_at", desc=True) \
                     .execute()
            return resp.data or []
        except Exception as e:
            st.error(f"Lỗi khi tải lịch hẹn: {e}")
            return []


