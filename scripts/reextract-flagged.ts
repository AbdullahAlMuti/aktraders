/**
 * Re-runs AI extraction for every profile stuck in "review_required", using the
 * CV stored in cv_records. Profiles that now pass validation become active.
 *
 * Run: npx -y tsx --env-file=.env.local scripts/reextract-flagged.ts
 */
import { supabase, saveProfileToDb, buildFullProfileFromRecord, parseJSONSafe, profileFromEmployeeRow } from "../lib/db-schema";
import { extractCvWithAI } from "../lib/ai-provider";
import { extractTextFromPdf } from "../lib/cv-batch-processor";
import { validateExtraction } from "../lib/extraction-validator";

async function loadCvBuffer(recordId: string): Promise<{ buffer: Buffer; record: any } | null> {
  const { data } = await supabase.from("cv_records").select("*").eq("id", recordId).limit(1);
  const record = data?.[0];
  if (!record) return null;
  const url: string = record.original_pdf_url || "";
  if (url.startsWith("data:application/pdf;base64,")) {
    return { buffer: Buffer.from(url.slice("data:application/pdf;base64,".length), "base64"), record };
  }
  if (url.startsWith("/uploads/")) {
    const fs = await import("fs");
    const path = await import("path");
    const filePath = path.join(process.cwd(), "public", url);
    if (fs.existsSync(filePath)) return { buffer: fs.readFileSync(filePath), record };
  }
  return null;
}

async function main() {
  const { data: rows } = await supabase.from("employees").select("*").eq("status", "review_required").limit(100);
  if (!rows || rows.length === 0) {
    console.log("No profiles need review. Nothing to do.");
    return;
  }

  let fixed = 0;
  for (const row of rows) {
    const profile = profileFromEmployeeRow(row);
    if (profile.deleted) continue;
    const cvRecordId = (profile.attachedDocuments || [])
      .map((d) => (d.id.startsWith("doc-cv-") ? d.id.slice("doc-cv-".length) : null))
      .filter(Boolean)
      .pop();
    if (!cvRecordId) {
      console.log(`${row.id}: no stored CV record, skipping`);
      continue;
    }

    const loaded = await loadCvBuffer(cvRecordId);
    if (!loaded) {
      console.log(`${row.id}: CV file unavailable, skipping`);
      continue;
    }

    console.log(`${row.id}: re-extracting from ${loaded.record.original_file_name}...`);
    const text = await extractTextFromPdf(loaded.buffer);
    const ai = await extractCvWithAI(loaded.buffer.toString("base64"), "application/pdf", text);
    if (!ai) {
      console.log(`${row.id}: extraction failed again, leaving as review_required`);
      continue;
    }

    const validation = validateExtraction(ai, loaded.record.original_file_name || "cv.pdf");
    const oldStructured = parseJSONSafe(loaded.record.structured_data);
    const rebuilt = buildFullProfileFromRecord({
      id: cvRecordId,
      employee_id: profile.employeeId,
      applicant_id: profile.applicantId,
      cv_number: profile.cvNumber,
      candidate_name: ai.candidateName || "",
      structured_data: ai,
      original_file_name: loaded.record.original_file_name,
      original_pdf_url: loaded.record.original_pdf_url,
      avatar_url: profile.avatarUrl || oldStructured.avatarUrl,
      created_at: loaded.record.created_at,
    });
    rebuilt.id = profile.employeeId;
    rebuilt.status = validation.ok ? "active" : "review_required";
    rebuilt.employmentDetails.currentStatus = rebuilt.status;
    rebuilt.attachedDocuments = profile.attachedDocuments?.length ? profile.attachedDocuments : rebuilt.attachedDocuments;

    await saveProfileToDb(rebuilt);
    await supabase
      .from("cv_records")
      .update({
        candidate_name: rebuilt.name,
        structured_data: JSON.stringify({ ...ai, employeeId: rebuilt.employeeId, avatarUrl: rebuilt.avatarUrl }),
      })
      .eq("id", cvRecordId);

    console.log(
      `${row.id}: "${row.name}" -> "${rebuilt.name}" | ${rebuilt.status} | edu: ${rebuilt.educationalQualifications.length} exp: ${rebuilt.workExperience.length}`
    );
    if (validation.ok) fixed++;
  }
  console.log(`\n${fixed}/${rows.length} flagged profile(s) repaired.`);
}
main();
