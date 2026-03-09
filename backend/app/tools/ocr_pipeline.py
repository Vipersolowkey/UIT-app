import pytesseract
from PIL import Image
import pdfplumber
from pathlib import Path
import tempfile


def ocr_pdf_if_needed(pdf_path: Path) -> str:
    text_result = []

    with pdfplumber.open(pdf_path) as pdf:
        for page in pdf.pages:
            img = page.to_image(resolution=300)
            pil_img = img.original
            text = pytesseract.image_to_string(pil_img, lang="vie+eng")
            text_result.append(text)

    return "\n".join(text_result)