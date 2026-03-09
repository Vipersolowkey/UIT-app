from groq import Groq
from app.core.config import settings

client = Groq(api_key=settings.GROQ_API_KEY)

SYSTEM_PROMPT = """
Bạn là trợ lý AI của UIT.
- Trả lời bằng tiếng Việt.
- Không bịa. Chỉ dùng thông tin trong CONTEXT nếu được cung cấp.
- Nếu CONTEXT thiếu, hãy nói rõ phần nào thiếu và vẫn cố gắng đưa ra câu trả lời tổng quát (không khẳng định chi tiết).
- Không dùng markdown ### hoặc **.
- Nếu người dùng muốn câu trả lời có icon/emoji, hãy dùng emoji để chia mục rõ ràng.
""".strip()

def groq_chat(messages: list[dict], model="llama-3.1-8b-instant") -> str:
    resp = client.chat.completions.create(
        model=model,
        messages=[{"role": "system", "content": SYSTEM_PROMPT}, *messages],
        temperature=0.35,
        max_tokens=1400,
    )
    return resp.choices[0].message.content