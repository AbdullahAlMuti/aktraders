import { Employee, EmployeeFilterState } from "@/types/employee.types";
import { PaginatedResponse } from "@/types/common.types";
import { createClient } from "@/utils/supabase/client";

export const employeeService = {
  async getEmployees(params: EmployeeFilterState & { page?: number; limit?: number }): Promise<PaginatedResponse<Employee>> {
    const supabase = createClient();
    try {
      let query = supabase.from("employees").select("*", { count: "exact" });

      if (params.search) {
        query = query.or(`name.ilike.%${params.search}%,id.ilike.%${params.search}%,email.ilike.%${params.search}%`);
      }
      if (params.department && params.department !== "all") {
        query = query.ilike("department", params.department);
      }
      if (params.status && (params.status as string) !== "all") {
        query = query.eq("status", params.status);
      }

      const page = params.page || 1;
      const limit = params.limit || 10;
      const from = (page - 1) * limit;
      const to = from + limit - 1;

      query = query.range(from, to).order("created_at", { ascending: false });

      const { data, count, error } = await query;

      if (!error && data) {
        const formattedEmployees: Employee[] = data.map((item: any) => ({
          id: item.id,
          name: item.name,
          email: item.email,
          phone: item.phone || "",
          department: item.department || "General",
          designation: item.designation || "Staff",
          status: item.status || "active",
          joiningDate: item.joining_date || new Date().toISOString().split("T")[0],
          cvFileName: item.cv_file_name,
          cvFileSize: item.cv_file_size,
          avatarUrl: item.avatar_url,
          cvData: item.cv_data,
        }));

        return {
          data: formattedEmployees,
          meta: {
            total: count ?? formattedEmployees.length,
            page,
            limit,
            totalPages: Math.ceil((count ?? formattedEmployees.length) / limit) || 1,
          },
        };
      }
    } catch (e) {
      console.warn("Supabase query warning:", e);
    }

    return {
      data: [],
      meta: {
        total: 0,
        page: params.page || 1,
        limit: params.limit || 10,
        totalPages: 1,
      },
    };
  },

  async getEmployeeById(id: string): Promise<Employee | null> {
    const supabase = createClient();
    try {
      const { data, error } = await supabase.from("employees").select("*").eq("id", id).single();
      if (!error && data) {
        return {
          id: data.id,
          name: data.name,
          email: data.email,
          phone: data.phone || "",
          department: data.department || "General",
          designation: data.designation || "Staff",
          status: data.status || "active",
          joiningDate: data.joining_date || new Date().toISOString().split("T")[0],
          cvFileName: data.cv_file_name,
          cvFileSize: data.cv_file_size,
          avatarUrl: data.avatar_url,
          cvData: data.cv_data,
        };
      }
    } catch (e) {
      console.warn("Error fetching employee:", e);
    }
    return null;
  },

  async createEmployee(data: Partial<Employee> & { cvData?: any }): Promise<Employee> {
    const supabase = createClient();
    const newId = data.id || `EMP-${Math.floor(1000 + Math.random() * 9000)}`;
    const newEmp = {
      id: newId,
      name: data.name || "New Employee",
      email: data.email || "",
      phone: data.phone || "",
      department: data.department || "General",
      designation: data.designation || "Staff",
      status: data.status || "active",
      joining_date: data.joiningDate || new Date().toISOString().split("T")[0],
      cv_file_name: data.cvFileName || null,
      cv_file_size: data.cvFileSize || null,
      avatar_url: data.avatarUrl || null,
      cv_data: data.cvData || null,
    };

    try {
      const { data: result, error } = await supabase.from("employees").insert(newEmp).select().single();
      if (!error && result) {
        return {
          id: result.id,
          name: result.name,
          email: result.email,
          phone: result.phone || "",
          department: result.department,
          designation: result.designation,
          status: result.status,
          joiningDate: result.joining_date,
          cvFileName: result.cv_file_name,
          cvFileSize: result.cv_file_size,
          avatarUrl: result.avatar_url,
          cvData: result.cv_data,
        };
      }
    } catch (e) {
      console.warn("DB insert error:", e);
    }

    return {
      id: newId,
      name: newEmp.name,
      email: newEmp.email,
      phone: newEmp.phone,
      department: newEmp.department,
      designation: newEmp.designation,
      status: newEmp.status as any,
      joiningDate: newEmp.joining_date,
      cvData: newEmp.cv_data,
    };
  },
};
