import { PageContainer } from "@/components/layouts/PageContainer";
import { ReportSummaryCards } from "@/features/reports/ReportSummaryCards";
import { ExportActions } from "@/features/reports/ExportActions";
import { ReportTable } from "@/features/reports/ReportTable";
import { ReportCharts } from "@/features/reports/ReportCharts";

export const metadata = {
  title: "Reports & Analytics",
  description: "Enterprise HR analytics and report matrices",
};

export default function ReportsPage() {
  return (
    <PageContainer
      title="Reports & System Analytics"
      subtitle="Overview of organization personnel metrics and CV processing statistics"
      breadcrumbs={[{ label: "Reports" }]}
    >
      <div className="space-y-6">
        <ReportSummaryCards />
        <ExportActions />
        <ReportCharts />
        <ReportTable />
      </div>
    </PageContainer>
  );
}
