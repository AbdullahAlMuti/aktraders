"use client";

import { useEffect, useState } from "react";
import { PageContainer } from "@/components/layouts/PageContainer";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import Link from "next/link";
import {
  Building2,
  Users,
  Search,
  Plus,
  ArrowUpRight,
  LayoutGrid,
  List,
  TrendingUp,
} from "lucide-react";
import { reportsService, DashboardSummary } from "@/services/reports.service";

export default function DepartmentsPage() {
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [searchQuery, setSearchQuery] = useState("");
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

  const colorList = [
    { bg: "bg-[#cc785c]", badge: "bg-[#cc785c]/10 text-[#cc785c] border-[#cc785c]/20" },
    { bg: "bg-emerald-500", badge: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400" },
    { bg: "bg-purple-500", badge: "bg-purple-500/10 text-purple-600 border-purple-500/20 dark:text-purple-400" },
    { bg: "bg-amber-500", badge: "bg-amber-500/10 text-amber-600 border-amber-500/20 dark:text-amber-400" },
    { bg: "bg-cyan-500", badge: "bg-cyan-500/10 text-cyan-600 border-cyan-500/20 dark:text-cyan-400" },
  ];

  const departments = summary.departmentDistribution.map((d, idx) => {
    const c = colorList[idx % colorList.length];
    return {
      id: `dept-${d.name.toLowerCase()}`,
      name: `${d.name} Department`,
      code: d.name,
      leadName: "Department Lead",
      leadRole: "Head of " + d.name,
      employeesCount: d.count,
      percentage: d.percentage,
      budget: `$0`,
      openPositions: 0,
      status: "Active",
      description: `Official organizational unit managing ${d.name} operations and staff.`,
      accentColor: c.bg,
      badgeClass: c.badge,
    };
  });

  const filteredDepts = departments.filter(
    (d) =>
      d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <PageContainer title="Departments" subtitle="AK Traders Organizational Units & Headcount">
      <div className="space-y-6 select-none">
        {/* 1. Top Enterprise Control Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#e6dfd8] dark:border-[#2e2c28] pb-5">
          <div>
            <h2 className="text-xl font-light text-neutral-900 dark:text-white flex items-center gap-2">
              <span>Department Infrastructure</span>
              <span className="text-xs font-mono font-normal text-neutral-500 bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 rounded-full">
                {departments.length} Active Units
              </span>
            </h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
              {summary.totalEmployees.toLocaleString()} total personnel allocated across departments.
            </p>
          </div>

          <div className="flex items-center space-x-3 shrink-0">
            {/* View Mode Toggle */}
            <div className="flex items-center rounded-lg bg-neutral-100 p-1 dark:bg-neutral-800 text-xs">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-1.5 rounded-md transition-all ${
                  viewMode === "grid"
                    ? "bg-white text-neutral-900 shadow-sm dark:bg-neutral-900 dark:text-white font-bold"
                    : "text-neutral-500 hover:text-neutral-900 dark:text-neutral-400"
                }`}
                title="Grid View"
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode("table")}
                className={`p-1.5 rounded-md transition-all ${
                  viewMode === "table"
                    ? "bg-white text-neutral-900 shadow-sm dark:bg-neutral-900 dark:text-white font-bold"
                    : "text-neutral-500 hover:text-neutral-900 dark:text-neutral-400"
                }`}
                title="Table View"
              >
                <List className="h-4 w-4" />
              </button>
            </div>

            <Button variant="primary" leftIcon={<Plus className="h-4 w-4" />}>
              Create Department
            </Button>
          </div>
        </div>

        {/* 2. Visual Headcount Distribution Progress Bar */}
        <div className="rounded-2xl border border-[#e6dfd8] bg-white p-5 dark:border-[#2e2c28] dark:bg-[#0c0d0e] space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-neutral-900 dark:text-white flex items-center gap-1.5">
              <TrendingUp className="h-4 w-4 text-[#cc785c]" />
              <span>Headcount Distribution Share</span>
            </span>
            <span className="font-mono text-neutral-500">Total: {summary.totalEmployees.toLocaleString()} Personnel</span>
          </div>

          <div className="h-3 w-full rounded-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden flex">
            {departments.length === 0 ? (
              <div className="w-full bg-neutral-200 dark:bg-neutral-800 h-full" />
            ) : (
              departments.map((d) => (
                <div
                  key={d.id}
                  style={{ width: `${d.percentage}%` }}
                  className={`${d.accentColor} h-full transition-all hover:opacity-90`}
                  title={`${d.name}: ${d.employeesCount} staff (${d.percentage}%)`}
                />
              ))
            )}
          </div>

          <div className="flex flex-wrap items-center gap-4 text-[11px] pt-1">
            {departments.length === 0 ? (
              <span className="text-xs text-neutral-400 font-mono">No department records found in database</span>
            ) : (
              departments.map((d) => (
                <div key={d.id} className="flex items-center space-x-1.5">
                  <span className={`h-2.5 w-2.5 rounded-full ${d.accentColor}`} />
                  <span className="font-semibold text-neutral-800 dark:text-neutral-200">{d.code}</span>
                  <span className="font-mono text-neutral-400 text-[10px]">({d.employeesCount})</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* 3. Search & Filter Bar */}
        <div className="flex items-center justify-between gap-4">
          <div className="relative max-w-sm w-full">
            <input
              type="text"
              placeholder="Filter by department name, code, or lead..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-full border border-[#e6dfd8] bg-white py-1.5 pl-9 pr-4 text-xs text-neutral-900 placeholder-neutral-400 focus:border-[#cc785c] focus:outline-none dark:border-[#2e2c28] dark:bg-[#0c0d0e] dark:text-white"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400" />
          </div>

          <div className="text-xs text-neutral-500 font-mono">
            Showing {filteredDepts.length} of {departments.length} departments
          </div>
        </div>

        {/* 4. Grid View Mode */}
        {viewMode === "grid" && (
          loading ? (
            <div className="py-12 text-center text-xs text-neutral-400 font-mono">Loading departments...</div>
          ) : filteredDepts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center space-y-2 border border-dashed border-[#e6dfd8] dark:border-[#2e2c28] rounded-2xl">
              <Building2 className="h-10 w-10 text-neutral-400" />
              <p className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">No Department Data Available</p>
              <p className="text-xs text-neutral-400">No department records exist in the database yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredDepts.map((dept) => (
                <div
                  key={dept.id}
                  className="rounded-2xl border border-[#e6dfd8] bg-white p-5 dark:border-[#2e2c28] dark:bg-[#0c0d0e] h-full flex flex-col justify-between space-y-4 group relative"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${dept.badgeClass}`}>
                        {dept.code}
                      </span>
                      <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        {dept.status}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-neutral-900 dark:text-white mt-3 group-hover:text-[#cc785c] transition-colors">
                      {dept.name}
                    </h3>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 leading-relaxed line-clamp-2">
                      {dept.description}
                    </p>

                    <div className="flex items-center space-x-2.5 mt-4 p-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800">
                      <Avatar name={dept.leadName} size="sm" />
                      <div>
                        <p className="text-xs font-bold text-neutral-900 dark:text-white">{dept.leadName}</p>
                        <p className="text-[10px] text-neutral-500">{dept.leadRole}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 pt-3 border-t border-neutral-100 dark:border-neutral-800">
                    <div className="grid grid-cols-3 gap-2 text-center text-xs">
                      <div className="bg-neutral-50 dark:bg-neutral-900/60 p-2 rounded-xl border border-neutral-100 dark:border-neutral-800">
                        <span className="text-[10px] text-neutral-400 block">Personnel</span>
                        <span className="font-extrabold text-neutral-900 dark:text-white font-tabular">{dept.employeesCount}</span>
                      </div>

                      <div className="bg-neutral-50 dark:bg-neutral-900/60 p-2 rounded-xl border border-neutral-100 dark:border-neutral-800">
                        <span className="text-[10px] text-neutral-400 block">Annual Budget</span>
                        <span className="font-extrabold text-neutral-900 dark:text-white font-tabular">{dept.budget}</span>
                      </div>

                      <div className="bg-neutral-50 dark:bg-neutral-900/60 p-2 rounded-xl border border-neutral-100 dark:border-neutral-800">
                        <span className="text-[10px] text-neutral-400 block">Open Roles</span>
                        <span className="font-extrabold text-[#cc785c] dark:text-[#cc785c] font-tabular">+{dept.openPositions}</span>
                      </div>
                    </div>

                    <Link href={`/employees?department=${dept.code}`} className="block">
                      <Button
                        variant="outline"
                        className="w-full justify-between text-xs rounded-xl"
                        rightIcon={<ArrowUpRight className="h-3.5 w-3.5" />}
                      >
                        View {dept.code} Directory
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )
        )}

        {/* 5. High-Density Table View Mode */}
        {viewMode === "table" && (
          <div className="rounded-2xl border border-[#e6dfd8] bg-white overflow-hidden dark:border-[#2e2c28] dark:bg-[#0c0d0e]">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-50 dark:bg-neutral-900/80 border-b border-neutral-200 dark:border-neutral-800 text-neutral-500 font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Code</th>
                  <th className="py-3 px-4">Department Name</th>
                  <th className="py-3 px-4">Department Lead</th>
                  <th className="py-3 px-4 text-right">Headcount</th>
                  <th className="py-3 px-4 text-right">Budget</th>
                  <th className="py-3 px-4 text-right">Open Roles</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                {filteredDepts.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-xs text-neutral-400">
                      No department records available
                    </td>
                  </tr>
                ) : (
                  filteredDepts.map((dept) => (
                    <tr key={dept.id} className="hover:bg-neutral-50/80 dark:hover:bg-neutral-900/50 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-[#cc785c]">{dept.code}</td>
                      <td className="py-3.5 px-4">
                        <p className="font-bold text-neutral-900 dark:text-white">{dept.name}</p>
                        <p className="text-[11px] text-neutral-400 line-clamp-1">{dept.description}</p>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center space-x-2">
                          <Avatar name={dept.leadName} size="sm" />
                          <div>
                            <p className="font-bold text-neutral-900 dark:text-white">{dept.leadName}</p>
                            <p className="text-[10px] text-neutral-400">{dept.leadRole}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-right font-extrabold font-tabular text-neutral-900 dark:text-white">
                        {dept.employeesCount} staff
                      </td>
                      <td className="py-3.5 px-4 text-right font-extrabold font-tabular text-neutral-700 dark:text-neutral-300">
                        {dept.budget}
                      </td>
                      <td className="py-3.5 px-4 text-right font-extrabold font-tabular text-[#cc785c]">
                        +{dept.openPositions}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <Link href={`/employees?department=${dept.code}`}>
                          <Button variant="ghost" size="sm" rightIcon={<ArrowUpRight className="h-3.5 w-3.5" />}>
                            View
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </PageContainer>
  );
}
