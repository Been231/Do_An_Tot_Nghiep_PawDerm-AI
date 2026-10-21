"""
PawDerm AI - Pet Management Router
"""

from typing import Dict, Any, Optional
from fastapi import APIRouter, HTTPException, Query, Body
from app.database.supabase_service import SupabaseService

router = APIRouter(prefix="/api/pets", tags=["Pets"])


@router.get("")
def get_pets(user_id: Optional[str] = Query(None)):
    """Lấy danh sách hồ sơ thú cưng của khách hàng."""
    if not user_id:
        return {"success": True, "pets": []}
    pets = SupabaseService.get_user_pets(user_id)
    return {"success": True, "pets": pets}


@router.post("")
def create_pet(payload: Dict[str, Any] = Body(...)):
    """Tạo hồ sơ thú cưng mới (tên, loài, giống, tuổi, cân nặng...)."""
    user_id = payload.get("user_id")
    pet_data = payload.get("pet", {})
    if not user_id or not pet_data.get("name"):
        raise HTTPException(status_code=400, detail="Thiếu thông tin thú cưng bắt buộc!")
    result = SupabaseService.create_pet(user_id, pet_data)
    return result


@router.delete("/{pet_id}")
def delete_pet(pet_id: str):
    """Xóa hồ sơ thú cưng."""
    success = SupabaseService.delete_pet(pet_id)
    return {"success": success}
