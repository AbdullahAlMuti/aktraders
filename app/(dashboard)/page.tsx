import { PageContainer } from "@/components/layouts/PageContainer";
import { StatsCards } from "@/features/dashboard/StatsCards";
import { CVProcessingChart } from "@/features/dashboard/CVProcessingChart";
import { DepartmentDistributionChart } from "@/features/dashboard/DepartmentDistributionChart";
import { RecentCVTable } from "@/features/dashboard/RecentCVTable";
import { ActivityFeed } from "@/features/dashboard/ActivityFeed";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { UploadCloud, Users, FileBarChart, Building2, Settings, HelpCircle } from "lucide-react";

export const metadata = {
  title: "Dashboard",
  description: "AK Traders Employee Management Overview",
};

export default function DashboardPage() {
  return (
    <PageContainer title="Dashboard" subtitle="Welcome back, Admin User">
      <div className="space-y-6">
        {/* Top 5 Stat Cards */}
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
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Quick Actions</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            <Link href="/cv-upload">
              <Button variant="outline" className="h-20 w-full flex-col justify-center space-y-2 border-slate-200 dark:border-slate-800">
                <UploadCloud className="h-5 w-5 text-blue-600" />
                <span className="text-xs font-semibold">Upload New CV</span>
              </Button>
            </Link>

            <Link href="/employees">
              <Button variant="outline" className="h-20 w-full flex-col justify-center space-y-2 border-slate-200 dark:border-slate-800">
                <Users className="h-5 w-5 text-emerald-600" />
                <span className="text-xs font-semibold">Employee Directory</span>
              </Button>
            </Link>

            <Link href="/reports">
              <Button variant="outline" className="h-20 w-full flex-col justify-center space-y-2 border-slate-200 dark:border-slate-800">
                <FileBarChart className="h-5 w-5 text-purple-600" />
                <span className="text-xs font-semibold">View Reports</span>
              </Button>
            </Link>

            <Link href="/departments">
              <Button variant="outline" className="h-20 w-full flex-col justify-center space-y-2 border-slate-200 dark:border-slate-800">
                <Building2 className="h-5 w-5 text-cyan-600" />
                <span className="text-xs font-semibold">Departments</span>
              </Button>
            </Link>

            <Link href="/settings">
              <Button variant="outline" className="h-20 w-full flex-col justify-center space-y-2 border-slate-200 dark:border-slate-800">
                <Settings className="h-5 w-5 text-amber-600" />
                <span className="text-xs font-semibold">Settings</span>
              </Button>
            </Link>

            <Link href="/help">
              <Button variant="outline" className="h-20 w-full flex-col justify-center space-y-2 border-slate-200 dark:border-slate-800">
                <HelpCircle className="h-5 w-5 text-rose-600" />
                <span className="text-xs font-semibold">Help Center</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
