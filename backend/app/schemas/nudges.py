# backend/app/schemas/nudges.py
from pydantic import BaseModel
from typing import List, Optional, Literal, Dict, Any
from datetime import datetime

NudgeType = Literal["practice_mcq", "practice_essay", "practice_coding", "review", "mixed"]
ExamTiming = Literal["midterm", "final"]

class NudgeItem(BaseModel):
    id: str
    title: str
    description: str
    subject: str
    nudge_type: NudgeType = "practice_mcq"
    timing: Optional[ExamTiming] = None
    topic: Optional[str] = None
    num_questions: int = 10
    priority: int = 50  # số càng thấp càng ưu tiên
    icon: Optional[str] = "sparkles"  # FE có thể map icon theo string
    meta: Dict[str, Any] = {}

class NudgeListResponse(BaseModel):
    items: List[NudgeItem]
    generated_at: datetime

class AcceptNudgeRequest(BaseModel):
    nudge_id: str
    subject: Optional[str] = None
    topic: Optional[str] = None
    timing: Optional[ExamTiming] = None

    want_materials: bool = True
    want_practice: bool = True
    num_questions: int = 10

class AcceptNudgeResponse(BaseModel):
    nudge_id: str
    materials: List[Dict[str, str]] = []
    practice: List[Dict[str, Any]] = []  # trả raw items để FE tự render