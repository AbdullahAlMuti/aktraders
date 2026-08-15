/**
 * Wires cropped candidate photos (storage/extracted/photos/<serial>-<slug>.png,
 * produced by rendering + cropping page 1 of each source PDF — see
 * scripts/import-extracted-candidates.ts and the memory note on this batch)
 * into the app's existing avatar convention:
 *
 *   public/uploads/photos/<employeeId-lowercase>_avatar.png   (served at /uploads/photos/...)
 *   employees.avatar_url = that URL
 *
 * employeeId is derived the same way as the importer (EMP-<last 6 digits of
 * NID>), read straight from the matching storage/extracted/<serial>-*.json
 * file, so this never needs a hardcoded serial->employeeId table.
 *
 * Usage: npx tsx scripts/wire-candidate-photos.ts [--dry-run]
 */
import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";

const envPath = path.resolve(process.cwd(), ".env.local");
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, "utf-8").split("\n")) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#") && trimmed.includes("=")) {
      const idx = trimmed.indexOf("=");
      process.env[trimmed.slice(0, idx).trim()] = trimmed.slice(idx + 1).trim();
    }
  }
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://kvddegdgvdzldlwslvre.supabase.co";
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
if (!serviceKey) {
  console.error("Missing SUPABASE_SERVICE_ROLE_KEY (or a publishable key) in .env.local");
  process.exit(1);
}
const supabase = createClient(supabaseUrl, serviceKey, {
  global: { fetch: (url: any, init: any = {}) => fetch(url, { ...init, cache: "no-store" }) },
});

const EXTRACTED_DIR = path.resolve(process.cwd(), "storage/extracted");
const PHOTOS_DIR = path.join(EXTRACTED_DIR, "photos");
const PUBLIC_PHOTOS_DIR = path.resolve(process.cwd(), "public/uploads/photos");

/**
 * The 4 candidates inserted before this dynamic pipeline existed
 * (scripts/insert-all-extracted-candidates.ts) have no storage/extracted/*.json
 * file to derive an employeeId from, so their serial->employeeId mapping is
 * recorded here instead. Every candidate added through the pipeline going
 * forward needs no entry here - it's picked up from its JSON file.
 */
const LEGACY_SERIAL_TO_EMPLOYEE: Record<string, { employeeId: string; name: string }> = {
  "001": { employeeId: "EMP-478902", name: "আব্দুল রাজ্জাক (রাকিবুল)" },
  "002": { employeeId: "EMP-890997", name: "সেলিনা আক্তার" },
  "003": { employeeId: "EMP-231684", name: "সাথী" },
  "018": { employeeId: "EMP-799406", name: "মোসাঃ সালমা বেগম" },
};

function digitsOnly(value: string | undefined | null): string {
  return (value || "").replace(/\D/g, "");
}

function last6(value: string): string {
  const digits = digitsOnly(value);
  return (digits.slice(-6) || "000000").padStart(6, "0");
}

async function main() {
  const dryRun = process.argv.includes("--dry-run");

  if (!fs.existsSync(PHOTOS_DIR)) {
    console.log("No storage/extracted/photos/ directory - nothing to wire.");
    return;
  }
  const jsonFiles = fs.existsSync(EXTRACTED_DIR) ? fs.readdirSync(EXTRACTED_DIR).filter((f) => f.endsWith(".json")) : [];
  const photoFiles = fs.readdirSync(PHOTOS_DIR).filter((f) => f.endsWith(".png"));

  fs.mkdirSync(PUBLIC_PHOTOS_DIR, { recursive: true });

  const summary: Array<{ serial: string; employeeId: string; name: string; status: string }> = [];

  for (const photoFile of photoFiles) {
    const serial = photoFile.split("-")[0];
    const jsonFile = jsonFiles.find((f) => f.startsWith(`${serial}-`));

    let employeeId: string;
    let name: string;
    if (jsonFile) {
      const raw = JSON.parse(fs.readFileSync(path.join(EXTRACTED_DIR, jsonFile), "utf-8"));
      employeeId = `EMP-${last6(raw.nid || raw.mobile || raw.serial)}`;
      name = raw.fullNameBn || raw.fullNameEn || raw.serial;
    } else if (LEGACY_SERIAL_TO_EMPLOYEE[serial]) {
      employeeId = LEGACY_SERIAL_TO_EMPLOYEE[serial].employeeId;
      name = LEGACY_SERIAL_TO_EMPLOYEE[serial].name;
    } else {
      console.log(`⏭  ${photoFile}: no JSON record and no legacy mapping for serial ${serial}, skipped`);
      summary.push({ serial, employeeId: "?", name: "?", status: "no employeeId mapping found" });
      continue;
    }

    const destFileName = `${employeeId.toLowerCase()}_avatar.png`;
    const destPath = path.join(PUBLIC_PHOTOS_DIR, destFileName);
    const publicUrl = `/uploads/photos/${destFileName}`;

    if (!dryRun) {
      fs.copyFileSync(path.join(PHOTOS_DIR, photoFile), destPath);
    }
    console.log(`${dryRun ? "(dry-run) " : ""}${photoFile} -> public/uploads/photos/${destFileName}`);

    if (dryRun) {
      summary.push({ serial, employeeId, name, status: `dry-run -> ${publicUrl}` });
      continue;
    }

    const { error } = await supabase.from("employees").update({ avatar_url: publicUrl }).eq("id", employeeId);
    if (error) {
      console.error(`   ❌ DB update failed for ${employeeId}: ${error.message}`);
      summary.push({ serial, employeeId, name, status: `db error: ${error.message}` });
      continue;
    }
    console.log(`   ✅ ${employeeId} avatar_url -> ${publicUrl}`);
    summary.push({ serial, employeeId, name, status: "wired" });
  }

  console.log("\n=== Wiring summary ===");
  console.table(summary);

  if (!dryRun) {
    const { data } = await supabase.from("employees").select("id,name,avatar_url").order("id");
    console.log("\nCurrent avatar_url values:");
    console.table(data);
  }
}

main().catch((err) => {
  console.error("Wiring failed:", err);
  process.exit(1);
});
