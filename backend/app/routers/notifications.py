"""
PawDerm AI - Notifications Router
Frontend polling định kỳ (30 giây) để hiển thị chuông thông báo theo vai trò.
"""

from fastapi import APIRouter, Query
from app.database.supabase_service import SupabaseService

router = APIRouter(prefix="/api/notifications", tags=["Notifications"])


@router.get("")
def get_notifications(
    user_id: str = Query(...),
    role: str = Query("customer", pattern="^(customer|doctor|admin)$"),
    limit: int = Query(20, ge=1, le=50),
):
    """Lấy danh sách thông báo mới nhất cho người dùng."""
    items = SupabaseService.get_notifications(user_id, role, limit)
    return {"success": True, "notifications": items, "count": len(items)}
