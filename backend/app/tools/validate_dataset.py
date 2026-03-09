import json
from pathlib import Path
from typing import Dict, Any
from rich import print

from tools.topic_tagger import list_topics


REQUIRED_FIELDS = [
    "question_id",
    "subject",
    "topic",
    "difficulty",
    "stem",
]

def validate_line(obj: Dict[str, Any], valid_topics: set) -> list[str]:
    errs = []

    for field in REQUIRED_FIELDS:
        if field not in obj:
            errs.append(f"thiếu field '{field}'")

    # difficulty
    try:
        d = int(obj.get("difficulty", 3))
        if d < 1 or d > 5:
            errs.append("difficulty phải trong 1-5")
    except Exception:
        errs.append("difficulty không phải số")

    # topic check
    topic = obj.get("topic")
    if topic and topic != "Khác" and topic not in valid_topics:
        errs.append(f"topic '{topic}' không nằm trong taxonomy")

    # MCQ check
    choices = obj.get("choices")
    if choices is not None:
        if not isinstance(choices, list):
            errs.append("choices phải là list hoặc null")
        else:
            # nếu có choices thì nên có 2-6 option (MVP)
            if len(choices) < 2:
                errs.append("choices quá ít (<2)")
    return errs


def validate_file(path: str, subject_hint: str = None):
    file_path = Path(path)
    if not file_path.exists():
        print("[red]File không tồn tại[/red]")
        return

    # nếu không truyền subject_hint thì đọc từ dòng đầu
    first = file_path.read_text(encoding="utf-8").splitlines()
    detected_subject = subject_hint
    if not detected_subject and first:
        try:
            detected_subject = json.loads(first[0]).get("subject")
        except Exception:
            detected_subject = None

    if not detected_subject:
        print("[yellow]⚠ Không detect được subject -> bỏ qua taxonomy check[/yellow]")
        valid_topics = set()
    else:
        valid_topics = set(list_topics(detected_subject))

    errors = 0
    total = 0

    with file_path.open("r", encoding="utf-8") as f:
        for i, line in enumerate(f, start=1):
            line = line.strip()
            if not line:
                continue
            total += 1

            try:
                obj = json.loads(line)
            except Exception:
                print(f"[red]Line {i}: JSON lỗi[/red]")
                errors += 1
                continue

            errs = validate_line(obj, valid_topics) if valid_topics else validate_line(obj, set())
            if errs:
                errors += 1
                print(f"[red]Line {i}[/red] -> " + "; ".join(errs))

    print(f"\n✔ Tổng câu: {total}")
    print(f"❌ Dòng lỗi: {errors}")


if __name__ == "__main__":
    import sys
    if len(sys.argv) < 2:
        print("Usage: python tools/validate_dataset.py data/processed/questions.jsonl [SUBJECT]")
        raise SystemExit(1)

    path = sys.argv[1]
    subject = sys.argv[2] if len(sys.argv) >= 3 else None
    validate_file(path, subject_hint=subject)