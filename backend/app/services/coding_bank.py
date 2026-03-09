from __future__ import annotations

from pathlib import Path
import json
import random
from typing import Any, Dict, List, Optional, Tuple

# backend/
BASE_DIR = Path(__file__).resolve().parents[2]
DATA_PATH = BASE_DIR / "data" / "coding_problems.json"

# Cache in-memory
_CACHE: List[Dict[str, Any]] = []
_CACHE_MTIME: Optional[float] = None


def _norm(s: Any) -> str:
    return str(s or "").strip().lower()


def _file_mtime(path: Path) -> Optional[float]:
    try:
        return path.stat().st_mtime
    except Exception:
        return None


def _load_json_list(path: Path) -> List[Dict[str, Any]]:
    if not path.exists():
        print(f"⚠️ coding_problems.json not found at {path}")
        return []

    try:
        with open(path, "r", encoding="utf-8") as f:
            data = json.load(f)
        if isinstance(data, list):
            # ensure dict
            out = [x for x in data if isinstance(x, dict)]
            return out
        print("⚠️ coding_problems.json must be a JSON array (list)")
        return []
    except Exception as e:
        print(f"⚠️ Cannot parse coding_problems.json: {e}")
        return []


def load_all_problems(force_reload: bool = False) -> List[Dict[str, Any]]:
    """
    Load coding problems with simple cache.
    - If file changed (mtime changed) -> reload automatically.
    - force_reload=True -> reload no matter what.
    """
    global _CACHE, _CACHE_MTIME

    mtime = _file_mtime(DATA_PATH)
    should_reload = force_reload or (_CACHE_MTIME is None) or (mtime is not None and mtime != _CACHE_MTIME)

    if should_reload:
        _CACHE = _load_json_list(DATA_PATH)
        _CACHE_MTIME = mtime
        print(f"✅ Loaded coding problems: {len(_CACHE)} from {DATA_PATH}")

    return _CACHE


def list_subjects() -> List[str]:
    items = load_all_problems()
    subs = sorted({ _norm(x.get("subject")) for x in items if _norm(x.get("subject")) })
    return subs


def list_tags(subject: Optional[str] = None) -> List[str]:
    items = load_all_problems()
    if subject:
        ss = _norm(subject)
        items = [x for x in items if _norm(x.get("subject")) == ss]

    tags: List[str] = []
    for x in items:
        for t in (x.get("tags") or x.get("topics") or []):
            if _norm(t):
                tags.append(_norm(t))
    # unique
    seen = set()
    out = []
    for t in tags:
        if t not in seen:
            seen.add(t)
            out.append(t)
    return sorted(out)


def list_problems(
    q: Optional[str] = None,
    difficulty: Optional[str] = None,
    tag: Optional[str] = None,
    subject: Optional[str] = None,
    topics: Optional[List[str]] = None,
    limit: Optional[int] = None,
    offset: int = 0,
) -> List[Dict[str, Any]]:
    """
    Filter problems.
    - q: search in title/description
    - difficulty: exact match (easy/medium/hard)
    - tag: exact match in tags OR topics
    - subject: exact match
    - topics: match ANY topic (OR)
    - limit/offset: simple pagination
    """
    items = load_all_problems()

    if subject:
        ss = _norm(subject)
        items = [x for x in items if _norm(x.get("subject")) == ss]

    if q:
        qq = _norm(q)
        items = [
            x for x in items
            if qq in _norm(x.get("title")) or qq in _norm(x.get("description"))
        ]

    if difficulty:
        dd = _norm(difficulty)
        items = [x for x in items if _norm(x.get("difficulty")) == dd]

    # normalize tag/topics
    if tag:
        tt = _norm(tag)
        items = [
            x for x in items
            if any(_norm(t) == tt for t in (x.get("tags") or []))
            or any(_norm(t) == tt for t in (x.get("topics") or []))
        ]

    if topics:
        tset = { _norm(t) for t in topics if _norm(t) }
        if tset:
            items2 = []
            for x in items:
                xt = { _norm(t) for t in (x.get("topics") or []) if _norm(t) }
                xg = { _norm(t) for t in (x.get("tags") or []) if _norm(t) }
                if xt.intersection(tset) or xg.intersection(tset):
                    items2.append(x)
            items = items2

    # pagination
    if offset < 0:
        offset = 0
    if limit is not None and limit < 0:
        limit = None

    if offset:
        items = items[offset:]
    if limit is not None:
        items = items[:limit]

    return items


def get_problem(problem_id: str) -> Optional[Dict[str, Any]]:
    pid = str(problem_id or "").strip()
    if not pid:
        return None

    for x in load_all_problems():
        if str(x.get("id", "")).strip() == pid:
            return x
    return None


def random_pick(
    subject: str,
    k: int = 1,
    topics: Optional[List[str]] = None,
    difficulty: Optional[str] = None,
) -> List[Dict[str, Any]]:
    """
    Pick k random problems by subject (+ optional topics/difficulty).
    """
    ss = _norm(subject)
    if not ss:
        return []

    pool = list_problems(
        subject=ss,
        topics=topics,
        difficulty=difficulty,
    )

    if not pool:
        return []

    random.shuffle(pool)
    return pool[: max(1, k)]


def summarize_problem(x: Dict[str, Any]) -> Dict[str, Any]:
    """
    Return a lightweight card for UI list (like LeetCode list).
    """
    return {
        "id": x.get("id"),
        "subject": x.get("subject"),
        "title": x.get("title"),
        "difficulty": x.get("difficulty", "unknown"),
        "topics": x.get("topics") or x.get("tags") or [],
    }


def list_problem_cards(
    q: Optional[str] = None,
    difficulty: Optional[str] = None,
    tag: Optional[str] = None,
    subject: Optional[str] = None,
    topics: Optional[List[str]] = None,
    limit: int = 50,
    offset: int = 0,
) -> Dict[str, Any]:
    """
    Convenience for UI: returns {total, items:[card...]}
    """
    full = list_problems(q=q, difficulty=difficulty, tag=tag, subject=subject, topics=topics)
    total = len(full)

    items = full
    if offset:
        items = items[offset:]
    if limit:
        items = items[:limit]

    return {
        "total": total,
        "items": [summarize_problem(x) for x in items],
    }