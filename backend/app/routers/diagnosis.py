"""
PawDerm AI - AI Diagnosis & History Tracking Router
"""

import json
import base64
from typing import Optional
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Query
from app.database.supabase_service import SupabaseService
from app.services.ai_inference import AIInferenceService

router = APIRouter(prefix="/api", tags=["Diagnosis & History"])


@router.post("/diagnose")
async def run_diagnosis(
    user_id: str = Form(...),
    pet_id: Optional[str] = Form(None),
    pet_name: str = Form("Bé cưng"),
    species: str = Form("Chó 🐶"),
    breed: str = Form("Chưa rõ"),
    symptoms: str = Form("[]"),
    day_number: int = Form(1),
    progression_notes: str = Form(""),
    image: Optional[UploadFile] = File(None)
):
    """
    Tiếp nhận ảnh và thông tin lâm sàng -> Chạy suy luận AI -> Lưu bệnh án vào Supabase.
    Hỗ trợ theo dõi tiến triển bệnh qua từng ngày (day_number, progression_notes).
    """
    try:
        try:
            symptoms_list = json.loads(symptoms)
        except Exception:
            symptoms_list = [s.strip() for s in symptoms.split(",") if s.strip()]

        image_bytes = None
        image_data_url = ""
        if image:
            image_bytes = await image.read()
            b64_str = base64.b64encode(image_bytes).decode('utf-8')
            mime_type = image.content_type or "image/jpeg"
            image_data_url = f"data:{mime_type};base64,{b64_str}"

        # 1. Chạy suy luận AI qua AIInferenceService
        pet_data = {
            "name": pet_name,
            "species": species,
            "breed": breed,
            "symptoms": symptoms_list
        }
        ai_result = AIInferenceService.predict(
            image_bytes=image_bytes,
            pet_data=pet_data
        )

        # 2. Lưu bản ghi chẩn đoán vào Supabase
        record_payload = {
            "user_id": user_id,
            "pet_id": pet_id,
            "disease_key": ai_result["disease_key"],
            "disease_name_vi": ai_result["disease_name_vi"],
            "disease_name_en": ai_result["disease_name_en"],
            "confidence": ai_result["confidence"],
            "probabilities": ai_result["probabilities"],
            "severity_level": ai_result["severity_level"],
            "severity_badge": ai_result["severity_badge"],
            "clinical_notes": f"Triệu chứng ghi nhận: {', '.join(symptoms_list)}",
            "image_url": image_data_url,
            "day_number": day_number,
            "progression_notes": progression_notes
        }
        saved = SupabaseService.save_diagnosis_record(record_payload)

        return {
            "success": True,
            "pet": pet_data,
            "diagnosis": ai_result,
            "record": saved.get("record", {})
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Lỗi phân tích AI: {str(e)}")


@router.get("/history")
def get_history(user_id: Optional[str] = None, pet_id: Optional[str] = None):
    """Lấy danh sách lịch sử chẩn đoán hoặc timeline tiến triển của bé qua các ngày."""
    history = SupabaseService.get_diagnosis_history(user_id=user_id, pet_id=pet_id)
    return {"success": True, "records": history}
