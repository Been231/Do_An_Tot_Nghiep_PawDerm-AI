"""
PawDerm AI — Script Khởi Tạo Dữ Liệu Mẫu (Seed Data) vào Supabase
Chạy: python backend/scripts/seed_data.py
"""
import sys
import io
from pathlib import Path

# Fix Windows console encoding
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

# Đảm bảo thư mục backend nằm trong sys.path
backend_dir = Path(__file__).resolve().parent.parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from app.database.supabase_client import get_client
from app.data.sample_history import DEFAULT_PETS, DEFAULT_DIAGNOSIS_HISTORY


def seed():
    db = get_client()
    print("🐾 Đang khởi tạo dữ liệu mẫu lên Supabase...")

    # 1. Tạo hoặc lấy tài khoản khachhang
    user_res = db.table("users").select("*").eq("username", "khachhang").execute()
    if not user_res.data:
        new_user = {
            "username": "khachhang",
            "password": "123",
            "full_name": "Nguyễn Văn Khách",
            "phone": "0901234567",
            "email": "khachhang@pawderm.vn",
            "address": "123 Nguyễn Văn Cừ, Quận 5, TP. Hồ Chí Minh"
        }
        user_res = db.table("users").insert(new_user).execute()
        print("✅ Đã tạo tài khoản mẫu: khachhang / 123")
    else:
        print("ℹ️ Tài khoản khachhang đã tồn tại.")

    user_id = user_res.data[0]["id"]

    # 2. Kiểm tra và thêm thú cưng mẫu
    pets_res = db.table("pets").select("*").eq("user_id", user_id).execute()
    pet_map = {}  # old_id -> new_uuid

    if not pets_res.data:
        for p in DEFAULT_PETS:
            pet_payload = {
                "user_id": user_id,
                "name": p["name"],
                "species": p["species"],
                "breed": p["breed"],
                "age": p["age"],
                "weight": p["weight"],
                "avatar": p["avatar"],
                "health_status": p["health_status"],
                "status_badge": p["status_badge"],
                "notes": p["notes"]
            }
            ins = db.table("pets").insert(pet_payload).execute()
            if ins.data:
                pet_map[p["id"]] = ins.data[0]["id"]
                print(f"✅ Đã thêm thú cưng: {p['name']}")
    else:
        print("ℹ️ Thú cưng của khachhang đã có sẵn.")
        for p in pets_res.data:
            if p["name"] == "Milo":
                pet_map["pet_001"] = p["id"]

    # 3. Thêm lịch sử chẩn đoán mẫu
    diag_res = db.table("diagnosis_records").select("id").eq("user_id", user_id).execute()
    if not diag_res.data and "pet_001" in pet_map:
        milo_uuid = pet_map["pet_001"]
        for d in DEFAULT_DIAGNOSIS_HISTORY:
            diag_payload = {
                "pet_id": milo_uuid,
                "user_id": user_id,
                "disease_key": "ringworm",
                "disease_name_vi": d["disease_name_vi"],
                "disease_name_en": d["disease_name_en"],
                "confidence": float(d["confidence"]),
                "probabilities": d.get("probabilities", []),
                "recovery_score": d.get("recovery_score", 50),
                "severity": d.get("severity", "Trung bình"),
                "severity_badge": d.get("severity_badge", "badge-warning"),
                "clinical_notes": d.get("clinical_notes", ""),
                "treatment_applied": d.get("treatment_applied", ""),
                "image_url": ""
            }
            db.table("diagnosis_records").insert(diag_payload).execute()
        print("✅ Đã nạp lịch sử chẩn đoán mẫu cho bé Milo.")
    else:
        print("ℹ️ Lịch sử chẩn đoán đã sẵn sàng.")

    print("\n🎉 Khởi tạo hoàn tất! Bạn có thể đăng nhập bằng tài khoản:")
    print("   👉 Tên đăng nhập: khachhang")
    print("   👉 Mật khẩu: 123")


if __name__ == "__main__":
    seed()
