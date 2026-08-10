import { createClient } from "@supabase/supabase-js";
import {
  FullEmployeeProfile,
  PersonalInformation,
  EmploymentDetails,
  EducationRecord,
  ExperienceRecord,
  AttachedDocument,
  OtherDetails,
} from "@/types/employee.types";
// Experience derivation and the search-column mapping live in the normalizer so
// there is exactly one implementation of each rule (see the candidate-search spec).
import { deriveExperienceYears, normalizeProfile, toSearchColumns } from "@/lib/candidate-normalizer";
import { isMissingColumnError } from "@/lib/candidate-query";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://qbawcgxjvjkvtgtczseo.supabase.co";
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "missing-key";
// Next.js patches global fetch with a cache that can replay stale Supabase
// responses across requests (and even server restarts). The DB must always be
// read live — opt every Supabase call out of that cache.
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  global: {
    fetch: (url: any, init: any = {}) => fetch(url, { ...init, cache: "no-store" }),
  },
});

/**
 * In-memory cache. The Supabase `employees` table is the source of truth;
 * this only avoids repeated DB round-trips within a single server process.
 */
const globalForDB = globalThis as unknown as {
  localEmployeeStore: Map<string, FullEmployeeProfile> | undefined;
};

export const localEmployeeStore = globalForDB.localEmployeeStore ?? new Map<string, FullEmployeeProfile>();
globalForDB.localEmployeeStore = localEmployeeStore;

export function parseJSONSafe(str: string) {
  try {
    return JSON.parse(str);
  } catch {
    return {};
  }
}

function asArray(value: any): any[] {
  return Array.isArray(value) ? value : [];
}

function asStringArray(value: any): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((v) => (typeof v === "string" ? v : typeof v === "object" && v ? v.name || v.title || JSON.stringify(v) : String(v)))
    .filter((v) => v && v.trim().length > 0);
}

function str(value: any): string {
  return typeof value === "string" ? value.trim() : "";
}

function deriveIdsFromSeed(seed: string) {
  const digits = (seed || "").replace(/[^0-9]/g, "").slice(-6).padStart(6, "0");
  return {
    employeeId: `EMP-${digits}`,
    applicantId: `APP-${digits}`,
    cvNumber: `CV-${digits}`,
  };
}

/**
 * Maps AI-structured CV data (see ExtractedCvData in lib/ai-provider.ts) onto the 6 profile tabs.
 * Missing fields become empty values — nothing is invented.
 */
export function buildFullProfileFromRecord(record: any): FullEmployeeProfile {
  const structured =
    record.structured_data
      ? typeof record.structured_data === "string"
        ? parseJSONSafe(record.structured_data)
        : record.structured_data
      : {};

  const uniqueId = record.id || `emp-${Date.now()}`;
  const derived = deriveIdsFromSeed(uniqueId);
  const empId = record.employee_id || structured.employeeId || derived.employeeId;
  const appId = record.applicant_id || structured.applicantId || derived.applicantId;
  const cvNum = record.cv_number || structured.cvNumber || derived.cvNumber;

  const p = structured.personal || structured.personalInformation || {};
  const avatarUrl = record.avatar_url || structured.avatarUrl || str(p.photoUrl) || undefined;

  const personalInfo: PersonalInformation = {
    fullName: str(record.candidate_name) || str(p.fullName) || "",
    photoUrl: avatarUrl,
    gender: str(p.gender),
    dob: str(p.dob),
    nationality: str(p.nationality),
    maritalStatus: str(p.maritalStatus),
    religion: str(p.religion),
    nid: str(p.nid),
    phone: str(p.mobile) || str(p.phone),
    email: str(p.email),
    presentAddress: str(p.presentAddress) || str(p.address),
    permanentAddress: str(p.permanentAddress),
    linkedinUrl: str(p.linkedinUrl) || str(p.linkedin),
    githubUrl: str(p.githubUrl) || str(p.github),
    portfolioUrl: str(p.portfolioUrl) || str(p.website) || str(p.portfolio),
  };

  const emp = structured.employment || structured.employmentDetails || {};
  const expSource = asArray(structured.experience || structured.workExperience);

  const employmentDetails: EmploymentDetails = {
    employeeId: empId,
    applicantId: appId,
    cvNumber: cvNum,
    currentStatus: "active",
    currentOrganization: str(emp.workplace) || str(emp.currentOrganization),
    currentDesignation: str(emp.designation) || str(emp.currentDesignation),
    department: str(emp.department),
    employmentType: str(emp.employmentType),
    joiningDate: str(emp.joiningDate) || (record.created_at ? String(record.created_at).split("T")[0] : ""),
    totalExperienceYears: deriveExperienceYears(expSource) ?? undefined,
  };

  const education: EducationRecord[] = asArray(structured.education || structured.educationalQualifications).map(
    (e: any, idx: number) => ({
      id: `edu-${uniqueId}-${idx}`,
      degree: str(e.degree) || str(e.qualificationName),
      qualificationName: str(e.qualificationName) || str(e.degree),
      major: str(e.major) || str(e.subject),
      institution: str(e.institution),
      board: str(e.board),
      startDate: str(e.startDate),
      endDate: str(e.endDate),
      passingYear: str(e.passingYear) || str(e.duration),
      result: str(e.result) || str(e.gpaCgpa),
      gpaCgpa: str(e.gpaCgpa) || str(e.result),
    })
  );

  const experience: ExperienceRecord[] = expSource.map((exp: any, idx: number) => ({
    id: `exp-${uniqueId}-${idx}`,
    organizationName: str(exp.company) || str(exp.organizationName),
    jobTitle: str(exp.role) || str(exp.jobTitle) || str(exp.designation),
    designation: str(exp.designation) || str(exp.role),
    duration: str(exp.duration),
    startDate: str(exp.startDate),
    endDate: str(exp.endDate),
    isCurrent: Boolean(exp.isCurrent),
    responsibilities: str(exp.description) || str(exp.responsibilities),
  }));

  const docs: AttachedDocument[] = [
    {
      id: `doc-cv-${uniqueId}`,
      documentId: cvNum,
      documentType: "original_cv",
      originalFileName: record.original_file_name || "CV.pdf",
      fileUrl: record.original_pdf_url || "",
      fileSize: "PDF Document",
      mimeType: "application/pdf",
      uploadDate: record.created_at || new Date().toISOString(),
      version: 1,
    },
  ];

  const o = structured.other || structured.otherDetails || {};
  const other: OtherDetails = {
    skills: asStringArray(o.skills),
    languages: asStringArray(o.languages),
    certifications: asStringArray(o.certifications),
    projects: asStringArray(o.projects),
    awards: asStringArray(o.achievements || o.awards),
    references: asStringArray(o.references),
    careerObjective: str(o.careerObjective),
    professionalSummary: str(o.professionalSummary) || str(o.summary),
  };

  return {
    id: uniqueId,
    employeeId: empId,
    applicantId: appId,
    cvNumber: cvNum,
    name: personalInfo.fullName,
    email: personalInfo.email,
    phone: personalInfo.phone,
    department: employmentDetails.department,
    designation: employmentDetails.currentDesignation,
    organization: employmentDetails.currentOrganization || "",
    status: "active",
    joiningDate: employmentDetails.joiningDate || "",
    avatarUrl,
    cvCount: docs.length,
    personalInformation: personalInfo,
    employmentDetails,
    educationalQualifications: education,
    workExperience: experience,
    attachedDocuments: docs,
    otherDetails: other,
    createdAt: record.created_at || new Date().toISOString(),
    updatedAt: record.updated_at || new Date().toISOString(),
  };
}

/**
 * Converts a FullEmployeeProfile into a row for the Supabase `employees` table.
 * The full 6-tab profile is stored in the `cv_data` jsonb column; summary columns
 * keep the directory/list view fast.
 */
export function employeeRowFromProfile(profile: FullEmployeeProfile) {
  return {
    id: profile.employeeId,
    name: profile.name || "",
    email: profile.email || "",
    phone: profile.phone || "",
    department: profile.department || "",
    designation: profile.designation || "",
    status: profile.status || "active",
    joining_date: /^\d{4}-\d{2}-\d{2}/.test(profile.joiningDate || "") ? profile.joiningDate.slice(0, 10) : null,
    cv_file_name: profile.attachedDocuments?.[profile.attachedDocuments.length - 1]?.originalFileName || null,
    cv_file_size: profile.attachedDocuments?.[profile.attachedDocuments.length - 1]?.fileSize || null,
    avatar_url: profile.avatarUrl || null,
    cv_data: profile,
  };
}

/**
 * Restores a FullEmployeeProfile from a Supabase `employees` row.
 * Rows written by this system store the complete profile in `cv_data`;
 * legacy/seed rows only carry a flat summary and are mapped without fabricating data.
 */
export function profileFromEmployeeRow(row: any): FullEmployeeProfile {
  const cvData = row.cv_data ? (typeof row.cv_data === "string" ? parseJSONSafe(row.cv_data) : row.cv_data) : {};

  if (cvData && cvData.personalInformation && cvData.employmentDetails) {
    const profile = cvData as FullEmployeeProfile;
    profile.deleted = cvData.deleted === true;
    // Summary columns win: they reflect the latest direct edits.
    profile.id = row.id;
    profile.employeeId = row.id;
    profile.name = row.name || profile.name;
    profile.email = row.email ?? profile.email;
    profile.phone = row.phone ?? profile.phone;
    profile.department = row.department ?? profile.department;
    profile.designation = row.designation ?? profile.designation;
    profile.status = row.status || profile.status || "active";
    profile.avatarUrl = row.avatar_url || profile.avatarUrl;
    if (profile.personalInformation && profile.avatarUrl) {
      profile.personalInformation.photoUrl = profile.avatarUrl;
    }
    return profile;
  }

  // Legacy flat cv_data (pre-6-tab seed rows)
  const legacyDeleted = cvData?.deleted === true;
  const derived = deriveIdsFromSeed(row.id);
  const education: EducationRecord[] = cvData.degree
    ? [
        {
          id: `edu-${row.id}-0`,
          degree: str(cvData.degree),
          major: "",
          institution: str(cvData.institution),
          passingYear: "",
          result: "",
        },
      ]
    : [];

  return {
    id: row.id,
    employeeId: row.id,
    applicantId: derived.applicantId,
    cvNumber: derived.cvNumber,
    name: row.name || str(cvData.fullName),
    email: row.email || str(cvData.email),
    phone: row.phone || str(cvData.phone),
    department: row.department || "",
    designation: row.designation || "",
    organization: "",
    status: row.status || "active",
    joiningDate: row.joining_date || "",
    avatarUrl: row.avatar_url || undefined,
    cvCount: row.cv_file_name ? 1 : 0,
    personalInformation: {
      fullName: row.name || str(cvData.fullName),
      photoUrl: row.avatar_url || undefined,
      dob: str(cvData.dob),
      nid: str(cvData.nidNo),
      phone: row.phone || str(cvData.phone),
      email: row.email || str(cvData.email),
    },
    employmentDetails: {
      employeeId: row.id,
      applicantId: derived.applicantId,
      cvNumber: derived.cvNumber,
      currentStatus: row.status || "active",
      currentDesignation: row.designation || "",
      department: row.department || "",
      joiningDate: row.joining_date || "",
    },
    educationalQualifications: education,
    workExperience: [],
    attachedDocuments: row.cv_file_name
      ? [
          {
            id: `doc-cv-${row.id}`,
            documentId: derived.cvNumber,
            documentType: "original_cv",
            originalFileName: row.cv_file_name,
            fileUrl: "",
            fileSize: row.cv_file_size || "",
            mimeType: "application/pdf",
            uploadDate: row.created_at || new Date().toISOString(),
            version: 1,
          },
        ]
      : [],
    otherDetails: {
      skills: asStringArray(cvData.skills),
    },
    createdAt: row.created_at || new Date().toISOString(),
    updatedAt: row.created_at || new Date().toISOString(),
    deleted: legacyDeleted,
  };
}

/**
 * Persists a full profile to the Supabase `employees` table (upsert by employeeId)
 * and refreshes the in-memory cache. Returns false when the DB write failed.
 */
export async function saveProfileToDb(profile: FullEmployeeProfile): Promise<boolean> {
  localEmployeeStore.set(profile.employeeId, profile);

  const baseRow = employeeRowFromProfile(profile);
  // Derived search columns are recomputed on every write, so a profile is
  // filterable the moment it is saved rather than only after a backfill.
  const rowWithSearchColumns = { ...baseRow, ...toSearchColumns(normalizeProfile(profile)) };

  try {
    const { error } = await supabase.from("employees").upsert(rowWithSearchColumns, { onConflict: "id" });
    if (!error) return true;

    // Until the candidate-search migration is applied those columns do not
    // exist. Uploading a CV must not start failing because of that, so fall
    // back to the base row; the backfill fills the search columns in later.
    if (isMissingColumnError(error)) {
      console.warn(
        "saveProfileToDb: candidate-search columns missing, saved without them. " +
          "Run supabase/migrations/20260810_candidate_search.sql to enable filtering."
      );
      const { error: baseError } = await supabase.from("employees").upsert(baseRow, { onConflict: "id" });
      if (!baseError) return true;
      console.warn("saveProfileToDb warning:", baseError.message);
      return false;
    }

    console.warn("saveProfileToDb warning:", error.message);
    return false;
  } catch (e: any) {
    console.warn("saveProfileToDb error:", e?.message || e);
    return false;
  }
}

/**
 * Loads a single profile from the `employees` table by any identifier
 * (employees.id / EMP / APP / CV number / email). Returns null when not found.
 */
export async function loadProfileFromDb(id: string): Promise<FullEmployeeProfile | null> {
  try {
    const { data } = await supabase.from("employees").select("*").eq("id", id).limit(1);
    if (data && data.length > 0) {
      const profile = profileFromEmployeeRow(data[0]);
      return profile.deleted ? null : profile;
    }

    // Match by alternate identifiers stored inside cv_data
    const { data: all } = await supabase.from("employees").select("*").limit(2000);
    if (all) {
      for (const row of all) {
        const profile = profileFromEmployeeRow(row);
        if (profile.deleted) continue;
        if (
          profile.applicantId === id ||
          profile.cvNumber === id ||
          profile.email.toLowerCase() === id.toLowerCase() ||
          (profile.attachedDocuments || []).some((d) => d.id === `doc-cv-${id}`)
        ) {
          return profile;
        }
      }
    }
  } catch (e) {
    console.warn("loadProfileFromDb warning:", e);
  }
  return null;
}

/**
 * Deletes an employee everywhere: raw cv_records rows are removed, and the
 * employees row is hard-deleted when RLS permits — otherwise soft-deleted
 * (status "inactive" + cv_data.deleted flag) so it disappears from the app.
 * Accepts any identifier (EMP-/APP-/CV- id or raw cv record id).
 */
export async function deleteEmployeeEverywhere(id: string): Promise<boolean> {
  try {
    let { data } = await supabase.from("employees").select("*").eq("id", id).limit(1);
    let row = data?.[0];

    if (!row) {
      const { data: all } = await supabase.from("employees").select("*").limit(2000);
      row = (all || []).find((r: any) => {
        const p = profileFromEmployeeRow(r);
        return (
          p.applicantId === id || p.cvNumber === id || (p.attachedDocuments || []).some((d) => d.id === `doc-cv-${id}`)
        );
      });
    }

    const cvRecordIds = new Set<string>([id]);
    if (row) {
      const p = profileFromEmployeeRow(row);
      for (const d of p.attachedDocuments || []) {
        if (d.id.startsWith("doc-cv-")) cvRecordIds.add(d.id.slice("doc-cv-".length));
      }
      for (const key of [row.id, p.id, p.applicantId, p.cvNumber]) {
        if (key) localEmployeeStore.delete(key);
      }
    }
    localEmployeeStore.delete(id);

    await supabase.from("cv_records").delete().in("id", Array.from(cvRecordIds));

    if (row) {
      await supabase.from("employees").delete().eq("id", row.id);
      const { data: check } = await supabase.from("employees").select("id").eq("id", row.id).limit(1);
      if (check && check.length > 0) {
        const cvData = typeof row.cv_data === "string" ? parseJSONSafe(row.cv_data) : row.cv_data || {};
        const { error } = await supabase
          .from("employees")
          .update({ status: "inactive", cv_data: { ...cvData, deleted: true } })
          .eq("id", row.id);
        if (error) {
          console.warn("Soft-delete warning:", error.message);
          return false;
        }
      }
    }
    return true;
  } catch (e: any) {
    console.warn("deleteEmployeeEverywhere error:", e?.message || e);
    return false;
  }
}
