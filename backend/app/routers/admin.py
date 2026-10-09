"""
PawDerm AI - Admin Management & Retrain Dataset Router
"""

from datetime import datetime
from typing import Dict, Any
from fastapi import APIRouter, HTTPException, Query, Body
from app.database.supabase_service import SupabaseService

router = APIRouter(prefix="/api/admin", tags=["Admin"])


@router.get("/users")
def get_admin_users():
    """Quản lý danh sách người dùng (Khách hàng & Bác sĩ)."""
    users = SupabaseService.get_admin_users()
    return {"success": True, "users": users}


@router.put("/users/{user_id}/status")
def set_user_status(user_id: str, payload: Dict[str, Any] = Body(...)):
    """Khóa/mở khóa Khách hàng hoặc Duyệt/Từ chối Bác sĩ ('active' | 'locked' | 'pending_approval')."""
    new_status = payload.get("status", "active")
    success = SupabaseService.set_user_status(user_id, new_status)
    return {"success": success, "message": f"Đã cập nhật trạng thái người dùng sang: {new_status}"}


@router.get("/diseases")
def get_disease_dictionary():
    """Lấy toàn bộ danh mục từ điển bệnh học ngoài da."""
    diseases = SupabaseService.get_disease_dictionary()
    return {"success": True, "diseases": diseases}


@router.post("/diseases")
def save_disease(payload: Dict[str, Any] = Body(...)):
    """Thêm hoặc cập nhật một bệnh trong từ điển (Tên bệnh, nguyên nhân, sơ cứu...)."""
    success = SupabaseService.save_disease_entry(payload)
    return {"success": success, "message": "Đã lưu thông tin bệnh học vào từ điển thành công!"}


@router.delete("/diseases/{disease_key}")
def delete_disease(disease_key: str):
    """Xóa một bệnh khỏi từ điển bệnh học."""
    success = SupabaseService.delete_disease_entry(disease_key)
    return {"success": success}


@router.get("/dataset")
def get_admin_dataset(only_corrected: bool = Query(False)):
    """
    Quản lý hình ảnh người dùng tải lên.
    Nếu only_corrected = True: Lọc ra các ca Bác sĩ xác nhận SAI để chuẩn bị Retrain.
    """
    dataset = SupabaseService.get_dataset_records(only_corrected=only_corrected)
    return {"success": True, "dataset": dataset, "count": len(dataset)}


@router.get("/dataset/export")
def export_dataset_for_retrain():
    """
    Xuất file JSON Manifest tập dữ liệu kèm nhãn Bác sĩ (Doctor Ground Truth)
    để nạp thẳng vào quy trình Huấn luyện lại (Retrain) YOLOv8 / Roboflow.
    """
    dataset = SupabaseService.get_dataset_records(only_corrected=False)
    retrain_samples = []
    for item in dataset:
        final_label = item.get("doctor_corrected_disease") if item.get("review_status") == "corrected" else item.get("disease_name_vi")
        retrain_samples.append({
            "record_id": item.get("id"),
            "image_url": item.get("image_url"),
            "ai_predicted_label": item.get("disease_name_vi"),
            "doctor_verified_label": final_label,
            "review_status": item.get("review_status"),
            "is_hard_sample": item.get("review_status") == "corrected",
            "doctor_notes": item.get("doctor_notes", ""),
            "export_format": "YOLOv8_Classification_Manifest_v1.0"
        })

    return {
        "export_date": datetime.now().isoformat(timespec="seconds"),
        "total_samples": len(retrain_samples),
        "hard_cases_count": sum(1 for s in retrain_samples if s["is_hard_sample"]),
        "dataset": retrain_samples
    }


@router.get("/dashboard")
def get_dashboard_metrics():
    """Lấy số liệu thống kê tổng thể cho Bảng điều khiển Admin."""
    metrics = SupabaseService.get_dashboard_metrics()
    return {"success": True, "metrics": metrics}
