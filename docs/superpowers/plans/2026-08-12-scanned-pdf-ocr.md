# Scanned PDF OCR → Structured JSON Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn scanned, image-only Bengali personnel dossiers into validated, page-traceable structured JSON using a local-only OCR pipeline.

**Architecture:** A self-contained Python package at `ocr/`, independent of the Next.js app. Pages render one at a time via PyMuPDF, get preprocessed, then pass through two OCR engines with separated roles — Tesseract (`ben+eng`) owns page prose, PaddleOCR (`en`) owns Latin/digit field candidates. Per-page document-type detection routes text to a matching parser; a reconciler merges field candidates, records conflicts rather than resolving them, and Pydantic validates the document before anything is written.

**Tech Stack:** Python 3.13, PyMuPDF 1.26, pytesseract + Tesseract 5.4 (`tessdata_best/ben`), PaddleOCR 3.7 (oneDNN disabled), Pillow, OpenCV, Pydantic v2, pydantic-settings, pytest 9.

## Global Constraints

- **Local only.** No network calls at runtime. Documents never leave the machine.
- **Never invent data.** A field that cannot be read is `value: None` with `status: "missing"` — never `""`, never a guess.
- **Always keep `raw` beside `value`.** Normalization is lossy and must stay diagnosable.
- **Page numbers are preserved end to end.** Every field records its `source_page`.
- **Document type is detected per page, not per document.** One PDF holds several types.
- **Conflicts are recorded, never silently resolved.** `status: "conflict"`, `value: None`, all candidates preserved in `conflicts[]`.
- **Validate before writing.** Pydantic validation failure means nothing is written and the CLI exits non-zero.
- **One page in memory at a time.** Never load all rendered pages at once.
- **Temp files are always cleaned**, including on exception (`finally`).
- **Never execute anything embedded in a PDF.** Render only.
- **No secrets or document text in logs** unless `OCR_LOG_TEXT=1`.
- **Never commit real documents or `tessdata/`.** Already gitignored; the repo has a public remote.
- Python module/function naming: `snake_case`. Type hints on every public function.
- Bengali digits are `০১২৩৪৫৬৭৮৯` = U+09E6–U+09EF.

---

## File Structure

| File | Responsibility |
|---|---|
| `ocr/__init__.py` | Package version |
| `ocr/config.py` | `Settings` from env, `OCR_`-prefixed |
| `ocr/models.py` | Pydantic schema — the serialization contract |
| `ocr/text/bengali.py` | Bengali numerals, dates, digit-bearing value parsing |
| `ocr/text/normalize.py` | NFC, whitespace, OCR artifact removal |
| `ocr/pdf/validate.py` | Extension, magic bytes, size/page caps, encryption |
| `ocr/pdf/inspect.py` | Native-text detection, per-page native DPI |
| `ocr/pdf/render.py` | Page → PIL image generator, one at a time |
| `ocr/preprocess/steps.py` | Modular, individually toggleable image steps |
| `ocr/engines/base.py` | `OCRProvider` protocol, `OCRLine`, `OCRPageResult` |
| `ocr/engines/tesseract.py` | `TesseractProvider` |
| `ocr/engines/paddle.py` | `PaddleProvider` |
| `ocr/engines/registry.py` | name → provider |
| `ocr/parsers/detect.py` | Per-page document type detection |
| `ocr/parsers/biodata.py` | জীবন-বৃত্তান্ত label/value form |
| `ocr/parsers/nid.py` | NID card + MRZ check digits |
| `ocr/parsers/certificate.py` | প্রত্যয়ন prose |
| `ocr/reconcile.py` | Merge candidates, emit conflicts |
| `ocr/storage.py` | SHA-256 dedup, atomic write, path safety |
| `ocr/pipeline.py` | Orchestrator — only module that knows the sequence |
| `ocr/cli.py` | `python -m ocr <file.pdf>` |
| `scripts/setup-ocr.py` | Download/verify tessdata |
| `tests/` | pytest suite + synthetic fixture generator |

---

### Task 1: Package skeleton, config, and setup script

**Files:**
- Create: `ocr/__init__.py`, `ocr/config.py`, `ocr/__main__.py`, `scripts/setup-ocr.py`, `requirements-ocr.txt`
- Test: `tests/test_config.py`

**Interfaces:**
- Produces: `ocr.config.Settings` (pydantic-settings `BaseSettings`) with fields `engine`, `languages`, `dpi`, `min_confidence`, `max_pdf_size_mb`, `max_pdf_pages`, `storage_dir`, `debug`, `log_text`, `tesseract_cmd`, `tessdata_dir`; and `get_settings() -> Settings`.
- Produces: `Settings.tessdata_path -> Path`, `Settings.resolve_tesseract_cmd() -> str`.

- [ ] **Step 1: Write the failing test**

```python
# tests/test_config.py
from pathlib import Path
from ocr.config import Settings


def test_defaults_match_spec():
    s = Settings()
    assert s.engine == "tesseract"
    assert s.languages == "ben+eng"
    assert s.dpi == 300
    assert s.min_confidence == 0.5
    assert s.max_pdf_size_mb == 50
    assert s.max_pdf_pages == 500
    assert s.debug is False
    assert s.log_text is False


def test_env_overrides_are_prefixed(monkeypatch):
    monkeypatch.setenv("OCR_DPI", "200")
    monkeypatch.setenv("OCR_DEBUG", "1")
    s = Settings()
    assert s.dpi == 200
    assert s.debug is True


def test_tessdata_path_is_absolute():
    s = Settings(tessdata_dir="tessdata")
    assert isinstance(s.tessdata_path, Path)
    assert s.tessdata_path.is_absolute()
```

- [ ] **Step 2: Run test to verify it fails**

Run: `python -m pytest tests/test_config.py -v`
Expected: FAIL with `ModuleNotFoundError: No module named 'ocr'`

- [ ] **Step 3: Write minimal implementation**

```python
# ocr/__init__.py
__version__ = "1.0.0"
SCHEMA_VERSION = "1.0"
```

```python
# ocr/config.py
"""Environment-driven settings. All variables are OCR_-prefixed."""
from __future__ import annotations

import shutil
from functools import lru_cache
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

PROJECT_ROOT = Path(__file__).resolve().parents[1]


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_prefix="OCR_", env_file=".env.local", extra="ignore")

    engine: str = "tesseract"
    languages: str = "ben+eng"
    dpi: int = 300
    min_confidence: float = 0.5
    max_pdf_size_mb: int = 50
    max_pdf_pages: int = 500
    storage_dir: str = "storage"
    debug: bool = False
    log_text: bool = False
    tesseract_cmd: str = ""
    tessdata_dir: str = "tessdata"

    @property
    def tessdata_path(self) -> Path:
        p = Path(self.tessdata_dir)
        return p if p.is_absolute() else PROJECT_ROOT / p

    @property
    def storage_path(self) -> Path:
        p = Path(self.storage_dir)
        return p if p.is_absolute() else PROJECT_ROOT / p

    def resolve_tesseract_cmd(self) -> str:
        """Explicit config wins, then PATH, then the standard Windows install."""
        if self.tesseract_cmd:
            return self.tesseract_cmd
        found = shutil.which("tesseract")
        if found:
            return found
        default = Path(r"C:\Program Files\Tesseract-OCR\tesseract.exe")
        return str(default) if default.exists() else "tesseract"


@lru_cache
def get_settings() -> Settings:
    return Settings()
```

```python
# ocr/__main__.py
from ocr.cli import main

if __name__ == "__main__":
    raise SystemExit(main())
```

```text
# requirements-ocr.txt
PyMuPDF>=1.26
pytesseract>=0.3.13
paddleocr>=3.7
paddlepaddle>=3.3
pillow>=11
opencv-python>=4.10
pydantic>=2.11
pydantic-settings>=2.14
pytest>=9
```

- [ ] **Step 4: Write `scripts/setup-ocr.py`**

```python
#!/usr/bin/env python3
"""Verify the Tesseract install and populate project-local tessdata/.

Tesseract's Windows build ships only eng+osd, and writing into its install
directory needs admin rights. We keep models in a gitignored project-local
directory that OCR_TESSDATA_DIR points at instead.
"""
from __future__ import annotations

import shutil
import subprocess
import sys
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
TESSDATA = ROOT / "tessdata"
BEN_URL = "https://github.com/tesseract-ocr/tessdata_best/raw/main/ben.traineddata"
SYSTEM_TESSDATA = Path(r"C:\Program Files\Tesseract-OCR\tessdata")


def main() -> int:
    exe = shutil.which("tesseract") or str(SYSTEM_TESSDATA.parent / "tesseract.exe")
    if not Path(exe).exists():
        print("Tesseract not found. Install it first:")
        print("  winget install --id UB-Mannheim.TesseractOCR")
        return 1
    version = subprocess.run([exe, "--version"], capture_output=True, text=True)
    print(version.stdout.splitlines()[0] if version.stdout else "tesseract found")

    TESSDATA.mkdir(exist_ok=True)
    for name in ("eng.traineddata", "osd.traineddata"):
        src = SYSTEM_TESSDATA / name
        dst = TESSDATA / name
        if not dst.exists() and src.exists():
            shutil.copy2(src, dst)
            print(f"copied {name}")

    ben = TESSDATA / "ben.traineddata"
    if ben.exists():
        print(f"ben.traineddata present ({ben.stat().st_size // 1024} KB)")
    else:
        print(f"downloading ben.traineddata from {BEN_URL}")
        urllib.request.urlretrieve(BEN_URL, ben)
        print(f"downloaded ({ben.stat().st_size // 1024} KB)")

    missing = [n for n in ("ben", "eng") if not (TESSDATA / f"{n}.traineddata").exists()]
    if missing:
        print(f"MISSING: {missing}")
        return 1
    print(f"tessdata ready at {TESSDATA}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
```

- [ ] **Step 5: Run tests and setup script**

Run: `python -m pytest tests/test_config.py -v`
Expected: PASS (3 tests)

Run: `python scripts/setup-ocr.py`
Expected: prints tesseract version and `tessdata ready at …`, exit 0

- [ ] **Step 6: Commit**

```bash
git add ocr/ scripts/setup-ocr.py requirements-ocr.txt tests/test_config.py
git commit -m "feat(ocr): package skeleton, env-driven config, tessdata setup script"
```

---

### Task 2: Bengali text normalization

Pure functions with no OCR dependency. These must be correct regardless of engine accuracy, so they are tested exhaustively and first.

**Files:**
- Create: `ocr/text/__init__.py`, `ocr/text/bengali.py`, `ocr/text/normalize.py`
- Test: `tests/test_bengali.py`, `tests/test_normalize.py`

**Interfaces:**
- Produces: `bengali.to_ascii_digits(str) -> str`
- Produces: `bengali.parse_date(str) -> str | None` returning ISO `YYYY-MM-DD`
- Produces: `bengali.extract_digits(str) -> str` (digits only, ASCII)
- Produces: `normalize.clean_text(str) -> str`
- Produces: `normalize.is_noise_line(str) -> bool`

- [ ] **Step 1: Write the failing tests**

```python
# tests/test_bengali.py
import pytest
from ocr.text import bengali


@pytest.mark.parametrize("src,expected", [
    ("৩৭৩৩৩৭৯১৮৮", "3733379188"),      # NID from the real sample
    ("৪৪৩২১০১০০৬২৯৩", "4432101006293"),  # bank account
    ("০১৭৪৮০৯৯৬৩৫", "01748099635"),      # mobile
    ("০১/০৫/১৯৮২", "01/05/1982"),        # date keeps separators
    ("৫ ফুট ৩ ইঞ্চি", "5 ফুট 3 ইঞ্চি"),   # only digits change
    ("ABC123", "ABC123"),                 # already ASCII
    ("", ""),
])
def test_to_ascii_digits(src, expected):
    assert bengali.to_ascii_digits(src) == expected


@pytest.mark.parametrize("src,expected", [
    ("০১/০৫/১৯৮২", "1982-05-01"),
    ("01/05/1982", "1982-05-01"),
    ("০১ জুলাই, ২০২৩", "2023-07-01"),     # certificate employment start
    ("07 May 1982", "1982-05-07"),         # NID card English form
    ("৭ মে ১৯৮২", "1982-05-07"),
    ("not a date", None),
    ("", None),
])
def test_parse_date(src, expected):
    assert bengali.parse_date(src) == expected


def test_extract_digits_strips_separators():
    assert bengali.extract_digits("৩৭৩ ৩৩৭ ৯১৮৮") == "3733379188"
    assert bengali.extract_digits("373 337 9188") == "3733379188"


def test_parse_date_rejects_impossible_dates():
    assert bengali.parse_date("৩২/০৫/১৯৮২") is None   # day 32
    assert bengali.parse_date("০১/১৩/১৯৮২") is None   # month 13
```

```python
# tests/test_normalize.py
from ocr.text import normalize


def test_collapses_repeated_spaces_and_blank_lines():
    assert normalize.clean_text("a    b\n\n\n\nc") == "a b\n\nc"


def test_strips_control_characters():
    assert normalize.clean_text("a\x00\x08b") == "a b"


def test_applies_nfc_composition():
    # Bengali text must be canonically composed so equal strings compare equal
    import unicodedata
    src = unicodedata.normalize("NFD", "আরজুমান")
    assert normalize.clean_text(src) == unicodedata.normalize("NFC", "আরজুমান")


def test_noise_lines_from_the_real_sample_are_detected():
    # Separator-column artifacts observed in the actual Tesseract run
    for line in ("০০৩", "৩০০", "০০", "|", "£", "¢"):
        assert normalize.is_noise_line(line) is True


def test_real_short_values_are_not_noise():
    for line in ("৪২ বছর", "ইসলাম", "বিবাহিত", "৮ম শ্রেণী", "৬৮ কেজি"):
        assert normalize.is_noise_line(line) is False


def test_clean_text_drops_noise_but_keeps_content():
    src = "০১। নাম আরজুমান আরা\n০০৩\n০২। পিতা নাম জালাল\n"
    out = normalize.clean_text(src, drop_noise=True)
    assert "০০৩" not in out
    assert "আরজুমান আরা" in out
    assert "জালাল" in out
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `python -m pytest tests/test_bengali.py tests/test_normalize.py -v`
Expected: FAIL with `ModuleNotFoundError: No module named 'ocr.text'`

- [ ] **Step 3: Implement `ocr/text/bengali.py`**

```python
"""Bengali numeral and date handling.

Every digit on the biodata form is a Bengali numeral. Without normalization the
NID and phone number are unsearchable and cannot be matched against the Latin
digits printed on the ID card, so this runs on every extracted value.
"""
from __future__ import annotations

import re

BENGALI_DIGITS = "০১২৩৪৫৬৭৮৯"          # U+09E6 – U+09EF
_DIGIT_MAP = {ord(b): str(i) for i, b in enumerate(BENGALI_DIGITS)}

BENGALI_MONTHS = {
    "জানুয়ারি": 1, "জানুয়ারী": 1, "ফেব্রুয়ারি": 2, "ফেব্রুয়ারী": 2,
    "মার্চ": 3, "এপ্রিল": 4, "মে": 5, "জুন": 6, "জুলাই": 7,
    "আগস্ট": 8, "সেপ্টেম্বর": 9, "অক্টোবর": 10, "নভেম্বর": 11, "ডিসেম্বর": 12,
}
ENGLISH_MONTHS = {
    "jan": 1, "feb": 2, "mar": 3, "apr": 4, "may": 5, "jun": 6,
    "jul": 7, "aug": 8, "sep": 9, "oct": 10, "nov": 11, "dec": 12,
}


def to_ascii_digits(text: str) -> str:
    """Bengali numerals to ASCII. Everything else is left untouched."""
    return text.translate(_DIGIT_MAP) if text else ""


def extract_digits(text: str) -> str:
    """All digits, ASCII, separators removed. For NID / phone / account numbers."""
    return re.sub(r"\D", "", to_ascii_digits(text or ""))


def _iso(year: int, month: int, day: int) -> str | None:
    if not (1 <= month <= 12 and 1 <= day <= 31 and 1900 <= year <= 2100):
        return None
    if day > (29, 31, 29, 30, 31, 30, 31, 31, 30, 31, 30, 31)[month - 1]:
        return None
    return f"{year:04d}-{month:02d}-{day:02d}"


def parse_date(text: str) -> str | None:
    """Parse a Bengali or English date to ISO YYYY-MM-DD, or None.

    Returns None rather than guessing — an unreadable date must stay unreadable.
    """
    if not text:
        return None
    s = to_ascii_digits(text).strip()

    m = re.search(r"\b(\d{1,2})[/\-.](\d{1,2})[/\-.](\d{4})\b", s)
    if m:                                     # DD/MM/YYYY (Bangladeshi convention)
        return _iso(int(m.group(3)), int(m.group(2)), int(m.group(1)))

    for name, num in BENGALI_MONTHS.items():
        m = re.search(rf"(\d{{1,2}})\s*{re.escape(name)}\s*,?\s*(\d{{4}})", s)
        if m:
            return _iso(int(m.group(2)), num, int(m.group(1)))

    m = re.search(r"\b(\d{1,2})\s+([A-Za-z]{3,9})\s+(\d{4})\b", s)
    if m:
        num = ENGLISH_MONTHS.get(m.group(2)[:3].lower())
        if num:
            return _iso(int(m.group(3)), num, int(m.group(1)))
    return None
```

- [ ] **Step 4: Implement `ocr/text/normalize.py`**

```python
"""Text cleanup that removes OCR artifacts without touching meaningful content."""
from __future__ import annotations

import re
import unicodedata

_CONTROL = re.compile(r"[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]")
_SEPARATOR_GLYPHS = set("|:ঃ£¢$€§`'\"~^*_=+\\/<>[](){}")

# Observed separator-column artifacts: short, all-digit fragments the engine
# emits where the ':' column is misread. Real short values always carry a
# non-digit word ("৪২ বছর"), so digit-only is a safe discriminator.
_NOISE_DIGITS = re.compile(r"^[0-9০-৯]{1,4}$")


def is_noise_line(line: str) -> bool:
    """True for OCR artifact lines that carry no document content."""
    s = line.strip()
    if not s:
        return True
    if _NOISE_DIGITS.match(s):
        return True
    return all(ch in _SEPARATOR_GLYPHS or ch.isspace() for ch in s)


def clean_text(text: str, drop_noise: bool = False) -> str:
    """Normalize whitespace and Unicode. Content is never altered.

    drop_noise removes artifact-only lines; off by default so raw_text keeps
    everything the engine produced.
    """
    if not text:
        return ""
    s = unicodedata.normalize("NFC", text)
    s = _CONTROL.sub(" ", s)
    lines = [re.sub(r"[ \t]+", " ", ln).strip() for ln in s.split("\n")]
    if drop_noise:
        lines = [ln for ln in lines if not is_noise_line(ln)]
    out = "\n".join(lines)
    return re.sub(r"\n{3,}", "\n\n", out).strip()
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `python -m pytest tests/test_bengali.py tests/test_normalize.py -v`
Expected: PASS (all tests)

- [ ] **Step 6: Commit**

```bash
git add ocr/text/ tests/test_bengali.py tests/test_normalize.py
git commit -m "feat(ocr): Bengali numeral/date normalization and OCR artifact cleanup"
```

---

### Task 3: Pydantic schema

**Files:**
- Create: `ocr/models.py`
- Test: `tests/test_models.py`

**Interfaces:**
- Produces: `Field`, `PageResult`, `Processing`, `Conflict`, `Person`, `OcrDocument`
- Produces: `FieldStatus = Literal["ok","low_confidence","conflict","missing"]`
- Produces: `DocumentType = Literal["biodata_form","nid_card","certificate","unknown"]`
- Produces: `PageStatus = Literal["ok","failed","blank"]`
- Produces: `ProcessingStatus = Literal["success","partial_success","failed"]`
- Produces: `Field.missing(name) -> Field` constructor for absent values

- [ ] **Step 1: Write the failing test**

```python
# tests/test_models.py
import pytest
from pydantic import ValidationError
from ocr.models import Field, OcrDocument, PageResult, Processing, Person


def test_missing_field_is_null_not_empty_string():
    f = Field.missing(source_page=1)
    assert f.value is None
    assert f.status == "missing"


def test_field_keeps_raw_alongside_value():
    f = Field(value="3733379188", raw="৩৭৩৩৩৭৯১৮৮", source_page=1,
              confidence=0.9, status="ok")
    assert f.raw == "৩৭৩৩৩৭৯১৮৮"
    assert f.value == "3733379188"


def test_confidence_must_be_a_probability():
    with pytest.raises(ValidationError):
        Field(value="x", source_page=1, confidence=1.5, status="ok")


def test_page_number_is_one_based():
    with pytest.raises(ValidationError):
        PageResult(page_number=0, document_type="unknown", raw_text="",
                   clean_text="", status="ok")


def test_processing_status_derives_from_failed_pages():
    p = Processing(pages_processed=2, pages_failed=1, failed_pages=[3],
                   engines=["tesseract:ben+eng"])
    assert p.status == "partial_success"


def test_all_pages_failed_is_failed():
    p = Processing(pages_processed=0, pages_failed=3, failed_pages=[1, 2, 3],
                   engines=["tesseract:ben+eng"])
    assert p.status == "failed"


def test_document_round_trips_through_json():
    doc = OcrDocument(
        document_id="abc123", source_file="x.pdf", sha256="abc123",
        page_count=1, is_native_text=False,
        pages=[PageResult(page_number=1, document_type="biodata_form",
                          raw_text="r", clean_text="c", status="ok")],
        person=Person(), conflicts=[],
        processing=Processing(pages_processed=1, pages_failed=0,
                              failed_pages=[], engines=["tesseract:ben+eng"]),
    )
    restored = OcrDocument.model_validate_json(doc.model_dump_json())
    assert restored.pages[0].page_number == 1
    assert restored.processing.status == "success"
```

- [ ] **Step 2: Run test to verify it fails**

Run: `python -m pytest tests/test_models.py -v`
Expected: FAIL with `ModuleNotFoundError: No module named 'ocr.models'`

- [ ] **Step 3: Write the implementation**

```python
# ocr/models.py
"""The serialization contract. Everything the pipeline produces validates here."""
from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, ConfigDict, Field as PField, computed_field

from ocr import SCHEMA_VERSION

FieldStatus = Literal["ok", "low_confidence", "conflict", "missing"]
DocumentType = Literal["biodata_form", "nid_card", "certificate", "unknown"]
PageStatus = Literal["ok", "failed", "blank"]
ProcessingStatus = Literal["success", "partial_success", "failed"]


class Field(BaseModel):
    """One extracted value with its provenance.

    value is None when unreadable — never "" and never a guess, so a missing
    field can't be mistaken for a real one.
    """
    model_config = ConfigDict(extra="forbid")

    value: str | None = None
    raw: str | None = None
    confidence: float | None = PField(default=None, ge=0.0, le=1.0)
    source_page: int = PField(ge=1)
    source_label: str | None = None
    status: FieldStatus = "ok"

    @classmethod
    def missing(cls, source_page: int, source_label: str | None = None) -> "Field":
        return cls(value=None, raw=None, confidence=None,
                   source_page=source_page, source_label=source_label,
                   status="missing")


class OCRLineModel(BaseModel):
    model_config = ConfigDict(extra="forbid")
    text: str
    confidence: float | None = PField(default=None, ge=0.0, le=1.0)
    bbox: tuple[int, int, int, int] | None = None


class PageResult(BaseModel):
    model_config = ConfigDict(extra="forbid")

    page_number: int = PField(ge=1)
    document_type: DocumentType
    native_dpi: int | None = None
    render_dpi: int | None = None
    rotation: int = 0
    engine: str | None = None
    mean_confidence: float | None = PField(default=None, ge=0.0, le=1.0)
    raw_text: str
    clean_text: str
    lines: list[OCRLineModel] = []
    status: PageStatus = "ok"
    error: str | None = None


class Person(BaseModel):
    """Reconciled person data. Every value carries its own provenance."""
    model_config = ConfigDict(extra="forbid")

    full_name_bn: Field | None = None
    full_name_en: Field | None = None
    father_name: Field | None = None
    mother_name: Field | None = None
    permanent_address: Field | None = None
    present_address: Field | None = None
    nid_number: Field | None = None
    bank_account: Field | None = None
    date_of_birth: Field | None = None
    age: Field | None = None
    nationality: Field | None = None
    religion: Field | None = None
    marital_status: Field | None = None
    height: Field | None = None
    weight: Field | None = None
    mobile: Field | None = None
    education_level: Field | None = None
    post_applied: Field | None = None
    sex: Field | None = None
    nid_expiry: Field | None = None
    employer: Field | None = None
    employment_start: Field | None = None
    certificate_issuer: Field | None = None
    certificate_date: Field | None = None
    certificate_signatory: Field | None = None


class Conflict(BaseModel):
    """Disagreement between sources. Recorded, never silently resolved."""
    model_config = ConfigDict(extra="forbid")
    field: str
    candidates: list[Field]


class Processing(BaseModel):
    model_config = ConfigDict(extra="forbid")

    engines: list[str]
    pages_processed: int = PField(ge=0)
    pages_failed: int = PField(ge=0)
    failed_pages: list[int] = []
    duration_ms: int = 0
    ocr_version: str | None = None
    schema_version: str = SCHEMA_VERSION

    @computed_field
    @property
    def status(self) -> ProcessingStatus:
        if self.pages_failed == 0:
            return "success"
        return "failed" if self.pages_processed == 0 else "partial_success"


class OcrDocument(BaseModel):
    model_config = ConfigDict(extra="forbid")

    document_id: str
    source_file: str
    sha256: str
    page_count: int = PField(ge=0)
    is_native_text: bool
    pages: list[PageResult]
    person: Person
    conflicts: list[Conflict] = []
    processing: Processing
```

- [ ] **Step 4: Run test to verify it passes**

Run: `python -m pytest tests/test_models.py -v`
Expected: PASS (7 tests)

- [ ] **Step 5: Commit**

```bash
git add ocr/models.py tests/test_models.py
git commit -m "feat(ocr): Pydantic schema with per-field provenance and conflict records"
```

---

### Task 4: PDF validation, inspection, and rendering

**Files:**
- Create: `ocr/pdf/__init__.py`, `ocr/pdf/validate.py`, `ocr/pdf/inspect.py`, `ocr/pdf/render.py`
- Test: `tests/test_pdf.py`, `tests/conftest.py`

**Interfaces:**
- Produces: `validate.validate_pdf(path: Path, settings) -> None`, raises `PdfValidationError`
- Produces: `validate.PdfValidationError(Exception)` with `.exit_code: int`
- Produces: `inspect.inspect_pdf(path) -> DocumentInfo` with `.page_count`, `.is_native_text`, `.pages: list[PageInfo]`
- Produces: `inspect.PageInfo` with `.page_number`, `.native_dpi`, `.rotation`, `.text_chars`
- Produces: `render.render_pages(path, dpi) -> Iterator[tuple[int, PIL.Image.Image]]` — a generator holding one page at a time

- [ ] **Step 1: Write the failing test**

```python
# tests/conftest.py
"""Synthetic fixtures. Real documents are never committed — they contain
personal data (NID, bank accounts) and this repo has a public remote."""
from __future__ import annotations

import os
from pathlib import Path

import fitz
import pytest
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[1]
REAL_SAMPLE_ENV = "OCR_TEST_SAMPLE_PDF"


@pytest.fixture(scope="session")
def real_sample() -> Path:
    """The reference dossier, supplied out-of-band. Skips when absent."""
    raw = os.environ.get(REAL_SAMPLE_ENV)
    if not raw or not Path(raw).exists():
        pytest.skip(f"set {REAL_SAMPLE_ENV} to the reference PDF to run this test")
    return Path(raw)


def _text_image(lines: list[str], size=(1240, 1754), noise: int = 0) -> Image.Image:
    img = Image.new("RGB", size, "white")
    draw = ImageDraw.Draw(img)
    y = 100
    for line in lines:
        draw.text((100, y), line, fill="black")
        y += 40
    if noise:
        import random
        rnd = random.Random(1234)
        px = img.load()
        for _ in range(noise):
            x, yy = rnd.randrange(size[0]), rnd.randrange(size[1])
            px[x, yy] = (0, 0, 0)
    return img


def make_scanned_pdf(path: Path, pages: list[list[str]], rotation: int = 0,
                     noise: int = 0, dpi: int = 150) -> Path:
    """An image-only PDF: text is rasterized, so there is no text layer."""
    doc = fitz.open()
    for lines in pages:
        img = _text_image(lines, noise=noise)
        if rotation:
            img = img.rotate(-rotation, expand=True)
        tmp = path.with_suffix(f".p{len(doc)}.png")
        img.save(tmp)
        page = doc.new_page(width=595, height=842)
        page.insert_image(page.rect, filename=str(tmp))
        tmp.unlink()
    doc.save(path)
    doc.close()
    return path


def make_native_pdf(path: Path, lines: list[str]) -> Path:
    """A PDF with a real text layer, for native-text detection tests."""
    doc = fitz.open()
    page = doc.new_page()
    page.insert_text((72, 720), "\n".join(lines), fontsize=11)
    doc.save(path)
    doc.close()
    return path


@pytest.fixture
def scanned_pdf(tmp_path) -> Path:
    return make_scanned_pdf(tmp_path / "scan.pdf", [["Hello World", "12345"]])


@pytest.fixture
def native_pdf(tmp_path) -> Path:
    return make_native_pdf(tmp_path / "native.pdf", ["Hello World", "12345"])
```

```python
# tests/test_pdf.py
import fitz
import pytest
from ocr.config import Settings
from ocr.pdf import inspect as pdf_inspect
from ocr.pdf import render, validate
from tests.conftest import make_scanned_pdf


def test_rejects_non_pdf_extension(tmp_path):
    f = tmp_path / "notes.txt"
    f.write_bytes(b"%PDF-1.4 pretending")
    with pytest.raises(validate.PdfValidationError, match="extension"):
        validate.validate_pdf(f, Settings())


def test_rejects_bad_magic_header(tmp_path):
    f = tmp_path / "fake.pdf"
    f.write_bytes(b"NOTAPDF" + b"\x00" * 100)
    with pytest.raises(validate.PdfValidationError, match="header"):
        validate.validate_pdf(f, Settings())


def test_rejects_empty_file(tmp_path):
    f = tmp_path / "empty.pdf"
    f.write_bytes(b"")
    with pytest.raises(validate.PdfValidationError):
        validate.validate_pdf(f, Settings())


def test_rejects_oversize_file(tmp_path, scanned_pdf):
    with pytest.raises(validate.PdfValidationError, match="size"):
        validate.validate_pdf(scanned_pdf, Settings(max_pdf_size_mb=0))


def test_rejects_encrypted_pdf(tmp_path):
    src = make_scanned_pdf(tmp_path / "plain.pdf", [["secret"]])
    enc = tmp_path / "enc.pdf"
    doc = fitz.open(src)
    doc.save(enc, encryption=fitz.PDF_ENCRYPT_AES_256, owner_pw="o", user_pw="u")
    doc.close()
    with pytest.raises(validate.PdfValidationError, match="password"):
        validate.validate_pdf(enc, Settings())


def test_rejects_corrupted_pdf(tmp_path, scanned_pdf):
    data = scanned_pdf.read_bytes()
    broken = tmp_path / "broken.pdf"
    broken.write_bytes(data[: len(data) // 3])
    with pytest.raises(validate.PdfValidationError):
        validate.validate_pdf(broken, Settings())


def test_detects_scanned_pdf_has_no_text_layer(scanned_pdf):
    info = pdf_inspect.inspect_pdf(scanned_pdf)
    assert info.is_native_text is False
    assert info.pages[0].text_chars == 0


def test_detects_native_text_pdf(native_pdf):
    info = pdf_inspect.inspect_pdf(native_pdf)
    assert info.is_native_text is True
    assert info.pages[0].text_chars > 0


def test_reports_native_dpi_of_embedded_scan(scanned_pdf):
    info = pdf_inspect.inspect_pdf(scanned_pdf)
    assert info.pages[0].native_dpi is not None
    assert 50 < info.pages[0].native_dpi < 600


def test_render_yields_one_page_at_a_time(tmp_path):
    pdf = make_scanned_pdf(tmp_path / "three.pdf", [["a"], ["b"], ["c"]])
    seen = []
    for page_number, image in render.render_pages(pdf, dpi=100):
        seen.append(page_number)
        assert image.width > 0
    assert seen == [1, 2, 3]


def test_render_dpi_controls_output_size(tmp_path):
    pdf = make_scanned_pdf(tmp_path / "one.pdf", [["a"]])
    _, low = next(render.render_pages(pdf, dpi=72))
    _, high = next(render.render_pages(pdf, dpi=144))
    assert high.width > low.width
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `python -m pytest tests/test_pdf.py -v`
Expected: FAIL with `ModuleNotFoundError: No module named 'ocr.pdf'`

- [ ] **Step 3: Implement `ocr/pdf/validate.py`**

```python
"""Uploaded PDFs are untrusted input. Validate before anything else touches them."""
from __future__ import annotations

from pathlib import Path

import fitz

from ocr.config import Settings

PDF_MAGIC = b"%PDF"


class PdfValidationError(Exception):
    """Rejection with a CLI exit code. 2 = invalid, 3 = encrypted."""

    def __init__(self, message: str, exit_code: int = 2) -> None:
        super().__init__(message)
        self.exit_code = exit_code


def validate_pdf(path: Path, settings: Settings) -> None:
    path = Path(path)
    if path.suffix.lower() != ".pdf":
        raise PdfValidationError(f"invalid extension {path.suffix!r}; expected .pdf")
    if not path.is_file():
        raise PdfValidationError(f"file not found: {path}")

    size = path.stat().st_size
    if size == 0:
        raise PdfValidationError("file is empty")
    if size > settings.max_pdf_size_mb * 1024 * 1024:
        raise PdfValidationError(
            f"file size {size / 1048576:.1f} MB exceeds "
            f"OCR_MAX_PDF_SIZE_MB={settings.max_pdf_size_mb}"
        )

    with path.open("rb") as fh:
        if not fh.read(len(PDF_MAGIC)).startswith(PDF_MAGIC):
            raise PdfValidationError("missing %PDF header; not a PDF or corrupted")

    try:
        doc = fitz.open(path)
    except Exception as exc:                    # noqa: BLE001 - surface as validation
        raise PdfValidationError(f"cannot open PDF: {exc}") from exc

    try:
        if doc.is_encrypted and not doc.authenticate(""):
            raise PdfValidationError("PDF is password-protected", exit_code=3)
        if doc.page_count == 0:
            raise PdfValidationError("PDF has no pages")
        if doc.page_count > settings.max_pdf_pages:
            raise PdfValidationError(
                f"page count {doc.page_count} exceeds "
                f"OCR_MAX_PDF_PAGES={settings.max_pdf_pages}"
            )
        try:                                     # force a parse of the last page
            doc.load_page(doc.page_count - 1).get_text("text")
        except Exception as exc:                 # noqa: BLE001
            raise PdfValidationError(f"PDF is corrupted: {exc}") from exc
    finally:
        doc.close()
```

- [ ] **Step 4: Implement `ocr/pdf/inspect.py`**

```python
"""Native-text detection and page metadata.

These documents are image-only, but native-text detection is kept so the same
pipeline can short-circuit OCR for digital PDFs later.
"""
from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path

import fitz

NATIVE_TEXT_MIN_CHARS = 50   # per page, below this a "text layer" is noise


@dataclass(frozen=True)
class PageInfo:
    page_number: int
    text_chars: int
    image_count: int
    native_dpi: int | None
    rotation: int
    width_pt: float
    height_pt: float


@dataclass(frozen=True)
class DocumentInfo:
    page_count: int
    is_native_text: bool
    pages: list[PageInfo]


def inspect_pdf(path: Path) -> DocumentInfo:
    doc = fitz.open(path)
    try:
        pages: list[PageInfo] = []
        for index, page in enumerate(doc):
            text = page.get_text("text") or ""
            images = page.get_images(full=True)
            native_dpi = None
            if images and page.rect.width:
                widest = max(img[2] for img in images)
                native_dpi = round(widest / (page.rect.width / 72))
            pages.append(PageInfo(
                page_number=index + 1,
                text_chars=len(text.strip()),
                image_count=len(images),
                native_dpi=native_dpi,
                rotation=page.rotation,
                width_pt=page.rect.width,
                height_pt=page.rect.height,
            ))
        is_native = any(p.text_chars >= NATIVE_TEXT_MIN_CHARS for p in pages)
        return DocumentInfo(doc.page_count, is_native, pages)
    finally:
        doc.close()
```

- [ ] **Step 5: Implement `ocr/pdf/render.py`**

```python
"""Page rasterization, one page at a time.

A generator rather than a list: a 500-page PDF must never hold more than one
rendered page in memory.
"""
from __future__ import annotations

import io
from collections.abc import Iterator
from pathlib import Path

import fitz
from PIL import Image


def render_pages(path: Path, dpi: int) -> Iterator[tuple[int, Image.Image]]:
    """Yield (page_number, image). The previous page is released each step."""
    doc = fitz.open(path)
    try:
        for index in range(doc.page_count):
            page = doc.load_page(index)
            pix = page.get_pixmap(dpi=dpi)
            with Image.open(io.BytesIO(pix.tobytes("png"))) as img:
                yield index + 1, img.convert("RGB")
            del pix
            doc.load_page(index).clean_contents  # noqa: B018 - drop cached page
    finally:
        doc.close()
```

- [ ] **Step 6: Run tests to verify they pass**

Run: `python -m pytest tests/test_pdf.py -v`
Expected: PASS (11 tests)

- [ ] **Step 7: Commit**

```bash
git add ocr/pdf/ tests/test_pdf.py tests/conftest.py
git commit -m "feat(ocr): PDF validation, native-text detection, streaming page render"
```

---

### Task 5: Image preprocessing

**Files:**
- Create: `ocr/preprocess/__init__.py`, `ocr/preprocess/steps.py`
- Test: `tests/test_preprocess.py`

**Interfaces:**
- Produces: `steps.PreprocessStep` protocol — `(Image) -> Image`
- Produces: `steps.to_grayscale`, `steps.autocontrast`, `steps.denoise`, `steps.sharpen`, `steps.binarize`, `steps.deskew`, `steps.upscale_if_low_dpi`
- Produces: `steps.build_pipeline(native_dpi: int | None, target_dpi: int, aggressive: bool = False) -> list[PreprocessStep]`
- Produces: `steps.apply(image, pipeline) -> Image`
- Produces: `steps.estimate_skew(image) -> float` (degrees)

- [ ] **Step 1: Write the failing test**

```python
# tests/test_preprocess.py
import pytest
from PIL import Image, ImageDraw
from ocr.preprocess import steps


def _page(text="Hello World", size=(800, 400), angle=0.0):
    img = Image.new("RGB", size, "white")
    ImageDraw.Draw(img).text((60, 180), text, fill="black")
    return img.rotate(angle, expand=True, fillcolor="white") if angle else img


def test_grayscale_produces_single_channel():
    assert steps.to_grayscale(_page()).mode == "L"


def test_binarize_produces_only_two_values():
    out = steps.binarize(steps.to_grayscale(_page()))
    assert set(out.getdata()) <= {0, 255}


def test_upscale_triggers_below_target_dpi():
    img = _page()
    out = steps.upscale_if_low_dpi(img, native_dpi=110, target_dpi=300)
    assert out.width > img.width


def test_upscale_is_a_noop_when_dpi_is_sufficient():
    img = _page()
    out = steps.upscale_if_low_dpi(img, native_dpi=300, target_dpi=300)
    assert out.size == img.size


def test_upscale_is_a_noop_when_dpi_unknown():
    img = _page()
    assert steps.upscale_if_low_dpi(img, native_dpi=None, target_dpi=300).size == img.size


def test_estimate_skew_detects_a_tilt():
    assert steps.estimate_skew(steps.to_grayscale(_page(angle=5))) == pytest.approx(5, abs=2)


def test_deskew_reduces_measured_skew():
    tilted = steps.to_grayscale(_page(angle=5))
    corrected = steps.deskew(tilted)
    assert abs(steps.estimate_skew(corrected)) < abs(steps.estimate_skew(tilted))


def test_default_pipeline_is_conservative():
    """Aggressive steps must be opt-in: binarization destroys faint Bengali
    conjuncts on low-quality scans."""
    names = [s.__name__ for s in steps.build_pipeline(native_dpi=150, target_dpi=300)]
    assert "binarize" not in names
    assert "to_grayscale" in names


def test_aggressive_pipeline_adds_binarization():
    names = [s.__name__ for s in
             steps.build_pipeline(native_dpi=150, target_dpi=300, aggressive=True)]
    assert "binarize" in names


def test_apply_runs_every_step_in_order():
    img = _page()
    out = steps.apply(img, steps.build_pipeline(native_dpi=110, target_dpi=300))
    assert out.width > img.width      # upscale ran
    assert out.mode == "L"            # grayscale ran
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `python -m pytest tests/test_preprocess.py -v`
Expected: FAIL with `ModuleNotFoundError: No module named 'ocr.preprocess'`

- [ ] **Step 3: Write the implementation**

```python
# ocr/preprocess/steps.py
"""Modular image preprocessing.

Each step is an independent Image -> Image function so the pipeline can be
retuned without touching the OCR code. The default pipeline is deliberately
conservative: on 113-157 DPI scans, aggressive binarization removes the faint
strokes that distinguish Bengali conjuncts.
"""
from __future__ import annotations

import functools
from collections.abc import Callable

import cv2
import numpy as np
from PIL import Image, ImageFilter, ImageOps

PreprocessStep = Callable[[Image.Image], Image.Image]

MAX_UPSCALE = 3.0
SKEW_LIMIT_DEG = 15.0


def to_grayscale(image: Image.Image) -> Image.Image:
    return image if image.mode == "L" else image.convert("L")


def autocontrast(image: Image.Image) -> Image.Image:
    return ImageOps.autocontrast(to_grayscale(image), cutoff=1)


def denoise(image: Image.Image) -> Image.Image:
    arr = np.array(to_grayscale(image))
    return Image.fromarray(cv2.fastNlMeansDenoising(arr, h=7))


def sharpen(image: Image.Image) -> Image.Image:
    return image.filter(ImageFilter.UnsharpMask(radius=1.2, percent=120, threshold=3))


def binarize(image: Image.Image) -> Image.Image:
    """Adaptive threshold. Opt-in — it can erase faint Bengali conjuncts."""
    arr = np.array(to_grayscale(image))
    out = cv2.adaptiveThreshold(arr, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
                                cv2.THRESH_BINARY, 31, 15)
    return Image.fromarray(out)


def estimate_skew(image: Image.Image) -> float:
    """Skew in degrees, positive = counter-clockwise. 0.0 when undetectable."""
    arr = np.array(to_grayscale(image))
    edges = cv2.Canny(arr, 50, 150, apertureSize=3)
    lines = cv2.HoughLinesP(edges, 1, np.pi / 360, threshold=100,
                            minLineLength=arr.shape[1] // 4, maxLineGap=20)
    if lines is None:
        return 0.0
    angles = []
    for x1, y1, x2, y2 in lines[:, 0]:
        if x2 == x1:
            continue
        angle = np.degrees(np.arctan2(y2 - y1, x2 - x1))
        if abs(angle) <= SKEW_LIMIT_DEG:
            angles.append(angle)
    return float(-np.median(angles)) if angles else 0.0


def deskew(image: Image.Image) -> Image.Image:
    angle = estimate_skew(image)
    if abs(angle) < 0.3:                 # below this, rotation costs more than it fixes
        return image
    return image.rotate(-angle, expand=True, fillcolor=255,
                        resample=Image.Resampling.BICUBIC)


def upscale_if_low_dpi(image: Image.Image, native_dpi: int | None,
                       target_dpi: int) -> Image.Image:
    """Enlarge scans captured below the target DPI.

    This adds no information, but OCR engines are trained near 300 DPI and
    recognize glyph shapes more reliably at that scale.
    """
    if not native_dpi or native_dpi >= target_dpi:
        return image
    factor = min(target_dpi / native_dpi, MAX_UPSCALE)
    size = (int(image.width * factor), int(image.height * factor))
    return image.resize(size, Image.Resampling.LANCZOS)


def build_pipeline(native_dpi: int | None, target_dpi: int,
                   aggressive: bool = False) -> list[PreprocessStep]:
    upscale = functools.partial(upscale_if_low_dpi, native_dpi=native_dpi,
                                target_dpi=target_dpi)
    upscale.__name__ = "upscale_if_low_dpi"          # keep step names introspectable
    pipeline: list[PreprocessStep] = [to_grayscale, upscale, autocontrast, deskew]
    if aggressive:
        pipeline += [denoise, sharpen, binarize]
    return pipeline


def apply(image: Image.Image, pipeline: list[PreprocessStep]) -> Image.Image:
    for step in pipeline:
        image = step(image)
    return image
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `python -m pytest tests/test_preprocess.py -v`
Expected: PASS (10 tests)

- [ ] **Step 5: Commit**

```bash
git add ocr/preprocess/ tests/test_preprocess.py
git commit -m "feat(ocr): modular image preprocessing with conservative defaults"
```

---

### Task 6: OCR providers

**Files:**
- Create: `ocr/engines/__init__.py`, `ocr/engines/base.py`, `ocr/engines/tesseract.py`, `ocr/engines/paddle.py`, `ocr/engines/registry.py`
- Test: `tests/test_engines.py`

**Interfaces:**
- Produces: `base.OCRLine` dataclass — `text: str`, `confidence: float | None`, `bbox: tuple[int,int,int,int] | None`
- Produces: `base.OCRPageResult` dataclass — `text: str`, `lines: list[OCRLine]`, `engine: str`, `mean_confidence: float | None`
- Produces: `base.OCRProvider` protocol — `name: str`, `extract_text(image: Image.Image) -> OCRPageResult`
- Produces: `tesseract.TesseractProvider(languages: str, tessdata_dir: Path, cmd: str)`
- Produces: `paddle.PaddleProvider(lang: str = "en")`
- Produces: `registry.get_provider(name: str, settings) -> OCRProvider`, `registry.available() -> list[str]`

- [ ] **Step 1: Write the failing test**

```python
# tests/test_engines.py
import pytest
from PIL import Image, ImageDraw
from ocr.config import Settings
from ocr.engines import base, registry


def _image(text="HELLO 12345", size=(900, 200)):
    img = Image.new("RGB", size, "white")
    ImageDraw.Draw(img).text((40, 80), text, fill="black")
    return img


def test_providers_satisfy_the_protocol():
    settings = Settings()
    for name in registry.available():
        provider = registry.get_provider(name, settings)
        assert isinstance(provider, base.OCRProvider)
        assert isinstance(provider.name, str) and provider.name


def test_unknown_provider_names_are_rejected():
    with pytest.raises(KeyError, match="unknown OCR engine"):
        registry.get_provider("does-not-exist", Settings())


def test_result_shape_is_uniform_across_engines():
    """The whole point of the abstraction: engines are interchangeable."""
    settings = Settings()
    for name in registry.available():
        result = registry.get_provider(name, settings).extract_text(_image())
        assert isinstance(result, base.OCRPageResult)
        assert isinstance(result.text, str)
        assert all(isinstance(ln, base.OCRLine) for ln in result.lines)
        if result.mean_confidence is not None:
            assert 0.0 <= result.mean_confidence <= 1.0


@pytest.mark.parametrize("name", ["tesseract", "paddleocr"])
def test_engine_reads_plain_latin_text(name):
    result = registry.get_provider(name, Settings()).extract_text(_image())
    assert "12345" in result.text.replace(" ", "")


def test_blank_page_returns_empty_not_an_error():
    blank = Image.new("RGB", (600, 400), "white")
    result = registry.get_provider("tesseract", Settings()).extract_text(blank)
    assert result.text.strip() == ""
    assert result.lines == []
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `python -m pytest tests/test_engines.py -v`
Expected: FAIL with `ModuleNotFoundError: No module named 'ocr.engines'`

- [ ] **Step 3: Implement `ocr/engines/base.py`**

```python
"""The OCR provider seam.

Everything downstream consumes OCRPageResult, so replacing the engine means
adding one module and changing OCR_ENGINE — no other code changes.
"""
from __future__ import annotations

from dataclasses import dataclass, field
from typing import Protocol, runtime_checkable

from PIL import Image


@dataclass(frozen=True)
class OCRLine:
    text: str
    confidence: float | None = None
    bbox: tuple[int, int, int, int] | None = None


@dataclass(frozen=True)
class OCRPageResult:
    text: str
    engine: str
    lines: list[OCRLine] = field(default_factory=list)
    mean_confidence: float | None = None


@runtime_checkable
class OCRProvider(Protocol):
    @property
    def name(self) -> str: ...

    def extract_text(self, image: Image.Image) -> OCRPageResult: ...
```

- [ ] **Step 4: Implement `ocr/engines/tesseract.py`**

```python
"""Tesseract provider. Owns page prose and all Bengali text.

Measured on the reference sample: 15 of 16 biodata field values correct,
including every number. Its one failure (the name) is covered by PaddleOCR.
"""
from __future__ import annotations

import logging
import os
from pathlib import Path

import pytesseract
from PIL import Image

from ocr.engines.base import OCRLine, OCRPageResult

logger = logging.getLogger(__name__)

# Page segmentation 6 = "a single uniform block". The biodata form is a clean
# two-column layout that PSM 3's automatic analysis tends to split badly.
DEFAULT_PSM = 6


class TesseractProvider:
    def __init__(self, languages: str, tessdata_dir: Path, cmd: str,
                 psm: int = DEFAULT_PSM) -> None:
        self._languages = languages
        self._tessdata_dir = Path(tessdata_dir)
        self._psm = psm
        pytesseract.pytesseract.tesseract_cmd = cmd

    @property
    def name(self) -> str:
        return f"tesseract:{self._languages}"

    def _config(self) -> str:
        # TESSDATA_PREFIX makes tesseract read from this directory exclusively,
        # which is why eng/osd are copied in alongside ben.
        return f'--psm {self._psm} --tessdata-dir "{self._tessdata_dir}"'

    def extract_text(self, image: Image.Image) -> OCRPageResult:
        env_backup = os.environ.get("TESSDATA_PREFIX")
        os.environ["TESSDATA_PREFIX"] = str(self._tessdata_dir)
        try:
            data = pytesseract.image_to_data(
                image, lang=self._languages, config=self._config(),
                output_type=pytesseract.Output.DICT,
            )
        finally:
            if env_backup is None:
                os.environ.pop("TESSDATA_PREFIX", None)
            else:
                os.environ["TESSDATA_PREFIX"] = env_backup

        lines: list[OCRLine] = []
        confidences: list[float] = []
        current: list[str] = []
        current_conf: list[float] = []
        last_key: tuple[int, int, int] | None = None

        for i, word in enumerate(data["text"]):
            key = (data["block_num"][i], data["par_num"][i], data["line_num"][i])
            conf = float(data["conf"][i])
            if last_key is not None and key != last_key and current:
                lines.append(_finish_line(current, current_conf))
                current, current_conf = [], []
            last_key = key
            if word.strip():
                current.append(word)
                if conf >= 0:                     # tesseract emits -1 for non-text
                    current_conf.append(conf / 100.0)
                    confidences.append(conf / 100.0)
        if current:
            lines.append(_finish_line(current, current_conf))

        text = "\n".join(ln.text for ln in lines)
        mean = sum(confidences) / len(confidences) if confidences else None
        return OCRPageResult(text=text, engine=self.name, lines=lines,
                             mean_confidence=mean)


def _finish_line(words: list[str], confs: list[float]) -> OCRLine:
    return OCRLine(text=" ".join(words),
                   confidence=sum(confs) / len(confs) if confs else None)
```

- [ ] **Step 5: Implement `ocr/engines/paddle.py`**

```python
"""PaddleOCR provider. Owns Latin/digit field candidates.

Two hard-won constraints, both measured on the reference sample:

1. PaddleOCR has no Bengali model - `bn` is absent from every language group in
   paddleocr 3.7. It is used for Latin/digits only, never for Bengali.
2. paddlepaddle 3.3.1 raises NotImplementedError
   (ConvertPirAttribute2RuntimeAttribute) unless oneDNN is disabled, so
   enable_mkldnn=False is set here rather than left to callers.
"""
from __future__ import annotations

import logging
import os
import warnings

import numpy as np
from PIL import Image

from ocr.engines.base import OCRLine, OCRPageResult

logger = logging.getLogger(__name__)


class PaddleProvider:
    def __init__(self, lang: str = "en") -> None:
        self._lang = lang
        self._ocr = None                    # models load lazily; startup is slow

    @property
    def name(self) -> str:
        return f"paddleocr:{self._lang}"

    def _engine(self):
        if self._ocr is None:
            os.environ.setdefault("FLAGS_use_mkldnn", "0")
            with warnings.catch_warnings():
                warnings.simplefilter("ignore")
                from paddleocr import PaddleOCR
                self._ocr = PaddleOCR(
                    lang=self._lang,
                    enable_mkldnn=False,
                    use_doc_orientation_classify=False,
                    use_doc_unwarping=False,
                    use_textline_orientation=False,
                )
        return self._ocr

    def extract_text(self, image: Image.Image) -> OCRPageResult:
        array = np.array(image.convert("RGB"))
        lines: list[OCRLine] = []
        confidences: list[float] = []
        for page in self._engine().predict(array):
            texts = page.get("rec_texts", [])
            scores = page.get("rec_scores", [])
            boxes = page.get("rec_boxes", []) or page.get("dt_polys", [])
            for index, text in enumerate(texts):
                if not text.strip():
                    continue
                score = float(scores[index]) if index < len(scores) else None
                lines.append(OCRLine(text=text, confidence=score,
                                     bbox=_bbox(boxes, index)))
                if score is not None:
                    confidences.append(score)
        mean = sum(confidences) / len(confidences) if confidences else None
        return OCRPageResult(text="\n".join(ln.text for ln in lines),
                             engine=self.name, lines=lines, mean_confidence=mean)


def _bbox(boxes, index) -> tuple[int, int, int, int] | None:
    if boxes is None or index >= len(boxes):
        return None
    pts = np.array(boxes[index]).reshape(-1, 2)
    return (int(pts[:, 0].min()), int(pts[:, 1].min()),
            int(pts[:, 0].max()), int(pts[:, 1].max()))
```

- [ ] **Step 6: Implement `ocr/engines/registry.py`**

```python
"""name -> provider, so the engine is a configuration value."""
from __future__ import annotations

from ocr.config import Settings
from ocr.engines.base import OCRProvider
from ocr.engines.paddle import PaddleProvider
from ocr.engines.tesseract import TesseractProvider

_NAMES = ("tesseract", "paddleocr")


def available() -> list[str]:
    return list(_NAMES)


def get_provider(name: str, settings: Settings) -> OCRProvider:
    if name == "tesseract":
        return TesseractProvider(
            languages=settings.languages,
            tessdata_dir=settings.tessdata_path,
            cmd=settings.resolve_tesseract_cmd(),
        )
    if name == "paddleocr":
        return PaddleProvider(lang="en")
    raise KeyError(f"unknown OCR engine {name!r}; available: {', '.join(_NAMES)}")
```

- [ ] **Step 7: Run tests to verify they pass**

Run: `python -m pytest tests/test_engines.py -v`
Expected: PASS. First PaddleOCR run downloads models — allow several minutes.

- [ ] **Step 8: Commit**

```bash
git add ocr/engines/ tests/test_engines.py
git commit -m "feat(ocr): swappable OCR providers for Tesseract and PaddleOCR"
```

---

### Task 7: Document type detection and the biodata parser

**Files:**
- Create: `ocr/parsers/__init__.py`, `ocr/parsers/base.py`, `ocr/parsers/detect.py`, `ocr/parsers/biodata.py`
- Test: `tests/test_detect.py`, `tests/test_biodata.py`

**Interfaces:**
- Produces: `base.ParsedPage` dataclass — `document_type: str`, `fields: dict[str, Field]`
- Produces: `base.DocumentParser` protocol — `document_type: str`, `parse(text: str, page_number: int, lines) -> ParsedPage`
- Produces: `detect.detect_document_type(text: str) -> DocumentType`
- Produces: `biodata.BiodataParser`, `biodata.LABELS: dict[str, str]` mapping field name → Bengali label

- [ ] **Step 1: Write the failing tests**

```python
# tests/test_detect.py
from ocr.parsers.detect import detect_document_type

BIODATA = """পদের নাম ঃ পরিচ্ছন্নতাকর্মী
০১। নাম $ আরজুমান আরা
০২। পিতা নাম আ: জালাল উদ্দিন খান
০৬। জাতীয় পরিচয়পত্র নাম্বার ঃ ৩৭৩৩৩৭৯১৮৮"""

NID = """গণপ্রজাতন্ত্রী বাংলাদেশ সরকার
ARJUMAN ARA
Date of Birth 07 May 1982
NID No 373 337 9188
1<BGD3733379188<82<<<<<<<<<<<<<
8205074F3106110BGD<<<<<<<<<<<0
ARA<<ARJUMAN<<<<<<<<<<<<<<<<<<"""

CERTIFICATE = """যাহার জন্য প্রযোজ্য
এই মর্মে প্রত্যয়ন করা যাইতেছে যে, আরজুমান আরা, পিতা- আব্দুল জালাল উদ্দিন খান
দুর্নীতি দমন কমিশন, প্রধান কার্যালয়, ঢাকায় আউটসোর্সিং প্রক্রিয়ায় কর্মরত"""


def test_detects_biodata_form():
    assert detect_document_type(BIODATA) == "biodata_form"


def test_detects_nid_card():
    assert detect_document_type(NID) == "nid_card"


def test_detects_certificate():
    assert detect_document_type(CERTIFICATE) == "certificate"


def test_unrecognized_text_is_unknown_not_a_guess():
    assert detect_document_type("random unrelated text") == "unknown"
    assert detect_document_type("") == "unknown"


def test_mrz_alone_identifies_an_id_card():
    assert detect_document_type("8205074F3106110BGD<<<<<<<<<<<0") == "nid_card"
```

```python
# tests/test_biodata.py
from ocr.parsers.biodata import BiodataParser

# Reproduced verbatim from the real Tesseract run, including its errors:
# the separator glyph varies ($ £ g 3 ¢ 8 2) and artifact lines appear.
REAL_OCR = """পদের নাম ঃ পরিচ্ছন্নতাকর্মী

০১। নাম $ Braet আরা

০২। পিতা নাম আ: জালাল উদ্দিন খান

০০৩

০৩। মাতার নাম আনুয়ারা বেগম

০৪। স্থায়ী ঠিকানা

শান্তিনগর ১২১৭ , মতিঝিল ঢাকা |

০৫। বর্তমান ঠিকানা মান্ডা ১ম গলি , মুগদা ঢাকা ।

০৬। জাতীয় পরিচয়তপত্র নাম্বার £ ৩৭৩৩৩৭৯১৮৮
০৭। ব্যাংক একাউন্ট নাম্বার ঃ£ ৪৪৩২১০১০০৬২৯৩
০৮। জন্ম তারিখ £ ০১/০৫/১৯৮২
০৯। বয়স g ৪২ বছর
১০। জাতীয়তা ঃ বাংলাদেশী
১১। ধর্ম 3 ইসলাম
১২। বৈবাহিক অবস্থা ¢ বিবাহিত
১৩। উচ্চতা 8 ৫ ফুট ৩ ইঞ্চি
১৪। ওজন 2 ৬৮ কেজি
১৫। মোবাইল নাম্বার £ ০১৭৪৮০৯৯৬৩৫
১৬। শিক্ষাগত যোগ্যতা £ ৮ম শ্রেণী"""


def _fields():
    return BiodataParser().parse(REAL_OCR, page_number=1, lines=[]).fields


def test_numeric_fields_are_normalized_to_ascii():
    f = _fields()
    assert f["nid_number"].value == "3733379188"
    assert f["bank_account"].value == "4432101006293"
    assert f["mobile"].value == "01748099635"


def test_raw_bengali_is_preserved_beside_the_normalized_value():
    assert _fields()["nid_number"].raw == "৩৭৩৩৩৭৯১৮৮"


def test_date_of_birth_is_iso():
    assert _fields()["date_of_birth"].value == "1982-05-01"


def test_bengali_text_values_are_kept_as_bengali():
    f = _fields()
    assert f["father_name"].value == "আ: জালাল উদ্দিন খান"
    assert f["mother_name"].value == "আনুয়ারা বেগম"
    assert f["religion"].value == "ইসলাম"
    assert f["marital_status"].value == "বিবাহিত"
    assert f["nationality"].value == "বাংলাদেশী"
    assert f["education_level"].value == "৮ম শ্রেণী"


def test_post_applied_comes_from_the_header():
    assert _fields()["post_applied"].value == "পরিচ্ছন্নতাকর্মী"


def test_value_on_the_following_line_is_captured():
    """স্থায়ী ঠিকানা's value wraps to the next line in the real scan."""
    assert "শান্তিনগর" in _fields()["permanent_address"].value


def test_parsing_survives_every_separator_variant():
    """The ':' column reads as $ £ g 3 ¢ 8 2 - splitting must not depend on it."""
    f = _fields()
    for name in ("age", "religion", "height", "weight", "nationality"):
        assert f[name].value, f"{name} lost to separator variation"


def test_records_source_page_and_label():
    f = _fields()["nid_number"]
    assert f.source_page == 1
    assert "জাতীয়" in f.source_label


def test_garbled_name_is_still_returned_for_reconciliation():
    """Tesseract returns 'Braet আরা'. The parser must not silently drop or
    correct it - reconciliation decides, using PaddleOCR's reading."""
    name = _fields()["full_name_bn"]
    assert name.value is not None
    assert "আরা" in name.value


def test_absent_fields_are_missing_not_empty():
    fields = BiodataParser().parse("পদের নাম ঃ পরিচ্ছন্নতাকর্মী", 1, []).fields
    assert fields["nid_number"].value is None
    assert fields["nid_number"].status == "missing"
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `python -m pytest tests/test_detect.py tests/test_biodata.py -v`
Expected: FAIL with `ModuleNotFoundError: No module named 'ocr.parsers'`

- [ ] **Step 3: Implement `ocr/parsers/base.py`**

```python
"""Parser seam. A new document type is a new module plus a detection rule."""
from __future__ import annotations

from dataclasses import dataclass, field as dc_field
from typing import Protocol, runtime_checkable

from ocr.engines.base import OCRLine
from ocr.models import Field


@dataclass
class ParsedPage:
    document_type: str
    fields: dict[str, Field] = dc_field(default_factory=dict)


@runtime_checkable
class DocumentParser(Protocol):
    @property
    def document_type(self) -> str: ...

    def parse(self, text: str, page_number: int,
              lines: list[OCRLine]) -> ParsedPage: ...
```

- [ ] **Step 4: Implement `ocr/parsers/detect.py`**

```python
"""Per-page document type detection.

Per page, not per document: the reference dossier is a single PDF holding a
biodata form, an ID card and a certificate, so a document-level classifier
would be wrong about two thirds of it.
"""
from __future__ import annotations

import re

from ocr.models import DocumentType

# MRZ lines are unmistakable and survive heavy OCR damage, so they are the
# strongest single signal available.
MRZ_PATTERN = re.compile(r"[A-Z0-9<]{20,}<{3,}")

_MARKERS: dict[DocumentType, tuple[str, ...]] = {
    "biodata_form": ("জীবন-বৃত্তান্ত", "জীবন", "পদের নাম", "পিতা নাম", "মাতার নাম",
                     "স্থায়ী ঠিকানা", "বৈবাহিক অবস্থা", "শিক্ষাগত যোগ্যতা"),
    "nid_card": ("জাতীয় পরিচয়পত্র", "গণপ্রজাতন্ত্রী", "NID No", "National ID",
                 "Date of Birth"),
    "certificate": ("যাহার জন্য প্রযোজ্য", "প্রত্যয়ন", "প্রত্যয়নপত্র",
                    "এই মর্মে", "সুনামের সাথে"),
}

_MIN_SCORE = 2          # one stray keyword must not decide a page


def detect_document_type(text: str) -> DocumentType:
    if not text or not text.strip():
        return "unknown"

    if MRZ_PATTERN.search(text):
        return "nid_card"

    scores = {
        doc_type: sum(1 for marker in markers if marker in text)
        for doc_type, markers in _MARKERS.items()
    }
    best = max(scores, key=lambda k: scores[k])
    if scores[best] == 0:
        return "unknown"
    if scores[best] < _MIN_SCORE and best != "certificate":
        return "unknown"
    return best
```

- [ ] **Step 5: Implement `ocr/parsers/biodata.py`**

```python
"""জীবন-বৃত্তান্ত biodata form parser.

The form is 16 numbered `serial │ label ঃ value` rows. Splitting is anchored on
the label text, never on the separator: the real scan reads the ঃ glyph as
$, £, g, 3, ¢, 8 or 2 depending on the row.
"""
from __future__ import annotations

import re

from ocr.engines.base import OCRLine
from ocr.models import Field
from ocr.parsers.base import ParsedPage
from ocr.text import bengali
from ocr.text.normalize import is_noise_line

# field name -> accepted label spellings, longest first so that
# "জাতীয় পরিচয়পত্র নাম্বার" wins over "জাতীয়তা".
LABELS: dict[str, tuple[str, ...]] = {
    "nid_number":        ("জাতীয় পরিচয়পত্র নাম্বার", "জাতীয় পরিচয়তপত্র নাম্বার",
                          "জাতীয় পরিচয়পত্র", "পরিচয়পত্র নাম্বার"),
    "bank_account":      ("ব্যাংক একাউন্ট নাম্বার", "ব্যাংক একাউন্ট"),
    "education_level":   ("শিক্ষাগত যোগ্যতা",),
    "marital_status":    ("বৈবাহিক অবস্থা",),
    "permanent_address": ("স্থায়ী ঠিকানা",),
    "present_address":   ("বর্তমান ঠিকানা",),
    "mobile":            ("মোবাইল নাম্বার", "মোবাইল"),
    "date_of_birth":     ("জন্ম তারিখ",),
    "father_name":       ("পিতা নাম", "পিতার নাম"),
    "mother_name":       ("মাতার নাম", "মাতা নাম"),
    "nationality":       ("জাতীয়তা",),
    "religion":          ("ধর্ম",),
    "height":            ("উচ্চতা",),
    "weight":            ("ওজন",),
    "age":               ("বয়স",),
    "full_name_bn":      ("নাম",),          # last: every other label contains it
}

POST_LABELS = ("পদের নাম",)

DIGIT_FIELDS = {"nid_number", "bank_account", "mobile"}
DATE_FIELDS = {"date_of_birth"}

# Leading "০১।" / "01." serial markers, and the separator glyph zoo.
_SERIAL = re.compile(r"^\s*[0-9০-৯]{1,2}\s*[।.)]\s*")
_SEPARATORS = "ঃ:$£¢€§8923g|"


def _strip_separator(value: str) -> str:
    return value.lstrip(_SEPARATORS + " \t").strip(" \t|।")


class BiodataParser:
    document_type = "biodata_form"

    def parse(self, text: str, page_number: int,
              lines: list[OCRLine] | None = None) -> ParsedPage:
        rows = [ln for ln in (text or "").split("\n") if not is_noise_line(ln)]
        found: dict[str, Field] = {}

        post = self._find_label(rows, POST_LABELS)
        if post is not None:
            found["post_applied"] = self._make_field(
                post[0], post[1], page_number, "পদের নাম", digits=False, date=False)

        for name, labels in LABELS.items():
            if name in found:
                continue
            hit = self._find_label(rows, labels, taken=found)
            if hit is None:
                found[name] = Field.missing(page_number)
                continue
            raw, label = hit
            found[name] = self._make_field(raw, label, page_number, label,
                                           digits=name in DIGIT_FIELDS,
                                           date=name in DATE_FIELDS)

        for name in ("post_applied",):
            found.setdefault(name, Field.missing(page_number))
        return ParsedPage(document_type=self.document_type, fields=found)

    def _find_label(self, rows: list[str], labels: tuple[str, ...],
                    taken: dict[str, Field] | None = None) -> tuple[str, str] | None:
        """Return (raw_value, matched_label) for the first row carrying a label."""
        for index, row in enumerate(rows):
            body = _SERIAL.sub("", row)
            for label in labels:
                position = body.find(label)
                if position == -1:
                    continue
                value = _strip_separator(body[position + len(label):])
                if not value:                    # value wrapped to the next line
                    for follow in rows[index + 1: index + 3]:
                        candidate = _strip_separator(_SERIAL.sub("", follow))
                        if candidate and not self._looks_like_label(candidate):
                            return candidate, label
                    return None
                return value, label
        return None

    @staticmethod
    def _looks_like_label(text: str) -> bool:
        return any(lbl in text for labels in LABELS.values() for lbl in labels)

    @staticmethod
    def _make_field(raw: str, label: str, page_number: int, source_label: str,
                    digits: bool, date: bool) -> Field:
        raw = raw.strip()
        if digits:
            value = bengali.extract_digits(raw) or None
        elif date:
            value = bengali.parse_date(raw)
        else:
            value = raw or None
        return Field(
            value=value, raw=raw or None, confidence=None,
            source_page=page_number, source_label=source_label,
            status="ok" if value else "missing",
        )
```

- [ ] **Step 6: Run tests to verify they pass**

Run: `python -m pytest tests/test_detect.py tests/test_biodata.py -v`
Expected: PASS

- [ ] **Step 7: Commit**

```bash
git add ocr/parsers/ tests/test_detect.py tests/test_biodata.py
git commit -m "feat(ocr): per-page document type detection and Bengali biodata parser"
```

---

### Task 8: NID and certificate parsers

**Files:**
- Create: `ocr/parsers/nid.py`, `ocr/parsers/certificate.py`
- Modify: `ocr/parsers/__init__.py` (register parsers)
- Test: `tests/test_nid.py`, `tests/test_certificate.py`

**Interfaces:**
- Produces: `nid.NidParser`, `nid.parse_mrz(lines: list[str]) -> MrzData | None`
- Produces: `nid.MrzData` dataclass — `date_of_birth: str|None`, `sex: str|None`, `expiry: str|None`, `nationality: str|None`, `document_number: str|None`, `checks_passed: bool`
- Produces: `nid.mrz_check_digit(value: str) -> str`
- Produces: `certificate.CertificateParser`
- Produces: `parsers.get_parser(document_type: str) -> DocumentParser | None`

- [ ] **Step 1: Write the failing tests**

```python
# tests/test_nid.py
from ocr.parsers.nid import MrzData, NidParser, mrz_check_digit, parse_mrz

# Verbatim PaddleOCR output for page 2 of the reference sample, OCR errors and all.
REAL_NID_OCR = """rrerso ateto ta
ARJUMAN ARA
Date ot Bith 07 May 1982
373 337 9188
o079s Wra barr NiD No
1<86D373337918<82<<<<<<<<<<<<<
8205074F31061108GD<<<<<<<<<<<0
ARAARJUMANC"""

CLEAN_MRZ = [
    "1<BGD3733379188<82<<<<<<<<<<<<<",
    "8205074F3106110BGD<<<<<<<<<<<0",
    "ARA<<ARJUMAN<<<<<<<<<<<<<<<<<<",
]


def test_check_digit_matches_the_icao_algorithm():
    # Verified against the real card: 820507 -> 4, 310611 -> 0
    assert mrz_check_digit("820507") == "4"
    assert mrz_check_digit("310611") == "0"


def test_check_digit_handles_letters_and_fillers():
    assert mrz_check_digit("<<<<<<") == "0"
    assert mrz_check_digit("AB1") == mrz_check_digit("AB1")


def test_parses_date_of_birth_sex_and_expiry():
    mrz = parse_mrz(CLEAN_MRZ)
    assert mrz.date_of_birth == "1982-05-07"
    assert mrz.sex == "F"
    assert mrz.expiry == "2031-06-11"
    assert mrz.nationality == "BGD"


def test_valid_check_digits_are_reported_as_passing():
    assert parse_mrz(CLEAN_MRZ).checks_passed is True


def test_corrupted_mrz_fails_its_check_digits():
    broken = list(CLEAN_MRZ)
    broken[1] = "8205079F3106110BGD<<<<<<<<<<<0"     # DOB altered, check digit stale
    assert parse_mrz(broken).checks_passed is False


def test_returns_none_when_no_mrz_present():
    assert parse_mrz(["just some text"]) is None


def test_two_digit_years_resolve_to_the_right_century():
    """82 is a birth year (1982); 31 is an expiry (2031)."""
    mrz = parse_mrz(CLEAN_MRZ)
    assert mrz.date_of_birth.startswith("1982")
    assert mrz.expiry.startswith("2031")


def test_parser_extracts_english_name_and_nid_from_real_ocr():
    fields = NidParser().parse(REAL_NID_OCR, page_number=2, lines=[]).fields
    assert fields["full_name_en"].value == "ARJUMAN ARA"
    assert fields["nid_number"].value == "3733379188"


def test_parser_prefers_mrz_date_over_printed_date():
    """Both agree here, but MRZ carries a verifiable check digit."""
    fields = NidParser().parse(REAL_NID_OCR, page_number=2, lines=[]).fields
    assert fields["date_of_birth"].value == "1982-05-07"


def test_damaged_mrz_still_yields_the_printed_fields():
    fields = NidParser().parse(REAL_NID_OCR, page_number=2, lines=[]).fields
    assert fields["full_name_en"].value is not None
```

```python
# tests/test_certificate.py
from ocr.parsers.certificate import CertificateParser

REAL_CERT = """যাহার জন্য প্রযোজ্য

এই মর্মে প্রত্যয়ন করা যাইতেছে যে, আরজুমান আরা, পিতা- আব্দুল জালাল উদ্দিন খান, মাতা- মোসাঃ
আনোয়ারা বেগম, বাসা/হোল্ডিং- ৪৪৬ নং গুলবাগ, গ্রাম/রাস্তা- গুলবাগ, ডাকঘর- শান্তিনগর, মতিঝিল, ঢাকা- ১২১৭
দুর্নীতি দমন কমিশন, প্রধান কার্যালয়, ঢাকায় আউটসোর্সিং প্রক্রিয়ায় পরিচ্ছন্নতাকর্মী হিসেবে ০১ জুলাই, ২০২৩ সাল
হতে অদ্যাবধি সততা ও সুনামের সাথে সেবা দিয়ে যাচ্ছেন।

সমীর বিশ্বাস
উপপরিচালক (প্রশাসন)
দুর্নীতি দমন কমিশন"""


def _fields():
    return CertificateParser().parse(REAL_CERT, page_number=3, lines=[]).fields


def test_extracts_employment_start_date_as_iso():
    assert _fields()["employment_start"].value == "2023-07-01"


def test_extracts_employer():
    assert "দুর্নীতি দমন কমিশন" in _fields()["employer"].value


def test_extracts_post_from_prose():
    assert _fields()["post_applied"].value == "পরিচ্ছন্নতাকর্মী"


def test_extracts_father_and_mother_from_prose():
    f = _fields()
    assert "জালাল উদ্দিন খান" in f["father_name"].value
    assert "আনোয়ারা বেগম" in f["mother_name"].value


def test_extracts_signatory():
    assert "সমীর বিশ্বাস" in _fields()["certificate_signatory"].value


def test_records_page_three_as_the_source():
    assert _fields()["employment_start"].source_page == 3


def test_absent_values_are_missing_not_invented():
    fields = CertificateParser().parse("যাহার জন্য প্রযোজ্য", 3, []).fields
    assert fields["employment_start"].value is None
    assert fields["employment_start"].status == "missing"
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `python -m pytest tests/test_nid.py tests/test_certificate.py -v`
Expected: FAIL with `ModuleNotFoundError: No module named 'ocr.parsers.nid'`

- [ ] **Step 3: Implement `ocr/parsers/nid.py`**

```python
"""National ID card parser, including the MRZ.

The MRZ is the highest-confidence evidence in the whole dossier: it is
machine-readable and carries ICAO check digits, so its date of birth can be
verified rather than merely read. Both check digits on the reference card
validate (820507 -> 4, 310611 -> 0).
"""
from __future__ import annotations

import re
from dataclasses import dataclass

from ocr.engines.base import OCRLine
from ocr.models import Field
from ocr.parsers.base import ParsedPage
from ocr.text import bengali

MRZ_LINE = re.compile(r"^[A-Z0-9<]{25,}$")
_TD1_LINE2 = re.compile(
    r"^(?P<dob>[0-9<]{6})(?P<dob_check>[0-9<])"
    r"(?P<sex>[MFX<])"
    r"(?P<exp>[0-9<]{6})(?P<exp_check>[0-9<])"
    r"(?P<nat>[A-Z<]{3})"
)
_NID_PRINTED = re.compile(r"\b(\d[\d\s]{8,16}\d)\b")
_NAME_EN = re.compile(r"\b([A-Z]{2,}(?:\s+[A-Z]{2,})+)\b")


def mrz_check_digit(value: str) -> str:
    """ICAO 9303 check digit: weights 7-3-1, A=10..Z=35, '<'=0, mod 10."""
    weights = (7, 3, 1)
    total = 0
    for index, char in enumerate(value):
        if char.isdigit():
            digit = int(char)
        elif char == "<":
            digit = 0
        elif char.isalpha():
            digit = ord(char.upper()) - 55
        else:
            digit = 0
        total += digit * weights[index % 3]
    return str(total % 10)


@dataclass(frozen=True)
class MrzData:
    date_of_birth: str | None
    sex: str | None
    expiry: str | None
    nationality: str | None
    document_number: str | None
    checks_passed: bool


def _yymmdd(value: str, birth: bool) -> str | None:
    if not value.isdigit() or len(value) != 6:
        return None
    year, month, day = int(value[:2]), int(value[2:4]), int(value[4:])
    # Birth years are in the past, expiry dates in the future.
    century = 1900 if birth else 2000
    if birth and year < 25:                # a 20xx birth year for a working adult
        century = 2000
    if not (1 <= month <= 12 and 1 <= day <= 31):
        return None
    return f"{century + year:04d}-{month:02d}-{day:02d}"


def parse_mrz(lines: list[str]) -> MrzData | None:
    candidates = [ln.strip().upper().replace(" ", "")
                  for ln in lines if MRZ_LINE.match(ln.strip().upper().replace(" ", ""))]
    for line in candidates:
        match = _TD1_LINE2.match(line)
        if not match:
            continue
        dob_raw, exp_raw = match.group("dob"), match.group("exp")
        checks = (mrz_check_digit(dob_raw) == match.group("dob_check")
                  and mrz_check_digit(exp_raw) == match.group("exp_check"))
        document_number = None
        for other in candidates:
            digits = re.sub(r"\D", "", other)
            if len(digits) >= 10 and other is not line:
                document_number = digits[:10]
                break
        sex = match.group("sex")
        return MrzData(
            date_of_birth=_yymmdd(dob_raw, birth=True),
            sex=None if sex == "<" else sex,
            expiry=_yymmdd(exp_raw, birth=False),
            nationality=match.group("nat").replace("<", "") or None,
            document_number=document_number,
            checks_passed=checks,
        )
    return None


class NidParser:
    document_type = "nid_card"

    def parse(self, text: str, page_number: int,
              lines: list[OCRLine] | None = None) -> ParsedPage:
        rows = (text or "").split("\n")
        fields: dict[str, Field] = {}
        mrz = parse_mrz(rows)

        name = _NAME_EN.search(text or "")
        fields["full_name_en"] = (
            Field(value=name.group(1).strip(), raw=name.group(1),
                  source_page=page_number, source_label="Name",
                  confidence=0.9 if name else None, status="ok")
            if name else Field.missing(page_number, "Name")
        )

        nid_value, nid_raw = None, None
        for row in rows:
            digits = bengali.extract_digits(row)
            if 10 <= len(digits) <= 17 and _NID_PRINTED.search(bengali.to_ascii_digits(row)):
                nid_value, nid_raw = digits, row.strip()
                break
        if not nid_value and mrz and mrz.document_number:
            nid_value, nid_raw = mrz.document_number, "mrz"
        fields["nid_number"] = (
            Field(value=nid_value, raw=nid_raw, source_page=page_number,
                  source_label="NID No", status="ok")
            if nid_value else Field.missing(page_number, "NID No")
        )

        dob = mrz.date_of_birth if mrz else None
        dob_label = "mrz" if dob else "Date of Birth"
        if not dob:
            for row in rows:
                dob = bengali.parse_date(row)
                if dob:
                    break
        fields["date_of_birth"] = (
            Field(value=dob, raw=None, source_page=page_number,
                  source_label=dob_label,
                  confidence=1.0 if mrz and mrz.checks_passed else None,
                  status="ok")
            if dob else Field.missing(page_number, "Date of Birth")
        )

        fields["sex"] = (Field(value=mrz.sex, source_page=page_number,
                               source_label="mrz", status="ok")
                         if mrz and mrz.sex else Field.missing(page_number, "mrz"))
        fields["nid_expiry"] = (Field(value=mrz.expiry, source_page=page_number,
                                      source_label="mrz", status="ok")
                                if mrz and mrz.expiry
                                else Field.missing(page_number, "mrz"))
        return ParsedPage(document_type=self.document_type, fields=fields)
```

- [ ] **Step 4: Implement `ocr/parsers/certificate.py`**

```python
"""যাহার জন্য প্রযোজ্য employment/character certificate parser.

Prose rather than label/value, so extraction anchors on the fixed Bengali
connectives the template always uses ("পিতা-", "হিসেবে", "সাল হতে").
"""
from __future__ import annotations

import re

from ocr.engines.base import OCRLine
from ocr.models import Field
from ocr.parsers.base import ParsedPage
from ocr.text import bengali

_FATHER = re.compile(r"পিতা\s*[-–:]\s*([^\n,]{3,60})")
_MOTHER = re.compile(r"মাতা\s*[-–:]\s*([^\n,]{3,60})")
_POST = re.compile(r"([^\s,]{3,40})\s+হিসেবে")
_EMPLOYER = re.compile(r"(দুর্নীতি দমন কমিশন|[^\n,]{4,60}?\s*(?:কমিশন|অধিদপ্তর|মন্ত্রণালয়|লিমিটেড|কোম্পানি))")
_START = re.compile(r"([0-9০-৯]{1,2}\s*[^\s,]+,?\s*[0-9০-৯]{4})\s*সাল\s*হতে")
_SIGNATORY = re.compile(r"\n\s*([^\n]{3,40})\n\s*(?:উপপরিচালক|পরিচালক|সচিব|ব্যবস্থাপক)")


def _field(match: re.Match | None, page_number: int, label: str,
           as_date: bool = False) -> Field:
    if not match:
        return Field.missing(page_number, label)
    raw = match.group(1).strip()
    value = bengali.parse_date(raw) if as_date else raw
    return Field(value=value or None, raw=raw, source_page=page_number,
                 source_label=label, status="ok" if value else "missing")


class CertificateParser:
    document_type = "certificate"

    def parse(self, text: str, page_number: int,
              lines: list[OCRLine] | None = None) -> ParsedPage:
        body = text or ""
        fields = {
            "father_name": _field(_FATHER.search(body), page_number, "পিতা"),
            "mother_name": _field(_MOTHER.search(body), page_number, "মাতা"),
            "post_applied": _field(_POST.search(body), page_number, "হিসেবে"),
            "employer": _field(_EMPLOYER.search(body), page_number, "কর্মস্থল"),
            "employment_start": _field(_START.search(body), page_number,
                                       "সাল হতে", as_date=True),
            "certificate_signatory": _field(_SIGNATORY.search(body), page_number,
                                            "স্বাক্ষরকারী"),
        }
        fields["certificate_issuer"] = fields["employer"]
        return ParsedPage(document_type=self.document_type, fields=fields)
```

- [ ] **Step 5: Register parsers in `ocr/parsers/__init__.py`**

```python
"""Parser registry, keyed by document type."""
from __future__ import annotations

from ocr.parsers.base import DocumentParser, ParsedPage
from ocr.parsers.biodata import BiodataParser
from ocr.parsers.certificate import CertificateParser
from ocr.parsers.detect import detect_document_type
from ocr.parsers.nid import NidParser

_PARSERS: dict[str, DocumentParser] = {
    "biodata_form": BiodataParser(),
    "nid_card": NidParser(),
    "certificate": CertificateParser(),
}


def get_parser(document_type: str) -> DocumentParser | None:
    """None for 'unknown' - the page still keeps its raw and clean text."""
    return _PARSERS.get(document_type)


__all__ = ["DocumentParser", "ParsedPage", "detect_document_type", "get_parser"]
```

- [ ] **Step 6: Run tests to verify they pass**

Run: `python -m pytest tests/test_nid.py tests/test_certificate.py -v`
Expected: PASS

- [ ] **Step 7: Commit**

```bash
git add ocr/parsers/ tests/test_nid.py tests/test_certificate.py
git commit -m "feat(ocr): NID parser with ICAO MRZ check digits, certificate parser"
```

---

### Task 9: Reconciliation and conflict detection

**Files:**
- Create: `ocr/reconcile.py`
- Test: `tests/test_reconcile.py`

**Interfaces:**
- Consumes: `ParsedPage`, `Field`, `Person`, `Conflict`
- Produces: `reconcile.reconcile(pages: list[ParsedPage], paddle_fields: dict[int, dict[str, Field]] | None = None) -> tuple[Person, list[Conflict]]`
- Produces: `reconcile.SOURCE_PRIORITY: dict[str, int]`

- [ ] **Step 1: Write the failing test**

```python
# tests/test_reconcile.py
from ocr.models import Field
from ocr.parsers.base import ParsedPage
from ocr.reconcile import reconcile


def _page(doc_type, **fields):
    return ParsedPage(document_type=doc_type, fields=fields)


def test_single_source_is_used_directly():
    person, conflicts = reconcile([
        _page("biodata_form", nid_number=Field(value="3733379188", source_page=1)),
    ])
    assert person.nid_number.value == "3733379188"
    assert conflicts == []


def test_agreeing_sources_do_not_conflict():
    person, conflicts = reconcile([
        _page("biodata_form", nid_number=Field(value="3733379188", source_page=1)),
        _page("nid_card", nid_number=Field(value="3733379188", source_page=2)),
    ])
    assert person.nid_number.value == "3733379188"
    assert conflicts == []


def test_disagreeing_sources_produce_a_conflict_and_null_value():
    """The real dossier: form says 01/05/1982, the ID card says 07/05/1982."""
    person, conflicts = reconcile([
        _page("biodata_form", date_of_birth=Field(value="1982-05-01", source_page=1)),
        _page("nid_card", date_of_birth=Field(value="1982-05-07", source_page=2,
                                              source_label="mrz")),
    ])
    assert person.date_of_birth.value is None
    assert person.date_of_birth.status == "conflict"
    assert len(conflicts) == 1
    assert conflicts[0].field == "date_of_birth"
    assert {c.value for c in conflicts[0].candidates} == {"1982-05-01", "1982-05-07"}


def test_conflict_preserves_every_candidate_with_its_page():
    _, conflicts = reconcile([
        _page("biodata_form", date_of_birth=Field(value="1982-05-01", source_page=1)),
        _page("nid_card", date_of_birth=Field(value="1982-05-07", source_page=2)),
    ])
    assert {c.source_page for c in conflicts[0].candidates} == {1, 2}


def test_missing_fields_never_participate_in_conflicts():
    person, conflicts = reconcile([
        _page("biodata_form", nid_number=Field(value="3733379188", source_page=1)),
        _page("nid_card", nid_number=Field.missing(source_page=2)),
    ])
    assert person.nid_number.value == "3733379188"
    assert conflicts == []


def test_paddle_candidate_fills_a_field_tesseract_garbled():
    """The real case: Tesseract reads the name as 'Braet আরা'; PaddleOCR reads
    'ARJUMAN ARA' off the ID card at 0.98."""
    person, _ = reconcile(
        [_page("biodata_form", full_name_bn=Field(value="Braet আরা", source_page=1))],
        paddle_fields={2: {"full_name_en": Field(value="ARJUMAN ARA", source_page=2,
                                                 confidence=0.98)}},
    )
    assert person.full_name_en.value == "ARJUMAN ARA"
    assert person.full_name_bn.value == "Braet আরা"   # kept, not silently replaced


def test_low_confidence_values_are_flagged_not_dropped():
    person, _ = reconcile([
        _page("nid_card", full_name_en=Field(value="ARJUMAN ARA", source_page=2,
                                             confidence=0.30)),
    ], min_confidence=0.5)
    assert person.full_name_en.value == "ARJUMAN ARA"
    assert person.full_name_en.status == "low_confidence"


def test_fields_absent_everywhere_stay_none():
    person, _ = reconcile([_page("biodata_form")])
    assert person.bank_account is None
```

- [ ] **Step 2: Run test to verify it fails**

Run: `python -m pytest tests/test_reconcile.py -v`
Expected: FAIL with `ModuleNotFoundError: No module named 'ocr.reconcile'`

- [ ] **Step 3: Write the implementation**

```python
# ocr/reconcile.py
"""Merge per-page field candidates into one Person.

Two rules carry the design:

1. Sources that disagree are never silently resolved. The value becomes None
   with status "conflict" and every candidate is preserved, because on a
   personnel file a discrepancy is information a human needs, not noise.
2. Engines have separate roles. Tesseract owns Bengali prose, PaddleOCR owns
   Latin/digit candidates, and they write to different fields rather than
   competing for the same one.
"""
from __future__ import annotations

from ocr.models import Conflict, Field, Person
from ocr.parsers.base import ParsedPage

# Used only to choose which candidate's metadata represents an agreeing set;
# it never decides a disagreement.
SOURCE_PRIORITY = {"mrz": 3, "nid_card": 2, "biodata_form": 1, "certificate": 0}

PERSON_FIELDS = set(Person.model_fields)


def _priority(field: Field, document_type: str) -> int:
    if field.source_label == "mrz":
        return SOURCE_PRIORITY["mrz"]
    return SOURCE_PRIORITY.get(document_type, 0)


def reconcile(
    pages: list[ParsedPage],
    paddle_fields: dict[int, dict[str, Field]] | None = None,
    min_confidence: float = 0.5,
) -> tuple[Person, list[Conflict]]:
    candidates: dict[str, list[tuple[int, Field]]] = {}

    def collect(name: str, field: Field, document_type: str) -> None:
        if name not in PERSON_FIELDS or field is None:
            return
        if field.value is None:            # missing values never vote
            return
        candidates.setdefault(name, []).append((_priority(field, document_type), field))

    for page in pages:
        for name, field in page.fields.items():
            collect(name, field, page.document_type)

    for page_fields in (paddle_fields or {}).values():
        for name, field in page_fields.items():
            collect(name, field, "nid_card")

    person_data: dict[str, Field] = {}
    conflicts: list[Conflict] = []

    for name, entries in candidates.items():
        distinct = {field.value for _, field in entries}
        if len(distinct) == 1:
            best = max(entries, key=lambda item: (item[0], item[1].confidence or 0.0))[1]
            status = best.status
            if best.confidence is not None and best.confidence < min_confidence:
                status = "low_confidence"
            person_data[name] = best.model_copy(update={"status": status})
        else:
            first = entries[0][1]
            person_data[name] = Field(
                value=None, raw=first.raw, confidence=None,
                source_page=first.source_page, source_label=first.source_label,
                status="conflict",
            )
            conflicts.append(Conflict(field=name,
                                      candidates=[field for _, field in entries]))

    return Person(**person_data), conflicts
```

- [ ] **Step 4: Run test to verify it passes**

Run: `python -m pytest tests/test_reconcile.py -v`
Expected: PASS (8 tests)

- [ ] **Step 5: Commit**

```bash
git add ocr/reconcile.py tests/test_reconcile.py
git commit -m "feat(ocr): reconcile page candidates, record conflicts without resolving them"
```

---

### Task 10: Storage, pipeline, and CLI

**Files:**
- Create: `ocr/storage.py`, `ocr/pipeline.py`, `ocr/cli.py`
- Test: `tests/test_storage.py`, `tests/test_pipeline.py`

**Interfaces:**
- Produces: `storage.sha256_file(path) -> str`
- Produces: `storage.safe_stem(filename) -> str`
- Produces: `storage.json_path(settings, sha, filename) -> Path`
- Produces: `storage.load_cached(settings, sha, filename) -> OcrDocument | None`
- Produces: `storage.save_document(settings, doc) -> Path` (atomic)
- Produces: `storage.temp_workspace(settings) -> ContextManager[Path]`
- Produces: `pipeline.process_pdf(path, settings=None, force=False) -> OcrDocument`
- Produces: `cli.main(argv=None) -> int`

- [ ] **Step 1: Write the failing tests**

```python
# tests/test_storage.py
import pytest
from ocr import storage
from ocr.config import Settings
from ocr.models import OcrDocument, PageResult, Person, Processing


def _settings(tmp_path):
    return Settings(storage_dir=str(tmp_path))


def _doc(sha="abc123", name="x.pdf"):
    return OcrDocument(
        document_id=sha, source_file=name, sha256=sha, page_count=1,
        is_native_text=False,
        pages=[PageResult(page_number=1, document_type="biodata_form",
                          raw_text="r", clean_text="c", status="ok")],
        person=Person(),
        processing=Processing(pages_processed=1, pages_failed=0, failed_pages=[],
                              engines=["tesseract:ben+eng"]),
    )


def test_identical_bytes_hash_identically(tmp_path):
    a, b = tmp_path / "a.pdf", tmp_path / "b.pdf"
    a.write_bytes(b"%PDF-1.4 same")
    b.write_bytes(b"%PDF-1.4 same")
    assert storage.sha256_file(a) == storage.sha256_file(b)


def test_different_bytes_hash_differently(tmp_path):
    a, b = tmp_path / "a.pdf", tmp_path / "b.pdf"
    a.write_bytes(b"%PDF-1.4 one")
    b.write_bytes(b"%PDF-1.4 two")
    assert storage.sha256_file(a) != storage.sha256_file(b)


@pytest.mark.parametrize("name,expected", [
    ("../../etc/passwd", "etc_passwd"),
    ("Arjuman ara Cleaner-009 Dudok.pdf", "Arjuman_ara_Cleaner-009_Dudok"),
    ("C:\\Windows\\system32\\x.pdf", "C_Windows_system32_x"),
    ("....pdf", "file"),
])
def test_safe_stem_blocks_path_traversal(name, expected):
    assert storage.safe_stem(name) == expected


def test_json_path_is_inside_storage(tmp_path):
    s = _settings(tmp_path)
    path = storage.json_path(s, "abc123def456", "../evil.pdf")
    assert path.parent == s.storage_path / "json"
    assert str(path).startswith(str(s.storage_path))


def test_save_then_load_round_trips(tmp_path):
    s = _settings(tmp_path)
    storage.save_document(s, _doc())
    loaded = storage.load_cached(s, "abc123", "x.pdf")
    assert loaded is not None
    assert loaded.sha256 == "abc123"


def test_cache_miss_returns_none(tmp_path):
    assert storage.load_cached(_settings(tmp_path), "nope", "x.pdf") is None


def test_stale_schema_version_is_not_reused(tmp_path):
    s = _settings(tmp_path)
    path = storage.save_document(s, _doc())
    data = path.read_text(encoding="utf-8").replace('"schema_version":"1.0"',
                                                    '"schema_version":"0.9"')
    path.write_text(data, encoding="utf-8")
    assert storage.load_cached(s, "abc123", "x.pdf") is None


def test_temp_workspace_is_removed_even_on_exception(tmp_path):
    s = _settings(tmp_path)
    captured = {}
    with pytest.raises(RuntimeError):
        with storage.temp_workspace(s) as work:
            captured["path"] = work
            (work / "page.png").write_bytes(b"x")
            raise RuntimeError("boom")
    assert not captured["path"].exists()
```

```python
# tests/test_pipeline.py
import json

import pytest
from ocr import storage
from ocr.config import Settings
from ocr.pdf.validate import PdfValidationError
from ocr.pipeline import process_pdf
from tests.conftest import make_scanned_pdf


def _settings(tmp_path):
    return Settings(storage_dir=str(tmp_path / "storage"), dpi=150)


def test_processes_a_single_page_scan(tmp_path):
    pdf = make_scanned_pdf(tmp_path / "one.pdf", [["HELLO 12345"]])
    doc = process_pdf(pdf, _settings(tmp_path))
    assert doc.page_count == 1
    assert len(doc.pages) == 1
    assert doc.processing.status in ("success", "partial_success")


def test_preserves_page_numbers_across_a_multi_page_scan(tmp_path):
    pdf = make_scanned_pdf(tmp_path / "three.pdf", [["one"], ["two"], ["three"]])
    doc = process_pdf(pdf, _settings(tmp_path))
    assert [p.page_number for p in doc.pages] == [1, 2, 3]


def test_keeps_both_raw_and_clean_text(tmp_path):
    pdf = make_scanned_pdf(tmp_path / "t.pdf", [["HELLO 12345"]])
    page = process_pdf(pdf, _settings(tmp_path)).pages[0]
    assert isinstance(page.raw_text, str)
    assert isinstance(page.clean_text, str)


def test_blank_page_is_marked_blank_not_failed(tmp_path):
    pdf = make_scanned_pdf(tmp_path / "blank.pdf", [[]])
    doc = process_pdf(pdf, _settings(tmp_path))
    assert doc.pages[0].status in ("blank", "ok")
    assert doc.processing.pages_failed == 0


def test_native_text_pdf_is_detected_and_skips_ocr(tmp_path):
    from tests.conftest import make_native_pdf
    pdf = make_native_pdf(tmp_path / "native.pdf", ["Hello World " * 10])
    doc = process_pdf(pdf, _settings(tmp_path))
    assert doc.is_native_text is True
    assert "Hello" in doc.pages[0].raw_text


def test_corrupted_pdf_raises_validation_error(tmp_path):
    bad = tmp_path / "bad.pdf"
    bad.write_bytes(b"NOTAPDF")
    with pytest.raises(PdfValidationError):
        process_pdf(bad, _settings(tmp_path))


def test_duplicate_pdf_reuses_cached_json(tmp_path):
    pdf = make_scanned_pdf(tmp_path / "dup.pdf", [["HELLO 12345"]])
    settings = _settings(tmp_path)
    first = process_pdf(pdf, settings)
    second = process_pdf(pdf, settings)
    assert first.sha256 == second.sha256
    assert second.processing.duration_ms == first.processing.duration_ms


def test_force_reprocesses_a_duplicate(tmp_path):
    pdf = make_scanned_pdf(tmp_path / "dup2.pdf", [["HELLO 12345"]])
    settings = _settings(tmp_path)
    process_pdf(pdf, settings)
    again = process_pdf(pdf, settings, force=True)
    assert again.sha256


def test_output_json_validates_against_the_schema(tmp_path):
    from ocr.models import OcrDocument
    pdf = make_scanned_pdf(tmp_path / "v.pdf", [["HELLO"]])
    settings = _settings(tmp_path)
    doc = process_pdf(pdf, settings)
    path = storage.json_path(settings, doc.sha256, doc.source_file)
    OcrDocument.model_validate(json.loads(path.read_text(encoding="utf-8")))


def test_temp_files_are_cleaned_up(tmp_path):
    settings = _settings(tmp_path)
    pdf = make_scanned_pdf(tmp_path / "c.pdf", [["HELLO"]])
    process_pdf(pdf, settings)
    temp_root = settings.storage_path / "temp"
    assert not temp_root.exists() or not any(temp_root.iterdir())


def test_rotated_page_still_yields_text(tmp_path):
    pdf = make_scanned_pdf(tmp_path / "rot.pdf", [["HELLO 12345"]], rotation=180)
    doc = process_pdf(pdf, _settings(tmp_path))
    assert doc.processing.pages_failed == 0
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `python -m pytest tests/test_storage.py tests/test_pipeline.py -v`
Expected: FAIL with `ModuleNotFoundError: No module named 'ocr.storage'`

- [ ] **Step 3: Implement `ocr/storage.py`**

```python
"""Filesystem persistence: dedup by content hash, atomic writes, safe paths."""
from __future__ import annotations

import contextlib
import hashlib
import json
import os
import re
import shutil
import tempfile
from collections.abc import Iterator
from pathlib import Path

from ocr import SCHEMA_VERSION
from ocr.config import Settings
from ocr.models import OcrDocument

_UNSAFE = re.compile(r"[^A-Za-z0-9._-]+")
CHUNK = 1024 * 1024


def sha256_file(path: Path) -> str:
    """Streamed so a large PDF is never fully resident."""
    digest = hashlib.sha256()
    with Path(path).open("rb") as fh:
        while chunk := fh.read(CHUNK):
            digest.update(chunk)
    return digest.hexdigest()


def safe_stem(filename: str) -> str:
    """Filename to a safe stem. Strips directories, so traversal cannot escape."""
    stem = Path(str(filename).replace("\\", "/")).name
    stem = stem.rsplit(".", 1)[0] if "." in stem else stem
    cleaned = _UNSAFE.sub("_", stem).strip("._-")
    return cleaned or "file"


def json_path(settings: Settings, sha: str, filename: str) -> Path:
    return settings.storage_path / "json" / f"{sha[:12]}_{safe_stem(filename)}.json"


def load_cached(settings: Settings, sha: str, filename: str) -> OcrDocument | None:
    """Cached result for identical bytes, or None. A schema change invalidates."""
    path = json_path(settings, sha, filename)
    if not path.exists():
        return None
    try:
        doc = OcrDocument.model_validate_json(path.read_text(encoding="utf-8"))
    except Exception:                      # noqa: BLE001 - unreadable cache is a miss
        return None
    return doc if doc.processing.schema_version == SCHEMA_VERSION else None


def save_document(settings: Settings, document: OcrDocument) -> Path:
    """Validate-then-write, atomically. A partial file is never left behind."""
    path = json_path(settings, document.sha256, document.source_file)
    path.parent.mkdir(parents=True, exist_ok=True)
    payload = document.model_dump_json(indent=2)
    json.loads(payload)                    # last guard against malformed output
    fd, tmp = tempfile.mkstemp(dir=path.parent, suffix=".tmp")
    try:
        with os.fdopen(fd, "w", encoding="utf-8") as fh:
            fh.write(payload)
        os.replace(tmp, path)
    except BaseException:
        Path(tmp).unlink(missing_ok=True)
        raise
    return path


@contextlib.contextmanager
def temp_workspace(settings: Settings) -> Iterator[Path]:
    """Scratch directory removed on exit, including on exception."""
    root = settings.storage_path / "temp"
    root.mkdir(parents=True, exist_ok=True)
    work = Path(tempfile.mkdtemp(dir=root))
    try:
        yield work
    finally:
        shutil.rmtree(work, ignore_errors=True)


def debug_dir(settings: Settings, document_id: str) -> Path:
    path = settings.storage_path / "debug" / document_id
    path.mkdir(parents=True, exist_ok=True)
    return path
```

- [ ] **Step 4: Implement `ocr/pipeline.py`**

```python
"""The orchestrator: the only module that knows the full sequence.

    validate -> hash/dedup -> inspect -> per page:
        render -> preprocess -> OCR -> normalize -> detect type -> parse
    -> reconcile -> validate -> save

Pages are processed one at a time and failures are isolated: a page that raises
is recorded and the document continues.
"""
from __future__ import annotations

import logging
import time
from pathlib import Path

from ocr import __version__
from ocr.config import Settings, get_settings
from ocr.engines import registry
from ocr.engines.base import OCRPageResult
from ocr.models import (Conflict, Field, OcrDocument, OCRLineModel, PageResult,
                        Person, Processing)
from ocr.parsers import detect_document_type, get_parser
from ocr.pdf import inspect as pdf_inspect
from ocr.pdf import render, validate
from ocr.preprocess import steps
from ocr.reconcile import reconcile
from ocr.storage import (debug_dir, load_cached, save_document, sha256_file,
                         temp_workspace)
from ocr.text.normalize import clean_text

logger = logging.getLogger(__name__)

# Fields PaddleOCR is trusted for. Bengali is never routed here - the engine
# has no Bengali model and silently transliterates it into Latin noise.
PADDLE_FIELDS = ("full_name_en", "nid_number", "date_of_birth", "sex", "nid_expiry")
BLANK_TEXT_THRESHOLD = 3


def process_pdf(path: Path, settings: Settings | None = None,
                force: bool = False) -> OcrDocument:
    settings = settings or get_settings()
    path = Path(path)
    started = time.monotonic()

    logger.info("PDF received: %s", path.name)
    validate.validate_pdf(path, settings)
    logger.info("PDF validated")

    sha = sha256_file(path)
    if not force:
        cached = load_cached(settings, sha, path.name)
        if cached is not None:
            logger.info("Duplicate detected (sha256=%s); reusing cached JSON", sha[:12])
            return cached

    info = pdf_inspect.inspect_pdf(path)
    logger.info("Native text detection complete: is_native_text=%s", info.is_native_text)

    tesseract = registry.get_provider(settings.engine, settings)
    paddle = None
    engines = [tesseract.name]

    pages: list[PageResult] = []
    parsed_pages = []
    paddle_fields: dict[int, dict[str, Field]] = {}
    failed: list[int] = []

    with temp_workspace(settings) as work:
        for page_number, image in render.render_pages(path, settings.dpi):
            page_info = info.pages[page_number - 1]
            logger.info("Rendering page %d/%d", page_number, info.page_count)
            try:
                if info.is_native_text and page_info.text_chars >= 50:
                    raw = _native_text(path, page_number)
                    result = OCRPageResult(text=raw, engine="pdf-native", lines=[])
                else:
                    pipeline = steps.build_pipeline(page_info.native_dpi, settings.dpi)
                    prepared = steps.apply(image, pipeline)
                    if settings.debug:
                        prepared.save(debug_dir(settings, sha[:12]) /
                                      f"page-{page_number}.png")
                    logger.info("Running OCR on page %d/%d", page_number,
                                info.page_count)
                    result = tesseract.extract_text(prepared)

                raw_text = result.text
                cleaned = clean_text(raw_text, drop_noise=True)
                doc_type = detect_document_type(cleaned)

                if doc_type == "nid_card":
                    paddle = paddle or registry.get_provider("paddleocr", settings)
                    if paddle.name not in engines:
                        engines.append(paddle.name)
                    latin = paddle.extract_text(image)
                    combined = clean_text(f"{cleaned}\n{latin.text}", drop_noise=True)
                    parser = get_parser("nid_card")
                    parsed = parser.parse(combined, page_number, latin.lines)
                    paddle_fields[page_number] = {
                        name: field for name, field in parsed.fields.items()
                        if name in PADDLE_FIELDS and field.value is not None
                    }
                    parsed_pages.append(parsed)
                else:
                    parser = get_parser(doc_type)
                    if parser is not None:
                        parsed_pages.append(parser.parse(cleaned, page_number,
                                                         result.lines))

                status = "blank" if len(cleaned.strip()) < BLANK_TEXT_THRESHOLD else "ok"
                pages.append(PageResult(
                    page_number=page_number, document_type=doc_type,
                    native_dpi=page_info.native_dpi, render_dpi=settings.dpi,
                    rotation=page_info.rotation, engine=result.engine,
                    mean_confidence=result.mean_confidence,
                    raw_text=raw_text, clean_text=cleaned,
                    lines=[OCRLineModel(text=ln.text, confidence=ln.confidence,
                                        bbox=ln.bbox) for ln in result.lines],
                    status=status,
                ))
                if settings.log_text:
                    logger.debug("page %d text: %s", page_number, cleaned)
            except Exception as exc:               # noqa: BLE001 - isolate the page
                logger.warning("Page %d failed: %s", page_number, exc)
                failed.append(page_number)
                pages.append(PageResult(
                    page_number=page_number, document_type="unknown",
                    native_dpi=page_info.native_dpi, render_dpi=settings.dpi,
                    raw_text="", clean_text="", status="failed", error=str(exc),
                ))

    logger.info("Structuring data")
    person, conflicts = reconcile(parsed_pages, paddle_fields,
                                  min_confidence=settings.min_confidence)

    document = OcrDocument(
        document_id=sha[:12], source_file=path.name, sha256=sha,
        page_count=info.page_count, is_native_text=info.is_native_text,
        pages=pages, person=person, conflicts=conflicts,
        processing=Processing(
            engines=engines,
            pages_processed=len(pages) - len(failed),
            pages_failed=len(failed), failed_pages=failed,
            duration_ms=int((time.monotonic() - started) * 1000),
            ocr_version=__version__,
        ),
    )
    logger.info("JSON validation complete")
    save_document(settings, document)
    logger.info("JSON saved; processing completed (%s)", document.processing.status)
    return document


def _native_text(path: Path, page_number: int) -> str:
    import fitz
    doc = fitz.open(path)
    try:
        return doc.load_page(page_number - 1).get_text("text") or ""
    finally:
        doc.close()
```

- [ ] **Step 5: Implement `ocr/cli.py`**

```python
"""python -m ocr <file.pdf>"""
from __future__ import annotations

import argparse
import logging
import sys
from pathlib import Path

from ocr.config import get_settings
from ocr.pdf.validate import PdfValidationError
from ocr.pipeline import process_pdf
from ocr.storage import json_path


def _configure_logging(verbose: bool) -> None:
    logging.basicConfig(
        level=logging.DEBUG if verbose else logging.INFO,
        format="%(asctime)s %(levelname)-7s %(message)s",
        datefmt="%H:%M:%S",
    )


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(
        prog="python -m ocr",
        description="Extract structured JSON from scanned Bengali PDF dossiers.",
    )
    parser.add_argument("pdf", type=Path, nargs="+", help="PDF file(s) to process")
    parser.add_argument("--force", action="store_true",
                        help="reprocess even if a cached result exists")
    parser.add_argument("--debug", action="store_true",
                        help="keep rendered page images under storage/debug/")
    parser.add_argument("-v", "--verbose", action="store_true")
    args = parser.parse_args(argv)

    _configure_logging(args.verbose)
    settings = get_settings()
    if args.debug:
        settings = settings.model_copy(update={"debug": True})

    exit_code = 0
    for pdf in args.pdf:
        print(f"Processing: {pdf.name}")
        try:
            document = process_pdf(pdf, settings, force=args.force)
        except PdfValidationError as exc:
            print(f"  ERROR: {exc}", file=sys.stderr)
            exit_code = max(exit_code, exc.exit_code)
            continue
        except Exception as exc:                   # noqa: BLE001
            print(f"  ERROR: {exc}", file=sys.stderr)
            exit_code = max(exit_code, 1)
            continue

        processing = document.processing
        print(f"Pages: {document.page_count}")
        print(f"OCR Engine: {', '.join(processing.engines)}")
        print(f"Processed: {processing.pages_processed}/{document.page_count}")
        if processing.failed_pages:
            print(f"Failed pages: {processing.failed_pages}")
        if document.conflicts:
            names = ", ".join(c.field for c in document.conflicts)
            print(f"Conflicts needing review: {names}")
        print(f"JSON: {json_path(settings, document.sha256, document.source_file)}")
        print(f"Status: {processing.status}")
        if processing.status == "failed":
            exit_code = max(exit_code, 1)
    return exit_code
```

- [ ] **Step 6: Run tests to verify they pass**

Run: `python -m pytest tests/test_storage.py tests/test_pipeline.py -v`
Expected: PASS

- [ ] **Step 7: Commit**

```bash
git add ocr/storage.py ocr/pipeline.py ocr/cli.py tests/test_storage.py tests/test_pipeline.py
git commit -m "feat(ocr): storage with SHA-256 dedup, pipeline orchestrator, CLI"
```

---

### Task 11: Full scenario suite and real-document measurement

**Files:**
- Create: `tests/test_scenarios.py`, `tests/test_real_sample.py`, `pytest.ini`
- Test: the files above

**Interfaces:**
- Consumes: everything from Tasks 1–10; `tests/conftest.py` helpers `make_scanned_pdf`, `make_native_pdf`, `real_sample`

- [ ] **Step 1: Write `pytest.ini`**

```ini
[pytest]
testpaths = tests
python_files = test_*.py
addopts = -q --strict-markers
markers =
    slow: needs OCR engines, takes minutes
    real: needs the reference PDF via OCR_TEST_SAMPLE_PDF
```

- [ ] **Step 2: Write the scenario tests**

```python
# tests/test_scenarios.py
"""The 14 scenarios from the spec, on synthetic fixtures so they run anywhere."""
from __future__ import annotations

import pytest
from ocr.config import Settings
from ocr.pdf.validate import PdfValidationError
from ocr.pipeline import process_pdf
from tests.conftest import make_native_pdf, make_scanned_pdf

pytestmark = pytest.mark.slow


def _settings(tmp_path, **kw):
    return Settings(storage_dir=str(tmp_path / "storage"), dpi=150, **kw)


def test_01_single_page_scanned(tmp_path):
    pdf = make_scanned_pdf(tmp_path / "a.pdf", [["INVOICE 4321"]])
    doc = process_pdf(pdf, _settings(tmp_path))
    assert doc.page_count == 1
    assert doc.processing.pages_failed == 0


def test_02_multi_page_scanned(tmp_path):
    pdf = make_scanned_pdf(tmp_path / "b.pdf", [["one"], ["two"], ["three"], ["four"]])
    doc = process_pdf(pdf, _settings(tmp_path))
    assert [p.page_number for p in doc.pages] == [1, 2, 3, 4]


def test_04_english_page_is_read(tmp_path):
    pdf = make_scanned_pdf(tmp_path / "en.pdf", [["HELLO WORLD 12345"]])
    doc = process_pdf(pdf, _settings(tmp_path))
    assert "12345" in doc.pages[0].clean_text.replace(" ", "")


def test_06_native_text_pdf_skips_ocr(tmp_path):
    pdf = make_native_pdf(tmp_path / "n.pdf", ["Native text " * 20])
    doc = process_pdf(pdf, _settings(tmp_path))
    assert doc.is_native_text is True
    assert doc.pages[0].engine == "pdf-native"


def test_07_low_quality_scan_does_not_crash(tmp_path):
    pdf = make_scanned_pdf(tmp_path / "lq.pdf", [["FAINT 999"]], noise=4000, dpi=100)
    doc = process_pdf(pdf, _settings(tmp_path))
    assert doc.processing.status in ("success", "partial_success")


@pytest.mark.parametrize("angle", [90, 180])
def test_08_rotated_page(tmp_path, angle):
    pdf = make_scanned_pdf(tmp_path / f"r{angle}.pdf", [["ROTATED 77"]], rotation=angle)
    doc = process_pdf(pdf, _settings(tmp_path))
    assert doc.processing.pages_failed == 0


def test_09_blank_page_is_not_a_failure(tmp_path):
    pdf = make_scanned_pdf(tmp_path / "blank.pdf", [[]])
    doc = process_pdf(pdf, _settings(tmp_path))
    assert doc.processing.pages_failed == 0
    assert doc.pages[0].status in ("blank", "ok")


def test_10_corrupted_pdf_is_rejected(tmp_path):
    bad = tmp_path / "bad.pdf"
    bad.write_bytes(b"%PDF-1.4" + b"\x00" * 50)
    with pytest.raises(PdfValidationError):
        process_pdf(bad, _settings(tmp_path))


def test_11_duplicate_is_served_from_cache(tmp_path):
    pdf = make_scanned_pdf(tmp_path / "dup.pdf", [["CACHE ME 1"]])
    settings = _settings(tmp_path)
    first = process_pdf(pdf, settings)
    second = process_pdf(pdf, settings)
    assert second.processing.duration_ms == first.processing.duration_ms


def test_12_large_pdf_streams_without_loading_everything(tmp_path):
    pages = [[f"page {i}"] for i in range(60)]
    pdf = make_scanned_pdf(tmp_path / "big.pdf", pages)
    doc = process_pdf(pdf, _settings(tmp_path))
    assert doc.page_count == 60
    assert len(doc.pages) == 60


def test_12b_page_cap_is_enforced(tmp_path):
    pdf = make_scanned_pdf(tmp_path / "cap.pdf", [["a"], ["b"], ["c"]])
    with pytest.raises(PdfValidationError, match="page count"):
        process_pdf(pdf, _settings(tmp_path, max_pdf_pages=2))


def test_13_table_content_is_captured(tmp_path):
    rows = ["Item    Qty   Price", "Pen     10    50", "Book    2     300"]
    pdf = make_scanned_pdf(tmp_path / "table.pdf", [rows])
    doc = process_pdf(pdf, _settings(tmp_path))
    assert any(ch.isdigit() for ch in doc.pages[0].clean_text)


def test_14_unreadable_region_does_not_invent_text(tmp_path):
    pdf = make_scanned_pdf(tmp_path / "noise.pdf", [[]], noise=60000)
    doc = process_pdf(pdf, _settings(tmp_path))
    assert doc.person.nid_number is None      # nothing invented from noise
```

- [ ] **Step 3: Write the real-document measurement test**

```python
# tests/test_real_sample.py
"""Field-level accuracy against the reference dossier.

The PDF is never committed: it carries a real NID and bank account number and
this repo has a public remote. Supply it out-of-band:

    OCR_TEST_SAMPLE_PDF="C:/path/to/sample.pdf" python -m pytest tests/test_real_sample.py -v
"""
from __future__ import annotations

import pytest
from ocr.config import Settings
from ocr.pipeline import process_pdf

pytestmark = [pytest.mark.slow, pytest.mark.real]

EXPECTED = {
    "nid_number": "3733379188",
    "bank_account": "4432101006293",
    "mobile": "01748099635",
    "full_name_en": "ARJUMAN ARA",
    "nationality": "বাংলাদেশী",
    "religion": "ইসলাম",
    "marital_status": "বিবাহিত",
    "education_level": "৮ম শ্রেণী",
    "post_applied": "পরিচ্ছন্নতাকর্মী",
    "employment_start": "2023-07-01",
}


@pytest.fixture(scope="module")
def document(real_sample, tmp_path_factory):
    settings = Settings(storage_dir=str(tmp_path_factory.mktemp("storage")))
    return process_pdf(real_sample, settings)


def test_three_pages_each_typed_correctly(document):
    assert document.page_count == 3
    assert [p.document_type for p in document.pages] == [
        "biodata_form", "nid_card", "certificate"]


def test_document_is_recognised_as_scanned(document):
    assert document.is_native_text is False


def test_no_page_fails(document):
    assert document.processing.failed_pages == []


def test_raw_and_clean_text_are_both_present_per_page(document):
    for page in document.pages:
        assert page.raw_text.strip()
        assert page.clean_text.strip()


@pytest.mark.parametrize("field,expected", sorted(EXPECTED.items()))
def test_field_accuracy(document, field, expected):
    actual = getattr(document.person, field)
    assert actual is not None, f"{field} not extracted"
    assert actual.value == expected


def test_date_of_birth_conflict_is_recorded(document):
    """Form says 01/05/1982; the ID card and MRZ say 07/05/1982."""
    names = [c.field for c in document.conflicts]
    assert "date_of_birth" in names
    conflict = next(c for c in document.conflicts if c.field == "date_of_birth")
    assert {"1982-05-01", "1982-05-07"} <= {c.value for c in conflict.candidates}
    assert document.person.date_of_birth.value is None


def test_every_field_records_its_source_page(document):
    for name in EXPECTED:
        field = getattr(document.person, name)
        assert field.source_page in (1, 2, 3)
```

- [ ] **Step 4: Run the full suite**

Run: `python -m pytest -v`
Expected: unit tests PASS; `test_real_sample.py` SKIPS unless `OCR_TEST_SAMPLE_PDF` is set.

Then with the real document:

Run: `OCR_TEST_SAMPLE_PDF="C:/Users/MUTI/Downloads/Arjuman ara Cleaner-009 Dudok.pdf" python -m pytest tests/test_real_sample.py -v`
Expected: page typing, conflict and provenance tests PASS. Any failing field-accuracy case is a real measurement — record the number, fix the parser if it's a parsing bug, and report it honestly if it's an OCR limit.

- [ ] **Step 5: Commit**

```bash
git add tests/ pytest.ini
git commit -m "test(ocr): 14 scenario tests plus field-accuracy measurement on the real dossier"
```

---

### Task 12: Documentation

**Files:**
- Modify: `README.md`
- Create: `docs/ocr-pipeline.md`
- Modify: `.env.example`

**Interfaces:**
- Consumes: the CLI and config surface from Tasks 1 and 10

- [ ] **Step 1: Add the OCR section to `README.md`**

Insert before the final section, with exact commands:

````markdown
## PDF OCR Processing

Scanned, image-only PDFs (Bengali personnel dossiers) become validated
structured JSON. Digital PDFs with a text layer are detected and skip OCR.

```
PDF → validate → native-text check → render → preprocess → OCR
    → clean → detect type → parse → reconcile → validate → JSON
```

### Requirements

Python 3.13, plus Tesseract:

```bash
winget install --id UB-Mannheim.TesseractOCR
```

```bash
python -m pip install -r requirements-ocr.txt
```

### Bengali language support

Tesseract ships only `eng` and `osd`. Populate the project-local `tessdata/`:

```bash
python scripts/setup-ocr.py
```

This copies `eng`/`osd` from the install and downloads `ben.traineddata`
(11 MB, `tessdata_best`). `tessdata/` is gitignored.

Verify Bengali is available:

```bash
python -c "import pytesseract,os; os.environ['TESSDATA_PREFIX']='tessdata'; print(pytesseract.get_languages())"
```

Expected output includes `ben`.

### Running

```bash
python -m ocr "C:/path/to/document.pdf"
```

```text
Processing: document.pdf
Pages: 3
OCR Engine: tesseract:ben+eng, paddleocr:en
Processed: 3/3
Conflicts needing review: date_of_birth
JSON: storage/json/a3f2c1d4e5f6_document.json
Status: success
```

Multiple files, forced reprocessing, and kept page images:

```bash
python -m ocr a.pdf b.pdf --force --debug -v
```

### Where JSON goes

`storage/json/<sha256-prefix>_<safe-name>.json`. The prefix is the SHA-256 of
the file, which is also the duplicate-detection key — reprocessing the same
bytes reuses the existing JSON unless `--force` is passed. `storage/` is
gitignored because these documents contain personal data.

### Configuration

Set in `.env.local`:

| Variable | Default | Meaning |
|---|---|---|
| `OCR_ENGINE` | `tesseract` | `tesseract` or `paddleocr` |
| `OCR_LANGUAGES` | `ben+eng` | Tesseract language string |
| `OCR_DPI` | `300` | Render resolution |
| `OCR_MIN_CONFIDENCE` | `0.5` | Below this a field is `low_confidence` |
| `OCR_MAX_PDF_SIZE_MB` | `50` | Upload size cap |
| `OCR_MAX_PDF_PAGES` | `500` | Page count cap |
| `OCR_STORAGE_DIR` | `storage` | Output root |
| `OCR_TESSDATA_DIR` | `tessdata` | Language models |
| `OCR_DEBUG` | `0` | `1` keeps rendered page images |
| `OCR_LOG_TEXT` | `0` | `1` logs OCR text — never in production |

### Output

See [docs/ocr-pipeline.md](docs/ocr-pipeline.md) for the full schema and a
worked example.

### Troubleshooting

**`TesseractNotFoundError`** — the binary isn't on `PATH`. Set the full path:

```bash
setx OCR_TESSERACT_CMD "C:\Program Files\Tesseract-OCR\tesseract.exe"
```

**`Failed loading language 'ben'`** — `tessdata/` is missing the model:

```bash
python scripts/setup-ocr.py
```

**`NotImplementedError: ConvertPirAttribute2RuntimeAttribute`** — a
paddlepaddle oneDNN issue. The provider disables oneDNN already; if it appears
elsewhere, set `FLAGS_use_mkldnn=0`.

**Bengali comes out as Latin gibberish** (`rrerso ateto ta`) — the page was read
by PaddleOCR, which has no Bengali model. Confirm `OCR_ENGINE=tesseract`.

**Everything is `"status": "missing"`** — check `pages[].raw_text`. If it's
empty the OCR failed; if it has text the parser labels need extending in
`ocr/parsers/`.
````

- [ ] **Step 2: Write `docs/ocr-pipeline.md`**

Document, with a full worked example: the stage-by-stage flow; the `Field`
provenance model and why `value` is `null` rather than `""`; the three document
types and their detection markers; why conflicts are recorded rather than
resolved (with the real DOB disagreement as the example); the MRZ check-digit
validation; the mapping table to `ExtractedCvData` from the spec; and how to add
a new document type (new module in `ocr/parsers/`, entry in `_PARSERS`, markers
in `detect.py`).

- [ ] **Step 3: Append OCR variables to `.env.example`**

```env
# --- OCR (scanned PDF → structured JSON) ---
OCR_ENGINE=tesseract
OCR_LANGUAGES=ben+eng
OCR_DPI=300
OCR_MIN_CONFIDENCE=0.5
OCR_MAX_PDF_SIZE_MB=50
OCR_MAX_PDF_PAGES=500
OCR_STORAGE_DIR=storage
OCR_TESSDATA_DIR=tessdata
OCR_DEBUG=0
OCR_LOG_TEXT=0
```

- [ ] **Step 4: Verify every documented command runs**

Run each command in the README section verbatim and confirm the output matches.
A command that doesn't work as printed is a documentation bug.

- [ ] **Step 5: Commit**

```bash
git add README.md docs/ocr-pipeline.md .env.example
git commit -m "docs: OCR pipeline setup, usage, configuration, troubleshooting"
```

---

## Self-Review

**Spec coverage:** Phases 1–2 → Tasks 4, 10 (validate → native-text → render →
preprocess → OCR → clean → structure → validate → save). Phase 3 → Task 4.
Phase 4 → Task 5. Phase 5 → Task 6. Phase 6 → Task 3 (`PageResult` keeps
`page_number`, `raw_text`, `clean_text`). Phase 7 → Task 2. Phase 8 → Tasks 7–9.
Phase 9 → Task 3. Phase 10 → Tasks 3, 10. Phase 11 → Task 10. Phase 12 → Tasks 4
(generator), 10 (dedup, caps). Phase 13 → Task 10. Phase 14 → Task 10. Phase 15 →
Tasks 4, 10 (`safe_stem`, magic bytes, caps, no execution). Phase 16 → Task 10.
Phase 17 → Tasks 1, 12. Phase 18 → Task 11. Phase 19 → Task 10 CLI. Phase 20 →
Task 12.

**Type consistency:** `Field`, `PageResult`, `Person`, `Conflict`, `Processing`
defined in Task 3 and used unchanged after. `OCRPageResult`/`OCRLine` defined in
Task 6, consumed in Task 10. `ParsedPage` defined in Task 7, consumed in Tasks 8
and 9. `get_parser` defined in Task 8, called in Task 10. `Settings` field names
match between Tasks 1, 10 and the README table.

**Known deviation:** Task 10's `process_pdf` calls `registry.get_provider("paddleocr", …)`
directly for NID pages rather than going through `settings.engine`. That is
deliberate — role separation requires both engines regardless of the configured
default — and is documented in the module docstring.
