"""
PawDerm AI - Dịch vụ Quản lý Đặt Lịch Khám, Bốc Số Thứ Tự (STT) & Thanh Toán VietQR Tự Động
Quản lý lịch hẹn khám tại Bệnh viện Thú Y PawDerm:
1. Khách hàng đặt lịch khám (ngày, giờ, dịch vụ, thú cưng, đính kèm kết quả chẩn đoán AI).
2. Tự động cấp Số thứ tự bốc số (queue_number / queue_code: STT-01, STT-02...) theo từng ca trực.
3. Tạo mã VietQR thanh toán thời gian thực với hạn 10 phút.
4. Bác sĩ thú y trực quan hóa hàng đợi khám bệnh:
   - Biết chính xác thú cưng nào tới trước, thú cưng nào tới sau theo số thứ tự bốc số.
   - Hiển thị trực tiếp ảnh tổn thương da và kết quả chẩn đoán AI mà khách hàng đã quét.
   - Thao tác gọi số khám (in_progress), hội chẩn đối chiếu kết quả AI và hoàn tất ca khám.
5. Theo dõi dòng tiền bởi Quản trị viên (Admin).
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

# Thứ tự ưu tiên sắp xếp 4 ca khám trong ngày
SLOT_ORDER = {
    "08:00 - 09:30": 1,
    "09:30 - 11:00": 2,
    "14:00 - 15:30": 3,
    "15:30 - 17:00": 4
}


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
    def _normalize_item(cls, item: Dict[str, Any], all_items: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Chuẩn hóa dữ liệu lịch hẹn, đảm bảo luôn có số thứ tự bốc số STT."""
        if not item.get("queue_number"):
            # Tự động gán STT dựa theo thứ tự tạo trong cùng ca khám
            same_slot = [
                a for a in all_items
                if a.get("appointment_date") == item.get("appointment_date")
                and a.get("appointment_time") == item.get("appointment_time")
            ]
            same_slot_sorted = sorted(same_slot, key=lambda x: x.get("created_at") or "")
            try:
                idx = same_slot_sorted.index(item) + 1
            except ValueError:
                idx = 1
            item["queue_number"] = idx
            item["queue_code"] = f"STT-{idx:02d}"
        elif not item.get("queue_code"):
            item["queue_code"] = f"STT-{item['queue_number']:02d}"

        # Đảm bảo trường AI luôn tồn tại
        if "ai_disease_name" not in item:
            item["ai_disease_name"] = ""
        if "ai_confidence" not in item:
            item["ai_confidence"] = 0.0
        if "ai_image_url" not in item:
            item["ai_image_url"] = ""
        if "ai_probabilities" not in item:
            item["ai_probabilities"] = []

        return item

    @classmethod
    def _load_data(cls) -> List[Dict[str, Any]]:
        cls._ensure_dir()
        if os.path.exists(APPOINTMENTS_FILE):
            try:
                with open(APPOINTMENTS_FILE, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    if isinstance(data, list):
                        # Chuẩn hóa STT cho các bản ghi cũ
                        for item in data:
                            cls._normalize_item(item, data)
                        return data
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
    def get_doctor_appointments(
        cls,
        date: Optional[str] = None,
        time_slot: Optional[str] = None,
        status: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """
        Lấy danh sách lịch hẹn để Bác sĩ xem và khám sơ bộ.
        SẮP XẾP CHUẨN Y KHOA:
        1. Ngày khám (appointment_date) gần nhất trước.
        2. Khung giờ khám (appointment_time) theo ca sáng -> ca chiều.
        3. Thứ tự bốc số STT (queue_number): STT-01 -> STT-02 -> STT-03 (ai tới trước lên trước).
        """
        data = cls._load_data()
        
        # Lọc theo ngày nếu có
        if date and date.strip() and date != "all":
            target_date = date.strip()
            data = [a for a in data if a.get("appointment_date") == target_date]

        # Lọc theo khung giờ nếu có
        if time_slot and time_slot.strip() and time_slot != "all":
            target_slot = time_slot.strip()
            data = [a for a in data if a.get("appointment_time") == target_slot]

        # Lọc theo trạng thái
        if status and status.strip() and status != "all":
            st = status.strip()
            if st == "paid":
                data = [a for a in data if a.get("payment_status") == "paid"]
            else:
                data = [a for a in data if a.get("status") == st]

        # Thuật toán sắp xếp thứ tự tới trước / tới sau
        def sort_key(item):
            d = item.get("appointment_date") or "9999-99-99"
            slot_idx = SLOT_ORDER.get(item.get("appointment_time"), 99)
            # Ca đang trong phòng khám (in_progress) ưu tiên hàng đầu trong ca
            status_weight = 0 if item.get("status") == "in_progress" else (1 if item.get("status") == "pending" else 2)
            stt = item.get("queue_number") or 999
            return (d, slot_idx, status_weight, stt, item.get("created_at") or "")

        data.sort(key=sort_key)
        return data

    @classmethod
    def get_doctor_queue_summary(cls, date: Optional[str] = None) -> Dict[str, Any]:
        """Thống kê hàng đợi bốc số dành cho Bác sĩ trực phòng khám."""
        data = cls._load_data()
        today_str = datetime.now().strftime("%Y-%m-%d")
        target_date = date.strip() if date and date.strip() and date != "all" else today_str

        # Lọc các ca trong ngày mục tiêu
        day_items = [a for a in data if a.get("appointment_date") == target_date and a.get("status") != "cancelled"]
        day_items.sort(key=lambda x: (SLOT_ORDER.get(x.get("appointment_time"), 99), x.get("queue_number", 999)))

        # Ca đang khám trong phòng (in_progress)
        in_progress_items = [a for a in day_items if a.get("status") == "in_progress"]
        current_calling = in_progress_items[0] if in_progress_items else None

        # Ca tiếp theo đang chờ đến lượt (pending)
        pending_items = [a for a in day_items if a.get("status") == "pending"]
        next_in_line = pending_items[0] if pending_items else None

        total_booked = len(day_items)
        paid_count = sum(1 for a in day_items if a.get("payment_status") == "paid")
        completed_count = sum(1 for a in day_items if a.get("status") in ["confirmed", "completed"])

        return {
            "target_date": target_date,
            "total_booked": total_booked,
            "paid_count": paid_count,
            "waiting_count": len(pending_items),
            "in_progress_count": len(in_progress_items),
            "completed_count": completed_count,
            "current_calling": current_calling,
            "next_in_line": next_in_line
        }

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
                "is_full": booked >= cls.MAX_SLOT_CAPACITY,
                "next_queue_number": booked + 1,
                "next_queue_code": f"STT-{booked + 1:02d}"
            }
        return slots_info

    @classmethod
    def create_appointment(cls, payload: Dict[str, Any]) -> Dict[str, Any]:
        """Khách hàng gửi yêu cầu đặt lịch khám tại Bệnh viện PawDerm và bốc số thứ tự STT."""
        today_str = datetime.now().strftime("%Y-%m-%d")
        app_date = (payload.get("appointment_date") or today_str).strip()
        
        # 1. Kiểm tra ngày hẹn: Chỉ cho phép đặt ngày hiện tại và tương lai
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

        # 3. Tính số thứ tự bốc số (Queue Number) tăng dần trong khung giờ đó
        max_stt = 0
        for a in data:
            if a.get("appointment_date") == app_date and a.get("appointment_time") == app_time:
                q_num = a.get("queue_number")
                if isinstance(q_num, int) and q_num > max_stt:
                    max_stt = q_num
        queue_number = max_stt + 1
        queue_code = f"STT-{queue_number:02d}"

        new_id = f"APT-{datetime.now().strftime('%Y%m%d')}-{len(data)+1:03d}"
        service_title = payload.get("service_title") or "Khám da liễu chuyên sâu & Soi tươi vi nấm"
        payment_amount = int(payload.get("payment_amount") or cls.SERVICE_PRICING.get(service_title, cls.DEFAULT_SERVICE_PRICE))
        payment_memo = f"PAWDERM {new_id}"
        
        # Thời hạn thanh toán QR mặc định là 10 phút
        expires_at = datetime.now() + timedelta(minutes=PAYMENT_TIMEOUT_MINUTES)
        vietqr_url = cls.generate_vietqr_url(payment_amount, payment_memo)

        # 4. Thu thập dữ liệu chẩn đoán AI gắn kèm (nếu khách chuyển từ quét AI sang)
        ai_diag_id = str(payload.get("ai_diagnosis_id") or payload.get("diagnosis_id") or "").strip()
        ai_disease_name = str(payload.get("ai_disease_name") or payload.get("disease_name") or "").strip()
        ai_confidence = float(payload.get("ai_confidence") or 0.0)
        ai_image_url = str(payload.get("ai_image_url") or payload.get("image_url") or "").strip()
        ai_probabilities = payload.get("ai_probabilities") or []
        ai_severity = str(payload.get("ai_severity") or payload.get("severity_level") or "").strip()

        # Nếu chưa có nhưng có pet_id, thử tìm bệnh án AI gần nhất của bé
        if not ai_disease_name and payload.get("pet_id"):
            try:
                from app.database.supabase_service import SupabaseService
                hist = SupabaseService.get_diagnosis_history(pet_id=payload.get("pet_id"))
                if hist and len(hist) > 0:
                    latest = hist[0]
                    ai_diag_id = str(latest.get("id") or "")
                    ai_disease_name = str(latest.get("disease_name_vi") or "")
                    ai_confidence = float(latest.get("confidence") or 0.0)
                    ai_image_url = str(latest.get("image_url") or "")
                    ai_probabilities = latest.get("probabilities") or []
                    ai_severity = str(latest.get("severity") or "")
            except Exception:
                pass

        new_item = {
            "id": new_id,
            "queue_number": queue_number,
            "queue_code": queue_code,
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
            "status": "pending",  # pending | in_progress | confirmed | completed | cancelled
            "doctor_id": payload.get("doctor_id") or "",
            "doctor_name": payload.get("doctor_name") or "BS. CKII Nguyễn Thị Mai Hương",
            "doctor_pre_diagnosis": "",
            "severity_level": "Chờ bác sĩ tiếp nhận",
            "doctor_advice": "",
            "clinical_tests": [],
            "doctor_prescription_notes": "",
            "created_at": datetime.now().isoformat(),
            "confirmed_at": None,
            "called_at": None,
            "completed_at": None,
            # Kết quả AI chẩn đoán đính kèm
            "ai_diagnosis_id": ai_diag_id,
            "ai_disease_name": ai_disease_name,
            "ai_confidence": ai_confidence,
            "ai_image_url": ai_image_url,
            "ai_probabilities": ai_probabilities,
            "ai_severity": ai_severity,
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
                sup_user_id = new_item.get("user_id")
                try:
                    uuid.UUID(str(sup_user_id))
                except Exception:
                    sup_user_id = "8cb7a542-dc84-4ad1-97b5-94a2a72e24d7"

                apt_sup_payload = {
                    "user_id": sup_user_id,
                    "owner_name": new_item["owner_name"],
                    "phone": new_item["phone"],
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
                }
                # Thử thêm các cột mở rộng nếu schema Supabase đã có
                for col in ["queue_number", "queue_code", "ai_disease_name", "ai_confidence", "ai_image_url"]:
                    if col in new_item:
                        apt_sup_payload[col] = new_item[col]

                try:
                    sup_res = client.table("appointments").insert(apt_sup_payload).execute()
                    if sup_res.data:
                        new_item["supabase_id"] = sup_res.data[0].get("id")
                except Exception:
                    # Fallback lưu các cột cơ bản vào bảng appointments hiện có trên Supabase
                    try:
                        basic_payload = {
                            "user_id": sup_user_id,
                            "pet_name": new_item["pet_name"],
                            "service_title": new_item["service_title"],
                            "status": "pending"
                        }
                        sup_res = client.table("appointments").insert(basic_payload).execute()
                        if sup_res.data:
                            new_item["supabase_id"] = sup_res.data[0].get("id")
                    except Exception:
                        pass
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
            "queue_number": target.get("queue_number", 1),
            "queue_code": target.get("queue_code", "STT-01"),
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
                up_payload = {
                    "payment_status": "paid",
                    "paid_at": target["paid_at"],
                    "payment_method": method
                }
                if target.get("supabase_id"):
                    client.table("appointments").update(up_payload).eq("id", target["supabase_id"]).execute()
                elif target.get("payment_memo"):
                    client.table("appointments").update(up_payload).eq("payment_memo", target["payment_memo"]).execute()
        except Exception:
            pass

        return target

    @classmethod
    def call_patient(cls, appointment_id: str) -> Optional[Dict[str, Any]]:
        """Bác sĩ bấm gọi bệnh nhân vào phòng khám (chuyển sang in_progress)."""
        data = cls._load_data()
        target = None
        for item in data:
            if item.get("id") == appointment_id:
                target = item
                break
        if not target:
            return None

        target["status"] = "in_progress"
        target["called_at"] = datetime.now().isoformat()
        cls._save_data(data)
        return target

    @classmethod
    def submit_pre_diagnosis(cls, appointment_id: str, payload: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """
        Bác sĩ khám sơ bộ & hội chẩn đối chiếu kết quả chẩn đoán AI:
        - Lưu chẩn đoán lâm sàng của Bác sĩ (doctor_pre_diagnosis).
        - Lưu mức độ nghiêm trọng (severity_level).
        - Lưu các chỉ định xét nghiệm cận lâm sàng (clinical_tests).
        - Lưu lời dặn dò y tế cho chủ nuôi (doctor_advice).
        - Tự động đồng bộ cập nhật sang diagnosis_records nếu ca hẹn có gắn kết quả AI!
        """
        data = cls._load_data()
        target = None
        for item in data:
            if item.get("id") == appointment_id:
                target = item
                break

        if not target:
            return None

        now_iso = datetime.now().isoformat()
        target["doctor_id"] = payload.get("doctor_id") or target.get("doctor_id") or "doc-001"
        target["doctor_name"] = payload.get("doctor_name") or target.get("doctor_name") or "BS. CKII Nguyễn Thị Mai Hương"
        target["doctor_pre_diagnosis"] = payload.get("doctor_pre_diagnosis") or target.get("doctor_pre_diagnosis") or "Viêm da tiếp xúc"
        target["severity_level"] = payload.get("severity_level") or "Trung bình - Cần đến viện soi vi nấm"
        target["doctor_advice"] = payload.get("doctor_advice") or "Đeo loa chống liếm và đưa bé đến phòng khám đúng giờ hẹn."
        target["clinical_tests"] = payload.get("clinical_tests") or []
        target["doctor_prescription_notes"] = payload.get("doctor_prescription_notes") or ""
        target["review_status"] = payload.get("review_status") or "agreed"  # 'agreed' | 'corrected'
        target["status"] = payload.get("status") or "confirmed"
        target["confirmed_at"] = now_iso

        cls._save_data(data)

        # Đồng bộ sang Supabase / doctor_reviews_store nếu có liên kết AI
        ai_rec_id = target.get("ai_diagnosis_id")
        if ai_rec_id:
            try:
                from app.database.supabase_service import SupabaseService
                rev_status = payload.get("review_status") or "agreed"
                corrected_dis = target["doctor_pre_diagnosis"] if rev_status == "corrected" else ""
                SupabaseService.submit_doctor_review(
                    record_id=ai_rec_id,
                    doctor_id=target["doctor_id"],
                    doctor_name=target["doctor_name"],
                    review_status=rev_status,
                    corrected_disease=corrected_dis,
                    notes=f"Hội chẩn trực tiếp tại viện qua lịch hẹn #{target.get('id')}: {target.get('doctor_advice')}"
                )
            except Exception as e_rev:
                print("Lỗi đồng bộ sang diagnosis_records:", e_rev)

        return target

    @classmethod
    def update_status(cls, appointment_id: str, new_status: str) -> bool:
        """Cập nhật trạng thái lịch hẹn: pending | in_progress | confirmed | completed | cancelled."""
        data = cls._load_data()
        for item in data:
            if item.get("id") == appointment_id:
                item["status"] = new_status
                now_iso = datetime.now().isoformat()
                if new_status == "in_progress":
                    item["called_at"] = now_iso
                elif new_status == "completed":
                    item["completed_at"] = now_iso
                cls._save_data(data)
                return True
        return False

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
                "queue_code": item.get("queue_code", "STT-01"),
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
