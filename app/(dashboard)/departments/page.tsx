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
    { bg: "bg-[#0066ff]", badge: "bg-[#0066ff]/10 text-[#0066ff] border-[#0066ff]/20" },
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
        {/* 1. Top Control Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>Department Infrastructure</span>
              <span className="text-xs font-mono font-bold text-[#0066ff] bg-[#e8f1ff] px-3 py-1 rounded-full">
                {departments.length} Active Units
              </span>
            </h2>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">
              {summary.totalEmployees.toLocaleString()} total personnel allocated across departments.
            </p>
          </div>

          <div className="flex items-center space-x-3 shrink-0">
            {/* View Mode Toggle */}
            <div className="flex items-center rounded-xl bg-slate-100 p-1 dark:bg-slate-800 text-xs">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-lg transition-all ${
                  viewMode === "grid"
                    ? "bg-white text-slate-900 shadow-sm dark:bg-slate-900 dark:text-white font-bold"
                    : "text-slate-500 hover:text-slate-900 dark:text-slate-400"
                }`}
                title="Grid View"
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode("table")}
                className={`p-2 rounded-lg transition-all ${
                  viewMode === "table"
                    ? "bg-white text-slate-900 shadow-sm dark:bg-slate-900 dark:text-white font-bold"
                    : "text-slate-500 hover:text-slate-900 dark:text-slate-400"
                }`}
                title="Table View"
              >
                <List className="h-4 w-4" />
              </button>
            </div>

            <Button variant="primary" leftIcon={<Plus className="h-4 w-4" />} className="bg-[#0066ff] hover:bg-[#0052cc] font-bold text-sm">
              Create Department
            </Button>
          </div>
        </div>

        {/* 2. Visual Headcount Distribution Progress Bar */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 dark:border-slate-800 dark:bg-[#111c38] space-y-3 shadow-sm">
          <div className="flex items-center justify-between text-sm">
            <span className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <TrendingUp className="h-4.5 w-4.5 text-[#0066ff]" />
              <span>Headcount Distribution Share</span>
            </span>
            <span className="font-mono font-bold text-slate-500">Total: {summary.totalEmployees.toLocaleString()} Personnel</span>
          </div>

          <div className="h-3.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden flex p-0.5">
            {departments.length === 0 ? (
              <div className="w-full bg-slate-200 dark:bg-slate-800 h-full rounded-full" />
            ) : (
              departments.map((d) => (
                <div
                  key={d.id}
                  style={{ width: `${d.percentage}%` }}
                  className={`${d.accentColor} h-full transition-all hover:opacity-90 rounded-full`}
                  title={`${d.name}: ${d.employeesCount} staff (${d.percentage}%)`}
                />
              ))
            )}
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs pt-1">
            {departments.length === 0 ? (
              <span className="text-xs text-slate-400 font-mono">No department records found in database</span>
            ) : (
              departments.map((d) => (
                <div key={d.id} className="flex items-center space-x-1.5">
                  <span className={`h-3 w-3 rounded-full ${d.accentColor}`} />
                  <span className="font-bold text-slate-800 dark:text-slate-200">{d.code}</span>
                  <span className="font-mono text-slate-400 font-bold">({d.employeesCount})</span>
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
              className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-4 text-sm text-slate-900 placeholder-slate-400 focus:border-[#0066ff] focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-white font-medium"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          </div>

          <div className="text-sm text-slate-500 font-mono font-bold">
            Showing {filteredDepts.length} of {departments.length} departments
          </div>
        </div>

        {/* 4. Grid View Mode */}
        {viewMode === "grid" && (
          loading ? (
            <div className="py-12 text-center text-xs text-slate-400 font-mono">Loading departments...</div>
          ) : filteredDepts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center space-y-2 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
              <Building2 className="h-10 w-10 text-slate-400" />
              <p className="text-sm font-bold text-slate-700 dark:text-slate-300">No Department Data Available</p>
              <p className="text-xs text-slate-400">Upload candidate CVs to automatically populate live department staff.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredDepts.map((dept) => (
                <div
                  key={dept.id}
                  className="rounded-2xl border border-slate-200/80 bg-white p-5 dark:border-slate-800 dark:bg-[#111c38] h-full flex flex-col justify-between space-y-4 group relative shadow-sm"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold border ${dept.badgeClass}`}>
                        {dept.code}
                      </span>
                      <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-emerald-500" />
                        {dept.status}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-3 group-hover:text-[#0066ff] transition-colors">
                      {dept.name}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed line-clamp-2">
                      {dept.description}
                    </p>

                    <div className="flex items-center space-x-3 mt-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                      <Avatar name={dept.leadName} size="md" />
                      <div>
                        <p className="text-sm font-bold text-slate-900 dark:text-white">{dept.leadName}</p>
                        <p className="text-xs text-slate-500 font-medium">{dept.leadRole}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                    <div className="grid grid-cols-3 gap-2 text-center text-xs">
                      <div className="bg-slate-50 dark:bg-slate-900/60 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                        <span className="text-[10px] text-slate-400 block font-semibold">Personnel</span>
                        <span className="font-bold text-base text-slate-900 dark:text-white font-tabular">{dept.employeesCount}</span>
                      </div>

                      <div className="bg-slate-50 dark:bg-slate-900/60 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                        <span className="text-[10px] text-slate-400 block font-semibold">Annual Budget</span>
                        <span className="font-bold text-base text-slate-900 dark:text-white font-tabular">{dept.budget}</span>
                      </div>

                      <div className="bg-slate-50 dark:bg-slate-900/60 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                        <span className="text-[10px] text-slate-400 block font-semibold">Open Roles</span>
                        <span className="font-bold text-base text-[#0066ff] dark:text-[#0066ff] font-tabular">+{dept.openPositions}</span>
                      </div>
                    </div>

                    <Link href={`/employees?department=${dept.code}`} className="block">
                      <Button
                        variant="outline"
                        className="w-full justify-between text-xs font-bold rounded-xl hover:border-[#0066ff] hover:bg-[#e8f1ff]/50"
                        rightIcon={<ArrowUpRight className="h-4 w-4" />}
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
          <div className="rounded-2xl border border-slate-200/80 bg-white overflow-hidden dark:border-slate-800 dark:bg-[#111c38] shadow-sm">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
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
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredDepts.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-xs text-slate-400 font-medium">
                      No department records available
                    </td>
                  </tr>
                ) : (
                  filteredDepts.map((dept) => (
                    <tr key={dept.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-900/50 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-[#0066ff]">{dept.code}</td>
                      <td className="py-3.5 px-4">
                        <p className="font-bold text-sm text-slate-900 dark:text-white">{dept.name}</p>
                        <p className="text-xs text-slate-400 line-clamp-1">{dept.description}</p>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center space-x-2">
                          <Avatar name={dept.leadName} size="sm" />
                          <div>
                            <p className="font-bold text-sm text-slate-900 dark:text-white">{dept.leadName}</p>
                            <p className="text-xs text-slate-400">{dept.leadRole}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold text-sm font-tabular text-slate-900 dark:text-white">
                        {dept.employeesCount} staff
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold text-sm font-tabular text-slate-700 dark:text-slate-300">
                        {dept.budget}
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold text-sm font-tabular text-[#0066ff]">
                        +{dept.openPositions}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <Link href={`/employees?department=${dept.code}`}>
                          <Button variant="ghost" size="sm" rightIcon={<ArrowUpRight className="h-4 w-4" />} className="font-bold">
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
