"""
PawDerm AI - Dịch vụ Xác thực Gmail bằng mã OTP

Cách chứng minh một địa chỉ Gmail là CÓ THẬT và THUỘC VỀ người đăng ký:
  1. Kiểm tra định dạng phải là ...@gmail.com
  2. Gửi mã OTP 6 số tới hộp thư đó qua máy chủ SMTP của Google
  3. Chỉ khi người dùng nhập đúng mã (nghĩa là họ thực sự mở được hộp thư)
     thì hệ thống mới cấp "verification_token" để hoàn tất đăng ký.
  -> Gmail không tồn tại sẽ không bao giờ nhận được mã => không thể đăng ký.

Cấu hình trong backend/.env:
  SMTP_EMAIL=tai_khoan_gui@gmail.com
  SMTP_APP_PASSWORD=xxxx xxxx xxxx xxxx   (Mật khẩu ứng dụng 16 ký tự của Google)

Nếu chưa cấu hình SMTP, hệ thống chạy ở CHẾ ĐỘ DEV: mã OTP được in ra console backend.
"""

import os
import re
import secrets
import smtplib
import ssl
import threading
import time
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from typing import Dict, Any

# Quy tắc tên Gmail: 6-30 ký tự gồm chữ, số, dấu chấm (cho phép thêm alias "+...")
GMAIL_REGEX = re.compile(r"^[a-z0-9][a-z0-9.]{5,29}(\+[a-z0-9._-]+)?@gmail\.com$")

OTP_TTL_SECONDS = 5 * 60          # Mã OTP hết hạn sau 5 phút
RESEND_COOLDOWN_SECONDS = 60      # Phải chờ 60 giây mới được gửi lại
MAX_VERIFY_ATTEMPTS = 5           # Tối đa 5 lần nhập sai
TOKEN_TTL_SECONDS = 15 * 60       # Token xác thực dùng để đăng ký có hạn 15 phút

_lock = threading.Lock()
_otp_store: Dict[str, Dict[str, Any]] = {}     # email -> {code, expires, attempts, sent_at}
_token_store: Dict[str, Dict[str, Any]] = {}   # token -> {email, expires}


def normalize_email(email: str) -> str:
    return (email or "").strip().lower()


def is_valid_gmail(email: str) -> bool:
    return bool(GMAIL_REGEX.match(normalize_email(email)))


from pathlib import Path
from dotenv import load_dotenv

def _load_env_if_needed():
    env_file = Path(__file__).resolve().parent.parent.parent / ".env"
    if env_file.exists():
        load_dotenv(env_file, override=False)
        if not os.getenv("SMTP_EMAIL"):
            load_dotenv(env_file, override=True)

def _smtp_configured() -> bool:
    _load_env_if_needed()
    return bool(os.getenv("SMTP_EMAIL") and os.getenv("SMTP_APP_PASSWORD"))


def _build_email_html(code: str) -> str:
    return f"""
    <div style="font-family:Arial,sans-serif;max-width:480px;margin:auto;padding:24px;
                border-radius:16px;background:#fff7ed;border:1px solid #fed7aa">
      <h2 style="color:#ea580c;margin:0 0 8px">🐾 PawDerm AI</h2>
      <p style="color:#334155">Mã xác thực Gmail để hoàn tất đăng ký tài khoản của bạn là:</p>
      <div style="font-size:34px;font-weight:bold;letter-spacing:10px;color:#0f172a;
                  background:#fff;border-radius:12px;padding:16px;text-align:center">{code}</div>
      <p style="color:#64748b;font-size:13px">Mã có hiệu lực trong 5 phút.
         Nếu bạn không yêu cầu đăng ký, vui lòng bỏ qua email này.</p>
    </div>
    """


def _send_via_smtp(to_email: str, code: str) -> None:
    _load_env_if_needed()
    sender = os.getenv("SMTP_EMAIL", "").strip()
    app_password = os.getenv("SMTP_APP_PASSWORD", "").replace(" ", "").strip()

    msg = MIMEMultipart("alternative")
    msg["Subject"] = f"[PawDerm AI] Mã xác thực đăng ký: {code}"
    msg["From"] = f"PawDerm AI <{sender}>"
    msg["To"] = to_email
    msg.attach(MIMEText(f"Mã xác thực PawDerm AI của bạn là: {code} (hiệu lực 5 phút)", "plain", "utf-8"))
    msg.attach(MIMEText(_build_email_html(code), "html", "utf-8"))

    context = ssl.create_default_context()
    # Kết nối cổng 587 STARTTLS (chuẩn Google SMTP)
    try:
        server = smtplib.SMTP("smtp.gmail.com", 587, timeout=15)
        server.ehlo()
        server.starttls(context=context)
        server.ehlo()
        server.login(sender, app_password)
        server.sendmail(sender, [to_email], msg.as_string())
        server.quit()
    except (smtplib.SMTPRecipientsRefused, smtplib.SMTPResponseException, smtplib.SMTPAuthenticationError):
        raise
    except Exception:
        # Fallback qua cổng SSL 465
        with smtplib.SMTP_SSL("smtp.gmail.com", 465, context=context, timeout=15) as server:
            server.login(sender, app_password)
            server.sendmail(sender, [to_email], msg.as_string())


def send_otp(email: str) -> Dict[str, Any]:
    """Sinh và gửi mã OTP tới Gmail. Trả về dict {success, message|error, ...}."""
    email = normalize_email(email)
    if not is_valid_gmail(email):
        return {"success": False, "error": "Địa chỉ Gmail không hợp lệ! (ví dụ: tenban@gmail.com)"}

    now = time.time()
    with _lock:
        existing = _otp_store.get(email)
        if existing and now - existing["sent_at"] < RESEND_COOLDOWN_SECONDS:
            wait = int(RESEND_COOLDOWN_SECONDS - (now - existing["sent_at"]))
            return {"success": False, "error": f"Vui lòng chờ {wait} giây trước khi gửi lại mã.", "retry_after": wait}

    code = f"{secrets.randbelow(1_000_000):06d}"

    if _smtp_configured():
        try:
            _send_via_smtp(email, code)
        except smtplib.SMTPRecipientsRefused:
            return {"success": False, "error": "Google phản hồi: địa chỉ Gmail này không tồn tại trên Google!"}
        except smtplib.SMTPResponseException as e_resp:
            err_msg = str(e_resp)
            if e_resp.smtp_code == 550 or "5.1.1" in err_msg or "does not exist" in err_msg.lower():
                return {"success": False, "error": "Google phản hồi: địa chỉ Gmail này không tồn tại trên Google!"}
            print(f"[SMTP ERROR] Code {e_resp.smtp_code}: {err_msg}")
            return {"success": False, "error": "Lỗi từ máy chủ Google khi gửi email."}
        except smtplib.SMTPAuthenticationError:
            print("[SMTP ERROR] Sai SMTP_EMAIL hoac SMTP_APP_PASSWORD trong .env")
            return {"success": False, "error": "Máy chủ email chưa được cấu hình đúng. Vui lòng liên hệ quản trị viên."}
        except Exception as e:
            err_text = str(e)
            if "550" in err_text or "does not exist" in err_text.lower():
                return {"success": False, "error": "Google phản hồi: địa chỉ Gmail này không tồn tại trên Google!"}
            print(f"[SMTP ERROR] Loi gui email OTP: {e}")
            return {"success": False, "error": "Không gửi được email xác thực, vui lòng thử lại sau."}
        dev_mode = False
    else:
        print(f"\n[DEV MODE - OTP]: Ma xac thuc cho {email} la: {code}\n")
        dev_mode = True

    with _lock:
        _otp_store[email] = {
            "code": code,
            "expires": now + OTP_TTL_SECONDS,
            "attempts": 0,
            "sent_at": now,
        }

    return {
        "success": True,
        "message": f"Đã gửi mã xác thực 6 số tới {email}. Vui lòng kiểm tra hộp thư (cả mục Spam).",
        "expires_in": OTP_TTL_SECONDS,
        "resend_after": RESEND_COOLDOWN_SECONDS,
        "dev_mode": dev_mode,
    }


def verify_otp(email: str, code: str) -> Dict[str, Any]:
    """Kiểm tra mã OTP. Đúng -> cấp verification_token dùng một lần cho bước đăng ký."""
    email = normalize_email(email)
    code = (code or "").strip()
    now = time.time()

    with _lock:
        entry = _otp_store.get(email)
        if not entry:
            return {"success": False, "error": "Bạn chưa yêu cầu mã hoặc mã đã hết hạn. Hãy bấm 'Gửi mã'."}
        if now > entry["expires"]:
            _otp_store.pop(email, None)
            return {"success": False, "error": "Mã xác thực đã hết hạn. Vui lòng gửi lại mã mới."}
        if entry["attempts"] >= MAX_VERIFY_ATTEMPTS:
            _otp_store.pop(email, None)
            return {"success": False, "error": "Bạn đã nhập sai quá nhiều lần. Vui lòng gửi lại mã mới."}

        if not secrets.compare_digest(entry["code"], code):
            entry["attempts"] += 1
            left = MAX_VERIFY_ATTEMPTS - entry["attempts"]
            return {"success": False, "error": f"Mã xác thực không đúng! Còn {left} lần thử."}

        _otp_store.pop(email, None)
        token = secrets.token_urlsafe(32)
        _token_store[token] = {"email": email, "expires": now + TOKEN_TTL_SECONDS}

    return {"success": True, "verification_token": token, "message": "Xác thực Gmail thành công! ✅"}


def consume_verification_token(email: str, token: str) -> bool:
    """Dùng token (một lần) khi đăng ký. Trả về True nếu token hợp lệ và khớp email."""
    email = normalize_email(email)
    with _lock:
        entry = _token_store.get(token or "")
        if not entry:
            return False
        if entry["email"] != email or time.time() > entry["expires"]:
            return False
        _token_store.pop(token, None)
        return True


def peek_verification_token(email: str, token: str) -> bool:
    """Kiểm tra token mà không tiêu thụ (dùng để validate trước khi ghi DB)."""
    email = normalize_email(email)
    with _lock:
        entry = _token_store.get(token or "")
        return bool(entry and entry["email"] == email and time.time() <= entry["expires"])
