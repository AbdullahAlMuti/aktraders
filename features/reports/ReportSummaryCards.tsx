"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/Card";
import { Users, CheckCircle, UserX, FileCheck, UserPlus } from "lucide-react";
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
    { title: "Total Employees", value: summary.totalEmployees.toLocaleString(), subtitle: "All Time", icon: Users, color: "text-[#cc785c] bg-[#cc785c]/10" },
    { title: "Active Employees", value: summary.processedCount.toLocaleString(), subtitle: "Currently Active", icon: CheckCircle, color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40" },
    { title: "Resigned / Retired", value: summary.inProcessingCount.toLocaleString(), subtitle: "In Processing", icon: UserX, color: "text-amber-600 bg-amber-50 dark:bg-amber-950/40" },
    { title: "CVs Uploaded", value: summary.cvUploadedCount.toLocaleString(), subtitle: "This Period", icon: FileCheck, color: "text-purple-600 bg-purple-50 dark:bg-purple-950/40" },
    { title: "New Joinees", value: summary.newJoineesCount.toLocaleString(), subtitle: "This Month", icon: UserPlus, color: "text-cyan-600 bg-cyan-50 dark:bg-cyan-950/40" },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {cards.map((c, i) => {
        const Icon = c.icon;
        return (
          <Card key={i} className="border-[#e6dfd8] dark:border-[#2e2c28]">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-neutral-500">{c.title}</p>
                <h3 className="text-2xl font-extrabold text-neutral-900 dark:text-white mt-1">{c.value}</h3>
                <p className="text-[10px] text-neutral-400 mt-0.5">{c.subtitle}</p>
              </div>
              <div className={`p-3 rounded-xl ${c.color}`}>
                <Icon className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
