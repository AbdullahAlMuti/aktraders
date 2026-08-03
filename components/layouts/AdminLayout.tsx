import * as React from "react";
import { DashboardLayout } from "./DashboardLayout";

export function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardLayout title="Admin Control Panel" subtitle="System user access and permission control">
      {children}
    </DashboardLayout>
  );
}
