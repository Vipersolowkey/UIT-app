from pydantic import BaseModel
from typing import List, Optional, Literal, Dict, Any

QuestionType = Literal["mcq", "essay", "coding"]
ExamTiming = Literal["midterm", "final"]


class SubjectsResponse(BaseModel):
    subjects: List[str]


class ExamCounts(BaseModel):
    mcq: int = 0
    essay: int = 0
    coding: int = 0


class ExamCard(BaseModel):
    id: str
    title: str
    counts: ExamCounts


class ExamGroup(BaseModel):
    timing: ExamTiming
    label: str
    exams: List[ExamCard]


class ExamsResponse(BaseModel):
    subject: str
    groups: List[ExamGroup]


class MCQOut(BaseModel):
    id: str
    type: Literal["mcq"]
    question: str
    options: List[str]   # backend giữ dạng list string
    answer: Optional[str] = None  # có thể không trả về nếu muốn
    explain: Optional[str] = None
    topics: List[str] = []
    examTiming: ExamTiming
    subject: str


class EssayOut(BaseModel):
    id: str
    type: Literal["essay"]
    question: str
    rubric: List[str] = []
    maxScore: int = 10
    topics: List[str] = []
    examTiming: ExamTiming
    subject: str


class CodingOut(BaseModel):
    id: str
    type: Literal["coding"]
    title: str
    description: str
    languageTemplates: Dict[str, str] = {}
    samples: List[Dict[str, str]] = []
    timeLimitMs: int = 1500
    memoryLimitMb: int = 256
    topics: List[str] = []
    examTiming: ExamTiming
    subject: str


class ExamDetailResponse(BaseModel):
    exam_id: str
    subject: str
    timing: ExamTiming
    items: List[Dict[str, Any]]  # MVP: trả raw để FE tự map