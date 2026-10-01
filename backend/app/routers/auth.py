"""
PawDerm AI - Authentication & Profile Router
"""

from typing import Dict, Any
from fastapi import APIRouter, HTTPException, Body
from app.database.supabase_service import SupabaseService

router = APIRouter(prefix="/api/auth", tags=["Authentication"])


@router.post("/login")
def login(payload: Dict[str, Any] = Body(...)):
    """Đăng nhập tài khoản với phân quyền role (customer, doctor, admin)."""
    username = payload.get("username", "").strip()
    password = payload.get("password", "").strip()
    user = SupabaseService.authenticate(username, password)
    if not user:
        raise HTTPException(status_code=401, detail="Tên đăng nhập hoặc mật khẩu không chính xác!")
    
    if user.get("status") == "locked":
        raise HTTPException(status_code=403, detail="Tài khoản này đã bị Quản trị viên tạm khóa!")
    
    return {
        "success": True,
        "user": user,
        "message": f"Chào mừng {user.get('full_name', username)} quay trở lại!"
    }


@router.post("/register")
def register(payload: Dict[str, Any] = Body(...)):
    """Đăng ký tài khoản Khách hàng hoặc Bác sĩ thú y."""
    result = SupabaseService.register_user(payload)
    if not result.get("success"):
        raise HTTPException(status_code=400, detail=result.get("error", "Đăng ký không thành công!"))
    return result


@router.put("/profile")
def update_profile(payload: Dict[str, Any] = Body(...)):
    """Cập nhật thông tin tài khoản hoặc phòng khám của Bác sĩ."""
    user_id = payload.get("user_id")
    if not user_id:
        raise HTTPException(status_code=400, detail="Thiếu user_id")
    updates = payload.get("updates", {})
    success = SupabaseService.update_profile(user_id, updates)
    return {"success": success}
