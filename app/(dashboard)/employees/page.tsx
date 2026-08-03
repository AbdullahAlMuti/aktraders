import { PageContainer } from "@/components/layouts/PageContainer";
import { EmployeeList } from "@/features/employees/EmployeeList";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { UploadCloud } from "lucide-react";

export const metadata = {
  title: "Employee Directory",
  description: "View and manage AK Traders employee directory",
};

export default function EmployeesPage() {
  return (
    <PageContainer
      title="Employee Directory"
      subtitle="Search, filter, and manage all employee records across the organization"
      breadcrumbs={[{ label: "Employee Directory" }]}
      actions={
        <Link href="/cv-upload">
          <Button className="bg-[#1657FF] hover:bg-blue-700" leftIcon={<UploadCloud className="h-4 w-4" />}>
            Upload New CV
          </Button>
        </Link>
      }
    >
      <EmployeeList />
    </PageContainer>
  );
}
