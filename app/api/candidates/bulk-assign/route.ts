import { NextRequest, NextResponse } from "next/server";
import { ALLOWED_VALUES, BULK_ASSIGNABLE_FIELDS } from "@/constants/candidate-filters";
import {
  MIGRATION_FILE,
  MIGRATION_REQUIRED_MESSAGE,
  isMissingColumnError,
  isMissingTableError,
} from "@/lib/candidate-query";
import { supabase } from "@/lib/db-schema";
import type { BulkAssignResponse } from "@/types/candidate-search.types";

export const dynamic = "force-dynamic";

/** One selection's worth of candidates. Beyond this the request is a mistake, not a shortlist. */
const MAX_IDS = 500;

const ASSIGNABLE = new Set<string>(BULK_ASSIGNABLE_FIELDS);

function badRequest(error: string) {
  return NextResponse.json<BulkAssignResponse>({ success: false, code: "BAD_REQUEST", error }, { status: 400 });
}

/**
 * Sets operational fields on the selected candidates in a single UPDATE.
 *
 * Every id and every value is validated before anything is written: one bad
 * value rejects the whole batch, because a half-applied assignment is worse
 * than a rejected one. An explicit `null` is a legal value and clears the field.
 */
export async function POST(req: NextRequest) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return badRequest("Request body must be JSON.");
  }

  /* ------------------------------------------------------------------ ids */

  const ids = body?.ids;
  if (!Array.isArray(ids) || ids.length === 0) return badRequest("`ids` must be a non-empty array.");
  if (ids.length > MAX_IDS) return badRequest(`Too many candidates selected: ${ids.length}. The limit is ${MAX_IDS}.`);
  if (!ids.every((id: unknown) => typeof id === "string" && id.trim() !== "")) {
    return badRequest("Every entry in `ids` must be a non-empty string.");
  }
  const uniqueIds = Array.from(new Set(ids.map((id: string) => id.trim())));

  /* --------------------------------------------------------------- fields */

  const fields = body?.fields;
  if (!fields || typeof fields !== "object" || Array.isArray(fields)) return badRequest("`fields` must be an object.");

  const entries = Object.entries(fields as Record<string, unknown>);
  if (entries.length === 0) return badRequest("`fields` must contain at least one field to assign.");

  const patch: Record<string, string | null> = {};
  for (const [key, value] of entries) {
    if (!ASSIGNABLE.has(key)) return badRequest(`\`${key}\` is not a bulk-assignable field.`);

    if (value === null) {
      patch[key] = null; // explicit null clears the field
      continue;
    }
    if (typeof value !== "string" || value.trim() === "") {
      return badRequest(`\`${key}\` must be a non-empty string or null.`);
    }

    const trimmed = value.trim();
    if (key === "project_id") {
      patch[key] = trimmed; // project ids are data, validated by existence below
      continue;
    }

    const allowed = ALLOWED_VALUES[key as keyof typeof ALLOWED_VALUES];
    if (!allowed || !allowed.has(trimmed)) return badRequest(`"${trimmed}" is not a valid value for \`${key}\`.`);
    patch[key] = trimmed;
  }

  try {
    /* ------------------------------------------------------------ project */

    if (typeof patch.project_id === "string") {
      const { data, error } = await supabase.from("projects").select("id").eq("id", patch.project_id).limit(1);
      if (error) {
        if (isMissingTableError(error, "projects")) {
          return badRequest(`No projects table exists yet — run ${MIGRATION_FILE} before assigning a project.`);
        }
        console.error("bulk-assign project lookup error:", error.message);
        return NextResponse.json<BulkAssignResponse>(
          { success: false, code: "DB_UNREACHABLE", error: error.message || "The candidate database could not be reached." },
          { status: 500 }
        );
      }
      if (!data || data.length === 0) return badRequest(`Project "${patch.project_id}" does not exist.`);
    }

    /* ------------------------------------------------------------- write */

    const { data, error } = await supabase.from("employees").update(patch).in("id", uniqueIds).select("id");

    if (error) {
      if (isMissingColumnError(error)) {
        return NextResponse.json<BulkAssignResponse>({
          success: false,
          code: "MIGRATION_REQUIRED",
          error: MIGRATION_REQUIRED_MESSAGE,
        });
      }
      console.error("bulk-assign DB error:", error.message);
      return NextResponse.json<BulkAssignResponse>(
        { success: false, code: "DB_UNREACHABLE", error: error.message || "The candidate database could not be reached." },
        { status: 500 }
      );
    }

    return NextResponse.json<BulkAssignResponse>({ success: true, updated: data?.length ?? 0 });
  } catch (err: any) {
    console.error("bulk-assign API error:", err);
    return NextResponse.json<BulkAssignResponse>(
      { success: false, code: "DB_UNREACHABLE", error: err?.message || "The candidate database could not be reached." },
      { status: 500 }
    );
  }
}
