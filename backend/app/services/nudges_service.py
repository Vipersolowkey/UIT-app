# backend/app/services/nudges_service.py
from __future__ import annotations

import os
import json
import random
from typing import Any, Dict, List, Optional, Tuple
from datetime import datetime, date

# ==============================
# Config path: backend/data/questions.json
# ==============================
BASE_DIR = os.path.dirname(os.path.abspath(__file__))          # .../backend/app/services
APP_DIR = os.path.dirname(BASE_DIR)                           # .../backend/app
ROOT_DIR = os.path.dirname(APP_DIR)                           # .../backend
DATA_PATH = os.path.join(ROOT_DIR, "data", "questions.json")


def _load_questions() -> List[Dict[str, Any]]:
    if not os.path.exists(DATA_PATH):
        print(f"⚠️ questions.json not found at: {DATA_PATH}")
        return []
    with open(DATA_PATH, "r", encoding="utf-8") as f:
        data = json.load(f)
        if isinstance(data, dict) and "items" in data:
            return data["items"]
        if isinstance(data, list):
            return data
        return []


def _norm(x: Optional[str]) -> str:
    return (x or "").strip().lower()


def get_all_subjects() -> List[str]:
    items = _load_questions()
    subs = sorted({ _norm(x.get("subject")) for x in items if x.get("subject") })
    return [s for s in subs if s]


def get_topics_for_subject(subject: str) -> List[str]:
    subject = _norm(subject)
    items = _load_questions()
    topics = set()
    for x in items:
        if _norm(x.get("subject")) != subject:
            continue
        for t in (x.get("topics") or []):
            tt = _norm(t)
            if tt:
                topics.add(tt)
    return sorted(topics)


def _filter_items(
    *,
    subject: str,
    timing: Optional[str] = None,
    topic: Optional[str] = None,
    qtype: Optional[str] = None,
) -> List[Dict[str, Any]]:
    subject = _norm(subject)
    timing = _norm(timing) if timing else None
    topic = _norm(topic) if topic else None
    qtype = _norm(qtype) if qtype else None

    items = _load_questions()
    out: List[Dict[str, Any]] = []
    for x in items:
        if _norm(x.get("subject")) != subject:
            continue
        if timing and _norm(x.get("examTiming")) != timing:
            continue
        if qtype and _norm(x.get("type")) != qtype:
            continue
        if topic:
            tps = [_norm(t) for t in (x.get("topics") or [])]
            if topic not in tps:
                continue
        out.append(x)
    return out


def random_practice_items(
    *,
    subject: str,
    timing: Optional[str] = None,
    topic: Optional[str] = None,
    qtype: str = "mcq",
    k: int = 10,
) -> List[Dict[str, Any]]:
    pool = _filter_items(subject=subject, timing=timing, topic=topic, qtype=qtype)
    if not pool:
        return []
    if k <= 0:
        k = 10
    if len(pool) <= k:
        random.shuffle(pool)
        return pool
    return random.sample(pool, k)


# ==============================
# Materials: mock (bạn thay sau)
# ==============================
def get_materials(subject: str) -> List[Dict[str, str]]:
    subject_u = subject.strip().upper() if subject else "UNKNOWN"
    return [
        {"title": f"Tài liệu ôn {subject_u} - Tổng hợp", "url": "https://example.com/materials"},
        {"title": f"Slide {subject_u} - Midterm", "url": "https://example.com/slides-midterm"},
        {"title": f"Slide {subject_u} - Final", "url": "https://example.com/slides-final"},
    ]


# ==============================
# Build nudges of the day
# ==============================
def get_today_nudges() -> List[Dict[str, Any]]:
    subjects = get_all_subjects()
    if not subjects:
        # fallback nếu chưa có data
        return [{
            "id": f"NUDGE_EMPTY_{date.today().isoformat()}",
            "title": "Chưa có ngân hàng câu hỏi",
            "description": "Bạn hãy thêm data/questions.json để mình gợi ý luyện tập theo môn nhé.",
            "subject": "unknown",
            "nudge_type": "review",
            "num_questions": 0,
            "priority": 1,
            "icon": "warning",
            "meta": {"reason": "questions.json missing/empty"},
        }]

    # Chọn 1–2 môn ưu tiên (random nhẹ)
    random.shuffle(subjects)
    pick = subjects[: min(2, len(subjects))]

    nudges: List[Dict[str, Any]] = []
    today = date.today().isoformat()

    for s in pick:
        topics = get_topics_for_subject(s)
        topic_pick = topics[0] if topics else None

        # 1) Midterm MCQ
        nudges.append({
            "id": f"{s}_midterm_{today}_mcq",
            "title": f"Ôn giữa kỳ ({s.upper()})",
            "description": "Làm nhanh 10 câu trắc nghiệm theo đề giữa kỳ.",
            "subject": s,
            "nudge_type": "practice_mcq",
            "timing": "midterm",
            "topic": None,
            "num_questions": 10,
            "priority": 10,
            "icon": "bolt",
            "meta": {"mode": "midterm_mcq"},
        })

        # 2) Final MCQ
        nudges.append({
            "id": f"{s}_final_{today}_mcq",
            "title": f"Ôn cuối kỳ ({s.upper()})",
            "description": "Làm nhanh 10 câu trắc nghiệm theo đề cuối kỳ.",
            "subject": s,
            "nudge_type": "practice_mcq",
            "timing": "final",
            "topic": None,
            "num_questions": 10,
            "priority": 20,
            "icon": "flag",
            "meta": {"mode": "final_mcq"},
        })

        # 3) Theo chủ đề (nếu có topics)
        if topic_pick:
            nudges.append({
                "id": f"{s}_topic_{topic_pick}_{today}",
                "title": f"Luyện theo chủ đề: {topic_pick}",
                "description": "Tập trung vào 1 chủ đề để tăng điểm nhanh.",
                "subject": s,
                "nudge_type": "practice_mcq",
                "timing": None,
                "topic": topic_pick,
                "num_questions": 10,
                "priority": 30,
                "icon": "target",
                "meta": {"mode": "topic_mcq"},
            })

        # 4) Nếu môn có coding -> gợi ý 1 bài code
        coding_pool = _filter_items(subject=s, qtype="coding")
        if coding_pool:
            nudges.append({
                "id": f"{s}_coding_{today}",
                "title": f"Bài code kiểu LeetCode ({s.upper()})",
                "description": "Làm 1 bài coding để quen format phỏng vấn/thi thực hành.",
                "subject": s,
                "nudge_type": "practice_coding",
                "timing": None,
                "topic": None,
                "num_questions": 1,
                "priority": 40,
                "icon": "code",
                "meta": {"mode": "coding_one"},
            })

    # sort theo priority
    nudges.sort(key=lambda x: x.get("priority", 50))
    # cắt còn 6 cái cho gọn UI
    return nudges[:6]


def build_practice(subject: str, topic: Optional[str], timing: Optional[str], num_questions: int, nudge_type: str):
    # map nudge_type -> question type
    if nudge_type == "practice_coding":
        qtype = "coding"
        k = 1
    elif nudge_type == "practice_essay":
        qtype = "essay"
        k = num_questions or 2
    else:
        qtype = "mcq"
        k = num_questions or 10

    return random_practice_items(
        subject=subject,
        timing=timing,
        topic=topic,
        qtype=qtype,
        k=k,
    )