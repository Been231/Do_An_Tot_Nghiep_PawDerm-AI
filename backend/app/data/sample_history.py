"""
Dữ liệu mẫu Hồ sơ Thú cưng và Lịch sử Chẩn đoán theo dõi tiến triển bệnh qua từng ngày
Phục vụ mô phỏng Web Application đầy đủ chức năng trước khi kết nối Database và Roboflow AI.
"""

from typing import List, Dict, Any

# -----------------------------------------------------------------------------
# DANH SÁCH HỒ SƠ THÚ CƯNG MẪU CỦA NGƯỜI DÙNG
# -----------------------------------------------------------------------------
DEFAULT_PETS: List[Dict[str, Any]] = [
    {
        "id": "pet_001",
        "name": "Milo",
        "species": "Chó 🐶",
        "breed": "Poodle Toy",
        "age": "2 tuổi",
        "weight": "4.5 kg",
        "avatar": "🐩",
        "health_status": "Đang theo dõi điều trị nấm",
        "status_badge": "badge-warning",
        "notes": "Tiền sử dị ứng thức ăn hạt chứa thịt bò, đã tiêm đủ 3 mũi vắc-xin 7 bệnh."
    },
    {
        "id": "pet_002",
        "name": "Miu Miu",
        "species": "Mèo 🐱",
        "breed": "Mèo Anh lông ngắn (British Shorthair)",
        "age": "1 tuổi",
        "weight": "3.8 kg",
        "avatar": "🐱",
        "health_status": "Khỏe mạnh bình thường",
        "status_badge": "badge-success",
        "notes": "Đã triệt sản, định kỳ xổ giun và nhỏ gáy phòng ve rận mỗi tháng."
    }
]

# -----------------------------------------------------------------------------
# LỊCH SỬ CHẨN ĐOÁN & TIẾN TRIỂN BỆNH THEO TỪNG NGÀY CỦA MILO
# -----------------------------------------------------------------------------
DEFAULT_DIAGNOSIS_HISTORY: List[Dict[str, Any]] = [
    {
        "id": "diag_003",
        "pet_id": "pet_001",
        "pet_name": "Milo",
        "date": "10/09/2026",
        "day_label": "Ngày 10 (Giai đoạn hồi phục)",
        "disease_name_vi": "Nhiễm nấm da",
        "disease_name_en": "Ringworm (Hồi phục 85%)",
        "confidence": 18.2,
        "probabilities": [
            {"label": "Phục hồi mô sừng lành tính", "percent": 78.0, "color": "#10b981"},
            {"label": "Dư lượng vi nấm (Ringworm)", "percent": 18.2, "color": "#0284c7"},
            {"label": "Dị ứng nhẹ", "percent": 3.8, "color": "#64748b"}
        ],
        "recovery_score": 85,
        "severity": "Nhẹ - Sắp khỏi hoàn toàn",
        "severity_badge": "badge-success",
        "clinical_notes": "Mảng da tổn thương ở lưng đã se khô hoàn toàn, sạch vảy trắng. Chân lông tơ bắt đầu nhú mọc đều trở lại. Bé không còn cào gãi ngứa.",
        "treatment_applied": "Duy trì xịt Fungikur 1 lần/ngày + Tắm thảo dược bảo vệ hàng rào biểu bì."
    },
    {
        "id": "diag_002",
        "pet_id": "pet_001",
        "pet_name": "Milo",
        "date": "05/09/2026",
        "day_label": "Ngày 05 (Sau 4 ngày điều trị)",
        "disease_name_vi": "Nhiễm nấm da",
        "disease_name_en": "Ringworm (Đang thuyên giảm)",
        "confidence": 54.0,
        "probabilities": [
            {"label": "Nhiễm nấm da (Ringworm)", "percent": 54.0, "color": "#0284c7"},
            {"label": "Tổ chức mô biểu bì non", "percent": 38.0, "color": "#10b981"},
            {"label": "Khác", "percent": 8.0, "color": "#64748b"}
        ],
        "recovery_score": 50,
        "severity": "Trung bình - Giảm viêm rõ rệt",
        "severity_badge": "badge-warning",
        "clinical_notes": "Vết đỏ giảm phù nề 60%, bờ viền tròn se lại không lan thêm. Vảy gàu trắng bong bớt sau khi tắm dầu sát khuẩn. Bé đỡ bồn chồn.",
        "treatment_applied": "Xịt Fungikur ngày 2 lần, đeo loa chống liếm liên tục, tắm dầu Ketoconazole 2 lần/tuần."
    },
    {
        "id": "diag_001",
        "pet_id": "pet_001",
        "pet_name": "Milo",
        "date": "01/09/2026",
        "day_label": "Ngày 01 (Khởi phát bệnh cấp tính)",
        "disease_name_vi": "Nhiễm nấm da",
        "disease_name_en": "Ringworm (Cấp tính)",
        "confidence": 88.5,
        "probabilities": [
            {"label": "Nhiễm nấm da (Ringworm)", "percent": 88.5, "color": "#0284c7"},
            {"label": "Ghẻ Demodex (Mange)", "percent": 7.2, "color": "#f59e0b"},
            {"label": "Viêm da cơ địa", "percent": 4.3, "color": "#64748b"}
        ],
        "recovery_score": 15,
        "severity": "Trung bình - Cấp tính",
        "severity_badge": "badge-danger",
        "clinical_notes": "Xuất hiện đốm rụng lông tròn đường kính ~3cm ở vùng hông lưng, viền ửng đỏ rát, bề mặt phủ vảy trắng gàu. Bé gãi liên tục.",
        "treatment_applied": "Phát hiện qua PawDerm AI, bắt đầu đeo loa Elizabeth và đặt lịch khám soi tươi vi nấm."
    }
]
