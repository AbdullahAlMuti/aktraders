import { PageContainer } from "@/components/layouts/PageContainer";
import { UserManagement } from "@/features/users/UserManagement";

export const metadata = {
  title: "ব্যবহারকারী (User Management)",
  description: "Manage system admin and HR users",
};

export default function AdminUsersPage() {
  return (
    <PageContainer
      title="ব্যবহারকারী ব্যবস্থাপনা (User Management)"
      subtitle="সিস্টেম ব্যবহারকারী ও পারমিশন কন্ট্রোল"
      breadcrumbs={[{ label: "Admin" }, { label: "Users" }]}
    >
      <UserManagement />
    </PageContainer>
  );
}
