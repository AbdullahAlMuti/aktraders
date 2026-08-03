import { PageContainer } from "@/components/layouts/PageContainer";
import { CVUploadWizard } from "@/features/cv-upload/CVUploadWizard";

export const metadata = {
  title: "সিডি আপলোড (CV Upload)",
  description: "Upload and extract employee CV data using AI parser",
};

export default function CVUploadPage() {
  return (
    <PageContainer
      title="সিডি আপলোড করুন (CV Upload & Processing)"
      subtitle="স্বয়ংক্রিয় AI এক্সট্রাকশনের মাধ্যমে সহজে সিডি আপলোড ও প্রোফাইল তৈরি করুন"
      breadcrumbs={[{ label: "সিডি আপলোড" }]}
    >
      <CVUploadWizard />
    </PageContainer>
  );
}
