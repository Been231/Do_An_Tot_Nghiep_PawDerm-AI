"""
Supabase Client — PawDerm AI
Khởi tạo kết nối Supabase một lần duy nhất (Singleton pattern).
Import `get_client()` hoặc `supabase` vào bất kỳ service nào cần truy cập database.
"""

import os
from pathlib import Path
from supabase import create_client, Client
from dotenv import load_dotenv

# Tìm file .env ở thư mục backend hoặc root
current_dir = Path(__file__).resolve().parent
backend_dir = current_dir.parent.parent
root_dir = backend_dir.parent

load_dotenv(backend_dir / ".env")
load_dotenv(root_dir / ".env")

_SUPABASE_URL: str = os.getenv("SUPABASE_URL", "")
_SUPABASE_KEY: str = os.getenv("SUPABASE_ANON_KEY", "")

# Kiểm tra cấu hình
if not _SUPABASE_URL or _SUPABASE_URL == "https://xxxx.supabase.co":
    raise RuntimeError(
        "❌ SUPABASE_URL chưa được cấu hình!\n"
        "   → Mở file .env và điền Project URL từ Supabase Dashboard → Settings → API"
    )

if not _SUPABASE_KEY or _SUPABASE_KEY == "your-anon-public-key-here":
    raise RuntimeError(
        "❌ SUPABASE_ANON_KEY chưa được cấu hình!\n"
        "   → Mở file .env và điền anon public key từ Supabase Dashboard → Settings → API"
    )

# Tạo client (singleton toàn ứng dụng)
supabase: Client = create_client(_SUPABASE_URL, _SUPABASE_KEY)


def get_client() -> Client:
    """Trả về Supabase Client đã được khởi tạo."""
    return supabase


def get_supabase_client() -> Client:
    """Bí danh cho get_client() để tương thích ngược."""
    return supabase
