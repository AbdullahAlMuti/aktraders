import { createClient } from "@/utils/supabase/client";

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
    const supabase = createClient();
    try {
      const { data: employees, error } = await supabase.from("employees").select("*");

      if (!error && employees) {
        const totalEmployees = employees.length;
        const processedCount = employees.filter((e) => e.status === "active").length;
        const inProcessingCount = employees.filter((e) => e.status === "processing").length;
        const cvUploadedCount = employees.filter((e) => e.cv_file_name).length;

        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        const newJoineesCount = employees.filter((e) => {
          if (!e.joining_date) return false;
          const d = new Date(e.joining_date);
          return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
        }).length;

        // Calculate department distribution
        const deptMap: Record<string, number> = {};
        employees.forEach((e) => {
          const dept = e.department || "General";
          deptMap[dept] = (deptMap[dept] || 0) + 1;
        });

        const departmentDistribution = Object.entries(deptMap).map(([name, count]) => ({
          name,
          count,
          percentage: totalEmployees > 0 ? Math.round((count / totalEmployees) * 100) : 0,
        }));

        // Calculate monthly trend
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const monthCounts: Record<number, number> = {};
        employees.forEach((e) => {
          if (e.created_at || e.joining_date) {
            const d = new Date(e.created_at || e.joining_date);
            if (d.getFullYear() === currentYear) {
              monthCounts[d.getMonth()] = (monthCounts[d.getMonth()] || 0) + 1;
            }
          }
        });

        const monthlyTrend = months.map((month, idx) => ({
          month,
          count: monthCounts[idx] || 0,
        }));

        return {
          totalEmployees,
          processedCount,
          inProcessingCount,
          cvUploadedCount,
          newJoineesCount,
          departmentDistribution,
          monthlyTrend,
        };
      }
    } catch (e) {
      console.error("Error computing dashboard summary:", e);
    }

    return {
      totalEmployees: 0,
      processedCount: 0,
      inProcessingCount: 0,
      cvUploadedCount: 0,
      newJoineesCount: 0,
      departmentDistribution: [],
      monthlyTrend: [
        { month: "Jan", count: 0 },
        { month: "Feb", count: 0 },
        { month: "Mar", count: 0 },
        { month: "Apr", count: 0 },
        { month: "May", count: 0 },
        { month: "Jun", count: 0 },
        { month: "Jul", count: 0 },
        { month: "Aug", count: 0 },
        { month: "Sep", count: 0 },
        { month: "Oct", count: 0 },
        { month: "Nov", count: 0 },
        { month: "Dec", count: 0 },
      ],
    };
  },
};
