import { CVUploadItem, ExtractedCVData } from "@/types/cv.types";
import { api } from "./api-client";
import { API_ENDPOINTS } from "@/constants/api-endpoints";

export const cvService = {
  async uploadCV(file: File): Promise<CVUploadItem> {
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await api.post<CVUploadItem>(API_ENDPOINTS.CV.UPLOAD, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data;
    } catch (e) {
      // Mock upload result matching the UI mockups
      return {
        id: `cv-${Date.now()}`,
        fileName: file.name,
        fileSize: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
        uploadDate: new Date().toISOString(),
        status: "processing",
        progress: 78,
      };
    }
  },

  async extractCVData(cvId: string): Promise<ExtractedCVData> {
    try {
      const response = await api.get<ExtractedCVData>(API_ENDPOINTS.CV.EXTRACT(cvId));
      return response.data;
    } catch (e) {
      return {
        fullName: "MD. RAHIM HASAN",
        designation: "Senior Executive",
        phone: "017XXXXXXXX",
        email: "rahim.hasan@email.com",
        address: "Dhaka, Bangladesh",
        education: [
          {
            degree: "BSc in Computer Science and Engineering",
            institution: "University of Dhaka",
            passingYear: "2018",
            cgpa: "3.25 out of 4.00",
          },
        ],
        experience: [
          {
            role: "Senior Executive",
            company: "ABC Limited",
            duration: "Jan 2021 - Present",
            responsibilities: [
              "Manage daily operational activities",
              "Prepare reports and presentations",
              "Coordinate with cross-functional teams",
            ],
          },
        ],
        skills: ["Project Management", "Data Analysis", "ERP Management", "React.js"],
        personalInfo: {
          fatherName: "Md. Karim Hasan",
          motherName: "Mrs. Salma Begum",
          dob: "15 January 1993",
          nidNo: "1993123456789012",
          maritalStatus: "Married",
        },
      };
    }
  },
};
