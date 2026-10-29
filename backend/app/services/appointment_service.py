"""
PawDerm AI - Dịch vụ Quản lý Đặt Lịch Khám & Thanh Toán VietQR Tự Động
Quản lý lịch hẹn khám tại Bệnh viện Thú Y PawDerm:
1. Khách hàng đặt lịch khám (ngày, giờ, dịch vụ, thú cưng).
2. Tạo mã VietQR thanh toán thời gian thực với hạn 10 phút.
3. Tự động kiểm tra / xác nhận thanh toán (không cần nhân viên trung gian).
4. Khám sơ bộ bởi Bác sĩ chuyên khoa & Theo dõi dòng tiền bởi Quản trị viên (Admin).
"""

import os
import json
import uuid
import urllib.parse
from datetime import datetime, timedelta
from typing import Dict, Any, List, Optional
from app.database.supabase_service import get_supabase_client
from app.core.config import (
    VIETQR_BANK_ID,
    VIETQR_ACCOUNT_NO,
    VIETQR_ACCOUNT_NAME,
    PAYMENT_TIMEOUT_MINUTES
)

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

    # Bảng giá dịch vụ khám bệnh viện PawDerm
    SERVICE_PRICING = {
        "Khám da liễu chuyên sâu & Soi tươi vi nấm": 350000,
        "Khám sơ bộ & Hội chẩn sau kết quả AI": 200000,
        "Cấp cứu viêm da lở loét & Dị ứng cấp": 300000,
        "Tái khám & Đánh giá tiến độ hồi phục": 150000
    }
    DEFAULT_SERVICE_PRICE = 200000

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
    def generate_vietqr_url(cls, amount: int, memo: str) -> str:
        """Tạo URL VietQR chuẩn theo định dạng VietQR QuickLink (ảnh QR kèm số tiền & nội dung)."""
        encoded_memo = urllib.parse.quote(memo)
        encoded_name = urllib.parse.quote(VIETQR_ACCOUNT_NAME)
        return (
            f"https://img.vietqr.io/image/{VIETQR_BANK_ID}-{VIETQR_ACCOUNT_NO}-compact2.png"
            f"?amount={amount}&addInfo={encoded_memo}&accountName={encoded_name}"
        )

    @classmethod
    def _is_active_booking(cls, item: Dict[str, Any]) -> bool:
        """
        Kiểm tra xem lịch hẹn có đang giữ chỗ khung giờ hay không.
        - Bị hủy (cancelled) -> Không giữ chỗ.
        - Đã thanh toán (paid) -> Giữ chỗ.
        - Đang chờ thanh toán nhưng đã quá hạn 10 phút (expired) -> Tự động giải phóng chỗ.
        """
        if item.get("status") == "cancelled":
            return False
        
        # Nếu đã thanh toán thành công -> Luôn giữ chỗ
        if item.get("payment_status") == "paid":
            return True

        # Nếu đã bị đánh dấu hết hạn
        if item.get("payment_status") == "expired":
            return False

        # Kiểm tra thời gian hết hạn của phiên QR (10 phút)
        exp = item.get("payment_qr_expires_at")
        if exp:
            try:
                exp_dt = datetime.fromisoformat(exp)
                if datetime.now() > exp_dt:
                    return False
            except Exception:
                pass
        return True

    @classmethod
    def get_my_appointments(cls, user_id: str) -> List[Dict[str, Any]]:
        """Lấy danh sách lịch hẹn của một khách hàng thực tế và cập nhật trạng thái hết hạn tự động."""
        data = cls._load_data()
        if not user_id:
            return []
        
        updated = False
        now_dt = datetime.now()
        for a in data:
            if a.get("payment_status") == "pending_payment" and a.get("payment_qr_expires_at"):
                try:
                    exp_dt = datetime.fromisoformat(a["payment_qr_expires_at"])
                    if now_dt > exp_dt:
                        a["payment_status"] = "expired"
                        updated = True
                except Exception:
                    pass
        if updated:
            cls._save_data(data)

        matched = [a for a in data if str(a.get("user_id")) == str(user_id)]
        matched.sort(key=lambda x: x.get("created_at", ""), reverse=True)
        return matched

    @classmethod
    def get_doctor_appointments(cls) -> List[Dict[str, Any]]:
        """Lấy toàn bộ danh sách lịch hẹn để Bác sĩ xem và khám sơ bộ."""
        data = cls._load_data()
        data.sort(key=lambda x: x.get("created_at", ""), reverse=True)
        return data

    @classmethod
    def get_slot_availability(cls, appointment_date: str) -> Dict[str, Any]:
        """Kiểm tra số người đã đặt và chỗ còn lại cho 4 mốc giờ khám trong ngày (chỉ tính lịch hẹn còn hiệu lực)."""
        data = cls._load_data()
        slots_info = {}
        for slot in cls.TIME_SLOTS:
            booked = sum(
                1 for a in data
                if a.get("appointment_date") == appointment_date
                and a.get("appointment_time") == slot
                and cls._is_active_booking(a)
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
        """Khách hàng gửi yêu cầu đặt lịch khám tại Bệnh viện PawDerm và khởi tạo phiên thanh toán VietQR 10 phút."""
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
            and cls._is_active_booking(a)
        )
        if booked_count >= cls.MAX_SLOT_CAPACITY:
            raise ValueError(
                f"Khung giờ '{app_time}' ngày {app_date} đã đủ giới hạn {cls.MAX_SLOT_CAPACITY} người đặt. "
                "Vui lòng chọn khung giờ khác hoặc ngày khác!"
            )

        new_id = f"APT-{datetime.now().strftime('%Y%m%d')}-{len(data)+1:03d}"
        service_title = payload.get("service_title") or "Khám da liễu chuyên sâu & Soi tươi vi nấm"
        payment_amount = int(payload.get("payment_amount") or cls.SERVICE_PRICING.get(service_title, cls.DEFAULT_SERVICE_PRICE))
        payment_memo = f"PAWDERM {new_id}"
        
        # Thời hạn thanh toán QR mặc định là 10 phút
        expires_at = datetime.now() + timedelta(minutes=PAYMENT_TIMEOUT_MINUTES)
        vietqr_url = cls.generate_vietqr_url(payment_amount, payment_memo)

        new_item = {
            "id": new_id,
            "user_id": payload.get("user_id") or str(uuid.uuid4()),
            "owner_name": payload.get("owner_name") or "Khách hàng",
            "phone": (payload.get("phone") or "").strip(),
            "pet_id": payload.get("pet_id") or "",
            "pet_name": payload.get("pet_name") or "Bé cưng",
            "pet_species": payload.get("pet_species") or "Chó / Mèo",
            "service_title": service_title,
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
            "confirmed_at": None,
            # Các trường thanh toán trực tuyến VietQR
            "payment_status": "pending_payment",  # pending_payment | paid | expired
            "payment_amount": payment_amount,
            "payment_memo": payment_memo,
            "payment_qr_url": vietqr_url,
            "payment_qr_expires_at": expires_at.isoformat(),
            "paid_at": None,
            "payment_method": "VietQR Online",
            "bank_info": {
                "bank_id": VIETQR_BANK_ID,
                "account_no": VIETQR_ACCOUNT_NO,
                "account_name": VIETQR_ACCOUNT_NAME
            }
        }

        data.insert(0, new_item)
        cls._save_data(data)

        # Đồng bộ lưu thêm vào Supabase nếu có thể
        try:
            client = get_supabase_client()
            if client:
                try:
                    client.table("appointments").insert({
                        "id": new_item["id"],
                        "user_id": new_item["user_id"],
                        "owner_name": new_item["owner_name"],
                        "phone": new_item["phone"],
                        "pet_id": new_item["pet_id"],
                        "pet_name": new_item["pet_name"],
                        "pet_species": new_item["pet_species"],
                        "service_title": new_item["service_title"],
                        "appointment_date": new_item["appointment_date"],
                        "appointment_time": new_item["appointment_time"],
                        "status": new_item["status"],
                        "payment_status": new_item["payment_status"],
                        "payment_amount": new_item["payment_amount"],
                        "payment_memo": new_item["payment_memo"],
                        "payment_qr_url": new_item["payment_qr_url"],
                        "payment_qr_expires_at": new_item["payment_qr_expires_at"],
                        "created_at": new_item["created_at"]
                    }).execute()
                except Exception as ex_full:
                    # Fallback lưu các cột cơ bản nếu Supabase chưa chạy migration mới
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
    def get_payment_status(cls, appointment_id: str) -> Optional[Dict[str, Any]]:
        """Kiểm tra trạng thái thanh toán thời gian thực và thời gian còn lại của phiên QR (đếm ngược)."""
        data = cls._load_data()
        target = None
        for item in data:
            if item.get("id") == appointment_id:
                target = item
                break
        if not target:
            return None

        current_payment_status = target.get("payment_status", "pending_payment")
        exp_str = target.get("payment_qr_expires_at")
        remaining_seconds = 0
        is_expired = False

        if current_payment_status == "pending_payment" and exp_str:
            try:
                exp_dt = datetime.fromisoformat(exp_str)
                diff = (exp_dt - datetime.now()).total_seconds()
                if diff <= 0:
                    is_expired = True
                    target["payment_status"] = "expired"
                    cls._save_data(data)
                    current_payment_status = "expired"
                    remaining_seconds = 0
                else:
                    remaining_seconds = int(diff)
            except Exception:
                pass
        elif current_payment_status == "expired":
            is_expired = True
            remaining_seconds = 0
        elif current_payment_status == "paid":
            remaining_seconds = 0
            is_expired = False

        return {
            "appointment_id": appointment_id,
            "payment_status": current_payment_status,
            "status": target.get("status"),
            "remaining_seconds": remaining_seconds,
            "is_expired": is_expired,
            "payment_amount": target.get("payment_amount", cls.DEFAULT_SERVICE_PRICE),
            "payment_qr_url": target.get("payment_qr_url"),
            "payment_qr_expires_at": target.get("payment_qr_expires_at"),
            "paid_at": target.get("paid_at"),
            "payment_memo": target.get("payment_memo", f"PAWDERM {appointment_id}"),
            "pet_name": target.get("pet_name"),
            "service_title": target.get("service_title"),
            "appointment_date": target.get("appointment_date"),
            "appointment_time": target.get("appointment_time"),
            "bank_info": target.get("bank_info", {
                "bank_id": VIETQR_BANK_ID,
                "account_no": VIETQR_ACCOUNT_NO,
                "account_name": VIETQR_ACCOUNT_NAME
            })
        }

    @classmethod
    def regenerate_payment_qr(cls, appointment_id: str) -> Optional[Dict[str, Any]]:
        """Tạo lại mã VietQR mới và gia hạn thêm 10 phút khi mã cũ hết hạn."""
        data = cls._load_data()
        target = None
        for item in data:
            if item.get("id") == appointment_id:
                target = item
                break
        if not target:
            return None

        # Nếu đã thanh toán thì không cần tạo lại
        if target.get("payment_status") == "paid":
            return target

        amount = int(target.get("payment_amount") or cls.SERVICE_PRICING.get(target.get("service_title"), cls.DEFAULT_SERVICE_PRICE))
        memo = f"PAWDERM {target['id']}"
        expires_at = datetime.now() + timedelta(minutes=PAYMENT_TIMEOUT_MINUTES)

        target["payment_status"] = "pending_payment"
        target["payment_qr_expires_at"] = expires_at.isoformat()
        target["payment_memo"] = memo
        target["payment_qr_url"] = cls.generate_vietqr_url(amount, memo)
        target["bank_info"] = {
            "bank_id": VIETQR_BANK_ID,
            "account_no": VIETQR_ACCOUNT_NO,
            "account_name": VIETQR_ACCOUNT_NAME
        }

        cls._save_data(data)
        return target

    @classmethod
    def confirm_payment(cls, appointment_id: str, method: str = "VietQR Online") -> Optional[Dict[str, Any]]:
        """
        Xác nhận thanh toán thành công:
        - Tự động chuyển payment_status sang 'paid'.
        - Lưu thời gian thanh toán paid_at.
        - Khách hàng và Bác sĩ nhận được trạng thái Đã Thanh Toán ngay lập tức.
        """
        data = cls._load_data()
        target = None
        for item in data:
            if item.get("id") == appointment_id:
                target = item
                break
        if not target:
            return None

        target["payment_status"] = "paid"
        target["paid_at"] = datetime.now().isoformat()
        target["payment_method"] = method
        cls._save_data(data)

        # Đồng bộ trạng thái đã thanh toán sang Supabase
        try:
            client = get_supabase_client()
            if client:
                client.table("appointments").update({
                    "payment_status": "paid",
                    "paid_at": target["paid_at"],
                    "payment_method": method
                }).eq("id", target["id"]).execute()
        except Exception as e_sup:
            pass

        return target

    @classmethod
    def get_admin_transactions(cls) -> Dict[str, Any]:
        """Lấy danh sách toàn bộ các giao dịch chuyển khoản VietQR và thống kê dòng tiền cho Quản trị viên (Admin)."""
        data = cls._load_data()
        sorted_data = sorted(data, key=lambda x: x.get("created_at", ""), reverse=True)

        total_revenue = sum(
            item.get("payment_amount", 0)
            for item in sorted_data
            if item.get("payment_status") == "paid"
        )
        paid_count = sum(1 for item in sorted_data if item.get("payment_status") == "paid")
        pending_count = sum(1 for item in sorted_data if item.get("payment_status") == "pending_payment")
        expired_count = sum(1 for item in sorted_data if item.get("payment_status") == "expired")

        transactions = []
        for item in sorted_data:
            transactions.append({
                "appointment_id": item.get("id"),
                "owner_name": item.get("owner_name"),
                "phone": item.get("phone"),
                "pet_name": item.get("pet_name"),
                "service_title": item.get("service_title"),
                "appointment_date": item.get("appointment_date"),
                "appointment_time": item.get("appointment_time"),
                "payment_amount": item.get("payment_amount", cls.DEFAULT_SERVICE_PRICE),
                "payment_status": item.get("payment_status", "pending_payment"),
                "payment_method": item.get("payment_method", "VietQR Online"),
                "payment_memo": item.get("payment_memo", f"PAWDERM {item.get('id')}"),
                "created_at": item.get("created_at"),
                "paid_at": item.get("paid_at"),
                "payment_qr_expires_at": item.get("payment_qr_expires_at"),
                "status": item.get("status")
            })

        return {
            "total_revenue": total_revenue,
            "paid_count": paid_count,
            "pending_count": pending_count,
            "expired_count": expired_count,
            "total_transactions": len(transactions),
            "bank_info": {
                "bank_id": VIETQR_BANK_ID,
                "account_no": VIETQR_ACCOUNT_NO,
                "account_name": VIETQR_ACCOUNT_NAME
            },
            "transactions": transactions
        }

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
