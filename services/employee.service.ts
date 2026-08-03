import { Employee, EmployeeFilterState } from "@/types/employee.types";
import { PaginatedResponse } from "@/types/common.types";
import { createClient } from "@/utils/supabase/client";

export const employeeService = {
  async getEmployees(params: EmployeeFilterState & { page?: number; limit?: number }): Promise<PaginatedResponse<Employee>> {
    const supabase = createClient();
    const page = params.page || 1;
    const limit = params.limit || 10;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    try {
      // Query `cv_records` table in Supabase
      let query = supabase.from("cv_records").select("*", { count: "exact" });

      if (params.search && params.search.trim() !== "") {
        const s = params.search.trim();
        query = query.ilike("candidate_name", `%${s}%`);
      }

      query = query.range(from, to).order("created_at", { ascending: false });

      const { data, count, error } = await query;

      if (!error && data) {
        const formattedEmployees: Employee[] = data.map((item: any) => ({
          id: item.id,
          name: item.candidate_name,
          email: "candidate@aktraders.com",
          phone: "Stored Record",
          department: "Candidate",
          designation: "Applicant",
          status: "active",
          joiningDate: item.created_at ? new Date(item.created_at).toISOString().split("T")[0] : "",
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
        }));

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
        return {
          id: data.id,
          name: data.candidate_name,
          email: "candidate@aktraders.com",
          phone: "",
          department: "Candidate",
          designation: "Applicant",
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
      department: data.department || "General",
      designation: data.designation || "Staff",
      status: "active",
      joiningDate: new Date().toISOString().split("T")[0],
      cvFileName: data.cvFileName,
      cvFileSize: data.cvFileSize,
      cvData: data.cvData,
    };
  },
};
