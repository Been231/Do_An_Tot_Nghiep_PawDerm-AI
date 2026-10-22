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
    HOSPITAL_ADDRESS = "1A Lê Thị Xuyến, quận Thanh Khuê, Đà Nẵng"
    HOSPITAL_PHONE = "0795477302"
    HOSPITAL_HOURS = "8h-17h"
    
    # 4 mốc khung giờ khám bệnh viện chuẩn
    TIME_SLOTS = [
        "08:00 - 09:30",
        "09:30 - 11:00",
        "14:00 - 15:30",
        "15:30 - 17:00"
    ]
    
    # Giới hạn số người đặt tối đa cho mỗi khung giờ khám
    MAX_SLOT_CAPACITY = 12

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
        return []

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
        """Lấy danh sách lịch hẹn của một khách hàng thực tế (không trả dữ liệu mẫu)."""
        data = cls._load_data()
        if not user_id:
            return []
        matched = [a for a in data if str(a.get("user_id")) == str(user_id)]
        matched.sort(key=lambda x: x.get("created_at", ""), reverse=True)
        return matched

    @classmethod
    def get_doctor_appointments(cls) -> List[Dict[str, Any]]:
        """Lấy toàn bộ danh sách lịch hẹn để Bác sĩ xem và khám sơ bộ."""
        data = cls._load_data()
        # Sắp xếp lịch hẹn mới nhất lên đầu
        data.sort(key=lambda x: x.get("created_at", ""), reverse=True)
        return data

    @classmethod
    def get_slot_availability(cls, appointment_date: str) -> Dict[str, Any]:
        """Kiểm tra số người đã đặt và chỗ còn lại cho 4 mốc giờ khám trong ngày."""
        data = cls._load_data()
        slots_info = {}
        for slot in cls.TIME_SLOTS:
            booked = sum(
                1 for a in data
                if a.get("appointment_date") == appointment_date
                and a.get("appointment_time") == slot
                and a.get("status") != "cancelled"
            )
            available = max(0, cls.MAX_SLOT_CAPACITY - booked)
            slots_info[slot] = {
                "booked": booked,
                "max": cls.MAX_SLOT_CAPACITY,
                "available": available,
                "is_full": booked >= cls.MAX_SLOT_CAPACITY
            }
        return slots_info

    @classmethod
    def create_appointment(cls, payload: Dict[str, Any]) -> Dict[str, Any]:
        """Khách hàng gửi yêu cầu đặt lịch khám tại Bệnh viện PawDerm."""
        today_str = datetime.now().strftime("%Y-%m-%d")
        app_date = (payload.get("appointment_date") or today_str).strip()
        
        # 1. Kiểm tra ngày hẹn: Chỉ cho phép đặt ngày hiện tại và tương lai, không cho đặt ngày quá khứ
        if app_date < today_str:
            raise ValueError(f"Ngày hẹn khám ({app_date}) không thể là ngày trong quá khứ! Vui lòng chọn từ ngày hôm nay ({today_str}) trở đi.")

        # 2. Kiểm tra khung giờ và giới hạn 12 người/slot
        app_time = (payload.get("appointment_time") or cls.TIME_SLOTS[0]).strip()
        data = cls._load_data()
        
        booked_count = sum(
            1 for a in data
            if a.get("appointment_date") == app_date
            and a.get("appointment_time") == app_time
            and a.get("status") != "cancelled"
        )
        if booked_count >= cls.MAX_SLOT_CAPACITY:
            raise ValueError(
                f"Khung giờ '{app_time}' ngày {app_date} đã đủ giới hạn {cls.MAX_SLOT_CAPACITY} người đặt. "
                "Vui lòng chọn khung giờ khác hoặc ngày khác!"
            )

        new_id = f"APT-{datetime.now().strftime('%Y%m%d')}-{len(data)+1:03d}"

        new_item = {
            "id": new_id,
            "user_id": payload.get("user_id") or str(uuid.uuid4()),
            "owner_name": payload.get("owner_name") or "Khách hàng",
            "phone": (payload.get("phone") or "").strip(),
            "pet_id": payload.get("pet_id") or "",
            "pet_name": payload.get("pet_name") or "Bé cưng",
            "pet_species": payload.get("pet_species") or "Chó / Mèo",
            "service_title": payload.get("service_title") or "Khám da liễu tổng quát",
            "appointment_date": app_date,
            "appointment_time": app_time,
            "hospital_address": cls.HOSPITAL_ADDRESS,
            "hospital_phone": cls.HOSPITAL_PHONE,
            "hospital_hours": cls.HOSPITAL_HOURS,
            "notes": (payload.get("notes") or "").strip(),
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
