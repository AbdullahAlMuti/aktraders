/**
 * Query-shape tests for lib/candidate-query.ts.
 *
 * A hand-written fake Supabase client records every chained call, so these
 * assert what the builder ASKS Postgres for — no network, no database, no
 * mocking library. Run with:
 *
 *   npx -y tsx scripts/test-candidate-query.ts
 */
import {
  ageFromDateOfBirth,
  buildCandidateQuery,
  isMissingColumnError,
  isRangeNotSatisfiableError,
  rowToSearchRow,
} from "../lib/candidate-query";
import type {
  CandidateFilterBuilder,
  CandidateQueryClient,
  CandidateQueryResult,
  CandidateTransformBuilder,
} from "../lib/candidate-query";
import type { CandidateSearchFilters, Project } from "../types/candidate-search.types";

let passed = 0,
  total = 0;
function assert(cond: boolean, name: string) {
  total++;
  if (cond) {
    passed++;
    console.log(`[PASS] ${name}`);
  } else console.error(`[FAIL] ${name}`);
}

/* ------------------------------------------------------------ fake client */

interface RecordedCall {
  method: string;
  args: unknown[];
}

/** Every operator returns itself, so one array holds the whole chain in order. */
class FakeBuilder implements CandidateFilterBuilder {
  constructor(private readonly calls: RecordedCall[]) {}

  private record(method: string, ...args: unknown[]): this {
    this.calls.push({ method, args });
    return this;
  }

  eq(column: string, value: unknown) {
    return this.record("eq", column, value);
  }
  in(column: string, values: readonly unknown[]) {
    return this.record("in", column, values);
  }
  gt(column: string, value: unknown) {
    return this.record("gt", column, value);
  }
  gte(column: string, value: unknown) {
    return this.record("gte", column, value);
  }
  lte(column: string, value: unknown) {
    return this.record("lte", column, value);
  }
  is(column: string, value: null) {
    return this.record("is", column, value);
  }
  or(filters: string) {
    return this.record("or", filters);
  }
  overlaps(column: string, values: readonly unknown[]) {
    return this.record("overlaps", column, values);
  }
  order(column: string, options?: { ascending?: boolean; nullsFirst?: boolean }) {
    return this.record("order", column, options);
  }
  range(from: number, to: number) {
    return this.record("range", from, to);
  }
  then<TResult1 = CandidateQueryResult, TResult2 = never>(
    onfulfilled?: ((value: CandidateQueryResult) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null
  ): PromiseLike<TResult1 | TResult2> {
    return Promise.resolve<CandidateQueryResult>({ data: [], error: null, count: 0 }).then(onfulfilled, onrejected);
  }
}

/** Runs the builder against the fake and hands back everything it did. */
function run(filters: CandidateSearchFilters, opts?: { count?: boolean; selectAll?: boolean }) {
  const calls: RecordedCall[] = [];
  const client: CandidateQueryClient = {
    from(table: string) {
      calls.push({ method: "from", args: [table] });
      return {
        select(columns: string, options?: { count?: "exact" }) {
          calls.push({ method: "select", args: [columns, options] });
          return new FakeBuilder(calls);
        },
      };
    },
  };

  const query: CandidateTransformBuilder = buildCandidateQuery(client, filters, opts);
  return {
    query,
    calls,
    of: (method: string) => calls.filter((c) => c.method === method),
  };
}

/* ------------------------------------------------------------- assertions */

const SOFT_DELETE_GUARD = "cv_data->>deleted.is.null,cv_data->>deleted.neq.true";

/**
 * Splits a PostgREST logic expression on its top-level commas the way the
 * server does — respecting double-quoted values, backslash escapes and
 * `in.(...)` groups. Bad escaping shows up here as the wrong condition count.
 */
function splitConditions(expression: string): string[] {
  const parts: string[] = [];
  let current = "";
  let quoted = false;
  let depth = 0;

  for (let i = 0; i < expression.length; i++) {
    const ch = expression[i];
    if (quoted && ch === "\\") {
      current += ch + (expression[++i] ?? "");
      continue;
    }
    if (ch === '"') {
      quoted = !quoted;
      current += ch;
      continue;
    }
    if (!quoted && (ch === "(" || ch === ")")) {
      depth += ch === "(" ? 1 : -1;
      current += ch;
      continue;
    }
    if (ch === "," && !quoted && depth === 0) {
      parts.push(current);
      current = "";
      continue;
    }
    current += ch;
  }
  parts.push(current);
  return parts;
}

/**
 * yyyy-mm-dd for "today, N years ago", by string arithmetic — so the expected
 * bounds are not simply a second call to the code under test. 29 February
 * rolls into 1 March in a non-leap year, exactly as `Date.UTC` does.
 */
function isoYearsAgo(now: Date, years: number): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  const isLeap = (y: number) => (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;

  const year = now.getUTCFullYear() - years;
  let month = now.getUTCMonth() + 1;
  let day = now.getUTCDate();
  if (month === 2 && day === 29 && !isLeap(year)) {
    month = 3;
    day = 1;
  }
  return `${year}-${pad(month)}-${pad(day)}`;
}

/* ------------------------------------------------- 1. no filters at all */

{
  const { calls, of } = run({});

  assert(of("from")[0]?.args[0] === "employees", "queries public.employees");
  assert(!String(of("select")[0]?.args[0]).includes("cv_data"), "select list excludes the fat cv_data jsonb");
  assert(of("or").length === 1 && of("or")[0].args[0] === SOFT_DELETE_GUARD, "soft-deleted rows are excluded");

  const constraints = ["eq", "in", "gt", "gte", "lte", "is", "overlaps"];
  assert(
    constraints.every((method) => of(method).length === 0),
    "empty filters add no constraint beyond the soft-delete guard"
  );

  assert(of("order").length === 2, "always ordered by a sort column plus a stable tiebreak");
  assert(
    of("order")[0].args[0] === "created_at" &&
      (of("order")[0].args[1] as { ascending: boolean }).ascending === false,
    "default sort is created_at descending"
  );
  assert(of("order")[1].args[0] === "id", "secondary sort is id, so pages never repeat rows");
  assert(of("range").length === 1 && of("range")[0].args[0] === 0 && of("range")[0].args[1] === 19, "default page is range(0, 19)");
  assert(calls.filter((c) => c.method === "select")[0].args[1] === undefined, "no count is requested unless asked for");
}

/* -------------------------------------------------------- 2. count option */

{
  const { of } = run({}, { count: true });
  assert(
    JSON.stringify(of("select")[0].args[1]) === JSON.stringify({ count: "exact" }),
    "count: true requests an exact total"
  );
}

/* --------------------------------------------------------------- 3. age */

{
  const now = new Date();
  const { of } = run({ minAge: 25, maxAge: 30 });

  const lte = of("lte")[0];
  const gt = of("gt")[0];
  assert(
    lte?.args[0] === "date_of_birth" && lte?.args[1] === isoYearsAgo(now, 25),
    `minAge 25 becomes date_of_birth <= ${isoYearsAgo(now, 25)}`
  );
  assert(
    gt?.args[0] === "date_of_birth" && gt?.args[1] === isoYearsAgo(now, 31),
    `maxAge 30 becomes date_of_birth > ${isoYearsAgo(now, 31)}`
  );
  assert(of("lte").length === 1 && of("gt").length === 1, "an age range is exactly two date constraints");
}

/* ------------------------------------------------- 4/5. groups and .in() */

{
  const { of } = run({ gender: ["male", "female"] });
  assert(of("in").length === 1, "several values in one group are a single .in(), not one constraint each");
  assert(
    of("in")[0].args[0] === "gender" && JSON.stringify(of("in")[0].args[1]) === JSON.stringify(["male", "female"]),
    "the group's values are OR-ed inside that .in()"
  );
}

{
  const { of } = run({ gender: ["male"], district: ["cumilla"] });
  assert(of("in").length === 2, "two groups are two AND-ed constraints");
  assert(
    of("in").map((c) => c.args[0]).join(",") === "gender,district",
    "each group targets its own column"
  );
}

{
  const { of } = run({
    educationLevel: ["hsc"],
    educationBoard: ["madrasa"],
    manpowerCategory: ["contractual"],
    profession: ["driver"],
    department: ["hr"],
    workType: ["physical"],
    shift: ["day"],
    cvQuality: ["good"],
    availability: ["available"],
    sector: ["private"],
    division: ["chattogram"],
    district: ["cumilla"],
    gender: ["male"],
  });
  assert(of("in").length === 13, "every enum group maps to its own column");
}

/* ----------------------------------------------------------- 6. keyword */

{
  const keyword = 'Rahman, Md. (Jr) "Bo"';
  const { of } = run({ keyword });

  const keywordOr = of("or").find((c) => String(c.args[0]).includes("ilike"));
  assert(!!keywordOr, "a keyword produces an .or() across the searchable columns");

  const expression = String(keywordOr?.args[0] ?? "");
  const conditions = splitConditions(expression);
  assert(conditions.length === 5, "a comma inside the keyword does not split the expression into bogus conditions");
  assert(
    conditions.map((c) => c.split(".ilike.")[0]).join(",") === "name,id,phone,designation,profession_raw",
    "keyword searches name, id, phone, designation and profession_raw"
  );
  assert(expression.includes('\\"Bo\\"'), "double quotes inside the keyword are backslash-escaped");
  assert(expression.includes("(Jr)"), "a parenthesis survives inside the quoted value");
  assert(conditions.every((c) => /\.ilike\."%.*%"$/.test(c)), "every condition is a quoted %like% pattern");
  assert(of("or").length === 2, "the keyword .or() is separate from the soft-delete guard, so the two are AND-ed");
}

/* ----------------------------------------------------------- 7. projects */

{
  const { of } = run({ projectId: ["PRJ-1", "PRJ-2"], unassignedProject: true });

  const projectOr = of("or").find((c) => String(c.args[0]).includes("project_id"));
  const expression = String(projectOr?.args[0] ?? "");
  assert(
    expression === 'project_id.in.("PRJ-1","PRJ-2"),project_id.is.null',
    "projectId + unassignedProject is one combined .or()"
  );
  assert(splitConditions(expression).length === 2, "the in-list's own commas stay inside its group");
  assert(
    of("in").every((c) => c.args[0] !== "project_id") && of("is").length === 0,
    "the combined .or() replaces the separate .in()/.is() constraints"
  );
}

{
  const { of } = run({ projectId: ["PRJ-1"] });
  assert(of("in").length === 1 && of("in")[0].args[0] === "project_id", "projectId alone is a plain .in()");
  assert(of("or").length === 1, "projectId alone adds no .or()");
}

{
  const { of } = run({ unassignedProject: true });
  assert(
    of("is").length === 1 && of("is")[0].args[0] === "project_id" && of("is")[0].args[1] === null,
    "unassignedProject alone is project_id is null"
  );
}

/* ------------------------------------------- 8. training and experience */

{
  const { of } = run({ isTrained: false });
  assert(of("eq").length === 1 && of("eq")[0].args[0] === "is_trained" && of("eq")[0].args[1] === false, "isTrained: false filters untrained only");
}

{
  const { of } = run({ trainingTypes: ["driving", "safety"] });
  assert(
    of("overlaps").length === 1 &&
      of("overlaps")[0].args[0] === "training_types" &&
      JSON.stringify(of("overlaps")[0].args[1]) === JSON.stringify(["driving", "safety"]),
    "trainingTypes uses array overlap, so any listed training matches"
  );
}

{
  const { of } = run({ minExperience: 3, maxExperience: 5 });
  assert(
    of("gte")[0]?.args[0] === "experience_years" && of("gte")[0]?.args[1] === 3,
    "minExperience is a >= on experience_years"
  );
  assert(
    of("lte")[0]?.args[0] === "experience_years" && of("lte")[0]?.args[1] === 5,
    "maxExperience is a <= on experience_years"
  );
}

/* ------------------------------------------------ 9. sorting and paging */

{
  const { of } = run({ sortBy: "experience_years", sortDir: "asc" });
  const primary = of("order")[0];
  assert(primary.args[0] === "experience_years", "sortBy picks the ordering column");
  assert((primary.args[1] as { ascending: boolean }).ascending === true, "sortDir asc orders ascending");
  assert(
    (primary.args[1] as { nullsFirst: boolean }).nullsFirst === false,
    "nulls sort last, so unknown experience never leads the list"
  );
}

{
  const { of } = run({ page: 3, limit: 20 });
  assert(of("range")[0].args[0] === 40 && of("range")[0].args[1] === 59, "page 3 at 20 per page is range(40, 59)");
}

{
  const { of } = run({ page: 2, limit: 500 });
  assert(of("range")[0].args[1] === 199, "limit is clamped to MAX_PAGE_SIZE");
}

{
  const { of } = run({ page: 3, limit: 20 }, { selectAll: true });
  assert(of("range").length === 0, "selectAll skips pagination so the export can page the query itself");
}

/* ----------------------------------------------------- 10. row mapping */

{
  const projects: ReadonlyMap<string, Project> = new Map([
    ["PRJ-1", { id: "PRJ-1", name: "Dhaka Metro", code: "DM", sector: "government", isActive: true }],
  ]);

  const row = rowToSearchRow(
    {
      id: "EMP-000123",
      name: "Md Rahman",
      email: "rahman@example.com",
      phone: "01711000000",
      department: "operations",
      designation: "Senior Driver",
      status: "active",
      gender: "male",
      date_of_birth: "1990-01-15",
      education_level: "hsc",
      education_board: "madrasa",
      profession: "driver",
      experience_years: 7.5,
      division: "chattogram",
      district: "cumilla",
      is_trained: true,
      training_types: ["driving", "not_a_training"],
      cv_quality: "good",
      manpower_category: "contractual",
      work_type: "physical",
      shift: "day",
      availability: "available",
      sector: "private",
      project_id: "PRJ-1",
    },
    projects
  );

  assert(row.id === "EMP-000123" && row.employeeId === "EMP-000123", "the employees primary key is the candidate id");
  assert(row.age === ageFromDateOfBirth("1990-01-15"), "age is computed from date_of_birth at read time");
  assert(row.experienceYears === 7.5, "fractional experience survives the mapping");
  assert(JSON.stringify(row.trainingTypes) === JSON.stringify(["driving"]), "an unknown training type is dropped, not invented");
  assert(row.projectName === "Dhaka Metro", "project_id is labelled from the project lookup");
}

{
  const row = rowToSearchRow({ id: "EMP-000999", project_id: "PRJ-GONE" });
  assert(row.name === "" && row.gender === null && row.age === null, "missing columns map to empty/null, never to a guess");
  assert(row.projectId === "PRJ-GONE" && row.projectName === null, "an unknown project keeps its id and reports no name");
  assert(row.isTrained === null && row.trainingTypes === null, "an unindexed row is 'unknown', not 'untrained'");
}

{
  const today = new Date(Date.UTC(2026, 7, 10)); // 2026-08-10
  assert(ageFromDateOfBirth("1990-01-15", today) === 36, "age counts a birthday that has already passed this year");
  assert(ageFromDateOfBirth("1990-12-15", today) === 35, "age does not count a birthday still to come");
  assert(ageFromDateOfBirth(null, today) === null, "no date of birth means no age");
}

/* ------------------------------------------- 11. error classification */

{
  assert(
    isRangeNotSatisfiableError({ code: "PGRST103", message: "Requested range not satisfiable" }),
    "a page past the end of the result set is recognised, not reported as an unreachable database"
  );
  assert(
    !isRangeNotSatisfiableError({ code: "PGRST301", message: "JWT expired" }) &&
      !isRangeNotSatisfiableError(null),
    "every other failure stays a failure"
  );
  assert(
    !isMissingColumnError({ code: "PGRST103", message: "Requested range not satisfiable" }),
    "an out-of-range page is not mistaken for a missing migration"
  );
}

console.log(`${passed}/${total}`);
process.exit(passed === total ? 0 : 1);
