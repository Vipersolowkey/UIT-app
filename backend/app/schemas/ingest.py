from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime


# ==============================
# INGEST DOCUMENT
# ==============================

class IngestDocRequest(BaseModel):
    source: str = Field(..., description="Tên file / url / label")
    text: str = Field(..., description="Raw text đã extract từ PDF/Doc")
    page: Optional[int] = Field(None, description="Số trang nếu có")

    subject: Optional[str] = Field(None, description="Môn học")
    topic: Optional[str] = Field(None, description="Chủ đề chính")
    tags: Optional[List[str]] = Field(default_factory=list, description="Tag phân loại")

    metadata: Optional[Dict[str, Any]] = Field(
        default_factory=dict,
        description="Metadata bổ sung (semester, year, lecturer...)"
    )


class IngestDocResponse(BaseModel):
    inserted_chunks: int
    source: str
    subject: Optional[str]
    topic: Optional[str]
    created_at: datetime


# ==============================
# RETRIEVE RESULT (RAG)
# ==============================

class Citation(BaseModel):
    source: str
    page: Optional[int] = None
    chunk_id: Optional[str] = None
    excerpt: Optional[str] = None
    score: Optional[float] = None
    subject: Optional[str] = None
    topic: Optional[str] = None
    tags: Optional[List[str]] = None


class RetrieveRequest(BaseModel):
    query: str
    subject: Optional[str] = None
    topic: Optional[str] = None
    top_k: int = 5


class RetrieveResponse(BaseModel):
    query: str
    contexts: List[str]
    citations: List[Citation]
    total_results: int


# ==============================
# EXAM GENERATION (RAG)
# ==============================

class ExamGenRequest(BaseModel):
    subject: str
    topic: str

    num_questions: int = 5
    difficulty: int = Field(3, ge=1, le=5)

    question_type: str = Field(
        "mcq",
        description="mcq | short | true_false"
    )

    top_k: int = 6

    include_explanation: bool = True
    include_citations: bool = True


class GeneratedQuestion(BaseModel):
    stem: str
    choices: Optional[List[str]] = None
    answer: str
    explanation: Optional[str] = None
    citations: Optional[List[Citation]] = None


class ExamGenResponse(BaseModel):
    subject: str
    topic: str
    difficulty: int
    question_type: str

    questions: List[GeneratedQuestion]
    used_sources: List[Citation]

    total_questions: int
    generated_at: datetime