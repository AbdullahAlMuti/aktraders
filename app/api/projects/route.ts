import { NextResponse } from "next/server";
import { PROJECT_SELECT_COLUMNS, isMissingTableError, projectFromRow } from "@/lib/candidate-query";
import { supabase } from "@/lib/db-schema";
import type { CandidateSearchErrorCode, Project } from "@/types/candidate-search.types";

export const dynamic = "force-dynamic";

type ProjectListResponse = { success: true; data: Project[] } | { success: false; code: CandidateSearchErrorCode; error: string };

/**
 * Projects for the filter panel and the bulk-assign modal, active ones first
 * and alphabetical within each group.
 *
 * `public.projects` is created by the candidate-search migration. Until that
 * runs there simply are no projects, which is an empty list rather than an error.
 */
export async function GET() {
  try {
    const { data, error } = await supabase
      .from("projects")
      .select(PROJECT_SELECT_COLUMNS)
      .order("is_active", { ascending: false })
      .order("name", { ascending: true });

    if (error) {
      if (isMissingTableError(error, "projects")) return NextResponse.json<ProjectListResponse>({ success: true, data: [] });
      console.error("projects list DB error:", error.message);
      return NextResponse.json<ProjectListResponse>({
        success: false,
        code: "DB_UNREACHABLE",
        error: error.message || "The projects table could not be read.",
      });
    }

    return NextResponse.json<ProjectListResponse>({
      success: true,
      data: (data || []).map((row) => projectFromRow(row)),
    });
  } catch (err: any) {
    console.error("projects list API error:", err);
    return NextResponse.json<ProjectListResponse>({
      success: false,
      code: "DB_UNREACHABLE",
      error: err?.message || "The projects table could not be read.",
    });
  }
}
