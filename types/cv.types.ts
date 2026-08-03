export type CVProcessingStep = 1 | 2 | 3 | 4;

export interface ExtractedCVData {
  fullName: string;
  designation: string;
  phone: string;
  email: string;
  address: string;
  education: Array<{
    degree: string;
    institution: string;
    passingYear: string;
    cgpa?: string;
  }>;
  experience: Array<{
    role: string;
    company: string;
    duration: string;
    responsibilities?: string[];
  }>;
  skills: string[];
  personalInfo: {
    fatherName?: string;
    motherName?: string;
    dob?: string;
    nidNo?: string;
    maritalStatus?: string;
  };
}

export interface CVUploadItem {
  id: string;
  fileName: string;
  fileSize: string;
  uploadDate: string;
  status: "completed" | "processing" | "pending" | "failed";
  extractedData?: ExtractedCVData;
  progress: number;
}
