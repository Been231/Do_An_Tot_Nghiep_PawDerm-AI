"""
PawDerm AI — Script Kiểm Tra Kết Nối Cơ Sở Dữ Liệu Supabase
Chạy: python backend/scripts/test_db_connection.py
"""
import sys
import io
import os
from pathlib import Path
from dotenv import load_dotenv

# Fix Windows console encoding
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

# Tìm .env ở thư mục backend hoặc root
script_dir = Path(__file__).resolve().parent
backend_dir = script_dir.parent
root_dir = backend_dir.parent

load_dotenv(backend_dir / ".env")
load_dotenv(root_dir / ".env")

print("=" * 60)
print("  🐾 PawDerm AI — Kiểm tra Kết nối Supabase PostgreSQL")
print("=" * 60)

url = os.getenv("SUPABASE_URL", "")
key = os.getenv("SUPABASE_ANON_KEY", "")

if not url or url == "https://xxxx.supabase.co":
    print("❌ Lỗi: SUPABASE_URL chưa được cấu hình trong .env")
    sys.exit(1)
if not key or key == "your-anon-public-key-here":
    print("❌ Lỗi: SUPABASE_ANON_KEY chưa được cấu hình trong .env")
    sys.exit(1)

print(f"✅ URL: {url}")
print(f"✅ Key: {key[:20]}...")
print()

try:
    from supabase import create_client
    db = create_client(url, key)

    # Test 1: Kiểm tra bảng users
    resp = db.table("users").select("*").limit(5).execute()
    print(f"✅ Bảng 'users': {len(resp.data)} bản ghi tìm thấy")
    for u in resp.data:
        role = u.get('role', 'customer (schema v1)')
        print(f"   → {u.get('username')} [{role}] (ID: {u.get('id')[:8]}...)")

    # Test 2: Kiểm tra bảng pets
    resp2 = db.table("pets").select("id").limit(1).execute()
    print(f"✅ Bảng 'pets': Kết nối OK")

    # Test 3: Kiểm tra bảng diagnosis_records
    resp3 = db.table("diagnosis_records").select("id").limit(1).execute()
    print(f"✅ Bảng 'diagnosis_records': Kết nối OK")

    # Test 4: Kiểm tra bảng appointments
    resp4 = db.table("appointments").select("id").limit(1).execute()
    print(f"✅ Bảng 'appointments': Kết nối OK")

    print()
    print("🎉 KẾT NỐI SUPABASE THÀNH CÔNG! HỆ THỐNG SẴN SÀNG.")
    print("   👉 Khởi động Backend API: cd backend && python main.py")
    print("   👉 Khởi động Frontend Web: cd frontend && npm run dev")

except Exception as e:
    print(f"❌ Lỗi kết nối: {e}")
    print()
    print("Gợi ý khắc phục:")
    print("  1. Kiểm tra SUPABASE_URL và SUPABASE_ANON_KEY trong backend/.env")
    print("  2. Chạy file backend/database/schema.sql trong Supabase SQL Editor")
    print("  3. Đảm bảo máy tính có kết nối mạng Internet ổn định")
