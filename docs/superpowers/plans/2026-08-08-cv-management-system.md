# AI-Powered CV Management & Employee Profile System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a complete AI-Powered CV Parsing, Employee Profile & Intelligent Search System supporting single/bulk uploads, automated AI structured extraction across 6 tabs, candidate photo extraction, stable identifiers (`EMP-`, `APP-`, `CV-`), deduplication, and multi-identifier search.

**Architecture:** Next.js 14 App Router + Supabase PostgreSQL + Multi-Provider AI (AgentRouter / Gemini / TokenRouter) + Local Photo Extractor + Feature-Sliced Frontend components.

**Tech Stack:** Next.js 14.2.15, TypeScript, Supabase SSR, `@google/generative-ai`, Tailwind CSS, Lucide React, Zod, Zustand, React Query.

## Global Constraints
- Preserve existing working code in `app/(dashboard)`, `components/ui`, `services`, `lib`.
- Use TypeScript strict type safety without `@ts-ignore` hacks.
- Store file references & metadata in database; save candidate photo files to `public/uploads/photos/`.
- Ensure all 6 required profile tabs (`Personal Information`, `Employment Details`, `Educational Qualification`, `Work Experience`, `Attached Documents`, `Other Details`) are fully implemented and editable.

---

### Task 1: Database Schema & Entity Persistence Layer

**Files:**
- Create: `lib/db-schema.ts`
- Modify: `types/employee.types.ts`
- Modify: `types/cv.types.ts`
- Test: `scripts/test-db-schema.ts`

**Interfaces:**
- Consumes: Supabase client from `@/utils/supabase/client` & `@/utils/supabase/server`
- Produces: `EmployeeProfileEntity`, `CVRecordEntity`, `EducationRecordEntity`, `ExperienceRecordEntity`, `AttachedDocumentEntity`, `ProfileDetailsEntity`

- [ ] **Step 1: Write TypeScript interface definitions for 6 tabs and entities**
- [ ] **Step 2: Implement table initialization & fallback store in `lib/db-schema.ts`**
- [ ] **Step 3: Run `npx tsx scripts/test-db-schema.ts` to verify entity creation**
- [ ] **Step 4: Commit schema changes**

---

### Task 2: Candidate Deduplication & Stable Identifier System

**Files:**
- Create: `lib/employee-deduplication.ts`
- Test: `scripts/test-deduplication.ts`

**Interfaces:**
- Consumes: Structured AI data and raw text
- Produces: `generateEmployeeId()`, `generateApplicantId()`, `generateCvNumber()`, `findOrCreateEmployeeProfile()`

- [ ] **Step 1: Implement stable identifier generators (`EMP-XXXXXX`, `APP-XXXXXX`, `CV-XXXXXX`)**
- [ ] **Step 2: Implement matching hierarchy (Email -> Phone -> Name+DOB)**
- [ ] **Step 3: Write unit test in `scripts/test-deduplication.ts` verifying duplicate detection**
- [ ] **Step 4: Commit deduplication module**

---

### Task 3: Profile Photo Extraction Engine

**Files:**
- Create: `lib/cv-photo-extractor.ts`
- Test: `scripts/test-photo-extraction.ts`

**Interfaces:**
- Consumes: File buffer & MIME type
- Produces: `extractCandidatePhoto(buffer, mimeType, fileName, employeeId)` -> returns saved `avatarUrl` or null

- [ ] **Step 1: Implement PDF/Image buffer photo detection & aspect ratio heuristic**
- [ ] **Step 2: Save extracted image to `public/uploads/photos/${employeeId}_avatar.png`**
- [ ] **Step 3: Write test verifying candidate photo extraction**
- [ ] **Step 4: Commit photo extraction engine**

---

### Task 4: AI Extraction Pipeline & 6-Tab Schema Mapping

**Files:**
- Modify: `lib/ai-provider.ts`
- Modify: `app/api/cv/upload/route.ts`
- Modify: `app/api/cv/upload-bulk/route.ts`
- Test: `scripts/test-ai-schema.ts`

**Interfaces:**
- Consumes: Uploaded file buffer, Base64 data, AI provider config
- Produces: Validated JSON matching all 6 tabs schema

- [ ] **Step 1: Update AI prompts and JSON schema in `lib/ai-provider.ts` for all 6 tabs**
- [ ] **Step 2: Connect single & bulk upload routes to photo extraction & deduplication engine**
- [ ] **Step 3: Test AI extraction pipeline with sample CV file**
- [ ] **Step 4: Commit AI pipeline updates**

---

### Task 5: Backend API Routes for Multi-Identifier Search & Profile Editing

**Files:**
- Modify: `app/api/employees/route.ts`
- Create: `app/api/employees/[id]/route.ts`
- Test: `scripts/test-employee-apis.ts`

**Interfaces:**
- Consumes: HTTP GET / PUT / DELETE requests
- Produces: Multi-identifier search results (`Name`, `EMP-`, `APP-`, `CV-`, `Email`, `Phone`, `Skill`) and 6-tab profile JSON

- [ ] **Step 1: Implement multi-identifier search SQL/query logic in `app/api/employees/route.ts`**
- [ ] **Step 2: Implement `GET`, `PUT`, and `DELETE` in `app/api/employees/[id]/route.ts`**
- [ ] **Step 3: Test multi-identifier search and profile update endpoints**
- [ ] **Step 4: Commit employee API routes**

---

### Task 6: Frontend 6-Tab Employee Profile & Search UI

**Files:**
- Create: `features/employees/EmployeeProfileView.tsx`
- Modify: `app/(dashboard)/employees/[id]/page.tsx`
- Modify: `features/employees/EmployeeList.tsx`
- Modify: `features/cv-upload/CVUploadWizard.tsx`

**Interfaces:**
- Consumes: `/api/employees`, `/api/employees/[id]`, `/api/cv/upload`
- Produces: Responsive 6-tab Employee Profile view with manual editing and multi-identifier search UI

- [ ] **Step 1: Build `EmployeeProfileView.tsx` rendering all 6 tabs cleanly with editable fields**
- [ ] **Step 2: Connect `/employees/[id]` route to fetch and update employee profiles**
- [ ] **Step 3: Update `EmployeeList.tsx` with instant multi-identifier search input**
- [ ] **Step 4: Commit frontend UI components**

---

### Task 7: Comprehensive Verification & Acceptance Testing

**Files:**
- Create: `scripts/verify-cv-system.ts`

- [ ] **Step 1: Execute complete end-to-end verification script testing upload, AI parsing, photo extraction, deduplication, 6-tab persistence, and multi-identifier search**
- [ ] **Step 2: Run `npm run type-check` and `npm run lint`**
- [ ] **Step 3: Commit final system verification**
