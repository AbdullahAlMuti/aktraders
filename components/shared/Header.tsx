"use client";

import { useUIStore } from "@/stores/use-ui-store";
import { useAuth } from "@/hooks/use-auth";
import { ThemeToggle } from "./ThemeToggle";
import { Menu, Search, Bell, ChevronDown, FileText, Calendar, ExternalLink, Loader2, X } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { cvService } from "@/services/cv.service";

export function Header({ title = "Dashboard", subtitle = "Welcome, Admin User" }: { title?: string; subtitle?: string }) {
  const { toggleSidebar } = useUIStore();
  const { user, logout } = useAuth();
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  // Search State
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Array<{ id: string; candidateName: string; originalFileName: string; originalPdfUrl: string; uploadedAt: string }>>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchQuery.trim().length > 0) {
        setIsSearching(true);
        const results = await cvService.searchCandidates(searchQuery.trim());
        setSearchResults(results);
        setIsSearching(false);
        setShowSearchResults(true);
      } else {
        setSearchResults([]);
        setShowSearchResults(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowSearchResults(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-[#e6dfd8] bg-[#faf9f5]/90 px-4 md:px-6 backdrop-blur-md dark:border-[#22262b] dark:bg-[#0c0d0e]/90 transition-colors">
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

      {/* Center: Live Candidate Search Bar */}
      <div ref={searchContainerRef} className="hidden md:block relative max-w-md w-full mx-4">
        <div className="relative w-full">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => searchQuery.trim().length > 0 && setShowSearchResults(true)}
            placeholder="Search candidate by name..."
            className="w-full rounded-full border border-[#a8c3de]/60 bg-[#f6f9fc] py-1.5 pl-4 pr-10 text-xs text-[#0d253d] placeholder-[#64748d] focus:border-[#533afd] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#533afd]/20 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:placeholder-slate-500 transition-all"
          />
          {searchQuery ? (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          ) : (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
              <Search className="h-4 w-4" />
            </div>
          )}
        </div>

        {/* Live Search Results Dropdown */}
        {showSearchResults && (
          <div className="absolute left-0 right-0 mt-2 rounded-xl border border-slate-200 bg-white py-2 shadow-2xl dark:border-slate-800 dark:bg-slate-900 z-50 max-h-96 overflow-y-auto">
            {isSearching ? (
              <div className="flex items-center justify-center py-6 text-xs text-slate-400">
                <Loader2 className="h-4 w-4 animate-spin mr-2 text-blue-600" />
                <span>Searching database...</span>
              </div>
            ) : searchResults.length > 0 ? (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                <div className="px-4 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Matching Candidates ({searchResults.length})
                </div>
                {searchResults.map((item) => (
                  <Link
                    key={item.id}
                    href={`/cv-upload/${item.id}`}
                    onClick={() => setShowSearchResults(false)}
                    className="flex items-center justify-between px-4 py-3 hover:bg-blue-50/50 dark:hover:bg-slate-800/60 transition-colors group"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 transition-colors truncate">
                        {item.candidateName}
                      </p>
                      <div className="flex items-center space-x-3 text-[11px] text-slate-500 mt-0.5 font-mono">
                        <span className="flex items-center gap-1">
                          <FileText className="h-3 w-3 text-blue-500" />
                          {item.originalFileName}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(item.uploadedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </span>
                      </div>
                    </div>
                    <ExternalLink className="h-4 w-4 text-slate-400 group-hover:text-blue-600 shrink-0 ml-2" />
                  </Link>
                ))}
              </div>
            ) : (
              <div className="px-4 py-6 text-center text-xs text-slate-500">
                No candidate found matching &quot;<span className="font-semibold text-slate-700 dark:text-slate-300">{searchQuery}</span>&quot;
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right Actions: Theme, Notifications, Profile */}
      <div className="flex items-center space-x-3">
        <ThemeToggle />

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
            <div className="absolute right-0 mt-2 w-48 rounded-xl border border-[#e3e8ee] bg-white py-1.5 shadow-xl dark:border-slate-800 dark:bg-[#0d253d] z-50">
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
