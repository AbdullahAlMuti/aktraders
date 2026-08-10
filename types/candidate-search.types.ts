import type {
  Availability,
  CvQuality,
  Division,
  EducationBoard,
  EducationLevel,
  Gender,
  ManpowerCategory,
  Profession,
  Sector,
  Shift,
  TrainingType,
  WorkType,
} from "@/constants/candidate-filters";

/**
 * Normalized, filterable fields derived from a FullEmployeeProfile.
 *
 * These map 1:1 onto the flat columns added to `public.employees`. Every field
 * is nullable: the normalizer returns null when a value cannot be determined
 * and never guesses.
 */
export interface CandidateSearchFields {
  gender: Gender | null;
  dateOfBirth: string | null; // ISO yyyy-mm-dd
  educationLevel: EducationLevel | null;
  educationBoard: EducationBoard | null;
  profession: Profession | null;
  /** Raw designation kept verbatim so `other` professions stay searchable. */
  professionRaw: string | null;
  experienceYears: number | null;
  division: Division | null;
  district: string | null;
  isTrained: boolean;
  trainingTypes: TrainingType[];
  cvQuality: CvQuality | null;
}

/** Operational fields — only ever written by an admin action, never derived. */
export interface CandidateOperationalFields {
  manpowerCategory: ManpowerCategory | null;
  workType: WorkType | null;
  shift: Shift | null;
  availability: Availability | null;
  sector: Sector | null;
  projectId: string | null;
}

/**
 * Search filter state. Every field is optional; omitted fields do not constrain
 * the query. Array fields are OR-ed within themselves and AND-ed across groups.
 */
export interface CandidateSearchFilters {
  /** Matches name, employee/applicant/CV id, phone, or designation. */
  keyword?: string;

  minAge?: number;
  maxAge?: number;

  gender?: Gender[];
  educationLevel?: EducationLevel[];
  educationBoard?: EducationBoard[];
  manpowerCategory?: ManpowerCategory[];
  profession?: Profession[];
  department?: string[];
  workType?: WorkType[];
  shift?: Shift[];
  trainingTypes?: TrainingType[];
  /** true = trained only, false = untrained only, undefined = no constraint. */
  isTrained?: boolean;

  minExperience?: number;
  maxExperience?: number;

  cvQuality?: CvQuality[];
  availability?: Availability[];
  sector?: Sector[];
  projectId?: string[];
  /** Include candidates with no project assigned, alongside any projectId matches. */
  unassignedProject?: boolean;

  division?: Division[];
  district?: string[];

  page?: number;
  limit?: number;
  sortBy?: CandidateSortField;
  sortDir?: "asc" | "desc";
}

export type CandidateSortField = "name" | "created_at" | "experience_years" | "date_of_birth";

/** A single row in the result table — deliberately flat and small. */
export interface CandidateSearchRow {
  id: string;
  employeeId: string;
  name: string;
  email: string;
  phone: string;
  avatarUrl?: string | null;
  department: string;
  designation: string;
  status: string;

  gender: Gender | null;
  dateOfBirth: string | null;
  /** Computed from dateOfBirth at read time; null when DOB is unknown. */
  age: number | null;
  educationLevel: EducationLevel | null;
  educationBoard: EducationBoard | null;
  profession: Profession | null;
  experienceYears: number | null;
  division: Division | null;
  district: string | null;
  isTrained: boolean | null;
  trainingTypes: TrainingType[] | null;
  cvQuality: CvQuality | null;

  manpowerCategory: ManpowerCategory | null;
  workType: WorkType | null;
  shift: Shift | null;
  availability: Availability | null;
  sector: Sector | null;
  projectId: string | null;
  projectName: string | null;
}

export interface CandidateSearchMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export type CandidateSearchErrorCode = "MIGRATION_REQUIRED" | "DB_UNREACHABLE" | "BAD_REQUEST";

export type CandidateSearchResponse =
  | { success: true; data: CandidateSearchRow[]; meta: CandidateSearchMeta }
  | { success: false; code: CandidateSearchErrorCode; error: string };

export interface BulkAssignPayload {
  ids: string[];
  fields: Partial<{
    manpower_category: ManpowerCategory | null;
    work_type: WorkType | null;
    shift: Shift | null;
    availability: Availability | null;
    sector: Sector | null;
    project_id: string | null;
  }>;
}

export type BulkAssignResponse =
  | { success: true; updated: number }
  | { success: false; code: CandidateSearchErrorCode; error: string };

export interface Project {
  id: string;
  name: string;
  code: string | null;
  sector: Sector | null;
  isActive: boolean;
}
