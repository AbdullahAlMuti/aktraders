import { Employee, EmployeeFilterState } from "@/types/employee.types";
import { PaginatedResponse } from "@/types/common.types";

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
    try {
      const res = await fetch(`/api/employees/${id}?_t=${Date.now()}`, {
        cache: "no-store",
        headers: { "Cache-Control": "no-cache" },
      });
      const json = await res.json();
      if (res.ok && json.success && json.profile) {
        const p = json.profile;
        return {
          id: p.id,
          name: p.name,
          email: p.email,
          phone: p.phone,
          department: p.department,
          designation: p.designation,
          status: p.status || "active",
          joiningDate: p.joiningDate || new Date().toISOString().split("T")[0],
          cvFileName: p.attachedDocuments?.[0]?.originalFileName,
          cvFileSize: "PDF Document",
          avatarUrl: p.avatarUrl,
          cvData: {
            id: p.id,
            candidateName: p.name,
            structuredData: p,
            originalPdfUrl: p.attachedDocuments?.[0]?.fileUrl,
            originalFileName: p.attachedDocuments?.[0]?.originalFileName,
          },
        };
      }
    } catch (e) {
      console.error("Error fetching employee profile by ID:", e);
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
      department: data.department || "",
      designation: data.designation || "",
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
