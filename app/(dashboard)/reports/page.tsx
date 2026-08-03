import { PageContainer } from "@/components/layouts/PageContainer";
import { ReportSummaryCards } from "@/features/reports/ReportSummaryCards";
import { ExportActions } from "@/features/reports/ExportActions";
import { ReportTable } from "@/features/reports/ReportTable";
import { DepartmentDistributionChart } from "@/features/dashboard/DepartmentDistributionChart";
import { CVProcessingChart } from "@/features/dashboard/CVProcessingChart";

export const metadata = {
  title: "রিপোর্ট (System Reports & Analytics)",
  description: "Enterprise HR analytics and report matrices",
};

export default function ReportsPage() {
  return (
    <PageContainer
      title="রিপোর্ট ও অ্যানালিটিক্স (System Reports)"
      subtitle="সামগ্রিক এমপ্লয়ী ও CV প্রসেসিং পরিসংখ্যান পর্যবেক্ষণ করুন"
      breadcrumbs={[{ label: "রিপোর্ট" }]}
    >
      <div className="space-y-6">
        <ReportSummaryCards />
        <ExportActions />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-6">
            <DepartmentDistributionChart />
          </div>
          <div className="lg:col-span-6">
            <CVProcessingChart />
          </div>
        </div>

        <ReportTable />
      </div>
    </PageContainer>
  );
}
