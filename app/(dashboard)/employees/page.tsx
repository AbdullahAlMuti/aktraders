import { PageContainer } from "@/components/layouts/PageContainer";
import { CandidateSearchView } from "@/features/candidates/CandidateSearchView";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { UploadCloud } from "lucide-react";

export const metadata = {
  title: "Candidate Directory",
  description: "Search and filter the AK Traders manpower database",
};

export default function EmployeesPage() {
  return (
    <PageContainer
      title="Candidate Directory"
      subtitle="Search, filter, and assign candidates across the manpower database"
      breadcrumbs={[{ label: "Candidate Directory" }]}
      actions={
        <Link href="/cv-upload">
          <Button className="bg-[#1657FF] hover:bg-blue-700" leftIcon={<UploadCloud className="h-4 w-4" />}>
            Upload New CV
          </Button>
        </Link>
      }
    >
      <CandidateSearchView />
    </PageContainer>
  );
}
