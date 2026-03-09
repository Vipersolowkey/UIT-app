import json
from app.services.retriever import retrieve_context
from app.services.groq_client import groq_chat

def _build_exam_prompt(subject: str, topic: str, n: int, difficulty: int, qtype: str, contexts: list[str]) -> list[dict]:
    context_block = "\n\n---\n\n".join(contexts[:8])

    user = f"""
Bạn đang tạo đề luyện tập dựa trên tài liệu có sẵn.

SUBJECT: {subject}
TOPIC: {topic}
SỐ CÂU: {n}
ĐỘ KHÓ (1-5): {difficulty}
LOẠI: {qtype}

CONTEXT (chỉ được dùng nội dung trong phần này để ra đề):
{context_block}

YÊU CẦU:
- Nếu mcq: mỗi câu có 4 lựa chọn, dạng ["A. ...","B. ...","C. ...","D. ..."]
- Answer: chỉ "A"/"B"/"C"/"D" (với mcq) hoặc câu trả lời ngắn (với short)
- Explanation: 1-3 câu, có nhắc lại ý trong CONTEXT.
- Không bịa kiến thức ngoài CONTEXT. Nếu CONTEXT thiếu, tạo câu ở mức tổng quan và ghi explanation là "Dựa trên tài liệu cung cấp".

TRẢ VỀ JSON DUY NHẤT theo schema:

{{
  "questions": [
    {{
      "stem": "...",
      "choices": ["A. ...","B. ...","C. ...","D. ..."],
      "answer": "A",
      "explanation": "..."
    }}
  ]
}}

Chỉ trả JSON, không thêm chữ khác.
""".strip()

    return [{"role": "user", "content": user}]

def generate_exam_rag(subject: str, topic: str, num_questions: int, difficulty: int, qtype: str, top_k: int = 6):
    query = f"{subject} - {topic}"
    contexts, citations = retrieve_context(query=query, top_k=top_k)

    messages = _build_exam_prompt(subject, topic, num_questions, difficulty, qtype, contexts)
    raw = groq_chat(messages)

    # Robust JSON parse (LLM đôi khi kẹp text)
    try:
        data = json.loads(raw)
    except Exception:
        # cố cứu bằng cách tìm block json
        start = raw.find("{")
        end = raw.rfind("}")
        if start != -1 and end != -1 and end > start:
            data = json.loads(raw[start:end+1])
        else:
            raise

    questions = data.get("questions", [])
    # attach citations (toàn bài)
    used_sources = [c.model_dump() for c in citations]

    # attach citations per question (MVP: gán chung)
    for q in questions:
        q["citations"] = used_sources[: min(3, len(used_sources))]

    return questions, used_sources