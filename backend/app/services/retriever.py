# backend/app/services/retriever.py
from __future__ import annotations

import os
from typing import List, Dict, Any, Optional

from qdrant_client import QdrantClient
from qdrant_client.models import Filter, FieldCondition, MatchValue

from app.services.embeddings import embed_text

QDRANT_HOST = os.getenv("QDRANT_HOST", "localhost")
QDRANT_PORT = int(os.getenv("QDRANT_PORT", 6333))
COLLECTION_NAME = os.getenv("QDRANT_COLLECTION", "uit_rag")


def _get_qdrant() -> QdrantClient:
    return QdrantClient(host=QDRANT_HOST, port=QDRANT_PORT)


def retrieve_context(
    query: str,
    top_k: int = 5,
    source: Optional[str] = None,
) -> Dict[str, Any]:
    """
    Trả về:
    {
      "contexts": [str, ...],
      "citations": [
         {"source": "...", "page": 1, "chunk_id": "...", "excerpt": "...", "score": 0.12},
         ...
      ]
    }
    """
    qdrant = _get_qdrant()

    vector = embed_text(query)

    q_filter = None
    if source:
        # nếu bạn upsert payload có field "source"
        q_filter = Filter(
            must=[FieldCondition(key="source", match=MatchValue(value=source))]
        )

    results = qdrant.search(
        collection_name=COLLECTION_NAME,
        query_vector=vector,
        limit=top_k,
        query_filter=q_filter,
        with_payload=True,
        with_vectors=False,
    )

    contexts: List[str] = []
    citations: List[Dict[str, Any]] = []

    for r in results:
        payload = r.payload or {}
        text = payload.get("text") or payload.get("chunk") or ""
        if text:
            contexts.append(text)

        citations.append(
            {
                "source": payload.get("source", "unknown"),
                "page": payload.get("page"),
                "chunk_id": payload.get("chunk_id") or str(r.id),
                "excerpt": (text[:200] + "...") if len(text) > 200 else text,
                "score": float(r.score) if r.score is not None else None,
            }
        )

    return {"contexts": contexts, "citations": citations}