# Bulk CV Extraction Accuracy & Local Fallback Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ensure 100% data extraction accuracy for Bulk CV uploads by creating a robust local text-structure parser fallback (`parseCvTextToStructure`), aligning the Gemini AI prompt schema, and guaranteeing rich `structured_data` in Supabase for all candidate profiles.

**Architecture:** 
1. **Local Heuristic Parser (`lib/cv-batch-processor.ts`)**: Implement `parseCvTextToStructure(text: string, fileName: string)` to extract candidate full name, email, phone, location, department, designation, education, experience, and skills array using regex & NLP keyword matching.
2. **Gemini AI Upgrade**: Upgrade `extractWithGeminiFallback` with rich JSON prompt matching `upload/route.ts` and updated model names (`gemini-1.5-flash`, `gemini-2.0-flash-exp`, `gemini-1.5-pro`, `gemini-1.0-pro`).
3. **Guaranteed Data Persistence**: In `processCvBatch()`, automatically use `parseCvTextToStructure()` whenever Gemini returns `null` or 429 quota limit, guaranteeing `structured_data` is always populated in `cv_records`.

**Tech Stack:** Next.js 14 App Router, TypeScript, `@google/generative-ai`, `pdf2json`, Supabase Client (`public.cv_records`).

## Global Constraints

- Never allow `structured_data` to be `null` in Supabase `cv_records`.
- Maintain strict TypeScript type compatibility for `BatchJob` and `BatchItemStatus`.

---

### Task 1: Implement Local Text Structure Parser & Upgrade Gemini Prompt (`lib/cv-batch-processor.ts`)

**Files:**
- Modify: `lib/cv-batch-processor.ts`

- [ ] **Step 1: Add `parseCvTextToStructure` heuristic function**

Implement email, phone, candidate name, department, designation, skills, and section extraction.

- [ ] **Step 2: Update `extractWithGeminiFallback` prompt & models**

Use rich JSON prompt and fallback model list.

- [ ] **Step 3: Update `processCvBatch` worker to guarantee `structured_data` persistence**

Ensure `aiData = (await extractWithGeminiFallback(...)) || parseCvTextToStructure(text, file.name)`.

- [ ] **Step 4: Verify TypeScript compilation**

Run: `npm run type-check`
Expected: PASS (0 errors).
