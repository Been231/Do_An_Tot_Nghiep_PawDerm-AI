"""
PawDerm AI - Doctor Portal & Active Learning Re-labeling Router
"""

from typing import Dict, Any, Optional
from fastapi import APIRouter, HTTPException, Body
from app.database.supabase_service import SupabaseService

router = APIRouter(prefix="/api/doctor", tags=["Doctor"])


@router.get("/queue")
def get_doctor_queue():
    """
    Lấy danh sách các ca bệnh cần Bác sĩ thẩm định.
    BẢO MẬT TUYỆT ĐỐI: Ẩn thông tin cá nhân khách hàng, chỉ hiển thị đặc điểm lâm sàng.
    """
    queue = SupabaseService.get_doctor_review_queue()
    return {"success": True, "queue": queue}


@router.post("/review")
def submit_doctor_review(payload: Dict[str, Any] = Body(...)):
    """
    Bác sĩ đánh giá:
    - 'agreed': Đồng ý với kết quả AI
    - 'corrected': Sửa lại kết quả (Re-labeling) để Admin dùng Retrain mô hình.
    """
    record_id = payload.get("record_id")
    doctor_id = payload.get("doctor_id", "")
    doctor_name = payload.get("doctor_name", "Bác sĩ thú y")
    review_status = payload.get("review_status", "agreed")
    corrected_disease = payload.get("corrected_disease", "")
    notes = payload.get("notes", "")

    if not record_id:
        raise HTTPException(status_code=400, detail="Thiếu record_id")

    success = SupabaseService.submit_doctor_review(
        record_id=record_id,
        doctor_id=doctor_id,
        doctor_name=doctor_name,
        review_status=review_status,
        corrected_disease=corrected_disease,
        notes=notes
    )
    return {
        "success": success,
        "message": "Đã lưu thẩm định y khoa thành công! Nhãn dữ liệu đã được cập nhật cho hệ thống."
    }


@router.get("/stats")
def get_doctor_stats(doctor_id: Optional[str] = None):
    """Lấy số lượng ca bệnh bác sĩ đã xác nhận và tỷ lệ đồng thuận với AI."""
    stats = SupabaseService.get_doctor_stats(doctor_id)
    return {"success": True, "stats": stats}
