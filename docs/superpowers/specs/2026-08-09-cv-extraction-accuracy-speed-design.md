# CV Extraction Accuracy & Speed — Design

**Date:** 2026-08-09
**Status:** Approved by user

## Problem (evidence-based)

Extraction quality is unreliable across CV designs, and processing takes 1–3 minutes per CV.

Measured root causes:

1. **The AI never sees the CV.** The pipeline feeds models only pdf2json text. For
   designed/graphic CVs that text is kerned ("P h o n e"), reading-order scrambled
   ("2 0 1 6 - 2 0 2 0 2 0 2 0 - 2 0 2 3"), and often missing the candidate's name
   entirely (drawn as vector art). Verified on two real templates: neither text dump
   contains the candidate's name.
2. **Silent junk saves.** When extraction fails, the profile is saved as "active" with
   the *filename* as the candidate name (observed: "White Black and Blue Modern
   Professional Resume A4"). No signal reaches the user.
3. **Latency compounders.** ~1,300-token prompt with a full JSON example, 4,000
   max output tokens, full-text echo, dual-format sequential retries, and the slowest
   model (`claude-opus-4-8`).

Benchmarks on the user's AgentRouter account (2026-08-09):

| Path | Latency | Name from graphic CV |
|---|---|---|
| Production text path (opus-4-8, bloated prompt) | 70–180s | often wrong/missing |
| Compact prompt, text path, opus-4-8 | ~23s | limited by text quality |
| Compact prompt, text path, gpt-5.6-sol | ~9s | limited by text quality |
| **PDF document block, claude-opus-5, compact prompt** | **~11s** | **correct ("Lorna Alvarado")** |

## Design

### 1. PDF-native extraction (core change)

For PDF uploads, `extractWithAgentRouter` sends the PDF itself as an Anthropic
`document` content block (base64) to `claude-opus-5` (env-overridable via
`AGENTROUTER_MODEL`), alongside a compact prompt. Claude reads the document
visually — kerning, columns, and graphic names are no longer a problem.

- Compact prompt: field list + rules, no full JSON example block, explicit
  "missing = empty, never invent".
- `max_tokens: 2500` (structured output only; no text echo).
- Raw pdf2json text is still passed in the prompt as a low-cost hint and is still
  stored in `cv_records.extracted_text` (search/dedup unchanged).
- PDFs larger than ~4.5 MB fall back to the text path (Anthropic request-size limit).

### 2. Fallback ladder

1. PDF-native Claude via AgentRouter (primary)
2. Existing text-based chain (AgentRouter openai-format → TokenRouter → … → Gemini)
3. Local heuristic parser (`parseCvTextToStructure`)

Each step fires only if the previous returned nothing. Uploads never hard-fail.

### 3. Extraction validation → "review_required" status

New `lib/extraction-validator.ts`: `validateExtraction(structured, fileName)` returns
`{ ok, reasons[] }`. Checks:

- Name is present, not derived from the filename, not a section heading
  ("contact", "education", "resume"…), not kerned single letters, 2–60 chars.
- Substance: at least one of (email | phone | education entry | experience entry).

On failure the profile is persisted with `status: "review_required"` instead of
`active`. `EmployeeList` badge renders "Needs Review" (warning variant) for that
status. No new UI surfaces; the status enum already exists.

### 4. Regression safety net

`scripts/test-extraction-quality.ts`: runs the known-hard local sample PDFs through
`extractCvWithAI` and asserts expected fields (name, email, ≥N education, ≥N
experience, skills non-empty). Run manually / before releases. Exits non-zero on
regression.

## Not changing

Photo extraction, upload UI, tab structure, DB schema, dedup logic, bulk-upload
flow, employees APIs.

## Success criteria

- Graphic-template CV extracts correct name/email/education/experience.
- Typical upload completes in ~10–20s.
- A deliberately unreadable PDF produces a "Needs Review" profile, not silent junk.
- `npm run type-check`, `lint`, and the two verification scripts pass.
