import { NextRequest, NextResponse } from "next/server";
import {
  AVAILABILITIES,
  CV_QUALITIES,
  DEPARTMENTS,
  DISTRICTS,
  DIVISIONS,
  EDUCATION_BOARDS,
  EDUCATION_LEVELS,
  GENDERS,
  MANPOWER_CATEGORIES,
  PROFESSIONS,
  SECTORS,
  SHIFTS,
  TRAINING_TYPES,
  WORK_TYPES,
} from "@/constants/candidate-filters";
import { parseFilters } from "@/lib/candidate-filter-params";
import {
  MIGRATION_REQUIRED_MESSAGE,
  buildCandidateQuery,
  isMissingColumnError,
  loadProjectsById,
  rowToSearchRow,
  type CandidateQueryResult,
  type CandidateRow,
  type CandidateTransformBuilder,
} from "@/lib/candidate-query";
import { supabase } from "@/lib/db-schema";
import type {
  CandidateSearchFilters,
  CandidateSearchResponse,
  CandidateSearchRow,
} from "@/types/candidate-search.types";

export const dynamic = "force-dynamic";

/** Enough for any realistic shortlist; past this the answer is a narrower filter, not a bigger file. */
const EXPORT_ROW_CAP = 5000;
const EXPORT_PAGE_SIZE = 1000;

/** Excel reads a CSV in the system code page unless the file starts with this. */
const UTF8_BOM = "\u{FEFF}";

const EXPORT_COLUMNS = [
  "Employee ID",
  "Name",
  "Phone",
  "Email",
  "Gender",
  "Age",
  "Profession",
  "Designation",
  "Department",
  "Education Level",
  "Education Board",
  "Experience (Years)",
  "Training",
  "District",
  "Division",
  "Manpower Category",
  "Work Type",
  "Shift",
  "Availability",
  "Sector",
  "Project",
  "CV Quality",
];

/* --------------------------------------------------------------------- csv */

/** Slug → human label. An unknown slug is passed through rather than blanked. */
function labelOf(options: readonly { value: string; label: string }[], value: string | null | undefined): string {
  if (!value) return "";
  return options.find((option) => option.value === value)?.label ?? value;
}

/**
 * One CSV field: always quoted, embedded quotes doubled, and a leading
 * formula character neutralised with an apostrophe so Excel and Sheets treat
 * "=cmd|..." as text instead of executing it.
 */
function csvCell(value: string | number | null | undefined): string {
  const raw = value === null || value === undefined ? "" : String(value);
  const safe = /^[=+\-@\t\r]/.test(raw) ? `'${raw}` : raw;
  return `"${safe.replace(/"/g, '""')}"`;
}

function csvRow(cells: (string | number | null | undefined)[]): string {
  return `${cells.map(csvCell).join(",")}\r\n`;
}

/** Pads a short row out to the header width so the file stays rectangular. */
function padRow(cells: string[]): string[] {
  return [...cells, ...Array(Math.max(0, EXPORT_COLUMNS.length - cells.length)).fill("")];
}

function toCsvValues(row: CandidateSearchRow): (string | number | null)[] {
  return [
    row.employeeId,
    row.name,
    row.phone,
    row.email,
    labelOf(GENDERS, row.gender),
    row.age,
    labelOf(PROFESSIONS, row.profession),
    row.designation,
    labelOf(DEPARTMENTS, row.department),
    labelOf(EDUCATION_LEVELS, row.educationLevel),
    labelOf(EDUCATION_BOARDS, row.educationBoard),
    row.experienceYears,
    (row.trainingTypes || []).map((type) => labelOf(TRAINING_TYPES, type)).join(", "),
    labelOf(DISTRICTS, row.district),
    labelOf(DIVISIONS, row.division),
    labelOf(MANPOWER_CATEGORIES, row.manpowerCategory),
    labelOf(WORK_TYPES, row.workType),
    labelOf(SHIFTS, row.shift),
    labelOf(AVAILABILITIES, row.availability),
    labelOf(SECTORS, row.sector),
    row.projectName || row.projectId || "",
    labelOf(CV_QUALITIES, row.cvQuality),
  ];
}

/* ------------------------------------------------------------------- route */

/**
 * CSV of every row matching the current filters — not just the visible page.
 *
 * The first page is fetched before a single byte goes out, so a missing
 * migration or an unreachable database is still an honest JSON error instead of
 * a half-written download.
 */
export async function GET(req: NextRequest) {
  const filters = parseFilters(new URL(req.url).searchParams);

  let first: CandidateQueryResult;
  try {
    first = await fetchPage(filters, 0, true);
  } catch (err: any) {
    console.error("candidate export API error:", err);
    return jsonError("DB_UNREACHABLE", err?.message || "The candidate database could not be reached.");
  }

  if (first.error) {
    if (isMissingColumnError(first.error)) return jsonError("MIGRATION_REQUIRED", MIGRATION_REQUIRED_MESSAGE);
    console.error("candidate export DB error:", first.error.message);
    return jsonError("DB_UNREACHABLE", first.error.message || "The candidate database could not be reached.");
  }

  const projectsById = await loadProjectsById(supabase);
  const total = first.count;

  let queued: CandidateRow[] | null = first.data || [];
  let nextOffset = EXPORT_PAGE_SIZE;
  let emitted = 0;
  let closed = false;

  const encoder = new TextEncoder();

  const finish = (controller: ReadableStreamDefaultController<Uint8Array>) => {
    if (closed) return;
    // Say so in the file rather than letting the list stop without explanation.
    if (emitted >= EXPORT_ROW_CAP && (total === null || total > EXPORT_ROW_CAP)) {
      const note =
        total === null
          ? `Export truncated at ${EXPORT_ROW_CAP} rows. Narrow the filters to export the rest.`
          : `Export truncated: first ${EXPORT_ROW_CAP} of ${total} matching candidates. Narrow the filters to export the rest.`;
      controller.enqueue(encoder.encode(csvRow(padRow([note]))));
    }
    closed = true;
    controller.close();
  };

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      // Without the BOM, Excel reads the file in the system code page and
      // mangles every Bengali name in it.
      controller.enqueue(encoder.encode(`${UTF8_BOM}${csvRow(EXPORT_COLUMNS)}`));
    },
    async pull(controller) {
      if (closed) return;

      let rows = queued;
      queued = null;

      if (rows === null) {
        if (emitted >= EXPORT_ROW_CAP) return finish(controller);
        const page = await fetchPage(filters, nextOffset, false);
        nextOffset += EXPORT_PAGE_SIZE;
        if (page.error) {
          controller.enqueue(
            encoder.encode(csvRow(padRow([`Export stopped early after ${emitted} rows: ${page.error.message}`])))
          );
          closed = true;
          controller.close();
          return;
        }
        rows = page.data || [];
      }

      const chunk: string[] = [];
      for (const row of rows) {
        if (emitted >= EXPORT_ROW_CAP) break;
        chunk.push(csvRow(toCsvValues(rowToSearchRow(row, projectsById))));
        emitted++;
      }
      if (chunk.length > 0) controller.enqueue(encoder.encode(chunk.join("")));

      if (rows.length < EXPORT_PAGE_SIZE || emitted >= EXPORT_ROW_CAP) finish(controller);
    },
  });

  const date = new Date().toISOString().slice(0, 10);
  return new NextResponse(stream, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="candidates_export_${date}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}

/** One page of the export. `count` is only requested for the first page. */
function fetchPage(filters: CandidateSearchFilters, offset: number, withCount: boolean): CandidateTransformBuilder {
  return buildCandidateQuery(supabase, filters, { count: withCount, selectAll: true }).range(
    offset,
    offset + EXPORT_PAGE_SIZE - 1
  );
}

function jsonError(code: "MIGRATION_REQUIRED" | "DB_UNREACHABLE", error: string) {
  return NextResponse.json<CandidateSearchResponse>({ success: false, code, error });
}
