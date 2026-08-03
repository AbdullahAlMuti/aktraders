import { Employee, EmployeeFilterState } from "@/types/employee.types";
import { PaginatedResponse } from "@/types/common.types";
import { api } from "./api-client";
import { API_ENDPOINTS } from "@/constants/api-endpoints";

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
    try {
      const response = await api.get<PaginatedResponse<Employee>>(API_ENDPOINTS.EMPLOYEES.LIST, params);
      return response.data;
    } catch (e) {
      // Return filtered mock data for development
      let filtered = [...MOCK_EMPLOYEES];
      if (params.search) {
        const query = params.search.toLowerCase();
        filtered = filtered.filter(
          (emp) => emp.name.toLowerCase().includes(query) || emp.id.toLowerCase().includes(query)
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
    }
  },

  async getEmployeeById(id: string): Promise<Employee> {
    try {
      const response = await api.get<Employee>(API_ENDPOINTS.EMPLOYEES.DETAIL(id));
      return response.data;
    } catch (e) {
      const emp = MOCK_EMPLOYEES.find((item) => item.id === id) || MOCK_EMPLOYEES[0];
      return emp;
    }
  },

  async createEmployee(data: Partial<Employee>): Promise<Employee> {
    const response = await api.post<Employee>(API_ENDPOINTS.EMPLOYEES.CREATE, data);
    return response.data;
  },
};
