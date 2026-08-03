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
        "fixed inset-y-0 left-0 z-40 flex flex-col bg-[#061229] text-[#8f9bba] transition-all duration-200 border-r border-[#102040] select-none sidebar-watermark",
        sidebarOpen ? "w-64 translate-x-0" : "w-16 -translate-x-full md:translate-x-0"
      )}
    >
      {/* 1. Header: Company Brand */}
      <div className="flex h-16 items-center justify-between px-4 border-b border-[#102040]">
        <Link href="/" className="flex items-center space-x-3 overflow-hidden group">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#0066ff] text-white font-extrabold text-xs shadow-md shadow-[#0066ff]/20">
            AK
          </div>
          {sidebarOpen && (
            <div className="flex flex-col text-left">
              <span className="text-xs font-bold text-white tracking-wide truncate">AK TRADERS</span>
              <span className="text-[9px] text-[#8f9bba] uppercase tracking-wider font-semibold">LIMITED</span>
            </div>
          )}
        </Link>
      </div>

      {/* 2. Menu Navigation Items */}
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1.5 text-xs scrollbar-none">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center space-x-3 rounded-xl px-3 py-2.5 font-medium transition-all duration-150",
                item.isActive
                  ? "bg-[#0066ff] text-white shadow-md shadow-[#0066ff]/25 font-semibold"
                  : "text-[#8f9bba] hover:bg-[#122244] hover:text-white"
              )}
            >
              <Icon className={cn("h-4 w-4 shrink-0", item.isActive ? "text-white" : "text-[#8f9bba] group-hover:text-white")} />
              {sidebarOpen && <span>{item.name}</span>}
            </Link>
          );
        })}
      </div>

      {/* 3. Bottom Footer: Logout */}
      <div className="p-3 border-t border-[#102040] flex items-center justify-between">
        <button
          onClick={logout}
          className="w-full flex items-center space-x-3 rounded-xl px-3 py-2.5 text-xs font-medium text-[#8f9bba] hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
          title="Logout"
        >
          <LogOut className="h-4 w-4 shrink-0 text-rose-500" />
          {sidebarOpen && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}
