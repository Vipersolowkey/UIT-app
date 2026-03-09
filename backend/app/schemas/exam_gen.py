from pydantic import BaseModel
from typing import List, Optional

class ExamGenRequest(BaseModel):
    subject: str
    topic: str
    num_questions: int = 5
    difficulty: Optional[int] = 3  # 1-5
    question_type: str = "mcq"     # mcq | short
    top_k: int = 6                 # số chunk retrieve

class GeneratedQuestion(BaseModel):
    stem: str
    choices: Optional[List[str]] = None
    answer: str
    explanation: Optional[str] = ""
    citations: Optional[List[dict]] = None

class ExamGenResponse(BaseModel):
    subject: str
    topic: str
    questions: List[GeneratedQuestion]
    used_sources: List[dict]