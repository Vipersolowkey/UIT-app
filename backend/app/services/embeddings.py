from __future__ import annotations

import os
from typing import List
from dotenv import load_dotenv

load_dotenv()

_EMBED_MODEL_NAME = os.getenv("EMBED_MODEL", "sentence-transformers/all-MiniLM-L6-v2")
_model = None


def _get_model():
    global _model
    if _model is None:
        from sentence_transformers import SentenceTransformer
        _model = SentenceTransformer(_EMBED_MODEL_NAME)
    return _model


def embed_texts(texts: List[str]) -> List[List[float]]:
    if not texts:
        return []
    model = _get_model()
    vectors = model.encode(
        texts,
        show_progress_bar=False,
        convert_to_numpy=True,
        normalize_embeddings=True,
    )
    return vectors.tolist()


def embed_text(text: str) -> List[float]:
    vecs = embed_texts([text])
    return vecs[0] if vecs else []