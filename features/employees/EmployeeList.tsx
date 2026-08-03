"use client";

import { useState, useEffect } from "react";
import { DataTable, Column } from "@/components/shared/DataTable";
import { EmployeeFilterBar } from "./EmployeeFilterBar";
import { employeeService } from "@/services/employee.service";
import { Employee } from "@/types/employee.types";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { useFilterStore } from "@/stores/use-filter-store";
import { Eye, Download, Edit2 } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function EmployeeList() {
  const { searchQuery, departmentFilter, statusFilter, page, setPage } = useFilterStore();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const res = await employeeService.getEmployees({
          search: searchQuery,
          department: departmentFilter,
          status: statusFilter as any,
          page,
          limit: 10,
        });
        setEmployees(res.data);
        setTotalPages(res.meta.totalPages);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [searchQuery, departmentFilter, statusFilter, page]);

  const columns: Column<Employee>[] = [
    {
      header: "আইডি (ID)",
      accessorKey: "id",
      cell: (item) => <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400">{item.id}</span>,
    },
    {
      header: "এমপ্লয়ী (Employee)",
      cell: (item) => (
        <div className="flex items-center space-x-3">
          <Avatar name={item.name} size="sm" />
          <div>
            <p className="font-bold text-slate-900 dark:text-slate-100">{item.name}</p>
            <p className="text-[11px] text-slate-400">{item.email}</p>
          </div>
        </div>
      ),
    },
    {
      header: "বিভাগ (Department)",
      accessorKey: "department",
      cell: (item) => <span className="font-semibold text-slate-700 dark:text-slate-300">{item.department}</span>,
    },
    {
      header: "পদবী (Designation)",
      accessorKey: "designation",
      cell: (item) => <span className="text-slate-600 dark:text-slate-400">{item.designation}</span>,
    },
    {
      header: "অবস্থা (Status)",
      accessorKey: "status",
      cell: (item) => (
        <Badge
          variant={
            item.status === "active"
              ? "success"
              : item.status === "processing"
              ? "warning"
              : "secondary"
          }
        >
          {item.status === "active" ? "সক্রিয় (Active)" : item.status === "processing" ? "প্রক্রিয়াধীন" : "অপেক্ষমাণ"}
        </Badge>
      ),
    },
    {
      header: "যোগদানের তারিখ",
      accessorKey: "joiningDate",
      cell: (item) => <span className="text-slate-500 font-mono text-xs">{item.joiningDate}</span>,
    },
    {
      header: "অ্যাকশন",
      cell: (item) => (
        <div className="flex items-center space-x-1 justify-end">
          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-blue-600">
            <Eye className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-emerald-600">
            <Download className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-amber-600">
            <Edit2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <EmployeeFilterBar />
      <DataTable
        columns={columns}
        data={employees}
        isLoading={loading}
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
      />
    </div>
  );
}
