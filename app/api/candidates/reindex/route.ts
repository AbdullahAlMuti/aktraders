import { NextRequest, NextResponse } from "next/server";
import { normalizeProfile, toSearchColumns } from "@/lib/candidate-normalizer";
import { MIGRATION_REQUIRED_MESSAGE, isMissingColumnError } from "@/lib/candidate-query";
import { profileFromEmployeeRow, supabase } from "@/lib/db-schema";
import type { CandidateSearchErrorCode } from "@/types/candidate-search.types";

export const dynamic = "force-dynamic";

const READ_PAGE_SIZE = 200;
const WRITE_CHUNK_SIZE = 100;
/** Loop guard: the table is ~3k rows, so this can only ever be hit by a bug. */
const MAX_ROWS = 100000;

type ReindexResponse = { success: true; updated: number; scanned: number } | { success: false; code: CandidateSearchErrorCode; error: string };

/**
 * Recomputes every derived search column from `cv_data`.
 *
 * New CVs are indexed on save, so this only exists to catch up after a
 * normalizer change. It rewrites the whole table, which is why it will not run
 * without the `x-reindex-confirm: yes` header — no stray POST can trigger it.
 */
export async function POST(req: NextRequest) {
  if (req.headers.get("x-reindex-confirm") !== "yes") {
    return NextResponse.json<ReindexResponse>(
      {
        success: false,
        code: "BAD_REQUEST",
        error: "Reindexing rewrites every derived column. Repeat the request with the header `x-reindex-confirm: yes`.",
      },
      { status: 400 }
    );
  }

  // One stamp for the whole run, so `search_indexed_at` identifies the run
  // rather than the row.
  const stamp = new Date().toISOString();
  let scanned = 0;
  let updated = 0;

  try {
    for (let from = 0; from < MAX_ROWS; from += READ_PAGE_SIZE) {
      const { data, error } = await supabase
        .from("employees")
        .select("*")
        .order("id", { ascending: true })
        .range(from, from + READ_PAGE_SIZE - 1);

      if (error) return dbFailure(error);
      if (!data || data.length === 0) break;

      const pending: Record<string, unknown>[] = [];
      for (const row of data) {
        scanned++;
        const profile = profileFromEmployeeRow(row);
        // Soft-deleted rows are tombstones, not candidates — leave them alone.
        if (profile.deleted) continue;
        pending.push({ id: row.id, ...toSearchColumns(normalizeProfile(profile)), search_indexed_at: stamp });
      }

      for (let i = 0; i < pending.length; i += WRITE_CHUNK_SIZE) {
        const chunk = pending.slice(i, i + WRITE_CHUNK_SIZE);
        // Upsert on the primary key touches only the listed columns, and every
        // object carries the same key set, so nothing is nulled by omission.
        const { error: writeError } = await supabase.from("employees").upsert(chunk, { onConflict: "id" });
        if (writeError) return dbFailure(writeError);
        updated += chunk.length;
      }

      if (data.length < READ_PAGE_SIZE) break;
    }

    return NextResponse.json<ReindexResponse>({ success: true, updated, scanned });
  } catch (err: any) {
    console.error("candidate reindex API error:", err);
    return NextResponse.json<ReindexResponse>(
      { success: false, code: "DB_UNREACHABLE", error: err?.message || "The candidate database could not be reached." },
      { status: 500 }
    );
  }
}

function dbFailure(error: { code?: string; message?: string }) {
  if (isMissingColumnError(error)) {
    return NextResponse.json<ReindexResponse>({
      success: false,
      code: "MIGRATION_REQUIRED",
      error: MIGRATION_REQUIRED_MESSAGE,
    });
  }
  console.error("candidate reindex DB error:", error.message);
  return NextResponse.json<ReindexResponse>(
    { success: false, code: "DB_UNREACHABLE", error: error.message || "The candidate database could not be reached." },
    { status: 500 }
  );
}
