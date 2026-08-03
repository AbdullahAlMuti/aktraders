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
          { name: "সেলস (Sales)", count: 900, percentage: 30 },
          { name: "অপারেশনস (Ops)", count: 750, percentage: 25 },
          { name: "এইচ আর (HR)", count: 450, percentage: 15 },
          { name: "ফাইন্যান্স (Finance)", count: 300, percentage: 10 },
          { name: "আইটি (IT)", count: 300, percentage: 10 },
          { name: "অন্যান্য (Others)", count: 300, percentage: 10 },
        ],
        monthlyTrend: [
          { month: "জানু", count: 240 },
          { month: "ফেব্রু", count: 320 },
          { month: "মার্চ", count: 410 },
          { month: "এপ্রিল", count: 390 },
          { month: "মে", count: 460 },
          { month: "জুন", count: 620 },
          { month: "জুলাই", count: 810 },
          { month: "আগস্ট", count: 590 },
          { month: "সেপ্টে", count: 400 },
          { month: "অক্টো", count: 480 },
          { month: "নভে", count: 520 },
          { month: "ডিসে", count: 310 },
        ],
      };
    }
  },
};
