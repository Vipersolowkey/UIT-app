# backend/app/routes/nudges.py
from fastapi import APIRouter, HTTPException
from datetime import datetime

from app.schemas.nudges import (
    NudgeListResponse, NudgeItem,
    AcceptNudgeRequest, AcceptNudgeResponse
)
from app.services.nudges_service import get_today_nudges, get_materials, build_practice

router = APIRouter(prefix="/nudges", tags=["nudges"])


@router.get("/today", response_model=NudgeListResponse)
def today():
    items = get_today_nudges()
    return NudgeListResponse(
        items=[NudgeItem(**x) for x in items],
        generated_at=datetime.utcnow()
    )


@router.post("/accept", response_model=AcceptNudgeResponse)
def accept(req: AcceptNudgeRequest):
    if not req.nudge_id:
        raise HTTPException(status_code=400, detail="nudge_id is required")

    # subject ưu tiên lấy từ body
    subject = (req.subject or "").strip().lower()
    if not subject:
        # fallback: thử parse từ nudge_id kiểu "oop_midterm_2026-03-04_mcq"
        subject = req.nudge_id.split("_")[0].strip().lower() if "_" in req.nudge_id else "unknown"

    materials = get_materials(subject) if req.want_materials else []

    practice = []
    if req.want_practice:
        # nudge_type: bạn có thể truyền từ FE, hoặc backend suy ra theo id
        # MVP: suy ra đơn giản
        nudge_type = "practice_mcq"
        if "coding" in req.nudge_id:
            nudge_type = "practice_coding"
        elif "essay" in req.nudge_id:
            nudge_type = "practice_essay"

        practice = build_practice(
            subject=subject,
            topic=req.topic,
            timing=req.timing,
            num_questions=req.num_questions,
            nudge_type=nudge_type,
        )

    return AcceptNudgeResponse(
        nudge_id=req.nudge_id,
        materials=materials,
        practice=practice
    )