from __future__ import annotations

import json
import random
import shutil
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[1]   # backend/
DATA_FILE = ROOT / "data" / "questions.json"
BACKUP_FILE = ROOT / "data" / "questions.backup_before_repair.json"
OUTPUT_FILE = ROOT / "data" / "questions.repaired.json"


def norm(s: Any) -> str:
    return str(s or "").strip().lower()


def get_topic(q: dict) -> str:
    topic = q.get("topic")
    if topic:
        return norm(topic)

    topics = q.get("topics") or []
    if isinstance(topics, list) and topics:
        return norm(topics[0])

    return ""


def set_topic(q: dict, topic: str) -> None:
    if "topic" in q:
        q["topic"] = topic
    if "topics" in q and isinstance(q["topics"], list):
        if q["topics"]:
            q["topics"][0] = topic
        else:
            q["topics"] = [topic]


def get_options(q: dict) -> list[str]:
    opts = q.get("options") or []
    if not isinstance(opts, list):
        return []
    return [str(x).strip() for x in opts]


def text_contains_any(text: str, keywords: list[str]) -> bool:
    t = norm(text)
    return any(k in t for k in keywords)


def options_all_loop_related(options: list[str]) -> bool:
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


# =========================
# Repair templates by topic
# =========================
TOPIC_TEMPLATES: dict[str, list[dict[str, Any]]] = {
    "file i/o": [
        {
            "question": "Hàm nào dùng để mở file trong C?",
            "options": ["fopen()", "fclose()", "fprintf()", "fscanf()"],
            "answer": "a",
            "explain": "fopen() dùng để mở file và trả về con trỏ FILE*."
        },
        {
            "question": "Hàm nào dùng để đóng file trong C?",
            "options": ["fopen()", "fclose()", "fprintf()", "fgetc()"],
            "answer": "b",
            "explain": "fclose() dùng để đóng file sau khi xử lý xong."
        },
        {
            "question": "Hàm nào dùng để ghi formatted text vào file?",
            "options": ["fprintf()", "fscanf()", "fopen()", "fclose()"],
            "answer": "a",
            "explain": "fprintf() ghi dữ liệu có định dạng vào file."
        },
        {
            "question": "Hàm nào dùng để đọc formatted text từ file?",
            "options": ["fprintf()", "fscanf()", "fopen()", "fputs()"],
            "answer": "b",
            "explain": "fscanf() đọc dữ liệu có định dạng từ file."
        },
    ],
    "sorting": [
        {
            "question": "Thuật toán nào có độ phức tạp trung bình O(n log n)?",
            "options": ["Merge Sort", "Bubble Sort", "Selection Sort", "Linear Search"],
            "answer": "a",
            "explain": "Merge Sort có độ phức tạp trung bình O(n log n)."
        },
        {
            "question": "Thuật toán nào lặp lại việc đổi chỗ các phần tử kề nhau nếu chúng sai thứ tự?",
            "options": ["Bubble Sort", "Merge Sort", "Binary Search", "Insertion Search"],
            "answer": "a",
            "explain": "Bubble Sort hoạt động bằng cách đổi chỗ các cặp phần tử kề nhau."
        },
        {
            "question": "Thuật toán nào chia mảng thành hai nửa rồi sắp xếp đệ quy?",
            "options": ["Merge Sort", "Selection Sort", "Bubble Sort", "Linear Search"],
            "answer": "a",
            "explain": "Merge Sort chia để trị: tách mảng, sắp xếp từng nửa rồi trộn."
        },
        {
            "question": "Thuật toán nào chọn phần tử nhỏ nhất rồi đưa về đầu mảng ở mỗi bước?",
            "options": ["Selection Sort", "Bubble Sort", "Merge Sort", "Quick Search"],
            "answer": "a",
            "explain": "Selection Sort chọn phần tử nhỏ nhất cho mỗi lượt."
        },
    ],
    "search": [
        {
            "question": "Độ phức tạp thời gian của tìm kiếm tuyến tính là gì?",
            "options": ["O(n)", "O(log n)", "O(1)", "O(n log n)"],
            "answer": "a",
            "explain": "Linear Search phải duyệt từng phần tử nên có độ phức tạp O(n)."
        },
        {
            "question": "Tìm kiếm nhị phân áp dụng hiệu quả nhất khi nào?",
            "options": ["Khi mảng đã được sắp xếp", "Khi mảng chưa sắp xếp", "Khi dữ liệu là chuỗi bất kỳ", "Khi mảng rỗng"],
            "answer": "a",
            "explain": "Binary Search yêu cầu dữ liệu đã được sắp xếp."
        },
        {
            "question": "Độ phức tạp thời gian của tìm kiếm nhị phân là gì?",
            "options": ["O(log n)", "O(n)", "O(1)", "O(n²)"],
            "answer": "a",
            "explain": "Binary Search loại bỏ một nửa không gian tìm kiếm sau mỗi bước."
        },
        {
            "question": "Thuật toán nào duyệt lần lượt từng phần tử cho đến khi tìm thấy giá trị cần tìm?",
            "options": ["Linear Search", "Binary Search", "Merge Sort", "Selection Sort"],
            "answer": "a",
            "explain": "Linear Search kiểm tra tuần tự từng phần tử."
        },
    ],
    "pointer": [
        {
            "question": "Con trỏ trong C dùng để lưu gì?",
            "options": ["Địa chỉ bộ nhớ", "Giá trị số thực", "Ký tự cuối chuỗi", "Tên hàm"],
            "answer": "a",
            "explain": "Pointer lưu địa chỉ của một biến hoặc vùng nhớ."
        },
        {
            "question": "Toán tử '&' trong C dùng để làm gì?",
            "options": ["Lấy địa chỉ của biến", "Giải tham chiếu con trỏ", "Khai báo mảng", "Nối chuỗi"],
            "answer": "a",
            "explain": "& dùng để lấy địa chỉ bộ nhớ của biến."
        },
        {
            "question": "Toán tử '*' dùng với con trỏ để làm gì?",
            "options": ["Giải tham chiếu", "Lấy địa chỉ", "Khai báo struct", "Mở file"],
            "answer": "a",
            "explain": "*p cho phép truy cập giá trị tại địa chỉ mà p trỏ tới."
        },
        {
            "question": "Biểu thức nào khai báo một con trỏ tới kiểu int?",
            "options": ["int *p;", "int p[];", "pointer int p;", "int &p;"],
            "answer": "a",
            "explain": "int *p; là cú pháp khai báo pointer tới int trong C."
        },
    ],
    "array": [
        {
            "question": "Chỉ số đầu tiên của mảng trong C là bao nhiêu?",
            "options": ["0", "1", "-1", "2"],
            "answer": "a",
            "explain": "Mảng trong C bắt đầu từ chỉ số 0."
        },
        {
            "question": "Mảng dùng để làm gì?",
            "options": ["Lưu nhiều phần tử cùng kiểu dữ liệu", "Khai báo hàm", "Mở file", "Tạo class"],
            "answer": "a",
            "explain": "Array dùng để lưu nhiều giá trị cùng kiểu trong vùng nhớ liên tiếp."
        },
        {
            "question": "Khai báo nào đúng cho mảng 10 phần tử kiểu int?",
            "options": ["int a[10];", "int[10] a;", "array int a(10);", "int a(10);"],
            "answer": "a",
            "explain": "Cú pháp mảng chuẩn trong C là int a[10];"
        },
        {
            "question": "Nếu mảng có 10 phần tử thì chỉ số cuối cùng là?",
            "options": ["9", "10", "8", "11"],
            "answer": "a",
            "explain": "Nếu bắt đầu từ 0 thì phần tử cuối cùng có chỉ số 9."
        },
    ],
    "string": [
        {
            "question": "Chuỗi trong C kết thúc bằng ký tự nào?",
            "options": ["\\0", "\\n", "EOF", "space"],
            "answer": "a",
            "explain": "String trong C kết thúc bởi ký tự null '\\0'."
        },
        {
            "question": "Hàm nào dùng để tính độ dài chuỗi trong C?",
            "options": ["strlen()", "strcmp()", "strcpy()", "scanf()"],
            "answer": "a",
            "explain": "strlen() trả về số ký tự trong chuỗi (không tính '\\0')."
        },
        {
            "question": "Hàm nào dùng để so sánh hai chuỗi?",
            "options": ["strcmp()", "strlen()", "strcat()", "printf()"],
            "answer": "a",
            "explain": "strcmp() so sánh thứ tự từ điển giữa hai chuỗi."
        },
        {
            "question": "Hàm nào dùng để nối hai chuỗi?",
            "options": ["strcat()", "strcmp()", "strlen()", "atoi()"],
            "answer": "a",
            "explain": "strcat() nối chuỗi thứ hai vào cuối chuỗi thứ nhất."
        },
    ],
    "function": [
        {
            "question": "Hàm trong C dùng để làm gì?",
            "options": ["Chia chương trình thành các khối xử lý", "Khai báo mảng", "Lưu địa chỉ biến", "Tạo file"],
            "answer": "a",
            "explain": "Function giúp chia nhỏ chương trình và tái sử dụng code."
        },
        {
            "question": "Từ khóa nào dùng để trả về giá trị từ hàm?",
            "options": ["return", "break", "continue", "goto"],
            "answer": "a",
            "explain": "return dùng để trả kết quả từ hàm."
        },
        {
            "question": "Hàm main trong C thường có kiểu trả về là gì?",
            "options": ["int", "char", "float", "string"],
            "answer": "a",
            "explain": "Chuẩn phổ biến là int main(...)."
        },
        {
            "question": "Điều nào đúng về tham số của hàm?",
            "options": ["Dùng để truyền dữ liệu vào hàm", "Chỉ dùng để in dữ liệu", "Bắt buộc luôn là mảng", "Không thể có nhiều tham số"],
            "answer": "a",
            "explain": "Parameters cho phép truyền dữ liệu vào function."
        },
    ],
    "recursion": [
        {
            "question": "Đệ quy là gì?",
            "options": ["Hàm gọi lại chính nó", "Một dạng mảng đặc biệt", "Một kiểu vòng lặp", "Một phép toán logic"],
            "answer": "a",
            "explain": "Recursion là kỹ thuật hàm tự gọi lại chính nó."
        },
        {
            "question": "Điều kiện dừng trong đệ quy dùng để làm gì?",
            "options": ["Ngăn hàm gọi vô hạn", "Tăng tốc vòng lặp", "Mở file", "Tạo mảng"],
            "answer": "a",
            "explain": "Base case giúp recursion dừng đúng lúc."
        },
        {
            "question": "Hàm đệ quy thường cần thành phần nào?",
            "options": ["Lời gọi lại chính nó và điều kiện dừng", "Chỉ cần vòng lặp for", "Chỉ cần con trỏ", "Chỉ cần struct"],
            "answer": "a",
            "explain": "Một recursive function cần self-call và base case."
        },
        {
            "question": "Ví dụ nào là bài toán phù hợp với đệ quy?",
            "options": ["Tính giai thừa", "In chuỗi đơn giản", "Đọc từng ký tự bằng getchar()", "Tăng biến đếm một lần"],
            "answer": "a",
            "explain": "Giai thừa là ví dụ cơ bản của recursion."
        },
    ],
    "datatype": [
        {
            "question": "Kiểu dữ liệu nào dùng để lưu số nguyên?",
            "options": ["int", "float", "char", "double"],
            "answer": "a",
            "explain": "int dùng để lưu số nguyên."
        },
        {
            "question": "Kiểu dữ liệu nào dùng để lưu số thực?",
            "options": ["float", "int", "char", "bool"],
            "answer": "a",
            "explain": "float dùng để lưu số thực."
        },
        {
            "question": "Kiểu dữ liệu char dùng để lưu gì?",
            "options": ["Một ký tự", "Một chuỗi nhiều ký tự", "Một số thực", "Một mảng"],
            "answer": "a",
            "explain": "char lưu một ký tự đơn."
        },
        {
            "question": "Toán tử sizeof dùng để làm gì?",
            "options": ["Lấy kích thước bộ nhớ của kiểu dữ liệu/biến", "Đếm số phần tử mảng", "Mở file", "So sánh chuỗi"],
            "answer": "a",
            "explain": "sizeof trả về kích thước tính bằng byte."
        },
    ],
    "variable": [
        {
            "question": "Biến trong C dùng để làm gì?",
            "options": ["Lưu trữ dữ liệu", "Tạo vòng lặp", "Mở file", "Định nghĩa thư viện"],
            "answer": "a",
            "explain": "Variable dùng để lưu dữ liệu trong chương trình."
        },
        {
            "question": "Phép gán trong C thường dùng toán tử nào?",
            "options": ["=", "==", "!=", "<="],
            "answer": "a",
            "explain": "= dùng để gán giá trị cho biến."
        },
        {
            "question": "Tên biến hợp lệ trong C là?",
            "options": ["tong_diem", "2tong", "tong-diem", "int"],
            "answer": "a",
            "explain": "Biến không được bắt đầu bằng số, không có dấu '-', không trùng từ khóa."
        },
        {
            "question": "Biến phải được khai báo trước khi nào?",
            "options": ["Trước khi sử dụng", "Sau khi in ra màn hình", "Sau khi kết thúc chương trình", "Không cần khai báo"],
            "answer": "a",
            "explain": "Trong C, biến phải được khai báo trước khi dùng."
        },
    ],
    "condition": [
        {
            "question": "Cấu trúc nào dùng để rẽ nhánh trong C?",
            "options": ["if...else", "for", "while", "break"],
            "answer": "a",
            "explain": "if...else dùng để kiểm tra điều kiện và rẽ nhánh."
        },
        {
            "question": "Biểu thức điều kiện trong if phải trả về gì?",
            "options": ["Đúng hoặc sai", "Một chuỗi", "Một file", "Một mảng"],
            "answer": "a",
            "explain": "Điều kiện if được đánh giá thành true/false."
        },
        {
            "question": "Cấu trúc nào phù hợp khi có nhiều trường hợp giá trị rời rạc?",
            "options": ["switch...case", "for", "while", "struct"],
            "answer": "a",
            "explain": "switch phù hợp cho nhiều nhánh theo giá trị rời rạc."
        },
        {
            "question": "Toán tử nào dùng để so sánh bằng?",
            "options": ["==", "=", "!=", "&&"],
            "answer": "a",
            "explain": "== là toán tử so sánh bằng, còn = là gán."
        },
    ],
    "loop": [
        {
            "question": "Vòng lặp nào phù hợp khi biết trước số lần lặp?",
            "options": ["Vòng lặp for", "Vòng lặp while", "Không có vòng lặp nào", "Vòng lặp do-while"],
            "answer": "a",
            "explain": "for phù hợp khi biết trước số lần lặp."
        },
        {
            "question": "Vòng lặp nào luôn thực hiện thân ít nhất một lần?",
            "options": ["do-while", "while", "for", "if-else"],
            "answer": "a",
            "explain": "do-while kiểm tra điều kiện sau khi thực hiện thân vòng lặp."
        },
        {
            "question": "Từ khóa nào dùng để thoát khỏi vòng lặp ngay lập tức?",
            "options": ["break", "continue", "return", "switch"],
            "answer": "a",
            "explain": "break dùng để thoát khỏi vòng lặp."
        },
        {
            "question": "Từ khóa continue dùng để làm gì?",
            "options": ["Bỏ qua phần còn lại của lần lặp hiện tại", "Thoát toàn bộ chương trình", "Kết thúc hàm", "Tạo vòng lặp mới"],
            "answer": "a",
            "explain": "continue bỏ qua phần còn lại của iteration hiện tại."
        },
    ],
    "struct": [
        {
            "question": "struct trong C dùng để làm gì?",
            "options": ["Nhóm nhiều biến khác kiểu vào cùng một kiểu dữ liệu", "Tạo vòng lặp", "Mở file", "Định nghĩa hàm"],
            "answer": "a",
            "explain": "struct cho phép gom nhiều trường dữ liệu liên quan."
        },
        {
            "question": "Toán tử nào dùng để truy cập field của một biến struct?",
            "options": [".", "->", "&", "*"],
            "answer": "a",
            "explain": "Dấu chấm dùng với biến struct thường."
        },
        {
            "question": "Toán tử nào dùng để truy cập field thông qua con trỏ struct?",
            "options": ["->", ".", "&", "::"],
            "answer": "a",
            "explain": "-> dùng để truy cập field qua pointer tới struct."
        },
        {
            "question": "Phát biểu nào đúng về struct?",
            "options": ["Có thể chứa nhiều field khác kiểu", "Chỉ chứa số nguyên", "Chỉ dùng cho file", "Không thể khai báo mảng struct"],
            "answer": "a",
            "explain": "struct cho phép kết hợp nhiều kiểu dữ liệu khác nhau."
        },
    ],
    "memory": [
        {
            "question": "Hàm nào dùng để cấp phát bộ nhớ động trong C?",
            "options": ["malloc()", "free()", "sizeof()", "scanf()"],
            "answer": "a",
            "explain": "malloc() cấp phát vùng nhớ động."
        },
        {
            "question": "Hàm nào dùng để giải phóng bộ nhớ động?",
            "options": ["free()", "malloc()", "fclose()", "strlen()"],
            "answer": "a",
            "explain": "free() giải phóng vùng nhớ đã cấp phát."
        },
        {
            "question": "Bộ nhớ heap thường liên quan đến điều gì?",
            "options": ["Cấp phát động", "Biến cục bộ trong hàm", "Chỉ lưu chuỗi", "Chỉ lưu mảng tĩnh"],
            "answer": "a",
            "explain": "Heap dùng cho cấp phát động tại runtime."
        },
        {
            "question": "Nếu cấp phát động mà không free thì có thể gây ra gì?",
            "options": ["Rò rỉ bộ nhớ", "Tăng tốc chương trình", "Sai cú pháp", "Tự động giải phóng ngay"],
            "answer": "a",
            "explain": "Không free bộ nhớ có thể gây memory leak."
        },
    ],
}

ALIASES = {
    "file io": "file i/o",
    "file": "file i/o",
    "sort": "sorting",
    "sắp xếp": "sorting",
    "searching": "search",
    "tìm kiếm": "search",
    "con trỏ": "pointer",
    "mảng": "array",
    "đệ quy": "recursion",
    "kiểu dữ liệu": "datatype",
    "biến": "variable",
    "điều kiện": "condition",
    "vòng lặp": "loop",
    "oop intro": "oop_invalid",
    "basic oop intro": "oop_invalid",
    "oop": "oop_invalid",
}


def canonical_topic(topic: str) -> str:
    t = norm(topic)
    return ALIASES.get(t, t)


def repair_question_by_topic(q: dict) -> tuple[dict, bool, str]:
    """
    Return: (new_question, changed?, reason)
    """
    subject = norm(q.get("subject"))
    qtype = norm(q.get("type"))
    if subject != "nmlt" or qtype != "mcq":
        return q, False, "skip_non_nmlt"

    topic_raw = get_topic(q)
    topic = canonical_topic(topic_raw)

    if topic == "oop_invalid":
        topic = "struct"  # map tạm về struct để tránh lạc sang OOP

    templates = TOPIC_TEMPLATES.get(topic)
    if not templates:
        # nếu topic không có template, fallback misc đơn giản
        templates = TOPIC_TEMPLATES["function"]
        topic = "function"

    # detect câu bị lỗi hoặc mismatch
    question = norm(q.get("question"))
    options = get_options(q)

    bad = False

    if options_all_loop_related(options) and topic != "loop":
        bad = True

    if topic == "file i/o" and not (
        text_contains_any(question, ["file", "fopen", "fclose", "fscanf", "fprintf", "tệp", "tập tin"])
        and any(text_contains_any(opt, ["file", "fopen", "fclose", "fscanf", "fprintf"]) for opt in options)
    ):
        bad = True

    if topic == "sorting" and (
        options_all_loop_related(options)
        or not text_contains_any(question, ["sort", "sắp xếp", "bubble", "merge", "selection", "quick"])
    ):
        bad = True

    if topic == "search" and (
        options_all_loop_related(options)
        or not text_contains_any(question, ["tìm kiếm", "search", "linear", "binary", "độ phức tạp"])
    ):
        bad = True

    if topic == "pointer" and (
        options_all_loop_related(options)
        or not text_contains_any(question, ["con trỏ", "pointer", "địa chỉ", "dereference"])
    ):
        bad = True

    if topic == "array" and (
        options_all_loop_related(options)
        or not text_contains_any(question, ["mảng", "array", "phần tử", "chỉ số"])
    ):
        bad = True

    if topic == "recursion" and (
        options_all_loop_related(options)
        or not text_contains_any(question, ["đệ quy", "recursion", "base case", "gọi lại"])
    ):
        bad = True

    # nếu câu ổn thì giữ nguyên
    if not bad:
        # vẫn chuẩn hóa topic
        q2 = dict(q)
        set_topic(q2, topic)
        return q2, False, "keep_original"

    # repair bằng template
    tpl = random.choice(templates)
    q2 = dict(q)
    set_topic(q2, topic)
    q2["question"] = tpl["question"]
    q2["options"] = tpl["options"]
    q2["answer"] = tpl["answer"]
    q2["explain"] = tpl["explain"]

    return q2, True, f"repaired_as_{topic}"


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

    shutil.copyfile(DATA_FILE, BACKUP_FILE)
    print(f"✅ Backup created: {BACKUP_FILE}")

    repaired_items: list[dict] = []
    changed_count = 0
    kept_count = 0
    reason_count: dict[str, int] = {}

    for q in items:
        if not isinstance(q, dict):
            repaired_items.append(q)
            continue

        q2, changed, reason = repair_question_by_topic(q)
        repaired_items.append(q2)

        reason_count[reason] = reason_count.get(reason, 0) + 1
        if changed:
            changed_count += 1
        else:
            kept_count += 1

    output_data = {"items": repaired_items} if wrapped else repaired_items

    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(output_data, f, ensure_ascii=False, indent=2)

    print("\n===== SUMMARY =====")
    print(f"Original items : {len(items)}")
    print(f"Kept original  : {kept_count}")
    print(f"Repaired items : {changed_count}")
    print(f"Output file    : {OUTPUT_FILE}")

    print("\n===== REASONS =====")
    for k, v in sorted(reason_count.items(), key=lambda x: (-x[1], x[0])):
        print(f"- {k}: {v}")

    print("\n✅ Done. Review questions.repaired.json")
    print("Nếu ổn, copy đè sang questions.json rồi restart backend.")


if __name__ == "__main__":
    main()