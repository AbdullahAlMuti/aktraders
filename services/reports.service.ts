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

function inferDepartment(text: string): string {
  const lower = (text || "").toLowerCase();
  if (lower.includes("software") || lower.includes("developer") || lower.includes("engineer") || lower.includes("it") || lower.includes("python") || lower.includes("react")) {
    return "IT & Engineering";
  }
  if (lower.includes("sales") || lower.includes("business") || lower.includes("marketing") || lower.includes("account")) {
    return "Sales & Marketing";
  }
  if (lower.includes("manager") || lower.includes("operations") || lower.includes("executive") || lower.includes("lead")) {
    return "Operations";
  }
  if (lower.includes("hr") || lower.includes("human resource") || lower.includes("recruiter")) {
    return "Human Resources";
  }
  if (lower.includes("finance") || lower.includes("accounting") || lower.includes("audit") || lower.includes("bank")) {
    return "Finance & Accounts";
  }
  return "General Operations";
}

export const reportsService = {
  async getDashboardSummary(): Promise<DashboardSummary> {
    const supabase = createClient();
    try {
      // Query live `cv_records` table in Supabase
      const { data: records, error } = await supabase.from("cv_records").select("*");

      if (!error && records) {
        const totalEmployees = records.length;
        const processedCount = records.length;
        const inProcessingCount = 0;
        const cvUploadedCount = records.length;

        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        const newJoineesCount = records.filter((r) => {
          if (!r.created_at) return false;
          const d = new Date(r.created_at);
          return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
        }).length;

        // Calculate dynamic department distribution
        const deptMap: Record<string, number> = {};
        records.forEach((r) => {
          const dept = inferDepartment(r.extracted_text || r.candidate_name || "");
          deptMap[dept] = (deptMap[dept] || 0) + 1;
        });

        const departmentDistribution = Object.entries(deptMap).map(([name, count]) => ({
          name,
          count,
          percentage: totalEmployees > 0 ? Math.round((count / totalEmployees) * 100) : 0,
        }));

        // Calculate dynamic monthly trend
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const monthCounts: Record<number, number> = {};
        records.forEach((r) => {
          if (r.created_at) {
            const d = new Date(r.created_at);
            if (d.getFullYear() === currentYear) {
              monthCounts[d.getMonth()] = (monthCounts[d.getMonth()] || 0) + 1;
            }
          }
        });

        const monthlyTrend = months.map((month, idx) => ({
          month,
          count: monthCounts[idx] || (idx === currentMonth ? records.length : 0),
        }));

        return {
          totalEmployees,
          processedCount,
          inProcessingCount,
          cvUploadedCount,
          newJoineesCount,
          departmentDistribution: departmentDistribution.length > 0 ? departmentDistribution : [{ name: "General Operations", count: totalEmployees, percentage: 100 }],
          monthlyTrend,
        };
      }
    } catch (e) {
      console.error("Error computing dashboard summary from Supabase:", e);
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
