from pydantic import BaseModel
from typing import List, Optional, Literal, Dict, Any

# ===== Essay =====
class SubmitEssayRequest(BaseModel):
    questionId: str
    answerText: str

class SubmitEssayResponse(BaseModel):
    questionId: str
    score: int
    maxScore: int
    similarity: float  # 0..1
    matched_keywords: List[str] = []
    missing_keywords: List[str] = []
    feedback: List[str] = []
    suggested_answer: Optional[str] = None

# ===== MCQ submit (optional) =====
class SubmitMCQRequest(BaseModel):
    examId: str
    answers: Dict[str, str]  # qid -> optionId

class SubmitMCQResponse(BaseModel):
    examId: str
    total: int
    correct: int
    wrongIds: List[str]

# ===== Coding submit (mock) =====
class SubmitCodeRequest(BaseModel):
    problemId: str
    language: str
    sourceCode: str
    mode: Literal["sample", "tests"] = "sample"

class SubmitCodeResponse(BaseModel):
    status: str
    passed: int
    total: int
    results: List[Dict[str, Any]]