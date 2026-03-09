from __future__ import annotations

import json
import shutil
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[1]   # backend/
DATA_FILE = ROOT / "data" / "questions.json"
BACKUP_FILE = ROOT / "data" / "questions.backup_before_fix.json"
OUTPUT_FILE = ROOT / "data" / "questions.fixed.json"


def norm(s: Any) -> str:
    return str(s or "").strip().lower()


def get_topic(q: dict) -> str:
    # ưu tiên "topic", fallback "topics[0]"
    topic = q.get("topic")
    if topic:
        return norm(topic)

    topics = q.get("topics") or []
    if isinstance(topics, list) and topics:
        return norm(topics[0])

    return ""


def get_options(q: dict) -> list[str]:
    opts = q.get("options") or []
    if not isinstance(opts, list):
        return []
    return [str(x).strip() for x in opts]


def text_contains_any(text: str, keywords: list[str]) -> bool:
    t = norm(text)
    return any(k in t for k in keywords)


def options_all_loop_related(options: list[str]) -> bool:
    """
    Detect bộ đáp án toàn kiểu loop.
    """
    if not options:
        return False

    loop_words = [
        "vòng lặp",
        "for",
        "while",
        "do-while",
        "do while",
    ]

    count = 0
    for opt in options:
        if text_contains_any(opt, loop_words) or norm(opt) == "không có vòng lặp nào":
            count += 1

    return count >= max(3, len(options) - 1)


def options_have_complexity_style(options: list[str]) -> bool:
    markers = ["o(", "o(n", "o(log", "o(1", "o(n²", "o(n^2", "o(n log n"]
    return any(text_contains_any(opt, markers) for opt in options)


def options_have_fileio_style(options: list[str]) -> bool:
    markers = ["fopen", "fclose", "fprintf", "fscanf", "file", "tệp", "tập tin"]
    return any(text_contains_any(opt, markers) for opt in options)


def options_have_pointer_style(options: list[str]) -> bool:
    markers = ["địa chỉ", "address", "con trỏ", "pointer", "*", "&"]
    return any(text_contains_any(opt, markers) for opt in options)


def options_have_array_style(options: list[str]) -> bool:
    markers = ["mảng", "array", "chỉ số", "phần tử", "0", "1"]
    return any(text_contains_any(opt, markers) for opt in options)


def options_have_recursion_style(options: list[str]) -> bool:
    markers = ["đệ quy", "recursion", "base case", "gọi lại chính nó"]
    return any(text_contains_any(opt, markers) for opt in options)


def options_have_sorting_style(options: list[str]) -> bool:
    markers = ["bubble", "merge", "quick", "selection", "insertion", "sắp xếp", "o(n"]
    return any(text_contains_any(opt, markers) for opt in options)


def options_have_search_style(options: list[str]) -> bool:
    markers = ["linear", "binary", "tìm kiếm", "o(n", "o(log"]
    return any(text_contains_any(opt, markers) for opt in options)


def classify_bad_reason(q: dict) -> str | None:
    """
    Return reason if câu bị lỗi logic, else None.
    """
    subject = norm(q.get("subject"))
    qtype = norm(q.get("type"))
    question = norm(q.get("question"))
    topic = get_topic(q)
    options = get_options(q)

    if subject != "nmlt" or qtype != "mcq":
        return None

    if len(options) < 2:
        return "too_few_options"

    # lỗi chính: option toàn loop nhưng topic/question không phải loop
    if options_all_loop_related(options):
        if topic not in {"loop", "loops", "iteration"}:
            return "loop_options_mismatch_topic"
        if not text_contains_any(question, ["vòng lặp", "for", "while", "do-while", "do while", "lặp"]):
            return "loop_options_mismatch_question"

    # question về complexity/search/sort mà options không phải dạng complexity/sort/search
    if text_contains_any(question, ["độ phức tạp", "complexity", "o("]):
        if not options_have_complexity_style(options):
            return "complexity_question_bad_options"

    if topic in {"file i/o", "file", "file io"}:
        if options_all_loop_related(options):
            return "fileio_topic_has_loop_options"
        if text_contains_any(question, ["file", "fopen", "fclose", "fscanf", "fprintf", "tập tin", "tệp"]):
            if not options_have_fileio_style(options):
                return "fileio_question_bad_options"

    if topic in {"pointer", "con trỏ"}:
        if options_all_loop_related(options):
            return "pointer_topic_has_loop_options"
        if text_contains_any(question, ["con trỏ", "pointer", "địa chỉ", "dereference"]):
            if not options_have_pointer_style(options):
                return "pointer_question_bad_options"

    if topic in {"array", "mảng"}:
        if options_all_loop_related(options):
            return "array_topic_has_loop_options"
        if text_contains_any(question, ["mảng", "array", "chỉ số", "phần tử"]):
            if not options_have_array_style(options):
                return "array_question_bad_options"

    if topic in {"recursion", "đệ quy"}:
        if options_all_loop_related(options):
            return "recursion_topic_has_loop_options"
        if text_contains_any(question, ["đệ quy", "recursion", "base case", "gọi lại chính nó"]):
            if not options_have_recursion_style(options):
                return "recursion_question_bad_options"

    if topic in {"sorting", "sort", "sắp xếp"}:
        if options_all_loop_related(options):
            return "sorting_topic_has_loop_options"
        if text_contains_any(question, ["sắp xếp", "sorting", "bubble", "merge", "quick", "selection", "insertion"]):
            if not options_have_sorting_style(options):
                return "sorting_question_bad_options"

    if topic in {"search", "searching", "tìm kiếm"}:
        if options_all_loop_related(options):
            return "search_topic_has_loop_options"
        if text_contains_any(question, ["tìm kiếm", "search", "linear search", "binary search"]):
            if not options_have_search_style(options):
                return "search_question_bad_options"

    # mismatch kiểu "topic là basic oop intro" nhưng subject là nmlt
    if text_contains_any(topic, ["oop", "object", "class", "encapsulation", "inheritance", "đa hình", "trừu tượng"]):
        return "nmlt_contains_oop_topic"

    # mismatch chủ đề question và topic
    if text_contains_any(question, ["file", "fopen", "fclose"]) and topic not in {"file i/o", "file", "file io"}:
        return "question_topic_mismatch_fileio"
    if text_contains_any(question, ["con trỏ", "pointer", "địa chỉ"]) and topic not in {"pointer", "con trỏ"}:
        return "question_topic_mismatch_pointer"
    if text_contains_any(question, ["mảng", "array"]) and topic not in {"array", "mảng"}:
        return "question_topic_mismatch_array"
    if text_contains_any(question, ["đệ quy", "recursion"]) and topic not in {"recursion", "đệ quy"}:
        return "question_topic_mismatch_recursion"

    return None


def main() -> None:
    if not DATA_FILE.exists():
        print(f"❌ File not found: {DATA_FILE}")
        return

    with open(DATA_FILE, "r", encoding="utf-8") as f:
        data = json.load(f)

    if isinstance(data, dict) and "items" in data:
        items = data["items"]
        wrapped = True
    else:
        items = data
        wrapped = False

    if not isinstance(items, list):
        print("❌ questions.json must be a list or {items:[...]}")
        return

    # backup original
    shutil.copyfile(DATA_FILE, BACKUP_FILE)
    print(f"✅ Backup created: {BACKUP_FILE}")

    cleaned: list[dict] = []
    bad_items: list[tuple[str, str, str]] = []
    reason_count: dict[str, int] = {}

    for q in items:
        if not isinstance(q, dict):
            continue

        reason = classify_bad_reason(q)
        if reason:
            qid = str(q.get("id", "NO_ID"))
            question = str(q.get("question", ""))[:100]
            bad_items.append((qid, reason, question))
            reason_count[reason] = reason_count.get(reason, 0) + 1
        else:
            cleaned.append(q)

    output_data = {"items": cleaned} if wrapped else cleaned

    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(output_data, f, ensure_ascii=False, indent=2)

    print("\n===== SUMMARY =====")
    print(f"Original items : {len(items)}")
    print(f"Removed bad    : {len(bad_items)}")
    print(f"Kept clean     : {len(cleaned)}")
    print(f"Output file    : {OUTPUT_FILE}")

    if reason_count:
        print("\n===== BAD REASONS =====")
        for k, v in sorted(reason_count.items(), key=lambda x: (-x[1], x[0])):
            print(f"- {k}: {v}")

    if bad_items:
        print("\n===== FIRST 30 BAD ITEMS =====")
        for qid, reason, question in bad_items[:30]:
            print(f"[{reason}] {qid} :: {question}")

    print("\n✅ Done. Review questions.fixed.json.")
    print("Nếu ổn, bạn có thể replace questions.json bằng file fixed.")


if __name__ == "__main__":
    main()