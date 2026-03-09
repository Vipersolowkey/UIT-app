import json
from pathlib import Path
from typing import Dict, List, Optional

TAX_DIR = Path("data/taxonomy")

def load_taxonomy(subject: str) -> Dict:
    path = TAX_DIR / f"topics_{subject}.json"
    if not path.exists():
        raise FileNotFoundError(f"Không thấy taxonomy: {path}")
    return json.loads(path.read_text(encoding="utf-8"))

def list_topics(subject: str) -> List[str]:
    tax = load_taxonomy(subject)
    return [t["name"] for t in tax.get("topics", [])]

def guess_topic(subject: str, text: str) -> Optional[str]:
    tax = load_taxonomy(subject)
    topics: List[dict] = tax.get("topics", [])
    t = (text or "").lower()

    best_name = None
    best_score = 0

    for tp in topics:
        score = 0
        for kw in tp.get("keywords", []):
            if kw.lower() in t:
                score += 1

        if score > best_score:
            best_score = score
            best_name = tp.get("name")

    return best_name if best_score > 0 else None