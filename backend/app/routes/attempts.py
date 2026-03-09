from fastapi import APIRouter
from app.schemas.attempts import (
    SubmitEssayRequest, SubmitEssayResponse,
    SubmitMCQRequest, SubmitMCQResponse,
    SubmitCodeRequest, SubmitCodeResponse
)

router = APIRouter(prefix="/attempts", tags=["attempts"])


def _normalize(s: str) -> str:
    return (s or "").strip().lower()


def _simple_similarity(answer: str, keywords: list[str]) -> tuple[float, list[str], list[str]]:
    """
    Similarity MVP: keyword coverage + length bonus + structure bonus.
    Return: (0..1), matched, missing
    """
    text = _normalize(answer)

    kws = [k.strip() for k in (keywords or []) if str(k).strip()]
    matched = [k for k in kws if _normalize(k) in text]
    missing = [k for k in kws if _normalize(k) not in text]

    # keyword coverage
    coverage = len(matched) / max(1, len(kws)) if kws else 0.0

    # length bonus
    n = len(answer.strip())
    length_bonus = 0.0
    if n >= 350:
        length_bonus = 0.18
    elif n >= 220:
        length_bonus = 0.12
    elif n >= 120:
        length_bonus = 0.07
    elif n < 40:
        length_bonus = -0.10

    # structure bonus: bullet / numbering / newline
    structure_bonus = 0.06 if ("\n-" in answer or "\n*" in answer or "\n1" in answer or "\n2" in answer) else 0.0

    sim = max(0.0, min(1.0, coverage + length_bonus + structure_bonus))
    return sim, matched, missing


@router.post("/submit-essay", response_model=SubmitEssayResponse)
def submit_essay(req: SubmitEssayRequest):
    text = (req.answerText or "").strip()

    if not text:
        return SubmitEssayResponse(
            questionId=req.questionId,
            score=0,
            maxScore=10,
            similarity=0.0,
            matched_keywords=[],
            missing_keywords=[],
            feedback=["Bạn chưa nhập câu trả lời."],
            suggested_answer="Gợi ý: Nêu định nghĩa → giải thích → ví dụ → kết luận."
        )

    # MVP keywords (sau này: lấy theo questionId từ question_bank)
    keywords = [
        "định nghĩa", "ví dụ", "kết luận",
        "đóng gói", "kế thừa", "đa hình", "trừu tượng",
        "encapsulation", "inheritance", "polymorphism", "abstraction",
    ]

    sim, matched, missing = _simple_similarity(text, keywords)

    max_score = 10
    score = int(round(sim * max_score))
    score = max(0, min(max_score, score))

    feedback: list[str] = []
    if sim < 0.25:
        feedback += [
            "Bài còn thiếu ý chính. Hãy bám theo các keyword gợi ý.",
            "Nên viết theo từng ý, mỗi ý có 1 ví dụ minh họa."
        ]
    elif sim < 0.5:
        feedback += [
            "Có một phần đúng nhưng thiếu khá nhiều ý quan trọng.",
            "Bổ sung định nghĩa + ví dụ cho từng ý."
        ]
    elif sim < 0.75:
        feedback += [
            "Bài khá ổn. Bổ sung thêm ví dụ/giải thích rõ hơn để tăng điểm."
        ]
    else:
        feedback += [
            "Bài rất tốt, đủ ý chính và trình bày rõ ràng."
        ]

    if missing:
        feedback.append("Ý còn thiếu: " + ", ".join(missing[:8]) + ("..." if len(missing) > 8 else ""))

    suggested = (
        "Đáp án gợi ý (OOP - 4 tính chất):\n"
        "- Đóng gói (Encapsulation): che giấu dữ liệu, expose qua method/getter/setter.\n"
        "  Ví dụ: private field + public getter/setter.\n"
        "- Kế thừa (Inheritance): lớp con kế thừa thuộc tính/phương thức lớp cha.\n"
        "  Ví dụ: class Student extends Person.\n"
        "- Đa hình (Polymorphism): cùng interface nhưng hành vi khác nhau (override/overload).\n"
        "  Ví dụ: Person p = new Student(); p.speak() chạy theo Student.\n"
        "- Trừu tượng (Abstraction): tập trung vào bản chất, bỏ chi tiết; abstract class/interface.\n"
        "  Ví dụ: interface Shape { area(); }.\n"
        "Kết luận: OOP giúp code dễ mở rộng, bảo trì, tái sử dụng."
    )

    return SubmitEssayResponse(
        questionId=req.questionId,
        score=score,
        maxScore=max_score,
        similarity=sim,
        matched_keywords=matched,
        missing_keywords=missing,
        feedback=feedback,
        suggested_answer=suggested
    )


@router.post("/submit-mcq", response_model=SubmitMCQResponse)
def submit_mcq(req: SubmitMCQRequest):
    total = len(req.answers or {})
    return SubmitMCQResponse(
        examId=req.examId,
        total=total,
        correct=0,
        wrongIds=list((req.answers or {}).keys()),
    )


@router.post("/submit-code", response_model=SubmitCodeResponse)
def submit_code(req: SubmitCodeRequest):
    # MOCK judge
    return SubmitCodeResponse(
        status="MOCK_OK",
        passed=1 if req.mode == "sample" else 0,
        total=1 if req.mode == "sample" else 3,
        results=[
            {"ok": True, "status": "Accepted", "expected": "mock", "stdout": "mock", "stderr": ""}
        ] if req.mode == "sample" else [
            {"ok": False, "status": "Wrong Answer", "expected": "42", "stdout": "41", "stderr": ""}
        ],
    )