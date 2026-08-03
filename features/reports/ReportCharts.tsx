"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { DepartmentDistributionChart } from "@/features/dashboard/DepartmentDistributionChart";
import { useEffect, useState } from "react";
import { reportsService, DashboardSummary } from "@/services/reports.service";

export function ReportCharts() {
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

  const newJoineesMonthly = summary.monthlyTrend.length > 0 ? summary.monthlyTrend : [
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
  ];

  const svgWidth = 500;
  const svgHeight = 160;
  const maxVal = Math.max(...newJoineesMonthly.map((d) => d.count), 10);

  const points = newJoineesMonthly.map((d, index) => {
    const x = (index / (newJoineesMonthly.length - 1)) * (svgWidth - 40) + 20;
    const y = svgHeight - (d.count / maxVal) * (svgHeight - 40) - 20;
    return { x, y, ...d };
  });

  const pathD = points.reduce((acc, curr, index) => {
    return index === 0 ? `M ${curr.x} ${curr.y}` : `${acc} L ${curr.x} ${curr.y}`;
  }, "");

  // Calculate real employment types or show 0
  const total = summary.totalEmployees;
  const activeCount = summary.processedCount;
  const processingCount = summary.inProcessingCount;
  const pendingCount = total - activeCount - processingCount;

  const employmentTypes = [
    {
      label: "সক্রিয় (Active Staff)",
      count: activeCount,
      percentage: total > 0 ? Math.round((activeCount / total) * 100) : 0,
      color: "bg-[#cc785c]",
    },
    {
      label: "প্রসেসিং (In Processing)",
      count: processingCount,
      percentage: total > 0 ? Math.round((processingCount / total) * 100) : 0,
      color: "bg-amber-500",
    },
    {
      label: "অপেক্ষমান (Pending Review)",
      count: Math.max(0, pendingCount),
      percentage: total > 0 ? Math.round((Math.max(0, pendingCount) / total) * 100) : 0,
      color: "bg-[#22262b]",
    },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* 1. Department Breakdown Donut Chart */}
      <div className="lg:col-span-6">
        <DepartmentDistributionChart />
      </div>

      {/* 2. Monthly New Joinees Line Chart */}
      <div className="lg:col-span-6">
        <Card className="border-[#e6dfd8] dark:border-[#2e2c28] h-full">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base font-bold text-neutral-900 dark:text-white">
              মাস অনুযায়ী নতুন যোগদান (Monthly New Joinees)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative w-full overflow-x-auto pt-2">
              <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-40 overflow-visible">
                {[0, Math.round(maxVal / 4), Math.round(maxVal / 2), Math.round((maxVal * 3) / 4), maxVal].map((gridVal, i) => {
                  const y = svgHeight - (gridVal / maxVal) * (svgHeight - 40) - 20;
                  return (
                    <g key={i}>
                      <line x1="0" y1={y} x2={svgWidth} y2={y} className="stroke-neutral-200 dark:stroke-neutral-800" strokeDasharray="2 2" />
                      <text x="0" y={y - 2} className="text-[9px] fill-neutral-400">
                        {gridVal}
                      </text>
                    </g>
                  );
                })}
                <path d={pathD} fill="none" stroke="#cc785c" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                {points.map((p, i) => (
                  <circle key={i} cx={p.x} cy={p.y} r="3.5" className="fill-[#cc785c] stroke-white dark:stroke-[#181715] stroke-2" />
                ))}
              </svg>
              <div className="flex justify-between text-[9px] text-neutral-400 mt-1">
                {newJoineesMonthly.map((m, i) => (
                  <span key={i}>{m.month}</span>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 3. Status Breakdown Arc Chart */}
      <div className="lg:col-span-6">
        <Card className="border-[#e6dfd8] dark:border-[#2e2c28] h-full">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-bold text-neutral-900 dark:text-white">
              অবস্থা ভিত্তিক বিশ্লেষণ (Status Breakdown)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center pt-2">
              <div className="relative flex items-center justify-center">
                <svg width="200" height="110" viewBox="0 0 200 110">
                  <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="#22262b" strokeWidth="20" strokeLinecap="round" />
                  {total > 0 && (
                    <path
                      d="M 20 100 A 80 80 0 0 1 150 40"
                      fill="none"
                      stroke="#cc785c"
                      strokeWidth="20"
                      strokeLinecap="round"
                    />
                  )}
                </svg>
                <div className="absolute bottom-2 text-center">
                  <span className="text-xl font-extrabold text-neutral-900 dark:text-white">{total.toLocaleString()}</span>
                  <p className="text-[10px] text-neutral-400 font-semibold">মোট</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-8 w-full max-w-xs mt-4 pt-4 border-t border-[#e6dfd8] dark:border-[#2e2c28] text-xs">
                <div className="flex items-center space-x-2">
                  <span className="h-3 w-3 rounded-full bg-[#cc785c]" />
                  <div>
                    <p className="font-semibold text-neutral-700 dark:text-neutral-300">সক্রিয় (Active)</p>
                    <p className="font-extrabold text-neutral-900 dark:text-white">
                      {activeCount} ({total > 0 ? Math.round((activeCount / total) * 100) : 0}%)
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="h-3 w-3 rounded-full bg-amber-500" />
                  <div>
                    <p className="font-semibold text-neutral-700 dark:text-neutral-300">প্রসেসিং (Processing)</p>
                    <p className="font-extrabold text-neutral-900 dark:text-white">
                      {processingCount} ({total > 0 ? Math.round((processingCount / total) * 100) : 0}%)
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 4. Employment Type Horizontal Progress Bar Chart */}
      <div className="lg:col-span-6">
        <Card className="border-[#e6dfd8] dark:border-[#2e2c28] h-full">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-bold text-neutral-900 dark:text-white">
              চাকরির ধরন অনুযায়ী (Employment Status Breakdown)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-2">
            {employmentTypes.map((type, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-neutral-700 dark:text-neutral-300">{type.label}</span>
                  <span className="text-neutral-900 dark:text-white">
                    {type.count} ({type.percentage}%)
                  </span>
                </div>
                <div className="h-2.5 w-full overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800">
                  <div className={`h-full ${type.color} rounded-full`} style={{ width: `${type.percentage}%` }} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
