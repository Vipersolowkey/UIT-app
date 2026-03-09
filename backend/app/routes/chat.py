from fastapi import APIRouter, HTTPException
from app.schemas.chat import ChatRequest, ChatResponse
from app.services.groq_client import groq_chat
import traceback

router = APIRouter(prefix="/chat", tags=["chat"])


def style_instructions(user_q: str) -> str:
    q = user_q.lower()
    if "ngành" in q or "uit" in q:
        return (
            "Trả lời chi tiết, có emoji, có cấu trúc theo các mục:\n"
            "🎓 Tổng quan\n📚 Học gì\n💼 Cơ hội việc làm\n🚀 Lộ trình\n❓ Câu hỏi chốt\n"
            "Không dùng ký tự # hoặc *."
        )
    if "mệnh đề" in q or "toán" in q or "rời rạc" in q:
        return (
            "Trả lời chính xác, rõ ràng, giải thích từng bước.\n"
            "Không dùng ký tự # hoặc *."
        )
    return "Trả lời đúng trọng tâm. Không dùng ký tự # hoặc *."


@router.post("", response_model=ChatResponse)
def chat(req: ChatRequest):
    try:
        messages = [
            {"role": "user", "content": req.question},
            {"role": "user", "content": style_instructions(req.question)},
        ]
        answer = groq_chat(messages)
        return ChatResponse(answer=answer)
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))