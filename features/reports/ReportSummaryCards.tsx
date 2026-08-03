"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/Card";
import { Users, CheckCircle, FileCheck, UserPlus, Database } from "lucide-react";
import { reportsService, DashboardSummary } from "@/services/reports.service";

export function ReportSummaryCards() {
  const [summary, setSummary] = useState<DashboardSummary>({
    totalEmployees: 0,
    processedCount: 0,
    inProcessingCount: 0,
    cvUploadedCount: 0,
    newJoineesCount: 0,
    departmentDistribution: [],
    monthlyTrend: [],
  });

  useEffect(() => {
    reportsService.getDashboardSummary().then((res) => {
      if (res) setSummary(res);
    });
  }, []);

  const cards = [
    { title: "Total Records", value: summary.totalEmployees.toLocaleString(), subtitle: "Supabase DB Storage", icon: Users, color: "text-[#0066ff] bg-[#e8f1ff]" },
    { title: "Active Candidates", value: summary.processedCount.toLocaleString(), subtitle: "Parsed Profiles", icon: CheckCircle, color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40" },
    { title: "Database Status", value: "Live", subtitle: "Supabase Connected", icon: Database, color: "text-amber-600 bg-amber-50 dark:bg-amber-950/40" },
    { title: "CVs Uploaded", value: summary.cvUploadedCount.toLocaleString(), subtitle: "Original PDFs Saved", icon: FileCheck, color: "text-purple-600 bg-purple-50 dark:bg-purple-950/40" },
    { title: "New Joinees", value: summary.newJoineesCount.toLocaleString(), subtitle: "Added This Month", icon: UserPlus, color: "text-cyan-600 bg-cyan-50 dark:bg-cyan-950/40" },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {cards.map((c, i) => {
        const Icon = c.icon;
        return (
          <Card key={i} className="border-slate-200/80 dark:border-slate-800 rounded-2xl bg-white dark:bg-[#111c38] shadow-sm">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-500">{c.title}</p>
                <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1 font-mono">{c.value}</h3>
                <p className="text-[11px] text-slate-400 font-medium mt-0.5">{c.subtitle}</p>
              </div>
              <div className={`p-3 rounded-2xl ${c.color}`}>
                <Icon className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
