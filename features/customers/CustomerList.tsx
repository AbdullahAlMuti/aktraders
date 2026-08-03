"use client";

import { DataTable, Column } from "@/components/shared/DataTable";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { UserCheck, Plus } from "lucide-react";

export interface Customer {
  id: string;
  companyName: string;
  contactPerson: string;
  phone: string;
  city: string;
  status: "active" | "lead";
}

const MOCK_CUSTOMERS: Customer[] = [
  { id: "CUST-001", companyName: "Dhaka Textile Mills", contactPerson: "Tariqul Islam", phone: "01700000001", city: "Dhaka", status: "active" },
  { id: "CUST-002", companyName: "Chittagong Trading Corp", contactPerson: "Mizanur Rahman", phone: "01800000002", city: "Chittagong", status: "active" },
];

export function CustomerList() {
  const columns: Column<Customer>[] = [
    { header: "Customer ID", accessorKey: "id", cell: (c) => <span className="font-mono text-xs font-bold">{c.id}</span> },
    { header: "Company Name", accessorKey: "companyName", cell: (c) => <span className="font-bold">{c.companyName}</span> },
    { header: "Contact Person", accessorKey: "contactPerson" },
    { header: "Phone", accessorKey: "phone" },
    { header: "City", accessorKey: "city" },
    { header: "Status", cell: (c) => <Badge variant="success">{c.status}</Badge> },
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-base font-bold">Customer Registry</h3>
        <Button leftIcon={<Plus className="h-4 w-4" />}>Add Customer</Button>
      </div>
      <DataTable columns={columns} data={MOCK_CUSTOMERS} />
    </div>
  );
}
