export type EmployeeStatus = "active" | "processing" | "review_required" | "pending" | "inactive";

export interface Employee {
  id: string;
  employeeId?: string;
  applicantId?: string;
  cvNumber?: string;
  name: string;
  email: string;
  phone: string;
  department: string;
  designation: string;
  status: EmployeeStatus;
  joiningDate: string;
  cvFileName?: string;
  cvFileSize?: string;
  avatarUrl?: string;
  cvData?: any;
}

export interface PersonalInformation {
  fullName: string;
  photoUrl?: string;
  gender?: string;
  dob?: string;
  age?: number;
  nationality?: string;
  maritalStatus?: string;
  religion?: string;
  nid?: string;
  phone: string;
  alternatePhone?: string;
  email: string;
  alternateEmail?: string;
  presentAddress?: string;
  permanentAddress?: string;
  city?: string;
  district?: string;
  stateProvince?: string;
  country?: string;
  postalCode?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  portfolioUrl?: string;
  otherSocialLinks?: string[];
}

export interface EmploymentDetails {
  employeeId: string; // EMP-XXXXXX
  applicantId: string; // APP-XXXXXX
  cvNumber: string; // CV-XXXXXX
  currentStatus: EmployeeStatus;
  currentOrganization?: string;
  currentDesignation: string;
  department: string;
  employmentType?: string;
  currentLocation?: string;
  joiningDate?: string;
  noticePeriod?: string;
  expectedJoiningDate?: string;
  currentSalary?: string;
  expectedSalary?: string;
  preferredLocation?: string;
  preferredPosition?: string;
  careerLevel?: string;
  totalExperienceYears?: number;
  relevantExperienceYears?: number;
}

export interface EducationRecord {
  id: string;
  degree: string;
  qualificationName?: string;
  major: string;
  institution: string;
  university?: string;
  board?: string;
  country?: string;
  startDate?: string;
  endDate?: string;
  passingYear?: string;
  result?: string;
  gpaCgpa?: string;
  description?: string;
}

export interface ExperienceRecord {
  id: string;
  organizationName: string;
  jobTitle: string;
  designation?: string;
  department?: string;
  employmentType?: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  isCurrent: boolean;
  duration?: string;
  responsibilities?: string;
  achievements?: string[];
  projects?: string[];
  tools?: string[];
}

export interface AttachedDocument {
  id: string;
  documentId: string;
  documentType: "original_cv" | "updated_cv" | "cover_letter" | "certificate" | "other";
  originalFileName: string;
  fileUrl: string;
  fileSize: string;
  mimeType: string;
  uploadDate: string;
  version: number;
}

export interface OtherDetails {
  skills: string[];
  softSkills?: string[];
  languages?: string[];
  certifications?: string[];
  trainings?: string[];
  projects?: string[];
  publications?: string[];
  awards?: string[];
  references?: string[];
  careerObjective?: string;
  professionalSummary?: string;
  drivingLicense?: string;
  visaWorkAuth?: string;
  additionalNotes?: string;
}

export interface FullEmployeeProfile {
  id: string; // Internal UUID or ID
  employeeId: string; // EMP-XXXXXX
  applicantId: string; // APP-XXXXXX
  cvNumber: string; // CV-XXXXXX
  name: string;
  email: string;
  phone: string;
  department: string;
  designation: string;
  organization: string;
  status: EmployeeStatus;
  joiningDate: string;
  avatarUrl?: string;
  cvCount: number;
  
  // 6 Structured Tabs
  personalInformation: PersonalInformation;
  employmentDetails: EmploymentDetails;
  educationalQualifications: EducationRecord[];
  workExperience: ExperienceRecord[];
  attachedDocuments: AttachedDocument[];
  otherDetails: OtherDetails;

  createdAt: string;
  updatedAt: string;
  /** Soft-delete marker: deleted profiles are hidden from all listings and lookups. */
  deleted?: boolean;
}

export interface EmployeeFilterState {
  department?: string;
  status?: EmployeeStatus;
  search?: string;
  dateRange?: {
    from?: string;
    to?: string;
  };
}
