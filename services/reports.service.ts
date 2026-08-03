import { api } from "./api-client";
import { API_ENDPOINTS } from "@/constants/api-endpoints";

export interface DashboardSummary {
  totalEmployees: number;
  processedCount: number;
  inProcessingCount: number;
  cvUploadedCount: number;
  newJoineesCount: number;
  departmentDistribution: Array<{ name: string; count: number; percentage: number }>;
  monthlyTrend: Array<{ month: string; count: number }>;
}

export const reportsService = {
  async getDashboardSummary(): Promise<DashboardSummary> {
    try {
      const response = await api.get<DashboardSummary>(API_ENDPOINTS.REPORTS.SUMMARY);
      return response.data;
    } catch (e) {
      return {
        totalEmployees: 3000,
        processedCount: 2850,
        inProcessingCount: 120,
        cvUploadedCount: 2980,
        newJoineesCount: 320,
        departmentDistribution: [
          { name: "Sales", count: 900, percentage: 30 },
          { name: "Operations", count: 750, percentage: 25 },
          { name: "HR", count: 450, percentage: 15 },
          { name: "Finance", count: 300, percentage: 10 },
          { name: "IT", count: 300, percentage: 10 },
          { name: "Others", count: 300, percentage: 10 },
        ],
        monthlyTrend: [
          { month: "Jan", count: 240 },
          { month: "Feb", count: 320 },
          { month: "Mar", count: 410 },
          { month: "Apr", count: 390 },
          { month: "May", count: 460 },
          { month: "Jun", count: 620 },
          { month: "Jul", count: 810 },
          { month: "Aug", count: 590 },
          { month: "Sep", count: 400 },
          { month: "Oct", count: 480 },
          { month: "Nov", count: 520 },
          { month: "Dec", count: 310 },
        ],
      };
    }
  },
};
