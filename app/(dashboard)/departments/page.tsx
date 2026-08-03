"use client";

import { useState } from "react";
import { PageContainer } from "@/components/layouts/PageContainer";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import Link from "next/link";
import {
  Building2,
  Users,
  Search,
  Plus,
  ArrowUpRight,
  SlidersHorizontal,
  LayoutGrid,
  List,
  DollarSign,
  Briefcase,
  Layers,
  Sparkles,
  TrendingUp,
} from "lucide-react";

export default function DepartmentsPage() {
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [searchQuery, setSearchQuery] = useState("");

  const departments = [
    {
      id: "dept-it",
      name: "Information Technology & Software",
      code: "IT",
      leadName: "Abdullah Al Muti",
      leadRole: "VP of Engineering & IT",
      employeesCount: 680,
      percentage: 22.6,
      budget: "$1,850,000",
      openPositions: 14,
      status: "Scaling",
      description: "Software engineering, cloud infrastructure, AI CV parsing models, and ERP security.",
      teamAvatars: ["Abdullah", "Rahim", "Karis", "Tariq"],
      accentColor: "bg-[#533afd]",
      badgeClass: "bg-[#533afd]/10 text-[#533afd] border-[#533afd]/20",
    },
    {
      id: "dept-ops",
      name: "Operations & Logistics",
      code: "Operations",
      leadName: "Tariqul Islam",
      leadRole: "Director of Operations",
      employeesCount: 950,
      percentage: 31.6,
      budget: "$2,400,000",
      openPositions: 18,
      status: "Active",
      description: "Supply chain management, international logistics, inventory tracking, and warehouse control.",
      teamAvatars: ["Tariqul", "Jasim", "Nadia", "Sufian"],
      accentColor: "bg-emerald-500",
      badgeClass: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400",
    },
    {
      id: "dept-hr",
      name: "Human Resources & Talent",
      code: "HR",
      leadName: "Farhana Yasmin",
      leadRole: "Head of People & Culture",
      employeesCount: 520,
      percentage: 17.3,
      budget: "$980,000",
      openPositions: 5,
      status: "Active",
      description: "Talent acquisition, recruitment, onboarding workflows, payroll, and employee relations.",
      teamAvatars: ["Farhana", "Mitu", "Abrar", "Tanvir"],
      accentColor: "bg-purple-500",
      badgeClass: "bg-purple-500/10 text-purple-600 border-purple-500/20 dark:text-purple-400",
    },
    {
      id: "dept-fin",
      name: "Finance & Corporate Accounts",
      code: "Finance",
      leadName: "Kamrul Hasan",
      leadRole: "Chief Financial Officer",
      employeesCount: 450,
      percentage: 15.0,
      budget: "$1,120,000",
      openPositions: 3,
      status: "Active",
      description: "Corporate financial auditing, taxation, compliance, invoicing, and revenue planning.",
      teamAvatars: ["Kamrul", "Hasan", "Shirin", "Sabbir"],
      accentColor: "bg-amber-500",
      badgeClass: "bg-amber-500/10 text-amber-600 border-amber-500/20 dark:text-amber-400",
    },
    {
      id: "dept-sales",
      name: "Sales & Strategic Accounts",
      code: "Sales",
      leadName: "Mahmudul Karim",
      leadRole: "VP of Global Sales",
      employeesCount: 400,
      percentage: 13.5,
      budget: "$1,450,000",
      openPositions: 8,
      status: "Expanding",
      description: "Global business expansion, key account management, marketing, and client partnerships.",
      teamAvatars: ["Mahmud", "Karim", "Zia", "Rashed"],
      accentColor: "bg-cyan-500",
      badgeClass: "bg-cyan-500/10 text-cyan-600 border-cyan-500/20 dark:text-cyan-400",
    },
  ];

  const filteredDepts = departments.filter(
    (d) =>
      d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.leadName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <PageContainer title="Departments" subtitle="AK Traders Organizational Units & Headcount">
      <div className="space-y-6 select-none">
        {/* 1. Top Enterprise Control Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#e3e8ee] dark:border-neutral-800 pb-5">
          <div>
            <h2 className="text-xl font-light text-[#0d253d] dark:text-white stripe-display-heading flex items-center gap-2">
              <span>Department Infrastructure</span>
              <span className="text-xs font-mono font-normal text-neutral-500 bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 rounded-full">
                5 Active Units
              </span>
            </h2>
            <p className="text-xs text-[#64748d] dark:text-neutral-400 mt-1">
              3,000 total personnel allocated across engineering, operations, HR, finance, and sales.
            </p>
          </div>

          <div className="flex items-center space-x-3 shrink-0">
            {/* View Mode Toggle */}
            <div className="flex items-center rounded-lg bg-neutral-100 p-1 dark:bg-neutral-800 text-xs">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-1.5 rounded-md transition-all ${
                  viewMode === "grid"
                    ? "bg-white text-[#0d253d] shadow-sm dark:bg-neutral-900 dark:text-white font-bold"
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
                    ? "bg-white text-[#0d253d] shadow-sm dark:bg-neutral-900 dark:text-white font-bold"
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
        <div className="rounded-2xl border border-[#e3e8ee] bg-white p-5 dark:border-neutral-800 dark:bg-[#0c0d0e] space-y-3 stripe-card-shadow">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-[#0d253d] dark:text-neutral-100 flex items-center gap-1.5">
              <TrendingUp className="h-4 w-4 text-[#533afd]" />
              <span>Headcount Distribution Share</span>
            </span>
            <span className="font-mono text-neutral-500">Total: 3,000 Personnel</span>
          </div>

          <div className="h-3 w-full rounded-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden flex">
            {departments.map((d) => (
              <div
                key={d.id}
                style={{ width: `${d.percentage}%` }}
                className={`${d.accentColor} h-full transition-all hover:opacity-90`}
                title={`${d.name}: ${d.employeesCount} staff (${d.percentage}%)`}
              />
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-4 text-[11px] pt-1">
            {departments.map((d) => (
              <div key={d.id} className="flex items-center space-x-1.5">
                <span className={`h-2.5 w-2.5 rounded-full ${d.accentColor}`} />
                <span className="font-semibold text-neutral-800 dark:text-neutral-200">{d.code}</span>
                <span className="font-mono text-neutral-400 text-[10px]">({d.employeesCount})</span>
              </div>
            ))}
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
              className="w-full rounded-full border border-[#e3e8ee] bg-white py-1.5 pl-9 pr-4 text-xs text-[#0d253d] placeholder-neutral-400 focus:border-[#533afd] focus:outline-none dark:border-neutral-800 dark:bg-[#0c0d0e] dark:text-white"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400" />
          </div>

          <div className="text-xs text-neutral-500 font-mono">
            Showing {filteredDepts.length} of {departments.length} departments
          </div>
        </div>

        {/* 4. Grid View Mode */}
        {viewMode === "grid" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredDepts.map((dept) => (
              <div
                key={dept.id}
                className="rounded-2xl border border-[#e6dfd8] bg-white p-5 dark:border-neutral-800 dark:bg-[#0c0d0e] h-full flex flex-col justify-between space-y-4 group relative"
              >
                <div>
                  {/* Top Bar: Code Badge & Status */}
                  <div className="flex items-center justify-between">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${dept.badgeClass}`}>
                      {dept.code}
                    </span>
                    <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      {dept.status}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-base font-bold text-[#0d253d] dark:text-white mt-3 group-hover:text-[#533afd] transition-colors">
                    {dept.name}
                  </h3>
                  <p className="text-xs text-[#64748d] dark:text-neutral-400 mt-1 leading-relaxed line-clamp-2">
                    {dept.description}
                  </p>

                  {/* Department Lead */}
                  <div className="flex items-center space-x-2.5 mt-4 p-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800">
                    <Avatar name={dept.leadName} size="sm" />
                    <div>
                      <p className="text-xs font-bold text-[#0d253d] dark:text-white">{dept.leadName}</p>
                      <p className="text-[10px] text-neutral-500">{dept.leadRole}</p>
                    </div>
                  </div>
                </div>

                {/* Metrics Matrix */}
                <div className="space-y-3 pt-3 border-t border-neutral-100 dark:border-neutral-800">
                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="bg-neutral-50 dark:bg-neutral-900/60 p-2 rounded-xl border border-neutral-100 dark:border-neutral-800">
                      <span className="text-[10px] text-neutral-400 block">Personnel</span>
                      <span className="font-extrabold text-[#0d253d] dark:text-white font-tabular">{dept.employeesCount}</span>
                    </div>

                    <div className="bg-neutral-50 dark:bg-neutral-900/60 p-2 rounded-xl border border-neutral-100 dark:border-neutral-800">
                      <span className="text-[10px] text-neutral-400 block">Annual Budget</span>
                      <span className="font-extrabold text-[#0d253d] dark:text-white font-tabular">{dept.budget}</span>
                    </div>

                    <div className="bg-neutral-50 dark:bg-neutral-900/60 p-2 rounded-xl border border-neutral-100 dark:border-neutral-800">
                      <span className="text-[10px] text-neutral-400 block">Open Roles</span>
                      <span className="font-extrabold text-[#533afd] dark:text-blue-400 font-tabular">+{dept.openPositions}</span>
                    </div>
                  </div>

                  {/* Action Link */}
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
        )}

        {/* 5. High-Density Table View Mode */}
        {viewMode === "table" && (
          <div className="rounded-2xl border border-[#e3e8ee] bg-white overflow-hidden dark:border-neutral-800 dark:bg-[#0c0d0e] stripe-card-shadow">
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
                {filteredDepts.map((dept) => (
                  <tr key={dept.id} className="hover:bg-neutral-50/80 dark:hover:bg-neutral-900/50 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-[#533afd]">{dept.code}</td>
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-[#0d253d] dark:text-white">{dept.name}</p>
                      <p className="text-[11px] text-neutral-400 line-clamp-1">{dept.description}</p>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center space-x-2">
                        <Avatar name={dept.leadName} size="sm" />
                        <div>
                          <p className="font-bold text-[#0d253d] dark:text-white">{dept.leadName}</p>
                          <p className="text-[10px] text-neutral-400">{dept.leadRole}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-right font-extrabold font-tabular text-[#0d253d] dark:text-white">
                      {dept.employeesCount} staff
                    </td>
                    <td className="py-3.5 px-4 text-right font-extrabold font-tabular text-neutral-700 dark:text-neutral-300">
                      {dept.budget}
                    </td>
                    <td className="py-3.5 px-4 text-right font-extrabold font-tabular text-[#533afd] dark:text-blue-400">
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
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </PageContainer>
  );
}
