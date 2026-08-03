import { PageContainer } from "@/components/layouts/PageContainer";
import { CVUploadWizard } from "@/features/cv-upload/CVUploadWizard";

export const metadata = {
  title: "CV Upload",
  description: "Upload and extract employee CV data using AI parser",
};

export default function CVUploadPage() {
  return (
    <PageContainer
      title="Upload & Parse CV"
      subtitle="Upload CVs and automatically extract employee profiles using AI parsing"
      breadcrumbs={[{ label: "CV Upload" }]}
    >
      <CVUploadWizard />
    </PageContainer>
  );
}
