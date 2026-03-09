from pydantic import BaseModel
from typing import Optional, List, Dict, Any

class ChatRequest(BaseModel):
    question: str
    mode: Optional[str] = "general"   # general | major_info | etc
    max_words: Optional[int] = 220    # ép trả lời dài hơn

class ChatResponse(BaseModel):
    answer: str
    citations: Optional[List[Dict[str, Any]]] = None