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
  const { sidebarOpen } = useUIStore();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 transition-colors">
      <Sidebar />
      <div className={cn("flex flex-col transition-all duration-300 min-h-screen", sidebarOpen ? "pl-64" : "pl-20")}>
        <Header title={title} subtitle={subtitle} />
        <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-7xl w-full mx-auto">{children}</main>
      </div>
    </div>
  );
}
