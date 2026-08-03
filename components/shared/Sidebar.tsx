"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/utils/cn";
import { useUIStore } from "@/stores/use-ui-store";
import { useAuth } from "@/hooks/use-auth";
import {
  ChevronDown,
  Search,
  PenSquare,
  Inbox,
  LayoutDashboard,
  Layers,
  Map,
  Users,
  Building2,
  FileText,
  HelpCircle,
  LogOut,
  FolderGit2,
  ShieldCheck,
  Briefcase,
  UserCheck,
} from "lucide-react";

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarOpen } = useUIStore();
  const { logout } = useAuth();

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-40 flex flex-col bg-white dark:bg-[#0c0d0e] text-neutral-900 dark:text-neutral-100 transition-all duration-200 border-r border-neutral-200/80 dark:border-neutral-800/80 select-none",
        sidebarOpen ? "w-60 translate-x-0" : "w-16 -translate-x-full md:translate-x-0"
      )}
    >
      {/* 1. Linear Header: Company Dropdown & Action Icons */}
      <div className="flex h-12 items-center justify-between px-3 border-b border-neutral-100 dark:border-neutral-800/60">
        <Link href="/" className="flex items-center space-x-2 overflow-hidden group">
          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-extrabold text-[11px] font-mono">
            AK
          </div>
          {sidebarOpen && (
            <div className="flex items-center space-x-1 text-xs font-semibold text-neutral-900 dark:text-neutral-100">
              <span className="truncate">AK Traders</span>
              <ChevronDown className="h-3.5 w-3.5 text-neutral-400 group-hover:text-neutral-600 dark:group-hover:text-neutral-200 transition-colors" />
            </div>
          )}
        </Link>


      </div>

      {/* 2. Scrollable Linear Navigation Tree */}
      <div className="flex-1 overflow-y-auto py-2 px-2 space-y-4 text-xs scrollbar-none">
        {/* Top Direct Items */}
        <div className="space-y-0.5">
          <Link
            href="/"
            className={cn(
              "flex items-center justify-between rounded-md px-2.5 py-1.5 font-medium transition-colors",
              pathname === "/"
                ? "bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white font-semibold"
                : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-900 hover:text-neutral-900 dark:hover:text-white"
            )}
          >
            <div className="flex items-center space-x-2.5">
              <LayoutDashboard className="h-4 w-4 shrink-0 text-neutral-500 dark:text-neutral-400" />
              {sidebarOpen && <span>Dashboard</span>}
            </div>
          </Link>

          <Link
            href="/cv-upload"
            className={cn(
              "flex items-center justify-between rounded-md px-2.5 py-1.5 font-medium transition-colors",
              pathname.startsWith("/cv-upload")
                ? "bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white font-semibold"
                : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-900 hover:text-neutral-900 dark:hover:text-white"
            )}
          >
            <div className="flex items-center space-x-2.5">
              <Inbox className="h-4 w-4 shrink-0 text-neutral-500 dark:text-neutral-400" />
              {sidebarOpen && <span>AI CV Processing</span>}
            </div>
            {sidebarOpen && (
              <span className="rounded bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-mono text-[10px] px-1.5 py-0.2 font-bold">
                AI
              </span>
            )}
          </Link>
        </div>

        {/* Section 1: Workspace */}
        <div className="space-y-0.5">
          {sidebarOpen && (
            <div className="flex items-center justify-between px-2.5 py-1 text-[11px] font-medium text-neutral-400 dark:text-neutral-500">
              <span>Workspace</span>
              <ChevronDown className="h-3 w-3" />
            </div>
          )}

          <Link
            href="/employees"
            className={cn(
              "flex items-center space-x-2.5 rounded-md px-2.5 py-1.5 font-medium transition-colors",
              pathname === "/employees"
                ? "bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white font-semibold"
                : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-900 hover:text-neutral-900 dark:hover:text-white"
            )}
          >
            <Users className="h-4 w-4 shrink-0 text-neutral-500 dark:text-neutral-400" />
            {sidebarOpen && <span>Employees</span>}
          </Link>

          <Link
            href="/departments"
            className={cn(
              "flex items-center space-x-2.5 rounded-md px-2.5 py-1.5 font-medium transition-colors",
              pathname.startsWith("/departments")
                ? "bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white font-semibold"
                : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-900 hover:text-neutral-900 dark:hover:text-white"
            )}
          >
            <Building2 className="h-4 w-4 shrink-0 text-neutral-500 dark:text-neutral-400" />
            {sidebarOpen && <span>Departments</span>}
          </Link>

          <Link
            href="/reports"
            className={cn(
              "flex items-center space-x-2.5 rounded-md px-2.5 py-1.5 font-medium transition-colors",
              pathname.startsWith("/reports")
                ? "bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white font-semibold"
                : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-900 hover:text-neutral-900 dark:hover:text-white"
            )}
          >
            <FileText className="h-4 w-4 shrink-0 text-neutral-500 dark:text-neutral-400" />
            {sidebarOpen && <span>Analytics Reports</span>}
          </Link>
        </div>

        {/* Section 2: Favorites */}
        {sidebarOpen && (
          <div className="space-y-0.5">
            <div className="flex items-center justify-between px-2.5 py-1 text-[11px] font-medium text-neutral-400 dark:text-neutral-500">
              <span>Favorites</span>
              <ChevronDown className="h-3 w-3" />
            </div>

            <Link
              href="/employees?dept=IT"
              className="flex items-center space-x-2.5 rounded-md px-2.5 py-1.5 font-medium text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-900 hover:text-neutral-900 dark:hover:text-white transition-colors"
            >
              <Layers className="h-4 w-4 shrink-0 text-neutral-500" />
              <span>IT Department</span>
            </Link>

            <Link
              href="/employees?dept=HR"
              className="flex items-center space-x-2.5 rounded-md px-2.5 py-1.5 font-medium text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-900 hover:text-neutral-900 dark:hover:text-white transition-colors"
            >
              <Layers className="h-4 w-4 shrink-0 text-neutral-500" />
              <span>HR & Recruitment</span>
            </Link>
          </div>
        )}

        {/* Section 3: Teams Tree Hierarchy */}
        {sidebarOpen && (
          <div className="space-y-0.5">
            <div className="flex items-center justify-between px-2.5 py-1 text-[11px] font-medium text-neutral-400 dark:text-neutral-500">
              <span>Your teams</span>
              <ChevronDown className="h-3 w-3" />
            </div>

            {/* Parent Team Item */}
            <div className="space-y-0.5">
              <div className="flex items-center space-x-2.5 rounded-md px-2.5 py-1.5 font-medium text-neutral-900 dark:text-neutral-100">
                <span className="flex h-4 w-4 items-center justify-center rounded bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 font-bold text-[10px]">
                  P
                </span>
                <span>Personal</span>
                <ChevronDown className="h-3 w-3 text-neutral-400 ml-auto" />
              </div>

              {/* Nested Hairline Guide Tree */}
              <div className="ml-4 border-l border-neutral-200 dark:border-neutral-800 pl-3 space-y-0.5 my-1">
                <Link
                  href="/employees?status=active"
                  className="flex items-center space-x-2 py-1 text-xs text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
                >
                  <UserCheck className="h-3.5 w-3.5 text-neutral-400" />
                  <span>Active Staff</span>
                </Link>
                <Link
                  href="/employees?status=onboarding"
                  className="flex items-center space-x-2 py-1 text-xs text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
                >
                  <Briefcase className="h-3.5 w-3.5 text-neutral-400" />
                  <span>Onboarding</span>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 3. Linear Footer: Help & Plan Badge */}
      <div className="p-2 border-t border-neutral-100 dark:border-neutral-800/80 flex items-center justify-between">
        <Link
          href="/help"
          className="rounded-full p-1.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 dark:hover:text-neutral-200 transition-colors"
          title="Help & Documentation"
        >
          <HelpCircle className="h-4 w-4" />
        </Link>

        {sidebarOpen && (
          <div className="flex items-center space-x-2">
            <button
              onClick={logout}
              className="rounded p-1.5 text-neutral-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
              title="Logout"
            >
              <LogOut className="h-3.5 w-3.5" />
            </button>
            <span className="rounded-full border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 px-2.5 py-0.5 text-[10px] font-medium text-neutral-600 dark:text-neutral-400">
              Pro plan
            </span>
          </div>
        )}
      </div>
    </aside>
  );
}
