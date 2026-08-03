import { PageContainer } from "@/components/layouts/PageContainer";
import { StatsCards } from "@/features/dashboard/StatsCards";
import { CVProcessingChart } from "@/features/dashboard/CVProcessingChart";
import { DepartmentDistributionChart } from "@/features/dashboard/DepartmentDistributionChart";
import { RecentCVTable } from "@/features/dashboard/RecentCVTable";
import { ActivityFeed } from "@/features/dashboard/ActivityFeed";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { UploadCloud, Users, FileBarChart, Building2 } from "lucide-react";

export const metadata = {
  title: "Dashboard",
  description: "AK Traders Employee Management Overview",
};

export default function DashboardPage() {
  return (
    <PageContainer title="Dashboard" subtitle="Welcome back, Admin User">
      <div className="space-y-6">
        {/* Top Stat Cards */}
        <StatsCards />

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7">
            <CVProcessingChart />
          </div>
          <div className="lg:col-span-5">
            <DepartmentDistributionChart />
          </div>
        </div>

        {/* Table & Activity Feed Row */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7">
            <RecentCVTable />
          </div>
          <div className="lg:col-span-5">
            <ActivityFeed />
          </div>
        </div>

        {/* Quick Action Grid */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 dark:border-slate-800 dark:bg-[#111c38] space-y-4 card-elevation">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Quick Shortcuts</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Link href="/cv-upload">
              <Button variant="outline" className="h-20 w-full flex-col justify-center space-y-2 border-slate-200 dark:border-slate-800 hover:border-[#0066ff] hover:bg-[#e8f1ff]/50 rounded-2xl transition-all">
                <div className="p-2 rounded-xl bg-[#e8f1ff] text-[#0066ff]">
                  <UploadCloud className="h-5 w-5" />
                </div>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Upload CV</span>
              </Button>
            </Link>

            <Link href="/employees">
              <Button variant="outline" className="h-20 w-full flex-col justify-center space-y-2 border-slate-200 dark:border-slate-800 hover:border-emerald-500 hover:bg-emerald-50/50 rounded-2xl transition-all">
                <div className="p-2 rounded-xl bg-[#e6f9f0] text-[#10b981]">
                  <Users className="h-5 w-5" />
                </div>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Employee List</span>
              </Button>
            </Link>

            <Link href="/reports">
              <Button variant="outline" className="h-20 w-full flex-col justify-center space-y-2 border-slate-200 dark:border-slate-800 hover:border-purple-500 hover:bg-purple-50/50 rounded-2xl transition-all">
                <div className="p-2 rounded-xl bg-[#f3e8ff] text-[#9333ea]">
                  <FileBarChart className="h-5 w-5" />
                </div>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Reports</span>
              </Button>
            </Link>

            <Link href="/departments">
              <Button variant="outline" className="h-20 w-full flex-col justify-center space-y-2 border-slate-200 dark:border-slate-800 hover:border-cyan-500 hover:bg-cyan-50/50 rounded-2xl transition-all">
                <div className="p-2 rounded-xl bg-[#e0f7fa] text-[#06b6d4]">
                  <Building2 className="h-5 w-5" />
                </div>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Departments</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
