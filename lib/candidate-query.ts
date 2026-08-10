import type { SupabaseClient } from "@supabase/supabase-js";
import { ALLOWED_VALUES } from "@/constants/candidate-filters";
import type {
  Availability,
  CvQuality,
  Division,
  EducationBoard,
  EducationLevel,
  Gender,
  ManpowerCategory,
  Profession,
  Sector,
  Shift,
  TrainingType,
  WorkType,
} from "@/constants/candidate-filters";
import { DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE, ageToDateBounds } from "@/lib/candidate-filter-params";
import type { CandidateSearchFilters, CandidateSearchRow, Project } from "@/types/candidate-search.types";

/**
 * Translates `CandidateSearchFilters` into a Supabase query on public.employees.
 *
 * Filters AND across groups and OR within a group (a group is one `.in()`), so
 * "driver or cleaner, in Cumilla" is two constraints, not four. Everything is
 * pushed down to Postgres — no row is ever filtered in Node.
 *
 * The builder is described here structurally rather than imported from
 * @supabase/postgrest-js so `scripts/test-candidate-query.ts` can assert the
 * query SHAPE against a hand-written fake, with no network and no mocking
 * library.
 */

/* ------------------------------------------------------------------ client */

export interface CandidateQueryResult {
  data: CandidateRow[] | null;
  error: SupabaseErrorish | null;
  count: number | null;
}

/** Post-filter stage: ordering, pagination, and awaiting the result. */
export interface CandidateTransformBuilder extends PromiseLike<CandidateQueryResult> {
  order(column: string, options?: { ascending?: boolean; nullsFirst?: boolean }): CandidateTransformBuilder;
  range(from: number, to: number): CandidateTransformBuilder;
}

/** Filter stage: every operator this module uses, and nothing it does not. */
export interface CandidateFilterBuilder extends CandidateTransformBuilder {
  eq(column: string, value: unknown): CandidateFilterBuilder;
  in(column: string, values: readonly unknown[]): CandidateFilterBuilder;
  gt(column: string, value: unknown): CandidateFilterBuilder;
  gte(column: string, value: unknown): CandidateFilterBuilder;
  lte(column: string, value: unknown): CandidateFilterBuilder;
  is(column: string, value: null): CandidateFilterBuilder;
  or(filters: string): CandidateFilterBuilder;
  overlaps(column: string, values: readonly unknown[]): CandidateFilterBuilder;
}

export interface CandidateQueryClient {
  /**
   * `select` is deliberately untyped. Matching PostgREST's deeply generic query
   * builder against `CandidateFilterBuilder` here exceeds TypeScript's
   * instantiation depth limit (TS2589); the result is narrowed to
   * `CandidateFilterBuilder` on the very next line of `buildCandidateQuery`,
   * so nothing downstream loses its types.
   */
  from(table: string): {
    select(columns: string, options?: { count?: "exact" }): any;
  };
}

/** A raw `employees` row. Treated as untrusted input and mapped defensively. */
export type CandidateRow = Record<string, unknown>;

export interface SupabaseErrorish {
  code?: string;
  message?: string;
}

/* --------------------------------------------------------------- constants */

/**
 * Everything the result table needs — and deliberately not `cv_data`. Pulling
 * the 10–50 KB jsonb for every row is exactly the cost this feature exists to
 * remove.
 */
export const CANDIDATE_SELECT_COLUMNS = [
  "id",
  "name",
  "email",
  "phone",
  "department",
  "designation",
  "status",
  "avatar_url",
  "created_at",
  "gender",
  "date_of_birth",
  "education_level",
  "education_board",
  "profession",
  "profession_raw",
  "experience_years",
  "division",
  "district",
  "is_trained",
  "training_types",
  "cv_quality",
  "manpower_category",
  "work_type",
  "shift",
  "availability",
  "sector",
  "project_id",
].join(", ");

export const PROJECT_SELECT_COLUMNS = "id, name, code, sector, is_active";

/** The migration file that has to be applied before any of this works. */
export const MIGRATION_FILE = "supabase/migrations/20260810_candidate_search.sql";

export const MIGRATION_REQUIRED_MESSAGE =
  `Candidate search columns are missing from public.employees. Run ${MIGRATION_FILE} in the ` +
  "Supabase SQL editor, then run `npx -y tsx --env-file=.env.local scripts/backfill-search-index.ts --apply`.";

/** Columns added by that migration — used to recognise its absence in an error message. */
const MIGRATION_COLUMNS = [
  "gender",
  "date_of_birth",
  "education_level",
  "education_board",
  "profession",
  "profession_raw",
  "experience_years",
  "division",
  "district",
  "is_trained",
  "training_types",
  "cv_quality",
  "manpower_category",
  "work_type",
  "shift",
  "availability",
  "sector",
  "project_id",
  "search_indexed_at",
];

const KEYWORD_COLUMNS = ["name", "id", "phone", "designation", "profession_raw"];

/**
 * Soft-deleted rows carry `cv_data.deleted === true` — see
 * `deleteEmployeeEverywhere` in lib/db-schema.ts and the `profile.deleted` drop
 * in app/api/employees/route.ts. `NOT (x = 'true')` evaluates to NULL, and so
 * to "no", for every row that has no flag at all, which is most of them; the
 * null case therefore has to be spelled out.
 */
const NOT_DELETED = "cv_data->>deleted.is.null,cv_data->>deleted.neq.true";

/** Filter key → column, for the groups that are a plain `.in()`. */
const IN_FILTERS = [
  ["gender", "gender"],
  ["educationLevel", "education_level"],
  ["educationBoard", "education_board"],
  ["manpowerCategory", "manpower_category"],
  ["profession", "profession"],
  ["department", "department"],
  ["workType", "work_type"],
  ["shift", "shift"],
  ["cvQuality", "cv_quality"],
  ["availability", "availability"],
  ["sector", "sector"],
  ["division", "division"],
  ["district", "district"],
] as const satisfies ReadonlyArray<readonly [keyof CandidateSearchFilters, string]>;

/* ----------------------------------------------------------------- helpers */

function text(value: unknown): string {
  if (typeof value === "string") return value.trim();
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  return "";
}

function num(value: unknown): number | null {
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  // PostgREST can serialise `numeric` as a string depending on the driver.
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

/** Keeps a stored value only when it is still a member of its option list. */
function pick<T extends string>(value: unknown, allowed: ReadonlySet<string>): T | null {
  const v = text(value);
  return v !== "" && allowed.has(v) ? (v as T) : null;
}

function isoDate(value: unknown): string | null {
  const match = text(value).match(/^(\d{4})-(\d{2})-(\d{2})/);
  return match ? `${match[1]}-${match[2]}-${match[3]}` : null;
}

/**
 * Quotes a value for a PostgREST logic expression.
 *
 * Inside `or=(...)` a comma separates conditions and a parenthesis closes the
 * group, so an unescaped comma in a keyword silently turns one condition into
 * several bogus ones. Double quotes make the value literal; a quote or
 * backslash inside it is escaped with a backslash.
 */
export function quoteOrValue(value: string): string {
  return `"${value.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
}

/**
 * Distinguishes "the migration has not been applied" from every other DB
 * failure. Mirrors the check in scripts/backfill-search-index.ts.
 */
export function isMissingColumnError(error: SupabaseErrorish | null | undefined): boolean {
  if (!error) return false;
  const code = error.code || "";
  const message = error.message || "";
  if (code === "42703" || code === "PGRST204") return true; // undefined column / not in schema cache
  if (/column .+ does not exist/i.test(message) || /could not find the .+ column/i.test(message)) return true;
  // Fallback: some responses only name the column and the complaint.
  const lower = message.toLowerCase();
  return (
    /does not exist|schema cache|unknown column|unrecognized column/i.test(message) &&
    MIGRATION_COLUMNS.some((column) => lower.includes(column))
  );
}

/**
 * True when the requested page starts past the end of the result set.
 *
 * PostgREST only reports this at all when an exact count was asked for: with a
 * count it answers 416 as soon as the range offset exceeds the total, without
 * one it answers 200 and an empty list. So a page that was valid a moment ago
 * turns into an error the instant enough rows behind it are deleted — which is
 * an empty page, not a database failure.
 */
export function isRangeNotSatisfiableError(error: SupabaseErrorish | null | undefined): boolean {
  if (!error) return false;
  if (error.code === "PGRST103") return true;
  return /range not satisfiable/i.test(error.message || "");
}

/** True when the named relation has not been created yet. */
export function isMissingTableError(error: SupabaseErrorish | null | undefined, table: string): boolean {
  if (!error) return false;
  const code = error.code || "";
  const message = error.message || "";
  if (code === "42P01" || code === "PGRST205") return true; // undefined table / not in schema cache
  return (
    message.toLowerCase().includes(table) &&
    /does not exist|could not find|schema cache/i.test(message)
  );
}

/* ----------------------------------------------------------------- builder */

/**
 * Applies every filter to a fresh query on public.employees.
 *
 * @param opts.count     request an exact total alongside the page
 * @param opts.selectAll skip `.range()` — the export pages the query itself
 */
export function buildCandidateQuery(
  client: CandidateQueryClient,
  filters: CandidateSearchFilters,
  opts: { count?: boolean; selectAll?: boolean } = {}
): CandidateTransformBuilder {
  let query: CandidateFilterBuilder = client
    .from("employees")
    .select(CANDIDATE_SELECT_COLUMNS, opts.count ? { count: "exact" } : undefined);

  query = query.or(NOT_DELETED);

  if (filters.keyword) {
    const pattern = quoteOrValue(`%${filters.keyword.trim()}%`);
    query = query.or(KEYWORD_COLUMNS.map((column) => `${column}.ilike.${pattern}`).join(","));
  }

  // Age is stored as a date so the index stays usable and the value never goes stale.
  const { dobMax, dobMin } = ageToDateBounds(filters.minAge, filters.maxAge, new Date());
  if (dobMax) query = query.lte("date_of_birth", dobMax);
  if (dobMin) query = query.gt("date_of_birth", dobMin);

  for (const [key, column] of IN_FILTERS) {
    const values = filters[key] as string[] | undefined;
    if (Array.isArray(values) && values.length > 0) query = query.in(column, values);
  }

  if (typeof filters.minExperience === "number") query = query.gte("experience_years", filters.minExperience);
  if (typeof filters.maxExperience === "number") query = query.lte("experience_years", filters.maxExperience);

  if (typeof filters.isTrained === "boolean") query = query.eq("is_trained", filters.isTrained);

  if (Array.isArray(filters.trainingTypes) && filters.trainingTypes.length > 0) {
    query = query.overlaps("training_types", filters.trainingTypes);
  }

  // "Project A, project B, or nobody's project" is one OR group, not two ANDs.
  const projectIds = Array.isArray(filters.projectId) ? filters.projectId : [];
  if (projectIds.length > 0 && filters.unassignedProject) {
    const list = projectIds.map(quoteOrValue).join(",");
    query = query.or(`project_id.in.(${list}),project_id.is.null`);
  } else if (projectIds.length > 0) {
    query = query.in("project_id", projectIds);
  } else if (filters.unassignedProject) {
    query = query.is("project_id", null);
  }

  // Nulls last in both directions: a candidate with no recorded experience is
  // not the most experienced one.
  const sortBy = filters.sortBy ?? "created_at";
  const ascending = filters.sortDir === "asc";
  let ordered: CandidateTransformBuilder = query
    .order(sortBy, { ascending, nullsFirst: false })
    .order("id", { ascending: true }); // stable tiebreak, so page 2 never repeats page 1

  if (!opts.selectAll) {
    const limit = Math.min(Math.max(filters.limit ?? DEFAULT_PAGE_SIZE, 1), MAX_PAGE_SIZE);
    const page = Math.max(filters.page ?? 1, 1);
    const from = (page - 1) * limit;
    ordered = ordered.range(from, from + limit - 1);
  }

  return ordered;
}

/* --------------------------------------------------------------- row mapper */

/** Age today, or null when the date of birth is unknown or unusable. */
export function ageFromDateOfBirth(dateOfBirth: string | null, today: Date = new Date()): number | null {
  if (!dateOfBirth) return null;
  const [year, month, day] = dateOfBirth.split("-").map(Number);
  if (!year || !month || !day) return null;

  let age = today.getUTCFullYear() - year;
  const monthDiff = today.getUTCMonth() + 1 - month;
  if (monthDiff < 0 || (monthDiff === 0 && today.getUTCDate() < day)) age -= 1;

  return age >= 0 && age <= 120 ? age : null;
}

/** Flattens an `employees` row into the small, flat row the table renders. */
export function rowToSearchRow(row: CandidateRow, projectsById?: ReadonlyMap<string, Project>): CandidateSearchRow {
  const dateOfBirth = isoDate(row.date_of_birth);
  const projectId = text(row.project_id) || null;
  const project = projectId ? projectsById?.get(projectId) : undefined;

  return {
    id: text(row.id),
    employeeId: text(row.id),
    name: text(row.name),
    email: text(row.email),
    phone: text(row.phone),
    avatarUrl: text(row.avatar_url) || null,
    department: text(row.department),
    designation: text(row.designation),
    status: text(row.status) || "active",

    gender: pick<Gender>(row.gender, ALLOWED_VALUES.gender),
    dateOfBirth,
    age: ageFromDateOfBirth(dateOfBirth),
    educationLevel: pick<EducationLevel>(row.education_level, ALLOWED_VALUES.education_level),
    educationBoard: pick<EducationBoard>(row.education_board, ALLOWED_VALUES.education_board),
    profession: pick<Profession>(row.profession, ALLOWED_VALUES.profession),
    experienceYears: num(row.experience_years),
    division: pick<Division>(row.division, ALLOWED_VALUES.division),
    district: pick<string>(row.district, ALLOWED_VALUES.district),
    isTrained: typeof row.is_trained === "boolean" ? row.is_trained : null,
    trainingTypes: Array.isArray(row.training_types)
      ? (row.training_types.filter((t): t is TrainingType => ALLOWED_VALUES.training_types.has(text(t))) as TrainingType[])
      : null,
    cvQuality: pick<CvQuality>(row.cv_quality, ALLOWED_VALUES.cv_quality),

    manpowerCategory: pick<ManpowerCategory>(row.manpower_category, ALLOWED_VALUES.manpower_category),
    workType: pick<WorkType>(row.work_type, ALLOWED_VALUES.work_type),
    shift: pick<Shift>(row.shift, ALLOWED_VALUES.shift),
    availability: pick<Availability>(row.availability, ALLOWED_VALUES.availability),
    sector: pick<Sector>(row.sector, ALLOWED_VALUES.sector),
    projectId,
    projectName: project?.name ?? null,
  };
}

/* -------------------------------------------------------------- projects */

export function projectFromRow(row: CandidateRow): Project {
  return {
    id: text(row.id),
    name: text(row.name),
    code: text(row.code) || null,
    sector: pick<Sector>(row.sector, ALLOWED_VALUES.sector),
    isActive: row.is_active !== false,
  };
}

/**
 * Project lookup for labelling result rows. Returns an empty map when the
 * projects table does not exist yet or cannot be read — a missing label must
 * never be the reason a search fails.
 */
export async function loadProjectsById(client: SupabaseClient): Promise<Map<string, Project>> {
  const byId = new Map<string, Project>();
  try {
    const { data, error } = await client.from("projects").select(PROJECT_SELECT_COLUMNS);
    if (error) {
      if (!isMissingTableError(error, "projects")) console.warn("loadProjectsById warning:", error.message);
      return byId;
    }
    for (const row of (data || []) as CandidateRow[]) {
      const project = projectFromRow(row);
      if (project.id) byId.set(project.id, project);
    }
  } catch (e: any) {
    console.warn("loadProjectsById error:", e?.message || e);
  }
  return byId;
}
