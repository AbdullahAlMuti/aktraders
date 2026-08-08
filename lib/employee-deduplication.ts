import { FullEmployeeProfile } from "@/types/employee.types";
import {
  localEmployeeStore,
  buildFullProfileFromRecord,
  profileFromEmployeeRow,
  saveProfileToDb,
  supabase,
} from "./db-schema";

export interface UpsertResult {
  isNew: boolean;
  profile: FullEmployeeProfile;
}

/**
 * Generates stable sequential / deterministic identifiers for system entities.
 */
export function generateIdentifiers(sequenceNumber?: number) {
  const num = sequenceNumber || Math.floor(100000 + Math.random() * 900000);
  return {
    employeeId: `EMP-${num}`,
    applicantId: `APP-${num}`,
    cvNumber: `CV-${num}`,
  };
}

/**
 * Normalizes email for case-insensitive deduplication matching.
 */
export function normalizeEmail(email?: string): string {
  if (!email) return "";
  return email.trim().toLowerCase();
}

/**
 * Normalizes phone numbers for matching (e.g. "+8801700-123456" -> "01700123456").
 */
export function normalizePhone(phone?: string): string {
  if (!phone) return "";
  return phone.replace(/[^0-9]/g, "").slice(-11);
}

function normalizeName(name?: string): string {
  if (!name) return "";
  return name.trim().toLowerCase().replace(/\s+/g, " ");
}

function firstNonEmpty<T>(...values: T[]): T | undefined {
  for (const v of values) {
    if (v === undefined || v === null) continue;
    if (typeof v === "string" && v.trim() === "") continue;
    if (Array.isArray(v) && v.length === 0) continue;
    return v;
  }
  return undefined;
}

/**
 * Merges a freshly extracted CV profile into an existing employee profile.
 * New non-empty values win (latest CV is most current); existing values are
 * kept where the new CV says nothing. Identifiers and history are preserved.
 */
function mergeProfiles(existing: FullEmployeeProfile, incoming: FullEmployeeProfile): FullEmployeeProfile {
  const merged: FullEmployeeProfile = {
    ...existing,
    name: firstNonEmpty(incoming.name, existing.name) || "",
    email: firstNonEmpty(incoming.email, existing.email) || "",
    phone: firstNonEmpty(incoming.phone, existing.phone) || "",
    department: firstNonEmpty(incoming.department, existing.department) || "",
    designation: firstNonEmpty(incoming.designation, existing.designation) || "",
    organization: firstNonEmpty(incoming.organization, existing.organization) || "",
    avatarUrl: firstNonEmpty(existing.avatarUrl, incoming.avatarUrl),
    personalInformation: {
      ...existing.personalInformation,
      ...Object.fromEntries(
        Object.entries(incoming.personalInformation || {}).filter(
          ([, v]) => v !== undefined && v !== null && !(typeof v === "string" && v.trim() === "")
        )
      ),
      photoUrl: firstNonEmpty(existing.avatarUrl, incoming.avatarUrl, existing.personalInformation?.photoUrl),
    },
    employmentDetails: {
      ...existing.employmentDetails,
      currentOrganization: firstNonEmpty(
        incoming.employmentDetails?.currentOrganization,
        existing.employmentDetails?.currentOrganization
      ),
      currentDesignation:
        firstNonEmpty(incoming.employmentDetails?.currentDesignation, existing.employmentDetails?.currentDesignation) ||
        "",
      department: firstNonEmpty(incoming.employmentDetails?.department, existing.employmentDetails?.department) || "",
      totalExperienceYears: firstNonEmpty(
        incoming.employmentDetails?.totalExperienceYears,
        existing.employmentDetails?.totalExperienceYears
      ),
    },
    educationalQualifications: incoming.educationalQualifications?.length
      ? incoming.educationalQualifications
      : existing.educationalQualifications,
    workExperience: incoming.workExperience?.length ? incoming.workExperience : existing.workExperience,
    attachedDocuments: existing.attachedDocuments,
    otherDetails: {
      ...existing.otherDetails,
      ...Object.fromEntries(
        Object.entries(incoming.otherDetails || {}).filter(
          ([, v]) =>
            v !== undefined && v !== null && !(typeof v === "string" && v.trim() === "") && !(Array.isArray(v) && v.length === 0)
        )
      ),
    },
    updatedAt: new Date().toISOString(),
  };

  return merged;
}

async function fetchAllProfiles(): Promise<FullEmployeeProfile[]> {
  const profiles: FullEmployeeProfile[] = [];
  const seen = new Set<string>();

  try {
    const { data } = await supabase.from("employees").select("*").limit(2000);
    for (const row of data || []) {
      const p = profileFromEmployeeRow(row);
      if (p.deleted) continue;
      if (!seen.has(p.employeeId)) {
        seen.add(p.employeeId);
        profiles.push(p);
      }
    }
  } catch (e) {
    console.warn("Deduplication DB query warning:", e);
  }

  for (const p of localEmployeeStore.values()) {
    if (p.deleted) continue;
    if (!seen.has(p.employeeId)) {
      seen.add(p.employeeId);
      profiles.push(p);
    }
  }

  return profiles;
}

/**
 * Deduplication Engine: matches existing profiles by Email -> Phone -> Name+DOB.
 * Merges the new CV version into a matched profile, or creates a new one.
 * The resulting profile is always persisted to the Supabase `employees` table.
 */
export async function findOrCreateEmployeeProfile(
  candidateData: any,
  rawCvRecord: {
    id: string;
    candidateName: string;
    extractedText: string;
    structuredData: any;
    originalFileName: string;
    originalPdfUrl: string;
    avatarUrl?: string;
  }
): Promise<UpsertResult> {
  const personal = candidateData?.personal || candidateData?.personalInformation || {};
  const extractedEmail = normalizeEmail(personal.email);
  const extractedPhone = normalizePhone(personal.mobile || personal.phone);
  const extractedName = normalizeName(candidateData?.candidateName || personal.fullName || rawCvRecord.candidateName);
  const extractedDob = (personal.dob || "").trim();

  const allProfiles = await fetchAllProfiles();

  let existingProfile: FullEmployeeProfile | null = null;

  // 1. Match by Email
  if (extractedEmail) {
    existingProfile = allProfiles.find((p) => normalizeEmail(p.email) === extractedEmail) || null;
  }

  // 2. Match by Phone
  if (!existingProfile && extractedPhone) {
    existingProfile = allProfiles.find((p) => normalizePhone(p.phone) === extractedPhone) || null;
  }

  // 3. Match by Name + DOB
  if (!existingProfile && extractedName && extractedDob) {
    existingProfile =
      allProfiles.find(
        (p) => normalizeName(p.name) === extractedName && (p.personalInformation?.dob || "").trim() === extractedDob
      ) || null;
  }

  // The AI extraction may arrive via either argument; prefer the richer candidateData.
  const structuredForProfile =
    candidateData && Object.keys(candidateData).length > 0 ? candidateData : rawCvRecord.structuredData;

  const newDoc = {
    id: `doc-cv-${rawCvRecord.id}`,
    documentId: "",
    documentType: "updated_cv" as const,
    originalFileName: rawCvRecord.originalFileName,
    fileUrl: rawCvRecord.originalPdfUrl,
    fileSize: "PDF Document",
    mimeType: "application/pdf",
    uploadDate: new Date().toISOString(),
    version: 1,
  };

  // UPDATE EXISTING PROFILE (deduplication hit)
  if (existingProfile) {
    const incoming = buildFullProfileFromRecord({
      id: rawCvRecord.id,
      employee_id: existingProfile.employeeId,
      applicant_id: existingProfile.applicantId,
      cv_number: existingProfile.cvNumber,
      candidate_name: rawCvRecord.candidateName,
      structured_data: structuredForProfile,
      original_file_name: rawCvRecord.originalFileName,
      original_pdf_url: rawCvRecord.originalPdfUrl,
      avatar_url: rawCvRecord.avatarUrl,
      created_at: existingProfile.createdAt,
    });

    const merged = mergeProfiles(existingProfile, incoming);
    newDoc.documentId = merged.cvNumber;
    newDoc.version = (merged.attachedDocuments?.length || 0) + 1;
    merged.attachedDocuments = [...(merged.attachedDocuments || []), newDoc];
    merged.cvCount = merged.attachedDocuments.length;

    await saveProfileToDb(merged);
    return { isNew: false, profile: merged };
  }

  // CREATE NEW PROFILE
  const ids = generateIdentifiers();
  const newProfile = buildFullProfileFromRecord({
    id: rawCvRecord.id,
    employee_id: ids.employeeId,
    applicant_id: ids.applicantId,
    cv_number: ids.cvNumber,
    candidate_name: rawCvRecord.candidateName,
    structured_data: structuredForProfile,
    original_file_name: rawCvRecord.originalFileName,
    original_pdf_url: rawCvRecord.originalPdfUrl,
    avatar_url: rawCvRecord.avatarUrl,
    created_at: new Date().toISOString(),
  });

  // Profiles are keyed by their stable employee id in the database.
  newProfile.id = ids.employeeId;

  await saveProfileToDb(newProfile);
  return { isNew: true, profile: newProfile };
}
