# Scanned PDF OCR → Structured JSON

**Date:** 2026-08-12
**Status:** Approved

## Problem

AK Traders receives personnel dossiers as scanned, image-only PDFs. The existing
CV pipeline reads the PDF text layer with `pdf2json`, which returns nothing for
these files. Today the only thing that reads them at all is the vision-model path
in `lib/ai-provider.ts`, which sends whole documents to a third party and leaves
no page-level trace of what was read.

We need a pipeline that turns a scanned PDF into validated, structured JSON:

```
scanned PDF → page images → OCR → clean text → structured data → validated JSON
```

## Source documents

Analysis of the reference sample (`Arjuman ara Cleaner-009 Dudok.pdf`, 3 pages):

| Page | Type | Content | Native DPI |
|------|------|---------|-----------|
| 1 | `biodata_form` | জীবন-বৃত্তান্ত — 16 numbered `serial │ label ঃ value` rows, passport photo, signature | ~154 |
| 2 | `nid_card` | Scanned National ID, both sides, degraded photocopy, includes MRZ | ~113 |
| 3 | `certificate` | যাহার জন্য প্রযোজ্য — Bengali prose employment/character certificate | ~157 |

Facts established by inspection, each of which drives a design decision:

- **Zero text characters on every page.** One full-page RGB image per page,
  producer `Haru Free PDF Library`. Native text extraction is genuinely useless
  here — it is retained only for future non-scanned inputs.
- **One PDF contains three document types.** Document type must therefore be
  detected *per page*. A document-level classifier would be wrong about two
  thirds of this file.
- **Embedded scans are 113–157 DPI, well below the 250–300 DPI ideal.** Rendering
  at 300 DPI adds interpolated pixels, not information. Upscaling is a
  preprocessing step whose value must be measured, not assumed.
- **All page-1 digits are Bengali numerals** (`৩৭৩৩৩৭৯১৮৮`, `০১/০৫/১৯৮২`).
  Without normalization the NID and phone are unsearchable and cannot be matched
  against the Latin digits on page 2.
- **The document disagrees with itself.** Page 1 gives DOB `০১/০৫/১৯৮২`
  (01/05/1982); page 2's ID card and its MRZ both give `07 May 1982` / `820507`.
- **The filename carries metadata**: `<name> <post>-<serial> <employer>.pdf`.
  Treated as a weak hint only, never as an extracted value.

## Engine selection

Measured, not assumed. Both findings below come from running the engines against
the real sample.

**PaddleOCR cannot read Bengali.** `bn` appears in none of PaddleOCR 3.7's
language groups (`LATIN_LANGS`, `DEVANAGARI_LANGS`, `ARABIC_LANGS`,
`CYRILLIC_LANGS`). Devanagari covers Hindi/Marathi/Nepali — a different script.
The engine named in the original brief is not viable for these documents.

**PaddleOCR is excellent on the Latin/digit content.** Run with `lang=en` against
page 2 — the worst-quality page in the sample:

| Output | Confidence | Correct |
|--------|-----------|---------|
| `ARJUMAN ARA` | 0.98 | yes |
| `373 337 9188` | 1.00 | yes (NID) |
| `Date ot Bith 07 May 1982` | 0.93 | value correct, label garbled |
| `8205074F31061108GD<<<…` | 0.94 | MRZ: DOB, sex, expiry |
| `rrerso ateto ta`, `sEra sn`, `Boa: P/cfee; 88e` | 0.39–0.67 | no — Bengali forced into Latin |

Confidence separates the two populations cleanly (0.92–1.00 vs 0.39–0.67), which
makes thresholding a real quality gate rather than decoration.

**PaddleOCR requires oneDNN disabled.** With default settings, paddlepaddle
3.3.1 raises `NotImplementedError: ConvertPirAttribute2RuntimeAttribute`.
`enable_mkldnn=False` resolves it. This must be set in the provider, not left to
the caller.

**Tesseract `ben+eng` reads this Bengali well.** Run against page 1 at 200 DPI
with `tessdata_best/ben`, 15 of 16 field values were correct, including every
number: NID `৩৭৩৩৩৭৯১৮৮`, bank account `৪৪৩২১০১০০৬২৯৩`, DOB `০১/০৫/১৯৮২`,
mobile `০১৭৪৮০৯৯৬৩৫`, and all address, religion, marital-status and education
values.

The single failure is `নাম` (name), returned as `Braet আরা` — আরজুমান lost. This
is precisely the field PaddleOCR reads at 0.98 confidence from the ID card
(`ARJUMAN ARA`), which is the concrete justification for role separation: the two
engines fail in different places, and the reconciliation step recovers a field
that either engine alone would get wrong.

Two parser constraints follow from the same run:

- The `ঃ` separator is recognised inconsistently as `$`, `£`, `g`, `3`, `¢`, `8`
  or `2`. Label/value splitting must not depend on the separator glyph; it should
  split on the label position instead.
- Stray artifacts (`০০৩`, `৩০০`, `০০`) appear where the separator column is
  misread. Text cleaning must drop short numeric-only noise lines without
  touching real short values such as `৪২ বছর`.

### Decision: dual-engine with role separation

Tesseract (`ben+eng`) owns page prose and produces `raw_text` / `clean_text`.
PaddleOCR (`en`) owns high-value Latin/digit field candidates: NID, mobile,
dates, bank account, MRZ, English name. The parsers reconcile the two.

The engines never compete for the same output, which avoids merging two OCR
engines' free text geometrically — the hardest part of a hybrid design — while
still using each where it measurably wins.

Rejected alternatives: script-aware region routing (a misclassified region
silently loses text, and these documents have almost no mixed-script lines);
layout-first cell extraction (highest accuracy on page 1, inapplicable to pages
2 and 3 — deferred as a later per-page refinement).

All processing is local. Nothing leaves the server.

## Architecture

A self-contained Python package at `ocr/`. No dependency on the Next.js code and
no changes to it.

```
ocr/
├── config.py           env-driven settings (pydantic-settings)
├── cli.py              python -m ocr <file.pdf>
├── pipeline.py         orchestrator — the only module that knows the sequence
├── models.py           Pydantic v2 schema; the serialization contract
├── storage.py          SHA-256 dedup, atomic JSON write, path-traversal safety
├── pdf/
│   ├── validate.py     extension, MIME, %PDF magic, size/page caps, encryption
│   ├── inspect.py      native-text detection, per-page native DPI
│   └── render.py       PyMuPDF page → image, one page at a time
├── preprocess/steps.py grayscale, autocontrast, denoise, deskew, upscale, binarize
├── engines/
│   ├── base.py         OCRProvider protocol
│   ├── tesseract.py    TesseractProvider (ben+eng)
│   ├── paddle.py       PaddleProvider (en, oneDNN disabled)
│   └── registry.py     name → provider; engine is a config value
├── text/
│   ├── normalize.py    NFC, whitespace, artifact stripping
│   └── bengali.py      numeral maps, Bengali date/number parsing
└── parsers/
    ├── base.py         DocumentParser protocol
    ├── detect.py       per-page document type detection
    ├── biodata.py      জীবন-বৃত্তান্ত label/value form
    ├── nid.py          NID card + MRZ with check-digit validation
    └── certificate.py  প্রত্যয়ন prose
```

Three boundaries carry the design:

- `pipeline.py` is the only place that knows the order of operations, so every
  other module is independently testable.
- `engines/base.py` is the swap point. Replacing Tesseract with EasyOCR, Surya,
  or a vision model means adding one file and changing one env var.
- `parsers/` is keyed by document type. A new form type is a new file plus a
  detection rule.

### Storage

```
storage/
├── json/<sha256-prefix>_<safe-stem>.json    predictable, collision-proof
├── debug/<doc_id>/page-N.png                only when OCR_DEBUG=1
└── temp/                                    always cleaned, even on crash
```

`storage/` is gitignored, matching the existing `/public/uploads/` precedent for
documents that must never be committed or served.

Page images are streamed one at a time and released immediately: a 500-page PDF
holds one page in memory, never the whole document.

## Data model

Every extracted value carries provenance, because a bare string from OCR cannot
be trusted:

```python
class Field(BaseModel):
    value:        str | None      # normalized (Bengali digits → ASCII)
    raw:          str | None      # exactly what OCR emitted, never touched
    confidence:   float | None
    source_page:  int
    source_label: str | None      # the Bengali label it was read from
    status: Literal["ok", "low_confidence", "conflict", "missing"]
```

`value` is `None` when unreadable — never `""`, never a guess. There is no way to
express "missing" that looks like a real value.

Document shape:

```jsonc
{
  "document_id": "a3f2c1d4…",
  "source_file": "Arjuman ara Cleaner-009 Dudok.pdf",
  "sha256": "a3f2c1d4…",
  "page_count": 3,
  "is_native_text": false,
  "pages": [
    { "page_number": 1, "document_type": "biodata_form",
      "native_dpi": 154, "render_dpi": 300, "rotation": 0,
      "engine": "tesseract:ben+eng", "mean_confidence": 0.0,
      "raw_text": "…", "clean_text": "…",
      "lines": [{ "text": "…", "confidence": 0.0, "bbox": [0,0,0,0] }],
      "status": "ok" }
  ],
  "person": { "…": "Field objects, see below" },
  "conflicts": [
    { "field": "date_of_birth",
      "candidates": [
        { "value": "1982-05-01", "raw": "০১/০৫/১৯৮২", "source_page": 1 },
        { "value": "1982-05-07", "raw": "07 May 1982", "source_page": 2 },
        { "value": "1982-05-07", "raw": "820507", "source_page": 2,
          "source_label": "mrz" }
      ] }
  ],
  "processing": {
    "status": "success",
    "engines": ["tesseract:ben+eng", "paddleocr:en"],
    "pages_processed": 3, "pages_failed": 0, "failed_pages": [],
    "duration_ms": 0, "ocr_version": "…", "schema_version": "1.0"
  }
}
```

### person fields

Derived from the 16 form rows plus the ID card and certificate:

`full_name_bn`, `full_name_en`, `father_name`, `mother_name`,
`permanent_address`, `present_address`, `nid_number`, `bank_account`,
`date_of_birth`, `age`, `nationality`, `religion`, `marital_status`, `height`,
`weight`, `mobile`, `education_level`, `post_applied`, `sex`, `nid_expiry`,
`employer`, `employment_start`, `certificate_issuer`, `certificate_date`,
`certificate_signatory`.

### Conflicts are output, not errors

The sample already disagrees with itself about date of birth. Two independent
sources (ID card, MRZ) outvote one (form), but a pipeline that quietly picked the
majority would hide a discrepancy a human needs to see on a personnel file.
`date_of_birth.value` stays `null` with `status: "conflict"` and all candidates
are preserved. The data is not lost; the resolution is deferred to a human.

### MRZ as a verifiable source

The `<<<` lines on the ID card are machine-readable with check digits, so
`820507` can be *verified* rather than merely read. It is the highest-confidence
evidence in the document and is parsed as a distinct source rather than dissolved
into page text.

### Mapping to the existing app

Field names mirror `ExtractedCvData.personal` in `lib/ai-provider.ts` so a future
mapper is mechanical:

| OCR field | `ExtractedCvData` |
|---|---|
| `full_name_bn` / `full_name_en` | `personal.fullName` |
| `father_name` | `personal.fatherName` |
| `mother_name` | `personal.motherName` |
| `permanent_address` | `personal.permanentAddress` |
| `present_address` | `personal.presentAddress` |
| `nid_number` | `personal.nid` |
| `date_of_birth` | `personal.dob` |
| `nationality` / `religion` / `marital_status` | `personal.*` |
| `mobile` | `personal.mobile` |
| `post_applied` | `employment.designation` |
| `employer` | `employment.workplace` |
| `employment_start` | `employment.joiningDate` |
| `education_level` | `education[].degree` |

**Known gap:** `bank_account`, `height`, `weight`, and `age` have no home in the
current schema. Recorded here rather than inventing columns; resolving it belongs
to the integration spec.

Note the null convention differs: OCR uses `null` for missing, the app uses `""`.
The future mapper converts.

## Error handling

- **Per-page isolation.** A page that raises is recorded with `status: "failed"`
  and its error; the document continues. Any failed page →
  `processing.status: "partial_success"` with `failed_pages` populated. All pages
  failing → `"failed"`.
- **Confidence.** Tesseract word confidences via `image_to_data`, PaddleOCR via
  `rec_scores`. Values below `OCR_MIN_CONFIDENCE` (default 0.5) mark a field
  `low_confidence` rather than discarding it.
- **Validation before write.** Pydantic validates the full document. On failure
  nothing is written and the CLI exits non-zero — an invalid document is never
  saved as though it succeeded.
- **Encrypted PDFs** are detected via `doc.is_encrypted` and rejected with a
  clear message, not a stack trace.
- **Corrupted PDFs** surface as a validation error with a non-zero exit code.
- **Caps:** `MAX_PDF_SIZE_MB` (50), `MAX_PDF_PAGES` (500).
- **Temp cleanup** runs in a `finally` block, so it survives crashes.
- **Nothing embedded in a PDF is ever executed.** Rendering only.

### Deduplication

SHA-256 of the file bytes is the document id. If `storage/json/` already holds a
result for that hash at the same `schema_version`, processing is skipped and the
existing JSON reused. `--force` overrides. Re-running after a schema change
reprocesses, since the cached shape no longer matches.

### Logging

Structured, with page-level progress (`Rendering page 2/3`, `OCR page 2/3`).
Document text is logged only when `OCR_LOG_TEXT=1`, off by default, so personal
data does not reach production logs.

## Configuration

Environment-driven, `OCR_`-prefixed to match the project's existing convention:

```env
OCR_ENGINE=tesseract          # tesseract | paddleocr
OCR_LANGUAGES=ben+eng
OCR_DPI=300
OCR_MIN_CONFIDENCE=0.5
OCR_MAX_PDF_SIZE_MB=50
OCR_MAX_PDF_PAGES=500
OCR_STORAGE_DIR=storage
OCR_DEBUG=0                   # 1 keeps page images
OCR_LOG_TEXT=0                # 1 logs OCR text (never in production)
OCR_TESSERACT_CMD=            # optional explicit binary path
OCR_TESSDATA_DIR=tessdata     # project-local language models
```

### Language models

Tesseract's Windows build installs to `C:\Program Files\Tesseract-OCR` and ships
only `eng` and `osd`. Bengali is a separate download, and writing into the
install directory needs administrator rights.

Models therefore live in a project-local, gitignored `tessdata/` directory that
`OCR_TESSDATA_DIR` points at, populated by `scripts/setup-ocr.py`. This needs no
elevation, keeps the setup reproducible for anyone cloning the repo, and pins
which Bengali model is in use — `tessdata_best/ben` (11 MB), chosen over the
faster integer variant because accuracy matters more than speed on 113–157 DPI
scans.

Because `TESSDATA_PREFIX` makes Tesseract read from that directory *exclusively*,
`eng` and `osd` are copied there alongside `ben`.

## Testing

`pytest` (9.1.1, already installed). Fixtures are generated, not committed,
extending the approach in `scripts/generate-synthetic-cv-fixtures.py`.

**The reference sample is never committed.** It contains a real person's National
ID and bank account number, and the repo has a public GitHub remote. Tests that
use it read from a gitignored path and skip when absent.

Scenarios:

| # | Scenario | Fixture |
|---|---|---|
| 1 | Single-page scanned PDF | synthetic |
| 2 | Multi-page scanned PDF | synthetic |
| 3 | Bengali page | synthetic + real |
| 4 | English page | synthetic |
| 5 | Mixed Bengali/English | synthetic + real |
| 6 | Native-text PDF | synthetic (existing generator) |
| 7 | Low-quality scan | synthetic, downsampled to ~110 DPI |
| 8 | Rotated page | synthetic, 90°/180° |
| 9 | Blank page | synthetic |
| 10 | Corrupted PDF | truncated bytes |
| 11 | Duplicate PDF | same file twice → cache hit |
| 12 | Large PDF | synthetic 120-page, asserts bounded memory |
| 13 | Table content | synthetic |
| 14 | Unreadable region | synthetic, heavy noise |

Unit tests cover Bengali numeral normalization, date parsing, MRZ check digits,
document-type detection, and conflict recording independently of any OCR engine —
these are the parts that must be correct regardless of engine accuracy.

Accuracy is reported as measured field-level numbers against the real sample. No
accuracy claim is made that has not been run.

## Out of scope

Deferred to their own specs:

- Writing results into Supabase (`cv_records`, employee profiles)
- Next.js upload-route integration and UI
- Schema changes for `bank_account`, `height`, `weight`, `age`
- Layout-first cell extraction for form pages
- Vision-model escalation for low-confidence pages

## Known limitations

- Bengali OCR accuracy on 113–157 DPI scans is the primary risk. Tesseract's
  Bengali model handles conjuncts imperfectly and these are not high-quality
  scans. Accuracy will be measured and reported, not promised.
- Handwriting (the signature, handwritten dates) is out of reach for both
  engines.
- Page 2's Bengali text is a degraded photocopy that no local engine is likely to
  read. This is acceptable: every fact on that page also appears in Latin script
  and in the MRZ.
