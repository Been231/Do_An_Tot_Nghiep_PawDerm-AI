"""
PawDerm AI - Cấu hình Trung tâm Backend (FastAPI Core Config)
Quản lý các biến môi trường, đường dẫn lưu trữ và danh mục nghiệp vụ hệ thống.
"""

import os
from pathlib import Path
from dotenv import load_dotenv

# Thư mục Backend và Thư mục gốc dự án
BACKEND_DIR = Path(__file__).resolve().parent.parent.parent
ROOT_DIR = BACKEND_DIR.parent

# Load biến môi trường từ backend/.env hoặc root .env
load_dotenv(BACKEND_DIR / ".env")
load_dotenv(ROOT_DIR / ".env")

# Cấu hình đường dẫn lưu trữ
UPLOAD_DIR = ROOT_DIR / "uploads"
DATASET_DIR = ROOT_DIR / "dataset"
MODELS_DIR = ROOT_DIR / "models"

# Đảm bảo các thư mục cần thiết tồn tại
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
MODELS_DIR.mkdir(parents=True, exist_ok=True)

# -----------------------------------------------------------------------------
# CẤU HÌNH THÔNG TIN ỨNG DỤNG & METADATA
# -----------------------------------------------------------------------------
APP_NAME = "PawDerm AI"
APP_TAGLINE = "Hệ thống Trí tuệ Nhân tạo Hỗ trợ Chẩn đoán Bệnh Da liễu & Đề xuất Dịch vụ Y tế Thú cưng"
APP_ICON = "🐾"
API_VERSION = "2.0.0"

# -----------------------------------------------------------------------------
# CẤU HÌNH TÀI KHOẢN MẪU THỬ NGHIỆM
# -----------------------------------------------------------------------------
DEFAULT_USERS = {
    "khachhang": {
        "password": "123",
        "full_name": "Nguyễn Văn Khách",
        "phone": "0901234567",
        "email": "khachhang@pawderm.vn",
        "address": "123 Nguyễn Văn Cừ, Quận 5, TP. Hồ Chí Minh",
        "role": "customer"
    },
    "bacsi": {
        "password": "123",
        "full_name": "BS. CKII Nguyễn Thị Mai Hương",
        "phone": "0909876543",
        "email": "bacsi@pawcare.vn",
        "address": "Bệnh viện Thú Y PawCare TP. Hồ Chí Minh",
        "role": "doctor"
    },
    "admin": {
        "password": "123",
        "full_name": "Quản trị viên Hệ thống PawDerm",
        "phone": "0999888777",
        "email": "admin@pawderm.vn",
        "address": "Hệ thống Quản trị PawDerm AI",
        "role": "admin"
    }
}

# -----------------------------------------------------------------------------
# DANH MỤC LÂM SÀNG
# -----------------------------------------------------------------------------
PET_SPECIES_OPTIONS = ["Chó 🐶", "Mèo 🐱"]

COMMON_SYMPTOMS = [
    "Gãi ngứa liên tục",
    "Rụng lông từng mảng",
    "Vùng da ửng đỏ",
    "Bong vảy gàu trắng",
    "Có mụn mủ / lở loét",
    "Có mùi hôi khác thường"
]

ALLOWED_IMAGE_TYPES = ["jpg", "jpeg", "png"]
