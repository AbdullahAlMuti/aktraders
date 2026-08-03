"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Eye, FileText } from "lucide-react";
import { useEffect, useState } from "react";
import { reportsService, DashboardSummary } from "@/services/reports.service";

export function ReportTable() {
  const [summary, setSummary] = useState<DashboardSummary>({
    totalEmployees: 0,
    processedCount: 0,
    inProcessingCount: 0,
    cvUploadedCount: 0,
    newJoineesCount: 0,
    departmentDistribution: [],
    monthlyTrend: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    reportsService.getDashboardSummary().then((res) => {
      if (res) setSummary(res);
      setLoading(false);
    });
  }, []);

  const departments = summary.departmentDistribution;

  return (
    <Card className="border-[#e6dfd8] dark:border-[#2e2c28]">
      <CardHeader>
        <CardTitle className="text-base font-bold">Detailed Report Matrix</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="py-8 text-center text-xs text-neutral-400 font-mono">রিপোর্ট লোড হচ্ছে... (Loading report...)</div>
        ) : departments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center space-y-2">
            <FileText className="h-8 w-8 text-neutral-400" />
            <p className="text-xs text-neutral-500 font-medium">কোন ডিপার্টমেন্ট রিপোর্ট ডাটা পাওয়া যায়নি</p>
            <p className="text-[11px] text-neutral-400">No records found in database to calculate department matrix.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-[#e6dfd8] bg-neutral-100/50 text-neutral-600 dark:border-[#2e2c28] dark:bg-neutral-800/50 font-bold">
                  <th className="py-3 px-3 text-center">SL</th>
                  <th className="py-3 px-3 text-left">Department</th>
                  <th className="py-3 px-3 text-center">Total Employees</th>
                  <th className="py-3 px-3 text-center">Share %</th>
                  <th className="py-3 px-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e6dfd8] dark:divide-[#2e2c28]">
                {departments.map((row, idx) => (
                  <tr key={idx} className="hover:bg-neutral-100/50 dark:hover:bg-neutral-800/40">
                    <td className="py-3 px-3 text-center font-bold text-neutral-500">{idx + 1}</td>
                    <td className="py-3 px-3 font-bold text-neutral-900 dark:text-white">{row.name}</td>
                    <td className="py-3 px-3 text-center font-semibold">{row.count}</td>
                    <td className="py-3 px-3 text-center text-emerald-600 font-semibold">{row.percentage}%</td>
                    <td className="py-3 px-3 text-center">
                      <button className="rounded p-1 text-neutral-500 hover:bg-neutral-100 hover:text-[#cc785c]">
                        <Eye className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-neutral-100 dark:bg-neutral-800 font-extrabold text-neutral-900 dark:text-white border-t border-[#e6dfd8] dark:border-[#2e2c28]">
                  <td colSpan={2} className="py-3 px-3">Total</td>
                  <td className="py-3 px-3 text-center">{summary.totalEmployees.toLocaleString()}</td>
                  <td className="py-3 px-3 text-center text-emerald-600">100%</td>
                  <td className="py-3 px-3 text-center">-</td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
