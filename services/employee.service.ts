import { Employee, EmployeeFilterState } from "@/types/employee.types";
import { PaginatedResponse } from "@/types/common.types";
import { createClient } from "@/utils/supabase/client";

function parseCandidateDetails(candidateName: string, text: string) {
  const content = text || "";

  // 1. Dynamic Email Extraction
  const emailMatch = content.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  const cleanNameSlug = (candidateName || "candidate").toLowerCase().replace(/[^a-z0-9]/g, "");
  const email = emailMatch ? emailMatch[0] : `${cleanNameSlug}@aktraders.com`;

  // 2. Dynamic Phone Extraction
  const phoneMatch = content.match(/(?:\+880|01)[0-9]{8,9}/) || content.match(/\+?\d{1,4}[-.\s]?\(?\d{1,3}\)?[-.\s]?\d{3,4}[-.\s]?\d{4}/);
  const phone = phoneMatch ? phoneMatch[0] : "+880 1700-000000";

  // 3. Dynamic Designation Extraction
  let designation = "Applicant / Candidate";
  const lower = content.toLowerCase();
  if (lower.includes("software engineer") || lower.includes("full stack") || lower.includes("frontend") || lower.includes("backend")) {
    designation = "Software Engineer";
  } else if (lower.includes("manager")) {
    designation = "Operations Manager";
  } else if (lower.includes("executive")) {
    designation = "Executive Officer";
  } else if (lower.includes("analyst")) {
    designation = "Data Analyst";
  } else if (lower.includes("designer")) {
    designation = "UI/UX Designer";
  } else if (lower.includes("accountant") || lower.includes("finance")) {
    designation = "Accounts Officer";
  }

  // 4. Dynamic Department Extraction
  let department = "General Operations";
  if (lower.includes("software") || lower.includes("developer") || lower.includes("engineer") || lower.includes("it") || lower.includes("python") || lower.includes("react")) {
    department = "IT & Engineering";
  } else if (lower.includes("sales") || lower.includes("business") || lower.includes("marketing") || lower.includes("account")) {
    department = "Sales & Marketing";
  } else if (lower.includes("manager") || lower.includes("operations") || lower.includes("executive") || lower.includes("lead")) {
    department = "Operations";
  } else if (lower.includes("hr") || lower.includes("human resource") || lower.includes("recruiter")) {
    department = "Human Resources";
  } else if (lower.includes("finance") || lower.includes("accounting") || lower.includes("audit") || lower.includes("bank")) {
    department = "Finance & Accounts";
  }

  return { email, phone, designation, department };
}

export const employeeService = {
  async getEmployees(params: EmployeeFilterState & { page?: number; limit?: number }): Promise<PaginatedResponse<Employee>> {
    const supabase = createClient();
    const page = params.page || 1;
    const limit = params.limit || 10;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    try {
      let query = supabase.from("cv_records").select("*", { count: "exact" });

      if (params.search && params.search.trim() !== "") {
        const s = params.search.trim();
        query = query.ilike("candidate_name", `%${s}%`);
      }

      query = query.range(from, to).order("created_at", { ascending: false });

      const { data, count, error } = await query;

      if (!error && data) {
        const formattedEmployees: Employee[] = data.map((item: any) => {
          const parsed = parseCandidateDetails(item.candidate_name, item.extracted_text);
          return {
            id: item.id,
            name: item.candidate_name,
            email: parsed.email,
            phone: parsed.phone,
            department: parsed.department,
            designation: parsed.designation,
            status: "active",
            joiningDate: item.created_at ? new Date(item.created_at).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
            cvFileName: item.original_file_name,
            cvFileSize: "PDF Document",
            avatarUrl: undefined,
            cvData: {
              id: item.id,
              candidateName: item.candidate_name,
              extractedText: item.extracted_text,
              originalFileName: item.original_file_name,
              originalPdfUrl: item.original_pdf_url,
              uploadedAt: item.created_at,
            },
          };
        });

        const totalRecords = count !== null ? count : formattedEmployees.length;

        return {
          data: formattedEmployees,
          meta: {
            total: totalRecords,
            page,
            limit,
            totalPages: totalRecords > 0 ? Math.ceil(totalRecords / limit) : 0,
          },
        };
      }
    } catch (e) {
      console.error("Error fetching cv_records from Supabase:", e);
    }

    return {
      data: [],
      meta: {
        total: 0,
        page,
        limit,
        totalPages: 0,
      },
    };
  },

  async getEmployeeById(id: string): Promise<Employee | null> {
    const supabase = createClient();
    try {
      const { data, error } = await supabase.from("cv_records").select("*").eq("id", id).single();
      if (!error && data) {
        const parsed = parseCandidateDetails(data.candidate_name, data.extracted_text);
        return {
          id: data.id,
          name: data.candidate_name,
          email: parsed.email,
          phone: parsed.phone,
          department: parsed.department,
          designation: parsed.designation,
          status: "active",
          joiningDate: new Date(data.created_at).toISOString().split("T")[0],
          cvFileName: data.original_file_name,
          cvFileSize: "PDF Document",
          avatarUrl: undefined,
          cvData: {
            id: data.id,
            candidateName: data.candidate_name,
            extractedText: data.extracted_text,
            originalFileName: data.original_file_name,
            originalPdfUrl: data.original_pdf_url,
            uploadedAt: data.created_at,
          },
        };
      }
    } catch (e) {
      console.error("Error fetching CV record by ID:", e);
    }
    return null;
  },

  async createEmployee(data: Partial<Employee> & { cvData?: any }): Promise<Employee> {
    const newId = data.id || `cv-${Date.now()}`;
    return {
      id: newId,
      name: data.name || "Candidate",
      email: data.email || "",
      phone: data.phone || "",
      department: data.department || "General Operations",
      designation: data.designation || "Staff",
      status: "active",
      joiningDate: new Date().toISOString().split("T")[0],
      cvFileName: data.cvFileName,
      cvFileSize: data.cvFileSize,
      cvData: data.cvData,
    };
  },
};
