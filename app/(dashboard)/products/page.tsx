import { PageContainer } from "@/components/layouts/PageContainer";
import { ProductList } from "@/features/products/ProductList";

export default function ProductsPage() {
  return (
    <PageContainer
      title="পণ্য ক্যাটালগ (Products)"
      subtitle="Manage company products and inventory"
      breadcrumbs={[{ label: "Products" }]}
    >
      <ProductList />
    </PageContainer>
  );
}
