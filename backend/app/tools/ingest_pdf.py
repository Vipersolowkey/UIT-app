import pdfplumber
from pathlib import Path
from tools.ocr_pipeline import ocr_pdf_if_needed


def extract_text_from_pdf(pdf_path: str) -> str:
    pdf_path = Path(pdf_path)
    if not pdf_path.exists():
        raise FileNotFoundError(f"{pdf_path} not found")

    full_text = []

    with pdfplumber.open(pdf_path) as pdf:
        for page in pdf.pages:
            text = page.extract_text()
            if text:
                full_text.append(text)

    content = "\n".join(full_text).strip()

    # Nếu PDF không extract được text → thử OCR
    if len(content) < 50:
        print("⚠️ PDF có thể là scan, đang chạy OCR...")
        return ocr_pdf_if_needed(pdf_path)

    return content


if __name__ == "__main__":
    import sys
    pdf_file = sys.argv[1]
    text = extract_text_from_pdf(pdf_file)
    print(text[:2000])