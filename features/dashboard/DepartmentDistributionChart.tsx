"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import Link from "next/link";
import { useEffect, useState } from "react";
import { reportsService } from "@/services/reports.service";

const COLOR_PALETTE = ["#0066ff", "#10b981", "#f59e0b", "#9333ea", "#06b6d4", "#ec4899"];

export function DepartmentDistributionChart() {
  const [departments, setDepartments] = useState<Array<{ name: string; count: number; percentage: string; color: string }>>([]);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    reportsService.getDashboardSummary().then((summary) => {
      if (summary) {
        setTotalCount(summary.totalEmployees);
        if (summary.departmentDistribution && summary.departmentDistribution.length > 0) {
          setDepartments(
            summary.departmentDistribution.map((d, idx) => ({
              name: d.name,
              count: d.count,
              percentage: `${d.percentage}%`,
              color: COLOR_PALETTE[idx % COLOR_PALETTE.length],
            }))
          );
        } else {
          setDepartments([]);
        }
      }
    });
  }, []);

  return (
    <Card className="h-full flex flex-col justify-between border-slate-200/80 dark:border-slate-800 rounded-2xl bg-white dark:bg-[#111c38]">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-bold text-slate-900 dark:text-white">
          Department Distribution
        </CardTitle>
      </CardHeader>
      <CardContent>
        {totalCount === 0 || departments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center space-y-2">
            <div className="h-24 w-24 rounded-full border-4 border-dashed border-slate-200 dark:border-slate-800 flex items-center justify-center">
              <span className="text-xs font-mono text-slate-400">0 Staff</span>
            </div>
            <p className="text-xs text-slate-500">No department records available</p>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 py-2">
            {/* Donut Chart SVG */}
            <div className="relative flex items-center justify-center">
              <svg width="160" height="160" viewBox="0 0 160 160" className="transform -rotate-90">
                <circle cx="80" cy="80" r="60" fill="transparent" stroke="#f4f7fe" strokeWidth="24" className="dark:stroke-slate-800" />
                {departments.map((dept, idx) => (
                  <circle
                    key={idx}
                    cx="80"
                    cy="80"
                    r="60"
                    fill="transparent"
                    stroke={dept.color}
                    strokeWidth="24"
                    strokeDasharray="377"
                    strokeDashoffset={377 - (parseInt(dept.percentage) / 100) * 377}
                  />
                ))}
              </svg>
              <div className="absolute flex flex-col items-center justify-center text-center">
                <span className="text-xl font-extrabold text-slate-900 dark:text-white">{totalCount.toLocaleString()}</span>
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
                  <span className="font-bold text-slate-900 dark:text-white">
                    {dept.count} ({dept.percentage})
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <Link
          href="/reports"
          className="block text-center text-xs font-bold text-[#0066ff] hover:underline dark:text-[#0066ff] mt-3"
        >
          View Full Breakdown -&gt;
        </Link>
      </CardContent>
    </Card>
  );
}
