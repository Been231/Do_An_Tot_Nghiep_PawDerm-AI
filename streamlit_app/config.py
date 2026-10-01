"""
Cấu hình tổng thể hệ thống PawDerm AI
Chứa thông tin metadata đề tài, cài đặt giao diện, hệ thống CSS Web sáng sủa, ấm áp, chuẩn đề tài Chó & Mèo.
"""

import os
from pathlib import Path
from dotenv import load_dotenv

# Load biến môi trường từ .env (chứa SUPABASE_URL, SUPABASE_ANON_KEY)
load_dotenv()

# Thư mục gốc dự án
BASE_DIR = Path(__file__).resolve().parent

UPLOAD_DIR = BASE_DIR / "uploads"
DATASET_DIR = BASE_DIR / "dataset"

# Đảm bảo thư mục upload tồn tại
UPLOAD_DIR.mkdir(exist_ok=True)

# -----------------------------------------------------------------------------
# CẤU HÌNH THÔNG TIN ỨNG DỤNG & GIAO DIỆN
# -----------------------------------------------------------------------------
APP_NAME = "PawDerm AI"
APP_TAGLINE = "Hệ thống Trí tuệ Nhân tạo Hỗ trợ Chẩn đoán Bệnh Da liễu & Đề xuất Dịch vụ Y tế Thú cưng"
APP_ICON = "🐾"
PAGE_LAYOUT = "wide"

# -----------------------------------------------------------------------------
# CẤU HÌNH TÀI KHOẢN MẪU THỬ NGHIỆM
# -----------------------------------------------------------------------------
DEFAULT_USERS = {
    "khachhang": {
        "password": "123",
        "full_name": "Nguyễn Văn Khách",
        "phone": "0901234567",
        "email": "khachhang@pawderm.vn",
        "address": "123 Nguyễn Văn Cừ, Quận 5, TP. Hồ Chí Minh"
    }
}

# -----------------------------------------------------------------------------
# DANH MỤC LÂM SÀNG
# -----------------------------------------------------------------------------
PET_SPECIES_OPTIONS = ["Chó 🐶", "Mèo 🐱"]

COMMON_SYMPTOMS = [
    "Không có",
    "Gãi ngứa",
    "Rụng lông",
    "Đốm tròn rụng lông",
    "Đỏ da",
    "Vảy gàu",
    "Da sần sùi",
    "Mụn mủ",
    "Chảy dịch",
    "Mùi hôi tanh",
    "Ve rận",
    "Liếm cắn liên tục"
]

ALLOWED_IMAGE_TYPES = ["jpg", "jpeg", "png"]

# -----------------------------------------------------------------------------
# HỆ THỐNG CSS WEB TƯƠI SÁNG, ẤM ÁP, THÂN THIỆN ĐỀ TÀI CHÓ MÈO (WARM PET-CARE THEME)
# -----------------------------------------------------------------------------
CUSTOM_WEB_CSS = """
<style>
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

/* ÉP TOÀN BỘ NỀN VÀ KHUNG GIAO DIỆN VỀ MÀU SÁNG ẤM ÁP (TRIỆT TIÊU DARK MODE) */
html, body, [data-testid="stAppViewContainer"], .stApp {
    background-color: #fdfbf7 !important;
    color: #292524 !important;
    font-family: 'Plus Jakarta Sans', sans-serif !important;
}

[data-testid="stHeader"] {
    background-color: #fdfbf7 !important;
}

/* SIDEBAR MÀU BE SỮA SÁNG SỦA, SANG TRỌNG */
[data-testid="stSidebar"], section[data-testid="stSidebar"] {
    background-color: #f5f0e6 !important;
    border-right: 1.5px solid #e7ded0 !important;
}

[data-testid="stSidebar"] * {
    color: #292524 !important;
}

[data-testid="stSidebar"] .stRadio label {
    font-weight: 600 !important;
    color: #44403c !important;
}

/* KHUNG NỘI DUNG CHÍNH */
.main .block-container {
    padding-top: 2rem !important;
    padding-bottom: 3.5rem !important;
    max-width: 1240px !important;
}

/* HỆ THỐNG NÚT BẤM MÀU CAM ẤM ÁP THÂN THIỆN THÚ CƯNG */
.stButton > button[kind="primary"] {
    background: linear-gradient(135deg, #f97316 0%, #ea580c 100%) !important;
    color: #ffffff !important;
    border: none !important;
    border-radius: 14px !important;
    padding: 11px 24px !important;
    font-weight: 700 !important;
    font-size: 15px !important;
    letter-spacing: 0.3px !important;
    box-shadow: 0 4px 16px rgba(249, 115, 22, 0.35) !important;
    transition: all 0.25s ease !important;
}

.stButton > button[kind="primary"]:hover {
    background: linear-gradient(135deg, #ea580c 0%, #c2410c 100%) !important;
    box-shadow: 0 8px 24px rgba(249, 115, 22, 0.45) !important;
    transform: translateY(-2px) !important;
}

.stButton > button[kind="secondary"], .stButton > button:not([kind="primary"]) {
    background: #ffffff !important;
    color: #44403c !important;
    border: 1.5px solid #e5dfd3 !important;
    border-radius: 14px !important;
    padding: 10px 22px !important;
    font-weight: 600 !important;
    font-size: 14px !important;
    box-shadow: 0 2px 6px rgba(180, 160, 140, 0.06) !important;
    transition: all 0.25s ease !important;
}

.stButton > button:not([kind="primary"]):hover {
    background: #fffbf5 !important;
    border-color: #f97316 !important;
    color: #ea580c !important;
    transform: translateY(-1px) !important;
    box-shadow: 0 4px 12px rgba(249, 115, 22, 0.15) !important;
}

/* CARD CONTAINER MÀU TRẮNG TINH TRÊN NỀN KEM */
.web-card {
    background: #ffffff !important;
    border-radius: 20px !important;
    padding: 24px !important;
    border: 1.5px solid #eee7db !important;
    box-shadow: 0 4px 20px rgba(180, 160, 140, 0.08) !important;
    margin-bottom: 22px !important;
    transition: all 0.25s ease !important;
}

.web-card:hover {
    box-shadow: 0 12px 30px rgba(249, 115, 22, 0.12) !important;
    border-color: #fed7aa !important;
    transform: translateY(-2px) !important;
}

/* HERO BANNER TƯƠI SÁNG, ẤM ÁP, ĐẬM CHẤT THÚ CƯNG (SUNNY PET GRADIENT) */
.hero-banner {
    background: linear-gradient(135deg, #f97316 0%, #fb923c 45%, #0d9488 100%) !important;
    border-radius: 22px !important;
    padding: 38px 42px !important;
    color: #ffffff !important;
    margin-bottom: 26px !important;
    box-shadow: 0 14px 34px -6px rgba(249, 115, 22, 0.3) !important;
    position: relative;
    overflow: hidden;
}

.hero-banner::after {
    content: "🐶 🐱";
    position: absolute;
    right: 25px;
    bottom: -10px;
    font-size: 80px;
    opacity: 0.2;
    pointer-events: none;
}

/* STAT CARDS SÁNG TƯƠI, THÂN THIỆN */
.stat-card-bright {
    background: #ffffff !important;
    border-radius: 18px !important;
    padding: 18px 22px !important;
    border: 1.5px solid #eee7db !important;
    box-shadow: 0 4px 14px rgba(180, 160, 140, 0.06) !important;
    display: flex;
    align-items: center;
    gap: 16px;
    transition: all 0.25s ease;
}

.stat-card-bright:hover {
    border-color: #fdba74 !important;
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(249, 115, 22, 0.12) !important;
}

.stat-icon-wrap {
    width: 52px;
    height: 52px;
    border-radius: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 26px;
}

.stat-num {
    font-size: 26px;
    font-weight: 800;
    color: #1c1917 !important;
    line-height: 1.1;
}

.stat-text {
    font-size: 13px;
    color: #78716c !important;
    font-weight: 600;
    margin-top: 2px;
}

/* BƯỚC KHÁM BỆNH TRÊN TRANG CHỦ */
.step-card {
    background: #ffffff !important;
    border-radius: 18px !important;
    padding: 24px 20px !important;
    border: 1.5px solid #eee7db !important;
    box-shadow: 0 4px 12px rgba(180, 160, 140, 0.05) !important;
    text-align: center;
    transition: all 0.25s ease;
}

.step-card:hover {
    border-color: #f97316 !important;
    box-shadow: 0 8px 24px rgba(249, 115, 22, 0.12) !important;
    transform: translateY(-2px);
}

.step-number {
    width: 42px;
    height: 42px;
    border-radius: 50%;
    background: #ffedd5 !important;
    color: #ea580c !important;
    font-weight: 800;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 12px auto;
    font-size: 18px;
    box-shadow: 0 2px 8px rgba(249, 115, 22, 0.15);
}

/* BADGES MÀU SÁNG, DỄ THƯƠNG */
.badge {
    display: inline-block;
    padding: 5px 14px;
    border-radius: 9999px;
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.2px;
}

.badge-danger {
    background-color: #ffe4e6 !important;
    color: #be123c !important;
    border: 1px solid #fecdd3 !important;
}

.badge-warning {
    background-color: #fef3c7 !important;
    color: #b45309 !important;
    border: 1px solid #fde68a !important;
}

.badge-success {
    background-color: #dcfce7 !important;
    color: #15803d !important;
    border: 1px solid #bbf7d0 !important;
}

.badge-info {
    background-color: #e0f2fe !important;
    color: #0369a1 !important;
    border: 1px solid #bae6fd !important;
}

/* INPUT VÀ DROPDOWN TRÊN NỀN SÁNG */
.stTextInput > div > div > input, .stSelectbox > div > div, .stTextArea textarea {
    background-color: #ffffff !important;
    color: #292524 !important;
    border-radius: 14px !important;
    border: 1.5px solid #e7ded0 !important;
    box-shadow: 0 2px 6px rgba(0,0,0,0.02) !important;
}

.stTextInput > div > div > input:focus, .stTextArea textarea:focus {
    border-color: #f97316 !important;
    box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.18) !important;
}

/* STREAMLIT CONTAINER BORDER */
[data-testid="stVerticalBlock"] > div[data-testid="stVerticalBlockBorderWrapper"] {
    background-color: #ffffff !important;
    border: 1.5px solid #eee7db !important;
    border-radius: 18px !important;
    box-shadow: 0 4px 16px rgba(180, 160, 140, 0.05) !important;
}

/* THANH TIẾN TRÌNH */
.stProgress > div > div > div > div {
    background: linear-gradient(90deg, #f97316 0%, #10b981 100%) !important;
    border-radius: 9999px !important;
}

/* ẨN FOOTER STREAMLIT */
#MainMenu {visibility: hidden;}
footer {visibility: hidden;}
</style>
"""
