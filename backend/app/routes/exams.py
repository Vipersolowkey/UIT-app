from fastapi import APIRouter, HTTPException
from app.schemas.exam_gen import ExamGenRequest, ExamGenResponse, GeneratedQuestion
from app.services.exam_generator_rag import generate_exam_rag

router = APIRouter(prefix="/exams", tags=["exams"])

@router.post("/generate-rag", response_model=ExamGenResponse)
def generate_rag(req: ExamGenRequest):
    try:
        questions, used_sources = generate_exam_rag(
            subject=req.subject,
            topic=req.topic,
            num_questions=req.num_questions,
            difficulty=req.difficulty or 3,
            qtype=req.question_type,
            top_k=req.top_k,
        )

        return ExamGenResponse(
            subject=req.subject,
            topic=req.topic,
            questions=[GeneratedQuestion(**q) for q in questions],
            used_sources=used_sources,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))