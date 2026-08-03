import { PageContainer } from "@/components/layouts/PageContainer";
import { UserManagement } from "@/features/users/UserManagement";

export const metadata = {
  title: "User Management",
  description: "Manage system admin and HR users",
};

export default function AdminUsersPage() {
  return (
    <PageContainer
      title="User Management"
      subtitle="System Administrator & Staff Access Controls"
      breadcrumbs={[{ label: "Admin" }, { label: "Users" }]}
    >
      <UserManagement />
    </PageContainer>
  );
}
