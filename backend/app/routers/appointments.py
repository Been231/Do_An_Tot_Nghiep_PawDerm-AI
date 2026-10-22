"""
PawDerm AI - Appointments & Doctor Preliminary Diagnosis Router
Quản lý lịch hẹn khám bệnh tại Bệnh viện Thú Y PawDerm:
- Khách hàng đặt lịch khám
- Bác sĩ tiếp nhận, khám sơ bộ và đưa ra dự đoán bệnh
"""

from typing import Dict, Any, Optional
from fastapi import APIRouter, HTTPException, Query, Body
from app.services.appointment_service import AppointmentService

router = APIRouter(prefix="/api/appointments", tags=["Appointments"])


@router.get("/my")
def get_my_appointments(user_id: Optional[str] = Query(None)):
    """Khách hàng lấy danh sách các lịch hẹn khám của mình."""
    appointments = AppointmentService.get_my_appointments(user_id)
    return {"success": True, "appointments": appointments}


@router.get("/doctor")
def get_doctor_appointments():
    """Bác sĩ lấy danh sách tất cả các lịch hẹn cần tiếp nhận & khám sơ bộ."""
    appointments = AppointmentService.get_doctor_appointments()
    return {"success": True, "appointments": appointments}


@router.get("/slot-availability")
def get_slot_availability(date: Optional[str] = Query(None)):
    """Kiểm tra tình trạng số người đã đặt và chỗ còn lại cho 4 khung giờ khám trong ngày."""
    from datetime import datetime
    target_date = (date or datetime.now().strftime("%Y-%m-%d")).strip()
    slots = AppointmentService.get_slot_availability(target_date)
    return {
        "success": True,
        "date": target_date,
        "slots": slots,
        "max_capacity": AppointmentService.MAX_SLOT_CAPACITY,
        "hospital_info": {
            "address": AppointmentService.HOSPITAL_ADDRESS,
            "phone": AppointmentService.HOSPITAL_PHONE,
            "hours": AppointmentService.HOSPITAL_HOURS
        }
    }


@router.post("")
def create_appointment(payload: Dict[str, Any] = Body(...)):
    """Khách hàng gửi yêu cầu đặt lịch khám tại Bệnh viện PawDerm."""
    if not payload.get("pet_name"):
        raise HTTPException(status_code=400, detail="Vui lòng cung cấp tên thú cưng cần khám!")
    if not payload.get("phone"):
        raise HTTPException(status_code=400, detail="Vui lòng cung cấp số điện thoại liên hệ!")

    try:
        created = AppointmentService.create_appointment(payload)
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Lỗi hệ thống khi đặt lịch: {str(e)}")

    return {
        "success": True,
        "appointment": created,
        "message": f"Đặt lịch khám cho bé {created['pet_name']} tại Bệnh viện PawDerm thành công!"
    }


@router.put("/{appointment_id}/pre-diagnose")
def submit_pre_diagnosis(appointment_id: str, payload: Dict[str, Any] = Body(...)):
    """
    Bác sĩ thực hiện khám sơ bộ, đưa ra dự đoán bệnh và hướng dẫn cho khách hàng.
    """
    updated = AppointmentService.submit_pre_diagnosis(appointment_id, payload)
    if not updated:
        raise HTTPException(status_code=404, detail="Không tìm thấy lịch hẹn!")
    return {
        "success": True,
        "appointment": updated,
        "message": "Đã lưu kết quả khám sơ bộ và gửi dự đoán bệnh cho khách hàng thành công!"
    }


@router.put("/{appointment_id}/status")
def update_appointment_status(appointment_id: str, payload: Dict[str, Any] = Body(...)):
    """Cập nhật trạng thái lịch hẹn (confirmed | completed | cancelled)."""
    new_status = payload.get("status", "completed")
    success = AppointmentService.update_status(appointment_id, new_status)
    if not success:
        raise HTTPException(status_code=404, detail="Không tìm thấy lịch hẹn!")
    return {
        "success": True,
        "message": f"Đã cập nhật trạng thái lịch hẹn sang: {new_status}"
    }
