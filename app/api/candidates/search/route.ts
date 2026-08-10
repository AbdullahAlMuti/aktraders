import { NextRequest, NextResponse } from "next/server";
import { DEFAULT_PAGE_SIZE, parseFilters } from "@/lib/candidate-filter-params";
import {
  MIGRATION_REQUIRED_MESSAGE,
  buildCandidateQuery,
  isMissingColumnError,
  isRangeNotSatisfiableError,
  loadProjectsById,
  rowToSearchRow,
} from "@/lib/candidate-query";
import { supabase } from "@/lib/db-schema";
import type { CandidateSearchResponse } from "@/types/candidate-search.types";

export const dynamic = "force-dynamic";

/**
 * Filtered, paginated candidate search with an exact total.
 *
 * Failures are reported as an HTTP 200 carrying `success: false` and a code —
 * the same shape app/api/employees/route.ts uses — so the UI can render an
 * actionable banner. An empty result list is only ever returned when the search
 * genuinely matched nothing; it never stands in for an error.
 */
export async function GET(req: NextRequest) {
  const filters = parseFilters(new URL(req.url).searchParams);
  const limit = filters.limit ?? DEFAULT_PAGE_SIZE;
  let page = filters.page ?? 1;

  try {
    let result = await buildCandidateQuery(supabase, filters, { count: true });

    // Rows disappear under a paged view: delete the tail of the last page and
    // its offset now sits past the end, which an exactly-counted PostgREST
    // request reports as 416 instead of as an empty page. Retry at page 1 and
    // report that in `meta.page` — an out-of-range page is not a dead database.
    if (result.error && isRangeNotSatisfiableError(result.error)) {
      page = 1;
      result = await buildCandidateQuery(supabase, { ...filters, page }, { count: true });
    }

    const { data, error, count } = result;

    if (error) {
      if (isMissingColumnError(error)) {
        return NextResponse.json<CandidateSearchResponse>({
          success: false,
          code: "MIGRATION_REQUIRED",
          error: MIGRATION_REQUIRED_MESSAGE,
        });
      }
      console.error("candidate search DB error:", error.message);
      return NextResponse.json<CandidateSearchResponse>({
        success: false,
        code: "DB_UNREACHABLE",
        error: error.message || "The candidate database could not be reached.",
      });
    }

    const projectsById = await loadProjectsById(supabase);
    const rows = (data || []).map((row) => rowToSearchRow(row, projectsById));
    const total = count ?? rows.length;

    return NextResponse.json<CandidateSearchResponse>({
      success: true,
      data: rows,
      meta: {
        total,
        page,
        limit,
        totalPages: total > 0 ? Math.ceil(total / limit) : 0,
      },
    });
  } catch (err: any) {
    console.error("candidate search API error:", err);
    return NextResponse.json<CandidateSearchResponse>({
      success: false,
      code: "DB_UNREACHABLE",
      error: err?.message || "The candidate database could not be reached.",
    });
  }
}
