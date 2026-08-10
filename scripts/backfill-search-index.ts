/**
 * Recomputes the candidate-search columns for every row in public.employees.
 *
 * Run once after applying supabase/migrations/20260810_candidate_search.sql; new
 * CVs are indexed on save, so this only exists to catch up the existing records.
 *
 * Dry run (default — reads and reports, writes nothing):
 *   npx -y tsx --env-file=.env.local scripts/backfill-search-index.ts
 * Write:
 *   npx -y tsx --env-file=.env.local scripts/backfill-search-index.ts --apply
 */
import { supabase, profileFromEmployeeRow } from "../lib/db-schema";
import { normalizeProfile, toSearchColumns } from "../lib/candidate-normalizer";
// One implementation of the "migration not applied" check, shared with the API.
import { isMissingColumnError, type SupabaseErrorish } from "../lib/candidate-query";

const READ_PAGE_SIZE = 500;
const WRITE_CHUNK_SIZE = 100;
const MIGRATION_FILE = "supabase/migrations/20260810_candidate_search.sql";

/**
 * Exactly the columns this script computes. Every write is built from this list
 * alone, so operational columns, cv_data and the summary columns are never
 * touched — even if the normalizer starts returning something extra.
 */
const DERIVED_COLUMNS = [
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
];

const DERIVED_COLUMN_SET = new Set<string>(DERIVED_COLUMNS);


function migrationRequired(error: SupabaseErrorish): never {
  console.error("\nThe candidate-search columns are missing from public.employees.");
  console.error(`Supabase said: ${error.message || "unknown error"}`);
  console.error(`\nRun ${MIGRATION_FILE} in the Supabase SQL editor, then re-run this script.`);
  process.exit(1);
}

/** A value that actually tells the user something — nulls and empties do not. */
function isPopulated(value: unknown): boolean {
  if (value === null || value === undefined || value === "") return false;
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === "boolean") return value;
  return true;
}

function pct(part: number, whole: number): string {
  if (whole === 0) return "0%";
  return `${Math.round((part / whole) * 100)}%`;
}

/** Fails before touching a single row if the schema is not ready. */
async function assertMigrationApplied(): Promise<void> {
  const { error } = await supabase
    .from("employees")
    .select(["id", ...DERIVED_COLUMNS, "search_indexed_at"].join(", "))
    .limit(1);
  if (!error) return;
  if (isMissingColumnError(error)) migrationRequired(error);
  console.error(`Could not read public.employees: ${error.message}`);
  process.exit(1);
}

/**
 * Writes one page in chunks. A failed chunk is reported and counted, never
 * swallowed — the caller turns any failure into a non-zero exit code so a run
 * that wrote nothing can never be mistaken for a completed backfill.
 */
async function writeChunks(rows: Record<string, unknown>[]): Promise<{ written: number; failed: number }> {
  let written = 0;
  let failed = 0;
  for (let i = 0; i < rows.length; i += WRITE_CHUNK_SIZE) {
    const chunk = rows.slice(i, i + WRITE_CHUNK_SIZE);
    // Upsert on the primary key updates only the listed columns; every object
    // carries the same key set so no column is nulled by omission.
    const { error } = await supabase.from("employees").upsert(chunk, { onConflict: "id" });
    if (error) {
      if (isMissingColumnError(error)) migrationRequired(error);
      console.error(`  write failed for ${chunk.length} row(s) starting at ${String(chunk[0].id)}: ${error.message}`);
      failed += chunk.length;
      continue;
    }
    written += chunk.length;
  }
  return { written, failed };
}

async function main() {
  const apply = process.argv.includes("--apply");

  // Same fallback chain as lib/db-schema.ts, so a project that only sets the
  // older ANON_KEY name is not turned away by a client that would have worked.
  const hasKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !hasKey) {
    console.error("Supabase credentials not loaded. Run this script with --env-file=.env.local:");
    console.error("  npx -y tsx --env-file=.env.local scripts/backfill-search-index.ts");
    process.exit(1);
  }

  await assertMigrationApplied();

  console.log(
    apply
      ? "Backfilling candidate-search columns (WRITING)..."
      : "Backfilling candidate-search columns (DRY RUN — pass --apply to write)..."
  );

  const stamp = new Date().toISOString();
  const coverage = new Map<string, number>(DERIVED_COLUMNS.map((column) => [column, 0]));
  let scanned = 0;
  let skippedDeleted = 0;
  let updated = 0;
  let failed = 0;

  for (let from = 0; ; from += READ_PAGE_SIZE) {
    const { data, error } = await supabase
      .from("employees")
      .select("*")
      .order("id", { ascending: true })
      .range(from, from + READ_PAGE_SIZE - 1);

    if (error) {
      if (isMissingColumnError(error)) migrationRequired(error);
      console.error(`Read failed at offset ${from}: ${error.message}`);
      process.exit(1);
    }
    if (!data || data.length === 0) break;

    const pending: Record<string, unknown>[] = [];
    for (const row of data) {
      scanned++;
      const profile = profileFromEmployeeRow(row);
      // Soft-deleted rows are tombstones, not candidates — leave them alone.
      if (profile.deleted) {
        skippedDeleted++;
        continue;
      }

      const derived = toSearchColumns(normalizeProfile(profile));
      const update: Record<string, unknown> = { id: row.id, search_indexed_at: stamp };
      for (const column of DERIVED_COLUMNS) update[column] = null;
      for (const [key, value] of Object.entries(derived)) {
        if (!DERIVED_COLUMN_SET.has(key)) continue;
        update[key] = value === undefined ? null : value;
        if (isPopulated(value)) coverage.set(key, (coverage.get(key) || 0) + 1);
      }
      pending.push(update);
    }

    if (!apply) {
      updated += pending.length;
    } else if (pending.length > 0) {
      const result = await writeChunks(pending);
      updated += result.written;
      failed += result.failed;
    }

    console.log(`  ${scanned} row(s) scanned...`);
    if (data.length < READ_PAGE_SIZE) break;
  }

  const indexed = scanned - skippedDeleted;
  const headline = apply
    ? failed > 0
      ? "Backfill FINISHED WITH ERRORS — some rows were not written."
      : "Backfill complete."
    : "Dry run complete — nothing was written.";
  console.log(`\n${headline}`);
  console.log(`  rows scanned: ${scanned}`);
  console.log(`  rows skipped (deleted): ${skippedDeleted}`);
  console.log(`  rows ${apply ? "updated" : "that would be updated"}: ${updated}`);
  if (failed > 0) console.log(`  rows that FAILED to write: ${failed}`);

  // Coverage counts what the normalizer produced, so it is reported for a dry
  // run too — and for rows a failed chunk never managed to write.
  console.log(`\nField coverage across ${indexed} normalized row(s):`);
  console.log("(a field counts as covered when it has a real value: non-null, non-empty array, is_trained = true)");
  const width = Math.max(...DERIVED_COLUMNS.map((c) => c.length));
  for (const column of DERIVED_COLUMNS) {
    const count = coverage.get(column) || 0;
    console.log(`  ${column.padEnd(width)}  ${String(count).padStart(6)}  ${pct(count, indexed).padStart(4)}`);
  }

  if (!apply) console.log("\nRe-run with --apply to write these values.");
  // A partly-written backfill is a failed backfill: exit non-zero so the
  // rollout step cannot read "done" off a run that wrote nothing.
  if (failed > 0) process.exit(1);
}

main().catch((e: any) => {
  console.error(`Backfill aborted: ${e?.message || e}`);
  process.exit(1);
});
