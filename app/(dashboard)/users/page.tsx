"use client";

import { PageContainer } from "@/components/layouts/PageContainer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { ShieldCheck, UserPlus, Mail, ShieldAlert } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export default function UsersPage() {
  const { user } = useAuth();

  const systemUsers = [
    {
      id: user?.id || "USR-001",
      name: user?.name || "Admin User",
      email: user?.email || "admin@aktraders.com",
      role: user?.role || "admin",
      status: "Active",
    },
  ];

  return (
    <PageContainer title="Users" subtitle="System User Accounts & Role Management">
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-[#e6dfd8] dark:border-[#2e2c28] pb-4">
          <div>
            <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">User Access & Control</h2>
            <p className="text-xs text-neutral-500 mt-1">Manage system administrators, HR managers, and staff accounts.</p>
          </div>
          <Button variant="primary" leftIcon={<UserPlus className="h-4 w-4" />}>
            Add New User
          </Button>
        </div>

        <Card className="border-[#e6dfd8] dark:border-[#2e2c28]">
          <CardHeader>
            <CardTitle className="text-base font-bold flex items-center space-x-2">
              <ShieldCheck className="h-5 w-5 text-[#cc785c]" />
              <span>Registered System Users</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#e6dfd8] dark:border-[#2e2c28] text-neutral-500 font-semibold uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-4">User</th>
                    <th className="py-3 px-4">Role</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e6dfd8] dark:divide-[#2e2c28]">
                  {systemUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-900/50">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center space-x-3">
                          <Avatar name={u.name} size="sm" />
                          <div>
                            <p className="font-bold text-neutral-900 dark:text-white">{u.name}</p>
                            <p className="text-[11px] text-neutral-400">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="capitalize font-semibold text-[#cc785c]">{u.role}</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <Badge variant="success">{u.status}</Badge>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <Button variant="ghost" size="sm">
                          Edit Role
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
