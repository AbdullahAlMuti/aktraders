# CV Extraction Accuracy & Speed Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make CV extraction accurate on graphic/designed CVs (~10–20s per CV) by sending the PDF itself to Claude, and flag failed extractions as "Needs Review" instead of silently saving junk.

**Architecture:** `extractWithAgentRouter` gains a PDF `document` content block as its primary path (claude-opus-5, compact prompt, max_tokens 2500). A new `lib/extraction-validator.ts` gates every saved profile; failures persist with `status: "review_required"`. A regression script locks in quality using the two known-hard sample PDFs in `public/uploads/cvs/`.

**Tech Stack:** Next.js 14 App Router, TypeScript, Anthropic Messages API via AgentRouter gateway, Supabase, tsx for scripts.

## Global Constraints

- AgentRouter requires client headers `User-Agent: claude-cli/1.0.83 (external, cli)` and `x-app: cli` (already in `extractWithAgentRouter` as `clientHeaders`).
- Default AgentRouter model becomes `claude-opus-5`; `AGENTROUTER_MODEL` env still overrides.
- PDF document blocks only when base64 payload < 6,000,000 chars (~4.5 MB binary).
- Missing CV fields must stay empty — never fabricate values.
- No DB schema changes; `EmployeeStatus` already includes `"review_required"`.
- No test framework exists; test scripts run via `npx -y tsx --env-file=.env.local <script>` and exit non-zero on failure (pattern: `scripts/verify-cv-system.ts`).

---

### Task 1: Extraction validator

**Files:**
- Create: `lib/extraction-validator.ts`
- Test: `scripts/test-extraction-validator.ts`

**Interfaces:**
- Consumes: nothing (pure function).
- Produces: `validateExtraction(structured: any, fileName: string): { ok: boolean; reasons: string[] }` — `structured` is the AI output shape (`ExtractedCvData`-like: `candidateName`, `personal{...}`, `education[]`, `experience[]`).

- [ ] **Step 1: Write the failing test** — `scripts/test-extraction-validator.ts`:

```typescript
import { validateExtraction } from "../lib/extraction-validator";

let passed = 0, total = 0;
function assert(cond: boolean, name: string) {
  total++;
  if (cond) { passed++; console.log(`[PASS] ${name}`); }
  else console.error(`[FAIL] ${name}`);
}

// Good extraction passes
const good = {
  candidateName: "Korina Villanueva",
  personal: { fullName: "Korina Villanueva", email: "korina@example.com", mobile: "+123-456-7890" },
  education: [{ degree: "B.A." }],
  experience: [{ role: "Manager" }],
};
assert(validateExtraction(good, "korina_cv.pdf").ok === true, "valid extraction passes");

// Filename-as-name fails
const fromFile = { candidateName: "White Black and Blue Modern Professional Resume A4", personal: {}, education: [], experience: [] };
assert(validateExtraction(fromFile, "White Black and Blue Modern Professional Resume A4.pdf").ok === false, "filename-as-name rejected");

// Section heading as name fails
const heading = { candidateName: "Work Experience", personal: { email: "a@b.com" }, education: [], experience: [] };
assert(validateExtraction(heading, "cv.pdf").ok === false, "section heading rejected");

// Kerned single letters fail
const kerned = { candidateName: "W a r d i e r e", personal: { email: "a@b.com" }, education: [], experience: [] };
assert(validateExtraction(kerned, "cv.pdf").ok === false, "kerned name rejected");

// No substance fails (name only, nothing else)
const empty = { candidateName: "John Smith", personal: {}, education: [], experience: [] };
assert(validateExtraction(empty, "cv.pdf").ok === false, "no-substance extraction rejected");

// Substance via phone only passes
const phoneOnly = { candidateName: "John Smith", personal: { mobile: "01700123456" }, education: [], experience: [] };
assert(validateExtraction(phoneOnly, "cv.pdf").ok === true, "phone counts as substance");

// Missing name fails
const noName = { candidateName: "", personal: { email: "a@b.com" }, education: [], experience: [] };
assert(validateExtraction(noName, "cv.pdf").ok === false, "missing name rejected");

console.log(`${passed}/${total}`);
process.exit(passed === total ? 0 : 1);
```

- [ ] **Step 2: Run to verify it fails** — `npx -y tsx scripts/test-extraction-validator.ts` → module-not-found error.

- [ ] **Step 3: Implement** — `lib/extraction-validator.ts`:

```typescript
/**
 * Validates an AI CV extraction before it is persisted. A failing result means
 * the profile should be saved with status "review_required" instead of "active".
 */
export interface ExtractionValidation {
  ok: boolean;
  reasons: string[];
}

const SECTION_HEADINGS = [
  "contact", "address", "phone", "email", "web", "website", "profile", "education",
  "experience", "work experience", "skills", "languages", "resume", "curriculum",
  "curriculum vitae", "cv", "about me", "summary", "objective", "references",
  "certifications", "projects", "achievements", "personal information",
];

function normalize(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, " ").replace(/\s+/g, " ").trim();
}

export function validateExtraction(structured: any, fileName: string): ExtractionValidation {
  const reasons: string[] = [];
  const p = structured?.personal || structured?.personalInformation || {};
  const name = (structured?.candidateName || p.fullName || "").trim();

  // --- Name checks ---
  if (!name) {
    reasons.push("no candidate name extracted");
  } else {
    if (name.length < 2 || name.length > 60) reasons.push("name length implausible");
    if (!/[a-zA-Z]/.test(name)) reasons.push("name contains no letters");
    if (/^(?:[A-Za-z] )+[A-Za-z]\.?$/.test(name)) reasons.push("name is kerned single letters");
    if (SECTION_HEADINGS.includes(normalize(name))) reasons.push("name is a section heading");

    const fileBase = normalize(fileName.replace(/\.[^.]+$/, ""));
    if (fileBase && normalize(name) === fileBase) reasons.push("name derived from filename");
    if (/\b(resume|cv|curriculum|template|professional|modern|simple|minimalist)\b/i.test(name)) {
      reasons.push("name looks like a document title");
    }
  }

  // --- Substance check: at least one real data point beyond the name ---
  const email = (p.email || "").trim();
  const phoneDigits = ((p.mobile || p.phone || "").match(/\d/g) || []).length;
  const eduCount = Array.isArray(structured?.education) ? structured.education.length : 0;
  const expCount = Array.isArray(structured?.experience) ? structured.experience.length : 0;
  const hasSubstance =
    /@/.test(email) || phoneDigits >= 7 || eduCount > 0 || expCount > 0;
  if (!hasSubstance) reasons.push("no contact, education, or experience extracted");

  return { ok: reasons.length === 0, reasons };
}
```

- [ ] **Step 4: Run test to verify it passes** — `npx -y tsx scripts/test-extraction-validator.ts` → 7/7, exit 0.

- [ ] **Step 5: Commit** — `git add lib/extraction-validator.ts scripts/test-extraction-validator.ts && git commit -m "feat: extraction validator gating junk CV extractions"`

---

### Task 2: PDF-native extraction + compact prompt in ai-provider

**Files:**
- Modify: `lib/ai-provider.ts` (replace `CV_EXTRACTION_PROMPT`; extend `extractWithAgentRouter` Anthropic branch; change default model)
- Modify: `.env.example` (`AGENTROUTER_MODEL=claude-opus-5`)
- Manual: set `AGENTROUTER_MODEL=claude-opus-5` in `.env.local`

**Interfaces:**
- Consumes: existing `extractCvWithAI(base64Data, mimeType, rawExtractedText)` — signature unchanged; `base64Data` already carries the whole PDF.
- Produces: same `ExtractedCvData | null`. Callers unchanged.

- [ ] **Step 1: Replace the ~1,300-token prompt** with the compact version (same output schema keys, so `buildFullProfileFromRecord` mapping is untouched):

```typescript
const CV_EXTRACTION_PROMPT = `Extract ALL candidate information from this CV into a single JSON object.

Rules:
- Read the ENTIRE document: sidebars, columns, headers, footers.
- Join letter-spaced/kerned text ("K o r i n a" -> "Korina").
- candidateName must be the person's full name — NEVER a section heading, company, university, document title, or filename.
- Include EVERY education entry and EVERY work-experience entry.
- Copy dates/durations exactly as written.
- Missing fields: use "" or []. NEVER invent or guess values.
- Set extractedText and rawText to "" unless no raw text was provided, in which case transcribe the full document into extractedText.
- Output ONLY the JSON object. No markdown fences, no commentary.

JSON shape:
{"candidateName":"","extractedText":"","personal":{"fullName":"","email":"","mobile":"","presentAddress":"","permanentAddress":"","fatherName":"","motherName":"","dob":"","gender":"","maritalStatus":"","nationality":"","religion":"","nid":"","bloodGroup":"","emergencyContact":"","linkedinUrl":"","githubUrl":"","portfolioUrl":""},"employment":{"department":"","designation":"","workplace":"","joiningDate":"","employmentType":"","salaryScale":"","status":""},"education":[{"degree":"","institution":"","passingYear":"","board":"","major":"","result":"","duration":""}],"experience":[{"role":"","company":"","duration":"","isCurrent":false,"description":""}],"documents":[],"other":{"skills":[],"languages":[],"certifications":[],"projects":[],"achievements":[],"references":[],"careerObjective":"","professionalSummary":"","rawText":""}}`;
```

- [ ] **Step 2: Make the Anthropic branch PDF-native.** In `extractWithAgentRouter`, change default model to `claude-opus-5`, attach a `document` block for PDFs, cap `max_tokens` at 2500, and truncate the raw-text hint:

```typescript
const modelName = process.env.AGENTROUTER_MODEL || "claude-opus-5";
// inside the isClaudeModel branch:
const anthropicContent: any[] = [];
if (isImage) {
  anthropicContent.push({ type: "image", source: { type: "base64", media_type: mimeType, data: base64Data } });
} else if (mimeType === "application/pdf" && base64Data && base64Data.length < 6_000_000) {
  // Claude reads the PDF natively — layout, columns, and graphic text included.
  anthropicContent.push({ type: "document", source: { type: "base64", media_type: "application/pdf", data: base64Data } });
}
const textHint = (rawExtractedText || "").slice(0, 4000);
anthropicContent.push({
  type: "text",
  text: `${CV_EXTRACTION_PROMPT}\n\nRAW CV TEXT (machine-extracted, may be corrupted or incomplete — trust the document over this):\n${textHint}`,
});
// body: { model: modelName, max_tokens: 2500, messages: [...] }
```

- [ ] **Step 3: Manual env update** — `.env.local`: `AGENTROUTER_MODEL=claude-opus-5`; `.env.example`: same value as documented default.

- [ ] **Step 4: Verify** — `npm run type-check` passes; quick live check via a scratch script calling `extractCvWithAI` on `public/uploads/cvs/cv-1786140450701-1752_Black_Modern_Professional_Resume.pdf` returns `candidateName` "Lorna Alvarado" in well under 30s.

- [ ] **Step 5: Commit** — `git add lib/ai-provider.ts .env.example && git commit -m "feat: PDF-native Claude extraction with compact prompt (claude-opus-5)"`

---

### Task 3: Wire validation into save paths + "Needs Review" badge

**Files:**
- Modify: `app/api/cv/upload/route.ts` (after `findOrCreateEmployeeProfile` succeeds)
- Modify: `lib/cv-batch-processor.ts` (same point in the worker)
- Modify: `features/employees/EmployeeList.tsx` (status badge cell)

**Interfaces:**
- Consumes: `validateExtraction(structured, fileName)` from Task 1; `saveProfileToDb(profile)` from `lib/db-schema.ts`.
- Produces: profiles persisted with `status: "review_required"` when validation fails.

- [ ] **Step 1: Upload route** — import `validateExtraction` and `saveProfileToDb`; after `employeeProfile` is obtained:

```typescript
let extractionOk = true;
if (employeeProfile) {
  const validation = validateExtraction(structuredData || { candidateName }, file.name);
  extractionOk = validation.ok;
  if (!validation.ok) {
    console.warn(`Extraction flagged for review (${file.name}):`, validation.reasons.join("; "));
    employeeProfile.status = "review_required";
    employeeProfile.employmentDetails.currentStatus = "review_required";
    await saveProfileToDb(employeeProfile);
  }
}
```

Also include `extractionOk` in the JSON response record as `needsReview: !extractionOk`.

- [ ] **Step 2: Batch processor** — same block after its `findOrCreateEmployeeProfile` call, using `aiData` and `file.name`.

- [ ] **Step 3: EmployeeList badge** — extend the status cell so `review_required` renders a warning badge labeled "Needs Review":

```tsx
<Badge
  variant={
    item.status === "active" ? "success"
    : item.status === "processing" || item.status === "review_required" ? "warning"
    : "secondary"
  }
>
  {item.status === "active" ? "Active"
   : item.status === "processing" ? "Processing"
   : item.status === "review_required" ? "Needs Review"
   : "Pending"}
</Badge>
```

- [ ] **Step 4: Verify** — `npm run type-check` and `npm run lint` pass.

- [ ] **Step 5: Commit** — `git add app/api/cv/upload/route.ts lib/cv-batch-processor.ts features/employees/EmployeeList.tsx && git commit -m "feat: flag failed extractions as review_required instead of silent junk"`

---

### Task 4: Regression quality script

**Files:**
- Create: `scripts/test-extraction-quality.ts`

**Interfaces:**
- Consumes: `extractCvWithAI` from `lib/ai-provider.ts`; `extractTextFromPdf` from `lib/cv-batch-processor.ts`; sample PDFs `public/uploads/cvs/cv-1786225304633-2311_White_Black_Simple_Resume.pdf` (Korina, kerned) and `public/uploads/cvs/cv-1786140450701-1752_Black_Modern_Professional_Resume.pdf` (Lorna, name-as-graphic).
- Produces: exit 0 when all expectations pass, 1 otherwise.

- [ ] **Step 1: Write the script:**

```typescript
import fs from "fs";
import { extractCvWithAI } from "../lib/ai-provider";
import { extractTextFromPdf } from "../lib/cv-batch-processor";

const CASES = [
  {
    file: "public/uploads/cvs/cv-1786225304633-2311_White_Black_Simple_Resume.pdf",
    label: "Korina (kerned graphic template)",
    expect: { nameIncludes: "Korina", email: "hello@reallygreatsite.com", minEdu: 2, minExp: 1, minSkills: 3 },
  },
  {
    file: "public/uploads/cvs/cv-1786140450701-1752_Black_Modern_Professional_Resume.pdf",
    label: "Lorna (name drawn as graphic)",
    expect: { nameIncludes: "Lorna", email: "hello@reallygreatsite.com", minEdu: 1, minExp: 2, minSkills: 3 },
  },
];

let passed = 0, total = 0;
function assert(cond: boolean, name: string) {
  total++;
  if (cond) { passed++; console.log(`[PASS] ${name}`); }
  else console.error(`[FAIL] ${name}`);
}

async function main() {
  for (const c of CASES) {
    const buffer = fs.readFileSync(c.file);
    const text = await extractTextFromPdf(buffer);
    const start = Date.now();
    const r = await extractCvWithAI(buffer.toString("base64"), "application/pdf", text);
    const secs = Math.round((Date.now() - start) / 1000);
    console.log(`\n=== ${c.label} (${secs}s) ===`);
    assert(!!r, "extraction returned a result");
    if (!r) continue;
    assert((r.candidateName || "").includes(c.expect.nameIncludes), `name contains "${c.expect.nameIncludes}" (got "${r.candidateName}")`);
    assert((r.personal?.email || "") === c.expect.email, `email == ${c.expect.email} (got "${r.personal?.email}")`);
    assert((r.education?.length || 0) >= c.expect.minEdu, `education >= ${c.expect.minEdu} (got ${r.education?.length})`);
    assert((r.experience?.length || 0) >= c.expect.minExp, `experience >= ${c.expect.minExp} (got ${r.experience?.length})`);
    assert((r.other?.skills?.length || 0) >= c.expect.minSkills, `skills >= ${c.expect.minSkills} (got ${r.other?.skills?.length})`);
    assert(secs < 60, `completed in under 60s (took ${secs}s)`);
  }
  console.log(`\n${passed}/${total} PASSED`);
  process.exit(passed === total ? 0 : 1);
}
main();
```

- [ ] **Step 2: Run** — `npx -y tsx --env-file=.env.local scripts/test-extraction-quality.ts` → all pass. The Lorna name assertion is the key one: it can ONLY pass via the PDF-native path (name absent from text layer).

- [ ] **Step 3: Commit** — `git add scripts/test-extraction-quality.ts && git commit -m "test: extraction quality regression script for hard CV templates"`

---

### Task 5: End-to-end verification

**Files:** none new (scratch scripts only).

- [ ] **Step 1:** `npm run type-check`, `npm run lint`, `npx -y tsx scripts/test-extraction-validator.ts`, `npx -y tsx --env-file=.env.local scripts/verify-cv-system.ts` — all pass.
- [ ] **Step 2:** Start dev server; POST both sample PDFs to `/api/cv/upload`; assert response `needsReview` is falsy, correct names, and elapsed < 60s each.
- [ ] **Step 3:** Craft a junk PDF (valid header, meaningless words, no contact data) in scratch; upload it; assert the saved profile has `status === "review_required"` and the response has `needsReview: true`.
- [ ] **Step 4:** GET `/api/employees` — junk profile shows `review_required`; real profiles `active`.
- [ ] **Step 5:** Delete test profiles via `deleteEmployeeEverywhere`; remove scratch files; kill dev server; final commit of any remaining changes.
