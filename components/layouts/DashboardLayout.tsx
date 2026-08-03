"use client";

import { Sidebar } from "@/components/shared/Sidebar";
import { Header } from "@/components/shared/Header";
import { useUIStore } from "@/stores/use-ui-store";
import { cn } from "@/utils/cn";

export interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}

export function DashboardLayout({ children, title, subtitle }: DashboardLayoutProps) {
  const { sidebarOpen, setSidebarOpen } = useUIStore();

  return (
    <div className="min-h-screen bg-[#faf9f5] text-neutral-900 dark:bg-[#0c0d0e] dark:text-neutral-100 transition-colors overflow-x-hidden">
      <Sidebar />

      {/* Mobile Backdrop Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 backdrop-blur-xs md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div
        className={cn(
          "flex flex-col transition-all duration-300 min-h-screen w-full",
          sidebarOpen ? "md:pl-60 pl-0" : "md:pl-16 pl-0"
        )}
      >
        <Header title={title} subtitle={subtitle} />
        <main className="flex-1 p-4 sm:p-6 md:p-8 w-full max-w-full">{children}</main>
      </div>
    </div>
  );
}
