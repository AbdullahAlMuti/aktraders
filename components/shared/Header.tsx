"use client";

import { useUIStore } from "@/stores/use-ui-store";
import { useAuth } from "@/hooks/use-auth";
import { ThemeToggle } from "./ThemeToggle";
import { Menu, Search, Bell, ChevronDown } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { useState } from "react";
import Link from "next/link";

export function Header({ title = "Dashboard", subtitle = "Welcome, Admin User" }: { title?: string; subtitle?: string }) {
  const { toggleSidebar } = useUIStore();
  const { user, logout } = useAuth();
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/90 px-4 md:px-6 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/90 transition-colors">
      {/* Left: Sidebar Toggle & Page Title */}
      <div className="flex items-center space-x-4">
        <button
          onClick={toggleSidebar}
          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
          aria-label="Toggle sidebar"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-lg font-bold text-slate-900 dark:text-slate-100">{title}</h1>
          {subtitle && <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">{subtitle}</p>}
        </div>
      </div>

      {/* Center: Global Search Bar */}
      <div className="hidden md:flex items-center max-w-md w-full mx-4">
        <div className="relative w-full">
          <input
            type="text"
            placeholder="Search by name, mobile, email..."
            className="w-full rounded-full border border-slate-200 bg-slate-50 py-1.5 pl-4 pr-10 text-xs text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-100 dark:placeholder-slate-500"
          />
          <button className="absolute right-1 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
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
          <button className="relative rounded-full p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
              5
            </span>
          </button>
        </div>

        {/* User Profile Menu */}
        <div className="relative">
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="flex items-center space-x-2 rounded-lg p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <Avatar name={user?.name || "Admin User"} size="sm" />
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-xs font-bold text-slate-900 dark:text-slate-100">{user?.name || "Admin User"}</span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400">Admin</span>
            </div>
            <ChevronDown className="h-4 w-4 text-slate-400" />
          </button>

          {userMenuOpen && (
            <div className="absolute right-0 mt-2 w-48 rounded-lg border border-slate-200 bg-white py-1 shadow-lg dark:border-slate-800 dark:bg-slate-900 z-50">
              <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800">
                <p className="text-xs font-bold text-slate-900 dark:text-slate-100">{user?.name || "Admin User"}</p>
                <p className="text-[10px] text-slate-500 truncate">{user?.email || "admin@aktraders.com"}</p>
              </div>
              <Link href="/settings" className="block px-4 py-2 text-xs text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800">
                Profile Settings
              </Link>
              <button
                onClick={logout}
                className="w-full text-left px-4 py-2 text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
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
