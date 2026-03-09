# app/services/question_bank.py
from __future__ import annotations

from pathlib import Path
import json
from collections import defaultdict
import random
import hashlib
from typing import Any

# ==============================
# Locate questions.json
# ==============================
BASE_DIR = Path(__file__).resolve().parents[2]  # .../backend
DATA_PATH = BASE_DIR / "data" / "questions.json"

_DB: list[dict] = []
_LOADED = False


def _norm(s: str | None) -> str:
    return (s or "").strip().lower()


def _norm_timing(t: str | None) -> str:
    t = _norm(t)
    if t in ("mid", "mid-term", "midterm", "giua_ky", "giữa kỳ", "giua ky"):
        return "midterm"
    if t in ("final", "cuoi_ky", "cuối kỳ", "cuoi ky"):
        return "final"
    return t


def _get_exam_id(q: dict) -> str:
    return str(q.get("examId") or q.get("exam_id") or q.get("exam") or q.get("examCode") or "").strip()


def _get_subject(q: dict) -> str:
    return _norm(q.get("subject"))


def _get_exam_timing(q: dict) -> str:
    return _norm_timing(q.get("examTiming") or q.get("timing"))


def _get_type(q: dict) -> str:
    t = _norm(q.get("type"))
    if t in ("trac_nghiem", "trắc nghiệm", "mcq"):
        return "mcq"
    if t in ("tu_luan", "tự luận", "essay"):
        return "essay"
    if t in ("code", "coding"):
        return "coding"
    return t or "mcq"


def _stable_hash(*parts: Any) -> str:
    s = "||".join([str(p) for p in parts])
    return hashlib.md5(s.encode("utf-8")).hexdigest()[:12]


def _primary_topic(q: dict) -> str:
    """
    Lấy topic chính để grouping.
    Ưu tiên topics[0], nếu thiếu thì 'misc'
    """
    topics = q.get("topics") or []
    if isinstance(topics, list) and len(topics) > 0:
        t0 = _norm(str(topics[0]))
        return t0 or "misc"
    return "misc"


def _ensure_loaded() -> None:
    global _DB, _LOADED
    if _LOADED:
        return

    if not DATA_PATH.exists():
        print(f"⚠️ questions.json not found at: {DATA_PATH}")
        _DB = []
        _LOADED = True
        return

    try:
        with open(DATA_PATH, "r", encoding="utf-8") as f:
            data = json.load(f)

        # nếu file là {items:[...]} thì lấy items
        if isinstance(data, dict) and "items" in data:
            data = data["items"]

        if not isinstance(data, list):
            print(f"⚠️ questions.json must be a list (or dict with items). Got: {type(data)}")
            _DB = []
            _LOADED = True
            return

        cleaned: list[dict] = []
        for q in data:
            if not isinstance(q, dict):
                continue

            exam_id = _get_exam_id(q)
            subject = _get_subject(q)
            exam_timing = _get_exam_timing(q)
            qtype = _get_type(q)

            # Bắt buộc có đủ để FE không bị “đề trống”
            if not exam_id or not subject or exam_timing not in ("midterm", "final"):
                continue

            q2 = dict(q)

            # ✅ IMPORTANT: item id phải là UNIQUE cho từng câu
            # Nếu file không có id riêng, tự tạo hash dựa vào nội dung (type + question/title + examId)
            raw_id = str(q.get("id") or q.get("qid") or "").strip()
            if not raw_id:
                if qtype == "mcq":
                    stem = q.get("question") or q.get("text") or ""
                    raw_id = f"mcq_{_stable_hash(exam_id, subject, exam_timing, stem, q.get('options'))}"
                elif qtype == "essay":
                    stem = q.get("question") or q.get("text") or ""
                    raw_id = f"essay_{_stable_hash(exam_id, subject, exam_timing, stem)}"
                else:
                    title = q.get("title") or q.get("name") or ""
                    raw_id = f"coding_{_stable_hash(exam_id, subject, exam_timing, title)}"

            q2["id"] = raw_id
            q2["type"] = qtype
            q2["subject"] = subject
            q2["examTiming"] = exam_timing
            q2["examId"] = exam_id

            # normalize topics
            if "topics" not in q2 or q2["topics"] is None:
                q2["topics"] = []
            if not isinstance(q2["topics"], list):
                q2["topics"] = [str(q2["topics"])]

            cleaned.append(q2)

        _DB = cleaned
        _LOADED = True
        print(f"✅ Loaded questions.json: {len(_DB)} items from {DATA_PATH}")
    except Exception as e:
        print(f"⚠️ Cannot load questions.json: {e}")
        _DB = []
        _LOADED = True


# ==============================
# Public APIs used by routes
# ==============================
def get_subjects() -> list[str]:
    _ensure_loaded()
    return sorted({q["subject"] for q in _DB})


def list_exams(subject: str) -> dict:
    """
    Must match schema:
    ExamsResponse:
      subject: str
      groups: [{timing,label,exams:[{id,title,counts:{mcq,essay,coding}}]}]
    """
    _ensure_loaded()
    subject = _norm(subject)

    rows = [q for q in _DB if q.get("subject") == subject]

    # Group all items by examId
    by_exam: dict[str, list[dict]] = defaultdict(list)
    for q in rows:
        by_exam[str(q.get("examId"))].append(q)

    summaries = []
    for exam_id, items in by_exam.items():
        timing = _norm_timing(items[0].get("examTiming"))
        if timing not in ("midterm", "final"):
            continue

        counts = {"mcq": 0, "essay": 0, "coding": 0}
        for it in items:
            t = _get_type(it)
            if t in counts:
                counts[t] += 1

        title = (
            items[0].get("examTitle")
            or items[0].get("title")
            or f"Đề {('Giữa kỳ' if timing == 'midterm' else 'Cuối kỳ')} ({subject.upper()})"
        )

        summaries.append({"id": exam_id, "title": title, "timing": timing, "counts": counts})

    mid = [x for x in summaries if x["timing"] == "midterm"]
    fin = [x for x in summaries if x["timing"] == "final"]

    groups = []
    if mid:
        groups.append({"timing": "midterm", "label": "Giữa kỳ", "exams": mid})
    if fin:
        groups.append({"timing": "final", "label": "Cuối kỳ", "exams": fin})

    return {"subject": subject, "groups": groups}


# ==============================
# ✅ Balanced sampling (trộn topic)
# ==============================
def _dedupe_by_id(items: list[dict]) -> list[dict]:
    seen = set()
    out = []
    for q in items:
        qid = str(q.get("id"))
        if not qid or qid in seen:
            continue
        seen.add(qid)
        out.append(q)
    return out


def _balanced_mcq(items: list[dict], k: int) -> list[dict]:
    """
    Trộn theo topic để tránh bị dồn 1 chủ đề (loop).
    - group theo topic chính (topics[0])
    - round-robin lấy đều
    """
    items = _dedupe_by_id(items)
    if not items:
        return []

    by_topic: dict[str, list[dict]] = defaultdict(list)
    for q in items:
        by_topic[_primary_topic(q)].append(q)

    # shuffle trong từng topic
    topics = list(by_topic.keys())
    for t in topics:
        random.shuffle(by_topic[t])

    # ưu tiên topic có nhiều câu trước nhưng vẫn round-robin
    topics.sort(key=lambda t: len(by_topic[t]), reverse=True)

    picked: list[dict] = []
    used = set()

    # round-robin
    while len(picked) < k:
        progressed = False
        for t in topics:
            if len(picked) >= k:
                break
            if not by_topic[t]:
                continue
            q = by_topic[t].pop()
            qid = str(q.get("id"))
            if qid in used:
                continue
            used.add(qid)
            picked.append(q)
            progressed = True
        if not progressed:
            break

    # nếu chưa đủ k -> fill random từ phần còn lại
    if len(picked) < k:
        remain = [x for x in items if str(x.get("id")) not in used]
        random.shuffle(remain)
        picked.extend(remain[: (k - len(picked))])

    random.shuffle(picked)
    return picked[:k]


def get_exam_items(exam_id: str) -> tuple[str | None, str | None, list[dict]]:
    """
    Return: subject, timing, items (đã trộn topic + chống trùng)
    """
    _ensure_loaded()
    exam_id = str(exam_id).strip()

    items = [q for q in _DB if str(q.get("examId")) == exam_id]
    if not items:
        return None, None, []

    subject = items[0].get("subject")
    timing = _norm_timing(items[0].get("examTiming"))
    if timing not in ("midterm", "final"):
        timing = "final"

    # split type
    mcq = [q for q in items if _get_type(q) == "mcq" and not _is_bad_nmlt_mcq(q)]
    essay = [q for q in items if _get_type(q) == "essay"]
    coding = [q for q in items if _get_type(q) == "coding"]

    # ✅ TRỘN TOPIC CHO MCQ (set số lượng theo timing)
    mcq_k = 20 if timing == "midterm" else 25
    mcq_sel = _balanced_mcq(mcq, mcq_k)

    # essay/coding: lấy ít thôi (MVP)
    essay = _dedupe_by_id(essay)
    coding = _dedupe_by_id(coding)
    random.shuffle(essay)
    random.shuffle(coding)

    essay_sel = essay[:2]
    coding_sel = coding[:1]

    merged = [*mcq_sel, *essay_sel, *coding_sel]
    return subject, timing, merged


def _is_bad_nmlt_mcq(q: dict) -> bool:
    if str(q.get("subject", "")).strip().lower() != "nmlt":
        return False
    if str(q.get("type", "")).strip().lower() != "mcq":
        return False

    topic = str(q.get("topic") or (q.get("topics") or [""])[0]).strip().lower()
    question = str(q.get("question", "")).strip().lower()
    options = [str(x).strip().lower() for x in (q.get("options") or [])]

    option_text = " | ".join(options)

    loop_keywords = ["for", "while", "do-while", "vòng lặp"]
    file_keywords = ["file", "fopen", "fclose", "fprintf", "fscanf"]
    array_keywords = ["mảng", "array", "chỉ số", "phần tử"]
    pointer_keywords = ["con trỏ", "pointer", "địa chỉ", "dereference"]
    complexity_keywords = ["độ phức tạp", "o(", "tìm kiếm", "sắp xếp"]

    # topic file I/O mà options lại toàn loop
    if topic == "file i/o" and any(k in option_text for k in loop_keywords):
        return True

    # topic array mà options toàn loop
    if topic == "array" and any(k in option_text for k in loop_keywords):
        return True

    # topic pointer mà options toàn loop
    if topic == "pointer" and any(k in option_text for k in loop_keywords):
        return True

    # question complexity mà options không liên quan O(...)
    if any(k in question for k in complexity_keywords):
        if not any("o(" in x or "n" in x for x in options):
            return True

    return False