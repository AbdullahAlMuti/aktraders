import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import Link from "next/link";

export function DepartmentDistributionChart() {
  const departments = [
    { name: "Sales", count: 900, percentage: "30%", color: "#2563eb" },
    { name: "Operations", count: 750, percentage: "25%", color: "#10b981" },
    { name: "HR", count: 450, percentage: "15%", color: "#f59e0b" },
    { name: "Finance", count: 300, percentage: "10%", color: "#8b5cf6" },
    { name: "IT", count: 300, percentage: "10%", color: "#06b6d4" },
    { name: "Others", count: 300, percentage: "10%", color: "#f43f5e" },
  ];

  return (
    <Card className="border-slate-200/80 dark:border-slate-800">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-bold text-slate-900 dark:text-slate-100">
          Department Wise Breakdown
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 py-2">
          {/* Donut Chart SVG */}
          <div className="relative flex items-center justify-center">
            <svg width="160" height="160" viewBox="0 0 160 160" className="transform -rotate-90">
              <circle cx="80" cy="80" r="60" fill="transparent" stroke="#2563eb" strokeWidth="24" strokeDasharray="377" strokeDashoffset="0" />
              <circle cx="80" cy="80" r="60" fill="transparent" stroke="#10b981" strokeWidth="24" strokeDasharray="377" strokeDashoffset="113" />
              <circle cx="80" cy="80" r="60" fill="transparent" stroke="#f59e0b" strokeWidth="24" strokeDasharray="377" strokeDashoffset="207" />
              <circle cx="80" cy="80" r="60" fill="transparent" stroke="#8b5cf6" strokeWidth="24" strokeDasharray="377" strokeDashoffset="264" />
              <circle cx="80" cy="80" r="60" fill="transparent" stroke="#06b6d4" strokeWidth="24" strokeDasharray="377" strokeDashoffset="301" />
              <circle cx="80" cy="80" r="60" fill="transparent" stroke="#f43f5e" strokeWidth="24" strokeDasharray="377" strokeDashoffset="339" />
            </svg>
            <div className="absolute flex flex-col items-center justify-center text-center">
              <span className="text-xl font-extrabold text-slate-900 dark:text-slate-100">3,000</span>
              <span className="text-[10px] text-slate-400 font-semibold">Total</span>
            </div>
          </div>

          {/* Department Legend */}
          <div className="flex-1 space-y-2 w-full">
            {departments.map((dept, index) => (
              <div key={index} className="flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: dept.color }} />
                  <span className="font-medium text-slate-700 dark:text-slate-300">
                    {dept.name}
                  </span>
                </div>
                <span className="font-bold text-slate-900 dark:text-slate-100">
                  {dept.count} ({dept.percentage})
                </span>
              </div>
            ))}
          </div>
        </div>

        <Link
          href="/reports"
          className="block text-center text-xs font-semibold text-blue-600 hover:underline dark:text-blue-400 mt-3"
        >
          View Full Breakdown -&gt;
        </Link>
      </CardContent>
    </Card>
  );
}
