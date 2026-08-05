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
    const page = params.page || 1;
    const limit = params.limit || 10;
    const search = params.search || "";

    try {
      const res = await fetch(`/api/employees?search=${encodeURIComponent(search)}&page=${page}&limit=${limit}&_t=${Date.now()}`, {
        cache: "no-store",
        headers: { "Cache-Control": "no-cache" },
      });
      const json = await res.json();
      if (res.ok && json.success) {
        return {
          data: json.data || [],
          meta: json.meta || { total: 0, page, limit, totalPages: 0 },
        };
      }
    } catch (e) {
      console.error("Error fetching employees from API:", e);
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

  async deleteEmployee(id: string): Promise<boolean> {
    try {
      const res = await fetch(`/api/cv/${id}`, {
        method: "DELETE",
        headers: { "Cache-Control": "no-cache" },
      });
      const data = await res.json();
      if (res.ok && data.success) {
        return true;
      }
      console.error("Server DELETE error:", data.error);
      return false;
    } catch (e) {
      console.error("Error deleting employee:", e);
      return false;
    }
  },

  async deleteMultipleEmployees(ids: string[]): Promise<boolean> {
    if (!ids || ids.length === 0) return true;
    try {
      const res = await fetch("/api/cv/delete-bulk", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache",
        },
        body: JSON.stringify({ ids }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        return true;
      }
      console.error("Server bulk DELETE error:", data.error);
      return false;
    } catch (e) {
      console.error("Error bulk deleting employees:", e);
      return false;
    }
  },
};
