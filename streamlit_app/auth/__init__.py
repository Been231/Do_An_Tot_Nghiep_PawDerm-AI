"""
Phân hệ Xác thực và Quản lý Người dùng (Auth Subsystem)
Cung cấp các thành phần chuyên biệt:
- LoginManager: Đăng nhập, quản lý phiên và cập nhật hồ sơ
- RegisterManager: Đăng ký tài khoản người dùng mới
- AuthManager: Bộ điều phối tổng thể giao diện xác thực
"""

from .login_manager import LoginManager
from .register_manager import RegisterManager
from .auth_manager import AuthManager

__all__ = ["LoginManager", "RegisterManager", "AuthManager"]
