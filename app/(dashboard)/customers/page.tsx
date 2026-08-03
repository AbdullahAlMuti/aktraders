import { PageContainer } from "@/components/layouts/PageContainer";
import { CustomerList } from "@/features/customers/CustomerList";

export default function CustomersPage() {
  return (
    <PageContainer
      title="গ্রাহক ব্যবস্থাপনা (Customers)"
      subtitle="Customer list and contact details"
      breadcrumbs={[{ label: "Customers" }]}
    >
      <CustomerList />
    </PageContainer>
  );
}
