"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { useEffect, useState } from "react";
import { reportsService } from "@/services/reports.service";

export function CVProcessingChart() {
  const [selectedYear, setSelectedYear] = useState("2026");
  const [monthlyData, setMonthlyData] = useState<Array<{ month: string; val: number }>>([
    { month: "Jan", val: 0 },
    { month: "Feb", val: 0 },
    { month: "Mar", val: 0 },
    { month: "Apr", val: 0 },
    { month: "May", val: 0 },
    { month: "Jun", val: 0 },
    { month: "Jul", val: 0 },
    { month: "Aug", val: 0 },
    { month: "Sep", val: 0 },
    { month: "Oct", val: 0 },
    { month: "Nov", val: 0 },
    { month: "Dec", val: 0 },
  ]);

  useEffect(() => {
    reportsService.getDashboardSummary().then((summary) => {
      if (summary && summary.monthlyTrend && summary.monthlyTrend.length > 0) {
        setMonthlyData(summary.monthlyTrend.map((m) => ({ month: m.month, val: m.count })));
      }
    });
  }, [selectedYear]);

  const maxVal = Math.max(...monthlyData.map((p) => p.val), 10);
  const svgWidth = 600;
  const svgHeight = 200;

  const coords = monthlyData.map((p, index) => {
    const x = (index / (monthlyData.length - 1)) * (svgWidth - 40) + 20;
    const y = svgHeight - (p.val / maxVal) * (svgHeight - 40) - 20;
    return { x, y, ...p };
  });

  const pathD = coords.reduce((acc, curr, index) => {
    return index === 0 ? `M ${curr.x} ${curr.y}` : `${acc} L ${curr.x} ${curr.y}`;
  }, "");

  return (
    <Card className="h-full flex flex-col justify-between border-[#e6dfd8] dark:border-[#2e2c28]">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base font-bold text-neutral-900 dark:text-white">
          Monthly CV Processing Trend
        </CardTitle>
        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(e.target.value)}
          className="rounded-md border border-[#e6dfd8] bg-transparent px-2.5 py-1 text-xs font-semibold text-neutral-700 dark:border-[#2e2c28] dark:text-neutral-200"
        >
          <option value="2026">This Year (2026)</option>
          <option value="2025">2025</option>
        </select>
      </CardHeader>
      <CardContent>
        <div className="relative w-full overflow-x-auto pt-4">
          <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-48 overflow-visible">
            {[0, Math.round(maxVal / 4), Math.round(maxVal / 2), Math.round((maxVal * 3) / 4), maxVal].map((gridVal, i) => {
              const y = svgHeight - (gridVal / maxVal) * (svgHeight - 40) - 20;
              return (
                <g key={i}>
                  <line x1="0" y1={y} x2={svgWidth} y2={y} className="stroke-neutral-200 dark:stroke-neutral-800" strokeDasharray="3 3" />
                  <text x="0" y={y - 4} className="text-[9px] fill-neutral-400">
                    {gridVal}
                  </text>
                </g>
              );
            })}

            <defs>
              <linearGradient id="coralGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#cc785c" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#cc785c" stopOpacity="0.0" />
              </linearGradient>
            </defs>
            <path
              d={`${pathD} L ${coords[coords.length - 1].x} ${svgHeight - 20} L ${coords[0].x} ${svgHeight - 20} Z`}
              fill="url(#coralGradient)"
            />
            <path d={pathD} fill="none" stroke="#cc785c" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

            {coords.map((c, i) => (
              <g key={i} className="group">
                <circle cx={c.x} cy={c.y} r="3.5" className="fill-[#cc785c] stroke-white dark:stroke-[#181715] stroke-2" />
              </g>
            ))}
          </svg>

          <div className="flex justify-between px-2 text-[10px] text-neutral-400 mt-2">
            {monthlyData.map((p, i) => (
              <span key={i}>{p.month}</span>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
