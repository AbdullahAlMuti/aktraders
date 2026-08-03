"use client";

import { useUIStore } from "@/stores/use-ui-store";
import { useAuth } from "@/hooks/use-auth";
import { ThemeToggle } from "./ThemeToggle";
import { Menu, Search, Bell, ChevronDown, Sparkles } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { useState } from "react";
import Link from "next/link";

export function Header({ title = "Dashboard", subtitle = "Welcome, Admin User" }: { title?: string; subtitle?: string }) {
  const { toggleSidebar } = useUIStore();
  const { user, logout } = useAuth();
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-[#e3e8ee] bg-white/90 px-4 md:px-6 backdrop-blur-md dark:border-slate-800 dark:bg-[#0d253d]/90 transition-colors">
      {/* Left: Sidebar Toggle & Page Title */}
      <div className="flex items-center space-x-4">
        <button
          onClick={toggleSidebar}
          className="rounded-full p-2 text-slate-600 hover:bg-[#f6f9fc] dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
          aria-label="Toggle sidebar"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="flex items-center space-x-2 text-xs font-medium">
          <span className="text-neutral-400 dark:text-neutral-500">AK Traders</span>
          <span className="text-neutral-300 dark:text-neutral-700">/</span>
          <span className="font-semibold text-neutral-900 dark:text-white">{title}</span>
        </div>
      </div>

      {/* Center: Stripe Style Search Bar */}
      <div className="hidden md:flex items-center max-w-md w-full mx-4">
        <div className="relative w-full">
          <input
            type="text"
            placeholder="Search by candidate name, mobile, email..."
            className="w-full rounded-full border border-[#a8c3de]/60 bg-[#f6f9fc] py-1.5 pl-4 pr-10 text-xs text-[#0d253d] placeholder-[#64748d] focus:border-[#533afd] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#533afd]/20 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:placeholder-slate-500 transition-all"
          />
          <button className="absolute right-1 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-slate-400 hover:text-[#533afd] dark:hover:text-blue-400">
            <Search className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Right Actions: Theme, Notifications, Profile */}
      <div className="flex items-center space-x-3">
        {/* Theme Toggle */}
        <ThemeToggle />

        {/* Notifications */}
        <div className="relative">
          <button className="relative rounded-full p-2 text-slate-600 hover:bg-[#f6f9fc] dark:text-slate-300 dark:hover:bg-slate-800">
            <Bell className="h-4 w-4" />
            <span className="absolute top-1.5 right-1.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[#ea2261] text-[9px] font-bold text-white font-tabular">
              3
            </span>
          </button>
        </div>

        {/* User Profile Menu */}
        <div className="relative">
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="flex items-center space-x-2 rounded-full px-2.5 py-1 hover:bg-[#f6f9fc] dark:hover:bg-slate-800 border border-transparent hover:border-[#e3e8ee] transition-all"
          >
            <Avatar name={user?.name || "Admin User"} size="sm" />
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-xs font-semibold text-[#0d253d] dark:text-slate-100">{user?.name || "Admin User"}</span>
              <span className="text-[10px] text-[#533afd] dark:text-blue-400 font-medium">Administrator</span>
            </div>
            <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
          </button>

          {userMenuOpen && (
            <div className="absolute right-0 mt-2 w-48 rounded-xl border border-[#e3e8ee] bg-white py-1.5 shadow-xl dark:border-slate-800 dark:bg-[#0d253d] z-50 stripe-card-shadow">
              <div className="px-4 py-2 border-b border-[#e3e8ee] dark:border-slate-800">
                <p className="text-xs font-bold text-[#0d253d] dark:text-slate-100">{user?.name || "Admin User"}</p>
                <p className="text-[10px] text-[#64748d] truncate">{user?.email || "admin@aktraders.com"}</p>
              </div>
              <Link href="/settings" className="block px-4 py-2 text-xs text-slate-700 hover:bg-[#f6f9fc] dark:text-slate-300 dark:hover:bg-slate-800/60">
                Profile Settings
              </Link>
              <button
                onClick={logout}
                className="w-full text-left px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
