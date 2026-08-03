import { PageContainer } from "@/components/layouts/PageContainer";
import { EmployeeList } from "@/features/employees/EmployeeList";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { UploadCloud } from "lucide-react";

export const metadata = {
  title: "এমপ্লয়ী তালিকা (Employee Directory)",
  description: "View and manage AK Traders employee directory",
};

export default function EmployeesPage() {
  return (
    <PageContainer
      title="এমপ্লয়ী তালিকা (Employee Directory)"
      subtitle="সিস্টেমে সংরক্ষিত সকল এমপ্লয়ী প্রোফাইল ফিল্টার ও সার্চ করুন"
      breadcrumbs={[{ label: "এমপ্লয়ী তালিকা" }]}
      actions={
        <Link href="/cv-upload">
          <Button className="bg-[#1657FF] hover:bg-blue-700" leftIcon={<UploadCloud className="h-4 w-4" />}>
            নতুন CV আপলোড
          </Button>
        </Link>
      }
    >
      <EmployeeList />
    </PageContainer>
  );
}
