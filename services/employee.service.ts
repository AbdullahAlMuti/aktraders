import { Employee, EmployeeFilterState } from "@/types/employee.types";
import { PaginatedResponse } from "@/types/common.types";
import { createClient } from "@/utils/supabase/client";

const MOCK_EMPLOYEES: Employee[] = [
  {
    id: "EMP-1001",
    name: "Md. Rahim Hasan",
    email: "rahim.hasan@aktraders.com",
    phone: "01712345678",
    department: "Sales",
    designation: "Senior Executive",
    status: "active",
    joiningDate: "2024-05-02",
    cvFileName: "Rahim_Hasan_CV.pdf",
    cvFileSize: "3.2 MB",
  },
  {
    id: "EMP-1002",
    name: "Fahima Akter",
    email: "fahima.akter@aktraders.com",
    phone: "01812345679",
    department: "Operations",
    designation: "Assistant Manager",
    status: "active",
    joiningDate: "2024-05-02",
    cvFileName: "Fahima_Akter_CV.pdf",
    cvFileSize: "2.8 MB",
  },
  {
    id: "EMP-1003",
    name: "Md. Salim Uddin",
    email: "salim.uddin@aktraders.com",
    phone: "01912345680",
    department: "HR",
    designation: "HR Officer",
    status: "processing",
    joiningDate: "2024-05-02",
    cvFileName: "Salim_Uddin_CV.pdf",
    cvFileSize: "1.9 MB",
  },
  {
    id: "EMP-1004",
    name: "Nusrat Jahan",
    email: "nusrat.jahan@aktraders.com",
    phone: "01612345681",
    department: "Finance",
    designation: "Accounts Executive",
    status: "processing",
    joiningDate: "2024-05-02",
    cvFileName: "Nusrat_Jahan_CV.pdf",
    cvFileSize: "2.4 MB",
  },
  {
    id: "EMP-1005",
    name: "Abdur Rahman",
    email: "abdur.rahman@aktraders.com",
    phone: "01512345682",
    department: "IT",
    designation: "Software Engineer",
    status: "pending",
    joiningDate: "2024-05-02",
    cvFileName: "Abdur_Rahman_CV.pdf",
    cvFileSize: "4.1 MB",
  },
];

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

      if (!error && data && data.length > 0) {
        const formattedEmployees: Employee[] = data.map((item: any) => ({
          id: item.id,
          name: item.name,
          email: item.email,
          phone: item.phone || "",
          department: item.department || "Sales",
          designation: item.designation || "Staff",
          status: item.status || "active",
          joiningDate: item.joining_date || new Date().toISOString().split("T")[0],
          cvFileName: item.cv_file_name,
          cvFileSize: item.cv_file_size,
          avatarUrl: item.avatar_url,
        }));

        return {
          data: formattedEmployees,
          meta: {
            total: count || formattedEmployees.length,
            page,
            limit,
            totalPages: Math.ceil((count || formattedEmployees.length) / limit),
          },
        };
      }
    } catch (e) {
      console.warn("Falling back to local data", e);
    }

    // Filter fallback mock data
    let filtered = [...MOCK_EMPLOYEES];
    if (params.search) {
      const q = params.search.toLowerCase();
      filtered = filtered.filter(
        (emp) => emp.name.toLowerCase().includes(q) || emp.id.toLowerCase().includes(q)
      );
    }
    if (params.department && params.department !== "all") {
      filtered = filtered.filter((emp) => emp.department.toLowerCase() === params.department?.toLowerCase());
    }
    if (params.status && (params.status as string) !== "all") {
      filtered = filtered.filter((emp) => emp.status === params.status);
    }

    return {
      data: filtered,
      meta: {
        total: filtered.length,
        page: params.page || 1,
        limit: params.limit || 10,
        totalPages: Math.ceil(filtered.length / (params.limit || 10)),
      },
    };
  },

  async getEmployeeById(id: string): Promise<Employee> {
    const supabase = createClient();
    try {
      const { data, error } = await supabase.from("employees").select("*").eq("id", id).single();
      if (!error && data) {
        return {
          id: data.id,
          name: data.name,
          email: data.email,
          phone: data.phone || "",
          department: data.department || "Sales",
          designation: data.designation || "Staff",
          status: data.status || "active",
          joiningDate: data.joining_date || new Date().toISOString().split("T")[0],
          cvFileName: data.cv_file_name,
          cvFileSize: data.cv_file_size,
          avatarUrl: data.avatar_url,
        };
      }
    } catch (e) {
      // Fallback
    }
    return MOCK_EMPLOYEES.find((item) => item.id === id) || MOCK_EMPLOYEES[0];
  },

  async createEmployee(data: Partial<Employee> & { cvData?: any }): Promise<Employee> {
    const supabase = createClient();
    const newId = data.id || `EMP-${Math.floor(1000 + Math.random() * 9000)}`;
    const newEmp = {
      id: newId,
      name: data.name || "New Employee",
      email: data.email || "",
      phone: data.phone || "",
      department: data.department || "Sales",
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
    };
  },
};
