from __future__ import annotations
import re
from typing import Dict, Any, List, Tuple

def _norm_text(s: str) -> str:
    s = (s or "").lower()
    s = re.sub(r"\s+", " ", s).strip()
    return s

def _tokenize(s: str) -> List[str]:
    s = _norm_text(s)
    # tách từ đơn giản
    return re.findall(r"[a-zA-ZÀ-ỹ0-9_]+", s)

def _contains_keyword(text: str, kw: str) -> bool:
    text = _norm_text(text)
    kw = _norm_text(kw)
    # match theo word boundary đơn giản
    return re.search(rf"(^|[^a-zA-ZÀ-ỹ0-9_]){re.escape(kw)}([^a-zA-ZÀ-ỹ0-9_]|$)", text) is not None

def grade_essay(answer_text: str, question: Dict[str, Any]) -> Dict[str, Any]:
    """
    question expected fields:
      - rubric: list[str] (keyword/ý chính)
      - maxScore: int
      - suggestedAnswer: str (optional)
    """
    max_score = int(question.get("maxScore") or 10)
    rubric = question.get("rubric") or []
    if not isinstance(rubric, list):
        rubric = []

    ans = answer_text or ""
    ans_norm = _norm_text(ans)

    # 1) keyword coverage
    matched = []
    missing = []
    for kw in rubric:
        if not kw:
            continue
        if _contains_keyword(ans_norm, str(kw)):
            matched.append(str(kw))
        else:
            missing.append(str(kw))

    coverage = (len(matched) / max(1, len(rubric)))  # 0..1

    # 2) length heuristic (khuyến khích 4-6 câu)
    tokens = _tokenize(ans)
    n_tokens = len(tokens)

    length_bonus = 0.0
    if n_tokens >= 60:
        length_bonus = 0.10
    elif n_tokens >= 35:
        length_bonus = 0.05
    elif n_tokens < 15:
        length_bonus = -0.10

    # 3) structure heuristic: có dấu gạch đầu dòng / đánh số / xuống dòng
    structure_bonus = 0.0
    if re.search(r"(\n- |\n\* |\n\d+[\)\.])", ans):
        structure_bonus += 0.05

    # 4) final similarity score (0..1)
    similarity = max(0.0, min(1.0, coverage + length_bonus + structure_bonus))

    # 5) map similarity -> score
    score = int(round(similarity * max_score))
    score = max(0, min(max_score, score))

    # 6) feedback theo mức độ
    feedback = []
    if similarity < 0.25:
        feedback.append("Bài còn thiếu ý chính, nên bám rubric và nêu định nghĩa ngắn gọn.")
        feedback.append("Nên viết rõ ràng theo gạch đầu dòng, mỗi ý kèm 1 ví dụ.")
    elif similarity < 0.5:
        feedback.append("Bạn có một phần ý đúng nhưng còn thiếu nhiều keyword/ý chính.")
        feedback.append("Hãy bổ sung định nghĩa + ví dụ cho từng ý trong rubric.")
    elif similarity < 0.75:
        feedback.append("Bài khá ổn, nhưng vẫn thiếu vài ý hoặc ví dụ minh hoạ.")
        feedback.append("Nên trình bày rõ từng mục để tăng điểm.")
    else:
        feedback.append("Bài rất tốt, đủ ý chính và trình bày rõ ràng.")
        feedback.append("Nếu có thể, bổ sung thêm ví dụ hoặc liên hệ thực tế để đạt điểm tối đa.")

    # cụ thể hoá missing
    if missing:
        feedback.append("Ý còn thiếu: " + ", ".join(missing[:8]) + ("..." if len(missing) > 8 else ""))

    return {
        "score": score,
        "maxScore": max_score,
        "similarity": float(similarity),
        "matched_keywords": matched,
        "missing_keywords": missing,
        "feedback": feedback,
        "suggested_answer": question.get("suggestedAnswer") or question.get("modelAnswer"),
    }