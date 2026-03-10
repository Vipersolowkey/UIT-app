# app/main.py
from __future__ import annotations

import os
from pathlib import Path

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams

from app.routes.nudges import router as nudges_router
from app.routes.chat import router as chat_router
from app.routes.search import router as search_router
from app.routes.ingest import router as ingest_router
from app.routes.exams import router as exams_router
from app.routes.attempts import router as attempts_router
from app.routes.questions import router as questions_router

from app.services.question_bank_json import QuestionBankJSON

# ==============================
# Load env
# ==============================
load_dotenv()

QDRANT_HOST = os.getenv("QDRANT_HOST", "localhost")
QDRANT_PORT = int(os.getenv("QDRANT_PORT", "6333"))
COLLECTION_NAME = os.getenv("QDRANT_COLLECTION", "uit_docs")
VECTOR_SIZE = int(os.getenv("QDRANT_VECTOR_SIZE", "384"))

# ==============================
# Init Qdrant
# ==============================
QDRANT_URL = os.getenv("QDRANT_URL")
QDRANT_API_KEY = os.getenv("QDRANT_API_KEY")

if QDRANT_URL:
    qdrant = QdrantClient(
        url=QDRANT_URL,
        api_key=QDRANT_API_KEY
    )
else:
    qdrant = QdrantClient(
        host=QDRANT_HOST,
        port=QDRANT_PORT
    )


def ensure_collection() -> None:
    """
    Ensure Qdrant collection exists (idempotent).
    """
    if not qdrant.collection_exists(COLLECTION_NAME):
        print(f"⚙️ Creating collection: {COLLECTION_NAME}")
        qdrant.create_collection(
            collection_name=COLLECTION_NAME,
            vectors_config=VectorParams(size=VECTOR_SIZE, distance=Distance.COSINE),
        )
    else:
        print(f"✅ Collection '{COLLECTION_NAME}' already exists")


# ==============================
# Question bank (JSON)
# ==============================
# Cấu trúc repo: backend/
#  - app/
#    - main.py  (file này)
#  - data/
#    - questions.json
ROOT_DIR = Path(__file__).resolve().parents[1]   # .../backend
QUESTION_JSON_PATH = ROOT_DIR / "data" / "questions.json"

# init bank (load ở startup)
question_bank = QuestionBankJSON(str(QUESTION_JSON_PATH))

# (Tuỳ bạn) Nếu routes cần dùng shared instance:
# - Cách sạch nhất: trong routes import từ app.main sẽ tạo vòng
# => dùng app.state hoặc dependency trong routes.
# Ở main.py chỉ giữ instance, set vào app.state khi startup.


# ==============================
# FastAPI app
# ==============================
app = FastAPI(title="UIT RAG Assistant")

# ==============================
# CORS
# ==============================
ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "https://uit-app-three.vercel.app",
    "https://uit-9e15qerqg-vipersolowkeys-projects.vercel.app"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in ALLOWED_ORIGINS if o.strip()],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==============================
# Startup
# ==============================
@app.on_event("startup")
def startup_event():
    # 1) Qdrant
    try:
        ensure_collection()
    except Exception as e:
        # Nếu bạn muốn vẫn chạy app dù Qdrant down thì chỉ log cảnh báo
        print(f"⚠️ Qdrant not ready: {e}")

    # 2) Load questions
    try:
        question_bank.load()
        print(f"✅ Loaded question bank: {len(question_bank.items)} items")
        print(f"   from: {QUESTION_JSON_PATH}")
    except Exception as e:
        print(f"⚠️ Cannot load questions.json: {e}")
        print(f"   expected at: {QUESTION_JSON_PATH}")

    # 3) Share instance via app.state (khuyên dùng)
    app.state.question_bank = question_bank


# ==============================
# Routes
# ==============================
app.include_router(chat_router)
app.include_router(search_router)
app.include_router(ingest_router)
app.include_router(exams_router)
app.include_router(questions_router)
app.include_router(nudges_router)
app.include_router(attempts_router)

# ==============================
# Health check
# ==============================
@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/")
def root():
    return {"message": "UIT backend is running"}

import os
import uvicorn

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("app.main:app", host="0.0.0.0", port=port)