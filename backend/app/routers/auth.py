"""
PawDerm AI - Authentication & Profile Router
  - Đăng nhập (username hoặc Gmail) với mật khẩu băm bcrypt
  - Đăng ký Chủ nuôi bắt buộc xác thực Gmail thật bằng mã OTP
"""

import re
from typing import Dict, Any
from fastapi import APIRouter, HTTPException, Body
from app.database.supabase_service import SupabaseService
from app.services import email_otp

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

USERNAME_REGEX = re.compile(r"^[A-Za-z0-9_.]{3,30}$")
PHONE_REGEX = re.compile(r"^0\d{9}$")
MIN_PASSWORD_LENGTH = 6


@router.post("/login")
def login(payload: Dict[str, Any] = Body(...)):
    """Đăng nhập tài khoản bằng Tên đăng nhập hoặc Gmail."""
    username = (payload.get("username") or "").strip()
    password = payload.get("password") or ""
    if not username or not password:
        raise HTTPException(status_code=400, detail="Vui lòng nhập tên đăng nhập và mật khẩu!")

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


@router.post("/send-otp")
def send_otp(payload: Dict[str, Any] = Body(...)):
    """Bước 1: Gửi mã OTP 6 số tới Gmail để chứng minh Gmail có thật."""
    email = email_otp.normalize_email(payload.get("email", ""))
    if not email_otp.is_valid_gmail(email):
        raise HTTPException(status_code=400, detail="Địa chỉ Gmail không hợp lệ! (ví dụ: tenban@gmail.com)")
    if SupabaseService.email_exists(email):
        raise HTTPException(status_code=409, detail="Gmail này đã được dùng để đăng ký tài khoản khác!")

    result = email_otp.send_otp(email)
    if not result.get("success"):
        status = 429 if result.get("retry_after") else 400
        raise HTTPException(status_code=status, detail=result.get("error"))
    return result


@router.post("/verify-otp")
def verify_otp(payload: Dict[str, Any] = Body(...)):
    """Bước 2: Kiểm tra mã OTP người dùng nhập. Đúng -> trả verification_token."""
    result = email_otp.verify_otp(payload.get("email", ""), payload.get("code", ""))
    if not result.get("success"):
        raise HTTPException(status_code=400, detail=result.get("error"))
    return result


@router.post("/register")
def register(payload: Dict[str, Any] = Body(...)):
    """
    Bước 3: Đăng ký tài khoản Chủ nuôi.
    Bắt buộc có Gmail đã xác thực OTP (verification_token).
    Vai trò luôn là 'customer' — tài khoản Bác sĩ do Quản trị viên cấp.
    """
    username = (payload.get("username") or "").strip()
    password = payload.get("password") or ""
    full_name = (payload.get("full_name") or "").strip()
    phone = (payload.get("phone") or "").strip()
    email = email_otp.normalize_email(payload.get("email", ""))
    token = payload.get("verification_token", "")

    if not USERNAME_REGEX.match(username):
        raise HTTPException(status_code=400, detail="Tên đăng nhập 3-30 ký tự, chỉ gồm chữ, số, dấu _ hoặc dấu chấm!")
    if len(password) < MIN_PASSWORD_LENGTH:
        raise HTTPException(status_code=400, detail=f"Mật khẩu phải có ít nhất {MIN_PASSWORD_LENGTH} ký tự!")
    if not full_name:
        raise HTTPException(status_code=400, detail="Vui lòng nhập họ và tên!")
    if not PHONE_REGEX.match(phone):
        raise HTTPException(status_code=400, detail="Số điện thoại phải gồm đúng 10 chữ số và bắt đầu bằng số 0!")
    if not email_otp.is_valid_gmail(email):
        raise HTTPException(status_code=400, detail="Địa chỉ Gmail không hợp lệ!")
    if not email_otp.peek_verification_token(email, token):
        raise HTTPException(status_code=400, detail="Gmail chưa được xác thực hoặc phiên xác thực đã hết hạn. Vui lòng xác thực lại!")

    clean_payload = {
        **payload,
        "username": username,
        "full_name": full_name,
        "phone": phone,
        "email": email,
        "role": "customer",   # Không cho client tự chọn vai trò
    }
    clean_payload.pop("verification_token", None)

    result = SupabaseService.register_user(clean_payload)
    if not result.get("success"):
        raise HTTPException(status_code=400, detail=result.get("error", "Đăng ký không thành công!"))

    # Chỉ tiêu thụ token khi đăng ký thành công (để người dùng sửa lỗi trùng username mà không phải xác thực lại)
    email_otp.consume_verification_token(email, token)
    return result


@router.put("/profile")
def update_profile(payload: Dict[str, Any] = Body(...)):
    """Cập nhật thông tin tài khoản (họ tên, SĐT, địa chỉ) hoặc phòng khám của Bác sĩ."""
    user_id = payload.get("user_id")
    if not user_id:
        raise HTTPException(status_code=400, detail="Thiếu user_id")
    updates = dict(payload.get("updates") or {})

    if "full_name" in updates:
        updates["full_name"] = (updates.get("full_name") or "").strip()
        if not updates["full_name"]:
            raise HTTPException(status_code=400, detail="Họ và tên không được để trống!")
    if "phone" in updates:
        updates["phone"] = (updates.get("phone") or "").strip()
        if not PHONE_REGEX.match(updates["phone"]):
            raise HTTPException(status_code=400, detail="Số điện thoại phải gồm đúng 10 chữ số và bắt đầu bằng số 0!")
    if "address" in updates:
        updates["address"] = (updates.get("address") or "").strip()

    success = SupabaseService.update_profile(user_id, updates)
    if not success:
        raise HTTPException(status_code=400, detail="Không cập nhật được hồ sơ, vui lòng thử lại!")
    user = SupabaseService.get_user_by_id(user_id)
    return {"success": True, "user": user, "message": "Đã cập nhật hồ sơ cá nhân!"}


@router.post("/change-password")
def change_password(payload: Dict[str, Any] = Body(...)):
    """Đổi mật khẩu: yêu cầu nhập đúng mật khẩu hiện tại."""
    user_id = payload.get("user_id")
    old_password = payload.get("old_password") or ""
    new_password = payload.get("new_password") or ""
    if not user_id:
        raise HTTPException(status_code=400, detail="Thiếu user_id")
    if not old_password or not new_password:
        raise HTTPException(status_code=400, detail="Vui lòng nhập đầy đủ mật khẩu hiện tại và mật khẩu mới!")
    if len(new_password) < MIN_PASSWORD_LENGTH:
        raise HTTPException(status_code=400, detail=f"Mật khẩu mới phải có ít nhất {MIN_PASSWORD_LENGTH} ký tự!")
    if new_password == old_password:
        raise HTTPException(status_code=400, detail="Mật khẩu mới phải khác mật khẩu hiện tại!")

    result = SupabaseService.change_password(user_id, old_password, new_password)
    if not result.get("success"):
        raise HTTPException(status_code=400, detail=result.get("error"))
    return {"success": True, "message": "Đổi mật khẩu thành công!"}


@router.post("/forgot-password/send-otp")
def forgot_password_send_otp(payload: Dict[str, Any] = Body(...)):
    """Quên mật khẩu - Bước 1: Gửi mã OTP xác thực tới Gmail của tài khoản."""
    email = email_otp.normalize_email(payload.get("email", ""))
    if not email_otp.is_valid_gmail(email):
        raise HTTPException(status_code=400, detail="Địa chỉ Gmail không hợp lệ! (ví dụ: tenban@gmail.com)")
    
    # Kiểm tra xem Gmail này có tài khoản trong hệ thống không
    user = SupabaseService.find_user_by_email(email)
    if not user:
        raise HTTPException(status_code=404, detail="Không tìm thấy tài khoản nào được đăng ký bằng Gmail này!")

    result = email_otp.send_otp(email)
    if not result.get("success"):
        status = 429 if result.get("retry_after") else 400
        raise HTTPException(status_code=status, detail=result.get("error"))
    return result


@router.post("/forgot-password/reset")
def forgot_password_reset(payload: Dict[str, Any] = Body(...)):
    """Quên mật khẩu - Bước 2: Xác nhận OTP và đặt mật khẩu mới."""
    email = email_otp.normalize_email(payload.get("email", ""))
    token = payload.get("verification_token", "")
    new_password = payload.get("new_password", "")

    if not email or not token or not new_password:
        raise HTTPException(status_code=400, detail="Thiếu thông tin đặt lại mật khẩu bắt buộc!")
    if len(new_password) < MIN_PASSWORD_LENGTH:
        raise HTTPException(status_code=400, detail=f"Mật khẩu mới phải có ít nhất {MIN_PASSWORD_LENGTH} ký tự!")
    
    if not email_otp.peek_verification_token(email, token):
        raise HTTPException(status_code=400, detail="Mã xác thực đã hết hạn hoặc không hợp lệ. Vui lòng nhận mã mới!")

    res = SupabaseService.reset_password_by_email(email, new_password)
    if not res.get("success"):
        raise HTTPException(status_code=400, detail=res.get("error", "Lỗi đặt lại mật khẩu!"))

    # Tiêu thụ token sau khi reset thành công
    email_otp.consume_verification_token(email, token)
    return {
        "success": True, 
        "username": res.get("username", ""),
        "message": "Đặt lại mật khẩu thành công! Vui lòng đăng nhập bằng mật khẩu mới."
    }
