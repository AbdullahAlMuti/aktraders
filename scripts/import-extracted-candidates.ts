/**
 * Generic, data-driven candidate importer.
 *
 * Reads every *.json file in storage/extracted/ (gitignored — these carry
 * real NID/bank-account numbers and must never reach the remote, see
 * .gitignore and docs/superpowers/specs/2026-08-12-scanned-pdf-ocr-design.md),
 * maps each into a FullEmployeeProfile, and upserts it into `employees` +
 * `cv_records`. Search/filter columns (gender, education, profession,
 * district, division, training, cv_quality, ...) are derived automatically
 * by the existing normalizeProfile/toSearchColumns pipeline (see
 * lib/candidate-normalizer.ts) — nothing about filtering is hardcoded here.
 *
 * This replaces hand-writing one candidate object per PDF (the pattern in
 * scripts/insert-all-extracted-candidates.ts): to ingest another batch,
 * extract each PDF to a JSON file shaped like the ones already in
 * storage/extracted/ and re-run this script. Safe to re-run — every write
 * is an upsert keyed by the NID-derived employee id.
 *
 * Usage:
 *   npx tsx scripts/import-extracted-candidates.ts            # import
 *   npx tsx scripts/import-extracted-candidates.ts --dry-run   # preview only
 */
import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";
import { FullEmployeeProfile } from "../types/employee.types";
import { employeeRowFromProfile } from "../lib/db-schema";
import { normalizeProfile, toSearchColumns } from "../lib/candidate-normalizer";

// ---------------------------------------------------------------- env ----
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

// ---------------------------------- shape of one storage/extracted file --
interface Extracted {
  sourceFile: string;
  serial: string;
  fullNameBn: string;
  fullNameEn: string;
  fatherName: string;
  motherName: string;
  presentAddress: string;
  permanentAddress: string;
  nid: string;
  dob: string;
  age: number | null;
  gender: string;
  nationality: string;
  religion: string;
  maritalStatus: string;
  heightText: string;
  weightText: string;
  bankAccount: string;
  mobile: string;
  nidIssueDate: string;
  nidExpiryDate: string;
  postApplied: string;
  educationLevelRaw: string;
  educationInstitution: string;
  educationPassingYear: string;
  employer: string;
  employmentStartDate: string;
  certificateDate: string;
  certificateSignatory: string;
  certificateFullText: string;
  biodataRawText: string;
  notes: string;
}

function digitsOnly(value: string | undefined | null): string {
  return (value || "").replace(/\D/g, "");
}

function last6(value: string): string {
  const digits = digitsOnly(value);
  return (digits.slice(-6) || "000000").padStart(6, "0");
}

function slugify(value: string): string {
  const slug = (value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ".")
    .replace(/^\.+|\.+$/g, "");
  return slug || "candidate";
}

function displayName(e: Extracted): string {
  const bn = (e.fullNameBn || "").trim();
  const en = (e.fullNameEn || "").trim();
  if (bn && en) return `${bn} (${en})`;
  return bn || en || `Candidate ${e.serial}`;
}

/** Mirrors the mapping already used for the 4 hand-written candidates in
 * scripts/insert-all-extracted-candidates.ts, generalized to any extracted
 * record instead of one literal per person. */
function buildProfile(e: Extracted): { profile: FullEmployeeProfile; extractedText: string } {
  const idSeed = last6(e.nid || e.mobile || e.serial);
  const employeeId = `EMP-${idSeed}`;
  const applicantId = `APP-${idSeed}`;
  const cvNumber = `CV-${idSeed}`;
  const name = displayName(e);
  const emailSlug = slugify(e.fullNameEn || e.fullNameBn || `candidate-${e.serial}`);
  const email = `${emailSlug}@aktraders.com`;
  const phone = digitsOnly(e.mobile) || e.mobile || "";
  const nowIso = new Date().toISOString();

  const otherSocialLinks = [
    e.fatherName ? `পিতার নাম: ${e.fatherName}` : "",
    e.motherName ? `মাতার নাম: ${e.motherName}` : "",
    e.heightText ? `উচ্চতা: ${e.heightText}` : "",
    e.weightText ? `ওজন: ${e.weightText}` : "",
    e.bankAccount ? `ব্যাংক একাউন্ট নম্বর: ${e.bankAccount}` : "",
    e.nidIssueDate ? `জাতীয় পরিচয়পত্র ইস্যু তারিখ: ${e.nidIssueDate}` : "",
    e.nidExpiryDate ? `মেয়াদ উত্তীর্ণের তারিখ: ${e.nidExpiryDate}` : "",
  ].filter(Boolean);

  const designation = e.postApplied || "পরিচ্ছন্নতাকর্মী";
  const employer = e.employer || "দুর্নীতি দমন কমিশন, প্রধান কার্যালয়, ঢাকা";

  const profile: FullEmployeeProfile = {
    id: employeeId,
    employeeId,
    applicantId,
    cvNumber,
    name,
    email,
    phone,
    department: "Housekeeping & Cleaning",
    designation,
    organization: employer,
    status: "active",
    joiningDate: e.employmentStartDate || "",
    cvCount: 1,
    personalInformation: {
      fullName: name,
      gender: e.gender === "male" ? "male" : e.gender === "female" ? "female" : "",
      dob: e.dob || "",
      age: typeof e.age === "number" ? e.age : undefined,
      nationality: e.nationality || "Bangladeshi",
      maritalStatus: e.maritalStatus || "",
      religion: e.religion || "",
      nid: digitsOnly(e.nid) || e.nid || "",
      phone,
      email,
      presentAddress: e.presentAddress || "",
      permanentAddress: e.permanentAddress || "",
      otherSocialLinks,
    },
    employmentDetails: {
      employeeId,
      applicantId,
      cvNumber,
      currentStatus: "active",
      currentOrganization: employer,
      currentDesignation: designation,
      department: "Housekeeping & Cleaning",
      employmentType: "Outsource / Contractual",
      currentLocation: "ঢাকা",
      joiningDate: e.employmentStartDate || "",
      careerLevel: "Entry Level",
      totalExperienceYears: 3,
    },
    educationalQualifications: e.educationLevelRaw
      ? [
          {
            id: `edu-${employeeId}-1`,
            degree: e.educationLevelRaw,
            qualificationName: e.educationLevelRaw,
            major: "সাধারণ শিক্ষা",
            institution: e.educationInstitution || "",
            board: "general",
            passingYear: e.educationPassingYear || "",
            result: "উত্তীর্ণ (Passed)",
          },
        ]
      : [],
    workExperience: [
      {
        id: `exp-${employeeId}-1`,
        organizationName: employer,
        jobTitle: `${designation} (আউটসোর্সিং)`,
        designation,
        department: "প্রশাসন ও সেবা",
        employmentType: "আউটসোর্সিং / চুক্তিভিত্তিক",
        location: "ঢাকা",
        startDate: e.employmentStartDate || "",
        endDate: "Present",
        isCurrent: true,
        // deriveExperienceYears's regex wants a bare year before the dash
        // (see lib/candidate-normalizer.ts) — a full ISO date here would
        // silently fail to match and leave experience_years null.
        duration: e.employmentStartDate ? `${e.employmentStartDate.slice(0, 4)} - Present` : "",
        responsibilities: e.certificateFullText || "",
      },
    ],
    attachedDocuments: [
      {
        id: `doc-cv-${employeeId}`,
        documentId: cvNumber,
        documentType: "original_cv",
        originalFileName: e.sourceFile || `${name}.pdf`,
        fileUrl: "",
        fileSize: "PDF Document (3 Pages)",
        mimeType: "application/pdf",
        uploadDate: nowIso,
        version: 1,
      },
    ],
    otherDetails: {
      skills: [
        "পরিচ্ছন্নতা কার্যক্রম (Cleaning)",
        "অফিস স্যানিটেশন (Sanitation)",
        "বর্জ্য অপসারণ (Waste Management)",
        "স্বাস্থ্যবিধি রক্ষা",
      ],
      languages: ["বাংলা (Bengali)"],
      certifications: [
        e.certificateDate
          ? `প্রত্যয়ন পত্র - দুর্নীতি দমন কমিশন (দুদক প্রধান কার্যালয়, ${e.certificateDate})`
          : "প্রত্যয়ন পত্র - দুর্নীতি দমন কমিশন (দুদক প্রধান কার্যালয়)",
      ],
      professionalSummary:
        "পরিশ্রমী ও দায়িত্বশীল পরিচ্ছন্নতাকর্মী। দুর্নীতি দমন কমিশন প্রধান কার্যালয়ে আউটসোর্সিং প্রক্রিয়ায় ২০২৩ সাল হতে সততা ও সুনামের সাথে সেবা দিয়ে যাচ্ছেন।",
      additionalNotes: [
        e.nid ? `জাতীয় পরিচয়পত্র নং: ${e.nid}` : "",
        e.bankAccount ? `ব্যাংক একাউন্ট নং: ${e.bankAccount}` : "",
        e.notes ? `Extraction notes: ${e.notes}` : "",
      ]
        .filter(Boolean)
        .join(" | "),
    },
    createdAt: nowIso,
    updatedAt: nowIso,
  };

  const extractedText = [e.biodataRawText, e.certificateFullText].filter(Boolean).join("\n\n");
  return { profile, extractedText };
}

async function main() {
  const dryRun = process.argv.includes("--dry-run");

  if (!fs.existsSync(EXTRACTED_DIR)) {
    console.log(`No storage/extracted/ directory found — nothing to import.`);
    return;
  }
  const files = fs
    .readdirSync(EXTRACTED_DIR)
    .filter((f) => f.endsWith(".json"))
    .sort();
  if (files.length === 0) {
    console.log("No *.json files in storage/extracted/. Nothing to import.");
    return;
  }

  console.log(`🚀 Importing ${files.length} candidate file(s) from storage/extracted/${dryRun ? " (dry run)" : ""}`);
  const summary: Array<{ file: string; id: string; name: string; status: string }> = [];

  for (const file of files) {
    const raw = fs.readFileSync(path.join(EXTRACTED_DIR, file), "utf-8");
    let extracted: Extracted;
    try {
      extracted = JSON.parse(raw);
    } catch (err: any) {
      console.error(`❌ Skipping ${file}: invalid JSON (${err.message})`);
      summary.push({ file, id: "-", name: "-", status: `invalid json: ${err.message}` });
      continue;
    }

    const { profile, extractedText } = buildProfile(extracted);
    const baseRow = employeeRowFromProfile(profile);
    const searchCols = toSearchColumns(normalizeProfile(profile));
    const fullRow = { ...baseRow, ...searchCols, search_indexed_at: new Date().toISOString() };

    console.log(`\n📄 ${file} -> ${profile.employeeId} | ${profile.name}`);
    console.log("   derived search columns:", searchCols);

    if (dryRun) {
      summary.push({ file, id: profile.employeeId, name: profile.name, status: "dry-run (not written)" });
      continue;
    }

    const { error: empError } = await supabase.from("employees").upsert(fullRow, { onConflict: "id" });
    if (empError) {
      console.error(`   ❌ employees upsert failed: ${empError.message}`);
      summary.push({ file, id: profile.employeeId, name: profile.name, status: `employees error: ${empError.message}` });
      continue;
    }

    const cvRecordId = `cv-${profile.employeeId.toLowerCase()}`;
    const { error: cvError } = await supabase.from("cv_records").upsert(
      {
        id: cvRecordId,
        candidate_name: profile.name,
        extracted_text: extractedText,
        original_file_name: extracted.sourceFile,
        original_pdf_url: "",
        structured_data: profile,
        avatar_url: profile.avatarUrl || null,
        created_at: profile.createdAt,
        updated_at: profile.updatedAt,
      },
      { onConflict: "id" }
    );
    if (cvError) {
      console.error(`   ❌ cv_records upsert failed: ${cvError.message}`);
      summary.push({ file, id: profile.employeeId, name: profile.name, status: `cv_records error: ${cvError.message}` });
      continue;
    }

    console.log(`   ✅ saved`);
    summary.push({ file, id: profile.employeeId, name: profile.name, status: "saved" });
  }

  console.log("\n=== Import summary ===");
  console.table(summary);

  if (!dryRun) {
    const { data: allEmps, error } = await supabase
      .from("employees")
      .select("id, name, gender, education_level, district, profession, experience_years, cv_quality")
      .order("id");
    if (error) {
      console.error("Verification query failed:", error.message);
    } else {
      console.log(`\n✅ Total employees now in database: ${allEmps?.length}`);
      console.table(allEmps);
    }
  }
}

main().catch((err) => {
  console.error("Import failed:", err);
  process.exit(1);
});
