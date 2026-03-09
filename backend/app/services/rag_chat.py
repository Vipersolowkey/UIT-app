import os
from dotenv import load_dotenv
from typing import Dict, Any, List

from qdrant_client import QdrantClient
from sentence_transformers import SentenceTransformer

from app.services.groq_client import groq_chat

load_dotenv()

QDRANT_HOST = os.getenv("QDRANT_HOST", "localhost")
QDRANT_PORT = int(os.getenv("QDRANT_PORT", 6333))
COLLECTION_NAME = os.getenv("QDRANT_COLLECTION", "uit_rag")

qdrant = QdrantClient(host=QDRANT_HOST, port=QDRANT_PORT)
embed_model = SentenceTransformer("all-MiniLM-L6-v2")

def rag_chat(question: str, top_k: int = 3) -> Dict[str, Any]:
    # 1) embed query
    query_vec = embed_model.encode(question).tolist()

    # 2) query qdrant (API mới)
    resp = qdrant.query_points(
        collection_name=COLLECTION_NAME,
        query=query_vec,
        limit=top_k,
        with_payload=True,
        with_vectors=False,
    )

    # 3) build context + citations
    contexts: List[str] = []
    citations: List[Dict[str, Any]] = []

    for i, pt in enumerate(resp.points):
        payload = pt.payload or {}
        text = payload.get("text", "")
        source = payload.get("source", "unknown")
        chunk_id = payload.get("chunk_id")

        if text:
            contexts.append(f"[{i+1}] {text}")

        citations.append({
            "source": source,
            "chunk_id": chunk_id,
            "excerpt": (text[:200] + "...") if len(text) > 200 else text,
            "score": pt.score,
        })

    context_text = "\n\n".join(contexts).strip()

    prompt = f"""
Bạn là trợ lý học vụ UIT.
Chỉ trả lời dựa trên Context bên dưới. Nếu không đủ thông tin trong Context, hãy nói không đủ dữ liệu và gợi ý người dùng cung cấp thêm.

Context:
{context_text if context_text else "(Không tìm thấy ngữ cảnh phù hợp)"}

Câu hỏi:
{question}

Trả lời tiếng Việt.
""".strip()

    answer = groq_chat(prompt)

    return {"answer": answer, "citations": citations}