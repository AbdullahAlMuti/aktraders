import * as React from "react";
import { DashboardLayout } from "@/components/layouts/DashboardLayout";

export default function AdminGroupLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardLayout title="Admin Control Panel" subtitle="System Users & Permission Management">
      {children}
    </DashboardLayout>
  );
}
