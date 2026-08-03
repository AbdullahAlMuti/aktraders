"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/utils/cn";
import { MAIN_NAVIGATION } from "@/constants/navigation";
import { useUIStore } from "@/stores/use-ui-store";
import { useAuth } from "@/hooks/use-auth";
import { LogOut } from "lucide-react";

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarOpen } = useUIStore();
  const { logout } = useAuth();

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-40 flex flex-col bg-[#04122E] text-slate-100 transition-all duration-300 border-r border-slate-800",
        sidebarOpen ? "w-64" : "w-20"
      )}
    >
      {/* Brand Header */}
      <div className="flex h-16 items-center px-4 border-b border-slate-800/80">
        <Link href="/" className="flex items-center space-x-3 overflow-hidden">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-500 font-bold text-white shadow-md">
            AK
          </div>
          {sidebarOpen && (
            <div className="flex flex-col">
              <span className="text-sm font-bold tracking-wider text-white uppercase">A K TRADERS</span>
              <span className="text-[10px] text-slate-400 font-medium tracking-widest">LIMITED &gt;</span>
            </div>
          )}
        </Link>
      </div>

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1 scrollbar-thin">
        {MAIN_NAVIGATION.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center space-x-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all group relative",
                isActive
                  ? "bg-[#1657FF] text-white shadow-lg shadow-blue-600/30 font-semibold"
                  : "text-slate-300 hover:bg-slate-800/60 hover:text-white"
              )}
            >
              <Icon className={cn("h-5 w-5 shrink-0 transition-transform group-hover:scale-110", isActive ? "text-white" : "text-slate-400")} />
              {sidebarOpen && <span className="flex-1 truncate">{item.title}</span>}
              {sidebarOpen && item.badge && (
                <span className="rounded-full bg-cyan-500/20 px-2 py-0.5 text-[10px] font-bold text-cyan-300 border border-cyan-400/30">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      {/* Logout Footer */}
      <div className="p-3 border-t border-slate-800/80">
        <button
          onClick={logout}
          className={cn(
            "flex w-full items-center space-x-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-300 transition-colors hover:bg-red-900/30 hover:text-red-300"
          )}
        >
          <LogOut className="h-5 w-5 shrink-0 text-slate-400" />
          {sidebarOpen && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}
