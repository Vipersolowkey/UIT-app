from qdrant_client import QdrantClient
from qdrant_client.models import VectorParams, Distance, PointStruct
from app.core.config import settings
from app.services.embeddings import embed_texts

client = QdrantClient(host=settings.QDRANT_HOST, port=settings.QDRANT_PORT)

def ensure_collection(vector_size: int = 384):
    name = settings.QDRANT_COLLECTION
    if not client.collection_exists(name):
        client.create_collection(
            collection_name=name,
            vectors_config=VectorParams(size=vector_size, distance=Distance.COSINE),
        )

def upsert_chunks(chunks: list[dict]):
    """
    chunks: [{id, text, source, page, chunk_id}]
    """
    texts = [c["text"] for c in chunks]
    vectors = embed_texts(texts)

    points = []
    for i, c in enumerate(chunks):
        points.append(
            PointStruct(
                id=c["id"],
                vector=vectors[i],
                payload={
                    "text": c["text"],
                    "source": c.get("source"),
                    "page": c.get("page"),
                    "chunk_id": c.get("chunk_id"),
                },
            )
        )

    client.upsert(collection_name=settings.QDRANT_COLLECTION, points=points)