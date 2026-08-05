# Dynamic CV Information Sorting Implementation Plan

> **For subagent workers:** REQUIRED SUB-SKILL: Use subagent-driven-development or dispatching-parallel-agents to execute these tasks in parallel.

**Goal:** Implement 100% dynamic AI sorting of CV information via Gemini API into database `cv_records` (`structured_data`), matching Employee Profile tabs (`Personal`, `Employment`, `Education`, `Experience`, `Documents`, `Other`) with **zero hardcoded fallback values**.

---

### Task 1: Update Gemini Extraction & Pure Local Fallback Engine (`lib/cv-batch-processor.ts` & `app/api/cv/upload/route.ts`)

**Target Files:**
- `lib/cv-batch-processor.ts`
- `app/api/cv/upload/route.ts`

**Steps:**
- [ ] Update Gemini AI prompt in `lib/cv-batch-processor.ts` and `upload/route.ts` to strictly sort out candidate details into the full JSON schema (`personal`, `employment`, `education`, `experience`, `documents`, `other`), returning `null` or `""` for missing fields.
- [ ] Remove all hardcoded fake fallbacks from `parseCvTextToStructure` in `lib/cv-batch-processor.ts` (e.g. `"Dhaka Office"`, `"Bachelor's Degree"`, `"2021"`, `"Previous Organization"`, `"+880 1700-000000"`). Extract only real regex matches from raw text.
- [ ] Ensure `structured_data` saved to Supabase contains clean, non-hardcoded JSON.

---

### Task 2: Remove Hardcoded Fallbacks in Profile UI & Employee Drawer (`app/(dashboard)/profile/page.tsx`, `features/employees/EmployeeDetailDrawer.tsx`, `app/api/employees/route.ts`)

**Target Files:**
- `app/(dashboard)/profile/page.tsx`
- `features/employees/EmployeeDetailDrawer.tsx`
- `app/api/employees/route.ts`

**Steps:**
- [ ] Clean `parseCVToJSON` in `app/(dashboard)/profile/page.tsx` to remove all synthetic education, experience, and skill generation logic.
- [ ] Update tab rendering in `profile/page.tsx` so missing fields show `"Not Provided in CV"` or empty arrays gracefully instead of fake data.
- [ ] Clean `parseCandidateDetails` in `app/api/employees/route.ts` to map real extracted JSON without hardcoded synthetic fallbacks.
- [ ] Clean `EmployeeDetailDrawer.tsx` to display real extracted skills & experience without synthetic fallbacks.

---

### Task 3: Verification & Multi-Agent Test Execution

**Steps:**
- [ ] Run `npm run type-check` to verify 0 TypeScript errors.
- [ ] Run test upload script and query `/api/employees` to verify 100% dynamic JSON extraction with zero hardcoded values.
