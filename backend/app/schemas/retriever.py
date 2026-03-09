from app.services.qdrant_store import client
from app.core.config import settings
from app.services.embeddings import embed_text
from app.schemas.ingest import Citation

def retrieve_context(query: str, top_k: int = 5) -> tuple[list[str], list[Citation]]:
    qvec = embed_text(query)
    res = client.search(
        collection_name=settings.QDRANT_COLLECTION,
        query_vector=qvec,
        limit=top_k,
        with_payload=True,
    )

    contexts = []
    citations = []
    for r in res:
        payload = r.payload or {}
        text = payload.get("text", "")
        contexts.append(text)
        citations.append(
            Citation(
                source=payload.get("source", "unknown"),
                page=payload.get("page"),
                chunk_id=payload.get("chunk_id"),
                excerpt=(text[:240] + "…") if len(text) > 240 else text,
                score=float(r.score) if r.score is not None else None,
            )
        )
    return contexts, citations