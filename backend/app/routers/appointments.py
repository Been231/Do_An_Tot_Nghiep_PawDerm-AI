"""
PawDerm AI - Appointments & Doctor Preliminary Diagnosis & VietQR Payment Router
Quản lý lịch hẹn khám bệnh tại Bệnh viện Thú Y PawDerm:
- Khách hàng đặt lịch khám
- Tạo và kiểm tra trạng thái thanh toán VietQR tự động 10 phút
- Bác sĩ tiếp nhận, xem trạng thái thanh toán và khám sơ bộ
- Quản trị viên (Admin) theo dõi giao dịch & doanh thu viện
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


@router.get("/admin/transactions")
def get_admin_transactions():
    """Quản trị viên (Admin) xem danh sách giao dịch VietQR và thống kê doanh thu viện."""
    summary = AppointmentService.get_admin_transactions()
    return {"success": True, **summary}


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
    """Khách hàng gửi yêu cầu đặt lịch khám tại Bệnh viện PawDerm và nhận mã thanh toán VietQR."""
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


@router.get("/{appointment_id}/payment-status")
def get_payment_status(appointment_id: str):
    """Khách hàng và hệ thống kiểm tra trạng thái thanh toán và số giây còn lại của mã QR."""
    status_info = AppointmentService.get_payment_status(appointment_id)
    if not status_info:
        raise HTTPException(status_code=404, detail="Không tìm thấy thông tin thanh toán cho lịch hẹn này!")
    return {"success": True, **status_info}


@router.post("/{appointment_id}/regenerate-qr")
def regenerate_payment_qr(appointment_id: str):
    """Tạo lại mã VietQR mới và gia hạn thêm 10 phút khi mã cũ hết hạn."""
    updated = AppointmentService.regenerate_payment_qr(appointment_id)
    if not updated:
        raise HTTPException(status_code=404, detail="Không tìm thấy lịch hẹn để tạo lại mã QR!")
    return {
        "success": True,
        "appointment": updated,
        "message": "Đã tạo mới mã QR và gia hạn thêm 10 phút thanh toán thành công!"
    }


@router.post("/{appointment_id}/simulate-payment")
def simulate_payment(appointment_id: str):
    """
    Kích hoạt thanh toán chuyển khoản thành công ngay lập tức (Dành riêng cho Thuyết minh / Demo Đồ án tốt nghiệp).
    Tự động chuyển trạng thái sang Đã thanh toán, Bác sĩ và Khách hàng sẽ thấy ngay lập tức.
    """
    updated = AppointmentService.confirm_payment(appointment_id, method="VietQR (Demo Test Thuyết Minh)")
    if not updated:
        raise HTTPException(status_code=404, detail="Không tìm thấy lịch hẹn!")
    return {
        "success": True,
        "appointment": updated,
        "message": f"⚡ Đã kích hoạt thanh toán thành công cho lịch hẹn #{appointment_id}!"
    }


@router.post("/{appointment_id}/confirm-payment")
def confirm_payment(appointment_id: str, payload: Dict[str, Any] = Body(default={})):
    """Xác nhận thanh toán tự động (Webhook từ ngân hàng hoặc xác nhận từ Admin)."""
    method = payload.get("payment_method", "VietQR Online")
    updated = AppointmentService.confirm_payment(appointment_id, method=method)
    if not updated:
        raise HTTPException(status_code=404, detail="Không tìm thấy lịch hẹn!")
    return {
        "success": True,
        "appointment": updated,
        "message": "Đã xác nhận thanh toán thành công!"
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
