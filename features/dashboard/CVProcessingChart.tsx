"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { useState } from "react";

export function CVProcessingChart() {
  const [selectedYear, setSelectedYear] = useState("2026");

  const points = [
    { month: "Jan", val: 240 },
    { month: "Feb", val: 300 },
    { month: "Mar", val: 410 },
    { month: "Apr", val: 390 },
    { month: "May", val: 460 },
    { month: "Jun", val: 620 },
    { month: "Jul", val: 820 },
    { month: "Aug", val: 590 },
    { month: "Sep", val: 400 },
    { month: "Oct", val: 480 },
    { month: "Nov", val: 520 },
    { month: "Dec", val: 310 },
  ];

  const maxVal = 1000;
  const svgWidth = 600;
  const svgHeight = 200;

  const coords = points.map((p, index) => {
    const x = (index / (points.length - 1)) * (svgWidth - 40) + 20;
    const y = svgHeight - (p.val / maxVal) * (svgHeight - 40) - 20;
    return { x, y, ...p };
  });

  const pathD = coords.reduce((acc, curr, index) => {
    return index === 0 ? `M ${curr.x} ${curr.y}` : `${acc} L ${curr.x} ${curr.y}`;
  }, "");

  return (
    <Card className="border-slate-200/80 dark:border-slate-800">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base font-bold text-slate-900 dark:text-slate-100">
          Monthly CV Processing Trend
        </CardTitle>
        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(e.target.value)}
          className="rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
        >
          <option value="2026">This Year (2026)</option>
          <option value="2025">2025</option>
        </select>
      </CardHeader>
      <CardContent>
        <div className="relative w-full overflow-x-auto pt-4">
          <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-48 overflow-visible">
            {[0, 250, 500, 750, 1000].map((gridVal) => {
              const y = svgHeight - (gridVal / maxVal) * (svgHeight - 40) - 20;
              return (
                <g key={gridVal}>
                  <line x1="0" y1={y} x2={svgWidth} y2={y} className="stroke-slate-100 dark:stroke-slate-800" strokeDasharray="3 3" />
                  <text x="0" y={y - 4} className="text-[9px] fill-slate-400">
                    {gridVal}
                  </text>
                </g>
              );
            })}

            <defs>
              <linearGradient id="blueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#2563eb" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#2563eb" stopOpacity="0.0" />
              </linearGradient>
            </defs>
            <path
              d={`${pathD} L ${coords[coords.length - 1].x} ${svgHeight - 20} L ${coords[0].x} ${svgHeight - 20} Z`}
              fill="url(#blueGradient)"
            />
            <path d={pathD} fill="none" stroke="#2563eb" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

            {coords.map((c, i) => (
              <g key={i} className="group cursor-pointer">
                <circle cx={c.x} cy={c.y} r="4" className="fill-blue-600 stroke-white stroke-2 hover:r-6 transition-all" />
              </g>
            ))}
          </svg>

          <div className="flex justify-between px-2 text-[10px] text-slate-500 mt-2">
            {points.map((p, i) => (
              <span key={i}>{p.month}</span>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
