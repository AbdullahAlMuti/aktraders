# Employee Profile Tab Classification Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ensure candidate CV data extracted by AI models correctly unwraps and classifies into all 6 Employee Profile tabs (Personal Information, Employment Details, Educational Qualification, Work Experience, Attached Documents, Other Details) without fallback placeholders.

**Architecture:** Implement a recursive safe JSON unwrapper `safeParseStructuredJSON` that resolves single-stringified, double-stringified, or direct object JSON payloads from Supabase `cv_records` and maps them into the profile tabs across the UI and API endpoints.

**Tech Stack:** Next.js 14, React, TypeScript, Supabase, Tailwind CSS.

## Global Constraints

- Preserve all existing database schemas (`cv_records`).
- Zero hardcoded synthetic fallback values; unstated fields default gracefully to clean empty strings or empty arrays (`[]`).
- 100% type-checked with `npm run type-check`.

---

### Task 1: Recursive Safe JSON Unwrapper (`safeParseStructuredJSON`)

**Files:**
- Create: `lib/cv-json-unwrapper.ts`
- Test: `scratch/test-unwrapper.ts`

**Interfaces:**
- Consumes: Raw `structured_data` string or object from Supabase.
- Produces: `safeParseStructuredJSON(input: any): any` returning a fully parsed JavaScript object.

- [ ] **Step 1: Create `lib/cv-json-unwrapper.ts`**

```typescript
/**
 * Recursively unwraps single-stringified, double-stringified, or object JSON payloads.
 */
export function safeParseStructuredJSON(input: any): any {
  if (!input) return null;
  if (typeof input === "object") return input;
  if (typeof input === "string") {
    try {
      let parsed = JSON.parse(input);
      while (typeof parsed === "string") {
        parsed = JSON.parse(parsed);
      }
      return typeof parsed === "object" ? parsed : null;
    } catch (e) {
      return null;
    }
  }
  return null;
}
```

- [ ] **Step 2: Write test script `scratch/test-unwrapper.ts`**

```typescript
import { safeParseStructuredJSON } from "../lib/cv-json-unwrapper";

const testDoubleString = JSON.stringify(JSON.stringify({
  candidateName: "Korina Villanueva",
  personal: { fullName: "Korina Villanueva", email: "hello@reallygreatsite.com" }
}));

const result = safeParseStructuredJSON(testDoubleString);
console.assert(result.candidateName === "Korina Villanueva", "Double string JSON failed");
console.log("Unwrapper test PASS!");
```

- [ ] **Step 3: Run test script to verify**

Run: `npx tsx scratch/test-unwrapper.ts`
Expected: `Unwrapper test PASS!`

- [ ] **Step 4: Commit Task 1**

```bash
git add lib/cv-json-unwrapper.ts scratch/test-unwrapper.ts
git commit -m "feat: add safeParseStructuredJSON helper for multi-layer JSON unwrapping"
```

---

### Task 2: Update Profile Page, Drawer & API Route

**Files:**
- Modify: `app/(dashboard)/profile/page.tsx:110-189`
- Modify: `features/employees/EmployeeDetailDrawer.tsx:40-80`
- Modify: `app/api/employees/route.ts:10-30`

**Interfaces:**
- Consumes: `safeParseStructuredJSON` from `lib/cv-json-unwrapper`.
- Produces: Correctly classified profile state across all 6 profile tabs.

- [ ] **Step 1: Update `app/(dashboard)/profile/page.tsx`**

Import `safeParseStructuredJSON` and use it inside `parseCVToJSON`:

```typescript
import { safeParseStructuredJSON } from "@/lib/cv-json-unwrapper";

function parseCVToJSON(employee: Employee | null): StructuredCandidateJSON {
  const cvData = employee?.cvData || {};
  const text = cvData.extractedText || "";
  const structured = safeParseStructuredJSON(cvData.structuredData || cvData.structured_data);

  const name = structured?.personal?.fullName || structured?.candidateName || employee?.name || "Candidate Name";
  const email = structured?.personal?.email || (employee?.email && employee.email !== "N/A" ? employee.email : "Not Provided in CV");
  const phone = structured?.personal?.mobile || structured?.personal?.phone || (employee?.phone && employee.phone !== "N/A" ? employee.phone : "Not Provided in CV");
  const designation = structured?.employment?.designation || (employee?.designation && employee.designation !== "N/A" ? employee.designation : "Not Provided in CV");
  const department = structured?.employment?.department || (employee?.department && employee.department !== "N/A" ? employee.department : "Not Provided in CV");
  ...
```

- [ ] **Step 2: Update `features/employees/EmployeeDetailDrawer.tsx`**

Import `safeParseStructuredJSON` to parse candidate details when drawer is opened.

- [ ] **Step 3: Update `app/api/employees/route.ts`**

Update `parseCandidateDetails`:

```typescript
import { safeParseStructuredJSON } from "@/lib/cv-json-unwrapper";

function parseCandidateDetails(candidateName: string, text: string, rawStructuredData?: any) {
  const structured = safeParseStructuredJSON(rawStructuredData);
  ...
```

- [ ] **Step 4: Run type-check to verify zero errors**

Run: `npm run type-check`
Expected: `tsc --noEmit` exits with 0 errors.

- [ ] **Step 5: Commit Task 2**

```bash
git add app/\(dashboard\)/profile/page.tsx features/employees/EmployeeDetailDrawer.tsx app/api/employees/route.ts
git commit -m "fix: unwrap structured_data using safeParseStructuredJSON in profile page, drawer, and employee API"
```

---

### Task 3: Verification & Test Execution

**Files:**
- Test: `scratch/test-profile-data.ts`

- [ ] **Step 1: Write verification script to test real candidate profile parsing from database**

```typescript
import { safeParseStructuredJSON } from "../lib/cv-json-unwrapper";

// Simulate database fetch
const dbRecord = {
  candidate_name: "Korina Villanueva",
  structured_data: "{\"candidateName\":\"Korina Villanueva\",\"personal\":{\"fullName\":\"Korina Villanueva\",\"email\":\"hello@reallygreatsite.com\",\"mobile\":\"+123-456-7890\"},\"employment\":{\"department\":\"Sales & Marketing\",\"designation\":\"Marketing Manager\"}}"
};

const parsed = safeParseStructuredJSON(dbRecord.structured_data);
console.log("Parsed Name:", parsed.personal.fullName);
console.log("Parsed Email:", parsed.personal.email);
console.log("Parsed Mobile:", parsed.personal.mobile);
console.log("Parsed Designation:", parsed.employment.designation);
console.log("Parsed Department:", parsed.employment.department);
```

- [ ] **Step 2: Run verification script**

Run: `npx tsx scratch/test-profile-data.ts`
Expected: All candidate fields print cleanly without `undefined` or `null`.

- [ ] **Step 3: Run final type-check**

Run: `npm run type-check`
Expected: PASS (0 errors).
