import { PageContainer } from "@/components/layouts/PageContainer";
import { StatsCards } from "@/features/dashboard/StatsCards";
import { CVProcessingChart } from "@/features/dashboard/CVProcessingChart";
import { DepartmentDistributionChart } from "@/features/dashboard/DepartmentDistributionChart";
import { RecentCVTable } from "@/features/dashboard/RecentCVTable";
import { ActivityFeed } from "@/features/dashboard/ActivityFeed";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { UploadCloud, Users, FileBarChart, Building2, Settings, HelpCircle, Sparkles } from "lucide-react";

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
        <div className="rounded-2xl border border-[#e3e8ee] bg-white p-6 dark:border-slate-800 dark:bg-[#0d253d] space-y-4 stripe-card-shadow">
          <h3 className="text-sm font-semibold text-[#0d253d] dark:text-slate-100 stripe-display-heading">Quick Shortcuts</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <Link href="/cv-upload">
              <Button variant="outline" className="h-20 w-full flex-col justify-center space-y-1.5 border-[#e3e8ee] dark:border-slate-800 hover:border-[#533afd] hover:bg-[#533afd]/5 rounded-2xl">
                <UploadCloud className="h-5 w-5 text-[#533afd]" />
                <span className="text-xs font-medium">Upload CV</span>
              </Button>
            </Link>

            <Link href="/employees">
              <Button variant="outline" className="h-20 w-full flex-col justify-center space-y-1.5 border-[#e3e8ee] dark:border-slate-800 hover:border-emerald-500 hover:bg-emerald-500/5 rounded-2xl">
                <Users className="h-5 w-5 text-emerald-600" />
                <span className="text-xs font-medium">Employees</span>
              </Button>
            </Link>

            <Link href="/reports">
              <Button variant="outline" className="h-20 w-full flex-col justify-center space-y-1.5 border-[#e3e8ee] dark:border-slate-800 hover:border-[#f96bee] hover:bg-[#f96bee]/5 rounded-2xl">
                <FileBarChart className="h-5 w-5 text-[#f96bee]" />
                <span className="text-xs font-medium">Reports</span>
              </Button>
            </Link>

            <Link href="/departments">
              <Button variant="outline" className="h-20 w-full flex-col justify-center space-y-1.5 border-[#e3e8ee] dark:border-slate-800 hover:border-cyan-500 hover:bg-cyan-500/5 rounded-2xl">
                <Building2 className="h-5 w-5 text-cyan-600" />
                <span className="text-xs font-medium">Departments</span>
              </Button>
            </Link>

            <Link href="/settings">
              <Button variant="outline" className="h-20 w-full flex-col justify-center space-y-1.5 border-[#e3e8ee] dark:border-slate-800 hover:border-amber-500 hover:bg-amber-500/5 rounded-2xl">
                <Settings className="h-5 w-5 text-amber-600" />
                <span className="text-xs font-medium">Settings</span>
              </Button>
            </Link>

            <Link href="/help">
              <Button variant="outline" className="h-20 w-full flex-col justify-center space-y-1.5 border-[#e3e8ee] dark:border-slate-800 hover:border-rose-500 hover:bg-rose-500/5 rounded-2xl">
                <HelpCircle className="h-5 w-5 text-[#ea2261]" />
                <span className="text-xs font-medium">Help Center</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
