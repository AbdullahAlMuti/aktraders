"use client";

import { useState } from "react";
import { DataTable, Column } from "@/components/shared/DataTable";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { UserPlus, Shield, Edit, Trash2 } from "lucide-react";

export interface SystemUser {
  id: string;
  name: string;
  email: string;
  role: "superadmin" | "admin" | "hr_manager" | "viewer";
  status: "active" | "inactive";
  lastLogin: string;
}

const MOCK_USERS: SystemUser[] = [
  { id: "USR-01", name: "Admin User", email: "admin@aktraders.com", role: "superadmin", status: "active", lastLogin: "2026-08-03 09:30" },
  { id: "USR-02", name: "Kazi Nazrul", email: "nazrul@aktraders.com", role: "admin", status: "active", lastLogin: "2026-08-02 18:15" },
  { id: "USR-03", name: "Selina Parvin", email: "selina@aktraders.com", role: "hr_manager", status: "active", lastLogin: "2026-08-01 11:45" },
];

export function UserManagement() {
  const [users] = useState<SystemUser[]>(MOCK_USERS);

  const columns: Column<SystemUser>[] = [
    { header: "User ID", accessorKey: "id", cell: (u) => <span className="font-mono text-xs font-bold">{u.id}</span> },
    { header: "Name & Email", cell: (u) => <div><p className="font-bold">{u.name}</p><p className="text-[11px] text-slate-400">{u.email}</p></div> },
    { header: "Role", cell: (u) => <Badge variant="default"><Shield className="h-3 w-3 mr-1" />{u.role}</Badge> },
    { header: "Status", cell: (u) => <Badge variant={u.status === "active" ? "success" : "secondary"}>{u.status}</Badge> },
    { header: "Last Login", accessorKey: "lastLogin" },
    {
      header: "Actions",
      cell: () => (
        <div className="flex justify-end space-x-1">
          <Button variant="ghost" size="icon" className="h-8 w-8"><Edit className="h-4 w-4" /></Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500"><Trash2 className="h-4 w-4" /></Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-base font-bold">System Users</h3>
        <Button leftIcon={<UserPlus className="h-4 w-4" />}>Add User</Button>
      </div>
      <DataTable columns={columns} data={users} />
    </div>
  );
}
