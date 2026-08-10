import type { CandidateSearchFilters, CandidateSortField } from "@/types/candidate-search.types";
import { ALLOWED_VALUES } from "@/constants/candidate-filters";

/**
 * The single definition of the candidate-search wire format.
 *
 * The client serializes filters with `serializeFilters` and the API parses them
 * back with `parseFilters`. Keeping both directions in one module is what stops
 * the query string from drifting between caller and route.
 *
 * Arrays are comma-separated. Unknown or malformed values are dropped rather
 * than rejected, so a stale bookmark degrades to a broader search instead of an
 * error.
 */

const ARRAY_KEYS = [
  ["gender", "gender"],
  ["educationLevel", "education_level"],
  ["educationBoard", "education_board"],
  ["manpowerCategory", "manpower_category"],
  ["profession", "profession"],
  ["department", "department"],
  ["workType", "work_type"],
  ["shift", "shift"],
  ["trainingTypes", "training_types"],
  ["cvQuality", "cv_quality"],
  ["availability", "availability"],
  ["sector", "sector"],
  ["division", "division"],
  ["district", "district"],
] as const satisfies ReadonlyArray<readonly [keyof CandidateSearchFilters, keyof typeof ALLOWED_VALUES]>;

/** projectId is free-form (project ids are data, not an enum), so it validates separately. */
const NUMBER_KEYS = ["minAge", "maxAge", "minExperience", "maxExperience", "page", "limit"] as const;

const SORT_FIELDS: readonly CandidateSortField[] = ["name", "created_at", "experience_years", "date_of_birth"];

export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

export function serializeFilters(filters: CandidateSearchFilters): URLSearchParams {
  const params = new URLSearchParams();

  if (filters.keyword?.trim()) params.set("keyword", filters.keyword.trim());

  for (const key of NUMBER_KEYS) {
    const value = filters[key];
    if (typeof value === "number" && Number.isFinite(value)) params.set(key, String(value));
  }

  for (const [key] of ARRAY_KEYS) {
    const value = filters[key] as string[] | undefined;
    if (Array.isArray(value) && value.length > 0) params.set(key, value.join(","));
  }

  if (Array.isArray(filters.projectId) && filters.projectId.length > 0) {
    params.set("projectId", filters.projectId.join(","));
  }
  if (filters.unassignedProject) params.set("unassignedProject", "true");
  if (typeof filters.isTrained === "boolean") params.set("isTrained", String(filters.isTrained));
  if (filters.sortBy) params.set("sortBy", filters.sortBy);
  if (filters.sortDir) params.set("sortDir", filters.sortDir);

  return params;
}

function readNumber(raw: string | null, { min, max }: { min: number; max: number }): number | undefined {
  if (raw === null || raw.trim() === "") return undefined;
  const n = Number(raw);
  if (!Number.isFinite(n)) return undefined;
  const rounded = Math.round(n);
  if (rounded < min || rounded > max) return undefined;
  return rounded;
}

function readEnumArray(raw: string | null, allowed: ReadonlySet<string>): string[] | undefined {
  if (!raw) return undefined;
  const values = raw
    .split(",")
    .map((v) => v.trim().toLowerCase())
    .filter((v) => allowed.has(v));
  const unique = Array.from(new Set(values));
  return unique.length > 0 ? unique : undefined;
}

export function parseFilters(searchParams: URLSearchParams): CandidateSearchFilters {
  const filters: CandidateSearchFilters = {};

  const keyword = searchParams.get("keyword")?.trim();
  if (keyword) filters.keyword = keyword.slice(0, 120);

  filters.minAge = readNumber(searchParams.get("minAge"), { min: 0, max: 120 });
  filters.maxAge = readNumber(searchParams.get("maxAge"), { min: 0, max: 120 });
  filters.minExperience = readNumber(searchParams.get("minExperience"), { min: 0, max: 60 });
  filters.maxExperience = readNumber(searchParams.get("maxExperience"), { min: 0, max: 60 });

  // A reversed range is a user slip, not a reason to return nothing.
  if (filters.minAge !== undefined && filters.maxAge !== undefined && filters.minAge > filters.maxAge) {
    [filters.minAge, filters.maxAge] = [filters.maxAge, filters.minAge];
  }
  if (
    filters.minExperience !== undefined &&
    filters.maxExperience !== undefined &&
    filters.minExperience > filters.maxExperience
  ) {
    [filters.minExperience, filters.maxExperience] = [filters.maxExperience, filters.minExperience];
  }

  for (const [key, allowedKey] of ARRAY_KEYS) {
    const parsed = readEnumArray(searchParams.get(key), ALLOWED_VALUES[allowedKey]);
    if (parsed) (filters as Record<string, unknown>)[key] = parsed;
  }

  const projectId = searchParams.get("projectId");
  if (projectId) {
    const ids = projectId
      .split(",")
      .map((v) => v.trim())
      .filter(Boolean)
      .slice(0, 50);
    if (ids.length > 0) filters.projectId = ids;
  }
  if (searchParams.get("unassignedProject") === "true") filters.unassignedProject = true;

  const isTrained = searchParams.get("isTrained");
  if (isTrained === "true") filters.isTrained = true;
  else if (isTrained === "false") filters.isTrained = false;

  const sortBy = searchParams.get("sortBy") as CandidateSortField | null;
  if (sortBy && SORT_FIELDS.includes(sortBy)) filters.sortBy = sortBy;
  filters.sortDir = searchParams.get("sortDir") === "asc" ? "asc" : "desc";

  filters.page = readNumber(searchParams.get("page"), { min: 1, max: 100000 }) ?? 1;
  filters.limit = Math.min(
    readNumber(searchParams.get("limit"), { min: 1, max: MAX_PAGE_SIZE }) ?? DEFAULT_PAGE_SIZE,
    MAX_PAGE_SIZE
  );

  return filters;
}

/** Number of user-visible constraints, for the "N filters active" badge. */
export function countActiveFilters(filters: CandidateSearchFilters): number {
  let count = 0;
  if (filters.keyword?.trim()) count++;
  if (filters.minAge !== undefined || filters.maxAge !== undefined) count++;
  if (filters.minExperience !== undefined || filters.maxExperience !== undefined) count++;
  if (typeof filters.isTrained === "boolean") count++;
  if (filters.unassignedProject) count++;
  for (const [key] of ARRAY_KEYS) {
    const value = filters[key] as string[] | undefined;
    if (Array.isArray(value) && value.length > 0) count++;
  }
  if (Array.isArray(filters.projectId) && filters.projectId.length > 0) count++;
  return count;
}

/** Converts an age bound to the DOB bound Postgres can use with an index. */
export function ageToDateBounds(
  minAge: number | undefined,
  maxAge: number | undefined,
  today: Date
): { dobMax?: string; dobMin?: string } {
  const iso = (d: Date) => d.toISOString().slice(0, 10);
  const bounds: { dobMax?: string; dobMin?: string } = {};

  if (minAge !== undefined) {
    // At least `minAge` years old → born on or before today minus minAge years.
    const d = new Date(Date.UTC(today.getUTCFullYear() - minAge, today.getUTCMonth(), today.getUTCDate()));
    bounds.dobMax = iso(d);
  }
  if (maxAge !== undefined) {
    // At most `maxAge` years old → born strictly after today minus (maxAge + 1) years.
    const d = new Date(Date.UTC(today.getUTCFullYear() - maxAge - 1, today.getUTCMonth(), today.getUTCDate()));
    bounds.dobMin = iso(d);
  }
  return bounds;
}
