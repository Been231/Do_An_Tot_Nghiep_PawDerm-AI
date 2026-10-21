"""
PawDerm AI - Dịch vụ Quản lý Đặt Lịch Khám & Khám Sơ Bộ Bác Sĩ
Quản lý lịch hẹn khám tại Bệnh viện Thú Y PawDerm:
1. Khách hàng đặt lịch khám (ngày, giờ, dịch vụ, triệu chứng).
2. Bác sĩ thú y tiếp nhận, khám sơ bộ và đưa ra dự đoán bệnh cùng lời dặn trước khi đến viện.
"""

import os
import json
import uuid
from datetime import datetime
from typing import Dict, Any, List, Optional
from app.database.supabase_service import get_supabase_client

APPOINTMENTS_FILE = os.path.join(os.path.dirname(__file__), "..", "data", "appointments_store.json")

class AppointmentService:
    @classmethod
    def _ensure_dir(cls):
        os.makedirs(os.path.dirname(APPOINTMENTS_FILE), exist_ok=True)

    @classmethod
    def _load_data(cls) -> List[Dict[str, Any]]:
        cls._ensure_dir()
        if os.path.exists(APPOINTMENTS_FILE):
            try:
                with open(APPOINTMENTS_FILE, "r", encoding="utf-8") as f:
                    return json.load(f)
            except Exception as e:
                print("Lỗi đọc appointments_store.json:", e)

        # Dữ liệu khởi tạo mẫu thực tế
        default_appointments = [
            {
                "id": "APT-2026-001",
                "user_id": "fab47e09-941f-49fa-86d0-650b3acf3c0d",
                "owner_name": "Nguyễn Văn Khách",
                "phone": "0901234567",
                "pet_id": "pet-corgi-01",
                "pet_name": "Mochi",
                "pet_species": "Chó Corgi 🐶",
                "service_title": "Khám da liễu chuyên sâu & Soi tươi vi nấm",
                "appointment_date": "2026-10-23",
                "appointment_time": "09:30 - 10:30",
                "hospital_address": "Bệnh viện Thú Y PawDerm, 123 Nguyễn Văn Cừ, Quận 5, TP.HCM",
                "notes": "Vùng tai và sống mũi rụng lông tròn như đồng xu, bé gãi đỏ da nhiều về đêm.",
                "status": "confirmed",  # pending | confirmed | completed | cancelled
                "doctor_id": "doc-001",
                "doctor_name": "BS. CKII Nguyễn Thị Mai Hương",
                "doctor_pre_diagnosis": "Nghi ngờ Nhiễm nấm da sợi khoáng (Ringworm / Dermatophytosis)",
                "severity_level": "Trung bình - Cần soi kính hiển vi",
                "doctor_advice": "Không tắm xà phòng hoặc bôi thuốc mỡ có màu trong 24h trước khi đến viện để cạo vảy soi nấm chính xác. Đeo loa chống liếm tránh làm tổn thương lan rộng.",
                "created_at": "2026-10-20T10:15:00",
                "confirmed_at": "2026-10-20T11:30:00"
            },
            {
                "id": "APT-2026-002",
                "user_id": "fab47e09-941f-49fa-86d0-650b3acf3c0d",
                "owner_name": "Nguyễn Văn Khách",
                "phone": "0901234567",
                "pet_id": "pet-cat-02",
                "pet_name": "Miu Miu",
                "pet_species": "Mèo Anh lông ngắn 🐱",
                "service_title": "Khám sơ bộ & Hội chẩn sau kết quả AI",
                "appointment_date": "2026-10-24",
                "appointment_time": "14:00 - 15:00",
                "hospital_address": "Bệnh viện Thú Y PawDerm, 123 Nguyễn Văn Cừ, Quận 5, TP.HCM",
                "notes": "Da vùng bụng nổi mẩn đỏ sau khi đổi sang thức ăn hạt mới, AI báo 85% Viêm da dị ứng.",
                "status": "pending",
                "doctor_id": "",
                "doctor_name": "Bác sĩ phụ trách lâm sàng PawDerm",
                "doctor_pre_diagnosis": "",
                "severity_level": "Chờ bác sĩ thẩm định",
                "doctor_advice": "",
                "created_at": "2026-10-21T08:30:00",
                "confirmed_at": None
            }
        ]
        cls._save_data(default_appointments)
        return default_appointments

    @classmethod
    def _save_data(cls, data: List[Dict[str, Any]]):
        cls._ensure_dir()
        try:
            with open(APPOINTMENTS_FILE, "w", encoding="utf-8") as f:
                json.dump(data, f, ensure_ascii=False, indent=2)
        except Exception as e:
            print("Lỗi lưu appointments_store.json:", e)

    @classmethod
    def get_my_appointments(cls, user_id: str) -> List[Dict[str, Any]]:
        """Lấy danh sách lịch hẹn của một khách hàng."""
        data = cls._load_data()
        if not user_id:
            return data
        # Lọc theo user_id, nếu không có user_id cụ thể thì trả về các lịch hẹn mẫu để trải nghiệm
        matched = [a for a in data if str(a.get("user_id")) == str(user_id)]
        return matched if matched else data

    @classmethod
    def get_doctor_appointments(cls) -> List[Dict[str, Any]]:
        """Lấy toàn bộ danh sách lịch hẹn để Bác sĩ xem và khám sơ bộ."""
        data = cls._load_data()
        # Sắp xếp lịch hẹn mới nhất lên đầu
        data.sort(key=lambda x: x.get("created_at", ""), reverse=True)
        return data

    @classmethod
    def create_appointment(cls, payload: Dict[str, Any]) -> Dict[str, Any]:
        """Khách hàng gửi yêu cầu đặt lịch khám tại Bệnh viện PawDerm."""
        data = cls._load_data()
        new_id = f"APT-{datetime.now().strftime('%Y%m%d')}-{len(data)+1:03d}"

        new_item = {
            "id": new_id,
            "user_id": payload.get("user_id") or str(uuid.uuid4()),
            "owner_name": payload.get("owner_name") or "Khách hàng",
            "phone": payload.get("phone") or "",
            "pet_id": payload.get("pet_id") or "",
            "pet_name": payload.get("pet_name") or "Bé cưng",
            "pet_species": payload.get("pet_species") or "Chó / Mèo",
            "service_title": payload.get("service_title") or "Khám da liễu tổng quát",
            "appointment_date": payload.get("appointment_date") or datetime.now().strftime("%Y-%m-%d"),
            "appointment_time": payload.get("appointment_time") or "09:30 - 10:30",
            "hospital_address": "Bệnh viện Thú Y PawDerm, 123 Nguyễn Văn Cừ, Quận 5, TP.HCM",
            "notes": payload.get("notes") or "",
            "status": "pending",
            "doctor_id": payload.get("doctor_id") or "",
            "doctor_name": payload.get("doctor_name") or "BS. CKII Nguyễn Thị Mai Hương",
            "doctor_pre_diagnosis": "",
            "severity_level": "Chờ bác sĩ tiếp nhận",
            "doctor_advice": "",
            "created_at": datetime.now().isoformat(),
            "confirmed_at": None
        }

        data.insert(0, new_item)
        cls._save_data(data)

        # Đồng bộ lưu thêm vào Supabase nếu có thể
        try:
            client = get_supabase_client()
            if client:
                client.table("appointments").insert({
                    "user_id": new_item["user_id"],
                    "pet_name": new_item["pet_name"],
                    "service_title": new_item["service_title"],
                    "status": "pending"
                }).execute()
        except Exception as e:
            print("Ghi chú: Lưu Supabase fallback sang JSON store:", e)

        return new_item

    @classmethod
    def submit_pre_diagnosis(cls, appointment_id: str, payload: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Bác sĩ khám sơ bộ, đưa ra dự đoán bệnh và lời dặn hướng dẫn trước khi khách đến viện."""
        data = cls._load_data()
        target = None
        for item in data:
            if item.get("id") == appointment_id:
                target = item
                break

        if not target:
            return None

        target["doctor_id"] = payload.get("doctor_id") or target.get("doctor_id") or "doc-001"
        target["doctor_name"] = payload.get("doctor_name") or target.get("doctor_name") or "BS. CKII Nguyễn Thị Mai Hương"
        target["doctor_pre_diagnosis"] = payload.get("doctor_pre_diagnosis") or target.get("doctor_pre_diagnosis") or "Viêm da tiếp xúc"
        target["severity_level"] = payload.get("severity_level") or "Cần theo dõi sát"
        target["doctor_advice"] = payload.get("doctor_advice") or "Đeo loa chống liếm và đưa bé đến phòng khám đúng giờ hẹn."
        target["status"] = payload.get("status") or "confirmed"
        target["confirmed_at"] = datetime.now().isoformat()

        cls._save_data(data)
        return target

    @classmethod
    def update_status(cls, appointment_id: str, new_status: str) -> bool:
        """Cập nhật trạng thái lịch hẹn: confirmed | completed | cancelled."""
        data = cls._load_data()
        for item in data:
            if item.get("id") == appointment_id:
                item["status"] = new_status
                if new_status == "completed":
                    item["completed_at"] = datetime.now().isoformat()
                cls._save_data(data)
                return True
        return False
