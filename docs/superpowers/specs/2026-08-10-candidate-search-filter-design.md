# Candidate Search & Filter — Design

**Date:** 2026-08-10
**Status:** Approved (Approach A)

## Problem

AK Traders holds 3,000+ manpower records. Staff need to answer two kinds of question with equal
priority:

1. **Shortlisting** — "client needs 5 trained drivers, age 25–35, Comilla district" → filter, select, export.
2. **Browsing** — navigate the directory, open a profile, correct data.

Today neither works at scale. `app/api/employees/route.ts` pulls *every* row into Node memory with
`.limit(2000)` and filters in JavaScript, so ~1,000 of the 3,000 members are already invisible, and
the only filter is a single keyword box (`features/employees/EmployeeFilterBar.tsx`, 39 lines).

## Scope

All 16 filter groups from the requirement are in scope. They split into two classes:

| Class | Filters | Source |
| --- | --- | --- |
| **CV-derived** | Age, Gender, Education level + board, Profession, Department, Experience, Training, Location, Candidate ID, CV status | Normalized from `employees.cv_data` |
| **Operational** | Manpower category, Work type, Shift, Availability, Project, Government/Private | Admin-assigned; **no data source exists today** |

The operational class has no values in the database. It is populated by **bulk assignment from
search results** (select N rows → set project/shift/category in one action). Until an admin assigns
them, those six filters legitimately return zero rows. This was raised and accepted.

**Out of scope (YAGNI):** saved searches, shareable filter URLs, PDF shortlists.

## Approach

**Flat indexed columns on `employees`, filtered by Postgres.**

Normalization logic lives in TypeScript (deterministic, unit-testable, re-runnable at zero AI cost);
its output is persisted to flat, indexed columns so Postgres can do the filtering and counting.

Rejected alternatives:

- **Query `cv_data` jsonb directly** — cannot express the normalizations that matter (Alim → HSC,
  free-text address → district, dob → age); would need generated columns anyway, and the six
  operational fields need real columns regardless.
- **Keep in-memory filtering** — 3,000 rows × 10–50 KB jsonb is 30–150 MB per request on Vercel
  serverless, with approximate counts and the existing truncation bug intact.

## Data Model

### New columns on `public.employees`

All nullable. Derived columns are recomputed by the normalizer; operational columns are only ever
written by an admin action.

**Derived from CV**

| Column | Type | Values |
| --- | --- | --- |
| `gender` | text | `male` \| `female` \| `other` |
| `date_of_birth` | date | age is computed at query time, never stored |
| `education_level` | text | `below_ssc` \| `ssc` \| `hsc` \| `diploma` \| `bachelor` \| `masters` \| `other` |
| `education_board` | text | `general` \| `vocational` \| `madrasa` \| `technical` \| `equivalent` |
| `profession` | text | slug from the known-profession list, else `other` |
| `experience_years` | numeric(4,1) | derived from experience durations |
| `division` | text | one of 8 BD divisions |
| `district` | text | one of 64 BD districts |
| `is_trained` | boolean | |
| `training_types` | text[] | `driving` \| `safety` \| `technical` \| `computer` \| `other` |
| `cv_quality` | text | `good` \| `verified` \| `needs_review` \| `not_available` |
| `search_indexed_at` | timestamptz | staleness marker |

`department` and `designation` already exist and are reused.

**Operational (admin-assigned)**

| Column | Type | Values |
| --- | --- | --- |
| `manpower_category` | text | `contractual` \| `regular` \| `manpower` \| `young_manpower` \| `temporary` \| `part_time` \| `full_time` |
| `work_type` | text | `physical` \| `online` \| `hybrid` |
| `shift` | text | `day` \| `night` \| `morning` \| `evening` \| `rotational` \| `flexible` |
| `availability` | text | `active` \| `inactive` \| `available` \| `assigned` |
| `sector` | text | `government` \| `private` \| `ngo` \| `other` |
| `project_id` | text | FK → `projects.id`, null = unassigned |

### New table `public.projects`

`id text pk`, `name text not null`, `code text`, `sector text`, `is_active boolean default true`,
`created_at timestamptz default now()`.

### Indexes

B-tree on every filtered scalar column, GIN on `training_types`, and a composite
`(availability, profession, district)` for the common shortlisting path.

### Age

Stored as `date_of_birth`, filtered by date arithmetic so the index is usable and the value never
goes stale:

- `minAge` → `date_of_birth <= today - minAge years`
- `maxAge` → `date_of_birth > today - (maxAge + 1) years`

## Components

Each unit owns one job and one file set.

### `lib/candidate-normalizer.ts`

`normalizeProfile(profile: FullEmployeeProfile): CandidateSearchFields` — pure, total, never throws.
Anything unmappable becomes `null`; nothing is invented.

- **Gender** — `m`/`male`/`পুরুষ` → `male`; `f`/`female`/`মহিলা`/`নারী` → `female`.
- **DOB** — accepts `DD/MM/YYYY`, `DD-MM-YYYY`, `YYYY-MM-DD`, `15 Jan 1990`, `January 15, 1990`.
  Rejects implausible results (implied age < 14 or > 75) rather than storing them.
- **Education** — takes the *highest* qualification across all education records.
  Masters: `MA, MSc, MBA, MSS, MCom, MS, Masters, Kamil`.
  Bachelor: `BA, BSc, BBA, BSS, BCom, LLB, BTech, Honours, Hons, Fazil`.
  Diploma: `Diploma, Polytechnic`.
  HSC: `HSC, Higher Secondary, Intermediate, Alim, A-Level`.
  SSC: `SSC, Secondary, Matric, Dakhil, O-Level`.
  Below SSC: `JSC, JDC, PSC, Class 5–9, Primary`.
  Board: `madrasa` when the degree is Dakhil/Alim/Fazil/Kamil or the board string contains
  madrasa/madrasah; `vocational`, `technical` (incl. polytechnic), `equivalent` (O/A-Level, GED);
  otherwise `general`. This makes HSC → Alim and SSC → Dakhil filterable as one level with a
  distinguishing board, exactly as specified.
- **Profession** — keyword match of `designation` against the known list (driver, housekeeper,
  security_guard, cleaner, office_staff, technician, electrician, welder, cook, mason, plumber,
  carpenter, helper, supervisor); no match → `other`, raw designation preserved in its own column.
- **Experience** — the existing `deriveExperienceYears` logic, extracted from `lib/db-schema.ts`
  so it is testable and shared rather than duplicated.
- **Location** — matches all 64 district names plus common alternate spellings
  (Comilla/Cumilla, Jessore/Jashore, Barisal/Barishal, Chittagong/Chattogram, Bogra/Bogura)
  against `permanentAddress` first, then `presentAddress`. Division is looked up from the district.
- **Training** — keyword scan of `certifications`, `trainings`, and `skills`; a driving licence
  counts as `driving`.
- **CV quality** — `review_required` status → `needs_review`; a profile carrying name, phone,
  at least one education record and at least one experience record → `good`; no attached CV →
  `not_available`.

### `lib/candidate-query.ts`

Translates `CandidateSearchFilters` into a Supabase query. Filters are AND-ed across groups and
OR-ed within a group (`.in()`). Keyword searches name / employee id / phone / designation.
Pagination via `.range()`, total via `{ count: "exact" }`.

### API routes

| Route | Purpose |
| --- | --- |
| `GET /api/candidates/search` | filtered, paginated results + exact total |
| `GET /api/candidates/export` | same filters, all matching rows, CSV stream |
| `POST /api/candidates/bulk-assign` | set operational fields on selected ids |
| `POST /api/candidates/reindex` | recompute derived columns for all rows |
| `GET /api/projects` | project list for the filter and the assign modal |

### UI — `features/candidates/`

The existing `/employees` page is upgraded in place rather than duplicated, so there is one
directory and one source of truth. `EmployeeList.tsx` (397 lines, currently mixing list, filter bar,
two delete modals, CSV export and a drawer) is replaced by focused units:

- `CandidateSearchView.tsx` — orchestrator
- `CandidateFilterPanel.tsx` — the 16 filter groups; sidebar on desktop, drawer on mobile
- `CandidateResultTable.tsx` — table, selection, pagination
- `BulkAssignModal.tsx` — operational fields only
- `use-candidate-search.ts` — data fetching
- `stores/use-candidate-filter-store.ts` — filter state

Filter panel order follows the requirement mockup: Keyword, Age, Gender, Education, Job Category,
Profession, Department, Work Type, Shift, Training, Experience, CV Status, Employment Status,
Government/Private, Project, Location, then Search / Reset.

## Data Flow

1. CV upload → AI extraction → `saveProfileToDb` → **normalizer runs** → derived columns written
   alongside `cv_data` in the same upsert.
2. Backfill script normalizes all 3,000 existing rows once.
3. Search: UI filter state → query string → `/api/candidates/search` → `candidate-query` →
   Postgres → paginated rows + exact count.
4. Bulk assign: selected ids + operational values → `/api/candidates/bulk-assign` → single
   `update ... in (ids)` → results refetched.
5. Export: current filter state → `/api/candidates/export` → CSV of **all** matching rows, not just
   the visible page (the existing export only covers the current page — that is fixed here).

## Error Handling

- **Migration not applied** — the search API detects the missing columns and returns
  `{ success: false, code: "MIGRATION_REQUIRED" }`; the UI shows an actionable banner naming the SQL
  file instead of an empty table. The Supabase MCP connector is not authorized in this session, so
  the migration SQL is delivered as a file for the user to run.
- **DB unreachable** — explicit error state. Never a silently empty result list, and never the
  in-memory cache masquerading as live data (consistent with commit `6647a1d7`).
- **Normalizer** — total function, never throws; unmappable input yields `null`.
- **Bulk assign** — validates every field against its allowed value list server-side before writing;
  rejects the whole batch on an unknown value rather than writing partial garbage.

## Testing

The repo has no test runner; existing suites are plain TypeScript scripts using an
assert/PASS/FAIL convention (`scripts/test-extraction-validator.ts`), run with `npx tsx`. The new
suites follow that pattern:

- `scripts/test-candidate-normalizer.ts` — education mapping including Dakhil → SSC/madrasa and
  Alim → HSC/madrasa, district aliases, DOB formats, implausible-age rejection, experience
  derivation, gender variants, training detection, CV quality.
- `scripts/test-candidate-query.ts` — filter combinations produce the expected query shape; empty
  filters return an unconstrained query; age range converts to the correct date bounds.

Verification before the feature is called done: `npm run type-check`, `npm run build`, both test
scripts passing, and the page exercised in the browser preview.

## Migration & Rollout

1. Run `supabase/migrations/20260810_candidate_search.sql` in the Supabase SQL editor.
2. Run the backfill: `npx tsx scripts/backfill-search-index.ts`.
3. Operational columns stay null until staff bulk-assign them.
