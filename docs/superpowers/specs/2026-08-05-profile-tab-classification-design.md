# Design Specification: Multi-Layer JSON Unwrapping for Employee Profile Tabs

## Problem Analysis

### Root Cause
When candidate CVs are processed and saved to Supabase, `structured_data` is stored as a stringified JSON string (or double-escaped JSON string in certain DB serialization paths).

When the Employee Profile page (`/profile?id=...`), Employee Drawer (`EmployeeDetailDrawer.tsx`), or API routes (`/api/employees`) load the employee record:
1. The code attempts a single `JSON.parse(cvData.structuredData)` pass.
2. For double-stringified records, a single `JSON.parse` returns a `string` (e.g. `"{\"candidateName\": ...}"`) rather than a parsed `object`.
3. Since `typeof structured === "string"`, property accessors like `structured?.personal?.fullName`, `structured?.education`, and `structured?.employment` fail silently and evaluate to `undefined`.
4. As a result, all Employee Profile tabs fall back to "Not Provided in CV" or empty state displays, even though valid JSON data exists inside the database column.

---

## Proposed Approaches

### Approach 1: Recursive Safe JSON Unwrapper Helper (Recommended)
Implement a universal helper `safeParseStructuredJSON(input: any)` in `lib/utils.ts` (or `lib/cv-batch-processor.ts`) that recursively unwraps stringified JSON until a valid object is produced. Use this helper across `profile/page.tsx`, `EmployeeDetailDrawer.tsx`, and `/api/employees/route.ts`.

- **Pros**: 100% resilient. Fixes existing records in Supabase, newly uploaded records, double-escaped strings, and direct object payloads without requiring database migrations.
- **Cons**: Minor runtime parsing helper check (microsecond execution).

### Approach 2: Database Re-sync Migration Script
Run a Supabase database migration script to re-serialize all existing `structured_data` columns as native `jsonb` or single-stringified JSON.

- **Pros**: Clean database column formatting.
- **Cons**: Does not prevent future double-stringification if third-party APIs or client uploads send stringified JSON payloads.

---

## Recommended Solution: Approach 1

### 1. Robust Unwrapping Helper (`lib/utils.ts` or `lib/cv-batch-processor.ts`)
```ts
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

### 2. Comprehensive Field Normalization & Schema Mapping
Map all variant field keys (`personal_information`, `personal`, `education_qualification`, `education`, `work_experience`, `experience`, `skills`, `documents`) gracefully so any AI model output (OpenAI, TokenRouter, Gemini, DeepSeek) maps correctly to the 6 profile tabs:
- **Personal Information**: `fullName`, `fatherName`, `motherName`, `dob`, `gender`, `maritalStatus`, `nationality`, `religion`, `nid`, `bloodGroup`, `mobile`, `email`, `presentAddress`, `permanentAddress`, `emergencyContact`.
- **Employment Details**: `department`, `designation`, `workplace`, `joiningDate`, `employmentType`, `salaryScale`, `status`.
- **Educational Qualification**: `degree`, `institution`, `passingYear`, `board`, `major`, `result`.
- **Work Experience**: `role`, `company`, `duration`, `isCurrent`, `description`.
- **Attached Documents**: `name`, `size`, `type`, `url`.
- **Other Details**: `skills` array & `rawText`.

---

## Verification Plan

### Automated Verification
- Run `scratch/test-json-unwrapper.ts` with single and double-stringified JSON test payloads to verify 100% field extraction.
- Run `npm run type-check` for zero TypeScript errors.

### Manual Verification
- Open [http://localhost:3000/profile?id=cv-1785888905119-5754](http://localhost:3000/profile?id=cv-1785888905119-5754).
- Switch through all 6 tabs (**Personal Information**, **Employment Details**, **Educational Qualification**, **Work Experience**, **Attached Documents**, **Other Details**) to verify active field classification.
