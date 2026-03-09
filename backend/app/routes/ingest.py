import time
from fastapi import APIRouter, HTTPException
from app.schemas.ingest import IngestDocRequest, IngestDocResponse
from app.services.qdrant_store import ensure_collection, upsert_chunks
from app.services.chunking import simple_chunk

router = APIRouter(prefix="/ingest", tags=["ingest"])

@router.post("", response_model=IngestDocResponse)
def ingest_doc(req: IngestDocRequest):
    try:
        ensure_collection(vector_size=384)

        chunks_text = simple_chunk(req.text, chunk_size=900, overlap=120)
        chunks = []
        base = int(time.time() * 1000)
        for i, t in enumerate(chunks_text):
            chunks.append({
                "id": base + i,
                "text": t,
                "source": req.source,
                "page": req.page,
                "chunk_id": f"{req.source}#chunk{i}"
            })

        upsert_chunks(chunks)
        return IngestDocResponse(inserted_chunks=len(chunks), source=req.source)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))