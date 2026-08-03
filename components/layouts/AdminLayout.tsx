import * as React from "react";
import { DashboardLayout } from "./DashboardLayout";

export function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardLayout title="এডমিন ড্যাশবোর্ড (Admin Control Panel)" subtitle="সিস্টেম ব্যবহারকারী ও পারমিশন কন্ট্রোল">
      {children}
    </DashboardLayout>
  );
}
