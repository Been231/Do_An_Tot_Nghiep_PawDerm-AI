"""
PawDerm AI - Tiện ích Bảo mật
  - Băm (hash) & xác minh mật khẩu bằng bcrypt
  - Loại bỏ trường nhạy cảm trước khi trả dữ liệu người dùng về client
"""

from typing import Dict, Any, Optional
import bcrypt


def hash_password(plain: str) -> str:
    """Băm mật khẩu bằng bcrypt (tự sinh salt)."""
    return bcrypt.hashpw(plain.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def is_hashed(value: Optional[str]) -> bool:
    """Kiểm tra chuỗi có phải hash bcrypt hay không ($2a$, $2b$, $2y$)."""
    return bool(value) and value.startswith(("$2a$", "$2b$", "$2y$")) and len(value) == 60


def verify_password(plain: str, stored: Optional[str]) -> bool:
    """
    Xác minh mật khẩu.
    - Nếu DB đã lưu hash bcrypt -> so khớp bằng bcrypt.checkpw
    - Nếu DB còn lưu plaintext (dữ liệu cũ) -> so sánh trực tiếp
      (sau khi đăng nhập đúng, hệ thống sẽ tự nâng cấp lên hash)
    """
    if not stored:
        return False
    if is_hashed(stored):
        try:
            return bcrypt.checkpw(plain.encode("utf-8"), stored.encode("utf-8"))
        except ValueError:
            return False
    return plain == stored


def sanitize_user(user: Dict[str, Any]) -> Dict[str, Any]:
    """Trả về bản sao user đã bỏ trường password."""
    if not user:
        return user
    return {k: v for k, v in user.items() if k != "password"}
