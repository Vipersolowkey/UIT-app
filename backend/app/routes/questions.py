from fastapi import APIRouter, HTTPException, Query
from app.schemas.questions import SubjectsResponse, ExamsResponse, ExamDetailResponse
from app.services.question_bank import get_subjects, list_exams, get_exam_items

router = APIRouter(prefix="/questions", tags=["questions"])


@router.get("/subjects", response_model=SubjectsResponse)
def subjects():
    return SubjectsResponse(subjects=get_subjects())


@router.get("/exams", response_model=ExamsResponse)
def exams(subject: str = Query(...)):
    subject = subject.strip().lower()
    if not subject:
        raise HTTPException(status_code=400, detail="subject is required")
    return ExamsResponse(**list_exams(subject))


@router.get("/exam/{exam_id}", response_model=ExamDetailResponse)
def exam_detail(exam_id: str):
    subject, timing, items = get_exam_items(exam_id)
    if not subject or not timing:
        raise HTTPException(status_code=404, detail="exam not found")
    return ExamDetailResponse(exam_id=exam_id, subject=subject, timing=timing, items=items)