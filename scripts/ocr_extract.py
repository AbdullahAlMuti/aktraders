import sys
import os
import fitz  # PyMuPDF
import subprocess
import tempfile
import json
import re

if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

TESSERACT_EXE = r"C:\Program Files\Tesseract-OCR\tesseract.exe"
TESSDATA_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "tessdata"))

def ocr_pdf(pdf_path):
    if not os.path.exists(pdf_path):
        return {"error": f"File not found: {pdf_path}"}

    try:
        doc = fitz.open(pdf_path)
    except Exception as e:
        return {"error": f"Failed to open PDF: {str(e)}"}

    # 1. Check for native digital text
    native_text = ""
    for page in doc:
        native_text += page.get_text() + "\n"

    if len(native_text.strip()) > 50:
        return {"text": native_text.strip(), "source": "native"}

    # 2. Scanned / Image-only PDF -> Render pages to image and run Tesseract OCR
    ocr_lines = []
    with tempfile.TemporaryDirectory() as temp_dir:
        for page_index, page in enumerate(doc):
            # Render at 200 DPI for high OCR recognition accuracy
            pix = page.get_pixmap(dpi=200)
            img_path = os.path.join(temp_dir, f"page_{page_index}.png")
            pix.save(img_path)

            output_base = os.path.join(temp_dir, f"ocr_{page_index}")
            cmd = [
                TESSERACT_EXE,
                "--tessdata-dir", TESSDATA_DIR,
                "-l", "ben+eng",
                "--psm", "3",
                img_path,
                output_base,
            ]

            try:
                subprocess.run(cmd, check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
                txt_file = output_base + ".txt"
                if os.path.exists(txt_file):
                    with open(txt_file, "r", encoding="utf-8", errors="replace") as f:
                        page_ocr = f.read().strip()
                        if page_ocr:
                            ocr_lines.append(page_ocr)
            except Exception as ocr_err:
                print(f"OCR warning for page {page_index}: {ocr_err}", file=sys.stderr)

    full_text = "\n\n".join(ocr_lines).strip()
    return {"text": full_text, "source": "tesseract_ocr"}

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"error": "No PDF path provided"}))
        sys.exit(1)

    pdf_path = sys.argv[1]
    result = ocr_pdf(pdf_path)
    # Output raw UTF-8 bytes to prevent Windows CP1252 charmap encoding crash
    sys.stdout.buffer.write(json.dumps(result, ensure_ascii=False).encode("utf-8"))
    sys.stdout.buffer.write(b"\n")
    sys.stdout.flush()
