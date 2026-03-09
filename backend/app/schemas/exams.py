from pydantic import BaseModel, Field
from typing import List, Optional, Any, Dict

class SubjectsResponse(BaseModel):
    subjects: List[str] = Field(default_factory=list)

class TopicsResponse(BaseModel):
    subject: str
    topics: List[str] = Field(default_factory=list)

class RandomQuestionRequest(BaseModel):
    subject: str
    limit: int = 5
    topics: Optional[List[str]] = None

class RandomQuestionResponse(BaseModel):
    subject: str
    count: int
    questions: List[Dict[str, Any]] = Field(default_factory=list)