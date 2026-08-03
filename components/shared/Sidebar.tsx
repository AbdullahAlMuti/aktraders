"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/utils/cn";
import { useUIStore } from "@/stores/use-ui-store";
import { useAuth } from "@/hooks/use-auth";
import {
  ChevronDown,
  LayoutDashboard,
  UploadCloud,
  Users,
  UserCheck,
  Building2,
  FileText,
  LogOut,
} from "lucide-react";

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarOpen } = useUIStore();
  const { logout } = useAuth();

  const navItems = [
    {
      name: "Dashboard",
      href: "/",
      icon: LayoutDashboard,
      isActive: pathname === "/" || pathname === "/dashboard",
    },
    {
      name: "CV Upload",
      href: "/cv-upload",
      icon: UploadCloud,
      isActive: pathname.startsWith("/cv-upload"),
    },
    {
      name: "Employee List",
      href: "/employees",
      icon: Users,
      isActive: pathname === "/employees",
    },
    {
      name: "Employee Profile",
      href: "/employee-profile",
      icon: UserCheck,
      isActive: pathname.startsWith("/employee-profile") || pathname.startsWith("/profile"),
    },
    {
      name: "Departments",
      href: "/departments",
      icon: Building2,
      isActive: pathname.startsWith("/departments"),
    },
    {
      name: "Reports",
      href: "/reports",
      icon: FileText,
      isActive: pathname.startsWith("/reports"),
    },
  ];

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-40 flex flex-col bg-[#faf9f5] dark:bg-[#181715] text-[#141413] dark:text-[#faf9f5] transition-all duration-200 border-r border-[#e6dfd8] dark:border-[#2e2c28] select-none",
        sidebarOpen ? "w-60 translate-x-0" : "w-16 -translate-x-full md:translate-x-0"
      )}
    >
      {/* 1. Header: Company Badge */}
      <div className="flex h-12 items-center justify-between px-3 border-b border-[#e6dfd8] dark:border-[#2e2c28]">
        <Link href="/" className="flex items-center space-x-2 overflow-hidden group">
          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-[#cc785c] text-white font-extrabold text-[11px] font-mono">
            AK
          </div>
          {sidebarOpen && (
            <div className="flex items-center space-x-1 text-xs font-semibold text-[#141413] dark:text-[#faf9f5]">
              <span className="truncate">AK Traders</span>
              <ChevronDown className="h-3.5 w-3.5 text-[#8e8b82] group-hover:text-[#cc785c] transition-colors" />
            </div>
          )}
        </Link>
      </div>

      {/* 2. Menu Navigation Items in Exact Order */}
      <div className="flex-1 overflow-y-auto py-3 px-2 space-y-1 text-xs scrollbar-none">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center space-x-2.5 rounded-md px-2.5 py-2 font-medium transition-colors",
                item.isActive
                  ? "bg-[#efe9de] dark:bg-[#252320] text-[#cc785c] dark:text-[#cc785c] font-semibold"
                  : "text-[#6c6a64] dark:text-[#a09d96] hover:bg-[#f5f0e8] dark:hover:bg-[#252320] hover:text-[#141413] dark:hover:text-white"
              )}
            >
              <Icon className={cn("h-4 w-4 shrink-0", item.isActive ? "text-[#cc785c]" : "text-neutral-500 dark:text-neutral-400")} />
              {sidebarOpen && <span>{item.name}</span>}
            </Link>
          );
        })}
      </div>

      {/* 3. Bottom Footer: Logout */}
      <div className="p-2 border-t border-[#e6dfd8] dark:border-[#2e2c28] flex items-center justify-between">
        <button
          onClick={logout}
          className="w-full flex items-center space-x-2.5 rounded-md px-2.5 py-2 text-xs font-medium text-neutral-600 dark:text-neutral-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
          title="Logout"
        >
          <LogOut className="h-4 w-4 shrink-0 text-rose-500" />
          {sidebarOpen && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}
