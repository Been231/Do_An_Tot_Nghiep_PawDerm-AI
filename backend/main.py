"""
PawDerm AI - REST API Server (FastAPI Clean Architecture)
Điều phối các Router theo phân hệ:
  1. Auth & Profile Router: /api/auth
  2. Pets Router: /api/pets
  3. Diagnosis & History Router: /api/diagnose, /api/history
  4. Doctor Router: /api/doctor
  5. Admin Router: /api/admin
"""

import sys
from pathlib import Path
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Đảm bảo thư mục backend luôn nằm trong sys.path
backend_dir = Path(__file__).resolve().parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from app.core import config
from app.routers import (
    auth as auth_module,
    pets as pets_module,
    diagnosis as diagnosis_module,
    doctor as doctor_module,
    admin as admin_module
)

app = FastAPI(
    title=f"{config.APP_NAME} API Gateway",
    description="Hệ thống REST API phục vụ Phân tích Da liễu Thú Cưng & Active Learning Đồ Án Tốt Nghiệp",
    version="2.0.0"
)

# Cấu hình CORS để Frontend React (Vite: localhost:5173) gọi mượt mà
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -----------------------------------------------------------------------------
# GẮN CÁC ROUTER CHỨC NĂNG THEO TỪNG PHÂN HỆ
# -----------------------------------------------------------------------------
app.include_router(auth_module.router)
app.include_router(pets_module.router)
app.include_router(diagnosis_module.router)
app.include_router(doctor_module.router)
app.include_router(admin_module.router)


@app.get("/api/health", tags=["Health"])
def health_check():
    """Kiểm tra tình trạng sẵn sàng của hệ thống."""
    return {
        "status": "healthy",
        "app_name": config.APP_NAME,
        "version": "2.0.0",
        "roles_supported": ["customer", "doctor", "admin"],
        "ai_engine": "AIInferenceService (YOLOv8/Roboflow Simulation & Hook)"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
