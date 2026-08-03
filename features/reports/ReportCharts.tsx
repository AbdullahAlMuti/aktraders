"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { DepartmentDistributionChart } from "@/features/dashboard/DepartmentDistributionChart";

export function ReportCharts() {
  // Data for Monthly New Joinees Line Chart
  const newJoineesMonthly = [
    { month: "জানু", count: 40 },
    { month: "ফেব্রু", count: 60 },
    { month: "মার্চ", count: 45 },
    { month: "এপ্রিল", count: 55 },
    { month: "মে", count: 40 },
    { month: "জুন", count: 50 },
    { month: "জুলাই", count: 85 },
    { month: "আগস্ট", count: 65 },
    { month: "সেপ্টে", count: 42 },
    { month: "অক্টো", count: 52 },
    { month: "নভে", count: 48 },
    { month: "ডিসে", count: 25 },
  ];

  // Coordinates for line chart SVG
  const svgWidth = 500;
  const svgHeight = 160;
  const maxVal = 100;

  const points = newJoineesMonthly.map((d, index) => {
    const x = (index / (newJoineesMonthly.length - 1)) * (svgWidth - 40) + 20;
    const y = svgHeight - (d.count / maxVal) * (svgHeight - 40) - 20;
    return { x, y, ...d };
  });

  const pathD = points.reduce((acc, curr, index) => {
    return index === 0 ? `M ${curr.x} ${curr.y}` : `${acc} L ${curr.x} ${curr.y}`;
  }, "");

  // Employment Type Progress Bars
  const employmentTypes = [
    { label: "স্থায়ী (Permanent)", count: "2,100", percentage: 70, color: "bg-blue-600" },
    { label: "চুক্তিভিত্তিক (Contractual)", count: "600", percentage: 20, color: "bg-emerald-500" },
    { label: "ইন্টার্ন (Intern)", count: "150", percentage: 5, color: "bg-amber-500" },
    { label: "আউটসোর্স (Outsourced)", count: "150", percentage: 5, color: "bg-purple-500" },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* 1. Department Breakdown Donut Chart */}
      <div className="lg:col-span-6">
        <DepartmentDistributionChart />
      </div>

      {/* 2. Monthly New Joinees Line Chart */}
      <div className="lg:col-span-6">
        <Card className="border-slate-200/80 dark:border-slate-800 h-full">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base font-bold text-slate-900 dark:text-slate-100">
              মাস অনুযায়ী নতুন যোগদান (Monthly New Joinees)
            </CardTitle>
            <select className="rounded border border-slate-200 bg-white px-2 py-0.5 text-xs text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
              <option>লাইন চার্ট</option>
              <option>বার চার্ট</option>
            </select>
          </CardHeader>
          <CardContent>
            <div className="relative w-full overflow-x-auto pt-2">
              <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-40 overflow-visible">
                {[0, 25, 50, 75, 100].map((gridVal) => {
                  const y = svgHeight - (gridVal / maxVal) * (svgHeight - 40) - 20;
                  return (
                    <g key={gridVal}>
                      <line x1="0" y1={y} x2={svgWidth} y2={y} className="stroke-slate-100 dark:stroke-slate-800" strokeDasharray="2 2" />
                      <text x="0" y={y - 2} className="text-[9px] fill-slate-400">
                        {gridVal}
                      </text>
                    </g>
                  );
                })}
                <path d={pathD} fill="none" stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                {points.map((p, i) => (
                  <circle key={i} cx={p.x} cy={p.y} r="3.5" className="fill-blue-600 stroke-white stroke-2" />
                ))}
              </svg>
              <div className="flex justify-between text-[9px] text-slate-500 mt-1">
                {newJoineesMonthly.map((m, i) => (
                  <span key={i}>{m.month}</span>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 3. Gender Distribution Arc Chart */}
      <div className="lg:col-span-6">
        <Card className="border-slate-200/80 dark:border-slate-800 h-full">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-bold text-slate-900 dark:text-slate-100">
              লিঙ্গ ভিত্তিক এমপ্লয়ী (Gender Breakdown)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center pt-2">
              {/* Semi Circle Arc SVG */}
              <div className="relative flex items-center justify-center">
                <svg width="200" height="110" viewBox="0 0 200 110">
                  <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="#e2e8f0" strokeWidth="20" strokeLinecap="round" />
                  {/* Male arc 70% */}
                  <path d="M 20 100 A 80 80 0 0 1 150 40" fill="none" stroke="#2563eb" strokeWidth="20" strokeLinecap="round" />
                  {/* Female arc 30% */}
                  <path d="M 152 40 A 80 80 0 0 1 180 100" fill="none" stroke="#f43f5e" strokeWidth="20" strokeLinecap="round" />
                </svg>
                <div className="absolute bottom-2 text-center">
                  <span className="text-xl font-extrabold text-slate-900 dark:text-slate-100">3,000</span>
                  <p className="text-[10px] text-slate-400 font-semibold">মোট</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-8 w-full max-w-xs mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs">
                <div className="flex items-center space-x-2">
                  <span className="h-3 w-3 rounded-full bg-blue-600" />
                  <div>
                    <p className="font-semibold text-slate-700 dark:text-slate-300">পুরুষ (Male)</p>
                    <p className="font-extrabold text-slate-900 dark:text-slate-100">2,100 (70%)</p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="h-3 w-3 rounded-full bg-rose-500" />
                  <div>
                    <p className="font-semibold text-slate-700 dark:text-slate-300">মহিলা (Female)</p>
                    <p className="font-extrabold text-slate-900 dark:text-slate-100">900 (30%)</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 4. Employment Type Horizontal Progress Bar Chart */}
      <div className="lg:col-span-6">
        <Card className="border-slate-200/80 dark:border-slate-800 h-full">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-bold text-slate-900 dark:text-slate-100">
              চাকরির ধরন অনুযায়ী (Employment Type Breakdown)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-2">
            {employmentTypes.map((type, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-700 dark:text-slate-300">{type.label}</span>
                  <span className="text-slate-900 dark:text-slate-100">
                    {type.count} ({type.percentage}%)
                  </span>
                </div>
                <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
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
