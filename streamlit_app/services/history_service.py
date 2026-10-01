"""
Dịch vụ Quản lý Hồ sơ Thú cưng & Lịch sử Chẩn đoán (History & Pet Profile Service)
Phiên bản 2.0 — Tích hợp Supabase PostgreSQL.
Dữ liệu được lưu trữ bền vững, không mất sau khi refresh trình duyệt.
"""

from datetime import datetime
from typing import List, Dict, Any, Optional
import streamlit as st
from backend.app.database.supabase_client import get_client


class HistoryService:
    """Quản lý dữ liệu hồ sơ thú cưng và lịch sử bệnh án qua Supabase."""

    # ──────────────────────────────────────────────────────────────────────────
    # HELPER: lấy user_id của người dùng đang đăng nhập
    # ──────────────────────────────────────────────────────────────────────────
    @staticmethod
    def _get_current_user_id() -> Optional[str]:
        """Lấy supabase user_id từ session_state."""
        user = st.session_state.get("logged_in_user")
        return user.get("supabase_id") if user else None

    # ──────────────────────────────────────────────────────────────────────────
    # PETS
    # ──────────────────────────────────────────────────────────────────────────
    @staticmethod
    def init_history_state() -> None:
        """Không cần khởi tạo session_state nữa — dữ liệu lấy từ Supabase.
        Giữ lại để tương thích ngược với code cũ gọi hàm này."""
        pass

    @staticmethod
    def get_all_pets() -> List[Dict[str, Any]]:
        """Lấy toàn bộ hồ sơ thú cưng của người dùng đang đăng nhập từ Supabase."""
        user_id = HistoryService._get_current_user_id()
        if not user_id:
            return []
        try:
            db = get_client()
            resp = db.table("pets") \
                     .select("*") \
                     .eq("user_id", user_id) \
                     .order("created_at", desc=False) \
                     .execute()
            return resp.data or []
        except Exception as e:
            st.error(f"Lỗi khi tải danh sách thú cưng: {e}")
            return []

    @staticmethod
    def get_pet_by_id(pet_id: str) -> Optional[Dict[str, Any]]:
        """Tìm thông tin thú cưng theo ID."""
        try:
            db = get_client()
            resp = db.table("pets").select("*").eq("id", pet_id).single().execute()
            return resp.data
        except Exception:
            return None

    @staticmethod
    def add_new_pet(name: str, species: str, breed: str, age: str, weight: str, notes: str = "") -> Dict[str, Any]:
        """Thêm một hồ sơ thú cưng mới vào Supabase."""
        user_id = HistoryService._get_current_user_id()
        if not user_id:
            st.error("Vui lòng đăng nhập để thêm thú cưng.")
            return {}

        avatar = "🐶" if "Chó" in species else "🐱"

        new_pet = {
            "user_id": user_id,
            "name": name,
            "species": species,
            "breed": breed or "Chưa rõ",
            "age": age or "1 tuổi",
            "weight": f"{weight} kg" if weight else "Chưa cân",
            "avatar": avatar,
            "health_status": "Khỏe mạnh bình thường",
            "status_badge": "badge-success",
            "notes": notes or "Chưa có ghi chú bệnh lý."
        }

        try:
            db = get_client()
            resp = db.table("pets").insert(new_pet).execute()
            return resp.data[0] if resp.data else {}
        except Exception as e:
            st.error(f"Lỗi khi thêm thú cưng: {e}")
            return {}

    @staticmethod
    def update_pet_health(pet_id: str, health_status: str, status_badge: str) -> None:
        """Cập nhật trạng thái sức khỏe thú cưng sau chẩn đoán."""
        try:
            db = get_client()
            db.table("pets").update({
                "health_status": health_status,
                "status_badge": status_badge
            }).eq("id", pet_id).execute()
        except Exception as e:
            st.warning(f"Không thể cập nhật trạng thái thú cưng: {e}")

    # ──────────────────────────────────────────────────────────────────────────
    # DIAGNOSIS RECORDS
    # ──────────────────────────────────────────────────────────────────────────
    @staticmethod
    def get_diagnosis_history(pet_id: Optional[str] = None) -> List[Dict[str, Any]]:
        """Lấy lịch sử chẩn đoán từ Supabase kèm thông tin thú cưng (JOIN pets)."""
        user_id = HistoryService._get_current_user_id()
        if not user_id:
            return []
        try:
            db = get_client()
            # Lấy danh sách thú cưng của user để tạo fallback map name
            pets_list = HistoryService.get_all_pets()
            pet_dict = {p["id"]: p for p in pets_list}

            query = db.table("diagnosis_records") \
                      .select("*, pets(name, avatar, species, breed)") \
                      .eq("user_id", user_id) \
                      .order("created_at", desc=True)
            if pet_id:
                query = query.eq("pet_id", pet_id)
            resp = query.execute()
            records = resp.data or []
            # Định dạng lại ngày tháng và gán pet_name cho giao diện
            for rec in records:
                p_info = rec.get("pets") or pet_dict.get(rec.get("pet_id"), {})
                rec["pet_name"] = p_info.get("name", "Bé cưng") if p_info else "Bé cưng"
                rec["pet_avatar"] = p_info.get("avatar", "🐾") if p_info else "🐾"
                if rec.get("created_at"):
                    try:
                        dt = datetime.fromisoformat(rec["created_at"].replace("Z", "+00:00"))
                        rec["date"] = dt.strftime("%d/%m/%Y")
                        rec["day_label"] = f"Kiểm tra ngày {dt.strftime('%d/%m/%Y')}"
                    except Exception:
                        rec["date"] = rec.get("created_at", "")
                        rec["day_label"] = rec.get("date", "")
            return records
        except Exception as e:
            st.error(f"Lỗi khi tải lịch sử chẩn đoán: {e}")
            return []

    @staticmethod
    def save_diagnosis_record(
        pet_id: str,
        pet_name: str,
        diagnosis_result: Dict[str, Any],
        notes: str = "",
        pet_data: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Lưu kết quả chẩn đoán mới vào Supabase và cập nhật trạng thái thú cưng.
        Nếu pet_id là 'new_pet' hoặc chưa tồn tại UUID, tự động tạo hồ sơ thú cưng trước."""
        user_id = HistoryService._get_current_user_id()
        if not user_id:
            st.error("Vui lòng đăng nhập để lưu kết quả chẩn đoán.")
            return {}

        # Nếu là thú cưng mới nhập, tạo bản ghi trong bảng pets trước để có UUID hợp lệ
        if pet_id == "new_pet" or not pet_id or len(str(pet_id)) < 30:
            p_name = pet_name or (pet_data.get("name") if pet_data else "Bé cưng")
            p_species = pet_data.get("species", "Chó 🐶") if pet_data else "Chó 🐶"
            p_breed = pet_data.get("breed", "Chưa rõ") if pet_data else "Chưa rõ"
            p_age = pet_data.get("age", "1 tuổi") if pet_data else "1 tuổi"
            p_weight = pet_data.get("weight", "Chưa cân") if pet_data else "Chưa cân"
            created_pet = HistoryService.add_new_pet(
                name=p_name,
                species=p_species,
                breed=p_breed,
                age=p_age,
                weight=p_weight,
                notes=f"Tạo tự động từ ca khám AI ngày {datetime.now().strftime('%d/%m/%Y')}."
            )
            if created_pet and created_pet.get("id"):
                pet_id = created_pet["id"]
            else:
                st.error("Không thể tạo hồ sơ thú cưng mới để lưu lịch sử.")
                return {}

        record = {
            "pet_id": pet_id,
            "user_id": user_id,
            "disease_key": diagnosis_result.get("disease_key", ""),
            "disease_name_vi": diagnosis_result.get("disease_name_vi", "Chẩn đoán hình ảnh"),
            "disease_name_en": diagnosis_result.get("disease_name_en", "Skin Examination"),
            "confidence": float(diagnosis_result.get("confidence", 85.0)),
            "probabilities": diagnosis_result.get("probabilities", []),
            "recovery_score": 20 if diagnosis_result.get("severity_level") != "Nhẹ" else 75,
            "severity": diagnosis_result.get("severity_level", "Trung bình"),
            "severity_badge": diagnosis_result.get("severity_badge", "badge-warning"),
            "clinical_notes": notes or f"Chẩn đoán tự động từ PawDerm AI: {diagnosis_result.get('disease_name_vi', '')}",
            "treatment_applied": "Áp dụng khuyến nghị sơ cứu y khoa từ PawDerm AI.",
            "image_url": ""
        }

        try:
            db = get_client()
            resp = db.table("diagnosis_records").insert(record).execute()

            # Cập nhật trạng thái sức khỏe thú cưng
            HistoryService.update_pet_health(
                pet_id=pet_id,
                health_status=f"Phát hiện: {diagnosis_result.get('disease_name_vi', 'Cần theo dõi')}",
                status_badge=diagnosis_result.get("severity_badge", "badge-warning")
            )

            return resp.data[0] if resp.data else {}
        except Exception as e:
            st.error(f"Lỗi khi lưu kết quả chẩn đoán: {e}")
            return {}

    # ──────────────────────────────────────────────────────────────────────────
    # DASHBOARD METRICS
    # ──────────────────────────────────────────────────────────────────────────
    @staticmethod
    def get_dashboard_metrics() -> Dict[str, Any]:
        """Tính toán các chỉ số thống kê cho Dashboard từ Supabase."""
        pets = HistoryService.get_all_pets()
        history = HistoryService.get_diagnosis_history()

        active_treatments = sum(
            1 for p in pets
            if "theo dõi" in p.get("health_status", "").lower()
            or "phát hiện" in p.get("health_status", "").lower()
        )
        healthy_pets = len(pets) - active_treatments

        return {
            "total_pets": len(pets),
            "total_diagnoses": len(history),
            "active_treatments": active_treatments,
            "healthy_pets": max(0, healthy_pets)
        }


