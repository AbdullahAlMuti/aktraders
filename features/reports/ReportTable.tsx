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
    <Card className="border-slate-200/80 dark:border-slate-800 rounded-2xl bg-white dark:bg-[#111c38] shadow-sm">
      <CardHeader>
        <CardTitle className="text-base font-bold text-slate-900 dark:text-white">Detailed Department Breakdown Matrix</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="py-8 text-center text-xs text-slate-400 font-mono">Loading live report...</div>
        ) : departments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center space-y-2">
            <FileText className="h-8 w-8 text-slate-400" />
            <p className="text-xs text-slate-500 font-medium">No Department Report Data Found</p>
            <p className="text-[11px] text-slate-400">Upload candidate CVs to automatically populate live department matrix.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-800 dark:bg-slate-900/50 font-bold text-xs uppercase tracking-wider">
                  <th className="py-3 px-4 text-center">SL</th>
                  <th className="py-3 px-4 text-left">Department</th>
                  <th className="py-3 px-4 text-center">Total Personnel</th>
                  <th className="py-3 px-4 text-center">Share %</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {departments.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                    <td className="py-3.5 px-4 text-center font-bold text-slate-400 font-mono">{idx + 1}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">{row.name}</td>
                    <td className="py-3.5 px-4 text-center font-bold font-mono text-slate-800 dark:text-slate-200">{row.count}</td>
                    <td className="py-3.5 px-4 text-center text-emerald-600 dark:text-emerald-400 font-extrabold font-mono">{row.percentage}%</td>
                    <td className="py-3.5 px-4 text-center">
                      <button className="rounded-lg p-1.5 text-slate-400 hover:bg-[#e8f1ff] hover:text-[#0066ff] transition-colors">
                        <Eye className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-slate-50 dark:bg-slate-900 font-extrabold text-slate-900 dark:text-white border-t border-slate-200 dark:border-slate-800">
                  <td colSpan={2} className="py-3.5 px-4">Total Personnel</td>
                  <td className="py-3.5 px-4 text-center font-mono">{summary.totalEmployees.toLocaleString()}</td>
                  <td className="py-3.5 px-4 text-center text-emerald-600 font-mono">100%</td>
                  <td className="py-3.5 px-4 text-center">-</td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
