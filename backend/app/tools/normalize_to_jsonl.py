import json
import re
from pathlib import Path
from typing import List, Dict, Optional

from tools.topic_tagger import guess_topic


def parse_questions(raw_text: str, subject: str, topic: str) -> List[Dict]:
    """
    Parse dạng:
    Câu 1: ...
    A. ...
    B. ...
    C. ...
    D. ...
    Đáp án: B
    Giải thích: ...
    """
    questions: List[Dict] = []

    # split theo "Câu số"
    blocks = re.split(r"(?:^|\n)\s*Câu\s*\d+\s*[:.]", raw_text)

    idx = 0
    for block in blocks:
        block = block.strip()
        if not block:
            continue

        lines = [ln.strip() for ln in block.split("\n") if ln.strip()]
        if len(lines) < 3:
            continue

        stem = lines[0].strip()

        choices = []
        answer = ""
        explanation = ""

        for line in lines[1:]:
            if re.match(r"^[A-Da-d]\.", line):
                # normalize "a." -> "A."
                line = line[0].upper() + line[1:]
                choices.append(line)
            elif re.search(r"đáp\s*án\s*[:：]", line, flags=re.IGNORECASE):
                answer = line.split(":", 1)[-1].strip()
                answer = answer.strip().upper()
            elif re.search(r"giải\s*thích\s*[:：]", line, flags=re.IGNORECASE):
                explanation = line.split(":", 1)[-1].strip()

        if not choices:
            # có thể là câu tự luận -> vẫn cho vào (MVP)
            choices = []

        idx += 1

        # AUTO topic
        topic_final: str
        if topic.upper() == "AUTO":
            topic_final = guess_topic(subject, stem) or "Khác"
        else:
            topic_final = topic

        q = {
            "question_id": f"{subject}_{idx:04d}",
            "subject": subject,
            "topic": topic_final,
            "difficulty": 3,
            "stem": stem,
            "choices": choices if choices else None,
            "answer": answer,
            "explanation": explanation,
        }

        questions.append(q)

    return questions


def write_jsonl(questions: List[Dict], output_path: str):
    out = Path(output_path)
    out.parent.mkdir(parents=True, exist_ok=True)

    with out.open("w", encoding="utf-8") as f:
        for q in questions:
            f.write(json.dumps(q, ensure_ascii=False) + "\n")


if __name__ == "__main__":
    import sys

    if len(sys.argv) < 4:
        print("Usage: python tools/normalize_to_jsonl.py <raw_text_file> <SUBJECT> <TOPIC|AUTO>")
        raise SystemExit(1)

    raw_file = sys.argv[1]
    subject = sys.argv[2]
    topic = sys.argv[3]

    raw_text = Path(raw_file).read_text(encoding="utf-8")
    qs = parse_questions(raw_text, subject, topic)

    output = "data/processed/questions.jsonl"
    write_jsonl(qs, output)

    print(f"✅ Đã xuất {len(qs)} câu vào {output}")